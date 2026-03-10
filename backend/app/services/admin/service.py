"""Admin & RBAC Module service (Module 3.10)."""

import secrets
from datetime import datetime, timedelta, timezone
from typing import Optional
from uuid import UUID

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.security import hash_password, verify_password, create_access_token, create_refresh_token, validate_password_strength
from app.models.admin import User, Role, Organization, APIToken, SystemRole

# Dummy hash for constant-time comparison when user not found (prevents timing attacks)
_DUMMY_HASH = hash_password("dummy-password-for-timing-safety")


class AdminService:
    def __init__(self, db: AsyncSession):
        self.db = db

    # --- Organization ---
    async def create_organization(self, name: str, slug: str) -> Organization:
        org = Organization(name=name, slug=slug)
        self.db.add(org)
        await self.db.flush()
        return org

    async def get_organization(self, org_id: UUID) -> Optional[Organization]:
        result = await self.db.execute(select(Organization).where(Organization.id == org_id))
        return result.scalar_one_or_none()

    # --- User ---
    async def create_user(self, org_id: UUID, email: str, password: str = None, full_name: str = None, role: SystemRole = SystemRole.READ_ONLY) -> User:
        if password:
            errors = validate_password_strength(password)
            if errors:
                raise ValueError(f"Weak password: {'; '.join(errors)}")

        user = User(
            org_id=org_id,
            email=email,
            hashed_password=hash_password(password) if password else None,
            full_name=full_name,
        )
        self.db.add(user)
        await self.db.flush()

        # Assign role
        role_obj = await self._get_or_create_role(org_id, role)
        user.roles.append(role_obj)
        await self.db.flush()
        return user

    async def authenticate(self, email: str, password: str) -> Optional[dict]:
        result = await self.db.execute(select(User).where(User.email == email))
        user = result.scalar_one_or_none()

        if not user or not user.hashed_password:
            # Perform a dummy password check to prevent timing-based user enumeration
            verify_password(password, _DUMMY_HASH)
            return None

        if not user.is_active:
            verify_password(password, _DUMMY_HASH)
            return None

        if not verify_password(password, user.hashed_password):
            return None

        user.last_login_at = datetime.now(timezone.utc)
        await self.db.flush()

        roles = [r.system_role.value if r.system_role else r.name for r in user.roles]
        access_token = create_access_token(str(user.id), {"org_id": str(user.org_id), "roles": roles})
        refresh_token = create_refresh_token(str(user.id))

        return {
            "access_token": access_token,
            "refresh_token": refresh_token,
            "token_type": "bearer",
        }

    async def get_user(self, user_id: UUID, org_id: UUID = None) -> Optional[User]:
        query = select(User).where(User.id == user_id)
        if org_id:
            query = query.where(User.org_id == org_id)
        result = await self.db.execute(query)
        return result.scalar_one_or_none()

    async def get_user_by_email(self, email: str) -> Optional[User]:
        result = await self.db.execute(select(User).where(User.email == email))
        return result.scalar_one_or_none()

    async def list_users(self, org_id: UUID) -> list[User]:
        result = await self.db.execute(
            select(User).where(User.org_id == org_id).order_by(User.created_at.desc())
        )
        return list(result.scalars().all())

    async def deactivate_user(self, user_id: UUID, org_id: UUID):
        """Deactivate a user. Requires org_id for tenant isolation."""
        user = await self.get_user(user_id, org_id=org_id)
        if user:
            user.is_active = False
            await self.db.flush()

    # --- Roles ---
    async def _get_or_create_role(self, org_id: UUID, system_role: SystemRole) -> Role:
        result = await self.db.execute(
            select(Role).where(Role.system_role == system_role, Role.org_id == org_id)
        )
        role = result.scalar_one_or_none()
        if not role:
            role = Role(
                org_id=org_id,
                name=system_role.value,
                system_role=system_role,
                is_builtin=True,
            )
            self.db.add(role)
            await self.db.flush()
        return role

    async def list_roles(self, org_id: UUID) -> list[Role]:
        result = await self.db.execute(
            select(Role).where((Role.org_id == org_id) | (Role.org_id.is_(None)))
        )
        return list(result.scalars().all())

    # --- API Tokens ---
    async def create_api_token(self, org_id: UUID, user_id: UUID, name: str, scopes: list = None, expires_in_days: int = None) -> dict:
        raw_token = secrets.token_urlsafe(48)
        token = APIToken(
            org_id=org_id,
            user_id=user_id,
            name=name,
            token_hash=hash_password(raw_token),
            scopes=scopes or [],
            expires_at=datetime.now(timezone.utc) + timedelta(days=expires_in_days) if expires_in_days else None,
        )
        self.db.add(token)
        await self.db.flush()
        return {"id": token.id, "token": raw_token, "name": name, "scopes": token.scopes, "expires_at": token.expires_at}

    async def list_api_tokens(self, org_id: UUID) -> list[APIToken]:
        result = await self.db.execute(
            select(APIToken).where(APIToken.org_id == org_id, APIToken.is_active == True)
        )
        return list(result.scalars().all())

    async def revoke_api_token(self, token_id: UUID, org_id: UUID):
        """Revoke an API token. Requires org_id for tenant isolation."""
        result = await self.db.execute(
            select(APIToken).where(APIToken.id == token_id, APIToken.org_id == org_id)
        )
        token = result.scalar_one_or_none()
        if token:
            token.is_active = False
            await self.db.flush()
