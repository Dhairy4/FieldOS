"""Technicians endpoints — roster and availability."""

from typing import List, Optional
from fastapi import APIRouter
from pydantic import BaseModel

router = APIRouter()


class Technician(BaseModel):
    id: str
    name: str
    role: str
    availability: str  # available / busy / offline
    currentWO: Optional[str] = "—"
    completed: int = 0
    phone: str = "+91 98765 43210"


TECHNICIANS_DATA = [
    Technician(id="T-001", name="R. Patel", role="Senior Maintenance Tech", availability="available", currentWO="—", completed=28),
    Technician(id="T-002", name="S. Sharma", role="Mechanical Specialist", availability="busy", currentWO="WO-FN-001", completed=19),
    Technician(id="T-003", name="A. Khan", role="Electrical Engineer", availability="available", currentWO="—", completed=34),
    Technician(id="T-004", name="M. Singh", role="HVAC & Pump Specialist", availability="available", currentWO="—", completed=15),
]


@router.get("", response_model=List[Technician])
def list_technicians():
    return TECHNICIANS_DATA
