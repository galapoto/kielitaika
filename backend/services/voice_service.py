from __future__ import annotations

from typing import Any

from ..core.errors import AppError
from ..voice.runtime import pronunciation_feedback, save_voice_file

ALLOWED_AUDIO_MIME_TYPES = {"audio/m4a", "audio/mp4", "audio/webm", "audio/ogg", "audio/wav"}


def transcribe_audio(
    *,
    raw_bytes: bytes,
    filename: str,
    mime_type: str,
    duration_ms: int | None,
    session_id: str,
    speaking_session_id: str | None,
    turn_id: str | None,
    task_id: str | None,
    mode: str,
    locale: str,
) -> dict[str, Any]:
    if mode != "yki_exam" and not speaking_session_id:
        raise AppError(400, "VALIDATION_ERROR", "speaking_session_id is required for non-YKI voice modes.", False, {"classification": "non_retryable"})
    if not raw_bytes:
        raise AppError(400, "VALIDATION_ERROR", "Audio file is required.", False, {"classification": "non_retryable"})
    if mime_type not in ALLOWED_AUDIO_MIME_TYPES:
        raise AppError(400, "VALIDATION_ERROR", "Unsupported audio mime type.", False, {"classification": "non_retryable", "mime_type": mime_type})
    if duration_ms is not None and duration_ms < 0:
        raise AppError(400, "VALIDATION_ERROR", "duration_ms must be zero or greater.", False, {"classification": "non_retryable"})
    audio_ref, _ = save_voice_file(
        raw_bytes=raw_bytes,
        filename=filename,
        mime_type=mime_type,
        mode=mode,
        session_id=session_id,
        task_id=task_id,
        turn_id=turn_id,
    )
    raise AppError(
        503,
        "VOICE_STT_UNAVAILABLE",
        "Speech transcription provider is unavailable. Retry is required.",
        True,
        {
            "classification": "retryable",
            "audio_ref": audio_ref,
            "mode": mode,
            "locale": locale,
        },
    )


def create_tts_request(*, payload: dict[str, Any]) -> dict[str, Any]:
    raise AppError(503, "VOICE_TTS_UNAVAILABLE", "TTS provider is not configured.", True, {"classification": "retryable"})


def analyze_pronunciation(*, expected_text: str, transcript: str) -> dict[str, Any]:
    return pronunciation_feedback(expected_text=expected_text, transcript=transcript)
