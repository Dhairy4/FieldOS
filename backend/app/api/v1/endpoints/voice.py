"""Voice endpoints — speech-to-text, text-to-speech, and operational extraction."""

import logging
from typing import Optional

from fastapi import (
    APIRouter,
    Depends,
    File,
    Form,
    HTTPException,
    Response,
    UploadFile,
)
from pydantic import BaseModel, Field

from app.api.v1.endpoints.auth import get_current_user
from app.core.config import settings
from app.services.intelligence.extractor import (
    ExtractedIntelligence,
    IntelligenceService,
    get_intelligence_service,
)
from app.services.speech.base import SpeechService
from app.services.speech.factory import get_speech_service

logger = logging.getLogger("fieldos.voice")

router = APIRouter()


class ExtractRequest(BaseModel):
    transcription: str = Field(..., min_length=1, max_length=10000)
    language: str = Field(default="english", max_length=16)


class TTSRequest(BaseModel):
    text: str = Field(..., min_length=1, max_length=2000)
    language: str = Field(default="english", max_length=16)


async def _read_validated_audio(audio: UploadFile) -> bytes:
    """Validate MIME type and size, then read the audio payload."""
    content_type = (audio.content_type or "").split(";")[0].strip().lower()
    allowed = settings.allowed_audio_types_set
    if content_type and content_type not in allowed:
        raise HTTPException(
            status_code=415,
            detail=(
                f"Unsupported audio type '{content_type}'. "
                "Please upload a webm, wav, mp3, ogg, or m4a recording."
            ),
        )

    # Read at most one byte past the limit so we can detect oversize uploads
    # without buffering an arbitrarily large file into memory.
    audio_bytes = await audio.read(settings.MAX_AUDIO_BYTES + 1)
    if not audio_bytes or len(audio_bytes) < 50:
        raise HTTPException(
            status_code=400,
            detail="Audio recording is empty or too short. Please hold to record your voice.",
        )
    if len(audio_bytes) > settings.MAX_AUDIO_BYTES:
        raise HTTPException(
            status_code=413,
            detail=(
                "Audio file is too large. Maximum allowed size is "
                f"{settings.MAX_AUDIO_BYTES // (1024 * 1024)} MB."
            ),
        )
    return audio_bytes


@router.post("/transcribe")
async def transcribe(
    audio: Optional[UploadFile] = File(None),
    language: str = Form("english"),
    transcript_hint: Optional[str] = Form(None),
    speech: SpeechService = Depends(get_speech_service),
    intelligence: IntelligenceService = Depends(get_intelligence_service),
    current_user: dict = Depends(get_current_user),
):
    """Transcribe uploaded audio to text and extract operational intelligence."""
    if transcript_hint and transcript_hint.strip():
        transcription = transcript_hint.strip()
    elif audio:
        audio_bytes = await _read_validated_audio(audio)
        try:
            transcription = await speech.stt(audio_bytes, language)
        except ValueError as exc:
            raise HTTPException(status_code=400, detail=str(exc))
        except Exception:  # noqa: BLE001 - do not leak provider internals
            logger.exception("Speech-to-text provider failed")
            raise HTTPException(
                status_code=502,
                detail="Speech-to-text service is temporarily unavailable.",
            )
    else:
        raise HTTPException(
            status_code=400,
            detail="Either audio recording or text transcription must be provided.",
        )

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
    current_user: dict = Depends(get_current_user),
):
    """Extract structured operational data from a transcription."""
    if not payload.transcription.strip():
        raise HTTPException(status_code=400, detail="Transcription cannot be empty")
    return await intelligence.extract(payload.transcription, payload.language)


@router.post("/tts")
async def text_to_speech(
    payload: TTSRequest,
    speech: SpeechService = Depends(get_speech_service),
    current_user: dict = Depends(get_current_user),
):
    """Synthesize text to audio (WAV)."""
    try:
        audio_bytes = await speech.tts(payload.text, payload.language)
    except ValueError as exc:
        raise HTTPException(status_code=400, detail=str(exc))
    except Exception:  # noqa: BLE001 - do not leak provider internals
        logger.exception("Text-to-speech provider failed")
        raise HTTPException(
            status_code=502, detail="Text-to-speech service is temporarily unavailable."
        )
    return Response(content=audio_bytes, media_type="audio/wav")
