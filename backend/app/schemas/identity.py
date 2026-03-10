"""Pydantic schemas for Identity & Access Analysis."""

from datetime import datetime
from typing import Optional
from uuid import UUID

from pydantic import BaseModel

from app.models.identity import IdentityType, PermissionLevel, FindingType


class IdentityRecordResponse(BaseModel):
    id: UUID
    org_id: UUID
    identity_type: IdentityType
    external_id: str
    display_name: Optional[str]
    email: Optional[str]
    is_active: bool
    is_privileged: bool
    is_external: bool
    last_activity_at: Optional[datetime]
    risk_score: Optional[float]
    discovered_at: datetime

    model_config = {"from_attributes": True}


class AccessPermissionResponse(BaseModel):
    id: UUID
    identity_id: UUID
    asset_id: UUID
    permission_level: PermissionLevel
    permission_source: Optional[str]
    is_inherited: bool
    is_effective: bool
    granted_at: Optional[datetime]
    last_used_at: Optional[datetime]

    model_config = {"from_attributes": True}


class AccessFindingResponse(BaseModel):
    id: UUID
    identity_id: Optional[UUID]
    asset_id: Optional[UUID]
    finding_type: FindingType
    severity: str
    description: str
    recommendation: Optional[str]
    is_resolved: bool
    detected_at: datetime

    model_config = {"from_attributes": True}


class AssetAccessSummary(BaseModel):
    asset_id: UUID
    total_users: int
    privileged_users: int
    external_users: int
    service_accounts: int
    public_exposure: bool


class IdentityLookupRequest(BaseModel):
    identity_id: Optional[UUID] = None
    email: Optional[str] = None
    external_id: Optional[str] = None
