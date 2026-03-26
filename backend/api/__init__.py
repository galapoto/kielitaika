from __future__ import annotations

from fastapi import APIRouter

from .auth_routes import build_auth_router
from .cards_routes import build_cards_router
from .payment_routes import build_payment_router
from .roleplay_routes import build_roleplay_router
from .subscription_routes import build_subscription_router
from .voice_routes import build_voice_router
from .websocket_routes import build_websocket_router
from .yki_routes import build_yki_router


def all_routers() -> list[APIRouter]:
    return [
        build_auth_router(),
        build_subscription_router(),
        build_payment_router(),
        build_cards_router(),
        build_roleplay_router(),
        build_voice_router(),
        build_yki_router(),
        build_websocket_router(),
    ]
