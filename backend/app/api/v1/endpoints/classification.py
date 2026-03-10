"""Classification API endpoints."""

from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.api.deps import get_current_user, require_role
from app.core.database import get_db
from app.schemas.classification import (
    ClassificationRuleCreate, ClassificationRuleResponse,
    ClassificationResultResponse, FalsePositiveFeedback,
    CustomClassifierCreate,
)
from app.services.classification.service import ClassificationService

router = APIRouter(prefix="/classification", tags=["Classification"])


@router.get("/rules", response_model=list[ClassificationRuleResponse])
async def list_rules(
    current_user: dict = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    service = ClassificationService(db)
    return await service.get_active_rules(current_user["org_id"])


@router.post("/rules", response_model=ClassificationRuleResponse, status_code=status.HTTP_201_CREATED)
async def create_rule(
    data: ClassificationRuleCreate,
    current_user: dict = Depends(require_role("super_admin", "org_admin", "security_analyst")),
    db: AsyncSession = Depends(get_db),
):
    service = ClassificationService(db)
    rule = await service.create_rule(current_user["org_id"], data.model_dump())
    return rule


@router.get("/results/{asset_id}", response_model=list[ClassificationResultResponse])
async def get_results(
    asset_id: UUID,
    current_user: dict = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    service = ClassificationService(db)
    return await service.get_results_for_asset(asset_id)


@router.post("/feedback")
async def submit_feedback(
    data: FalsePositiveFeedback,
    current_user: dict = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    service = ClassificationService(db)
    await service.mark_false_positive(data.classification_result_id, data.notes)
    return {"status": "feedback recorded"}
