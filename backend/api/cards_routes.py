from __future__ import annotations

from typing import Any

from fastapi import APIRouter, Header, Request

from ..middleware.request_id import get_request_id
from ..models.api_models import AnswerRequest, SessionStartRequest
from ..core.responses import success_payload
from ..services.auth_service import current_user_from_authorization
from ..services.cards_service import answer_card, next_card, start_cards_session


def build_cards_router() -> APIRouter:
    router = APIRouter(prefix="/api/v1")

    @router.post("/cards/session/start")
    async def start_card_session(request: Request, payload: SessionStartRequest, authorization: str | None = Header(default=None)) -> dict[str, Any]:
        user, _ = current_user_from_authorization(authorization)
        data = start_cards_session(
            user_id=user["user_id"],
            domain=payload.domain,
            content_type=payload.content_type,
            profession=payload.profession,
            level=payload.level,
        )
        return success_payload(data=data, request_id=get_request_id(request))

    @router.get("/cards/session/adaptive/start")
    async def start_adaptive_card_session(
        request: Request,
        domain: str,
        content_type: str | None = None,
        profession: str | None = None,
        level: str | None = None,
        limit: int = 10,
        authorization: str | None = Header(default=None),
    ) -> dict[str, Any]:
        user, _ = current_user_from_authorization(authorization)
        data = start_cards_session(
            user_id=user["user_id"],
            domain=domain,
            content_type=content_type,
            profession=profession,
            level=level,
            adaptive=True,
            limit=limit,
        )
        return success_payload(data=data, request_id=get_request_id(request))

    @router.get("/cards/session/{session_id}/next")
    async def next_card_route(request: Request, session_id: str, authorization: str | None = Header(default=None)) -> dict[str, Any]:
        user, _ = current_user_from_authorization(authorization)
        return success_payload(data=next_card(user_id=user["user_id"], session_id=session_id), request_id=get_request_id(request))

    @router.post("/cards/session/{session_id}/answer")
    async def answer_card_route(request: Request, session_id: str, payload: AnswerRequest, authorization: str | None = Header(default=None)) -> dict[str, Any]:
        user, _ = current_user_from_authorization(authorization)
        return success_payload(
            data=answer_card(user_id=user["user_id"], session_id=session_id, user_answer=payload.user_answer),
            request_id=get_request_id(request),
        )

    return router
