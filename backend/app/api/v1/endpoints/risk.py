"""Risk Scoring API endpoints."""

from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession

from app.api.deps import get_current_user
from app.core.database import get_db
from app.schemas.risk import RiskScoreResponse, RiskHistoryResponse, RiskTrendRequest
from app.services.risk.service import RiskScoringService

router = APIRouter(prefix="/risk", tags=["Risk Scoring"])


@router.get("/summary")
async def get_risk_summary(
    current_user: dict = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    service = RiskScoringService(db)
    return await service.get_org_risk_summary(current_user["org_id"])


@router.post("/trend")
async def get_risk_trend(
    data: RiskTrendRequest,
    current_user: dict = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    service = RiskScoringService(db)
    trend = await service.get_risk_trend(
        current_user["org_id"], data.scope, data.scope_id, data.days
    )
    return {"trend": trend}
