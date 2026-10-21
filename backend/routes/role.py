from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List

from config.db import get_db
from config.deps import require_permission
from config.permissions import Perm, Roles, role_rank
from controllers.audit import AuditController
from models.role import Permission, Role
from models.user import User
from schemas.user import PermissionResponse, RolePermissionsUpdate, RoleResponse

router = APIRouter(prefix="/roles", tags=["Roles & permissions (admin)"])


def _to_response(role: Role) -> RoleResponse:
    return RoleResponse(
        name=role.name, description=role.description, permissions=role.permission_codes
    )


@router.get("/", response_model=List[RoleResponse])
def list_roles(
    db: Session = Depends(get_db),
    _: User = Depends(require_permission(Perm.ROLES_READ)),
):
    """All roles with the permissions each one grants."""
    return [_to_response(r) for r in db.query(Role).order_by(Role.name).all()]


@router.get("/permissions", response_model=List[PermissionResponse])
def list_permissions(
    db: Session = Depends(get_db),
    _: User = Depends(require_permission(Perm.ROLES_READ)),
):
    """Every permission that can be granted to a role."""
    return db.query(Permission).order_by(Permission.code).all()


@router.put("/{role_name}/permissions", response_model=RoleResponse)
def set_role_permissions(
    role_name: str,
    body: RolePermissionsUpdate,
    db: Session = Depends(get_db),
    actor: User = Depends(require_permission(Perm.ROLES_MANAGE)),
):
    """Replace the permissions of a role. The super_admin role can't be edited."""
    if role_name == Roles.SUPER_ADMIN:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="The super_admin role always has every permission.",
        )
    role = db.query(Role).filter(Role.name == role_name).first()
    if not role:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Role not found")
    # Escalation guard for anyone who isn't a super admin: they can't edit
    # their own (or a higher) role, nor grant permissions they don't hold.
    if actor.role != Roles.SUPER_ADMIN:
        if role_rank(role_name) >= role_rank(actor.role):
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="You can only edit roles below your own.",
            )
        not_held = [c for c in body.permissions if not actor.has_permission(c)]
        if not_held:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail=f"You can't grant permissions you don't have: {', '.join(sorted(not_held))}",
            )

    codes = set(body.permissions)
    found = db.query(Permission).filter(Permission.code.in_(codes)).all()
    unknown = codes - {p.code for p in found}
    if unknown:
        raise HTTPException(
            status_code=422,
            detail=f"Unknown permission(s): {', '.join(sorted(unknown))}",
        )
    before = role.permission_codes
    role.permissions = found
    after = sorted(p.code for p in found)
    if before != after:
        AuditController.record(db, actor, "role.permissions_changed", "role", role.name, {
            "before": before,
            "after": after,
            "added": sorted(set(after) - set(before)),
            "removed": sorted(set(before) - set(after)),
        })
    db.commit()
    db.refresh(role)
    return _to_response(role)
