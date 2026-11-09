"""FieldOS Backend Application Entrypoint."""

import logging
import time
from collections import defaultdict, deque
from contextlib import asynccontextmanager
from threading import Lock

from fastapi import Depends, FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from sqlalchemy import text
from sqlalchemy.orm import Session

from app.api.v1.endpoints import auth, reports, technicians, voice, work_orders
from app.core.config import settings
from app.db.seed import seed_demo_data
from app.db.session import get_db, init_db

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s %(levelname)s %(name)s %(message)s",
)
logger = logging.getLogger("fieldos")

# Lightweight in-process rate limiting for expensive voice endpoints. This is a
# guardrail against accidental abuse; for multi-instance deployments use a
# shared store (Redis) or an API gateway.
_voice_hits: dict[str, deque] = defaultdict(deque)
_voice_lock = Lock()


@asynccontextmanager
async def lifespan(app: FastAPI):
    # Development/test convenience: create tables for the local SQLite DB.
    # Production relies on `alembic upgrade head` (run by the container entrypoint).
    if not settings.is_production:
        init_db()
    seed_demo_data()
    logger.info("FieldOS API started (env=%s)", settings.APP_ENV)
    yield
    logger.info("FieldOS API shutting down")


app = FastAPI(
    title="FieldOS API",
    description="Voice-first multilingual field operations intelligence platform",
    version="1.0.0",
    lifespan=lifespan,
)


@app.middleware("http")
async def limit_voice_requests(request: Request, call_next):
    if request.method != "OPTIONS" and request.url.path.startswith("/api/v1/voice"):
        client_ip = request.client.host if request.client else "unknown"
        now = time.monotonic()
        window = 60.0
        with _voice_lock:
            hits = _voice_hits[client_ip]
            while hits and now - hits[0] > window:
                hits.popleft()
            if len(hits) >= settings.VOICE_RATE_LIMIT_PER_MINUTE:
                return JSONResponse(
                    status_code=429,
                    content={
                        "detail": "Too many voice requests. Please wait a moment and try again."
                    },
                )
            hits.append(now)
    return await call_next(request)


# Added last so it wraps the rate limiter and CORS headers are present even on
# 429 responses.
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins_list,
    allow_credentials=True,
    allow_methods=["GET", "POST", "PATCH", "PUT", "DELETE", "OPTIONS"],
    allow_headers=["Authorization", "Content-Type"],
)


# API v1 routes only — the duplicate root-level mounts were removed to avoid
# ambiguous routing and duplicate OpenAPI entries.
app.include_router(auth.router, prefix="/api/v1/auth", tags=["auth"])
app.include_router(voice.router, prefix="/api/v1/voice", tags=["voice"])
app.include_router(reports.router, prefix="/api/v1/reports", tags=["reports"])
app.include_router(work_orders.router, prefix="/api/v1/work-orders", tags=["work-orders"])
app.include_router(technicians.router, prefix="/api/v1/technicians", tags=["technicians"])


@app.get("/health")
def health(db: Session = Depends(get_db)):
    try:
        db.execute(text("SELECT 1"))
        database_up = True
    except Exception:  # noqa: BLE001 - health check must not raise
        database_up = False

    return {
        "status": "ok" if database_up else "degraded",
        "database": "up" if database_up else "down",
        "environment": settings.APP_ENV,
    }
