"""Role and permission names used throughout the backend.

The roles/permissions themselves live in the database (tables `roles`,
`permissions`, `role_permissions`, seeded by Alembic migrations). These
constants just avoid typos when checking them in code.
"""


class Roles:
    SUPER_ADMIN = "super_admin"
    ADMIN = "admin"
    EDITOR = "editor"
    USER = "user"


# Higher rank = more authority. Used to stop privilege escalation: a
# non-super-admin may only manage accounts, and hand out roles, ranked
# strictly below their own. Roles not listed here rank as 0.
ROLE_RANK = {
    Roles.SUPER_ADMIN: 3,
    Roles.ADMIN: 2,
    Roles.EDITOR: 1,
    Roles.USER: 0,
}


def role_rank(role: str) -> int:
    return ROLE_RANK.get(role, 0)


class ApprovalStatus:
    PENDING = "pending"
    APPROVED = "approved"
    REJECTED = "rejected"


class Perm:
    USERS_READ = "users:read"
    USERS_CREATE = "users:create"
    USERS_UPDATE = "users:update"
    USERS_DELETE = "users:delete"
    USERS_APPROVE = "users:approve"

    ROLES_READ = "roles:read"
    ROLES_ASSIGN = "roles:assign"
    ROLES_MANAGE = "roles:manage"

    PRODUCTS_CREATE = "products:create"
    PRODUCTS_UPDATE_ANY = "products:update_any"
    PRODUCTS_DELETE_ANY = "products:delete_any"

    AUDIT_READ = "audit:read"
