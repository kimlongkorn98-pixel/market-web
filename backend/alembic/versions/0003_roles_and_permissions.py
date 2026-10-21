"""roles & permissions (super_admin, admin, user)

Creates roles / permissions / role_permissions, seeds the default access
rules, and gives every user a role (existing users become "user") plus an
is_active flag.

Revision ID: 0003
Revises: 0002
Create Date: 2026-10-19
"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa

revision: str = "0003"
down_revision: Union[str, None] = "0002"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None

# Frozen copy of the seed data: migrations must not change if code changes later.
PERMISSIONS = {
    "users:read": "View users",
    "users:create": "Create users",
    "users:update": "Edit users and enable/disable accounts",
    "users:delete": "Delete users",
    "roles:read": "View roles and their permissions",
    "roles:assign": "Change a user's role",
    "roles:manage": "Change which permissions a role has",
    "products:create": "Create own product listings",
    "products:update_any": "Edit any product listing",
    "products:delete_any": "Delete any product listing",
}

ROLES = {
    "super_admin": ("Full access to everything", list(PERMISSIONS)),
    "admin": (
        "Manages regular users and moderates listings",
        [
            "users:read",
            "users:create",
            "users:update",
            "roles:read",
            "products:create",
            "products:update_any",
            "products:delete_any",
        ],
    ),
    "user": ("Regular buyer / seller", ["products:create"]),
}


def _table(name: str, *columns: sa.Column) -> sa.Table:
    """Create the table unless it exists (an older create_all() may have made
    it); return a Table handle for inserting either way."""
    if not sa.inspect(op.get_bind()).has_table(name):
        return op.create_table(name, *columns)
    return sa.table(name, *(sa.column(c.name) for c in columns))


def _insert_missing(table: sa.Table, keys: tuple, rows: list) -> None:
    """Insert only rows whose primary key isn't there yet (re-run safe)."""
    bind = op.get_bind()
    existing = {
        tuple(r) for r in bind.execute(sa.select(*(table.c[k] for k in keys)))
    }
    missing = [r for r in rows if tuple(r[k] for k in keys) not in existing]
    if missing:
        op.bulk_insert(table, missing)


def upgrade() -> None:
    permissions = _table(
        "permissions",
        sa.Column("code", sa.String(100), primary_key=True),
        sa.Column("description", sa.String(255)),
    )
    roles = _table(
        "roles",
        sa.Column("name", sa.String(50), primary_key=True),
        sa.Column("description", sa.String(255)),
    )
    role_permissions = _table(
        "role_permissions",
        sa.Column(
            "role_name",
            sa.String(50),
            sa.ForeignKey("roles.name", ondelete="CASCADE", onupdate="CASCADE"),
            primary_key=True,
        ),
        sa.Column(
            "permission_code",
            sa.String(100),
            sa.ForeignKey("permissions.code", ondelete="CASCADE", onupdate="CASCADE"),
            primary_key=True,
        ),
    )

    _insert_missing(
        permissions, ("code",),
        [{"code": c, "description": d} for c, d in PERMISSIONS.items()],
    )
    _insert_missing(
        roles, ("name",),
        [{"name": n, "description": d} for n, (d, _) in ROLES.items()],
    )
    _insert_missing(
        role_permissions, ("role_name", "permission_code"),
        [
            {"role_name": name, "permission_code": code}
            for name, (_, codes) in ROLES.items()
            for code in codes
        ],
    )

    # Existing users get the server default "user".
    user_columns = {c["name"] for c in sa.inspect(op.get_bind()).get_columns("users")}
    with op.batch_alter_table("users") as batch:
        if "role" not in user_columns:
            batch.add_column(
                sa.Column("role", sa.String(50), nullable=False, server_default="user")
            )
            batch.create_foreign_key(
                "users_role_fkey", "roles", ["role"], ["name"], onupdate="CASCADE"
            )
            batch.create_index("ix_users_role", ["role"])
        if "is_active" not in user_columns:
            batch.add_column(
                sa.Column("is_active", sa.Boolean(), nullable=False, server_default=sa.true())
            )


def downgrade() -> None:
    with op.batch_alter_table("users") as batch:
        batch.drop_index("ix_users_role")
        batch.drop_constraint("users_role_fkey", type_="foreignkey")
        batch.drop_column("is_active")
        batch.drop_column("role")
    op.drop_table("role_permissions")
    op.drop_table("roles")
    op.drop_table("permissions")
