"""Pydantic schemas for Risk Scoring Engine."""

from datetime import datetime
from typing import Optional
from uuid import UUID

from pydantic import BaseModel


class RiskScoreResponse(BaseModel):
    id: UUID
    asset_id: UUID
    overall_score: float
    risk_level: str
    contributing_factors: list
    compliance_impact: list
    recommended_remediation: list
    calculated_at: datetime

    model_config = {"from_attributes": True}


class RiskFactorUpdate(BaseModel):
    name: Optional[str] = None
    weight: Optional[float] = None
    description: Optional[str] = None


class RiskHistoryResponse(BaseModel):
    id: UUID
    scope: str
    scope_id: Optional[str]
    score: float
    risk_level: str
    recorded_at: datetime

    model_config = {"from_attributes": True}


class RiskTrendRequest(BaseModel):
    scope: str = "org"  # org, business_unit, connector, asset
    scope_id: Optional[str] = None
    days: int = 30
