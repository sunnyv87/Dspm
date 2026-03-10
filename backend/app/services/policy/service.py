"""Policy & Compliance Engine service (Module 3.7)."""

from datetime import datetime, timezone
from typing import Optional
from uuid import UUID

from sqlalchemy import select, update
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.policy import (
    ComplianceFramework, PolicyRule, PolicyViolation,
    FrameworkType, PolicySeverity, ViolationStatus,
)
from app.models.inventory import Asset, ExposureStatus, EncryptionStatus
from app.models.classification import ClassificationLevel


class PolicyComplianceService:
    def __init__(self, db: AsyncSession):
        self.db = db

    async def evaluate_policies(self, org_id: UUID, asset: Asset, classification_results: list) -> list[PolicyViolation]:
        """Evaluate all active policies against an asset and its classification results."""
        rules = await self.get_active_rules(org_id)
        violations = []

        for rule in rules:
            violation = await self._evaluate_rule(rule, asset, classification_results)
            if violation:
                violation.org_id = org_id
                self.db.add(violation)
                violations.append(violation)

        await self.db.flush()
        return violations

    async def _evaluate_rule(self, rule: PolicyRule, asset: Asset, classifications: list) -> Optional[PolicyViolation]:
        condition = rule.condition
        rule_type = condition.get("type")

        if rule_type == "no_public_sensitive":
            if asset.exposure_status == ExposureStatus.PUBLIC and asset.sensitive_data_count > 0:
                return PolicyViolation(
                    policy_rule_id=rule.id,
                    asset_id=asset.id,
                    severity=rule.severity,
                    description=f"Sensitive data is publicly accessible: {asset.name}",
                    evidence={"exposure": "public", "sensitive_count": asset.sensitive_data_count},
                    remediation_suggestion=rule.remediation_suggestion or "Revoke public access",
                )

        elif rule_type == "sensitive_must_encrypt":
            if asset.encryption_status == EncryptionStatus.NOT_ENCRYPTED and asset.sensitive_data_count > 0:
                return PolicyViolation(
                    policy_rule_id=rule.id,
                    asset_id=asset.id,
                    severity=rule.severity,
                    description=f"Sensitive data is stored without encryption: {asset.name}",
                    evidence={"encryption": "disabled", "sensitive_count": asset.sensitive_data_count},
                    remediation_suggestion=rule.remediation_suggestion or "Enable encryption",
                )

        elif rule_type == "no_sensitive_in_nonprod":
            if asset.environment in ("dev", "test", "staging") and asset.sensitive_data_count > 0:
                return PolicyViolation(
                    policy_rule_id=rule.id,
                    asset_id=asset.id,
                    severity=rule.severity,
                    description=f"Production sensitive data found in {asset.environment}: {asset.name}",
                    evidence={"environment": asset.environment},
                    remediation_suggestion=rule.remediation_suggestion or "Remove sensitive data from non-prod",
                )

        elif rule_type == "no_external_restricted":
            if asset.exposure_status == ExposureStatus.EXTERNAL_SHARED:
                has_restricted = any(
                    c.classification_level == ClassificationLevel.RESTRICTED
                    for c in classifications
                )
                if has_restricted:
                    return PolicyViolation(
                        policy_rule_id=rule.id,
                        asset_id=asset.id,
                        severity=rule.severity,
                        description=f"Restricted data has external sharing enabled: {asset.name}",
                        evidence={"exposure": "external_shared", "classification": "restricted"},
                        remediation_suggestion=rule.remediation_suggestion or "Remove external sharing",
                    )

        elif rule_type == "region_restriction":
            allowed_regions = condition.get("allowed_regions", [])
            categories = condition.get("categories", [])
            if allowed_regions and asset.geo_region not in allowed_regions:
                has_matching = any(c.category.value in categories for c in classifications) if categories else True
                if has_matching and asset.sensitive_data_count > 0:
                    return PolicyViolation(
                        policy_rule_id=rule.id,
                        asset_id=asset.id,
                        severity=rule.severity,
                        description=f"Sensitive data in non-allowed region {asset.geo_region}: {asset.name}",
                        evidence={"region": asset.geo_region, "allowed": allowed_regions},
                        remediation_suggestion=rule.remediation_suggestion or "Move data to allowed region",
                    )

        return None

    async def get_active_rules(self, org_id: UUID) -> list[PolicyRule]:
        result = await self.db.execute(
            select(PolicyRule).where(
                PolicyRule.enabled == True,
                (PolicyRule.org_id == org_id) | (PolicyRule.org_id.is_(None)),
            )
        )
        return list(result.scalars().all())

    async def create_policy_rule(self, org_id: UUID, data: dict) -> PolicyRule:
        rule = PolicyRule(org_id=org_id, **data)
        self.db.add(rule)
        await self.db.flush()
        return rule

    async def get_violations(self, org_id: UUID, status: ViolationStatus = None) -> list[PolicyViolation]:
        query = select(PolicyViolation).where(PolicyViolation.org_id == org_id)
        if status:
            query = query.where(PolicyViolation.status == status)
        query = query.order_by(PolicyViolation.detected_at.desc())
        result = await self.db.execute(query)
        return list(result.scalars().all())

    async def get_violation(self, violation_id: UUID, org_id: UUID = None) -> Optional[PolicyViolation]:
        """Get a violation with optional tenant isolation."""
        query = select(PolicyViolation).where(PolicyViolation.id == violation_id)
        if org_id:
            query = query.where(PolicyViolation.org_id == org_id)
        result = await self.db.execute(query)
        return result.scalar_one_or_none()

    async def approve_exception(self, violation_id: UUID, approver_id: UUID, reason: str):
        await self.db.execute(
            update(PolicyViolation)
            .where(PolicyViolation.id == violation_id)
            .values(
                status=ViolationStatus.EXCEPTION_APPROVED,
                exception_reason=reason,
                exception_approved_by=approver_id,
            )
        )

    async def get_compliance_coverage(self, org_id: UUID) -> dict:
        """Compliance coverage summary across frameworks."""
        frameworks = await self.db.execute(
            select(ComplianceFramework).where(
                (ComplianceFramework.org_id == org_id) | (ComplianceFramework.org_id.is_(None)),
                ComplianceFramework.enabled == True,
            )
        )
        coverage = {}
        for fw in frameworks.scalars():
            rules = await self.db.execute(
                select(PolicyRule).where(PolicyRule.framework_id == fw.id, PolicyRule.enabled == True)
            )
            rule_list = list(rules.scalars())
            total_rules = len(rule_list)
            violations = await self.db.execute(
                select(PolicyViolation).where(
                    PolicyViolation.org_id == org_id,
                    PolicyViolation.policy_rule_id.in_([r.id for r in rule_list]),
                    PolicyViolation.status == ViolationStatus.OPEN,
                )
            )
            open_violations = len(list(violations.scalars()))
            coverage[fw.name] = {
                "framework": fw.framework_type.value,
                "total_rules": total_rules,
                "open_violations": open_violations,
                "compliance_pct": round((1 - open_violations / total_rules) * 100, 1) if total_rules > 0 else 100,
            }
        return coverage

    async def seed_builtin_policies(self):
        """Seed built-in policy rules."""
        builtin_rules = [
            {
                "name": "No publicly accessible sensitive data",
                "description": "Sensitive data should never be publicly accessible",
                "severity": PolicySeverity.CRITICAL,
                "condition": {"type": "no_public_sensitive"},
                "remediation_suggestion": "Revoke public access to this asset immediately",
                "is_builtin": True,
            },
            {
                "name": "Sensitive data must be encrypted",
                "description": "All sensitive data must be encrypted at rest",
                "severity": PolicySeverity.HIGH,
                "condition": {"type": "sensitive_must_encrypt"},
                "remediation_suggestion": "Enable encryption for this data store",
                "is_builtin": True,
            },
            {
                "name": "No sensitive data in non-production",
                "description": "Production sensitive data must not exist in dev/test/staging",
                "severity": PolicySeverity.HIGH,
                "condition": {"type": "no_sensitive_in_nonprod"},
                "remediation_suggestion": "Remove or mask sensitive data in non-production environments",
                "is_builtin": True,
            },
            {
                "name": "No external sharing of restricted data",
                "description": "Restricted-classified data must not have external sharing",
                "severity": PolicySeverity.CRITICAL,
                "condition": {"type": "no_external_restricted"},
                "remediation_suggestion": "Remove external sharing permissions",
                "is_builtin": True,
            },
            {
                "name": "India data residency",
                "description": "Aadhaar and PAN data must reside in India region",
                "severity": PolicySeverity.HIGH,
                "condition": {
                    "type": "region_restriction",
                    "allowed_regions": ["ap-south-1", "india", "in-central"],
                    "categories": ["aadhaar", "pan"],
                },
                "remediation_suggestion": "Move data to an India-based region",
                "is_builtin": True,
            },
        ]

        for rule_data in builtin_rules:
            existing = await self.db.execute(
                select(PolicyRule).where(PolicyRule.name == rule_data["name"], PolicyRule.is_builtin == True)
            )
            if not existing.scalar_one_or_none():
                rule = PolicyRule(**rule_data)
                self.db.add(rule)
        await self.db.flush()
