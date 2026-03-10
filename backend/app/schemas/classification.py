"""Pydantic schemas for Classification Engine."""

from datetime import datetime
from typing import Optional
from uuid import UUID

from pydantic import BaseModel, Field

from app.models.classification import (
    DataCategory, ClassificationLevel, DetectionMethod,
)


class ClassificationRuleCreate(BaseModel):
    name: str = Field(..., min_length=1, max_length=255)
    description: Optional[str] = None
    category: DataCategory
    detection_method: DetectionMethod
    pattern: Optional[str] = None
    keywords: Optional[list[str]] = None
    dictionary_ref: Optional[str] = None
    default_level: ClassificationLevel = ClassificationLevel.CONFIDENTIAL
    enabled: bool = True


class ClassificationRuleResponse(BaseModel):
    id: UUID
    name: str
    description: Optional[str]
    category: DataCategory
    detection_method: DetectionMethod
    pattern: Optional[str]
    keywords: Optional[list]
    default_level: ClassificationLevel
    enabled: bool
    is_builtin: bool
    created_at: datetime

    model_config = {"from_attributes": True}


class ClassificationResultResponse(BaseModel):
    id: UUID
    asset_id: UUID
    scan_job_id: UUID
    rule_id: UUID
    category: DataCategory
    classification_level: ClassificationLevel
    detection_method: DetectionMethod
    confidence_score: float
    matched_pattern: Optional[str]
    matched_keyword: Optional[str]
    column_name: Optional[str]
    false_positive: bool
    detected_at: datetime

    model_config = {"from_attributes": True}


class FalsePositiveFeedback(BaseModel):
    classification_result_id: UUID
    is_false_positive: bool
    notes: Optional[str] = None


class CustomClassifierCreate(BaseModel):
    name: str
    description: Optional[str] = None
    label: str
    detection_method: DetectionMethod
    config: dict
    default_level: ClassificationLevel = ClassificationLevel.CONFIDENTIAL
