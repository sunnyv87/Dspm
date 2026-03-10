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
from app.services.inventory.service import AssetInventoryService

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
    # Build from explicit fields only (prevents mass assignment)
    rule = await service.create_rule(current_user["org_id"], {
        "name": data.name,
        "description": data.description,
        "category": data.category,
        "detection_method": data.detection_method,
        "pattern": data.pattern,
        "keywords": data.keywords,
        "dictionary_ref": data.dictionary_ref,
        "default_level": data.default_level,
        "enabled": data.enabled,
    })
    return rule


@router.get("/results/{asset_id}", response_model=list[ClassificationResultResponse])
async def get_results(
    asset_id: UUID,
    current_user: dict = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    # Verify asset belongs to user's org
    inv_service = AssetInventoryService(db)
    asset = await inv_service.get_asset(asset_id, org_id=current_user["org_id"])
    if not asset:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Asset not found")
    service = ClassificationService(db)
    return await service.get_results_for_asset(asset_id)


@router.post("/feedback")
async def submit_feedback(
    data: FalsePositiveFeedback,
    current_user: dict = Depends(require_role("super_admin", "org_admin", "security_analyst")),
    db: AsyncSession = Depends(get_db),
):
    service = ClassificationService(db)
    result = await service.get_result_by_id(data.classification_result_id, org_id=current_user["org_id"])
    if not result:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Classification result not found")
    await service.mark_false_positive(data.classification_result_id, data.notes)
    return {"status": "feedback recorded"}
