"""Pluggable voice service interface.

STT (speech-to-text) and TTS (text-to-speech) are behind one small interface so
the backend never depends on a specific provider.  Swap providers by changing
SPEECH_PROVIDER in config - no caller changes needed.
"""

from abc import ABC, abstractmethod


class SpeechService(ABC):
    @abstractmethod
    async def stt(self, audio_bytes: bytes, language: str) -> str:
        """Transcribe audio bytes to text."""

    @abstractmethod
    async def tts(self, text: str, language: str) -> bytes:
        """Synthesize text to audio bytes (WAV)."""
