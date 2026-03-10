"""Models for Discovery & Scanning Engine (Module 3.2)."""

import enum
import uuid

from sqlalchemy import (
    Column, String, Text, DateTime, Enum, ForeignKey, Boolean, Integer, BigInteger,
    JSON, Float, func,
)
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship

from app.core.database import Base


class ScanType(str, enum.Enum):
    FULL = "full"
    INCREMENTAL = "incremental"
    METADATA_ONLY = "metadata_only"
    DEEP_CONTENT = "deep_content"
    SAMPLE_BASED = "sample_based"


class ScanStatus(str, enum.Enum):
    QUEUED = "queued"
    RUNNING = "running"
    PAUSED = "paused"
    COMPLETED = "completed"
    FAILED = "failed"
    CANCELLED = "cancelled"


class ScanJob(Base):
    __tablename__ = "scan_jobs"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    org_id = Column(UUID(as_uuid=True), ForeignKey("organizations.id"), nullable=False)
    connector_id = Column(UUID(as_uuid=True), ForeignKey("connectors.id"), nullable=False)
    scan_type = Column(Enum(ScanType), nullable=False, default=ScanType.FULL)
    status = Column(Enum(ScanStatus), default=ScanStatus.QUEUED)
    config = Column(JSON, default=dict)  # file size thresholds, extension filters, exclusions
    progress_percent = Column(Float, default=0.0)
    total_objects = Column(BigInteger, default=0)
    scanned_objects = Column(BigInteger, default=0)
    errors_count = Column(Integer, default=0)
    started_at = Column(DateTime(timezone=True), nullable=True)
    finished_at = Column(DateTime(timezone=True), nullable=True)
    triggered_by = Column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    discovered_assets = relationship("DiscoveredAsset", back_populates="scan_job")


class AssetType(str, enum.Enum):
    BUCKET = "bucket"
    CONTAINER = "container"
    DATABASE = "database"
    SCHEMA = "schema"
    TABLE = "table"
    COLUMN = "column"
    FILE = "file"
    FOLDER = "folder"
    DATALAKE_OBJECT = "datalake_object"
    SAAS_RESOURCE = "saas_resource"


class DiscoveredAsset(Base):
    __tablename__ = "discovered_assets"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    scan_job_id = Column(UUID(as_uuid=True), ForeignKey("scan_jobs.id"), nullable=False)
    asset_id = Column(UUID(as_uuid=True), ForeignKey("assets.id"), nullable=True)
    asset_type = Column(Enum(AssetType), nullable=False)
    name = Column(String(1024), nullable=False)
    path = Column(Text, nullable=True)
    parent_path = Column(Text, nullable=True)
    size_bytes = Column(BigInteger, nullable=True)
    file_extension = Column(String(50), nullable=True)
    mime_type = Column(String(255), nullable=True)
    metadata = Column(JSON, default=dict)  # tags, labels, region, etc.
    encryption_status = Column(String(50), nullable=True)
    replication_status = Column(String(50), nullable=True)
    created_date = Column(DateTime(timezone=True), nullable=True)
    last_modified_date = Column(DateTime(timezone=True), nullable=True)
    discovered_at = Column(DateTime(timezone=True), server_default=func.now())

    scan_job = relationship("ScanJob", back_populates="discovered_assets")
