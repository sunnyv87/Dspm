"""Pydantic schemas for Metadata & Asset Inventory."""

from datetime import datetime
from typing import Optional
from uuid import UUID

from pydantic import BaseModel

from app.models.inventory import ExposureStatus, EncryptionStatus


class AssetResponse(BaseModel):
    id: UUID
    org_id: UUID
    connector_id: Optional[UUID]
    asset_type: str
    name: str
    path: Optional[str]
    storage_location: Optional[str]
    geo_region: Optional[str]
    environment: Optional[str]
    business_owner: Optional[str]
    technical_owner: Optional[str]
    size_bytes: Optional[int]
    sensitive_data_count: int
    classification_summary: dict
    risk_score: Optional[float]
    exposure_status: ExposureStatus
    encryption_status: EncryptionStatus
    is_shadow_data: bool
    is_stale: bool
    is_duplicate: bool
    last_scanned_at: Optional[datetime]
    last_modified_at: Optional[datetime]
    created_at: datetime

    model_config = {"from_attributes": True}


class AssetFilter(BaseModel):
    cloud_account: Optional[str] = None
    environment: Optional[str] = None
    owner: Optional[str] = None
    sensitivity: Optional[str] = None
    risk_level: Optional[str] = None
    region: Optional[str] = None
    compliance_status: Optional[str] = None
    exposure_status: Optional[ExposureStatus] = None
    asset_type: Optional[str] = None
    last_scanned_after: Optional[datetime] = None
    page: int = 1
    page_size: int = 50


class AssetUpdateOwner(BaseModel):
    business_owner: Optional[str] = None
    technical_owner: Optional[str] = None


class AssetTagCreate(BaseModel):
    key: str
    value: Optional[str] = None
