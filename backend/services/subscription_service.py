from __future__ import annotations

from typing import Any

from ..core.errors import AppError
from ..core.utils import parse_iso, utc_now


TIER_FEATURES: dict[str, dict[str, dict[str, Any]]] = {
    "free": {
        "general_finnish": {"available": True, "limit": 10, "unit": "conversations_per_week", "message": "Limited to 10 conversations/week"},
        "workplace": {"available": True, "limit": 3, "unit": "lessons_total", "message": "Limited to 3 lessons total"},
        "yki": {"available": True, "limit": 1, "unit": "speaking_attempts_per_month", "message": "Limited to 1 attempt/month"},
    },
    "general_premium": {
        "general_finnish": {"available": True, "limit": -1, "unit": "unlimited", "message": "Unlimited"},
        "workplace": {"available": False, "limit": 0, "unit": "not_available", "message": "Requires Professional Premium"},
        "yki": {"available": False, "limit": 0, "unit": "not_available", "message": "Requires Professional Premium"},
    },
    "professional_premium": {
        "general_finnish": {"available": True, "limit": -1, "unit": "unlimited", "message": "Unlimited"},
        "workplace": {"available": True, "limit": -1, "unit": "unlimited", "message": "Unlimited"},
        "yki": {"available": True, "limit": -1, "unit": "unlimited", "message": "Unlimited"},
    },
}


def subscription_status(*, user: dict[str, Any]) -> dict[str, Any]:
    tier = user.get("subscription_tier", "free")
    features = TIER_FEATURES[tier]
    return {
        "user_id": user["user_id"],
        "tier": tier,
        "features": features,
        "expires_at": user.get("subscription_expires_at"),
        "trial_ends_at": user.get("trial_ends_at"),
        "is_trial": bool(user.get("trial_ends_at") and (parse_iso(user.get("trial_ends_at")) or utc_now()) > utc_now()),
        "is_active": True if tier == "free" else (not user.get("subscription_expires_at") or (parse_iso(user.get("subscription_expires_at")) or utc_now()) > utc_now()),
    }


def require_feature(*, user: dict[str, Any], feature: str) -> None:
    status = subscription_status(user=user)
    feature_payload = status["features"].get(feature)
    if not feature_payload or not feature_payload.get("available"):
        raise AppError(403, "ENTITLEMENT_REQUIRED", feature_payload.get("message", "Feature is not available."), False, {"classification": "non_retryable", "feature": feature})
