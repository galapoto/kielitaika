"""Stripe payment integration service."""

from __future__ import annotations

from typing import Dict, Optional
import os
import stripe

# Initialize Stripe (use test key by default, override with env var)
stripe.api_key = os.getenv("STRIPE_SECRET_KEY", "sk_test_placeholder")

# Subscription price IDs (set these in Stripe dashboard and env)
STRIPE_PRICE_IDS = {
    "general_premium": os.getenv("STRIPE_PRICE_GENERAL_PREMIUM", "price_general_premium"),
    "professional_premium": os.getenv("STRIPE_PRICE_PROFESSIONAL_PREMIUM", "price_professional_premium"),
}

# Webhook secret for verifying webhook events
STRIPE_WEBHOOK_SECRET = os.getenv("STRIPE_WEBHOOK_SECRET", "")


def create_checkout_session(
    user_id: str,
    tier: str,
    success_url: str,
    cancel_url: str,
    trial_days: int = 0,
) -> Dict:
    """
    Create a Stripe Checkout session for subscription.
    
    Args:
        user_id: User ID
        tier: Subscription tier ("general_premium" or "professional_premium")
        success_url: URL to redirect after successful payment
        cancel_url: URL to redirect after cancellation
        trial_days: Number of trial days (0 = no trial)
    
    Returns:
        Checkout session object with URL
    """
    price_id = STRIPE_PRICE_IDS.get(tier)
    if not price_id:
        raise ValueError(f"Invalid tier: {tier}")
    
    try:
        session = stripe.checkout.Session.create(
            customer_email=None,  # Will be set from user record
            payment_method_types=["card"],
            line_items=[
                {
                    "price": price_id,
                    "quantity": 1,
                }
            ],
            mode="subscription",
            subscription_data={
                "metadata": {
                    "user_id": user_id,
                    "tier": tier,
                },
                "trial_period_days": trial_days if trial_days > 0 else None,
            },
            success_url=success_url,
            cancel_url=cancel_url,
            metadata={
                "user_id": user_id,
                "tier": tier,
            },
        )
        
        return {
            "session_id": session.id,
            "url": session.url,
            "checkout_url": session.url,
        }
    except stripe.error.StripeError as e:
        raise Exception(f"Stripe error: {str(e)}")


def create_customer_portal_session(
    user_id: str,
    return_url: str,
) -> Dict:
    """
    Create a Stripe Customer Portal session for managing subscription.
    
    Args:
        user_id: User ID
        return_url: URL to return to after portal session
    
    Returns:
        Portal session object with URL
    """
    # TODO: Get Stripe customer ID from user record
    # For now, this is a placeholder
    try:
        session = stripe.billing_portal.Session.create(
            customer="cus_placeholder",  # TODO: Get from user record
            return_url=return_url,
        )
        
        return {
            "url": session.url,
        }
    except stripe.error.StripeError as e:
        raise Exception(f"Stripe error: {str(e)}")


def handle_webhook_event(event: Dict) -> Dict:
    """
    Handle Stripe webhook events.
    
    Args:
        event: Stripe webhook event data
    
    Returns:
        Processing result
    """
    event_type = event.get("type")
    data = event.get("data", {}).get("object", {})
    
    if event_type == "checkout.session.completed":
        # Subscription created
        subscription_id = data.get("subscription")
        metadata = data.get("metadata", {})
        user_id = metadata.get("user_id")
        tier = metadata.get("tier")
        
        return {
            "action": "subscription_created",
            "user_id": user_id,
            "tier": tier,
            "subscription_id": subscription_id,
        }
    
    elif event_type == "customer.subscription.updated":
        # Subscription updated (tier change, renewal, etc.)
        subscription_id = data.get("id")
        metadata = data.get("metadata", {})
        user_id = metadata.get("user_id")
        status = data.get("status")
        
        return {
            "action": "subscription_updated",
            "user_id": user_id,
            "subscription_id": subscription_id,
            "status": status,
        }
    
    elif event_type == "customer.subscription.deleted":
        # Subscription cancelled
        subscription_id = data.get("id")
        metadata = data.get("metadata", {})
        user_id = metadata.get("user_id")
        
        return {
            "action": "subscription_cancelled",
            "user_id": user_id,
            "subscription_id": subscription_id,
        }
    
    elif event_type == "invoice.payment_succeeded":
        # Payment succeeded
        subscription_id = data.get("subscription")
        customer_id = data.get("customer")
        
        return {
            "action": "payment_succeeded",
            "subscription_id": subscription_id,
            "customer_id": customer_id,
        }
    
    elif event_type == "invoice.payment_failed":
        # Payment failed
        subscription_id = data.get("subscription")
        customer_id = data.get("customer")
        
        return {
            "action": "payment_failed",
            "subscription_id": subscription_id,
            "customer_id": customer_id,
        }
    
    return {
        "action": "ignored",
        "event_type": event_type,
    }


def verify_webhook_signature(payload: bytes, signature: str) -> bool:
    """
    Verify Stripe webhook signature.
    
    Args:
        payload: Raw webhook payload
        signature: Stripe signature header
    
    Returns:
        True if signature is valid
    """
    if not STRIPE_WEBHOOK_SECRET:
        # In development, skip verification if secret not set
        return True
    
    try:
        stripe.Webhook.construct_event(
            payload,
            signature,
            STRIPE_WEBHOOK_SECRET,
        )
        return True
    except stripe.error.SignatureVerificationError:
        return False
