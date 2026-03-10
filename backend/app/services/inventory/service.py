"""Metadata & Asset Inventory Engine service (Module 3.4)."""

from typing import Optional
from uuid import UUID

from sqlalchemy import select, func, and_, or_
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.inventory import Asset, AssetTag, AssetOwner, ExposureStatus
from app.schemas.inventory import AssetFilter


class AssetInventoryService:
    def __init__(self, db: AsyncSession):
        self.db = db

    async def upsert_asset(self, org_id: UUID, asset_data: dict) -> Asset:
        """Create or update an asset record."""
        existing = None
        if asset_data.get("path") and asset_data.get("connector_id"):
            result = await self.db.execute(
                select(Asset).where(
                    Asset.org_id == org_id,
                    Asset.connector_id == asset_data["connector_id"],
                    Asset.path == asset_data["path"],
                )
            )
            existing = result.scalar_one_or_none()

        if existing:
            for key, value in asset_data.items():
                if value is not None:
                    setattr(existing, key, value)
            await self.db.flush()
            return existing

        asset = Asset(org_id=org_id, **asset_data)
        self.db.add(asset)
        await self.db.flush()
        return asset

    async def get_asset(self, asset_id: UUID, org_id: UUID = None) -> Optional[Asset]:
        """Get an asset with optional tenant isolation."""
        query = select(Asset).where(Asset.id == asset_id)
        if org_id:
            query = query.where(Asset.org_id == org_id)
        result = await self.db.execute(query)
        return result.scalar_one_or_none()

    async def list_assets(self, org_id: UUID, filters: AssetFilter) -> tuple[list[Asset], int]:
        query = select(Asset).where(Asset.org_id == org_id)

        if filters.environment:
            query = query.where(Asset.environment == filters.environment)
        if filters.owner:
            query = query.where(
                or_(Asset.business_owner == filters.owner, Asset.technical_owner == filters.owner)
            )
        if filters.region:
            query = query.where(Asset.geo_region == filters.region)
        if filters.exposure_status:
            query = query.where(Asset.exposure_status == filters.exposure_status)
        if filters.asset_type:
            query = query.where(Asset.asset_type == filters.asset_type)

        # Count
        count_query = select(func.count()).select_from(query.subquery())
        count_result = await self.db.execute(count_query)
        total = count_result.scalar()

        # Paginate
        offset = (filters.page - 1) * filters.page_size
        query = query.offset(offset).limit(filters.page_size).order_by(Asset.updated_at.desc())
        result = await self.db.execute(query)

        return list(result.scalars().all()), total

    async def get_sensitive_assets(self, org_id: UUID) -> list[Asset]:
        result = await self.db.execute(
            select(Asset).where(
                Asset.org_id == org_id,
                Asset.sensitive_data_count > 0,
            ).order_by(Asset.sensitive_data_count.desc())
        )
        return list(result.scalars().all())

    async def get_publicly_exposed_assets(self, org_id: UUID) -> list[Asset]:
        result = await self.db.execute(
            select(Asset).where(
                Asset.org_id == org_id,
                Asset.exposure_status == ExposureStatus.PUBLIC,
                Asset.sensitive_data_count > 0,
            )
        )
        return list(result.scalars().all())

    async def get_stale_assets(self, org_id: UUID) -> list[Asset]:
        result = await self.db.execute(
            select(Asset).where(Asset.org_id == org_id, Asset.is_stale == True)
        )
        return list(result.scalars().all())

    async def get_shadow_data_assets(self, org_id: UUID) -> list[Asset]:
        result = await self.db.execute(
            select(Asset).where(Asset.org_id == org_id, Asset.is_shadow_data == True)
        )
        return list(result.scalars().all())

    async def get_unowned_assets(self, org_id: UUID) -> list[Asset]:
        result = await self.db.execute(
            select(Asset).where(
                Asset.org_id == org_id,
                Asset.business_owner.is_(None),
                Asset.technical_owner.is_(None),
            )
        )
        return list(result.scalars().all())

    async def add_tag(self, asset_id: UUID, key: str, value: str = None, source: str = "manual") -> AssetTag:
        tag = AssetTag(asset_id=asset_id, key=key, value=value, source=source)
        self.db.add(tag)
        await self.db.flush()
        return tag

    async def set_owner(self, asset_id: UUID, owner_type: str, name: str, email: str = None) -> AssetOwner:
        owner = AssetOwner(asset_id=asset_id, owner_type=owner_type, owner_name=name, owner_email=email)
        self.db.add(owner)
        await self.db.flush()
        return owner
