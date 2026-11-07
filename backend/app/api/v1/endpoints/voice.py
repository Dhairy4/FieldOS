"""Voice endpoints — speech-to-text, text-to-speech, and operational extraction."""

from typing import Optional
from fastapi import APIRouter, UploadFile, File, Form, HTTPException, Depends, Response
from pydantic import BaseModel

from app.services.speech.factory import get_speech_service
from app.services.speech.base import SpeechService
from app.services.intelligence.extractor import (
    get_intelligence_service,
    IntelligenceService,
    ExtractedIntelligence,
)

router = APIRouter()


class ExtractRequest(BaseModel):
    transcription: str
    language: str = "english"


class TTSRequest(BaseModel):
    text: str
    language: str = "english"


@router.post("/transcribe")
async def transcribe(
    audio: Optional[UploadFile] = File(None),
    language: str = Form("english"),
    transcript_hint: Optional[str] = Form(None),
    speech: SpeechService = Depends(get_speech_service),
    intelligence: IntelligenceService = Depends(get_intelligence_service),
):
    """Transcribe uploaded audio to text using Gnani Prisma, and extract operational intelligence."""
    if transcript_hint and transcript_hint.strip():
        transcription = transcript_hint.strip()
    elif audio:
        audio_bytes = await audio.read()
        if not audio_bytes or len(audio_bytes) < 50:
            raise HTTPException(
                status_code=400,
                detail="Audio recording is empty or too short. Please hold to record your voice.",
            )
        try:
            transcription = await speech.stt(audio_bytes, language)
        except ValueError as exc:
            raise HTTPException(status_code=400, detail=str(exc))
        except Exception as exc:
            raise HTTPException(status_code=502, detail=str(exc))
    else:
        raise HTTPException(
            status_code=400,
            detail="Either audio recording or text transcription must be provided.",
        )

    # Extract intelligence using FieldOS operational reasoning engine
    extracted = await intelligence.extract(transcription, language)

    return {
        "transcription": transcription,
        "language": language,
        "extracted": extracted.model_dump(),
    }


@router.post("/extract", response_model=ExtractedIntelligence)
async def extract_intelligence(
    payload: ExtractRequest,
    intelligence: IntelligenceService = Depends(get_intelligence_service),
):
    """Extract structured operational data from transcription using FieldOS reasoning engine."""
    if not payload.transcription.strip():
        raise HTTPException(status_code=400, detail="Transcription cannot be empty")
    return await intelligence.extract(payload.transcription, payload.language)


@router.post("/tts")
async def text_to_speech(
    payload: TTSRequest,
    speech: SpeechService = Depends(get_speech_service),
):
    """Synthesize text to audio (WAV) using Gnani Timbre TTS."""
    audio_bytes = await speech.tts(payload.text, payload.language)
    return Response(content=audio_bytes, media_type="audio/wav")
