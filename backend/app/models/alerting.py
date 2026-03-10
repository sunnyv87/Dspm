"""Models for Alerting & Workflow Engine (Module 3.8)."""

import enum
import uuid

from sqlalchemy import (
    Column, String, Text, DateTime, Enum, ForeignKey, JSON, func,
)
from sqlalchemy.dialects.postgresql import UUID

from app.core.database import Base


class AlertSeverity(str, enum.Enum):
    CRITICAL = "critical"
    HIGH = "high"
    MEDIUM = "medium"
    LOW = "low"
    INFO = "info"


class AlertStatus(str, enum.Enum):
    OPEN = "open"
    IN_PROGRESS = "in_progress"
    RESOLVED = "resolved"
    ACCEPTED_RISK = "accepted_risk"
    SUPPRESSED = "suppressed"


class AlertType(str, enum.Enum):
    PUBLIC_SENSITIVE_BUCKET = "public_sensitive_bucket"
    EXTERNAL_SHARED_CONFIDENTIAL = "external_shared_confidential"
    UNENCRYPTED_SENSITIVE_DB = "unencrypted_sensitive_db"
    EXCESSIVE_ACCESS = "excessive_access"
    SENSITIVE_IN_DEV = "sensitive_in_dev"
    NEW_SENSITIVE_ASSET = "new_sensitive_asset"
    DATA_DUPLICATION_RISK = "data_duplication_risk"
    RESIDENCY_VIOLATION = "residency_violation"
    SERVICE_ACCOUNT_OVEREXPOSURE = "service_account_overexposure"
    POLICY_VIOLATION = "policy_violation"


class Alert(Base):
    __tablename__ = "alerts"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    org_id = Column(UUID(as_uuid=True), ForeignKey("organizations.id"), nullable=False)
    alert_type = Column(Enum(AlertType), nullable=False)
    severity = Column(Enum(AlertSeverity), nullable=False)
    status = Column(Enum(AlertStatus), default=AlertStatus.OPEN)
    title = Column(String(500), nullable=False)
    description = Column(Text, nullable=True)
    asset_id = Column(UUID(as_uuid=True), ForeignKey("assets.id"), nullable=True)
    policy_violation_id = Column(UUID(as_uuid=True), ForeignKey("policy_violations.id"), nullable=True)
    assigned_to = Column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=True)
    remediation_recommendation = Column(Text, nullable=True)
    sla_due_at = Column(DateTime(timezone=True), nullable=True)
    escalated = Column(String(50), default="none")
    external_ticket_id = Column(String(255), nullable=True)  # Jira/ServiceNow ID
    external_ticket_url = Column(Text, nullable=True)
    metadata = Column(JSON, default=dict)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())
    resolved_at = Column(DateTime(timezone=True), nullable=True)


class AlertComment(Base):
    __tablename__ = "alert_comments"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    alert_id = Column(UUID(as_uuid=True), ForeignKey("alerts.id", ondelete="CASCADE"), nullable=False)
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=False)
    comment = Column(Text, nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())


class TaskStatus(str, enum.Enum):
    PENDING = "pending"
    IN_PROGRESS = "in_progress"
    COMPLETED = "completed"
    CANCELLED = "cancelled"


class RemediationTask(Base):
    __tablename__ = "remediation_tasks"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    alert_id = Column(UUID(as_uuid=True), ForeignKey("alerts.id"), nullable=False)
    org_id = Column(UUID(as_uuid=True), ForeignKey("organizations.id"), nullable=False)
    title = Column(String(500), nullable=False)
    description = Column(Text, nullable=True)
    action_type = Column(String(100), nullable=False)  # revoke_access, enable_encryption, etc.
    status = Column(Enum(TaskStatus), default=TaskStatus.PENDING)
    assigned_to = Column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=True)
    due_at = Column(DateTime(timezone=True), nullable=True)
    completed_at = Column(DateTime(timezone=True), nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
