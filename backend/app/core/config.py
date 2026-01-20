"""Application configuration placeholders."""

try:
    # Pydantic v2
    from pydantic_settings import BaseSettings
except ImportError:  # pragma: no cover - fallback for older environments
    from pydantic import BaseSettings  # type: ignore


class Settings(BaseSettings):
    openai_api_key: str | None = None
    database_url: str | None = None
    port: int = 5000
    host: str = "0.0.0.0"

    class Config:
        env_file = ".env"


def get_settings() -> Settings:
    return Settings()
