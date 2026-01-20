"""Payment and subscription payment routes."""

from fastapi import APIRouter, HTTPException, Request, Header, Depends
from fastapi.security import HTTPBearer
from typing import Optional
from pydantic import BaseModel

from app.services.stripe_service import (
    create_checkout_session,
    create_customer_portal_session,
    handle_webhook_event,
    verify_webhook_signature,
)
from app.routers.auth import get_current_user
from app.db.models import User
from app.services.subscription_service import upgrade_user, SubscriptionTier

router = APIRouter(prefix="/payments", tags=["payments"])
security = HTTPBearer()


class CheckoutRequest(BaseModel):
    tier: str
    trial_days: int = 0
    success_url: str = "ruka://subscription/success"
    cancel_url: str = "ruka://subscription/cancel"


@router.post("/create-checkout")
async def create_checkout(
    request: CheckoutRequest,
    current_user: User = Depends(get_current_user),
):
    """Create Stripe Checkout session for subscription upgrade."""
    try:
        tier = SubscriptionTier(request.tier)
    except ValueError:
        raise HTTPException(status_code=400, detail=f"Invalid tier: {request.tier}")
    
    if tier == SubscriptionTier.FREE:
        raise HTTPException(status_code=400, detail="Cannot create checkout for free tier")
    
    try:
        session = create_checkout_session(
            user_id=current_user.id,
            tier=request.tier,
            success_url=request.success_url,
            cancel_url=request.cancel_url,
            trial_days=request.trial_days,
        )
        return session
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/create-portal")
async def create_portal(
    return_url: str = "ruka://subscription",
    current_user: User = Depends(get_current_user),
):
    """Create Stripe Customer Portal session for managing subscription."""
    try:
        session = create_customer_portal_session(
            user_id=current_user.id,
            return_url=return_url,
        )
        return session
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/webhook")
async def stripe_webhook(
    request: Request,
    stripe_signature: Optional[str] = Header(None, alias="stripe-signature"),
):
    """Handle Stripe webhook events."""
    payload = await request.body()
    
    if not stripe_signature:
        raise HTTPException(status_code=400, detail="Missing stripe-signature header")
    
    # Verify webhook signature
    if not verify_webhook_signature(payload, stripe_signature):
        raise HTTPException(status_code=400, detail="Invalid webhook signature")
    
    # Parse event
    import json
    event = json.loads(payload)
    
    # Handle event
    result = handle_webhook_event(event)
    
    # TODO: Update user subscription in database based on webhook event
    # For now, return the result
    return {
        "received": True,
        "event_type": event.get("type"),
        "result": result,
    }
