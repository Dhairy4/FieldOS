"""FieldOS Backend Application Entrypoint."""

import logging
from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.api.v1.endpoints import auth, voice, reports, work_orders, technicians
from app.db.session import init_db, SessionLocal
from app.models.report import Report
from app.models.work_order import WorkOrder

logger = logging.getLogger("fieldos")


def seed_initial_data_if_empty():
    """Seed initial sample reports and work orders if database is fresh."""
    db = SessionLocal()
    try:
        if db.query(Report).count() == 0:
            logger.info("Database is empty. Seeding initial demonstration data...")
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
                    missing_fields="[]",
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
                    missing_fields="[]",
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
                    missing_fields="[]",
                    status="resolved",
                    work_order_id="WO-FN-003",
                ),
            ]
            for r in sample_reports:
                db.add(r)

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
            for wo in sample_wos:
                db.add(wo)

            db.commit()
            logger.info("Demo data seeded successfully.")
    except Exception as e:
        logger.warning(f"Error seeding demo data: {e}")
        db.rollback()
    finally:
        db.close()


@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup: ensure tables exist and seed demo data
    init_db()
    seed_initial_data_if_empty()
    yield
    # Shutdown


app = FastAPI(
    title="FieldOS API",
    description="Voice-first multilingual field operations intelligence platform",
    version="1.0.0",
    lifespan=lifespan,
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Mount API v1 routes
app.include_router(auth.router, prefix="/api/v1/auth", tags=["auth"])
app.include_router(voice.router, prefix="/api/v1/voice", tags=["voice"])
app.include_router(reports.router, prefix="/api/v1/reports", tags=["reports"])
app.include_router(work_orders.router, prefix="/api/v1/work-orders", tags=["work-orders"])
app.include_router(technicians.router, prefix="/api/v1/technicians", tags=["technicians"])

# Also mount at root for backward compatibility with frontend clients
app.include_router(voice.router, prefix="/voice", tags=["voice-root"])
app.include_router(reports.router, prefix="/reports", tags=["reports-root"])
app.include_router(work_orders.router, prefix="/work-orders", tags=["work-orders-root"])
app.include_router(technicians.router, prefix="/technicians", tags=["technicians-root"])


@app.get("/health")
def health():
    return {"status": "ok"}
