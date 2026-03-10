"""Policy & Compliance API endpoints."""

from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.api.deps import get_current_user, require_role
from app.core.database import get_db
from app.models.policy import ViolationStatus
from app.schemas.policy import (
    PolicyRuleCreate, PolicyRuleResponse,
    PolicyViolationResponse, ComplianceFrameworkResponse,
    ExceptionApproval,
)
from app.services.policy.service import PolicyComplianceService

router = APIRouter(prefix="/policies", tags=["Policy & Compliance"])


@router.get("/rules", response_model=list[PolicyRuleResponse])
async def list_rules(
    current_user: dict = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    service = PolicyComplianceService(db)
    return await service.get_active_rules(current_user["org_id"])


@router.post("/rules", response_model=PolicyRuleResponse, status_code=status.HTTP_201_CREATED)
async def create_rule(
    data: PolicyRuleCreate,
    current_user: dict = Depends(require_role("super_admin", "org_admin", "compliance_officer")),
    db: AsyncSession = Depends(get_db),
):
    service = PolicyComplianceService(db)
    # Build from explicit fields only (prevents mass assignment)
    rule = await service.create_policy_rule(current_user["org_id"], {
        "name": data.name,
        "description": data.description,
        "framework_id": data.framework_id,
        "severity": data.severity,
        "condition": data.condition,
        "control_mapping": data.control_mapping,
        "remediation_suggestion": data.remediation_suggestion,
        "continuous_monitoring": data.continuous_monitoring,
    })
    return rule


@router.get("/violations", response_model=list[PolicyViolationResponse])
async def list_violations(
    status_filter: ViolationStatus = None,
    current_user: dict = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    service = PolicyComplianceService(db)
    return await service.get_violations(current_user["org_id"], status_filter)


@router.post("/violations/exception")
async def approve_exception(
    data: ExceptionApproval,
    current_user: dict = Depends(require_role("super_admin", "org_admin", "compliance_officer")),
    db: AsyncSession = Depends(get_db),
):
    service = PolicyComplianceService(db)
    # Verify violation belongs to this org
    violation = await service.get_violation(data.violation_id, org_id=current_user["org_id"])
    if not violation:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Violation not found")
    await service.approve_exception(data.violation_id, current_user["user_id"], data.reason)
    return {"status": "exception approved"}


@router.get("/compliance/coverage")
async def get_compliance_coverage(
    current_user: dict = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    service = PolicyComplianceService(db)
    return await service.get_compliance_coverage(current_user["org_id"])
