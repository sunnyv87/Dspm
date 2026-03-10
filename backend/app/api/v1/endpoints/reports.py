"""Reporting & Dashboard API endpoints."""

from uuid import UUID

from fastapi import APIRouter, Depends, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.api.deps import get_current_user
from app.core.database import get_db
from app.schemas.reporting import (
    ReportCreate, ReportResponse, DashboardResponse,
    ExecutiveSummary,
)
from app.services.reporting.service import ReportingService

router = APIRouter(prefix="/reports", tags=["Reporting & Dashboards"])


@router.get("/executive-summary", response_model=ExecutiveSummary)
async def executive_summary(
    current_user: dict = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    service = ReportingService(db)
    return await service.get_executive_summary(current_user["org_id"])


@router.post("/", response_model=ReportResponse, status_code=status.HTTP_201_CREATED)
async def create_report(
    data: ReportCreate,
    current_user: dict = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    service = ReportingService(db)
    report_data = data.model_dump()
    report_data["generated_by"] = current_user["user_id"]
    report = await service.create_report(current_user["org_id"], report_data)
    return report


@router.get("/", response_model=list[ReportResponse])
async def list_reports(
    current_user: dict = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    service = ReportingService(db)
    return await service.list_reports(current_user["org_id"])


@router.get("/{report_id}", response_model=ReportResponse)
async def get_report(
    report_id: UUID,
    current_user: dict = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    service = ReportingService(db)
    report = await service.get_report(report_id)
    return report


@router.get("/dashboards/", response_model=list[DashboardResponse])
async def list_dashboards(
    current_user: dict = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    service = ReportingService(db)
    return await service.get_dashboards(current_user["org_id"])
