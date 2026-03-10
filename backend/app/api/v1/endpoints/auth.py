"""Authentication endpoints."""

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.api.deps import rate_limit_by_ip
from app.core.config import settings
from app.core.database import get_db
from app.core.security import validate_password_strength
from app.schemas.admin import UserCreate, UserLogin, TokenResponse, UserResponse
from app.services.admin.service import AdminService

router = APIRouter(prefix="/auth", tags=["Authentication"])


@router.post("/login", response_model=TokenResponse, dependencies=[Depends(rate_limit_by_ip)])
async def login(data: UserLogin, db: AsyncSession = Depends(get_db)):
    service = AdminService(db)
    result = await service.authenticate(data.email, data.password)
    if not result:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid credentials")
    return result


@router.post("/register", response_model=UserResponse, status_code=status.HTTP_201_CREATED, dependencies=[Depends(rate_limit_by_ip)])
async def register(data: UserCreate, db: AsyncSession = Depends(get_db)):
    if not settings.ALLOW_PUBLIC_REGISTRATION:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Public registration is disabled. Contact your administrator.",
        )

    # Enforce password complexity
    if data.password:
        password_errors = validate_password_strength(data.password)
        if password_errors:
            raise HTTPException(
                status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
                detail=password_errors,
            )

    service = AdminService(db)
    existing = await service.get_user_by_email(data.email)
    if existing:
        raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail="Email already registered")

    # Public registration always assigns read_only role
    from app.models.admin import SystemRole
    org = await service.create_organization(name="Default Organization", slug="default")
    user = await service.create_user(
        org_id=org.id,
        email=data.email,
        password=data.password,
        full_name=data.full_name,
        role=SystemRole.READ_ONLY,
    )
    return user
