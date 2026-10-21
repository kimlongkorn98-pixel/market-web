"""initial schema: users and products

The tables were originally created by SQLAlchemy's create_all(), so on an
existing database this migration only creates whatever is missing.

Revision ID: 0001
Revises:
Create Date: 2026-10-19
"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa

revision: str = "0001"
down_revision: Union[str, None] = None
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    inspector = sa.inspect(op.get_bind())

    if not inspector.has_table("users"):
        op.create_table(
            "users",
            sa.Column("id", sa.Integer(), primary_key=True),
            sa.Column("name", sa.String(100), nullable=False),
            sa.Column("email", sa.String(100), nullable=False),
            sa.Column("password_hash", sa.String(255), nullable=False),
            sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.func.now()),
        )
        op.create_index("ix_users_id", "users", ["id"])
        op.create_index("ix_users_email", "users", ["email"], unique=True)

    if not inspector.has_table("products"):
        op.create_table(
            "products",
            sa.Column("id", sa.Integer(), primary_key=True),
            sa.Column("title", sa.String(200), nullable=False),
            sa.Column("description", sa.String(500)),
            sa.Column("price", sa.Float(), nullable=False),
            sa.Column("original_price", sa.Float()),
            sa.Column("discount_percentage", sa.Integer()),
            sa.Column("rating", sa.Float()),
            sa.Column("reviews_count", sa.Integer()),
            sa.Column("image_url", sa.String(500)),
            sa.Column("category", sa.String(50)),
            sa.Column("is_flash_deal", sa.Boolean()),
        )
        op.create_index("ix_products_id", "products", ["id"])


def downgrade() -> None:
    op.drop_table("products")
    op.drop_table("users")
