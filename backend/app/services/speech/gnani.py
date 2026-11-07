"""Gnani AI Speech Service (Prisma ASR + Timbre TTS) with real error reporting."""

from __future__ import annotations

import asyncio
import io
import logging
import math
import subprocess
import wave
from typing import Optional

from app.core.config import settings
from app.services.speech.base import SpeechService

logger = logging.getLogger(__name__)

# Map common language names to Gnani Indic language codes
LANGUAGE_MAP = {
    "english": "en-IN",
    "en": "en-IN",
    "en-in": "en-IN",
    "hindi": "hi-IN",
    "hi": "hi-IN",
    "hi-in": "hi-IN",
    "gujarati": "gu-IN",
    "gu": "gu-IN",
    "gu-in": "gu-IN",
    "hinglish": "hi-IN",
    "tamil": "ta-IN",
    "ta": "ta-IN",
    "telugu": "te-IN",
    "te": "te-IN",
    "kannada": "kn-IN",
    "kn": "kn-IN",
    "marathi": "mr-IN",
    "mr": "mr-IN",
    "bengali": "bn-IN",
    "bn": "bn-IN",
    "malayalam": "ml-IN",
    "ml": "ml-IN",
    "punjabi": "pa-IN",
    "pa": "pa-IN",
}

# Domain-specific fallback transcripts for field maintenance scenarios
LANG_FALLBACKS = {
    "gujarati": "મશીન નંબર 12 માં મોટર ઓવરહીટિંગ થાય છે અને ધ્રુજારી પણ વધી ગઈ છે.",
    "hindi": "मशीन नंबर 12 में मोटर ओवरहीट हो रही है और वाइब्रेशन बढ़ गया है।",
    "hinglish": "Machine number 12 me motor overheating ho rahi hai, vibration check karna hai.",
    "english": "Machine number 12 motor is overheating and vibration has significantly increased.",
}


def to_wav_pcm(audio_bytes: bytes) -> bytes:
    """Ensure audio is 16kHz mono 16-bit PCM WAV for optimal STT processing."""
    if audio_bytes.startswith(b"RIFF") and len(audio_bytes) > 44:
        return audio_bytes
    try:
        proc = subprocess.run(
            [
                "ffmpeg",
                "-y",
                "-i",
                "pipe:0",
                "-ar",
                "16000",
                "-ac",
                "1",
                "-c:a",
                "pcm_s16le",
                "-f",
                "wav",
                "pipe:1",
            ],
            input=audio_bytes,
            capture_output=True,
            check=True,
        )
        if proc.stdout:
            return proc.stdout
    except Exception as exc:
        logger.warning(f"Audio conversion using ffmpeg skipped: {exc}")
    return audio_bytes


class GnaniSpeechService(SpeechService):
    def __init__(
        self,
        api_key: Optional[str] = None,
        base_url: Optional[str] = None,
        voice: Optional[str] = None,
        tts_model: Optional[str] = None,
    ):
        self.api_key = (api_key if api_key is not None else settings.GNANI_API_KEY).strip()
        self.base_url = (base_url or settings.GNANI_BASE_URL).rstrip("/")
        self.voice = voice or settings.GNANI_TTS_VOICE or "Pranav"
        self.tts_model = tts_model or settings.GNANI_TTS_MODEL or "timbre-v2.5"

        self._stt_client = None
        self._tts_client = None

        if self.api_key:
            try:
                from gnani.stt import GnaniSTTClient
                from gnani.tts import GnaniTTSClient

                self._stt_client = GnaniSTTClient(
                    api_key=self.api_key,
                    base_url=self.base_url,
                )
                self._tts_client = GnaniTTSClient(
                    api_key=self.api_key,
                    base_url=self.base_url,
                )
                logger.info("Gnani AI STT & TTS clients initialized successfully.")
            except Exception as exc:
                logger.warning(f"Failed to initialize Gnani SDK clients: {exc}")

    def _resolve_language_code(self, language: str) -> str:
        return LANGUAGE_MAP.get(language.lower().strip(), "en-IN")

    async def stt(self, audio_bytes: bytes, language: str = "english") -> str:
        """Transcribe audio bytes using Gnani Prisma Speech-to-Text with descriptive errors."""
        if not audio_bytes or len(audio_bytes) < 50:
            raise ValueError("Audio recording is empty or too short. Please speak clearly into the microphone.")

        lang_code = self._resolve_language_code(language)

        if not self._stt_client:
            if not self.api_key:
                raise ValueError("GNANI_API_KEY is not set. Please set your Gnani API key in backend/.env")
            raise RuntimeError("Gnani Prisma STT client could not be initialized.")

        try:
            wav_bytes = to_wav_pcm(audio_bytes)
            result = await asyncio.to_thread(
                self._stt_client.transcribe_bytes,
                wav_bytes,
                filename="audio.wav",
                language_code=lang_code,
            )
            transcript = (
                result.get("transcript")
                or result.get("text")
                or result.get("data", {}).get("transcript")
                or ""
            ).strip()

            if transcript:
                logger.info(f"Gnani Prisma STT transcribed: {transcript[:60]}...")
                return transcript

            # Empty transcript returned by Prisma
            logger.warning(f"Gnani Prisma STT returned empty transcript: {result}")
            raise ValueError("No intelligible speech detected in the audio. Please hold the button, speak closer to the mic, and try again.")
        except ValueError:
            raise
        except Exception as exc:
            logger.error(f"Gnani Prisma STT request failed: {exc}")
            raise RuntimeError(f"Gnani Prisma STT error: {exc}")

    def _fallback_transcription(self, language: str) -> str:
        lang_key = language.lower().strip()
        return LANG_FALLBACKS.get(lang_key, LANG_FALLBACKS["english"])

    async def tts(self, text: str, language: str = "english") -> bytes:
        """Synthesize text to audio bytes (WAV) using Gnani Timbre Text-to-Speech."""
        if not text:
            return self._generate_chime()

        lang_code = self._resolve_language_code(language)

        if self._tts_client:
            try:
                from gnani.tts import AudioConfig

                audio_cfg = AudioConfig(
                    container="wav",
                    sample_rate=16000,
                    encoding="linear_pcm",
                )
                audio_bytes = await asyncio.to_thread(
                    self._tts_client.synthesize,
                    text=text,
                    voice=self.voice,
                    model=self.tts_model,
                    language=lang_code,
                    audio_config=audio_cfg,
                )
                if audio_bytes and len(audio_bytes) > 44:
                    logger.info(f"Gnani Timbre TTS synthesized {len(audio_bytes)} bytes WAV.")
                    return audio_bytes
                logger.warning("Gnani Timbre TTS returned empty audio.")
            except Exception as exc:
                logger.warning(f"Gnani Timbre TTS synthesis failed: {exc}. Using chime fallback.")

        return self._generate_chime()

    def _generate_chime(self) -> bytes:
        """Fallback synthetic confirmation chime if TTS is unavailable."""
        sample_rate = 16000
        duration_s = 0.5
        n_samples = int(sample_rate * duration_s)
        buf = io.BytesIO()
        with wave.open(buf, "wb") as wf:
            wf.setnchannels(1)
            wf.setsampwidth(2)
            wf.setframerate(sample_rate)
            frames = bytearray()
            for i in range(n_samples):
                val = int(12000.0 * math.sin(2.0 * math.pi * 520.0 * i / sample_rate))
                frames.extend(val.to_bytes(2, byteorder="little", signed=True))
            wf.writeframes(frames)
        return buf.getvalue()

    async def aclose(self):
        """Cleanup resources if needed."""
        pass
