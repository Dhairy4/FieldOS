"""Work-order endpoints — create, assign, and update work orders."""

import uuid
from datetime import datetime, timezone
from typing import Optional

from fastapi import APIRouter, Depends, HTTPException, Query
from pydantic import BaseModel, ConfigDict, Field, field_validator
from sqlalchemy.orm import Session, joinedload

from app.api.v1.endpoints.auth import get_current_user
from app.db.session import get_db
from app.models.report import Report
from app.models.technician import Technician
from app.models.work_order import WorkOrder
from app.services.workflow.escalation import find_escalation_candidates

router = APIRouter()

VALID_STATUSES = {
    "draft",
    "awaiting_assignment",
    "assigned",
    "in_progress",
    "resolved",
    "cancelled",
}
VALID_PRIORITIES = {"low", "medium", "high", "critical"}


class CreateWorkOrderPayload(BaseModel):
    model_config = ConfigDict(populate_by_name=True, str_strip_whitespace=True)

    report_id: Optional[str] = Field(None, alias="reportId", max_length=64)
    title: str = Field(..., min_length=1, max_length=200)
    description: str = Field(..., min_length=1, max_length=5000)
    equipment_id: str = Field(..., alias="equipmentId", min_length=1, max_length=64)
    equipment_name: str = Field(..., alias="equipmentName", min_length=1, max_length=200)
    priority: str = "medium"
    status: str = "draft"
    assigned_to: Optional[str] = Field(None, alias="assignedTo", max_length=64)
    assigned_to_name: Optional[str] = Field(None, alias="assignedToName", max_length=120)

    @field_validator("priority")
    @classmethod
    def normalize_priority(cls, v: str) -> str:
        value = (v or "medium").strip().lower()
        return value if value in VALID_PRIORITIES else "medium"

    @field_validator("status")
    @classmethod
    def normalize_status(cls, v: str) -> str:
        value = (v or "draft").strip().lower()
        if value not in VALID_STATUSES:
            raise ValueError(f"status must be one of {sorted(VALID_STATUSES)}")
        return value


class AssignPayload(BaseModel):
    model_config = ConfigDict(populate_by_name=True, str_strip_whitespace=True)

    technician_id: str = Field(..., alias="technicianId", min_length=1, max_length=64)
    technician_name: Optional[str] = Field(None, alias="technicianName", max_length=120)


class UpdateStatusPayload(BaseModel):
    status: str = Field(..., min_length=1, max_length=32)

    @field_validator("status")
    @classmethod
    def validate_status(cls, v: str) -> str:
        value = v.strip().lower()
        if value not in VALID_STATUSES:
            raise ValueError(f"status must be one of {sorted(VALID_STATUSES)}")
        return value


def _resolve_technician_name(
    db: Session, technician_id: Optional[str], fallback: Optional[str] = None
) -> Optional[str]:
    if fallback:
        return fallback
    if not technician_id:
        return None
    technician = db.get(Technician, technician_id)
    return technician.name if technician else technician_id


@router.post("")
def create_work_order(
    payload: CreateWorkOrderPayload,
    db: Session = Depends(get_db),
    current_user: dict = Depends(get_current_user),
):
    report_id = payload.report_id
    if report_id:
        report = db.get(Report, report_id)
        if not report:
            raise HTTPException(status_code=404, detail="Report not found")
    else:
        # Create a linked draft report if not supplied
        report_id = f"R-{uuid.uuid4().hex[:8].upper()}"
        report = Report(
            id=report_id,
            worker_id=current_user.get("id") or "tech-001",
            worker_name=current_user.get("name") or "Field Technician",
            equipment_id=payload.equipment_id,
            equipment_name=payload.equipment_name,
            equipment_machine_number=payload.equipment_id,
            issue=payload.title,
            observation=payload.description,
            category="general",
            severity=payload.priority,
            language="english",
            transcription=payload.description,
            missing_fields=[],
            status="draft",
        )
        db.add(report)

    wo_id = f"WO-FN-{uuid.uuid4().hex[:4].upper()}"
    wo = WorkOrder(
        id=wo_id,
        report_id=report_id,
        title=payload.title,
        description=payload.description,
        equipment_id=payload.equipment_id,
        equipment_name=payload.equipment_name,
        priority=payload.priority,
        status=payload.status or "awaiting_assignment",
        assigned_to=payload.assigned_to,
        assigned_to_name=_resolve_technician_name(
            db, payload.assigned_to, payload.assigned_to_name
        ),
    )
    db.add(wo)
    db.commit()
    db.refresh(wo)
    return _to_dict(wo)


