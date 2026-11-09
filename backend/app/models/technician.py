from __future__ import annotations

from datetime import datetime
from typing import Optional

from sqlalchemy import DateTime, ForeignKey, Integer, String, Text, func
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.session import Base


class Technician(Base):
    """Maintenance technician roster.

    Previously this was a hardcoded Python list/map inside the endpoint layer.
    Persisting it gives a single source of truth for assignment and roster
    endpoints, and allows future admin management without code changes.
    """

    __tablename__ = "technicians"

    id: Mapped[str] = mapped_column(String, primary_key=True)
    name: Mapped[str] = mapped_column(String, nullable=False)
    role: Mapped[str] = mapped_column(String, nullable=False)
    availability: Mapped[str] = mapped_column(
        String, nullable=False, default="available"
    )  # available / busy / offline
    current_work_order_id: Mapped[Optional[str]] = mapped_column(String, nullable=True)
    completed: Mapped[int] = mapped_column(Integer, nullable=False, default=0)
    phone: Mapped[str] = mapped_column(String, nullable=False, default="")
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now()
    )
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now(), onupdate=func.now()
    )
