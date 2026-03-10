"""Pydantic schemas for Admin & RBAC Module."""

from datetime import datetime
from typing import Optional
from uuid import UUID

from pydantic import BaseModel, EmailStr, Field

from app.models.admin import SystemRole


class UserCreate(BaseModel):
    email: EmailStr
    password: Optional[str] = Field(None, min_length=8)
    full_name: Optional[str] = None
    role: SystemRole = SystemRole.READ_ONLY


class UserResponse(BaseModel):
    id: UUID
    org_id: UUID
    email: str
    full_name: Optional[str]
    is_active: bool
    is_sso: bool
    mfa_enabled: bool
    last_login_at: Optional[datetime]
    created_at: datetime

    model_config = {"from_attributes": True}


class UserLogin(BaseModel):
    email: EmailStr
    password: str


class TokenResponse(BaseModel):
    access_token: str
    refresh_token: str
    token_type: str = "bearer"


class OrganizationCreate(BaseModel):
    name: str = Field(..., min_length=1, max_length=255)
    slug: str = Field(..., min_length=1, max_length=100)


class OrganizationResponse(BaseModel):
    id: UUID
    name: str
    slug: str
    mfa_required: bool
    is_active: bool
    created_at: datetime

    model_config = {"from_attributes": True}


class RoleResponse(BaseModel):
    id: UUID
    name: str
    system_role: Optional[SystemRole]
    description: Optional[str]
    is_builtin: bool

    model_config = {"from_attributes": True}


class APITokenCreate(BaseModel):
    name: str
    scopes: list[str] = Field(default_factory=list)
    expires_in_days: Optional[int] = None


class APITokenResponse(BaseModel):
    id: UUID
    name: str
    token: Optional[str] = None  # only returned on creation
    scopes: list
    is_active: bool
    expires_at: Optional[datetime]
    created_at: datetime

    model_config = {"from_attributes": True}
