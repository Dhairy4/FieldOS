"""users, technicians, JSON missing_fields, and query indexes

Revision ID: b7f3c9a1d2e4
Revises: e549404ca4b4
Create Date: 2026-11-09 00:00:00.000000

"""

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision = "b7f3c9a1d2e4"
down_revision = "e549404ca4b4"
branch_labels = None
depends_on = None


def upgrade():
    op.create_table(
        "users",
        sa.Column("id", sa.String(), nullable=False),
        sa.Column("email", sa.String(), nullable=False),
        sa.Column("name", sa.String(), nullable=False),
        sa.Column("password_hash", sa.String(), nullable=False),
        sa.Column("role", sa.String(), nullable=False, server_default="technician"),
        sa.Column(
            "language_preference", sa.String(), nullable=False, server_default="english"
        ),
        sa.Column("phone", sa.String(), nullable=True),
        sa.Column("is_active", sa.Boolean(), nullable=False, server_default=sa.true()),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.func.now()),
        sa.Column("updated_at", sa.DateTime(timezone=True), server_default=sa.func.now()),
        sa.PrimaryKeyConstraint("id"),
    )
    op.create_index("ix_users_email", "users", ["email"], unique=True)

    op.create_table(
        "technicians",
        sa.Column("id", sa.String(), nullable=False),
        sa.Column("name", sa.String(), nullable=False),
        sa.Column("role", sa.String(), nullable=False),
        sa.Column(
            "availability", sa.String(), nullable=False, server_default="available"
        ),
        sa.Column("current_work_order_id", sa.String(), nullable=True),
        sa.Column("completed", sa.Integer(), nullable=False, server_default="0"),
        sa.Column("phone", sa.String(), nullable=False, server_default=""),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.func.now()),
        sa.Column("updated_at", sa.DateTime(timezone=True), server_default=sa.func.now()),
        sa.PrimaryKeyConstraint("id"),
    )

    # Convert missing_fields from a JSON-encoded TEXT column to native JSON.
    # SQLite stores JSON as text already, so only PostgreSQL needs an ALTER.
    bind = op.get_bind()
    if bind.dialect.name == "postgresql":
        op.alter_column(
            "reports",
            "missing_fields",
            type_=sa.JSON(),
            existing_nullable=False,
            postgresql_using="missing_fields::json",
        )

    # Query indexes flagged by the audit.
    op.create_index("ix_reports_status", "reports", ["status"])
    op.create_index("ix_reports_worker_id", "reports", ["worker_id"])
    op.create_index("ix_reports_equipment_id", "reports", ["equipment_id"])
    op.create_index("ix_reports_created_at", "reports", ["created_at"])

    op.create_index("ix_work_orders_status", "work_orders", ["status"])
    op.create_index("ix_work_orders_assigned_to", "work_orders", ["assigned_to"])
    op.create_index("ix_work_orders_created_at", "work_orders", ["created_at"])


def downgrade():
    op.drop_index("ix_work_orders_created_at", table_name="work_orders")
    op.drop_index("ix_work_orders_assigned_to", table_name="work_orders")
    op.drop_index("ix_work_orders_status", table_name="work_orders")

    op.drop_index("ix_reports_created_at", table_name="reports")
    op.drop_index("ix_reports_equipment_id", table_name="reports")
    op.drop_index("ix_reports_worker_id", table_name="reports")
    op.drop_index("ix_reports_status", table_name="reports")

    bind = op.get_bind()
    if bind.dialect.name == "postgresql":
        op.alter_column(
            "reports",
            "missing_fields",
            type_=sa.Text(),
            existing_nullable=False,
            postgresql_using="missing_fields::text",
        )

    op.drop_table("technicians")
    op.drop_index("ix_users_email", table_name="users")
    op.drop_table("users")
