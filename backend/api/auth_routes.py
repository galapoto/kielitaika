from __future__ import annotations

from typing import Any

from fastapi import APIRouter, Header, Request

from ..middleware.request_id import get_request_id
from ..models.api_models import LoginPasswordRequest, LoginProviderRequest, RefreshRequest, RegisterPasswordRequest
from ..core.responses import success_payload
from ..services.auth_service import (
    auth_methods,
    auth_session_payload,
    create_user,
    current_user_from_authorization,
    login_provider,
    login_user,
    refresh_auth,
)


def build_auth_router() -> APIRouter:
    router = APIRouter(prefix="/api/v1")

    @router.get("/auth/methods")
    async def get_auth_methods(request: Request) -> dict[str, Any]:
        return success_payload(data={"methods": auth_methods()}, request_id=get_request_id(request))

    @router.post("/auth/register/password")
    async def register_password(request: Request, payload: RegisterPasswordRequest) -> dict[str, Any]:
        data = create_user(email=payload.email, password=payload.password, name=payload.name)
        return success_payload(data=data, request_id=get_request_id(request))

    @router.post("/auth/login/password")
    async def login_password_route(request: Request, payload: LoginPasswordRequest) -> dict[str, Any]:
        data = login_user(email=payload.email, password=payload.password)
        return success_payload(data=data, request_id=get_request_id(request))

    @router.post("/auth/login/provider")
    async def login_provider_route(request: Request, payload: LoginProviderRequest) -> dict[str, Any]:
        data = login_provider(provider_id=payload.provider_id, provider_token=payload.provider_token)
        return success_payload(data=data, request_id=get_request_id(request))

    @router.get("/auth/session")
    async def get_auth_session(request: Request, authorization: str | None = Header(default=None)) -> dict[str, Any]:
        user, token_payload = current_user_from_authorization(authorization)
        return success_payload(data=auth_session_payload(user=user, token_payload=token_payload), request_id=get_request_id(request))

    @router.post("/auth/token/refresh")
    async def refresh_route(request: Request, payload: RefreshRequest) -> dict[str, Any]:
        data = refresh_auth(refresh_token=payload.refresh_token)
        return success_payload(data=data, request_id=get_request_id(request))

    return router
