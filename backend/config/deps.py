"""Shared FastAPI dependencies (auth + permissions)."""
from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer
from sqlalchemy.orm import Session

from config.db import get_db
from config.permissions import ApprovalStatus
from config.security import decode_access_token
from models.user import User

_bearer = HTTPBearer(auto_error=False)


def account_block_reason(user: User) -> str | None:
    """Why this account may not sign in / use the API, or None if it may."""
    if user.approval_status == ApprovalStatus.PENDING:
        return "Your account is waiting for approval by a super admin."
    if user.approval_status == ApprovalStatus.REJECTED:
        return "Your account request was not approved."
    if not user.is_active:
        return "This account has been disabled."
    return None


def get_current_user(
    credentials: HTTPAuthorizationCredentials | None = Depends(_bearer),
    db: Session = Depends(get_db),
) -> User:
    """Resolve the user from a `Authorization: Bearer <jwt>` header, or 401."""
    unauthorized = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Please sign in to continue.",
        headers={"WWW-Authenticate": "Bearer"},
    )
    if credentials is None:
        raise unauthorized
    claims = decode_access_token(credentials.credentials)
    if not claims or "sub" not in claims:
        raise unauthorized
    try:
        user_id = int(claims["sub"])
    except (TypeError, ValueError):
        raise unauthorized
    user = db.query(User).filter(User.id == user_id).first()
    if user is None:
        raise unauthorized
    reason = account_block_reason(user)
    if reason:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail=reason)
    return user


def require_permission(*codes: str):
    """Dependency factory: the current user must have ALL of the given permissions.

    Usage:
        @router.get("/", dependencies=[Depends(require_permission(Perm.USERS_READ))])
        def handler(user: User = Depends(require_permission(Perm.USERS_READ))): ...
    """

    def checker(user: User = Depends(get_current_user)) -> User:
        missing = [c for c in codes if not user.has_permission(c)]
        if missing:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="You don't have permission to do this.",
            )
        return user

    return checker
