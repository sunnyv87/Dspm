"""Connector management API endpoints."""

from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.api.deps import get_current_user, require_role
from app.core.database import get_db
from app.schemas.connector import (
    ConnectorCreate, ConnectorUpdate, ConnectorResponse,
    ConnectorTestRequest, ConnectorHealthResponse, ConnectorSyncLogResponse,
)
from app.services.connector.service import ConnectorService

router = APIRouter(prefix="/connectors", tags=["Connectors"])


@router.post("/", response_model=ConnectorResponse, status_code=status.HTTP_201_CREATED)
async def create_connector(
    data: ConnectorCreate,
    current_user: dict = Depends(require_role("super_admin", "org_admin")),
    db: AsyncSession = Depends(get_db),
):
    service = ConnectorService(db)
    connector = await service.create_connector(current_user["org_id"], data)
    return connector


@router.get("/", response_model=list[ConnectorResponse])
async def list_connectors(
    current_user: dict = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    service = ConnectorService(db)
    return await service.list_connectors(current_user["org_id"])


@router.get("/{connector_id}", response_model=ConnectorResponse)
async def get_connector(
    connector_id: UUID,
    current_user: dict = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    service = ConnectorService(db)
    connector = await service.get_connector(connector_id)
    if not connector:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Connector not found")
    return connector


@router.patch("/{connector_id}", response_model=ConnectorResponse)
async def update_connector(
    connector_id: UUID,
    data: ConnectorUpdate,
    current_user: dict = Depends(require_role("super_admin", "org_admin")),
    db: AsyncSession = Depends(get_db),
):
    service = ConnectorService(db)
    connector = await service.update_connector(connector_id, data)
    if not connector:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Connector not found")
    return connector


@router.delete("/{connector_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_connector(
    connector_id: UUID,
    current_user: dict = Depends(require_role("super_admin", "org_admin")),
    db: AsyncSession = Depends(get_db),
):
    service = ConnectorService(db)
    deleted = await service.delete_connector(connector_id)
    if not deleted:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Connector not found")


@router.post("/test", response_model=dict)
async def test_connectivity(
    data: ConnectorTestRequest,
    current_user: dict = Depends(require_role("super_admin", "org_admin")),
    db: AsyncSession = Depends(get_db),
):
    service = ConnectorService(db)
    return await service.test_connectivity(data)


@router.get("/{connector_id}/health", response_model=ConnectorHealthResponse)
async def get_health(
    connector_id: UUID,
    current_user: dict = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    service = ConnectorService(db)
    health = await service.get_health(connector_id)
    if not health:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Connector not found")
    return health
