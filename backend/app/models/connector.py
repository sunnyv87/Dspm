"""Models for Connector & Ingestion Engine (Module 3.1)."""

import enum
import uuid
from datetime import datetime

from sqlalchemy import (
    Column, String, Text, DateTime, Enum, ForeignKey, Boolean, Integer, JSON,
    func,
)
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship

from app.core.database import Base


class ConnectorType(str, enum.Enum):
    # Cloud Storage
    AWS_S3 = "aws_s3"
    AZURE_BLOB = "azure_blob"
    GCS = "gcs"
    # Databases
    POSTGRESQL = "postgresql"
    MYSQL = "mysql"
    MSSQL = "mssql"
    MONGODB = "mongodb"
    ORACLE = "oracle"
    MARIADB = "mariadb"
    # Data Warehouses / Lakes
    SNOWFLAKE = "snowflake"
    BIGQUERY = "bigquery"
    REDSHIFT = "redshift"
    DATABRICKS = "databricks"
    HDFS = "hdfs"
    # SaaS
    MICROSOFT_365 = "microsoft_365"
    GOOGLE_WORKSPACE = "google_workspace"
    SLACK = "slack"
    JIRA = "jira"
    CONFLUENCE = "confluence"
    SALESFORCE = "salesforce"
    # On-Prem
    SMB = "smb"
    NFS = "nfs"
    LOCAL_FS = "local_fs"


class CredentialType(str, enum.Enum):
    API_KEY = "api_key"
    OAUTH2 = "oauth2"
    IAM_ROLE = "iam_role"
    SERVICE_PRINCIPAL = "service_principal"
    USERNAME_PASSWORD = "username_password"
    CERTIFICATE = "certificate"


class ConnectorStatus(str, enum.Enum):
    CONNECTED = "connected"
    FAILED = "failed"
    PARTIAL_ACCESS = "partial_access"
    DISABLED = "disabled"
    PENDING = "pending"


class Connector(Base):
    __tablename__ = "connectors"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    org_id = Column(UUID(as_uuid=True), ForeignKey("organizations.id"), nullable=False)
    name = Column(String(255), nullable=False)
    connector_type = Column(Enum(ConnectorType), nullable=False)
    credential_type = Column(Enum(CredentialType), nullable=False)
    status = Column(Enum(ConnectorStatus), default=ConnectorStatus.PENDING)
    config = Column(JSON, default=dict)  # non-sensitive config (regions, scope, etc.)
    scan_scope = Column(JSON, default=dict)  # which buckets/dbs/paths to scan
    schedule_cron = Column(String(100), nullable=True)  # cron expression
    incremental_sync = Column(Boolean, default=True)
    timeout_seconds = Column(Integer, default=3600)
    retry_count = Column(Integer, default=3)
    last_sync_at = Column(DateTime(timezone=True), nullable=True)
    last_error = Column(Text, nullable=True)
    enabled = Column(Boolean, default=True)
    created_by = Column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())

    credentials = relationship("ConnectorCredential", back_populates="connector", cascade="all, delete-orphan")
    sync_logs = relationship("ConnectorSyncLog", back_populates="connector", cascade="all, delete-orphan")


class ConnectorCredential(Base):
    __tablename__ = "connector_credentials"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    connector_id = Column(UUID(as_uuid=True), ForeignKey("connectors.id", ondelete="CASCADE"), nullable=False)
    key_name = Column(String(255), nullable=False)  # e.g. "access_key", "client_secret"
    encrypted_value = Column(Text, nullable=False)  # Fernet-encrypted
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    connector = relationship("Connector", back_populates="credentials")


class ConnectorSyncLog(Base):
    __tablename__ = "connector_sync_logs"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    connector_id = Column(UUID(as_uuid=True), ForeignKey("connectors.id", ondelete="CASCADE"), nullable=False)
    started_at = Column(DateTime(timezone=True), server_default=func.now())
    finished_at = Column(DateTime(timezone=True), nullable=True)
    status = Column(String(50), default="running")  # running, success, failed, cancelled
    assets_discovered = Column(Integer, default=0)
    errors = Column(JSON, default=list)
    metadata = Column(JSON, default=dict)

    connector = relationship("Connector", back_populates="sync_logs")
