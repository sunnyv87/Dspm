"""Authentication endpoints."""

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.database import get_db
from app.schemas.admin import UserCreate, UserLogin, TokenResponse, UserResponse
from app.services.admin.service import AdminService

router = APIRouter(prefix="/auth", tags=["Authentication"])


@router.post("/login", response_model=TokenResponse)
async def login(data: UserLogin, db: AsyncSession = Depends(get_db)):
    service = AdminService(db)
    result = await service.authenticate(data.email, data.password)
    if not result:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid credentials")
    return result


@router.post("/register", response_model=UserResponse, status_code=status.HTTP_201_CREATED)
async def register(data: UserCreate, db: AsyncSession = Depends(get_db)):
    service = AdminService(db)
    existing = await service.get_user_by_email(data.email)
    if existing:
        raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail="Email already registered")

    # For first user, create default org
    from app.models.admin import SystemRole
    org = await service.create_organization(name="Default Organization", slug="default")
    user = await service.create_user(
        org_id=org.id,
        email=data.email,
        password=data.password,
        full_name=data.full_name,
        role=data.role,
    )
    return user
