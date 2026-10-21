"""account approval: users.approval_status, users.created_by_id, users:approve

Accounts an admin creates start as "pending" until a super admin approves
them. Every existing user is marked "approved".

Revision ID: 0005
Revises: 0004
Create Date: 2026-10-19
"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa

revision: str = "0005"
down_revision: Union[str, None] = "0004"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None

permissions = sa.table("permissions", sa.column("code"), sa.column("description"))
role_permissions = sa.table("role_permissions", sa.column("role_name"), sa.column("permission_code"))


def upgrade() -> None:
    with op.batch_alter_table("users") as batch:
        batch.add_column(
            sa.Column("approval_status", sa.String(20), nullable=False, server_default="approved")
        )
        batch.add_column(sa.Column("created_by_id", sa.Integer()))
        batch.create_foreign_key(
            "users_created_by_id_fkey", "users", ["created_by_id"], ["id"], ondelete="SET NULL"
        )
        batch.create_index("ix_users_approval_status", ["approval_status"])

    op.bulk_insert(permissions, [{"code": "users:approve", "description": "Approve or reject accounts created by admins"}])
    op.bulk_insert(role_permissions, [{"role_name": "super_admin", "permission_code": "users:approve"}])


def downgrade() -> None:
    op.execute("DELETE FROM role_permissions WHERE permission_code = 'users:approve'")
    op.execute("DELETE FROM permissions WHERE code = 'users:approve'")
    with op.batch_alter_table("users") as batch:
        batch.drop_index("ix_users_approval_status")
        batch.drop_constraint("users_created_by_id_fkey", type_="foreignkey")
        batch.drop_column("created_by_id")
        batch.drop_column("approval_status")
