"""Factory returning the configured speech service."""

from app.core.config import settings
from app.services.speech.mock import MockSpeechService
from app.services.speech.gnani import GnaniSpeechService


def get_speech_service():
    if settings.SPEECH_PROVIDER == "mock":
        return MockSpeechService()
    return GnaniSpeechService()
