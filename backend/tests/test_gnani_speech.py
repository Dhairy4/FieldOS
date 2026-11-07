"""Unit tests for Gnani speech integration and multilingual intelligence service."""

import pytest
from app.services.speech.gnani import GnaniSpeechService, LANGUAGE_MAP, to_wav_pcm
from app.services.intelligence.extractor import IntelligenceService


@pytest.mark.asyncio
async def test_gnani_speech_service_language_mapping():
    svc = GnaniSpeechService()
    assert svc._resolve_language_code("gujarati") == "gu-IN"
    assert svc._resolve_language_code("hindi") == "hi-IN"
    assert svc._resolve_language_code("hinglish") == "hi-IN"
    assert svc._resolve_language_code("english") == "en-IN"
    assert svc._resolve_language_code("marathi") == "mr-IN"


@pytest.mark.asyncio
async def test_gnani_speech_empty_audio_raises_error():
    svc = GnaniSpeechService(api_key="")
    with pytest.raises(ValueError, match="empty or too short"):
        await svc.stt(b"", "english")


@pytest.mark.asyncio
async def test_gnani_speech_fallback_transcription():
    svc = GnaniSpeechService(api_key="")
    guj = svc._fallback_transcription("gujarati")
    assert "મશીન" in guj or "મોટર" in guj

    hin = svc._fallback_transcription("hindi")
    assert "मशीन" in hin or "मोटर" in hin


@pytest.mark.asyncio
async def test_gnani_chime_generation():
    svc = GnaniSpeechService(api_key="")
    audio = svc._generate_chime()
    assert audio.startswith(b"RIFF")
    assert len(audio) > 1000


@pytest.mark.asyncio
async def test_multilingual_intelligence_extractor():
    extractor = IntelligenceService()

    # Gujarati
    res_gu = await extractor.extract("મશીન નંબર 12 માં મોટર ગરમ થઈ ગઈ છે અને ધ્રુજારી છે.", "gujarati")
    assert res_gu.equipment_id == "M-12"
    assert res_gu.issue == "Motor overheating"
    assert res_gu.severity == "high"
    assert "મશીન" in res_gu.clarification_question

    # Hindi
    res_hi = await extractor.extract("मशीन 14 में बहुत ज्यादा धुआं और आग लग गई है, तुरंत इमरजेंसी है।", "hindi")
    assert res_hi.equipment_id == "M-14"
    assert res_hi.severity == "critical"
    assert "मशीन" in res_hi.clarification_question

    # English Hydraulic
    res_en = await extractor.extract("Machine 7 hydraulic oil pipe is leaking heavily.", "english")
    assert res_en.equipment_id == "M-7"
    assert res_en.category == "hydraulic"
    assert "leak" in res_en.issue.lower()
