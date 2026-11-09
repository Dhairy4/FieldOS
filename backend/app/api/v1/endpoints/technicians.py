"""Technician roster endpoints — persisted in the database."""

from typing import List, Optional

from fastapi import APIRouter, Depends
from pydantic import BaseModel
from sqlalchemy.orm import Session

from app.api.v1.endpoints.auth import get_current_user
from app.db.session import get_db
from app.models.technician import Technician

router = APIRouter()


class TechnicianOut(BaseModel):
    id: str
    name: str
    role: str
    availability: str  # available / busy / offline
    currentWO: Optional[str] = "—"
    completed: int = 0
    phone: str = ""


@router.get("", response_model=List[TechnicianOut])
def list_technicians(
    db: Session = Depends(get_db),
    current_user: dict = Depends(get_current_user),
):
    technicians = db.query(Technician).order_by(Technician.id).all()
    return [
        TechnicianOut(
            id=t.id,
            name=t.name,
            role=t.role,
            availability=t.availability,
            currentWO=t.current_work_order_id or "—",
            completed=t.completed,
            phone=t.phone,
        )
        for t in technicians
    ]
