"""Database engine, session factory, and dependency helpers.

The engine is created lazily-safe at import time. A silent SQLite fallback is
allowed ONLY in development when ``ALLOW_SQLITE_FALLBACK`` is enabled; in
production an unreachable primary database is a hard startup failure so the
outage is loud instead of silently serving stale/inconsistent data.
"""

import logging

from sqlalchemy import create_engine
from sqlalchemy.orm import declarative_base, sessionmaker

from app.core.config import settings

logger = logging.getLogger(__name__)

Base = declarative_base()

SQLITE_FALLBACK_URL = "sqlite:///./fieldos.db"


def _build_engine():
    try:
        engine = create_engine(settings.DATABASE_URL, pool_pre_ping=True)
        # Fail fast if the primary database is unreachable.
        with engine.connect():
            pass
        logger.info("Connected to primary database: %s", _safe_url(settings.DATABASE_URL))
        return engine
    except Exception as exc:  # noqa: BLE001 - startup probe
        if settings.is_production or not settings.ALLOW_SQLITE_FALLBACK:
            logger.critical(
                "Primary database is unreachable (%s) and SQLite fallback is disabled. "
                "Refusing to start.",
                _safe_url(settings.DATABASE_URL),
            )
            raise RuntimeError(
                "Primary database is unreachable and SQLite fallback is disabled. "
                "Fix DATABASE_URL or explicitly enable ALLOW_SQLITE_FALLBACK for "
                "local development only."
            ) from exc

        logger.warning(
            "Primary database is unreachable (%s). Falling back to local SQLite at "
            "'%s' for DEVELOPMENT ONLY. This is never allowed in production.",
            _safe_url(settings.DATABASE_URL),
            SQLITE_FALLBACK_URL,
        )
        logger.debug("Database connection error: %s", exc)
        return create_engine(
            SQLITE_FALLBACK_URL, connect_args={"check_same_thread": False}
        )


def _safe_url(url: str) -> str:
    """Hide credentials before logging a database URL."""
    try:
        scheme, _, rest = url.partition("://")
        if "@" in rest:
            rest = rest.split("@", 1)[1]
        return f"{scheme}://***@{rest}"
    except Exception:  # noqa: BLE001 - best effort
        return "<database>"


engine = _build_engine()

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)


def init_db() -> None:
    """Create tables for the active engine.

    This is called from the application lifespan and from tests — never at
    module import time (which previously broke migrations and test isolation).
    """
    import app.models  # noqa: F401  (registers every model on Base.metadata)

    Base.metadata.create_all(bind=engine)


def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
