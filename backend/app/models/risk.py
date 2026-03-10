"""Models for Risk Scoring Engine (Module 3.6)."""

import uuid

from sqlalchemy import (
    Column, String, Text, DateTime, ForeignKey, Float, JSON, Integer, func,
)
from sqlalchemy.dialects.postgresql import UUID

from app.core.database import Base


class RiskScore(Base):
    __tablename__ = "risk_scores"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    asset_id = Column(UUID(as_uuid=True), ForeignKey("assets.id"), nullable=False)
    org_id = Column(UUID(as_uuid=True), ForeignKey("organizations.id"), nullable=False)
    overall_score = Column(Float, nullable=False)
    risk_level = Column(String(50), nullable=False)  # critical, high, medium, low, informational
    contributing_factors = Column(JSON, default=list)  # top factors
    compliance_impact = Column(JSON, default=list)
    recommended_remediation = Column(JSON, default=list)
    calculated_at = Column(DateTime(timezone=True), server_default=func.now())


class RiskFactor(Base):
    __tablename__ = "risk_factors"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    org_id = Column(UUID(as_uuid=True), ForeignKey("organizations.id"), nullable=True)
    name = Column(String(255), nullable=False)
    description = Column(Text, nullable=True)
    weight = Column(Float, default=1.0)
    category = Column(String(100), nullable=False)  # sensitivity, access, encryption, exposure, compliance
    is_builtin = Column(Boolean, default=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

from sqlalchemy import Boolean


class RiskHistory(Base):
    __tablename__ = "risk_history"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    asset_id = Column(UUID(as_uuid=True), ForeignKey("assets.id"), nullable=True)
    org_id = Column(UUID(as_uuid=True), ForeignKey("organizations.id"), nullable=False)
    scope = Column(String(100), default="asset")  # asset, business_unit, org, connector
    scope_id = Column(String(500), nullable=True)
    score = Column(Float, nullable=False)
    risk_level = Column(String(50), nullable=False)
    snapshot_data = Column(JSON, default=dict)
    recorded_at = Column(DateTime(timezone=True), server_default=func.now())
