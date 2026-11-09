from __future__ import annotations

from datetime import datetime
from typing import Optional

from sqlalchemy import JSON, DateTime, String, Text, func
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.session import Base


class Report(Base):
    __tablename__ = "reports"

    id: Mapped[str] = mapped_column(String, primary_key=True)
    worker_id: Mapped[str] = mapped_column(String, nullable=False, index=True)
    worker_name: Mapped[str] = mapped_column(String, nullable=False)
    equipment_id: Mapped[str] = mapped_column(String, nullable=False, index=True)
    equipment_name: Mapped[str] = mapped_column(String, nullable=False)
    equipment_machine_number: Mapped[str] = mapped_column(String, nullable=False)
    issue: Mapped[str] = mapped_column(Text, nullable=False)
    observation: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    category: Mapped[str] = mapped_column(String, nullable=False)
    severity: Mapped[str] = mapped_column(String, nullable=False)  # low/medium/high/critical
    language: Mapped[str] = mapped_column(String, nullable=False)  # gujarati/hindi/english/hinglish
    audio_url: Mapped[Optional[str]] = mapped_column(String, nullable=True)
    transcription: Mapped[str] = mapped_column(Text, nullable=False)
    # Native JSON instead of a JSON-encoded TEXT column: queryable, validated,
    # and no silent parse failures.
    missing_fields: Mapped[list] = mapped_column(JSON, nullable=False, default=list)
    status: Mapped[str] = mapped_column(String, nullable=False, default="draft", index=True)
    work_order_id: Mapped[Optional[str]] = mapped_column(String, nullable=True)
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now(), index=True
    )
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now(), onupdate=func.now()
    )

    work_order: Mapped[Optional["WorkOrder"]] = relationship(
        "WorkOrder", back_populates="report", uselist=False
    )
