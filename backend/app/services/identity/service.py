"""Identity & Access Analysis Engine service (Module 3.5)."""

from typing import Optional
from uuid import UUID

from sqlalchemy import select, func
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.identity import (
    IdentityRecord, AccessPermission, AccessFinding,
    IdentityType, FindingType, PermissionLevel,
)


class IdentityAccessService:
    def __init__(self, db: AsyncSession):
        self.db = db

    async def ingest_identity(self, org_id: UUID, identity_data: dict) -> IdentityRecord:
        existing = await self.db.execute(
            select(IdentityRecord).where(
                IdentityRecord.org_id == org_id,
                IdentityRecord.external_id == identity_data.get("external_id"),
            )
        )
        record = existing.scalar_one_or_none()
        if record:
            for k, v in identity_data.items():
                if v is not None:
                    setattr(record, k, v)
        else:
            record = IdentityRecord(org_id=org_id, **identity_data)
            self.db.add(record)
        await self.db.flush()
        return record

    async def add_permission(self, permission_data: dict) -> AccessPermission:
        perm = AccessPermission(**permission_data)
        self.db.add(perm)
        await self.db.flush()
        return perm

    async def get_identity(self, identity_id: UUID, org_id: UUID = None) -> Optional[IdentityRecord]:
        """Get an identity record with optional tenant isolation."""
        query = select(IdentityRecord).where(IdentityRecord.id == identity_id)
        if org_id:
            query = query.where(IdentityRecord.org_id == org_id)
        result = await self.db.execute(query)
        return result.scalar_one_or_none()

    async def get_asset_access_summary(self, asset_id: UUID) -> dict:
        """Who can access this asset?"""
        perms = await self.db.execute(
            select(AccessPermission, IdentityRecord)
            .join(IdentityRecord, AccessPermission.identity_id == IdentityRecord.id)
            .where(AccessPermission.asset_id == asset_id, AccessPermission.is_effective == True)
        )
        rows = perms.all()

        total_users = len(rows)
        privileged = sum(1 for _, identity in rows if identity.is_privileged)
        external = sum(1 for _, identity in rows if identity.is_external)
        service_accounts = sum(
            1 for _, identity in rows if identity.identity_type == IdentityType.SERVICE_ACCOUNT
        )
        public = any(
            identity.identity_type == IdentityType.ANONYMOUS for _, identity in rows
        )

        return {
            "asset_id": asset_id,
            "total_users": total_users,
            "privileged_users": privileged,
            "external_users": external,
            "service_accounts": service_accounts,
            "public_exposure": public,
        }

    async def get_identity_sensitive_assets(self, identity_id: UUID) -> list:
        """Which sensitive assets can this identity access?"""
        from app.models.inventory import Asset
        result = await self.db.execute(
            select(Asset)
            .join(AccessPermission, AccessPermission.asset_id == Asset.id)
            .where(
                AccessPermission.identity_id == identity_id,
                AccessPermission.is_effective == True,
                Asset.sensitive_data_count > 0,
            )
        )
        return list(result.scalars().all())

    async def detect_access_findings(self, org_id: UUID) -> list[AccessFinding]:
        """Run access analysis to detect risky patterns."""
        findings = []

        # Detect stale access (no activity in 90 days)
        from datetime import datetime, timedelta, timezone
        stale_threshold = datetime.now(timezone.utc) - timedelta(days=90)
        stale_identities = await self.db.execute(
            select(IdentityRecord).where(
                IdentityRecord.org_id == org_id,
                IdentityRecord.is_privileged == True,
                IdentityRecord.last_activity_at < stale_threshold,
            )
        )
        for identity in stale_identities.scalars():
            finding = AccessFinding(
                org_id=org_id,
                identity_id=identity.id,
                finding_type=FindingType.INACTIVE_PRIVILEGED,
                severity="high",
                description=f"Privileged identity '{identity.display_name}' has been inactive for >90 days",
                recommendation="Review and revoke unnecessary privileged access",
            )
            self.db.add(finding)
            findings.append(finding)

        # Detect external collaborators with sensitive data access
        external_with_access = await self.db.execute(
            select(IdentityRecord).where(
                IdentityRecord.org_id == org_id,
                IdentityRecord.is_external == True,
                IdentityRecord.is_active == True,
            )
        )
        for identity in external_with_access.scalars():
            sensitive = await self.get_identity_sensitive_assets(identity.id)
            if sensitive:
                finding = AccessFinding(
                    org_id=org_id,
                    identity_id=identity.id,
                    finding_type=FindingType.EXTERNAL_COLLABORATOR,
                    severity="medium",
                    description=f"External user '{identity.display_name}' has access to {len(sensitive)} sensitive assets",
                    recommendation="Review external access and apply least-privilege",
                )
                self.db.add(finding)
                findings.append(finding)

        await self.db.flush()
        return findings

    async def get_findings(self, org_id: UUID, resolved: bool = False) -> list[AccessFinding]:
        result = await self.db.execute(
            select(AccessFinding).where(
                AccessFinding.org_id == org_id,
                AccessFinding.is_resolved == resolved,
            ).order_by(AccessFinding.detected_at.desc())
        )
        return list(result.scalars().all())
