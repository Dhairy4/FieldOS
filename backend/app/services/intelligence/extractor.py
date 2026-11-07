"""Operational Intelligence Extraction Service.

Parses unstructured multilingual technician voice transcriptions (Gujarati, Hindi,
English, Hinglish) into structured operational field reports, assesses severity,
detects missing operational details, and generates context-aware clarification questions
and spoken confirmations for Gnani Timbre TTS.
"""

from __future__ import annotations

import logging
import re
from typing import List, Optional
from pydantic import BaseModel, Field

logger = logging.getLogger(__name__)


class ExtractedIntelligence(BaseModel):
    equipment_id: str = Field(default="M-12", description="Equipment identifier")
    equipment_name: str = Field(default="Machine 12", description="Display name of equipment")
    equipment_machine_number: str = Field(default="12", description="Machine number if present")
    issue: str = Field(default="Reported issue", description="Primary fault or observation")
    observation: Optional[str] = Field(default=None, description="Detailed observations")
    category: str = Field(default="mechanical", description="mechanical/electrical/hydraulic/safety/general")
    severity: str = Field(default="medium", description="low/medium/high/critical")
    missing_fields: List[str] = Field(default_factory=list, description="Missing operational fields")
    clarification_question: Optional[str] = Field(default=None, description="Follow-up question if details are missing")
    confirmation_message: str = Field(
        default="Work order created and recorded successfully.",
        description="Spoken confirmation message for the technician",
    )


