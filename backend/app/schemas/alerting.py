"""Pydantic schemas for Alerting & Workflow Engine."""

from datetime import datetime
from typing import Optional
from uuid import UUID

from pydantic import BaseModel

from app.models.alerting import AlertSeverity, AlertStatus, AlertType


class AlertResponse(BaseModel):
    id: UUID
    org_id: UUID
    alert_type: AlertType
    severity: AlertSeverity
    status: AlertStatus
    title: str
    description: Optional[str]
    asset_id: Optional[UUID]
    assigned_to: Optional[UUID]
    remediation_recommendation: Optional[str]
    sla_due_at: Optional[datetime]
    external_ticket_id: Optional[str]
    created_at: datetime
    updated_at: datetime
    resolved_at: Optional[datetime]

    model_config = {"from_attributes": True}


class AlertUpdateStatus(BaseModel):
    status: AlertStatus
    comment: Optional[str] = None


class AlertAssign(BaseModel):
    assigned_to: UUID


class AlertCommentCreate(BaseModel):
    comment: str


class RemediationTaskCreate(BaseModel):
    alert_id: UUID
    title: str
    description: Optional[str] = None
    action_type: str
    assigned_to: Optional[UUID] = None
    due_at: Optional[datetime] = None


class RemediationTaskResponse(BaseModel):
    id: UUID
    alert_id: UUID
    title: str
    description: Optional[str]
    action_type: str
    status: str
    assigned_to: Optional[UUID]
    due_at: Optional[datetime]
    completed_at: Optional[datetime]
    created_at: datetime

    model_config = {"from_attributes": True}


class AlertFilter(BaseModel):
    severity: Optional[AlertSeverity] = None
    status: Optional[AlertStatus] = None
    alert_type: Optional[AlertType] = None
    asset_id: Optional[UUID] = None
    assigned_to: Optional[UUID] = None
    page: int = 1
    page_size: int = 50
