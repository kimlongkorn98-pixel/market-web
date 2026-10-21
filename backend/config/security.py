"""Security utilities: password hashing (bcrypt) and JWT encode/decode.

These helpers are intentionally framework-agnostic so they can be reused by
controllers and route dependencies alike.
"""
import os
from datetime import datetime, timedelta, timezone
from typing import Optional

import bcrypt
from jose import JWTError, jwt

# --- Password hashing -------------------------------------------------------

# We use the `bcrypt` library directly. (passlib is unmaintained and breaks
# with bcrypt >= 4.1, so we avoid that wrapper.)
#
# bcrypt operates on bytes and only considers the first 72 bytes of the
# password, so we encode and truncate defensively before hashing/verifying.
_BCRYPT_MAX_BYTES = 72


def _to_bcrypt_bytes(password: str) -> bytes:
    return password.encode("utf-8")[:_BCRYPT_MAX_BYTES]


def hash_password(plain_password: str) -> str:
    """Return a salted bcrypt hash for the given plaintext password."""
    hashed = bcrypt.hashpw(_to_bcrypt_bytes(plain_password), bcrypt.gensalt())
    return hashed.decode("utf-8")


def verify_password(plain_password: str, hashed_password: str) -> bool:
    """Check a plaintext password against a stored bcrypt hash."""
    try:
        return bcrypt.checkpw(
            _to_bcrypt_bytes(plain_password),
            hashed_password.encode("utf-8"),
        )
    except ValueError:
        # Malformed stored hash.
        return False


# --- JWT --------------------------------------------------------------------

# The secret MUST be overridden via the environment in any real deployment.
JWT_SECRET_KEY = os.getenv(
    "JWT_SECRET_KEY",
    "dev-insecure-change-me-please-set-JWT_SECRET_KEY-in-env",
)
JWT_ALGORITHM = os.getenv("JWT_ALGORITHM", "HS256")
ACCESS_TOKEN_EXPIRE_MINUTES = int(os.getenv("ACCESS_TOKEN_EXPIRE_MINUTES", "1440"))


def create_access_token(
    subject: str,
    expires_minutes: Optional[int] = None,
    extra_claims: Optional[dict] = None,
) -> str:
    """Create a signed JWT access token.

    ``subject`` is stored in the standard ``sub`` claim (we use the user id).
    """
    expire = datetime.now(timezone.utc) + timedelta(
        minutes=expires_minutes or ACCESS_TOKEN_EXPIRE_MINUTES
    )
    to_encode = {"sub": str(subject), "exp": expire}
    if extra_claims:
        to_encode.update(extra_claims)
    return jwt.encode(to_encode, JWT_SECRET_KEY, algorithm=JWT_ALGORITHM)


def decode_access_token(token: str) -> Optional[dict]:
    """Decode and validate a JWT. Returns the claims dict or ``None`` if invalid."""
    try:
        return jwt.decode(token, JWT_SECRET_KEY, algorithms=[JWT_ALGORITHM])
    except JWTError:
        return None
