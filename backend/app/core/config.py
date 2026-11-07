from pydantic_settings import BaseSettings, SettingsConfigDict
from pydantic import field_validator


class Settings(BaseSettings):
    DATABASE_URL: str = "postgresql+psycopg://dhairya:dhairya@localhost:5432/fieldos"
    GNANI_API_KEY: str = ""
    GNANI_BASE_URL: str = "https://api.vachana.ai"
    GNANI_TTS_VOICE: str = "Pranav"
    GNANI_TTS_MODEL: str = "timbre-v2.5"
    GNANI_STT_MODEL: str = "prisma-v2.5"
    SPEECH_PROVIDER: str = "gnani"
    SECRET_KEY: str = "dev-secret-change-me"
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 30
    APP_NAME: str = "FieldOS"
    APP_ENV: str = "development"

    @field_validator("GNANI_API_KEY", mode="before")
    @classmethod
    def strip_key(cls, v: str) -> str:
        return v.strip() if isinstance(v, str) else v

    model_config = SettingsConfigDict(
        env_file=(".env", "../.env"),
        env_file_encoding="utf-8",
        extra="ignore",
    )


settings = Settings()
