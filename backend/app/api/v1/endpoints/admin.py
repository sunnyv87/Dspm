"""Admin & RBAC API endpoints."""

from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.api.deps import get_current_user, require_role
from app.core.database import get_db
from app.core.security import validate_password_strength
from app.schemas.admin import (
    UserCreate, UserResponse, OrganizationCreate, OrganizationResponse,
    RoleResponse, APITokenCreate, APITokenResponse,
)
from app.services.admin.service import AdminService

router = APIRouter(prefix="/admin", tags=["Admin & RBAC"])


@router.get("/users", response_model=list[UserResponse])
async def list_users(
    current_user: dict = Depends(require_role("super_admin", "org_admin")),
    db: AsyncSession = Depends(get_db),
):
    service = AdminService(db)
    return await service.list_users(current_user["org_id"])


@router.post("/users", response_model=UserResponse, status_code=status.HTTP_201_CREATED)
async def create_user(
    data: UserCreate,
    current_user: dict = Depends(require_role("super_admin", "org_admin")),
    db: AsyncSession = Depends(get_db),
):
    service = AdminService(db)
    existing = await service.get_user_by_email(data.email)
    if existing:
        raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail="User already exists")

    # Enforce password complexity
    if data.password:
        password_errors = validate_password_strength(data.password)
        if password_errors:
            raise HTTPException(status_code=status.HTTP_422_UNPROCESSABLE_ENTITY, detail=password_errors)

    user = await service.create_user(
        org_id=current_user["org_id"],
        email=data.email,
        password=data.password,
        full_name=data.full_name,
        role=data.role,
    )
    return user


@router.get("/users/{user_id}", response_model=UserResponse)
async def get_user(
    user_id: UUID,
    current_user: dict = Depends(require_role("super_admin", "org_admin")),
    db: AsyncSession = Depends(get_db),
):
    service = AdminService(db)
    user = await service.get_user(user_id, org_id=current_user["org_id"])
    if not user:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="User not found")
    return user


@router.delete("/users/{user_id}", status_code=status.HTTP_204_NO_CONTENT)
async def deactivate_user(
    user_id: UUID,
    current_user: dict = Depends(require_role("super_admin", "org_admin")),
    db: AsyncSession = Depends(get_db),
):
    service = AdminService(db)
    await service.deactivate_user(user_id, org_id=current_user["org_id"])


@router.get("/roles", response_model=list[RoleResponse])
async def list_roles(
    current_user: dict = Depends(require_role("super_admin", "org_admin")),
    db: AsyncSession = Depends(get_db),
):
    service = AdminService(db)
    return await service.list_roles(current_user["org_id"])


@router.post("/api-tokens", status_code=status.HTTP_201_CREATED)
async def create_api_token(
    data: APITokenCreate,
    current_user: dict = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    service = AdminService(db)
    result = await service.create_api_token(
        org_id=current_user["org_id"],
        user_id=current_user["user_id"],
        name=data.name,
        scopes=data.scopes,
        expires_in_days=data.expires_in_days,
    )
    return result


@router.get("/api-tokens", response_model=list[APITokenResponse])
async def list_api_tokens(
    current_user: dict = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    service = AdminService(db)
    return await service.list_api_tokens(current_user["org_id"])


@router.delete("/api-tokens/{token_id}", status_code=status.HTTP_204_NO_CONTENT)
async def revoke_token(
    token_id: UUID,
    current_user: dict = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    service = AdminService(db)
    await service.revoke_api_token(token_id, org_id=current_user["org_id"])
