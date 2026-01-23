"""Application configuration placeholders."""

from pydantic_settings import BaseSettings
from pydantic import field_validator
from typing import Any, Union

class Settings(BaseSettings):
    # existing
    openai_api_key: str | None = None
    database_url: str | None = None
    port: int = 5000
    host: str = "0.0.0.0"

    # TTS control
    tts_enabled: bool = False
    tts_default_provider: str = "elevenlabs"
    tts_fallback_provider: str = "azure"

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

    class Config:
        env_file = ".env"
        extra = "ignore"  # Ignore extra env vars not in schema


def get_settings() -> Settings:
    return Settings()