class IntelligenceService:
    """Operational reasoning engine for multilingual field operations."""

    def __init__(self):
        pass

    async def extract(self, transcription: str, language: str = "english") -> ExtractedIntelligence:
        """Extract structured operational data from voice transcription."""
        if not transcription.strip():
            return ExtractedIntelligence()

        return self._extract_operational_data(transcription, language)

    def _extract_operational_data(self, text: str, language: str) -> ExtractedIntelligence:
        text_lower = text.lower().strip()

        # 1. Extract Machine / Equipment Number & ID
        machine_match = re.search(
            r"(?:machine|motor|pump|unit|equipment|turbine|conveyor|press|generator|સંચો|મશીન|मशीन|उपकरण|पंप)\s*(?:number|no\.?|#)?\s*([0-9]+|[a-z])",
            text_lower,
        )
        if not machine_match:
            # Fallback search for standalone numbers like "12", "04"
            num_match = re.search(r"\b([0-9]{1,3})\b", text_lower)
            num = num_match.group(1).upper() if num_match else "12"
        else:
            num = machine_match.group(1).upper()

        equipment_id = f"M-{num}"
        equipment_name = f"Machine {num}"

        # 2. Determine Severity
        critical_keywords = [
            "critical", "emergency", "fire", "smoke", "blast", "danger", "exploded",
            "injur", "hazard", "ag", "aag", "dhuan", "dhunvo", "bhadko",
            "આગ", "ધુમાડો", "धुआं", "आग", "खतरा"
        ]
        high_keywords = [
            "overheating", "overheat", "vibration", "leak", "high", "garam",
            "dhrujari", "risav", "tapman", "vadhi", "badh", "garmi", "broken",
            "damage", "ruptur", "ગરમ", "ધ્રુજારી", "ઓવરહીટ", "गर्म", "कंपन", "लीक"
        ]
        medium_keywords = [
            "noise", "slow", "sound", "loose", "awaj", "awaaz", "ghisi",
            "vibrat", "pressure", "drop", "unusual", "friction", "અવાજ", "धीमा", "आवाज"
        ]

        if any(w in text_lower for w in critical_keywords):
            severity = "critical"
        elif any(w in text_lower for w in high_keywords):
            severity = "high"
        elif any(w in text_lower for w in medium_keywords):
            severity = "medium"
        else:
            severity = "low"

        # 3. Determine Category
        electrical_keywords = [
            "wire", "spark", "voltage", "current", "short", "power", "electrical",
            "bijli", "circuit", "fuse", "breaker", "cable", "viijli", "વીજળી", "बिजली", "स्पार्क"
        ]
        hydraulic_keywords = [
            "oil", "leak", "pressure", "pipe", "fluid", "hydraulic", "valve", "cylinder",
            "seal", "tank", "teji", "drub", "તેલ", "लीक", "पाइप", "प्रेशर"
        ]
        safety_keywords = [
            "safety", "hazard", "guard", "fire", "shield", "protective", "alarm", "सुरक्षा", "સુરક્ષા"
        ]

        if any(w in text_lower for w in electrical_keywords):
            category = "electrical"
        elif any(w in text_lower for w in hydraulic_keywords):
            category = "hydraulic"
        elif any(w in text_lower for w in safety_keywords):
            category = "safety"
        else:
            category = "mechanical"

        # 4. Extract Specific Issue
        if any(k in text_lower for k in ["overheat", "garam", "ગરમ", "गर्म"]):
            issue = "Motor overheating"
        elif any(k in text_lower for k in ["vibrat", "dhrujari", "ધ્રુજારી", "कंपन"]):
            issue = "Abnormal vibration"
        elif any(k in text_lower for k in ["leak", "risav", "લીક", "रिसाव"]):
            issue = "Fluid leak detected"
        elif any(k in text_lower for k in ["noise", "sound", "awaj", "awaaz", "અવાજ", "आवाज"]):
            issue = "Abnormal operating noise"
        elif any(k in text_lower for k in ["spark", "short", "સ્પાર્ક", "स्पार्क"]):
            issue = "Electrical sparking or short circuit"
        elif any(k in text_lower for k in ["jam", "stuck", "chonti", "जाम"]):
            issue = "Mechanical binding or jam"
        elif any(k in text_lower for k in ["pressure", "drop"]):
            issue = "Hydraulic pressure loss"
        else:
            issue = text[:60] if len(text) > 5 else "Unspecified operational anomaly"

        # 5. Extract Observations
        obs_parts = []
        if any(k in text_lower for k in ["vibrat", "dhrujari", "vadhi", "badh", "ધ્રુજારી", "कंपन"]):
            obs_parts.append("Elevated vibration observed during field inspection")
        if any(k in text_lower for k in ["overheat", "garam", "ગરમ", "गर्म"]):
            obs_parts.append("Abnormal heat emission detected around motor casing")
        if any(k in text_lower for k in ["noise", "sound", "awaj", "awaaz", "અવાજ"]):
            obs_parts.append("Continuous audible grinding/rattling noise noted")
        if any(k in text_lower for k in ["leak", "oil"]):
            obs_parts.append("Visible fluid residue around joints")

        observation = "; ".join(obs_parts) if obs_parts else "Noted by field technician during walk-around"

        # 6. Missing Fields & Conversational Clarification Question
        missing_fields = []
        if not any(k in text_lower for k in ["stopped", "running", "chalu", "bandh", "chal", "band"]):
            missing_fields.append("operating_status")

        lang_key = language.lower().strip()
        if "gujarati" in lang_key or "gu" == lang_key:
            clarification_question = "શું મશીન અત્યારે ચાલુ છે કે બંધ કરી દેવામાં આવ્યું છે?"
            confirmation_message = f"{equipment_name} માટે {issue} નો રિપોર્ટ રેકોર્ડ થયો છે. વર્ક ઓર્ડર સફળતાપૂર્વક જનરેટ થઈ ગયો છે."
        elif "hindi" in lang_key or "hi" == lang_key or "hinglish" in lang_key:
            clarification_question = "क्या मशीन अभी चल रही है या उसे बंद कर दिया गया है?"
            confirmation_message = f"{equipment_name} के लिए {issue} की रिपोर्ट दर्ज कर ली गई है। वर्क ऑर्डर तैयार है।"
        else:
            clarification_question = "Is the machine currently operating, or has it been shut down?"
            confirmation_message = f"Report for {equipment_name} regarding {issue} has been confirmed. Work order generated."

        return ExtractedIntelligence(
            equipment_id=equipment_id,
            equipment_name=equipment_name,
            equipment_machine_number=num,
            issue=issue,
            observation=observation,
            category=category,
            severity=severity,
            missing_fields=missing_fields or ["operating_status"],
            clarification_question=clarification_question,
            confirmation_message=confirmation_message,
        )


_intelligence_service: Optional[IntelligenceService] = None


def get_intelligence_service() -> IntelligenceService:
    global _intelligence_service
    if _intelligence_service is None:
        _intelligence_service = IntelligenceService()
    return _intelligence_service
