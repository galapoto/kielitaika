"""Application configuration placeholders."""

from pydantic_settings import BaseSettings

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

    # Azure Speech
    azure_speech_key: str | None = None
    azure_speech_region: str | None = None
    azure_default_voice: str | None = None

    class Config:
        env_file = ".env"

