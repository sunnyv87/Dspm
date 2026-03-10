"""Models for Metadata & Asset Inventory Engine (Module 3.4)."""

import enum
import uuid

from sqlalchemy import (
    Column, String, Text, DateTime, Enum, ForeignKey, Boolean, BigInteger,
    Float, JSON, func,
)
from sqlalchemy.dialects.postgresql import UUID

from app.core.database import Base


class ExposureStatus(str, enum.Enum):
    PRIVATE = "private"
    INTERNAL = "internal"
    EXTERNAL_SHARED = "external_shared"
    PUBLIC = "public"


class EncryptionStatus(str, enum.Enum):
    ENCRYPTED = "encrypted"
    NOT_ENCRYPTED = "not_encrypted"
    PARTIAL = "partial"
    UNKNOWN = "unknown"


class Asset(Base):
    __tablename__ = "assets"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    org_id = Column(UUID(as_uuid=True), ForeignKey("organizations.id"), nullable=False)
    connector_id = Column(UUID(as_uuid=True), ForeignKey("connectors.id"), nullable=True)
    asset_type = Column(String(100), nullable=False)
    name = Column(String(1024), nullable=False)
    path = Column(Text, nullable=True)
    parent_asset_id = Column(UUID(as_uuid=True), ForeignKey("assets.id"), nullable=True)
    storage_location = Column(String(500), nullable=True)
    geo_region = Column(String(100), nullable=True)
    environment = Column(String(50), nullable=True)  # production, staging, dev, test
    business_owner = Column(String(255), nullable=True)
    technical_owner = Column(String(255), nullable=True)
    size_bytes = Column(BigInteger, nullable=True)
    sensitive_data_count = Column(BigInteger, default=0)
    classification_summary = Column(JSON, default=dict)
    risk_score = Column(Float, nullable=True)
    exposure_status = Column(Enum(ExposureStatus), default=ExposureStatus.PRIVATE)
    encryption_status = Column(Enum(EncryptionStatus), default=EncryptionStatus.UNKNOWN)
    compliance_status = Column(JSON, default=dict)
    is_shadow_data = Column(Boolean, default=False)
    is_stale = Column(Boolean, default=False)
    is_duplicate = Column(Boolean, default=False)
    last_scanned_at = Column(DateTime(timezone=True), nullable=True)
    last_modified_at = Column(DateTime(timezone=True), nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())
    metadata = Column(JSON, default=dict)


class AssetTag(Base):
    __tablename__ = "asset_tags"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    asset_id = Column(UUID(as_uuid=True), ForeignKey("assets.id", ondelete="CASCADE"), nullable=False)
    key = Column(String(255), nullable=False)
    value = Column(String(500), nullable=True)
    source = Column(String(50), default="manual")  # manual, cloud, classification
    created_at = Column(DateTime(timezone=True), server_default=func.now())


class AssetOwner(Base):
    __tablename__ = "asset_owners"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    asset_id = Column(UUID(as_uuid=True), ForeignKey("assets.id", ondelete="CASCADE"), nullable=False)
    owner_type = Column(String(50), nullable=False)  # business, technical, data_steward
    owner_name = Column(String(255), nullable=False)
    owner_email = Column(String(255), nullable=True)
    assigned_at = Column(DateTime(timezone=True), server_default=func.now())
