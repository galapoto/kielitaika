"""Streaming STT client using OpenAI Whisper API."""

import io
import tempfile
from collections.abc import AsyncIterator

import httpx
from app.core.config import get_settings
from app.core.logger import logger

settings = get_settings()
WHISPER_URL = "https://api.openai.com/v1/audio/transcriptions"


async def stream_stt(audio_chunks: AsyncIterator[bytes]) -> AsyncIterator[str]:
    """
    Accept incoming audio chunks and yield transcript segments.
    
    Note: OpenAI Whisper API doesn't support true streaming, so we collect
    chunks until we have enough data, then transcribe. For real-time feel,
    we yield partial results as they become available.
    
    Audio format: Expects WebM/Opus from browser MediaRecorder API.
    """
    if not settings.openai_api_key:
        # Development stub: yield placeholder
        async for _ in audio_chunks:
            yield "..."
        return
    
    # Collect audio chunks into a buffer
    audio_buffer = io.BytesIO()
    chunk_count = 0
    min_chunk_size = 1000  # Minimum bytes before attempting transcription
    
    async for chunk in audio_chunks:
        if chunk:
            audio_buffer.write(chunk)
            chunk_count += 1
            
            # Transcribe every 20 chunks or when buffer is substantial
            # This gives a pseudo-streaming effect
            if (chunk_count % 20 == 0 or audio_buffer.tell() > 50000) and audio_buffer.tell() > min_chunk_size:
                transcript = await _transcribe_audio(audio_buffer.getvalue())
                if transcript:
                    yield transcript
                    # Keep some overlap for context (keep last 20% of buffer)
                    overlap_size = int(audio_buffer.tell() * 0.2)
                    audio_buffer.seek(-overlap_size, io.SEEK_END)
                    remaining = audio_buffer.read()
                    audio_buffer = io.BytesIO(remaining)
                    chunk_count = 0
    
    # Final transcription of remaining audio
    if audio_buffer.tell() > min_chunk_size:
        transcript = await _transcribe_audio(audio_buffer.getvalue())
        if transcript:
            yield transcript


async def _transcribe_audio(audio_data: bytes) -> str:
    """
    Call OpenAI Whisper API to transcribe audio.
    
    Supports multiple audio formats: webm, mp3, mp4, mpeg, mpga, m4a, wav
    """
    if not audio_data or len(audio_data) < 100:  # Minimum audio size
        return ""
    
    headers = {
        "Authorization": f"Bearer {settings.openai_api_key}",
    }
    
    # Try to detect format from data, default to webm (common from browser)
    # OpenAI Whisper can auto-detect, but we'll be explicit
    audio_format = "webm"
    
    # Create a temporary file-like object for the audio
    # OpenAI API expects multipart form data with file
    files = {
        "file": ("audio.webm", audio_data, "audio/webm"),
    }
    data = {
        "model": "whisper-1",
        "language": "fi",  # Finnish - helps accuracy
        "response_format": "json",  # or "text", "srt", "verbose_json", "vtt"
    }
    
    try:
        async with httpx.AsyncClient(timeout=30.0) as client:
            response = await client.post(
                WHISPER_URL,
                headers=headers,
                files=files,
                data=data,
            )
            response.raise_for_status()
            result = response.json()
            return result.get("text", "").strip()
    except httpx.HTTPStatusError as exc:
        # Log HTTP errors
        logger.error(f"STT HTTP error: {exc.response.status_code} - {exc.response.text}")
        return ""
    except Exception as exc:
        # Log other errors but don't crash
        logger.error(f"STT error: {exc}", exc_info=True)
        return ""


async def transcribe_audio(audio_data: bytes) -> str:
    """
    Convenience wrapper to transcribe a full audio blob.
    
    This is used by the HTTP upload endpoint as a non-streaming fallback.
    """
    return await _transcribe_audio(audio_data)
