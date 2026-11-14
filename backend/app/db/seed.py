"""Idempotent demo-data seeding.

This module replaces the ~120 lines of seeding that used to live in the
application lifespan. It is only invoked when ``SEED_DEMO_DATA`` is enabled
and the app is not running in production.
"""

import logging

from app.core.config import settings
from app.core.security import get_password_hash, verify_password
from app.db.session import SessionLocal
from app.models.report import Report
from app.models.technician import Technician
from app.models.user import User
from app.models.work_order import WorkOrder

logger = logging.getLogger("fieldos.seed")

DEMO_PASSWORD = "demo1234"

DEMO_USERS = [
    {
        "id": "tech-demo-001",
        "email": "tech.demo@fieldos.ai",
        "name": "Demo Technician",
        "role": "technician",
        "language_preference": "hinglish",
    },
    {
        "id": "sup-demo-001",
        "email": "supervisor.demo@fieldos.ai",
        "name": "Demo Supervisor",
        "role": "supervisor",
        "language_preference": "english",
    },
]

DEMO_TECHNICIANS = [
    {
        "id": "T-001",
        "name": "R. Patel",
        "role": "Senior Maintenance Tech",
        "availability": "available",
        "current_work_order_id": None,
        "completed": 28,
        "phone": "+91 98765 43210",
    },
    {
        "id": "T-002",
        "name": "S. Sharma",
        "role": "Mechanical Specialist",
        "availability": "busy",
        "current_work_order_id": "WO-FN-001",
        "completed": 19,
        "phone": "+91 98765 43211",
    },
    {
        "id": "T-003",
        "name": "A. Khan",
        "role": "Electrical Engineer",
        "availability": "available",
        "current_work_order_id": None,
        "completed": 34,
        "phone": "+91 98765 43212",
    },
    {
        "id": "T-004",
        "name": "M. Singh",
        "role": "HVAC & Pump Specialist",
        "availability": "available",
        "current_work_order_id": None,
        "completed": 15,
        "phone": "+91 98765 43213",
    },
]


def _seed_users(db) -> int:
    created = 0
    for data in DEMO_USERS:
        existing = db.query(User).filter(User.email == data["email"]).first()
        if existing:
            # Keep the demo credentials working even if the row predates hashing.
            if not verify_password(DEMO_PASSWORD, existing.password_hash):
                existing.password_hash = get_password_hash(DEMO_PASSWORD)
            continue
        db.add(User(password_hash=get_password_hash(DEMO_PASSWORD), **data))
        created += 1
    return created


def _seed_technicians(db) -> int:
    created = 0
    for data in DEMO_TECHNICIANS:
        if db.get(Technician, data["id"]):
            continue
        db.add(Technician(**data))
        created += 1
    return created


def _seed_reports_and_work_orders(db) -> int:
    if db.query(Report).count() > 0:
        return 0

    sample_reports = [
        Report(
            id="R-001",
            worker_id="tech-001",
            worker_name="R. Patel",
            equipment_id="M-12",
            equipment_name="Machine 12",
            equipment_machine_number="12",
            issue="Motor overheating",
            observation="Increased vibration, abnormal humming sound from drive unit",
            category="mechanical",
            severity="high",
            language="hinglish",
            transcription="Machine number 12 ma motor overheating thay chhe, vibration pan vadhi gayu chhe.",
            missing_fields=[],
            status="in_progress",
            work_order_id="WO-FN-001",
        ),
        Report(
            id="R-002",
            worker_id="tech-002",
            worker_name="S. Sharma",
            equipment_id="PS-B",
            equipment_name="Pump Station B",
            equipment_machine_number="B",
            issue="Vibration alert",
            observation="Impeller cavitation suspected; pressure fluctuations observed",
            category="hydraulic",
            severity="critical",
            language="english",
            transcription="Pump Station B is showing severe vibration alerts on sensor 4.",
            missing_fields=[],
            status="awaiting_assignment",
            work_order_id="WO-FN-002",
        ),
        Report(
            id="R-003",
            worker_id="tech-003",
            worker_name="A. Khan",
            equipment_id="CB-3",
            equipment_name="Conveyor Belt 3",
            equipment_machine_number="3",
            issue="Belt misalignment",
            observation="Roller guide adjusted; belt re-centered",
            category="mechanical",
            severity="medium",
            language="hindi",
            transcription="Conveyor Belt 3 ka alignment theek nahi hai, roller check karna padega.",
            missing_fields=[],
            status="resolved",
            work_order_id="WO-FN-003",
        ),
    ]
    db.add_all(sample_reports)
    db.flush()

    sample_wos = [
        WorkOrder(
            id="WO-FN-001",
            report_id="R-001",
            title="Motor overheating - Machine 12",
            description="Motor overheating accompanied by increased vibration. Technician inspection in progress.",
            equipment_id="M-12",
            equipment_name="Machine 12",
            priority="high",
            status="in_progress",
            assigned_to="T-001",
            assigned_to_name="R. Patel",
        ),
        WorkOrder(
            id="WO-FN-002",
            report_id="R-002",
            title="Vibration alert - Pump Station B",
            description="Critical vibration alert on Pump Station B. Requires emergency maintenance assessment.",
            equipment_id="PS-B",
            equipment_name="Pump Station B",
            priority="critical",
            status="awaiting_assignment",
            assigned_to=None,
            assigned_to_name=None,
        ),
        WorkOrder(
            id="WO-FN-003",
            report_id="R-003",
            title="Belt misalignment - Conveyor Belt 3",
            description="Conveyor Belt 3 guide alignment corrected and verified operational.",
            equipment_id="CB-3",
            equipment_name="Conveyor Belt 3",
            priority="medium",
            status="resolved",
            assigned_to="T-002",
            assigned_to_name="S. Sharma",
        ),
    ]
    db.add_all(sample_wos)
    return len(sample_reports)


def seed_demo_data() -> None:
    """Seed demo users, technicians, reports, and work orders idempotently."""
    if settings.is_production or not settings.SEED_DEMO_DATA:
        logger.info("Demo data seeding is disabled (APP_ENV=%s).", settings.APP_ENV)
        return

    db = SessionLocal()
    try:
        users = _seed_users(db)
        technicians = _seed_technicians(db)
        reports = _seed_reports_and_work_orders(db)
        db.commit()
        if users or technicians or reports:
            logger.info(
                "Demo data seeded: %s users, %s technicians, %s reports.",
                users,
                technicians,
                reports,
            )
    except Exception:  # noqa: BLE001 - seeding must never crash startup
        db.rollback()
        logger.exception("Failed to seed demo data")
    finally:
        db.close()
