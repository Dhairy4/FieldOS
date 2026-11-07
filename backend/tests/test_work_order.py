from datetime import datetime, timedelta, timezone

from sqlalchemy import create_engine
from sqlalchemy.orm import Session

from app.db.session import Base
from app.models.report import Report
from app.models.work_order import WorkOrder


def test_work_order_crud():
    engine = create_engine("sqlite:///:memory:")
    Base.metadata.create_all(engine)

    db = Session(engine)
    report = Report(
        id="R-001",
        worker_id="tech-001",
        worker_name="Field Technician",
        equipment_id="E-12",
        equipment_name="Machine 12",
        equipment_machine_number="12",
        issue="Motor overheating",
        language="gujarati",
        transcription="Machine number 12 ma motor overheating thay chhe.",
        category="mechanical",
        severity="high",
        missing_fields="[]",
        status="draft",
    )
    db.add(report)
    db.commit()

    wo = WorkOrder(
        id="WO-FN-001",
        report_id="R-001",
        title="Machine 12 motor overheating",
        description="Motor overheating with increased vibration.",
        equipment_id="E-12",
        equipment_name="Machine 12",
        priority="high",
        status="draft",
    )
    db.add(wo)
    db.commit()
    db.refresh(wo)

    assert wo.id == "WO-FN-001"
    assert wo.created_at is not None

    fetched = db.get(WorkOrder, "WO-FN-001")
    assert fetched is not None
    assert fetched.status == "draft"
    assert fetched.report is not None
    assert fetched.report.id == "R-001"

    fetched.status = "in_progress"
    db.commit()
    assert db.get(WorkOrder, "WO-FN-001").status == "in_progress"

    db.close()


def test_escalation_flags_overdue_unassigned_work_orders():
    from app.services.workflow.escalation import find_escalation_candidates

    engine = create_engine("sqlite:///:memory:")
    Base.metadata.create_all(engine)
    db = Session(engine)

    overdue = WorkOrder(
        id="WO-OLD",
        report_id="R-001",
        title="Overdue critical",
        description="...",
        equipment_id="E-1",
        equipment_name="Machine 1",
        priority="critical",
        status="awaiting_assignment",
        assigned_to=None,
        created_at=datetime.now(timezone.utc) - timedelta(hours=2),
    )
    fresh = WorkOrder(
        id="WO-NEW",
        report_id="R-002",
        title="Fresh high",
        description="...",
        equipment_id="E-2",
        equipment_name="Machine 2",
        priority="high",
        status="awaiting_assignment",
        assigned_to=None,
        created_at=datetime.now(timezone.utc),
    )
    assigned = WorkOrder(
        id="WO-ASSIGNED",
        report_id="R-003",
        title="Assigned",
        description="...",
        equipment_id="E-3",
        equipment_name="Machine 3",
        priority="critical",
        status="awaiting_assignment",
        assigned_to="T-001",
        created_at=datetime.now(timezone.utc) - timedelta(hours=2),
    )
    for wo in (overdue, fresh, assigned):
        db.add(wo)
    db.commit()

    candidates = find_escalation_candidates(db)
    assert [wo.id for wo in candidates] == ["WO-OLD"]

    db.close()
