from fastapi import APIRouter, HTTPException

from app.services import path_engine
from app.services.conversation_engine import run_conversation
from app.services.conversation_engine_v4 import run_conversation_v4
from app.services.subscription_service import enforce_feature, log_feature_usage

router = APIRouter()


@router.post("/send")
async def send_message(payload: dict):
    """
    Receive text from frontend, run conversation engine, return AI reply.
    
    Supports progressive disclosure - returns both full reply and masked version.
    Uses Conversation Engine v4 for advanced adaptation.
    """
    user_text = payload.get("text", "")
    user_id = payload.get("user_id")
    level = payload.get("level", "A1")
    correction_mode = payload.get("correction_mode", "medium")
    if payload.get("confidence_mode"):
        correction_mode = "confidence"
    path = path_engine.determine_path(payload.get("user_settings"), payload.get("path"))
    profession = payload.get("profession")
    enable_progressive_disclosure = payload.get("enable_progressive_disclosure", True)
    use_v4 = payload.get("use_v4_engine", True)  # Default to v4

    # Subscription gating based on path
    feature_key = "general_finnish"
    if path == "workplace":
        feature_key = "workplace"
    elif path == "yki":
        feature_key = "yki"

    allowed, reason = await enforce_feature(feature_key, user_id)
    if not allowed:
        raise HTTPException(status_code=402, detail=reason or "Subscription required")

    if use_v4:
        response = await run_conversation_v4(
            user_text=user_text,
            user_id=user_id,
            level=level,
            correction_mode=correction_mode,
            path=path,
            profession=profession,
            enable_progressive_disclosure=enable_progressive_disclosure,
        )
    else:
        # Fallback to v1 for compatibility
        response = await run_conversation(
            user_text=user_text,
            user_id=user_id,
            level=level,
            correction_mode=correction_mode,
            path=path,
            profession=profession,
            enable_progressive_disclosure=enable_progressive_disclosure,
        )

    await log_feature_usage(user_id, feature_key)
    return {"response": response}
