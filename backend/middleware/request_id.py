from __future__ import annotations

import os
from typing import Any

from fastapi import FastAPI, Request, Response


def get_request_id(request: Request) -> str:
    return str(getattr(request.state, "request_id", "missing-request-id"))


def register_request_id_middleware(app: FastAPI) -> None:
    @app.middleware("http")
    async def add_request_id(request: Request, call_next: Any) -> Response:
        request.state.request_id = os.urandom(8).hex()
        response = await call_next(request)
        response.headers["X-Request-ID"] = request.state.request_id
        return response
