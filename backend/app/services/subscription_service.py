"""Subscription Service v2 - Full subscription management with tier enforcement."""

from __future__ import annotations

from typing import Dict, Optional
from datetime import datetime, timedelta
from enum import Enum
import os

from sqlalchemy import select, func, and_
from sqlalchemy.ext.asyncio import AsyncSession

from app.db.database import get_session
from app.db.models import UsageLog


class SubscriptionTier(str, Enum):
    """Subscription tiers."""
    FREE = "free"
    GENERAL_PREMIUM = "general_premium"
    PROFESSIONAL_PREMIUM = "professional_premium"


DEV_TEST_USER_IDS = set(
    filter(None, os.getenv("DEV_TEST_USER_IDS", "2731b648-0764-4aab-a406-7a0138ce1618").split(","))
)

TIER_FEATURES = {
    SubscriptionTier.FREE: {
        "general_finnish": {"limit": 10, "unit": "conversations_per_week"},
        "workplace": {"limit": 3, "unit": "lessons_total"},
        "yki": {"limit": 1, "unit": "speaking_attempts_per_month"},
        "pronunciation": True,
        "progressive_disclosure": True,
        "grammar_correction": "light",
        "vocabulary": {"limit": 20, "unit": "words_per_day"},
    },
    SubscriptionTier.GENERAL_PREMIUM: {
        "general_finnish": {"limit": -1, "unit": "unlimited"},
        "workplace": {"limit": 0, "unit": "not_available"},
        "yki": {"limit": 0, "unit": "not_available"},
        "pronunciation": True,
        "progressive_disclosure": True,
        "grammar_correction": "full",
        "vocabulary": {"limit": -1, "unit": "unlimited"},
        "personalization": True,
        "analytics": True,
    },
    SubscriptionTier.PROFESSIONAL_PREMIUM: {
        "general_finnish": {"limit": -1, "unit": "unlimited"},
        "workplace": {"limit": -1, "unit": "unlimited"},
        "yki": {"limit": -1, "unit": "unlimited"},
        "pronunciation": True,
        "progressive_disclosure": True,
        "grammar_correction": "full",
        "vocabulary": {"limit": -1, "unit": "unlimited"},
        "personalization": True,
        "analytics": True,
        "exam_simulation": True,
        "certificates": True,
        "employer_reports": True,
    },
}


# In-memory store (would be database in production)
_user_subscriptions: Dict[str, Dict] = {}


def get_user_tier(user_id: str | None) -> SubscriptionTier:
    """Get user's subscription tier."""
    if not user_id:
        return SubscriptionTier.FREE

    if user_id in DEV_TEST_USER_IDS:
        return SubscriptionTier.PROFESSIONAL_PREMIUM
    
    subscription = _user_subscriptions.get(user_id, {})
    tier_str = subscription.get("tier", SubscriptionTier.FREE.value)
    
    try:
        return SubscriptionTier(tier_str)
    except ValueError:
        return SubscriptionTier.FREE


def get_subscription_status(user_id: str | None) -> Dict:
    """Return full subscription status for a user."""
    tier = get_user_tier(user_id)
    subscription = _user_subscriptions.get(user_id, {}) if user_id else {}
    
    return {
        "user_id": user_id,
        "tier": tier.value,
        "features": TIER_FEATURES[tier],
        "expires_at": subscription.get("expires_at"),
        "trial_ends_at": subscription.get("trial_ends_at"),
        "is_trial": _is_trial_active(user_id),
        "is_active": _is_subscription_active(user_id),
    }


async def enforce_feature(feature: str, user_id: str | None) -> tuple[bool, Optional[str]]:
    """
    Enforce feature access based on subscription tier.
    
    Returns:
        (allowed: bool, reason: str | None)
    """
    tier = get_user_tier(user_id)
    features = TIER_FEATURES.get(tier, TIER_FEATURES[SubscriptionTier.FREE])
    
    # Check if feature exists
    if feature not in features:
        return False, f"Feature '{feature}' not available in any tier"
    
    feature_config = features[feature]
    
    # Boolean features
    if isinstance(feature_config, bool):
        if feature_config:
            return True, None
        else:
            return False, f"Feature '{feature}' requires {SubscriptionTier.GENERAL_PREMIUM.value} or higher"
    
    # Limit-based features (would check actual usage in production)
    if isinstance(feature_config, dict):
        limit = feature_config.get("limit", 0)
        if limit == -1:  # Unlimited
            return True, None
        if limit == 0:  # Not available
            return False, f"Feature '{feature}' requires {SubscriptionTier.PROFESSIONAL_PREMIUM.value}"
        
        usage = await _get_current_usage(user_id, feature, feature_config.get("unit", "total"))
        if usage >= limit:
            return False, f"Limit reached for {feature} ({usage}/{limit} {_get_period_description(feature_config.get('unit', ''))})"
        return True, None
    
    return True, None


