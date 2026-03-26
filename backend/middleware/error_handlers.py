from __future__ import annotations

from fastapi import FastAPI, Request
from fastapi.responses import JSONResponse

from ..core.errors import AppError
from ..core.responses import error_payload
from .request_id import get_request_id


def register_error_handlers(app: FastAPI) -> None:
    @app.exception_handler(AppError)
    async def handle_app_error(request: Request, exc: AppError) -> JSONResponse:
        return JSONResponse(status_code=exc.status_code, content=error_payload(request_id=get_request_id(request), error=exc))

    @app.exception_handler(Exception)
    async def handle_unexpected_error(request: Request, exc: Exception) -> JSONResponse:  # pragma: no cover - defensive path
        error = AppError(500, "INTERNAL_SERVER_ERROR", "Internal server error.", True, {"classification": "retryable"})
        return JSONResponse(status_code=500, content=error_payload(request_id=get_request_id(request), error=error))
