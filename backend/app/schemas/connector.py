"""Pydantic schemas for Connector & Ingestion Engine."""

from datetime import datetime
from typing import Optional
from uuid import UUID

from pydantic import BaseModel, Field

from app.models.connector import ConnectorType, CredentialType, ConnectorStatus


class ConnectorCredentialCreate(BaseModel):
    key_name: str
    value: str  # plaintext, will be encrypted before storage


class ConnectorCreate(BaseModel):
    name: str = Field(..., min_length=1, max_length=255)
    connector_type: ConnectorType
    credential_type: CredentialType
    config: dict = Field(default_factory=dict)
    scan_scope: dict = Field(default_factory=dict)
    schedule_cron: Optional[str] = None
    incremental_sync: bool = True
    timeout_seconds: int = 3600
    retry_count: int = 3
    credentials: list[ConnectorCredentialCreate] = Field(default_factory=list)


class ConnectorUpdate(BaseModel):
    name: Optional[str] = None
    config: Optional[dict] = None
    scan_scope: Optional[dict] = None
    schedule_cron: Optional[str] = None
    incremental_sync: Optional[bool] = None
    timeout_seconds: Optional[int] = None
    retry_count: Optional[int] = None
    enabled: Optional[bool] = None


class ConnectorTestRequest(BaseModel):
    connector_type: ConnectorType
    credential_type: CredentialType
    config: dict = Field(default_factory=dict)
    credentials: list[ConnectorCredentialCreate] = Field(default_factory=list)


class ConnectorResponse(BaseModel):
    id: UUID
    org_id: UUID
    name: str
    connector_type: ConnectorType
    credential_type: CredentialType
    status: ConnectorStatus
    config: dict
    scan_scope: dict
    schedule_cron: Optional[str]
    incremental_sync: bool
    enabled: bool
    last_sync_at: Optional[datetime]
    last_error: Optional[str]
    created_at: datetime
    updated_at: datetime

    model_config = {"from_attributes": True}


class ConnectorSyncLogResponse(BaseModel):
    id: UUID
    connector_id: UUID
    started_at: datetime
    finished_at: Optional[datetime]
    status: str
    assets_discovered: int
    errors: list

    model_config = {"from_attributes": True}


class ConnectorHealthResponse(BaseModel):
    connector_id: UUID
    status: ConnectorStatus
    last_sync_at: Optional[datetime]
    last_error: Optional[str]
    is_healthy: bool
