"""Pytest configuration for FieldOS backend tests.

Uses an isolated SQLite database and deterministic mock speech so tests never
touch the development/production data store or external providers.
"""

import os
import sys
import tempfile

# Ensure backend root is on path
sys.path.insert(0, os.path.dirname(os.path.dirname(__file__)))

# Use mock speech provider during fast unit tests
os.environ.setdefault("SPEECH_PROVIDER", "mock")
os.environ.setdefault("GNANI_API_KEY", "")

# Isolated test database — set BEFORE importing app modules so the engine binds
# to it. Environment variables take precedence over values in `.env`.
_TEST_DIR = tempfile.mkdtemp(prefix="fieldos-tests-")
os.environ["DATABASE_URL"] = f"sqlite:///{os.path.join(_TEST_DIR, 'test.db')}"
os.environ["SECRET_KEY"] = "test-secret-key-for-pytest-only-0123456789abcdef"
os.environ["APP_ENV"] = "test"
os.environ["ALLOW_SQLITE_FALLBACK"] = "true"
os.environ["SEED_DEMO_DATA"] = "true"

import pytest  # noqa: E402
from fastapi.testclient import TestClient  # noqa: E402

from app.db.seed import seed_demo_data  # noqa: E402
from app.db.session import init_db  # noqa: E402
from app.main import app  # noqa: E402


@pytest.fixture(scope="session", autouse=True)
def _prepare_database():
    """Create tables and seed demo users/technicians once for the test session."""
    init_db()
    seed_demo_data()
    yield


@pytest.fixture(scope="session")
def client():
    """TestClient session fixture — app lifespan runs once."""
    with TestClient(app, raise_server_exceptions=False) as c:
        yield c
