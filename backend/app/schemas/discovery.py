"""Pydantic schemas for Discovery & Scanning Engine."""

from datetime import datetime
from typing import Optional
from uuid import UUID

from pydantic import BaseModel, Field

from app.models.discovery import ScanType, ScanStatus, AssetType


class ScanJobCreate(BaseModel):
    connector_id: UUID
    scan_type: ScanType = ScanType.FULL
    config: dict = Field(default_factory=dict)


class ScanJobResponse(BaseModel):
    id: UUID
    org_id: UUID
    connector_id: UUID
    scan_type: ScanType
    status: ScanStatus
    progress_percent: float
    total_objects: int
    scanned_objects: int
    errors_count: int
    started_at: Optional[datetime]
    finished_at: Optional[datetime]
    created_at: datetime

    model_config = {"from_attributes": True}


class DiscoveredAssetResponse(BaseModel):
    id: UUID
    scan_job_id: UUID
    asset_type: AssetType
    name: str
    path: Optional[str]
    size_bytes: Optional[int]
    file_extension: Optional[str]
    encryption_status: Optional[str]
    created_date: Optional[datetime]
    last_modified_date: Optional[datetime]
    discovered_at: datetime

    model_config = {"from_attributes": True}
