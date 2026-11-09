"""Model package — importing this module registers all tables on Base.metadata."""

from app.models.report import Report
from app.models.technician import Technician
from app.models.user import User
from app.models.work_order import WorkOrder

__all__ = ["Report", "Technician", "User", "WorkOrder"]
