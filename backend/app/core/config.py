"""Application configuration placeholders."""

from pathlib import Path
from pydantic_settings import BaseSettings
from pydantic import field_validator
from typing import Any, Union

ENV_FILE = Path(__file__).resolve().parents[2] / ".env"

class Settings(BaseSettings):
    # existing
    app_env: str | None = None
    debug: bool = False
    log_level: str | None = None

    openai_api_key: str | None = None
    openai_model: str | None = None
    openai_temperature: float | None = None
    database_url: str | None = None

    # Auth/JWT (schema alignment only; runtime may use constants elsewhere)
    secret_key: str | None = None
    jwt_algorithm: str | None = None
    access_token_expire_minutes: int | None = None
    refresh_token_expire_days: int | None = None
    auth_mode: str | None = None

    port: int = 5000
    host: str = "0.0.0.0"
    public_base_url: str | None = None

    # TTS control
    tts_enabled: bool = False
    tts_default_provider: str = "elevenlabs"
    tts_fallback_provider: str = "azure"
    fail_soft_on_tts_error: bool = True

    # ElevenLabs
    eleven_api_key: str | None = None
    eleven_default_voice: str | None = None
    # ElevenLabs — multi-voice support
    eleven_voice_ids: Union[str, list[str]] = []

    @field_validator('eleven_voice_ids', mode='before')
    @classmethod
    def parse_eleven_voice_ids(cls, v: Any) -> list[str]:
        """Parse comma-separated ELEVEN_VOICE_IDS env var into list."""
        if v is None or v == '':
            return []
        if isinstance(v, list):
            return v
        if isinstance(v, str):
            # Handle comma-separated string
            return [voice_id.strip() for voice_id in v.split(',') if voice_id.strip()]
        return []
    
    @field_validator('eleven_voice_ids', mode='after')
    @classmethod
    def ensure_eleven_voice_ids_list(cls, v: Any) -> list[str]:
        """Ensure eleven_voice_ids is always a list."""
        if isinstance(v, str):
            return [voice_id.strip() for voice_id in v.split(',') if voice_id.strip()]
        if isinstance(v, list):
            return v
        return []

    # Azure Speech
    azure_speech_key: str | None = None
    azure_speech_region: str | None = None
    azure_default_voice: str | None = None
    # Azure Speech — multi-voice support
    azure_speech_voices: Union[str, list[str]] = []

    @field_validator('azure_speech_voices', mode='before')
    @classmethod
    def parse_azure_speech_voices(cls, v: Any) -> list[str]:
        """Parse comma-separated AZURE_SPEECH_VOICES env var into list."""
        if v is None or v == '':
            return []
        if isinstance(v, list):
            return v
        if isinstance(v, str):
            # Handle comma-separated string
            return [voice.strip() for voice in v.split(',') if voice.strip()]
        return []
    
    @field_validator('azure_speech_voices', mode='after')
    @classmethod
    def ensure_azure_speech_voices_list(cls, v: Any) -> list[str]:
        """Ensure azure_speech_voices is always a list."""
        if isinstance(v, str):
            return [voice.strip() for voice in v.split(',') if voice.strip()]
        if isinstance(v, list):
            return v
        return []

    # CORS
    cors_allow_origins: Union[str, list[str]] = []
    cors_allow_credentials: bool = False

    # Dev-only legacy / namespaced env keys (declared for strict schema alignment)
    puhis_eleven_api_key: str | None = None
    puhis_eleven_voice_ids: str | None = None
    puhis_eleven_default_voice: str | None = None
    puhis_eleven_model: str | None = None
    puhis_eleven_stability: float | None = None
    puhis_eleven_similarity: float | None = None

    puhis_azure_speech_key: str | None = None
    puhis_azure_speech_region: str | None = None
    puhis_azure_speech_voices: str | None = None
    puhis_azure_speech_default_voice: str | None = None
    puhis_azure_speech_language: str | None = None

    enable_request_logging: bool = False
    enable_tts_logging: bool = False

    @field_validator('cors_allow_origins', mode='before')
    @classmethod
    def parse_cors_allow_origins(cls, v: Any) -> list[str]:
        """Parse CORS_ALLOW_ORIGINS env var into list."""
        if v is None or v == '':
            return []
        if isinstance(v, list):
            return [str(x).strip() for x in v if str(x).strip()]
        if isinstance(v, str):
            s = v.strip()
            if not s:
                return []
            if s == '*':
                return ['*']
            return [part.strip() for part in s.split(',') if part.strip()]
        return []

    @field_validator('cors_allow_origins', mode='after')
    @classmethod
    def ensure_cors_allow_origins_list(cls, v: Any) -> list[str]:
        if isinstance(v, str):
            s = v.strip()
            return [s] if s else []
        if isinstance(v, list):
            return [str(x).strip() for x in v if str(x).strip()]
        return []

    class Config:
        env_file = str(ENV_FILE)
        extra = "forbid"  # Keep strict env schema enforcement


def get_settings() -> Settings:
    return Settings()

