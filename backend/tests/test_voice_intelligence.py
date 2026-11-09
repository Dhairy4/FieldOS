"""Direct route-handler tests for voice intelligence endpoints."""

import asyncio
from app.api.v1.endpoints.voice import extract_intelligence, transcribe, ExtractRequest
from app.api.v1.endpoints.reports import create_report, CreateReportPayload
from app.api.v1.endpoints.work_orders import (
    get_work_order,
    assign_work_order,
    update_status,
    AssignPayload,
    UpdateStatusPayload,
)
from app.api.v1.endpoints.technicians import list_technicians
from app.db.session import SessionLocal
from app.services.intelligence.extractor import ExtractedIntelligence
from app.services.speech.base import SpeechService


class FakeSpeech(SpeechService):
    async def stt(self, audio_bytes: bytes, language: str = "english") -> str:
        return f"Fallback transcript in {language}"

    async def tts(self, text: str, language: str = "english") -> bytes:
        return b"fake-wav-bytes"

    async def aclose(self):
        return None


def _get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


def _get_current_user():
    return {"email": "test@fieldos.ai", "role": "technician"}


def run(coro):
    return asyncio.run(coro)


def test_extract_intelligence_endpoint():
    payload = ExtractRequest(transcription="Machine 12 overheating", language="gujarati")
    result = run(extract_intelligence(payload, FakeIntelligence()))
    assert result.equipment_id == "M-12"
    assert result.issue == "Motor overheating"
    assert result.severity == "high"


def test_transcribe_endpoint_with_hint():
    result = run(transcribe(
        audio=None,
        language="gujarati",
        transcript_hint="Machine 12 motor overheating with vibration.",
        speech=FakeSpeech(),
        intelligence=FakeIntelligence(),
    ))
    assert result["transcription"]
    assert "extracted" in result
    assert result["extracted"]["equipment_id"]


def test_create_report_and_work_order_flow():
    db = next(_get_db())
    from app.models.report import Report
    from app.models.work_order import WorkOrder
    db.query(WorkOrder).delete()
    db.query(Report).delete()
    db.commit()

    # create_report, get_work_order, assign_work_order, update_status are sync
    payload = CreateReportPayload(
        equipment_id="M-14",
        equipment_name="Machine 14",
        equipment_machine_number="14",
        issue="Hydraulic pressure loss",
        observation="Main valve leaking",
        category="hydraulic",
        severity="high",
        language="english",
        transcription="Machine 14 pressure dropping.",
        audio_url=None,
        missing_fields=[],
        worker_id="tech-001",
        worker_name="Test Tech",
    )
    report = create_report(payload, db, _get_current_user())
    assert report["id"].startswith("R-")
    assert report["workOrderId"] is not None
    wo_id = report["workOrderId"]

    wo = get_work_order(wo_id, db)
    assert wo["id"] == wo_id
    assert wo["equipmentId"] == "M-14"

    assigned = assign_work_order(
        wo_id,
        AssignPayload(technician_id="T-001"),
        db,
        _get_current_user(),
    )
    assert assigned["status"] == "assigned"
    assert assigned["assignedTo"] == "R. Patel"

    resolved = update_status(
        wo_id,
        UpdateStatusPayload(status="resolved"),
        db,
        _get_current_user(),
    )
    assert resolved["status"] == "resolved"
    assert resolved["resolvedAt"] is not None

    db.close()


def test_technicians_roster():
    db = next(_get_db())
    try:
        techs = list_technicians(db, _get_current_user())
    finally:
        db.close()
    assert len(techs) >= 4
    assert any(t.name == "R. Patel" for t in techs)


class FakeIntelligence:
    async def extract(self, transcription: str, language: str = "english") -> ExtractedIntelligence:
        return ExtractedIntelligence(
            equipment_id="M-12",
            equipment_name="Machine 12",
            equipment_machine_number="12",
            issue="Motor overheating",
            observation="Vibration observed",
            category="mechanical",
            severity="high",
            missing_fields=["operating_status"],
            clarification_question="Is the machine operating?",
            confirmation_message="Report confirmed.",
        )
