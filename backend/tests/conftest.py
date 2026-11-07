"""Pytest configuration for FieldOS backend tests.

Sets up test configuration and ensures external API calls are bypassed
during unit tests (uses fast deterministic fallbacks and mock speech).
"""

import os
import sys

# Ensure backend root is on path
sys.path.insert(0, os.path.dirname(os.path.dirname(__file__)))

# Use mock speech provider during fast unit tests
os.environ.setdefault("SPEECH_PROVIDER", "mock")
os.environ.setdefault("GNANI_API_KEY", "")

import pytest  # noqa: E402
from fastapi.testclient import TestClient  # noqa: E402

from app.main import app  # noqa: E402


@pytest.fixture(scope="session")
def client():
    """TestClient session fixture — app is imported once, lifespan runs once."""
    with TestClient(app, raise_server_exceptions=False) as c:
        yield c
