"""Models for Identity & Access Analysis Engine (Module 3.5)."""

import enum
import uuid

from sqlalchemy import (
    Column, String, Text, DateTime, Enum, ForeignKey, Boolean, Integer,
    Float, JSON, func,
)
from sqlalchemy.dialects.postgresql import UUID

from app.core.database import Base


class IdentityType(str, enum.Enum):
    USER = "user"
    GROUP = "group"
    ROLE = "role"
    SERVICE_ACCOUNT = "service_account"
    EXTERNAL = "external"
    ANONYMOUS = "anonymous"


class IdentityRecord(Base):
    __tablename__ = "identity_records"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    org_id = Column(UUID(as_uuid=True), ForeignKey("organizations.id"), nullable=False)
    connector_id = Column(UUID(as_uuid=True), ForeignKey("connectors.id"), nullable=True)
    identity_type = Column(Enum(IdentityType), nullable=False)
    external_id = Column(String(500), nullable=False)
    display_name = Column(String(255), nullable=True)
    email = Column(String(255), nullable=True)
    is_active = Column(Boolean, default=True)
    is_privileged = Column(Boolean, default=False)
    is_external = Column(Boolean, default=False)
    last_activity_at = Column(DateTime(timezone=True), nullable=True)
    risk_score = Column(Float, nullable=True)
    metadata = Column(JSON, default=dict)
    discovered_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())


class PermissionLevel(str, enum.Enum):
    READ = "read"
    WRITE = "write"
    ADMIN = "admin"
    OWNER = "owner"
    FULL_CONTROL = "full_control"
    CUSTOM = "custom"


class AccessPermission(Base):
    __tablename__ = "access_permissions"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    identity_id = Column(UUID(as_uuid=True), ForeignKey("identity_records.id"), nullable=False)
    asset_id = Column(UUID(as_uuid=True), ForeignKey("assets.id"), nullable=False)
    permission_level = Column(Enum(PermissionLevel), nullable=False)
    permission_source = Column(String(100), nullable=True)  # direct, inherited, group
    is_inherited = Column(Boolean, default=False)
    inherited_from = Column(String(500), nullable=True)
    is_effective = Column(Boolean, default=True)
    granted_at = Column(DateTime(timezone=True), nullable=True)
    last_used_at = Column(DateTime(timezone=True), nullable=True)
    raw_policy = Column(JSON, nullable=True)
    discovered_at = Column(DateTime(timezone=True), server_default=func.now())


class FindingType(str, enum.Enum):
    PUBLIC_ACCESS = "public_access"
    OVERLY_PERMISSIVE = "overly_permissive"
    STALE_ACCESS = "stale_access"
    ORPHANED_ACCOUNT = "orphaned_account"
    INACTIVE_PRIVILEGED = "inactive_privileged"
    EXTERNAL_COLLABORATOR = "external_collaborator"
    ANONYMOUS_LINK = "anonymous_link"
    TOXIC_COMBINATION = "toxic_combination"


class AccessFinding(Base):
    __tablename__ = "access_findings"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    org_id = Column(UUID(as_uuid=True), ForeignKey("organizations.id"), nullable=False)
    identity_id = Column(UUID(as_uuid=True), ForeignKey("identity_records.id"), nullable=True)
    asset_id = Column(UUID(as_uuid=True), ForeignKey("assets.id"), nullable=True)
    finding_type = Column(Enum(FindingType), nullable=False)
    severity = Column(String(50), nullable=False)
    description = Column(Text, nullable=False)
    recommendation = Column(Text, nullable=True)
    is_resolved = Column(Boolean, default=False)
    resolved_at = Column(DateTime(timezone=True), nullable=True)
    detected_at = Column(DateTime(timezone=True), server_default=func.now())
