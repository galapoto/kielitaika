from __future__ import annotations

from typing import Any

from .config import SETTINGS
from .errors import AppError
from .utils import utc_now


def utc_timestamp() -> str:
    return utc_now().replace(microsecond=0).isoformat()


def success_payload(*, data: Any, request_id: str) -> dict[str, Any]:
    return {
        "ok": True,
        "data": data,
        "error": None,
        "meta": {
            "request_id": request_id,
            "timestamp": utc_timestamp(),
            "api_version": SETTINGS.api_version,
        },
    }


def error_payload(*, request_id: str, error: AppError) -> dict[str, Any]:
    return {
        "ok": False,
        "data": None,
        "error": {
            "code": error.code,
            "message": error.message,
            "retryable": error.retryable,
            "details": error.details or None,
        },
        "meta": {
            "request_id": request_id,
            "timestamp": utc_timestamp(),
            "api_version": SETTINGS.api_version,
        },
    }
