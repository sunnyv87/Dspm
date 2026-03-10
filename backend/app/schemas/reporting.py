"""Pydantic schemas for Reporting & Dashboard Module."""

from datetime import datetime
from typing import Optional
from uuid import UUID

from pydantic import BaseModel

from app.models.reporting import ReportType, ReportFormat, DashboardType


class ReportCreate(BaseModel):
    report_type: ReportType
    name: str
    description: Optional[str] = None
    format: ReportFormat = ReportFormat.PDF
    filters: dict = {}


class ReportResponse(BaseModel):
    id: UUID
    org_id: UUID
    report_type: ReportType
    name: str
    format: ReportFormat
    status: str
    file_path: Optional[str]
    created_at: datetime
    completed_at: Optional[datetime]

    model_config = {"from_attributes": True}


class DashboardResponse(BaseModel):
    id: UUID
    dashboard_type: DashboardType
    name: str
    description: Optional[str]
    layout: dict
    is_default: bool
    created_at: datetime

    model_config = {"from_attributes": True}


class DashboardWidgetResponse(BaseModel):
    id: UUID
    dashboard_id: UUID
    widget_type: str
    title: str
    query_config: dict
    position: dict

    model_config = {"from_attributes": True}


class ExecutiveSummary(BaseModel):
    total_assets_scanned: int
    sensitive_assets_count: int
    critical_risk_assets: int
    publicly_exposed_sensitive: int
    top_risky_stores: list
    top_excessive_access_users: list
    compliance_violations_by_framework: dict
    alerts_by_severity: dict
    risk_trend: list
