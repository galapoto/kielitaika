"""TTS provider and voice resolution logic.

Pure functions for determining which TTS provider and voice would be used
if TTS were enabled. No side effects, no API calls, no audio generation.
"""

from typing import TYPE_CHECKING

if TYPE_CHECKING:
    from app.core.config import Settings


def resolve_tts_provider(settings: "Settings") -> str | None:
    """
    Resolve which TTS provider should be used.
    
    Args:
        settings: Settings instance with TTS configuration
        
    Returns:
        Provider name ("elevenlabs" or "azure") or None if not configured
    """
    if not settings.tts_default_provider:
        return None
    
    return settings.tts_default_provider


def resolve_tts_voice(settings: "Settings", provider: str) -> str | None:
    """
    Resolve which voice should be used for the given provider.
    
    Args:
        settings: Settings instance with TTS configuration
        provider: Provider name ("elevenlabs" or "azure")
        
    Returns:
        Voice ID/name string or None if not configured
    """
    if provider == "elevenlabs":
        # Use default voice if present
        if settings.eleven_default_voice:
            return settings.eleven_default_voice
        
        # Else use first element of voice_ids list
        if settings.eleven_voice_ids:
            # Ensure it's a list (validators should handle this, but be safe)
            voice_ids = settings.eleven_voice_ids
            if isinstance(voice_ids, list) and len(voice_ids) > 0:
                return voice_ids[0]
        
        return None
    
    if provider == "azure":
        # Use default voice if present
        if settings.azure_default_voice:
            return settings.azure_default_voice
        
        # Else use first element of voices list
        if settings.azure_speech_voices:
            # Ensure it's a list (validators should handle this, but be safe)
            voices = settings.azure_speech_voices
            if isinstance(voices, list) and len(voices) > 0:
                return voices[0]
        
        return None
    
    return None
