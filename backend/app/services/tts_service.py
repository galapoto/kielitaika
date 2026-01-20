"""Streaming TTS client using OpenAI TTS API."""

from collections.abc import AsyncIterator

import httpx
from app.core.config import get_settings
from app.core.logger import logger

settings = get_settings()
TTS_URL = "https://api.openai.com/v1/audio/speech"


async def stream_tts(text: str) -> AsyncIterator[bytes]:
    """
    Accept text and yield synthesized audio chunks using OpenAI TTS.
    
    OpenAI TTS API supports streaming, so we can yield audio chunks
    as they arrive from the API.
    """
    if not text or not text.strip():
        return
    
    if not settings.openai_api_key:
        # Development stub: yield empty chunk
        yield b""
        return
    
    headers = {
        "Authorization": f"Bearer {settings.openai_api_key}",
        "Content-Type": "application/json",
    }
    
    payload = {
        "model": "tts-1",  # Use tts-1-hd for higher quality (more expensive)
        "input": text,
        "voice": "nova",  # Options: alloy, echo, fable, onyx, nova, shimmer
        "response_format": "opus",  # Good for web streaming, or use "mp3"
        "speed": 1.0,  # 0.25 to 4.0
    }
    
    try:
        async with httpx.AsyncClient(timeout=30.0) as client:
            async with client.stream(
                "POST",
                TTS_URL,
                headers=headers,
                json=payload,
            ) as response:
                response.raise_for_status()
                
                # Stream audio chunks as they arrive
                async for chunk in response.aiter_bytes():
                    if chunk:
                        yield chunk
    except Exception as exc:
        # Log error but don't crash
        logger.error(f"TTS error: {exc}", exc_info=True)
        yield b""  # Return empty chunk on error
