from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import or_
from sqlalchemy.orm import Session
from typing import List, Optional

from config.db import get_db
from config.deps import require_permission
from config.permissions import ApprovalStatus, Perm, Roles, role_rank
from controllers.audit import AuditController
from controllers.user import UserController
from models.role import Role
from models.user import User
from schemas.user import AdminUserCreate, RoleAssign, UserResponse, UserUpdate

router = APIRouter(
    prefix="/users",
    tags=["Users (admin)"],
)


def _get_user_or_404(db: Session, user_id: int) -> User:
    user = UserController.get_by_id(db, user_id)
    if not user:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="User not found")
    return user


def _ensure_outranks(actor: User, role: str, message: str) -> None:
    """Non-super-admins may only act on roles ranked strictly below their own.

    This is what stops privilege escalation: an admin can't touch other
    admins, and can't hand out the admin or super_admin role.
    """
    if actor.role != Roles.SUPER_ADMIN and role_rank(role) >= role_rank(actor.role):
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail=message)


def _ensure_can_manage(actor: User, target: User) -> None:
    _ensure_outranks(actor, target.role, "You can only manage accounts below your own role.")


def _ensure_not_last_super_admin(db: Session, target: User) -> None:
    """At least one active super admin must always remain."""
    if target.role != Roles.SUPER_ADMIN or not target.is_active:
        return
    others = (
        db.query(User)
        .filter(User.role == Roles.SUPER_ADMIN, User.is_active.is_(True), User.id != target.id)
        .count()
    )
    if others == 0:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="This is the last super admin; promote someone else first.",
        )


def _ensure_role_exists(db: Session, role: str) -> None:
    if not db.query(Role).filter(Role.name == role).first():
        raise HTTPException(
            status_code=422,
            detail=f"Unknown role '{role}'.",
        )


@router.get("/", response_model=List[UserResponse])
def read_users(
    role: Optional[str] = None,
    q: Optional[str] = None,
    approval_status: Optional[str] = None,
    db: Session = Depends(get_db),
    _: User = Depends(require_permission(Perm.USERS_READ)),
):
    """List users. Filter by `role` / `approval_status`, or search name/email with `q`."""
    query = db.query(User)
    if role:
        query = query.filter(User.role == role)
    if approval_status:
        query = query.filter(User.approval_status == approval_status)
    if q:
        like = f"%{q.strip()}%"
        query = query.filter(or_(User.name.ilike(like), User.email.ilike(like)))
    return query.order_by(User.id.asc()).all()


@router.get("/{user_id}", response_model=UserResponse)
def read_user(
    user_id: int,
    db: Session = Depends(get_db),
    _: User = Depends(require_permission(Perm.USERS_READ)),
):
    """Retrieve a single user by ID."""
    return _get_user_or_404(db, user_id)


@router.post("/", response_model=UserResponse, status_code=status.HTTP_201_CREATED)
def create_user(
    user_data: AdminUserCreate,
    db: Session = Depends(get_db),
    actor: User = Depends(require_permission(Perm.USERS_CREATE)),
):
    """Create a user. Any role other than "user" also needs `roles:assign`.

    Accounts created by someone without `users:approve` (i.e. admins) start
    as "pending" and can't sign in until a super admin approves them.
    """
    _ensure_role_exists(db, user_data.role)
    if user_data.role != Roles.USER:
        if not actor.has_permission(Perm.ROLES_ASSIGN):
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="You can only create regular user accounts.",
            )
        _ensure_outranks(actor, user_data.role, "You can't create an account with that role.")
    if UserController.get_by_email(db, str(user_data.email).lower()):
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="Email already registered"
        )
    status_ = (
        ApprovalStatus.APPROVED if actor.has_permission(Perm.USERS_APPROVE) else ApprovalStatus.PENDING
    )
    user = UserController.create(
        db, user_data, role=user_data.role, approval_status=status_, created_by_id=actor.id
    )
    AuditController.record(db, actor, "user.created", "user", user.id,
                           {"email": user.email, "role": user.role, "approval_status": status_})
    db.commit()
    return user


