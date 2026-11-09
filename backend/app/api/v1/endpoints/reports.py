"""Report endpoints — store transcribed field reports and linked work orders."""

import json
import uuid
from typing import List, Optional

from fastapi import APIRouter, Depends, HTTPException, Query
from pydantic import BaseModel, ConfigDict, Field, field_validator
from sqlalchemy.orm import Session

from app.api.v1.endpoints.auth import get_current_user
from app.db.session import get_db
from app.models.report import Report
from app.models.work_order import WorkOrder

router = APIRouter()

VALID_SEVERITIES = {"low", "medium", "high", "critical"}
VALID_LANGUAGES = {"english", "hindi", "gujarati", "hinglish", "marathi"}


class CreateReportPayload(BaseModel):
    model_config = ConfigDict(populate_by_name=True, str_strip_whitespace=True)

    equipment_id: Optional[str] = Field(None, alias="equipmentId", max_length=64)
    equipment_name: Optional[str] = Field(None, alias="equipmentName", max_length=200)
    equipment_machine_number: Optional[str] = Field(
        None, alias="equipmentMachineNumber", max_length=64
    )
    issue: str = Field(..., min_length=1, max_length=2000)
    observation: Optional[str] = Field(None, max_length=5000)
    category: Optional[str] = Field(default="mechanical", max_length=32)
    severity: Optional[str] = Field(default="medium", max_length=16)
    language: str = Field(default="english", max_length=16)
    transcription: str = Field(..., min_length=1, max_length=10000)
    audio_url: Optional[str] = Field(None, alias="audioUrl", max_length=2048)
    missing_fields: Optional[List[str]] = Field(default_factory=list, alias="missingFields")
    worker_id: Optional[str] = Field(None, alias="workerId", max_length=64)
    worker_name: Optional[str] = Field(None, alias="workerName", max_length=120)

    @field_validator("severity")
    @classmethod
    def normalize_severity(cls, v: Optional[str]) -> str:
        value = (v or "medium").strip().lower()
        return value if value in VALID_SEVERITIES else "medium"

    @field_validator("category")
    @classmethod
    def normalize_category(cls, v: Optional[str]) -> str:
        return (v or "mechanical").strip().lower()

    @field_validator("language")
    @classmethod
    def normalize_language(cls, v: str) -> str:
        value = (v or "english").strip().lower()
        return value if value in VALID_LANGUAGES else "english"


@router.post("")
def create_report(
    payload: CreateReportPayload,
    db: Session = Depends(get_db),
    current_user: dict = Depends(get_current_user),
):
    report_id = f"R-{uuid.uuid4().hex[:8].upper()}"
    eq_id = payload.equipment_id or "M-12"
    eq_name = payload.equipment_name or f"Machine {eq_id}"
    eq_num = payload.equipment_machine_number or eq_id

    # Attribute the report to the authenticated caller unless an explicit
    # worker was supplied (e.g. supervisor filing on behalf of a technician).
    worker_id = payload.worker_id or current_user.get("id") or "tech-001"
    worker_name = payload.worker_name or current_user.get("name") or "Field Technician"

    report = Report(
        id=report_id,
        worker_id=worker_id,
        worker_name=worker_name,
        equipment_id=eq_id,
        equipment_name=eq_name,
        equipment_machine_number=eq_num,
        issue=payload.issue,
        observation=payload.observation,
        category=payload.category or "mechanical",
        severity=payload.severity or "medium",
        language=payload.language,
        audio_url=payload.audio_url,
        transcription=payload.transcription,
        missing_fields=payload.missing_fields or [],
        status="awaiting_assignment",
    )
    db.add(report)

    # Automatically generate associated Work Order for actionable tracking
    wo_id = f"WO-FN-{uuid.uuid4().hex[:4].upper()}"
    work_order = WorkOrder(
        id=wo_id,
        report_id=report_id,
        title=f"{payload.issue} - {eq_name}",
        description=payload.observation or f"Technician reported {payload.issue} on {eq_name}.",
        equipment_id=eq_id,
        equipment_name=eq_name,
        priority=payload.severity or "medium",
        status="awaiting_assignment",
        assigned_to=None,
        assigned_to_name=None,
    )
    db.add(work_order)
    report.work_order_id = wo_id

    db.commit()
    db.refresh(report)
    return _to_dict(report)


@router.get("")
def list_reports(
    page: int = Query(1, ge=1),
    limit: int = Query(20, ge=1, le=100),
    status: Optional[str] = Query(None),
    db: Session = Depends(get_db),
    current_user: dict = Depends(get_current_user),
):
    q = db.query(Report)
    if status and status != "all":
        q = q.filter(Report.status == status)
    total = q.count()
    items = q.order_by(Report.created_at.desc()).offset((page - 1) * limit).limit(limit).all()
    return {
        "data": [_to_dict(r) for r in items],
        "total": total,
        "page": page,
        "limit": limit,
        "totalPages": (total + limit - 1) // limit if limit > 0 else 1,
    }


@router.get("/{report_id}")
def get_report(
    report_id: str,
    db: Session = Depends(get_db),
    current_user: dict = Depends(get_current_user),
):
    report = db.get(Report, report_id)
    if not report:
        raise HTTPException(status_code=404, detail="Report not found")
    return _to_dict(report)


def _to_dict(report: Report) -> dict:
    missing = report.missing_fields or []
    # Legacy rows stored a JSON string in a TEXT column.
    if isinstance(missing, str):
        try:
            missing = json.loads(missing)
        except Exception:  # noqa: BLE001 - tolerate malformed legacy data
            missing = []
    if not isinstance(missing, list):
        missing = []

    return {
        "id": report.id,
        "workerId": report.worker_id,
        "workerName": report.worker_name,
        "equipmentId": report.equipment_id,
        "equipmentName": report.equipment_name,
        "equipmentMachineNumber": report.equipment_machine_number,
        "issue": report.issue,
        "observation": report.observation,
        "category": report.category,
        "severity": report.severity,
        "language": report.language,
        "audioUrl": report.audio_url,
        "transcription": report.transcription,
        "missingFields": missing,
        "status": report.status,
        "workOrderId": report.work_order_id,
        "createdAt": report.created_at.isoformat() if report.created_at else None,
        "updatedAt": report.updated_at.isoformat() if report.updated_at else None,
    }
