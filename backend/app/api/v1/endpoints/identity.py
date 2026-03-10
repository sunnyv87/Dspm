"""Identity & Access Analysis API endpoints."""

from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.api.deps import get_current_user, require_role
from app.core.database import get_db
from app.schemas.identity import (
    IdentityRecordResponse, AccessPermissionResponse,
    AccessFindingResponse, AssetAccessSummary,
)
from app.services.identity.service import IdentityAccessService

router = APIRouter(prefix="/identity", tags=["Identity & Access"])


@router.get("/assets/{asset_id}/access", response_model=AssetAccessSummary)
async def get_asset_access(
    asset_id: UUID,
    current_user: dict = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    service = IdentityAccessService(db)
    return await service.get_asset_access_summary(asset_id)


@router.get("/identities/{identity_id}/sensitive-assets")
async def get_identity_sensitive_assets(
    identity_id: UUID,
    current_user: dict = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    service = IdentityAccessService(db)
    assets = await service.get_identity_sensitive_assets(identity_id)
    return {"identity_id": identity_id, "sensitive_assets_count": len(assets), "assets": assets}


@router.get("/findings", response_model=list[AccessFindingResponse])
async def get_findings(
    resolved: bool = False,
    current_user: dict = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    service = IdentityAccessService(db)
    return await service.get_findings(current_user["org_id"], resolved)


@router.post("/analyze")
async def run_access_analysis(
    current_user: dict = Depends(require_role("super_admin", "org_admin", "security_analyst")),
    db: AsyncSession = Depends(get_db),
):
    service = IdentityAccessService(db)
    findings = await service.detect_access_findings(current_user["org_id"])
    return {"findings_count": len(findings), "message": "Access analysis completed"}
