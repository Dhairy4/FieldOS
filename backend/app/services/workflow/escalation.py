"""Workflow escalation service.

Flags work orders that need escalation based on priority and age.
"""

from __future__ import annotations

from datetime import datetime, timedelta, timezone
from typing import Optional

from sqlalchemy.orm import Session

from app.models.work_order import WorkOrder

# Hours after which an unassigned work order of a given priority is escalated.
ESCALATION_HOURS = {
    "critical": 1,
    "high": 4,
    "medium": 24,
    "low": 72,
}


def escalation_due_at(priority: str, created_at: datetime) -> Optional[datetime]:
    hours = ESCALATION_HOURS.get(priority.lower())
    if hours is None:
        return None
    return created_at + timedelta(hours=hours)


def find_escalation_candidates(db: Session) -> list[WorkOrder]:
    """Return unassigned work orders whose escalation time has passed."""
    now = datetime.now(timezone.utc)
    candidates: list[WorkOrder] = []
    for wo in db.query(WorkOrder).filter(WorkOrder.assigned_to.is_(None)).all():
        created = wo.created_at or now
        # SQLite stores datetimes without tz; normalize naive values to UTC
        if created.tzinfo is None:
            created = created.replace(tzinfo=timezone.utc)
        due = escalation_due_at(wo.priority, created)
        if due and now >= due:
            candidates.append(wo)
    return candidates
