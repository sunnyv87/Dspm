"""Models for Policy & Compliance Engine (Module 3.7)."""

import enum
import uuid

from sqlalchemy import (
    Column, String, Text, DateTime, Enum, ForeignKey, Boolean, JSON, func,
)
from sqlalchemy.dialects.postgresql import UUID

from app.core.database import Base


class FrameworkType(str, enum.Enum):
    ISO_27001 = "iso_27001"
    SOC2 = "soc2"
    PCI_DSS = "pci_dss"
    GDPR = "gdpr"
    HIPAA = "hipaa"
    DPDPA = "dpdpa"
    RBI = "rbi"
    SEBI = "sebi"
    IRDAI = "irdai"
    CUSTOM = "custom"


class PolicySeverity(str, enum.Enum):
    CRITICAL = "critical"
    HIGH = "high"
    MEDIUM = "medium"
    LOW = "low"
    INFO = "info"


class ComplianceFramework(Base):
    __tablename__ = "compliance_frameworks"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    org_id = Column(UUID(as_uuid=True), ForeignKey("organizations.id"), nullable=True)
    framework_type = Column(Enum(FrameworkType), nullable=False)
    name = Column(String(255), nullable=False)
    version = Column(String(50), nullable=True)
    description = Column(Text, nullable=True)
    controls = Column(JSON, default=list)  # list of control definitions
    is_builtin = Column(Boolean, default=False)
    enabled = Column(Boolean, default=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())


class PolicyRule(Base):
    __tablename__ = "policy_rules"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    org_id = Column(UUID(as_uuid=True), ForeignKey("organizations.id"), nullable=True)
    framework_id = Column(UUID(as_uuid=True), ForeignKey("compliance_frameworks.id"), nullable=True)
    name = Column(String(255), nullable=False)
    description = Column(Text, nullable=True)
    severity = Column(Enum(PolicySeverity), default=PolicySeverity.MEDIUM)
    condition = Column(JSON, nullable=False)  # rule condition DSL
    control_mapping = Column(JSON, default=list)
    remediation_suggestion = Column(Text, nullable=True)
    is_builtin = Column(Boolean, default=False)
    enabled = Column(Boolean, default=True)
    continuous_monitoring = Column(Boolean, default=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())


class ViolationStatus(str, enum.Enum):
    OPEN = "open"
    IN_PROGRESS = "in_progress"
    RESOLVED = "resolved"
    EXCEPTION_APPROVED = "exception_approved"
    SUPPRESSED = "suppressed"


class PolicyViolation(Base):
    __tablename__ = "policy_violations"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    org_id = Column(UUID(as_uuid=True), ForeignKey("organizations.id"), nullable=False)
    policy_rule_id = Column(UUID(as_uuid=True), ForeignKey("policy_rules.id"), nullable=False)
    asset_id = Column(UUID(as_uuid=True), ForeignKey("assets.id"), nullable=True)
    severity = Column(Enum(PolicySeverity), nullable=False)
    status = Column(Enum(ViolationStatus), default=ViolationStatus.OPEN)
    description = Column(Text, nullable=True)
    evidence = Column(JSON, default=dict)
    remediation_suggestion = Column(Text, nullable=True)
    exception_reason = Column(Text, nullable=True)
    exception_approved_by = Column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=True)
    detected_at = Column(DateTime(timezone=True), server_default=func.now())
    resolved_at = Column(DateTime(timezone=True), nullable=True)