@router.get("")
def list_work_orders(
    page: int = Query(1, ge=1),
    limit: int = Query(20, ge=1, le=100),
    status: Optional[str] = Query(None),
    search: Optional[str] = Query(None),
    db: Session = Depends(get_db),
    current_user: dict = Depends(get_current_user),
):
    q = db.query(WorkOrder).options(joinedload(WorkOrder.report))
    if status and status != "all":
        q = q.filter(WorkOrder.status == status)
    if search and search.strip():
        term = f"%{search.strip()}%"
        q = q.filter(
            (WorkOrder.title.ilike(term))
            | (WorkOrder.description.ilike(term))
            | (WorkOrder.equipment_name.ilike(term))
        )
    total = q.count()
    items = q.order_by(WorkOrder.created_at.desc()).offset((page - 1) * limit).limit(limit).all()
    return {
        "data": [_to_dict(wo) for wo in items],
        "total": total,
        "page": page,
        "limit": limit,
        "totalPages": (total + limit - 1) // limit if limit > 0 else 1,
    }


@router.get("/escalation-candidates")
def list_escalation_candidates(
    db: Session = Depends(get_db),
    current_user: dict = Depends(get_current_user),
):
    """Work orders past their priority-based escalation deadline."""
    return {
        "data": [_to_dict(wo) for wo in find_escalation_candidates(db)],
    }


@router.get("/{wo_id}")
def get_work_order(
    wo_id: str,
    db: Session = Depends(get_db),
    current_user: dict = Depends(get_current_user),
):
    wo = (
        db.query(WorkOrder)
        .options(joinedload(WorkOrder.report))
        .filter(WorkOrder.id == wo_id)
        .first()
    )
    if not wo:
        raise HTTPException(status_code=404, detail="Work order not found")
    return _to_dict(wo)


@router.post("/{wo_id}/assign")
def assign_work_order(
    wo_id: str,
    payload: AssignPayload,
    db: Session = Depends(get_db),
    current_user: dict = Depends(get_current_user),
):
    wo = db.get(WorkOrder, wo_id)
    if not wo:
        raise HTTPException(status_code=404, detail="Work order not found")

    technician = db.get(Technician, payload.technician_id)
    wo.assigned_to = payload.technician_id
    wo.assigned_to_name = _resolve_technician_name(
        db, payload.technician_id, payload.technician_name
    )
    wo.status = "assigned"

    # Keep the roster consistent with the assignment.
    if technician:
        technician.availability = "busy"
        technician.current_work_order_id = wo.id

    db.commit()
    db.refresh(wo)
    return _to_dict(wo)


@router.patch("/{wo_id}/status")
def update_status(
    wo_id: str,
    payload: UpdateStatusPayload,
    db: Session = Depends(get_db),
    current_user: dict = Depends(get_current_user),
):
    wo = db.get(WorkOrder, wo_id)
    if not wo:
        raise HTTPException(status_code=404, detail="Work order not found")

    previous_status = wo.status
    wo.status = payload.status
    if payload.status == "resolved":
        wo.resolved_at = datetime.now(timezone.utc)

        # Free up the assigned technician when work is completed.
        if wo.assigned_to:
            technician = db.get(Technician, wo.assigned_to)
            if technician and technician.current_work_order_id in (None, wo.id):
                technician.availability = "available"
                technician.current_work_order_id = None
                if previous_status != "resolved":
                    technician.completed = (technician.completed or 0) + 1

    db.commit()
    db.refresh(wo)
    return _to_dict(wo)


def _to_dict(wo: WorkOrder) -> dict:
    report_dict = None
    if wo.report:
        report_dict = {
            "id": wo.report.id,
            "transcription": wo.report.transcription,
            "category": wo.report.category,
            "observation": wo.report.observation,
            "severity": wo.report.severity,
            "language": wo.report.language,
        }
    return {
        "id": wo.id,
        "reportId": wo.report_id,
        "title": wo.title,
        "description": wo.description,
        "equipmentId": wo.equipment_id,
        "equipmentName": wo.equipment_name,
        "priority": wo.priority,
        "status": wo.status,
        "assignedTo": wo.assigned_to_name or wo.assigned_to or "Unassigned",
        "assignedToId": wo.assigned_to,
        "createdAt": wo.created_at.isoformat() if wo.created_at else None,
        "updatedAt": wo.updated_at.isoformat() if wo.updated_at else None,
        "resolvedAt": wo.resolved_at.isoformat() if wo.resolved_at else None,
        "report": report_dict,
    }
