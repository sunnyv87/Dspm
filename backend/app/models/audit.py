"""Models for Audit & Logging Module (Module 3.11)."""

import uuid

from sqlalchemy import Column, String, Text, DateTime, ForeignKey, JSON, func
from sqlalchemy.dialects.postgresql import UUID

from app.core.database import Base


class AuditLog(Base):
    __tablename__ = "audit_logs"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    org_id = Column(UUID(as_uuid=True), ForeignKey("organizations.id"), nullable=False)
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=True)
    action = Column(String(100), nullable=False)  # e.g. user.login, connector.create, scan.trigger
    module = Column(String(100), nullable=False)
    resource_type = Column(String(100), nullable=True)
    resource_id = Column(String(255), nullable=True)
    description = Column(Text, nullable=True)
    details = Column(JSON, default=dict)  # before/after state, parameters
    ip_address = Column(String(50), nullable=True)
    user_agent = Column(String(500), nullable=True)
    status = Column(String(50), default="success")  # success, failure
    created_at = Column(DateTime(timezone=True), server_default=func.now())
