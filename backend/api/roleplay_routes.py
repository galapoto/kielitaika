from __future__ import annotations

from typing import Any

from fastapi import APIRouter, Header, Request

from ..middleware.request_id import get_request_id
from ..models.api_models import RoleplayCreateRequest, RoleplayTurnRequest
from ..core.responses import success_payload
from ..services.auth_service import current_user_from_authorization
from ..services.roleplay_service import (
    create_roleplay_session,
    get_roleplay_review,
    get_roleplay_session,
    get_roleplay_transcript,
    submit_roleplay_turn,
)


def build_roleplay_router() -> APIRouter:
    router = APIRouter(prefix="/api/v1")

    def roleplay_success(*, request: Request, data: dict[str, Any]) -> dict[str, Any]:
        return success_payload(data=data, request_id=get_request_id(request))

    @router.post("/roleplay/sessions")
    async def create_roleplay_session_route(request: Request, payload: RoleplayCreateRequest, authorization: str | None = Header(default=None)) -> dict[str, Any]:
        user, _ = current_user_from_authorization(authorization)
        data = create_roleplay_session(
            user_id=user["user_id"],
            scenario_id=payload.scenario_id,
            level=payload.level,
            display_preferences=payload.display_preferences,
        )
        return roleplay_success(request=request, data=data)

    @router.post("/roleplay/sessions/{session_id}/turns")
    async def submit_roleplay_turn_route(request: Request, session_id: str, payload: RoleplayTurnRequest, authorization: str | None = Header(default=None)) -> dict[str, Any]:
        user, _ = current_user_from_authorization(authorization)
        data = submit_roleplay_turn(user_id=user["user_id"], session_id=session_id, user_message=payload.user_message)
        return roleplay_success(request=request, data=data)

    @router.get("/roleplay/sessions/{session_id}")
    async def get_roleplay_session_route(request: Request, session_id: str, authorization: str | None = Header(default=None)) -> dict[str, Any]:
        user, _ = current_user_from_authorization(authorization)
        return roleplay_success(request=request, data=get_roleplay_session(user_id=user["user_id"], session_id=session_id))

    @router.get("/roleplay/sessions/{session_id}/transcript")
    async def get_roleplay_transcript_route(request: Request, session_id: str, authorization: str | None = Header(default=None)) -> dict[str, Any]:
        user, _ = current_user_from_authorization(authorization)
        return roleplay_success(request=request, data=get_roleplay_transcript(user_id=user["user_id"], session_id=session_id))

    @router.get("/roleplay/sessions/{session_id}/review")
    async def get_roleplay_review_route(request: Request, session_id: str, authorization: str | None = Header(default=None)) -> dict[str, Any]:
        user, _ = current_user_from_authorization(authorization)
        return roleplay_success(request=request, data=get_roleplay_review(user_id=user["user_id"], session_id=session_id))

    return router
