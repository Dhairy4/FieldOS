"""Mock speech service — deterministic fallback, no external API needed."""

import io
import logging
import math
import wave

from app.services.speech.base import SpeechService

logger = logging.getLogger(__name__)

# Same contextual fallback samples NimSpeechService already uses when NIM is unavailable.
LANG_SAMPLES = {
    "gujarati": "Machine number 12 ma motor overheating thay chhe, vibration pan vadhi gayu chhe.",
    "hindi": "Machine number 12 me motor overheat ho rahi hai, aur vibration badh gaya hai.",
    "hinglish": "Machine number 12 me motor overheating ho rahi hai, vibration check karna hai.",
    "english": "Machine number 12 motor is overheating and vibration has significantly increased.",
}


class MockSpeechService(SpeechService):
    async def stt(self, audio_bytes: bytes, language: str = "english") -> str:
        return LANG_SAMPLES.get(language.lower(), LANG_SAMPLES["english"])

    async def tts(self, text: str, language: str = "english") -> bytes:
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
        return None
