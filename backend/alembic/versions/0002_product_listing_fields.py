"""products: condition, location, seller, created_at

These columns were previously added by a startup ALTER in main.py, so each
one is only added when missing.

Revision ID: 0002
Revises: 0001
Create Date: 2026-10-19
"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa

revision: str = "0002"
down_revision: Union[str, None] = "0001"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    inspector = sa.inspect(op.get_bind())
    columns = {c["name"] for c in inspector.get_columns("products")}
    indexes = {i["name"] for i in inspector.get_indexes("products")}

    with op.batch_alter_table("products") as batch:
        if "condition" not in columns:
            batch.add_column(sa.Column("condition", sa.String(20)))
        if "location" not in columns:
            batch.add_column(sa.Column("location", sa.String(100)))
        if "created_at" not in columns:
            batch.add_column(
                sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.func.now())
            )
        if "seller_id" not in columns:
            batch.add_column(sa.Column("seller_id", sa.Integer()))
            batch.create_foreign_key(
                "products_seller_id_fkey", "users", ["seller_id"], ["id"], ondelete="SET NULL"
            )
        if "ix_products_seller_id" not in indexes:
            batch.create_index("ix_products_seller_id", ["seller_id"])


def downgrade() -> None:
    with op.batch_alter_table("products") as batch:
        batch.drop_index("ix_products_seller_id")
        batch.drop_constraint("products_seller_id_fkey", type_="foreignkey")
        batch.drop_column("seller_id")
        batch.drop_column("created_at")
        batch.drop_column("location")
        batch.drop_column("condition")
