"""Connector & Ingestion Engine service (Module 3.1)."""

from typing import Optional
from uuid import UUID

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.security import credential_encryptor
from app.models.connector import (
    Connector, ConnectorCredential, ConnectorSyncLog, ConnectorStatus,
)
from app.schemas.connector import ConnectorCreate, ConnectorUpdate


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

    async def get_connector(self, connector_id: UUID) -> Optional[Connector]:
        result = await self.db.execute(
            select(Connector).where(Connector.id == connector_id)
        )
        return result.scalar_one_or_none()

    async def list_connectors(self, org_id: UUID) -> list[Connector]:
        result = await self.db.execute(
            select(Connector).where(Connector.org_id == org_id).order_by(Connector.created_at.desc())
        )
        return list(result.scalars().all())

    async def update_connector(self, connector_id: UUID, data: ConnectorUpdate) -> Optional[Connector]:
        connector = await self.get_connector(connector_id)
        if not connector:
            return None
        update_data = data.model_dump(exclude_unset=True)
        for field, value in update_data.items():
            setattr(connector, field, value)
        await self.db.flush()
        return connector

    async def delete_connector(self, connector_id: UUID) -> bool:
        connector = await self.get_connector(connector_id)
        if not connector:
            return False
        await self.db.delete(connector)
        await self.db.flush()
        return True

    async def test_connectivity(self, data) -> dict:
        """Test connector connectivity without persisting."""
        # Dispatch to appropriate connector handler
        handler = ConnectorHandlerFactory.get_handler(data.connector_type)
        creds = {c.key_name: c.value for c in data.credentials}
        return await handler.test_connection(data.config, creds)

    async def update_status(self, connector_id: UUID, status: ConnectorStatus, error: Optional[str] = None):
        connector = await self.get_connector(connector_id)
        if connector:
            connector.status = status
            connector.last_error = error
            await self.db.flush()

    async def get_health(self, connector_id: UUID) -> dict:
        connector = await self.get_connector(connector_id)
        if not connector:
            return None
        return {
            "connector_id": connector.id,
            "status": connector.status,
            "last_sync_at": connector.last_sync_at,
            "last_error": connector.last_error,
            "is_healthy": connector.status == ConnectorStatus.CONNECTED,
        }


class BaseConnectorHandler:
    """Base class for connector-specific handlers."""

    async def test_connection(self, config: dict, credentials: dict) -> dict:
        raise NotImplementedError

    async def list_assets(self, config: dict, credentials: dict) -> list:
        raise NotImplementedError

    async def fetch_metadata(self, config: dict, credentials: dict, asset_path: str) -> dict:
        raise NotImplementedError


class AWSS3Handler(BaseConnectorHandler):
    async def test_connection(self, config: dict, credentials: dict) -> dict:
        try:
            import boto3
            session = boto3.Session(
                aws_access_key_id=credentials.get("access_key"),
                aws_secret_access_key=credentials.get("secret_key"),
                region_name=config.get("region", "us-east-1"),
            )
            s3 = session.client("s3")
            s3.list_buckets()
            return {"success": True, "message": "Connected to AWS S3 successfully"}
        except Exception as e:
            return {"success": False, "message": str(e)}


class AzureBlobHandler(BaseConnectorHandler):
    async def test_connection(self, config: dict, credentials: dict) -> dict:
        try:
            from azure.storage.blob import BlobServiceClient
            connection_string = credentials.get("connection_string")
            client = BlobServiceClient.from_connection_string(connection_string)
            list(client.list_containers(max_results=1))
            return {"success": True, "message": "Connected to Azure Blob Storage successfully"}
        except Exception as e:
            return {"success": False, "message": str(e)}


class GCSHandler(BaseConnectorHandler):
    async def test_connection(self, config: dict, credentials: dict) -> dict:
        try:
            from google.cloud import storage
            client = storage.Client(project=config.get("project_id"))
            list(client.list_buckets(max_results=1))
            return {"success": True, "message": "Connected to Google Cloud Storage successfully"}
        except Exception as e:
            return {"success": False, "message": str(e)}


class PostgreSQLHandler(BaseConnectorHandler):
    async def test_connection(self, config: dict, credentials: dict) -> dict:
        try:
            import asyncpg
            conn = await asyncpg.connect(
                host=config.get("host"),
                port=config.get("port", 5432),
                user=credentials.get("username"),
                password=credentials.get("password"),
                database=config.get("database"),
            )
            await conn.execute("SELECT 1")
            await conn.close()
            return {"success": True, "message": "Connected to PostgreSQL successfully"}
        except Exception as e:
            return {"success": False, "message": str(e)}


class ConnectorHandlerFactory:
    _handlers = {
        "aws_s3": AWSS3Handler,
        "azure_blob": AzureBlobHandler,
        "gcs": GCSHandler,
        "postgresql": PostgreSQLHandler,
    }

    @classmethod
    def get_handler(cls, connector_type: str) -> BaseConnectorHandler:
        handler_class = cls._handlers.get(connector_type)
        if not handler_class:
            return BaseConnectorHandler()
        return handler_class()
