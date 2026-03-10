"""Alerting & Workflow API endpoints."""

from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.ext.asyncio import AsyncSession

from app.api.deps import get_current_user, require_role
from app.core.database import get_db
from app.models.alerting import AlertSeverity, AlertStatus, AlertType
from app.schemas.alerting import (
    AlertResponse, AlertUpdateStatus, AlertAssign,
    AlertCommentCreate, RemediationTaskCreate, RemediationTaskResponse,
    AlertFilter,
)
from app.services.alerting.service import AlertingService

router = APIRouter(prefix="/alerts", tags=["Alerting & Workflow"])


@router.get("/", response_model=dict)
async def list_alerts(
    severity: AlertSeverity = None,
    alert_status: AlertStatus = None,
    alert_type: AlertType = None,
    page: int = Query(1, ge=1),
    page_size: int = Query(50, ge=1, le=200),
    current_user: dict = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    service = AlertingService(db)
    filters = AlertFilter(severity=severity, status=alert_status, alert_type=alert_type, page=page, page_size=page_size)
    alerts, total = await service.list_alerts(current_user["org_id"], filters)
    return {"items": alerts, "total": total, "page": page, "page_size": page_size}


@router.get("/{alert_id}", response_model=AlertResponse)
async def get_alert(
    alert_id: UUID,
    current_user: dict = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    service = AlertingService(db)
    alert = await service.get_alert(alert_id)
    if not alert:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Alert not found")
    return alert


@router.patch("/{alert_id}/status")
async def update_alert_status(
    alert_id: UUID,
    data: AlertUpdateStatus,
    current_user: dict = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    service = AlertingService(db)
    await service.update_status(alert_id, data.status, current_user["user_id"], data.comment)
    return {"status": "updated"}


@router.patch("/{alert_id}/assign")
async def assign_alert(
    alert_id: UUID,
    data: AlertAssign,
    current_user: dict = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    service = AlertingService(db)
    await service.assign_alert(alert_id, data.assigned_to)
    return {"status": "assigned"}


@router.post("/{alert_id}/comments")
async def add_comment(
    alert_id: UUID,
    data: AlertCommentCreate,
    current_user: dict = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    service = AlertingService(db)
    comment = await service.add_comment(alert_id, current_user["user_id"], data.comment)
    return {"id": comment.id, "comment": comment.comment}


@router.post("/remediation", response_model=RemediationTaskResponse, status_code=status.HTTP_201_CREATED)
async def create_remediation_task(
    data: RemediationTaskCreate,
    current_user: dict = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    service = AlertingService(db)
    task_data = data.model_dump()
    task_data["org_id"] = current_user["org_id"]
    task = await service.create_remediation_task(task_data)
    return task
