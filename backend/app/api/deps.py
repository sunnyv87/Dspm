"""Common API dependencies: auth, DB session, current user, rate limiting."""

import time
from collections import defaultdict
from uuid import UUID

from fastapi import Depends, HTTPException, Request, status
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.database import get_db
from app.core.security import decode_token
from app.models.admin import User

security_scheme = HTTPBearer()

# Simple in-memory rate limiter (use Redis in production for multi-instance)
_rate_limit_store: dict[str, list[float]] = defaultdict(list)
RATE_LIMIT_WINDOW = 60  # seconds
RATE_LIMIT_MAX_REQUESTS = 10  # per window for auth endpoints


def _check_rate_limit(key: str, max_requests: int = RATE_LIMIT_MAX_REQUESTS, window: int = RATE_LIMIT_WINDOW):
    """Raises 429 if rate limit exceeded for the given key."""
    now = time.time()
    # Prune old entries
    _rate_limit_store[key] = [t for t in _rate_limit_store[key] if t > now - window]
    if len(_rate_limit_store[key]) >= max_requests:
        raise HTTPException(
            status_code=status.HTTP_429_TOO_MANY_REQUESTS,
            detail="Too many requests. Please try again later.",
        )
    _rate_limit_store[key].append(now)


async def rate_limit_by_ip(request: Request):
    """Rate limiting dependency for auth endpoints."""
    client_ip = request.client.host if request.client else "unknown"
    _check_rate_limit(f"auth:{client_ip}")


async def get_current_user(
    credentials: HTTPAuthorizationCredentials = Depends(security_scheme),
    db: AsyncSession = Depends(get_db),
) -> dict:
    """Extract and validate the current user from JWT access token."""
    try:
        payload = decode_token(credentials.credentials, expected_type="access")
    except ValueError:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid or expired token",
        )

    user_id = payload.get("sub")
    org_id = payload.get("org_id")
    roles = payload.get("roles", [])

    if not user_id or not org_id:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid token payload")

    # Verify user still exists and is active
    result = await db.execute(select(User).where(User.id == UUID(user_id)))
    user = result.scalar_one_or_none()
    if not user or not user.is_active:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="User account is inactive or deleted")

    return {
        "user_id": UUID(user_id),
        "org_id": UUID(org_id),
        "roles": roles,
    }


def require_role(*allowed_roles: str):
    """Dependency factory to require specific roles."""
    async def _check(current_user: dict = Depends(get_current_user)):
        if not any(role in allowed_roles for role in current_user["roles"]):
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Insufficient permissions",
            )
        return current_user
    return _check