def upgrade_user(user_id: str, tier: SubscriptionTier, trial_days: int = 0) -> Dict:
    """Upgrade user to a subscription tier."""
    expires_at = None
    trial_ends_at = None
    
    if trial_days > 0:
        trial_ends_at = (datetime.now() + timedelta(days=trial_days)).isoformat()
    else:
        # Default subscription period (e.g., 30 days)
        expires_at = (datetime.now() + timedelta(days=30)).isoformat()
    
    _user_subscriptions[user_id] = {
        "tier": tier.value,
        "expires_at": expires_at,
        "trial_ends_at": trial_ends_at,
        "upgraded_at": datetime.now().isoformat(),
    }
    
    return get_subscription_status(user_id)


def downgrade_user(user_id: str) -> Dict:
    """Downgrade user to free tier."""
    if user_id in _user_subscriptions:
        _user_subscriptions[user_id] = {
            "tier": SubscriptionTier.FREE.value,
            "downgraded_at": datetime.now().isoformat(),
        }
    
    return get_subscription_status(user_id)


def _is_trial_active(user_id: str | None) -> bool:
    """Check if user has active trial."""
    if not user_id:
        return False
    
    subscription = _user_subscriptions.get(user_id, {})
    trial_ends_at = subscription.get("trial_ends_at")
    
    if not trial_ends_at:
        return False
    
    try:
        trial_end = datetime.fromisoformat(trial_ends_at)
        return datetime.now() < trial_end
    except (ValueError, TypeError):
        return False


def _is_subscription_active(user_id: str | None) -> bool:
    """Check if subscription is active (not expired)."""
    if not user_id:
        return False
    
    tier = get_user_tier(user_id)
    if tier == SubscriptionTier.FREE:
        return True  # Free tier is always "active"
    
    subscription = _user_subscriptions.get(user_id, {})
    expires_at = subscription.get("expires_at")
    
    if not expires_at:
        return True  # No expiration = active
    
    try:
        expiry = datetime.fromisoformat(expires_at)
        return datetime.now() < expiry
    except (ValueError, TypeError):
        return True


async def _get_current_usage(user_id: str | None, feature: str, unit: str) -> int:
    """Get current usage count for a feature within the relevant period."""
    if not user_id:
        return 0
    
    try:
        # Determine time range based on unit
        now = datetime.now()
        if "per_week" in unit:
            start_date = now - timedelta(days=7)
        elif "per_month" in unit:
            start_date = now - timedelta(days=30)
        elif "per_day" in unit:
            start_date = now - timedelta(days=1)
        elif "total" in unit:
            start_date = None  # No time limit
        else:
            # Default to weekly
            start_date = now - timedelta(days=7)
        
        async for session in get_session():
            query = select(func.count(UsageLog.id)).where(
                and_(
                    UsageLog.user_id == user_id,
                    UsageLog.feature == feature,
                )
            )
            
            if start_date:
                query = query.where(UsageLog.created_at >= start_date)
            
            result = await session.execute(query)
            count = result.scalar() or 0
            return count
    except Exception:
        # Fallback: return 0 if database not available
        return 0


def _get_period_description(unit: str) -> str:
    """Get human-readable period description."""
    if "per_week" in unit:
        return "per week"
    elif "per_month" in unit:
        return "per month"
    elif "per_day" in unit:
        return "per day"
    elif "total" in unit:
        return "total"
    else:
        return ""


async def log_feature_usage(user_id: str | None, feature: str) -> None:
    """Log feature usage for subscription limits."""
    if not user_id:
        return
    
    try:
        async for session in get_session():
            usage_log = UsageLog(
                user_id=user_id,
                feature=feature,
                created_at=datetime.now(),
            )
            session.add(usage_log)
            await session.commit()
    except Exception:
        # Silently fail if database not available
        pass