@router.patch("/{user_id}", response_model=UserResponse)
def update_user(
    user_id: int,
    changes: UserUpdate,
    db: Session = Depends(get_db),
    actor: User = Depends(require_permission(Perm.USERS_UPDATE)),
):
    """Edit a user's name or enable/disable their account."""
    target = _get_user_or_404(db, user_id)
    if target.id == actor.id:
        # Editing yourself: name changes are fine, locking yourself out is not.
        if changes.is_active is False:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="You can't disable your own account.",
            )
    else:
        _ensure_can_manage(actor, target)
    if changes.is_active is False:
        _ensure_not_last_super_admin(db, target)

    if changes.name is not None:
        target.name = changes.name.strip()
    if changes.is_active is not None and changes.is_active != target.is_active:
        AuditController.record(
            db, actor, "user.enabled" if changes.is_active else "user.disabled",
            "user", target.id, {"email": target.email},
        )
        target.is_active = changes.is_active
    db.commit()
    db.refresh(target)
    return target


def _decide(db: Session, actor: User, user_id: int, decision: str) -> User:
    target = _get_user_or_404(db, user_id)
    _ensure_can_manage(actor, target)
    allowed_from = (
        (ApprovalStatus.PENDING, ApprovalStatus.REJECTED)  # can approve after a rejection
        if decision == ApprovalStatus.APPROVED
        else (ApprovalStatus.PENDING,)
    )
    if target.approval_status not in allowed_from:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"This account is already {target.approval_status}.",
        )
    AuditController.record(
        db, actor, f"user.{decision}", "user", target.id,
        {"email": target.email, "role": target.role, "created_by": target.created_by_email},
    )
    target.approval_status = decision
    db.commit()
    db.refresh(target)
    return target


@router.post("/{user_id}/approve", response_model=UserResponse)
def approve_user(
    user_id: int,
    db: Session = Depends(get_db),
    actor: User = Depends(require_permission(Perm.USERS_APPROVE)),
):
    """Approve a pending account so it can sign in (super admin)."""
    return _decide(db, actor, user_id, ApprovalStatus.APPROVED)


@router.post("/{user_id}/reject", response_model=UserResponse)
def reject_user(
    user_id: int,
    db: Session = Depends(get_db),
    actor: User = Depends(require_permission(Perm.USERS_APPROVE)),
):
    """Reject a pending account; it can never sign in unless approved later."""
    return _decide(db, actor, user_id, ApprovalStatus.REJECTED)


@router.patch("/{user_id}/role", response_model=UserResponse)
def assign_role(
    user_id: int,
    body: RoleAssign,
    db: Session = Depends(get_db),
    actor: User = Depends(require_permission(Perm.ROLES_ASSIGN)),
):
    """Change a user's role (super admin only by default)."""
    target = _get_user_or_404(db, user_id)
    _ensure_role_exists(db, body.role)
    if target.id == actor.id:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="You can't change your own role.",
        )
    _ensure_can_manage(actor, target)
    _ensure_outranks(actor, body.role, "You can't give someone that role.")
    if body.role == target.role:
        return target
    if body.role != Roles.SUPER_ADMIN:
        _ensure_not_last_super_admin(db, target)

    AuditController.record(db, actor, "user.role_changed", "user", target.id,
                           {"email": target.email, "before": target.role, "after": body.role})
    target.role = body.role
    db.commit()
    db.refresh(target)
    return target


@router.delete("/{user_id}", response_model=UserResponse)
def delete_user(
    user_id: int,
    db: Session = Depends(get_db),
    actor: User = Depends(require_permission(Perm.USERS_DELETE)),
):
    """Delete a user by ID. Their listings stay, without a seller."""
    target = _get_user_or_404(db, user_id)
    if target.id == actor.id:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="You can't delete your own account here.",
        )
    _ensure_can_manage(actor, target)
    _ensure_not_last_super_admin(db, target)
    response = UserResponse.model_validate(target)
    AuditController.record(db, actor, "user.deleted", "user", target.id,
                           {"email": target.email, "role": target.role})
    db.delete(target)
    db.commit()
    return response
