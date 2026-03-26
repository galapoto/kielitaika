from __future__ import annotations

from typing import Any

from fastapi import APIRouter, Header, Request

from ..middleware.request_id import get_request_id
from ..core.responses import success_payload
from ..services.auth_service import current_user_from_authorization
from ..services.subscription_service import subscription_status


def build_subscription_router() -> APIRouter:
    router = APIRouter(prefix="/api/v1")

    @router.get("/subscription/status")
    async def get_subscription_status(request: Request, authorization: str | None = Header(default=None)) -> dict[str, Any]:
        user, _ = current_user_from_authorization(authorization)
        return success_payload(data=subscription_status(user=user), request_id=get_request_id(request))

    return router
