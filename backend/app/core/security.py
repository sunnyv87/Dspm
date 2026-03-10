"""Security utilities: JWT tokens, password hashing, credential encryption."""

import re
from datetime import datetime, timedelta, timezone
from typing import Any, Optional

from cryptography.fernet import Fernet
from jose import JWTError, jwt
from passlib.context import CryptContext

from app.core.config import settings

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

ALGORITHM = "HS256"
JWT_ISSUER = "techd-dspm"
JWT_AUDIENCE = "techd-dspm-api"

# Password policy constants
PASSWORD_MIN_LENGTH = 12
PASSWORD_MAX_LENGTH = 128


def validate_password_strength(password: str) -> list[str]:
    """Validate password meets minimum complexity requirements. Returns list of violations."""
    errors = []
    if len(password) < PASSWORD_MIN_LENGTH:
        errors.append(f"Password must be at least {PASSWORD_MIN_LENGTH} characters")
    if len(password) > PASSWORD_MAX_LENGTH:
        errors.append(f"Password must be at most {PASSWORD_MAX_LENGTH} characters")
    if not re.search(r"[A-Z]", password):
        errors.append("Password must contain at least one uppercase letter")
    if not re.search(r"[a-z]", password):
        errors.append("Password must contain at least one lowercase letter")
    if not re.search(r"[0-9]", password):
        errors.append("Password must contain at least one digit")
    if not re.search(r"[^A-Za-z0-9]", password):
        errors.append("Password must contain at least one special character")
    return errors


def create_access_token(subject: str, extra_claims: Optional[dict[str, Any]] = None) -> str:
    expire = datetime.now(timezone.utc) + timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
    to_encode = {
        "sub": subject,
        "exp": expire,
        "type": "access",
        "iss": JWT_ISSUER,
        "aud": JWT_AUDIENCE,
    }
    if extra_claims:
        to_encode.update(extra_claims)
    return jwt.encode(to_encode, settings.SECRET_KEY, algorithm=ALGORITHM)


def create_refresh_token(subject: str) -> str:
    expire = datetime.now(timezone.utc) + timedelta(days=settings.REFRESH_TOKEN_EXPIRE_DAYS)
    to_encode = {
        "sub": subject,
        "exp": expire,
        "type": "refresh",
        "iss": JWT_ISSUER,
        "aud": JWT_AUDIENCE,
    }
    return jwt.encode(to_encode, settings.SECRET_KEY, algorithm=ALGORITHM)


def decode_token(token: str, expected_type: str = "access") -> dict[str, Any]:
    """Decode and validate a JWT token.

    Args:
        token: The JWT token string.
        expected_type: Expected token type ('access' or 'refresh'). Prevents
                       refresh tokens from being used as access tokens.
    """
    try:
        payload = jwt.decode(
            token,
            settings.SECRET_KEY,
            algorithms=[ALGORITHM],
            issuer=JWT_ISSUER,
            audience=JWT_AUDIENCE,
        )
    except JWTError:
        raise ValueError("Invalid token")

    token_type = payload.get("type")
    if token_type != expected_type:
        raise ValueError(f"Invalid token type: expected {expected_type}, got {token_type}")

    return payload


def verify_password(plain_password: str, hashed_password: str) -> bool:
    return pwd_context.verify(plain_password, hashed_password)


def hash_password(password: str) -> str:
    return pwd_context.hash(password)


class CredentialEncryptor:
    """Encrypt/decrypt connector credentials using Fernet symmetric encryption."""

    def __init__(self, key: str):
        self._fernet = Fernet(key.encode() if isinstance(key, str) else key)

    def encrypt(self, plaintext: str) -> str:
        return self._fernet.encrypt(plaintext.encode()).decode()

    def decrypt(self, ciphertext: str) -> str:
        return self._fernet.decrypt(ciphertext.encode()).decode()


credential_encryptor = CredentialEncryptor(settings.CREDENTIAL_ENCRYPTION_KEY)
