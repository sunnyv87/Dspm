"""Models for Classification Engine (Module 3.3)."""

import enum
import uuid

from sqlalchemy import (
    Column, String, Text, DateTime, Enum, ForeignKey, Boolean, Float, JSON, func,
)
from sqlalchemy.dialects.postgresql import UUID

from app.core.database import Base


class DataCategory(str, enum.Enum):
    PII = "pii"
    FINANCIAL = "financial"
    HEALTH = "health"
    AUTH_SECRETS = "auth_secrets"
    SOURCE_CODE_SECRETS = "source_code_secrets"
    BUSINESS_CONFIDENTIAL = "business_confidential"
    CONTRACTS = "contracts"
    HR_PAYROLL = "hr_payroll"
    # India-specific
    PAN = "pan"
    AADHAAR = "aadhaar"
    PASSPORT = "passport"
    DRIVING_LICENCE = "driving_licence"
    GSTIN = "gstin"
    CIN = "cin"
    BANK_ACCOUNT = "bank_account"
    IFSC = "ifsc"
    UPI_ID = "upi_id"
    VOTER_ID = "voter_id"
    EMPLOYEE_ID = "employee_id"
    CUSTOMER_KYC = "customer_kyc"


class ClassificationLevel(str, enum.Enum):
    PUBLIC = "public"
    INTERNAL = "internal"
    CONFIDENTIAL = "confidential"
    RESTRICTED = "restricted"
    HIGHLY_SENSITIVE = "highly_sensitive"


class DetectionMethod(str, enum.Enum):
    REGEX = "regex"
    DICTIONARY = "dictionary"
    KEYWORD = "keyword"
    ML_NLP = "ml_nlp"
    METADATA = "metadata"
    CUSTOM = "custom"


class ClassificationRule(Base):
    __tablename__ = "classification_rules"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    org_id = Column(UUID(as_uuid=True), ForeignKey("organizations.id"), nullable=True)
    name = Column(String(255), nullable=False)
    description = Column(Text, nullable=True)
    category = Column(Enum(DataCategory), nullable=False)
    detection_method = Column(Enum(DetectionMethod), nullable=False)
    pattern = Column(Text, nullable=True)  # regex pattern
    keywords = Column(JSON, nullable=True)  # keyword list
    dictionary_ref = Column(String(255), nullable=True)
    default_level = Column(Enum(ClassificationLevel), default=ClassificationLevel.CONFIDENTIAL)
    enabled = Column(Boolean, default=True)
    is_builtin = Column(Boolean, default=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())


class ClassificationResult(Base):
    __tablename__ = "classification_results"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    asset_id = Column(UUID(as_uuid=True), ForeignKey("assets.id"), nullable=False)
    scan_job_id = Column(UUID(as_uuid=True), ForeignKey("scan_jobs.id"), nullable=False)
    rule_id = Column(UUID(as_uuid=True), ForeignKey("classification_rules.id"), nullable=False)
    category = Column(Enum(DataCategory), nullable=False)
    classification_level = Column(Enum(ClassificationLevel), nullable=False)
    detection_method = Column(Enum(DetectionMethod), nullable=False)
    confidence_score = Column(Float, nullable=False)
    matched_pattern = Column(Text, nullable=True)
    matched_keyword = Column(String(500), nullable=True)
    column_name = Column(String(255), nullable=True)  # for DB column-level classification
    sample_count = Column(Float, default=0)
    false_positive = Column(Boolean, default=False)
    feedback_notes = Column(Text, nullable=True)
    detected_at = Column(DateTime(timezone=True), server_default=func.now())


class CustomClassifier(Base):
    __tablename__ = "custom_classifiers"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    org_id = Column(UUID(as_uuid=True), ForeignKey("organizations.id"), nullable=False)
    name = Column(String(255), nullable=False)
    description = Column(Text, nullable=True)
    label = Column(String(100), nullable=False)
    detection_method = Column(Enum(DetectionMethod), nullable=False)
    config = Column(JSON, nullable=False)  # patterns, keywords, model ref
    default_level = Column(Enum(ClassificationLevel), default=ClassificationLevel.CONFIDENTIAL)
    enabled = Column(Boolean, default=True)
    created_by = Column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())
