import logging

from sqlalchemy import create_engine
from sqlalchemy.orm import declarative_base, sessionmaker

from app.core.config import settings

logger = logging.getLogger(__name__)

Base = declarative_base()

try:
    engine = create_engine(settings.DATABASE_URL, pool_pre_ping=True)
    # Test connection
    with engine.connect() as conn:
        pass
except Exception as e:
    logger.warning(
        f"Failed to connect to primary DATABASE_URL ({settings.DATABASE_URL}): {e}. "
        "Falling back to local SQLite database (sqlite:///./fieldos.db)."
    )
    engine = create_engine("sqlite:///./fieldos.db", connect_args={"check_same_thread": False})

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)


def init_db():
    """Create all tables in the active database engine."""
    from app.models.report import Report  # noqa: F401
    from app.models.work_order import WorkOrder  # noqa: F401

    Base.metadata.create_all(bind=engine)


# Ensure tables exist on load
try:
    init_db()
except Exception as _e:
    logger.warning(f"Initial table sync deferred: {_e}")


def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
