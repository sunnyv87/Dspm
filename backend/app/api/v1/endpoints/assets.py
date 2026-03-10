"""Asset Inventory API endpoints."""

from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.ext.asyncio import AsyncSession

from app.api.deps import get_current_user
from app.core.database import get_db
from app.models.inventory import ExposureStatus
from app.schemas.inventory import AssetResponse, AssetFilter, AssetUpdateOwner, AssetTagCreate
from app.services.inventory.service import AssetInventoryService

router = APIRouter(prefix="/assets", tags=["Asset Inventory"])


@router.get("/", response_model=dict)
async def list_assets(
    environment: str = None,
    owner: str = None,
    region: str = None,
    exposure_status: ExposureStatus = None,
    asset_type: str = None,
    page: int = Query(1, ge=1),
    page_size: int = Query(50, ge=1, le=200),
    current_user: dict = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    service = AssetInventoryService(db)
    filters = AssetFilter(
        environment=environment,
        owner=owner,
        region=region,
        exposure_status=exposure_status,
        asset_type=asset_type,
        page=page,
        page_size=page_size,
    )
    assets, total = await service.list_assets(current_user["org_id"], filters)
    return {"items": assets, "total": total, "page": page, "page_size": page_size}


@router.get("/sensitive", response_model=list[AssetResponse])
async def get_sensitive_assets(
    current_user: dict = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    service = AssetInventoryService(db)
    return await service.get_sensitive_assets(current_user["org_id"])


@router.get("/exposed", response_model=list[AssetResponse])
async def get_exposed_assets(
    current_user: dict = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    service = AssetInventoryService(db)
    return await service.get_publicly_exposed_assets(current_user["org_id"])


@router.get("/stale", response_model=list[AssetResponse])
async def get_stale_assets(
    current_user: dict = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    service = AssetInventoryService(db)
    return await service.get_stale_assets(current_user["org_id"])


@router.get("/shadow", response_model=list[AssetResponse])
async def get_shadow_data(
    current_user: dict = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    service = AssetInventoryService(db)
    return await service.get_shadow_data_assets(current_user["org_id"])


@router.get("/unowned", response_model=list[AssetResponse])
async def get_unowned_assets(
    current_user: dict = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    service = AssetInventoryService(db)
    return await service.get_unowned_assets(current_user["org_id"])


@router.get("/{asset_id}", response_model=AssetResponse)
async def get_asset(
    asset_id: UUID,
    current_user: dict = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    service = AssetInventoryService(db)
    asset = await service.get_asset(asset_id)
    if not asset:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Asset not found")
    return asset


@router.patch("/{asset_id}/owner")
async def update_owner(
    asset_id: UUID,
    data: AssetUpdateOwner,
    current_user: dict = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    service = AssetInventoryService(db)
    asset = await service.get_asset(asset_id)
    if not asset:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Asset not found")
    if data.business_owner:
        asset.business_owner = data.business_owner
    if data.technical_owner:
        asset.technical_owner = data.technical_owner
    return {"status": "updated"}


@router.post("/{asset_id}/tags")
async def add_tag(
    asset_id: UUID,
    data: AssetTagCreate,
    current_user: dict = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    service = AssetInventoryService(db)
    tag = await service.add_tag(asset_id, data.key, data.value)
    return {"id": tag.id, "key": tag.key, "value": tag.value}
