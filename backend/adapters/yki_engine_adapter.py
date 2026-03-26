from __future__ import annotations

import asyncio
import json
import urllib.error
import urllib.request
from dataclasses import dataclass
from typing import Any

from ..core.config import SETTINGS
from ..core.errors import AppError


@dataclass
class EngineResponse:
    status_code: int
    payload: Any


def _perform_engine_request_sync(*, method: str, path: str, payload: dict[str, Any] | None = None) -> EngineResponse:
    url = f"{SETTINGS.yki_engine_base_url.rstrip('/')}{path}"
    data = None
    headers = {"Accept": "application/json"}
    if payload is not None:
        body = json.dumps(payload).encode("utf-8")
        data = body
        headers["Content-Type"] = "application/json"
    request = urllib.request.Request(url, data=data, method=method.upper(), headers=headers)
    try:
        with urllib.request.urlopen(request, timeout=30) as response:
            raw = response.read().decode("utf-8")
            parsed = json.loads(raw) if raw else None
            return EngineResponse(status_code=response.status, payload=parsed)
    except urllib.error.HTTPError as exc:
        raw = exc.read().decode("utf-8")
        parsed = json.loads(raw) if raw else None
        return EngineResponse(status_code=exc.code, payload=parsed)
    except Exception as exc:  # pragma: no cover - network path
        raise AppError(503, "YKI_ENGINE_UNAVAILABLE", "YKI engine is unavailable.", True, {"classification": "retryable", "reason": str(exc)}) from exc


async def perform_engine_request(*, method: str, path: str, payload: dict[str, Any] | None = None) -> EngineResponse:
    return await asyncio.to_thread(_perform_engine_request_sync, method=method, path=path, payload=payload)
