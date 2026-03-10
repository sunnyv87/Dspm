"""Pydantic schemas for Policy & Compliance Engine."""

from datetime import datetime
from typing import Optional
from uuid import UUID

from pydantic import BaseModel, Field

from app.models.policy import FrameworkType, PolicySeverity, ViolationStatus


class ComplianceFrameworkResponse(BaseModel):
    id: UUID
    framework_type: FrameworkType
    name: str
    version: Optional[str]
    description: Optional[str]
    controls: list
    is_builtin: bool
    enabled: bool
    created_at: datetime

    model_config = {"from_attributes": True}


class PolicyRuleCreate(BaseModel):
    name: str = Field(..., min_length=1, max_length=255)
    description: Optional[str] = None
    framework_id: Optional[UUID] = None
    severity: PolicySeverity = PolicySeverity.MEDIUM
    condition: dict
    control_mapping: list = Field(default_factory=list)
    remediation_suggestion: Optional[str] = None
    continuous_monitoring: bool = True


class PolicyRuleResponse(BaseModel):
    id: UUID
    name: str
    description: Optional[str]
    framework_id: Optional[UUID]
    severity: PolicySeverity
    condition: dict
    control_mapping: list
    remediation_suggestion: Optional[str]
    is_builtin: bool
    enabled: bool
    continuous_monitoring: bool
    created_at: datetime

    model_config = {"from_attributes": True}


class PolicyViolationResponse(BaseModel):
    id: UUID
    policy_rule_id: UUID
    asset_id: Optional[UUID]
    severity: PolicySeverity
    status: ViolationStatus
    description: Optional[str]
    evidence: dict
    remediation_suggestion: Optional[str]
    detected_at: datetime
    resolved_at: Optional[datetime]

    model_config = {"from_attributes": True}


class ExceptionApproval(BaseModel):
    violation_id: UUID
    reason: str
