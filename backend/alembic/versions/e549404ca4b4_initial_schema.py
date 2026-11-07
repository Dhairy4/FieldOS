"""initial schema

Revision ID: e549404ca4b4
Revises: 
Create Date: 2026-11-07 00:00:00.000000

"""
from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision = "e549404ca4b4"
down_revision = None
branch_labels = None
depends_on = None


def upgrade():
    op.create_table(
        "reports",
        sa.Column("id", sa.String(), nullable=False),
        sa.Column("worker_id", sa.String(), nullable=False),
        sa.Column("worker_name", sa.String(), nullable=False),
        sa.Column("equipment_id", sa.String(), nullable=False),
        sa.Column("equipment_name", sa.String(), nullable=False),
        sa.Column("equipment_machine_number", sa.String(), nullable=False),
        sa.Column("issue", sa.Text(), nullable=False),
        sa.Column("observation", sa.Text(), nullable=True),
        sa.Column("category", sa.String(), nullable=False),
        sa.Column("severity", sa.String(), nullable=False),
        sa.Column("language", sa.String(), nullable=False),
        sa.Column("audio_url", sa.String(), nullable=True),
        sa.Column("transcription", sa.Text(), nullable=False),
        sa.Column(
            "missing_fields",
            sa.Text(),
            nullable=False,
            server_default="[]",
        ),
        sa.Column("status", sa.String(), nullable=False, server_default="draft"),
        sa.Column("work_order_id", sa.String(), nullable=True),
        sa.Column(
            "created_at",
            sa.DateTime(timezone=True),
            server_default=sa.func.now(),
            nullable=False,
        ),
        sa.Column(
            "updated_at",
            sa.DateTime(timezone=True),
            server_default=sa.func.now(),
            onupdate=sa.func.now(),
            nullable=False,
        ),
        sa.PrimaryKeyConstraint("id"),
    )

    op.create_table(
        "work_orders",
        sa.Column("id", sa.String(), nullable=False),
        sa.Column("report_id", sa.String(), nullable=False, index=True),
        sa.Column("title", sa.String(), nullable=False),
        sa.Column("description", sa.String(), nullable=False),
        sa.Column("equipment_id", sa.String(), nullable=False),
        sa.Column("equipment_name", sa.String(), nullable=False),
        sa.Column("priority", sa.String(), nullable=False),
        sa.Column("status", sa.String(), nullable=False, server_default="draft"),
        sa.Column("assigned_to", sa.String(), nullable=True),
        sa.Column("assigned_to_name", sa.String(), nullable=True),
        sa.Column(
            "created_at",
            sa.DateTime(timezone=True),
            server_default=sa.func.now(),
            nullable=False,
        ),
        sa.Column(
            "updated_at",
            sa.DateTime(timezone=True),
            server_default=sa.func.now(),
            onupdate=sa.func.now(),
            nullable=False,
        ),
        sa.Column("resolved_at", sa.DateTime(timezone=True), nullable=True),
        sa.ForeignKeyConstraint(
            ["report_id"],
            ["reports.id"],
        ),
        sa.PrimaryKeyConstraint("id"),
    )


def downgrade():
    op.drop_table("work_orders")
    op.drop_table("reports")
