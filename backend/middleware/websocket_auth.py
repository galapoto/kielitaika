from __future__ import annotations

import json

from fastapi import WebSocket

from ..core.errors import AppError
from ..services.auth_service import get_current_user


async def authorize_websocket(ws: WebSocket) -> None:
    token = ws.query_params.get("token")
    try:
        get_current_user(access_token=str(token or ""))
    except AppError:
        await ws.accept()
        await ws.send_text(json.dumps({"type": "error", "error_code": "AUTH_REQUIRED", "message": "Authentication is required."}))
        await ws.close(code=4401)
        raise
