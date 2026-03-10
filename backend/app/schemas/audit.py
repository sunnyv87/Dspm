"""Pydantic schemas for Audit & Logging Module."""

from datetime import datetime
from typing import Optional
from uuid import UUID

from pydantic import BaseModel


class AuditLogResponse(BaseModel):
    id: UUID
    org_id: UUID
    user_id: Optional[UUID]
    action: str
    module: str
    resource_type: Optional[str]
    resource_id: Optional[str]
    description: Optional[str]
    ip_address: Optional[str]
    status: str
    created_at: datetime

    model_config = {"from_attributes": True}


class AuditLogFilter(BaseModel):
    module: Optional[str] = None
    action: Optional[str] = None
    user_id: Optional[UUID] = None
    resource_type: Optional[str] = None
    start_date: Optional[datetime] = None
    end_date: Optional[datetime] = None
    page: int = 1
    page_size: int = 50
