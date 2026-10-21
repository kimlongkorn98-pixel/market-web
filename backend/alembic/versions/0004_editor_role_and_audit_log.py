"""editor role, audit:read permission, audit_logs table

Revision ID: 0004
Revises: 0003
Create Date: 2026-10-19
"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa

revision: str = "0004"
down_revision: Union[str, None] = "0003"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None

permissions = sa.table("permissions", sa.column("code"), sa.column("description"))
roles = sa.table("roles", sa.column("name"), sa.column("description"))
role_permissions = sa.table("role_permissions", sa.column("role_name"), sa.column("permission_code"))

EDITOR_PERMISSIONS = ["products:create", "products:update_any"]
AUDIT_READ_ROLES = ["super_admin", "admin"]


def upgrade() -> None:
    op.bulk_insert(permissions, [{"code": "audit:read", "description": "View the audit log"}])
    op.bulk_insert(roles, [{"name": "editor", "description": "Creates and edits any listing; can't delete or manage users"}])
    op.bulk_insert(
        role_permissions,
        [{"role_name": "editor", "permission_code": c} for c in EDITOR_PERMISSIONS]
        + [{"role_name": r, "permission_code": "audit:read"} for r in AUDIT_READ_ROLES],
    )

    op.create_table(
        "audit_logs",
        sa.Column("id", sa.Integer(), primary_key=True),
        sa.Column("actor_id", sa.Integer(), sa.ForeignKey("users.id", ondelete="SET NULL")),
        sa.Column("actor_email", sa.String(100)),
        sa.Column("action", sa.String(50), nullable=False),
        sa.Column("target_type", sa.String(30), nullable=False),
        sa.Column("target_id", sa.String(100), nullable=False),
        sa.Column("details", sa.JSON()),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.func.now()),
    )
    op.create_index("ix_audit_logs_actor_id", "audit_logs", ["actor_id"])
    op.create_index("ix_audit_logs_action", "audit_logs", ["action"])
    op.create_index("ix_audit_logs_created_at", "audit_logs", ["created_at"])


def downgrade() -> None:
    op.drop_table("audit_logs")
    # Anyone still an editor falls back to a regular user.
    op.execute("UPDATE users SET role = 'user' WHERE role = 'editor'")
    op.execute("DELETE FROM role_permissions WHERE role_name = 'editor' OR permission_code = 'audit:read'")
    op.execute("DELETE FROM roles WHERE name = 'editor'")
    op.execute("DELETE FROM permissions WHERE code = 'audit:read'")
