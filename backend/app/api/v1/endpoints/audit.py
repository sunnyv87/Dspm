"""Audit & Logging API endpoints."""

from datetime import datetime
from uuid import UUID

from fastapi import APIRouter, Depends, Query
from sqlalchemy.ext.asyncio import AsyncSession

from app.api.deps import get_current_user, require_role
from app.core.database import get_db
from app.schemas.audit import AuditLogResponse, AuditLogFilter
from app.services.audit.service import AuditService

router = APIRouter(prefix="/audit", tags=["Audit & Logging"])


@router.get("/logs", response_model=dict)
async def search_logs(
    module: str = None,
    action: str = None,
    user_id: UUID = None,
    resource_type: str = None,
    start_date: datetime = None,
    end_date: datetime = None,
    page: int = Query(1, ge=1),
    page_size: int = Query(50, ge=1, le=200),
    current_user: dict = Depends(require_role("super_admin", "org_admin", "auditor")),
    db: AsyncSession = Depends(get_db),
):
    service = AuditService(db)
    filters = AuditLogFilter(
        module=module, action=action, user_id=user_id,
        resource_type=resource_type, start_date=start_date, end_date=end_date,
        page=page, page_size=page_size,
    )
    logs, total = await service.search(current_user["org_id"], filters)
    return {"items": logs, "total": total, "page": page, "page_size": page_size}


@router.get("/export")
async def export_logs(
    start_date: datetime = None,
    end_date: datetime = None,
    current_user: dict = Depends(require_role("super_admin", "org_admin", "auditor")),
    db: AsyncSession = Depends(get_db),
):
    service = AuditService(db)
    logs = await service.export_logs(current_user["org_id"], start_date, end_date)
    return {"count": len(logs), "logs": logs}
