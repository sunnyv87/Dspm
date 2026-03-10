"""Discovery & Scanning API endpoints."""

from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.api.deps import get_current_user, require_role
from app.core.database import get_db
from app.schemas.discovery import ScanJobCreate, ScanJobResponse, DiscoveredAssetResponse
from app.services.discovery.service import ScanService

router = APIRouter(prefix="/scans", tags=["Discovery & Scanning"])


@router.post("/", response_model=ScanJobResponse, status_code=status.HTTP_201_CREATED)
async def create_scan(
    data: ScanJobCreate,
    current_user: dict = Depends(require_role("super_admin", "org_admin", "security_analyst")),
    db: AsyncSession = Depends(get_db),
):
    service = ScanService(db)
    job = await service.create_scan_job(
        org_id=current_user["org_id"],
        connector_id=data.connector_id,
        scan_type=data.scan_type,
        config=data.config,
    )
    return job


@router.get("/", response_model=list[ScanJobResponse])
async def list_scans(
    connector_id: UUID = None,
    current_user: dict = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    service = ScanService(db)
    return await service.list_scan_jobs(current_user["org_id"], connector_id)


@router.get("/{job_id}", response_model=ScanJobResponse)
async def get_scan(
    job_id: UUID,
    current_user: dict = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    service = ScanService(db)
    job = await service.get_scan_job(job_id, org_id=current_user["org_id"])
    if not job:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Scan job not found")
    return job


@router.post("/{job_id}/pause")
async def pause_scan(
    job_id: UUID,
    current_user: dict = Depends(require_role("super_admin", "org_admin", "security_analyst")),
    db: AsyncSession = Depends(get_db),
):
    service = ScanService(db)
    success = await service.pause_scan(job_id, org_id=current_user["org_id"])
    if not success:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Cannot pause this scan")
    return {"status": "paused"}


@router.post("/{job_id}/cancel")
async def cancel_scan(
    job_id: UUID,
    current_user: dict = Depends(require_role("super_admin", "org_admin", "security_analyst")),
    db: AsyncSession = Depends(get_db),
):
    service = ScanService(db)
    success = await service.cancel_scan(job_id, org_id=current_user["org_id"])
    if not success:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Cannot cancel this scan")
    return {"status": "cancelled"}


@router.get("/{job_id}/assets", response_model=list[DiscoveredAssetResponse])
async def get_scan_assets(
    job_id: UUID,
    current_user: dict = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    service = ScanService(db)
    # Verify the scan job belongs to the user's org first
    job = await service.get_scan_job(job_id, org_id=current_user["org_id"])
    if not job:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Scan job not found")
    return await service.get_discovered_assets(job_id)
