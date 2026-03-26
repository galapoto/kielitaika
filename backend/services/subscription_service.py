from __future__ import annotations

from typing import Any

from ..core.config import SETTINGS
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


def _is_subscription_active(user: dict[str, Any]) -> bool:
    tier = str(user.get("subscription_tier") or "free")
    if tier == "free":
        return True
    expires_at = parse_iso(user.get("subscription_expires_at"))
    if expires_at is None:
        return True
    return expires_at > utc_now()


def _trial_active(user: dict[str, Any]) -> bool:
    trial_ends_at = parse_iso(user.get("trial_ends_at"))
    return bool(trial_ends_at and trial_ends_at > utc_now())


def _effective_tier(user: dict[str, Any]) -> str:
    tier = str(user.get("subscription_tier") or "free")
    return tier if _is_subscription_active(user) else "free"


def _feature_map(user: dict[str, Any]) -> dict[str, dict[str, Any]]:
    effective_tier = _effective_tier(user)
    features = TIER_FEATURES[effective_tier]
    if effective_tier == str(user.get("subscription_tier") or "free"):
        return features

    blocked_features: dict[str, dict[str, Any]] = {}
    for feature, config in features.items():
        blocked_features[feature] = dict(config)
        if feature in {"workplace", "yki"}:
            blocked_features[feature]["available"] = False
            blocked_features[feature]["limit"] = 0
            blocked_features[feature]["unit"] = "expired"
            blocked_features[feature]["message"] = "Subscription expired."
    return blocked_features


def subscription_status(*, user: dict[str, Any]) -> dict[str, Any]:
    purchased_tier = str(user.get("subscription_tier") or "free")
    if SETTINGS.dev_mode:
        dev_features = {
            feature: {
                **config,
                "available": True,
                "limit": -1,
                "unit": "unlimited",
                "message": "Dev mode override enabled.",
            }
            for feature, config in TIER_FEATURES["professional_premium"].items()
        }
        return {
            "user_id": user["user_id"],
            "tier": "professional_premium",
            "billing_tier": purchased_tier,
            "features": dev_features,
            "expires_at": user.get("subscription_expires_at"),
            "trial_ends_at": user.get("trial_ends_at"),
            "is_trial": _trial_active(user),
            "is_active": True,
        }
    effective_tier = _effective_tier(user)
    return {
        "user_id": user["user_id"],
        "tier": effective_tier,
        "billing_tier": purchased_tier,
        "features": _feature_map(user),
        "expires_at": user.get("subscription_expires_at"),
        "trial_ends_at": user.get("trial_ends_at"),
        "is_trial": _trial_active(user),
        "is_active": _is_subscription_active(user),
    }


def payment_status(*, user: dict[str, Any]) -> dict[str, Any]:
    status = subscription_status(user=user)
    return {
        "user_id": user["user_id"],
        "billing_tier": status["billing_tier"],
        "effective_tier": status["tier"],
        "is_active": status["is_active"],
        "expires_at": status["expires_at"],
        "trial_ends_at": status["trial_ends_at"],
        "payment_state": "free" if status["billing_tier"] == "free" else ("active" if status["is_active"] else "expired"),
    }


def check_feature(*, user: dict[str, Any], feature: str) -> dict[str, Any]:
    status = subscription_status(user=user)
    feature_payload = status["features"].get(feature)
    if not feature_payload:
        raise AppError(400, "VALIDATION_ERROR", "Unknown feature.", False, {"classification": "non_retryable", "feature": feature})
    return {
        "feature": feature,
        "allowed": bool(feature_payload.get("available")),
        "message": feature_payload.get("message"),
        "subscription": status,
    }


def require_feature(*, user: dict[str, Any], feature: str) -> None:
    if SETTINGS.dev_mode:
        return
    result = check_feature(user=user, feature=feature)
    if not result["allowed"]:
        raise AppError(
            403,
            "ENTITLEMENT_REQUIRED",
            str(result["message"] or "Feature is not available."),
            False,
            {"classification": "non_retryable", "feature": feature},
        )
