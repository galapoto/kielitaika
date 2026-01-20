from fastapi import APIRouter
from app.services.engagement_service import (
    generate_daily_notifications,
    evaluate_engagement_state,
    build_micro_challenge_prompt,
    calculate_xp_reward,
)

router = APIRouter()


@router.get("/notifications")
async def get_notifications(user_id: str | None = None):
    """Get daily notification schedule for user."""
    if not user_id:
        user_id = "anonymous"
    notifications = await generate_daily_notifications(user_id)
    return {"notifications": notifications}


@router.get("/state")
async def get_engagement_state(user_id: str | None = None):
    """Get user's engagement state (streak, encouragement, etc.)."""
    if not user_id:
        user_id = "anonymous"
    state = await evaluate_engagement_state(user_id)
    return state


@router.get("/micro-challenge")
async def get_micro_challenge(user_id: str | None = None):
    """Get a random micro challenge prompt."""
    if not user_id:
        user_id = "anonymous"
    challenge = await build_micro_challenge_prompt(user_id)
    return {"challenge": challenge}


@router.post("/xp")
async def calculate_xp(payload: dict):
    """Calculate XP reward for completed activities."""
    user_id = payload.get("user_id")
    if not user_id:
        return {"error": "user_id required"}
    
    reward = await calculate_xp_reward(
        user_id=user_id,
        vocab_done=payload.get("vocab_done", False),
        grammar_done=payload.get("grammar_done", False),
        challenge_done=payload.get("challenge_done", False),
        conversation_done=payload.get("conversation_done", False),
    )
    return reward


