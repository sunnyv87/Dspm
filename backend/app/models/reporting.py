"""Models for Reporting & Dashboard Module (Module 3.9)."""

import enum
import uuid

from sqlalchemy import (
    Column, String, Text, DateTime, Enum, ForeignKey, Boolean, JSON, func,
)
from sqlalchemy.dialects.postgresql import UUID

from app.core.database import Base


class ReportType(str, enum.Enum):
    ASSET_INVENTORY = "asset_inventory"
    COMPLIANCE = "compliance"
    EXPOSURE = "exposure"
    SENSITIVE_DATA_LOCATION = "sensitive_data_location"
    ACCESS_EXPOSURE = "access_exposure"
    REMEDIATION_PROGRESS = "remediation_progress"
    AUDIT_TRAIL = "audit_trail"


class ReportFormat(str, enum.Enum):
    PDF = "pdf"
    CSV = "csv"
    XLSX = "xlsx"
    JSON = "json"


class Report(Base):
    __tablename__ = "reports"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    org_id = Column(UUID(as_uuid=True), ForeignKey("organizations.id"), nullable=False)
    report_type = Column(Enum(ReportType), nullable=False)
    name = Column(String(255), nullable=False)
    description = Column(Text, nullable=True)
    format = Column(Enum(ReportFormat), default=ReportFormat.PDF)
    filters = Column(JSON, default=dict)
    generated_by = Column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=True)
    file_path = Column(Text, nullable=True)
    status = Column(String(50), default="pending")  # pending, generating, ready, failed
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    completed_at = Column(DateTime(timezone=True), nullable=True)


class DashboardType(str, enum.Enum):
    EXECUTIVE_SUMMARY = "executive_summary"
    DATA_RISK_POSTURE = "data_risk_posture"
    SENSITIVE_DATA_INVENTORY = "sensitive_data_inventory"
    PUBLIC_EXPOSURE = "public_exposure"
    COMPLIANCE_POSTURE = "compliance_posture"
    IDENTITY_ACCESS = "identity_access"
    TREND = "trend"
    REMEDIATION = "remediation"


class Dashboard(Base):
    __tablename__ = "dashboards"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    org_id = Column(UUID(as_uuid=True), ForeignKey("organizations.id"), nullable=False)
    dashboard_type = Column(Enum(DashboardType), nullable=False)
    name = Column(String(255), nullable=False)
    description = Column(Text, nullable=True)
    layout = Column(JSON, default=dict)
    is_default = Column(Boolean, default=False)
    created_by = Column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())


class DashboardWidget(Base):
    __tablename__ = "dashboard_widgets"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    dashboard_id = Column(UUID(as_uuid=True), ForeignKey("dashboards.id", ondelete="CASCADE"), nullable=False)
    widget_type = Column(String(100), nullable=False)  # counter, chart, table, graph
    title = Column(String(255), nullable=False)
    query_config = Column(JSON, nullable=False)
    position = Column(JSON, default=dict)  # x, y, w, h
    refresh_interval_seconds = Column(String(50), default="300")
    created_at = Column(DateTime(timezone=True), server_default=func.now())
