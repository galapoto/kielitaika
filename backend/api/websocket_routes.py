from __future__ import annotations

import json

from fastapi import APIRouter, WebSocket

from ..core.errors import AppError
from ..middleware.websocket_auth import authorize_websocket


def build_websocket_router() -> APIRouter:
    router = APIRouter(prefix="/api/v1/ws")

    @router.websocket("/voice/stt-stream")
    async def stt_stream(ws: WebSocket) -> None:
        try:
            await authorize_websocket(ws)
        except AppError:
            return
        await ws.accept()
        await ws.send_text(json.dumps({"type": "error", "error_code": "VOICE_STT_UNAVAILABLE", "message": "Streaming STT provider is not configured."}))
        await ws.close(code=1013)

    @router.websocket("/voice/tts-stream")
    async def tts_stream(ws: WebSocket) -> None:
        try:
            await authorize_websocket(ws)
        except AppError:
            return
        await ws.accept()
        await ws.send_text(json.dumps({"type": "error", "source": "tts", "reason": "VOICE_TTS_UNAVAILABLE", "message": "Streaming TTS provider is not configured."}))
        await ws.close(code=1013)

    return router
