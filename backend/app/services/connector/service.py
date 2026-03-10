"""Connector & Ingestion Engine service (Module 3.1)."""

import logging
from typing import Optional
from uuid import UUID

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.security import credential_encryptor
from app.models.connector import (
    Connector, ConnectorCredential, ConnectorSyncLog, ConnectorStatus,
)
from app.schemas.connector import ConnectorCreate, ConnectorUpdate
from app.services.connector.handlers import (
    BaseConnectorHandler,
    ConnectorHandlerFactory,
    _is_internal_address,
)

logger = logging.getLogger(__name__)

# Allowlisted fields for connector updates (prevents mass assignment)
_UPDATABLE_FIELDS = {"name", "config", "scan_scope", "schedule_cron", "incremental_sync", "timeout_seconds", "retry_count", "enabled"}


class ConnectorService:
    def __init__(self, db: AsyncSession):
        self.db = db

    async def create_connector(self, org_id: UUID, data: ConnectorCreate) -> Connector:
        connector = Connector(
            org_id=org_id,
            name=data.name,
            connector_type=data.connector_type,
            credential_type=data.credential_type,
            config=data.config,
            scan_scope=data.scan_scope,
            schedule_cron=data.schedule_cron,
            incremental_sync=data.incremental_sync,
            timeout_seconds=data.timeout_seconds,
            retry_count=data.retry_count,
        )
        self.db.add(connector)
        await self.db.flush()

        for cred in data.credentials:
            encrypted_value = credential_encryptor.encrypt(cred.value)
            credential = ConnectorCredential(
                connector_id=connector.id,
                key_name=cred.key_name,
                encrypted_value=encrypted_value,
            )
            self.db.add(credential)

        await self.db.flush()
        return connector

    async def get_connector(self, connector_id: UUID, org_id: UUID) -> Optional[Connector]:
        """Get a connector with tenant isolation."""
        result = await self.db.execute(
            select(Connector).where(Connector.id == connector_id, Connector.org_id == org_id)
        )
        return result.scalar_one_or_none()

    async def list_connectors(self, org_id: UUID) -> list[Connector]:
        result = await self.db.execute(
            select(Connector).where(Connector.org_id == org_id).order_by(Connector.created_at.desc())
        )
        return list(result.scalars().all())

    async def update_connector(self, connector_id: UUID, org_id: UUID, data: ConnectorUpdate) -> Optional[Connector]:
        """Update a connector with tenant isolation and field allowlisting."""
        connector = await self.get_connector(connector_id, org_id)
        if not connector:
            return None
        update_data = data.model_dump(exclude_unset=True)
        for field, value in update_data.items():
            if field in _UPDATABLE_FIELDS:
                setattr(connector, field, value)
        await self.db.flush()
        return connector

    async def delete_connector(self, connector_id: UUID, org_id: UUID) -> bool:
        """Delete a connector with tenant isolation."""
        connector = await self.get_connector(connector_id, org_id)
        if not connector:
            return False
        await self.db.delete(connector)
        await self.db.flush()
        return True

    async def test_connectivity(self, data) -> dict:
        """Test connector connectivity without persisting."""
        # Validate host is not internal (SSRF protection)
        config_host = data.config.get("host") or ""
        if config_host and _is_internal_address(config_host):
            return {"success": False, "message": "Connection to internal/private addresses is not allowed"}

        handler = ConnectorHandlerFactory.get_handler(data.connector_type)
        creds = {c.key_name: c.value for c in data.credentials}
        return await handler.test_connection(data.config, creds)

    async def update_status(self, connector_id: UUID, org_id: UUID, status: ConnectorStatus, error: Optional[str] = None):
        connector = await self.get_connector(connector_id, org_id)
        if connector:
            connector.status = status
            connector.last_error = error
            await self.db.flush()

    async def get_health(self, connector_id: UUID, org_id: UUID) -> dict:
        connector = await self.get_connector(connector_id, org_id)
        if not connector:
            return None
        return {
            "connector_id": connector.id,
            "status": connector.status,
            "last_sync_at": connector.last_sync_at,
            "last_error": connector.last_error,
            "is_healthy": connector.status == ConnectorStatus.CONNECTED,
        }
