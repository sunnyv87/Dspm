"""Discovery & Scanning Engine service (Module 3.2)."""

from datetime import datetime, timezone
from typing import Optional
from uuid import UUID

from sqlalchemy import select, update
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.discovery import ScanJob, ScanStatus, DiscoveredAsset


class ScanService:
    def __init__(self, db: AsyncSession):
        self.db = db

    async def create_scan_job(self, org_id: UUID, connector_id: UUID, scan_type: str, config: dict = None) -> ScanJob:
        job = ScanJob(
            org_id=org_id,
            connector_id=connector_id,
            scan_type=scan_type,
            config=config or {},
        )
        self.db.add(job)
        await self.db.flush()
        return job

    async def get_scan_job(self, job_id: UUID) -> Optional[ScanJob]:
        result = await self.db.execute(select(ScanJob).where(ScanJob.id == job_id))
        return result.scalar_one_or_none()

    async def list_scan_jobs(self, org_id: UUID, connector_id: UUID = None) -> list[ScanJob]:
        query = select(ScanJob).where(ScanJob.org_id == org_id)
        if connector_id:
            query = query.where(ScanJob.connector_id == connector_id)
        query = query.order_by(ScanJob.created_at.desc())
        result = await self.db.execute(query)
        return list(result.scalars().all())

    async def update_scan_status(self, job_id: UUID, status: ScanStatus, **kwargs):
        values = {"status": status}
        if status == ScanStatus.RUNNING:
            values["started_at"] = datetime.now(timezone.utc)
        elif status in (ScanStatus.COMPLETED, ScanStatus.FAILED, ScanStatus.CANCELLED):
            values["finished_at"] = datetime.now(timezone.utc)
        values.update(kwargs)
        await self.db.execute(
            update(ScanJob).where(ScanJob.id == job_id).values(**values)
        )

    async def update_progress(self, job_id: UUID, scanned: int, total: int, errors: int = 0):
        progress = (scanned / total * 100) if total > 0 else 0
        await self.db.execute(
            update(ScanJob).where(ScanJob.id == job_id).values(
                scanned_objects=scanned,
                total_objects=total,
                progress_percent=progress,
                errors_count=errors,
            )
        )

    async def pause_scan(self, job_id: UUID) -> bool:
        job = await self.get_scan_job(job_id)
        if job and job.status == ScanStatus.RUNNING:
            await self.update_scan_status(job_id, ScanStatus.PAUSED)
            return True
        return False

    async def cancel_scan(self, job_id: UUID) -> bool:
        job = await self.get_scan_job(job_id)
        if job and job.status in (ScanStatus.RUNNING, ScanStatus.PAUSED, ScanStatus.QUEUED):
            await self.update_scan_status(job_id, ScanStatus.CANCELLED)
            return True
        return False

    async def add_discovered_asset(self, scan_job_id: UUID, asset_data: dict) -> DiscoveredAsset:
        asset = DiscoveredAsset(scan_job_id=scan_job_id, **asset_data)
        self.db.add(asset)
        await self.db.flush()
        return asset

    async def get_discovered_assets(self, scan_job_id: UUID) -> list[DiscoveredAsset]:
        result = await self.db.execute(
            select(DiscoveredAsset).where(DiscoveredAsset.scan_job_id == scan_job_id)
        )
        return list(result.scalars().all())
