from __future__ import annotations

from typing import Any

from fastapi import APIRouter, Header, Request

from ..middleware.request_id import get_request_id
from ..models.api_models import GoogleAuthRequest, LoginPasswordRequest, LoginProviderRequest, LogoutRequest, RefreshRequest, RegisterPasswordRequest
from ..core.responses import success_payload
from ..services.auth_service import (
    auth_methods,
    auth_session_payload,
    create_user,
    current_user_from_authorization,
    login_provider,
    login_user,
    logout_auth,
    refresh_auth,
)
from ..services.google_oauth_service import complete_google_oauth, handle_google_callback, start_google_oauth


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

    @router.post("/auth/google")
    async def google_auth_route(request: Request, payload: GoogleAuthRequest) -> dict[str, Any]:
        data = complete_google_oauth(payload.oauth_result_id) if payload.oauth_result_id else start_google_oauth(
            request=request,
            redirect_origin=payload.redirect_origin,
        )
        return success_payload(data=data, request_id=get_request_id(request))

    @router.get("/auth/google/callback", name="google_callback_route")
    async def google_callback_route(
        request: Request,
        code: str | None = None,
        state: str | None = None,
        error: str | None = None,
        error_description: str | None = None,
    ):
        return handle_google_callback(
            request=request,
            code=code,
            state=state,
            error=error,
            error_description=error_description,
        )

    @router.get("/auth/session")
    async def get_auth_session(request: Request, authorization: str | None = Header(default=None)) -> dict[str, Any]:
        user, token_payload = current_user_from_authorization(authorization)
        return success_payload(data=auth_session_payload(user=user, token_payload=token_payload), request_id=get_request_id(request))

    @router.post("/auth/token/refresh")
    async def refresh_route(request: Request, payload: RefreshRequest) -> dict[str, Any]:
        data = refresh_auth(refresh_token=payload.refresh_token)
        return success_payload(data=data, request_id=get_request_id(request))

    @router.post("/auth/logout")
    async def logout_route(request: Request, payload: LogoutRequest, authorization: str | None = Header(default=None)) -> dict[str, Any]:
        data = logout_auth(authorization=authorization, refresh_token=payload.refresh_token)
        return success_payload(data=data, request_id=get_request_id(request))

    return router
