from __future__ import annotations

from typing import Any

from fastapi import APIRouter, File, Form, Header, Request, UploadFile

from ..middleware.request_id import get_request_id
from ..models.api_models import PronunciationAnalyzeRequest
from ..core.responses import success_payload
from ..services.auth_service import current_user_from_authorization
from ..services.voice_service import analyze_pronunciation, create_tts_request, transcribe_audio


def build_voice_router() -> APIRouter:
    router = APIRouter(prefix="/api/v1")

    @router.post("/voice/stt/transcriptions")
    async def transcribe_audio_route(
        request: Request,
        file: UploadFile = File(...),
        mime_type: str = Form(...),
        duration_ms: int | None = Form(default=None),
        session_id: str = Form(...),
        speaking_session_id: str | None = Form(default=None),
        turn_id: str | None = Form(default=None),
        task_id: str | None = Form(default=None),
        mode: str = Form(...),
        locale: str = Form(default="fi-FI"),
        authorization: str | None = Header(default=None),
    ) -> dict[str, Any]:
        current_user_from_authorization(authorization)
        raw = await file.read()
        data = transcribe_audio(
            raw_bytes=raw,
            filename=file.filename or "audio.bin",
            mime_type=mime_type,
            duration_ms=duration_ms,
            session_id=session_id,
            speaking_session_id=speaking_session_id,
            turn_id=turn_id,
            task_id=task_id,
            mode=mode,
            locale=locale,
        )
        return success_payload(data=data, request_id=get_request_id(request))

    @router.post("/voice/tts/requests")
    async def create_tts_request_route(request: Request, payload: dict[str, Any], authorization: str | None = Header(default=None)) -> dict[str, Any]:
        current_user_from_authorization(authorization)
        return success_payload(data=create_tts_request(payload=payload), request_id=get_request_id(request))

    @router.post("/voice/pronunciation/analyze")
    async def analyze_pronunciation_route(request: Request, payload: PronunciationAnalyzeRequest, authorization: str | None = Header(default=None)) -> dict[str, Any]:
        current_user_from_authorization(authorization)
        return success_payload(
            data=analyze_pronunciation(expected_text=payload.expected_text, transcript=payload.transcript),
            request_id=get_request_id(request),
        )

    return router
