from typing import List

from pydantic import field_validator, model_validator
from pydantic_settings import BaseSettings, SettingsConfigDict

DEFAULT_SECRET = "dev-secret-change-me"


class Settings(BaseSettings):
    DATABASE_URL: str = "postgresql+psycopg://dhairya:dhairya@localhost:5432/fieldos"
    GNANI_API_KEY: str = ""
    GNANI_BASE_URL: str = "https://api.vachana.ai"
    GNANI_TTS_VOICE: str = "Pranav"
    GNANI_TTS_MODEL: str = "timbre-v2.5"
    GNANI_STT_MODEL: str = "prisma-v2.5"
    SPEECH_PROVIDER: str = "gnani"

    # Security
    SECRET_KEY: str = DEFAULT_SECRET
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 30

    # CORS — comma-separated list of allowed origins.
    CORS_ORIGINS: str = "http://localhost:3001,http://localhost:3002"

    # When the primary database is unreachable, allow falling back to a local
    # SQLite file. This is convenient for local development but MUST be disabled
    # in production so outages are loud instead of silent.
    ALLOW_SQLITE_FALLBACK: bool = True

    # Seed demo users + sample data on startup. Disabled in production.
    SEED_DEMO_DATA: bool = True

    # Upload limits and rate limiting for the voice endpoints.
    MAX_AUDIO_BYTES: int = 10 * 1024 * 1024  # 10 MB
    VOICE_RATE_LIMIT_PER_MINUTE: int = 60
    ALLOWED_AUDIO_TYPES: str = (
        "audio/webm,audio/wav,audio/x-wav,audio/mpeg,audio/mp3,audio/ogg,"
        "audio/mp4,audio/m4a,video/webm,application/octet-stream"
    )

    APP_NAME: str = "FieldOS"
    APP_ENV: str = "development"

    @field_validator("GNANI_API_KEY", mode="before")
    @classmethod
    def strip_key(cls, v: str) -> str:
        return v.strip() if isinstance(v, str) else v

    @property
    def cors_origins_list(self) -> List[str]:
        return [o.strip() for o in self.CORS_ORIGINS.split(",") if o.strip()]

    @property
    def allowed_audio_types_set(self) -> set:
        return {t.strip().lower() for t in self.ALLOWED_AUDIO_TYPES.split(",") if t.strip()}

    @property
    def is_production(self) -> bool:
        return self.APP_ENV.lower() == "production"

    @model_validator(mode="after")
    def validate_production_settings(self) -> "Settings":
        if self.is_production:
            if self.SECRET_KEY == DEFAULT_SECRET or len(self.SECRET_KEY) < 32:
                raise ValueError(
                    "SECRET_KEY must be set to a strong, unique value (>=32 chars) "
                    "when APP_ENV=production."
                )
            if self.ALLOW_SQLITE_FALLBACK:
                # Force-disable the silent SQLite fallback in production.
                self.ALLOW_SQLITE_FALLBACK = False
            if "*" in self.cors_origins_list:
                raise ValueError("CORS_ORIGINS must not contain '*' in production.")
        return self

    model_config = SettingsConfigDict(
        env_file=(".env", "../.env"),
        env_file_encoding="utf-8",
        extra="ignore",
    )


settings = Settings()
