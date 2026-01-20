from fastapi import APIRouter, HTTPException
from app.services.subscription_service import (
    get_subscription_status,
    upgrade_user,
    downgrade_user,
    enforce_feature,
    SubscriptionTier,
)

router = APIRouter()


@router.get("/status")
async def status(user_id: str | None = None):
    """Get user's subscription status."""
    return get_subscription_status(user_id)


@router.post("/upgrade")
async def upgrade(payload: dict):
    """Upgrade user to a subscription tier."""
    user_id = payload.get("user_id")
    tier_str = payload.get("tier", "general_premium")
    trial_days = payload.get("trial_days", 0)
    
    if not user_id:
        raise HTTPException(status_code=400, detail="user_id is required")
    
    try:
        tier = SubscriptionTier(tier_str)
    except ValueError:
        raise HTTPException(status_code=400, detail=f"Invalid tier: {tier_str}")
    
    return upgrade_user(user_id, tier, trial_days)


@router.post("/downgrade")
async def downgrade(payload: dict):
    """Downgrade user to free tier."""
    user_id = payload.get("user_id")
    
    if not user_id:
        raise HTTPException(status_code=400, detail="user_id is required")
    
    return downgrade_user(user_id)


@router.post("/check-feature")
async def check_feature(payload: dict):
    """Check if user has access to a feature."""
    user_id = payload.get("user_id")
    feature = payload.get("feature")
    
    if not feature:
        raise HTTPException(status_code=400, detail="feature is required")
    
    allowed, reason = await enforce_feature(feature, user_id)
    
    return {
        "feature": feature,
        "allowed": allowed,
        "reason": reason,
        "tier": get_subscription_status(user_id).get("tier"),
    }
