from __future__ import annotations

from typing import Any

from ..core.errors import AppError
from ..voice.runtime import pronunciation_feedback, save_voice_file


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
    audio_ref, _ = save_voice_file(
        raw_bytes=raw_bytes,
        filename=filename,
        mime_type=mime_type,
        mode=mode,
        session_id=session_id,
        task_id=task_id,
        turn_id=turn_id,
    )
    return {
        "ok": False,
        "transcript": "",
        "language": locale,
        "confidence": None,
        "duration_ms": duration_ms,
        "provider": "unavailable",
        "normalized_format": mime_type,
        "audio_ref": audio_ref,
        "warnings": ["STT_UNAVAILABLE", "RETRY_ALLOWED"],
    }


def create_tts_request(*, payload: dict[str, Any]) -> dict[str, Any]:
    raise AppError(503, "VOICE_TTS_UNAVAILABLE", "TTS provider is not configured.", True, {"classification": "retryable"})


def analyze_pronunciation(*, expected_text: str, transcript: str) -> dict[str, Any]:
    return pronunciation_feedback(expected_text=expected_text, transcript=transcript)
