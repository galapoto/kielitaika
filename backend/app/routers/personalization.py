"""Personalization API endpoints."""

from fastapi import APIRouter, HTTPException
from app.services import personalization_service

router = APIRouter()


@router.post("/learning-plan")
async def generate_learning_plan(payload: dict):
    """Generate personalized learning plan for user."""
    user_id = payload.get("user_id")
    
    if not user_id:
        raise HTTPException(status_code=400, detail="user_id is required")
    
    plan = await personalization_service.generate_learning_plan(user_id)
    return {"plan": plan}


@router.post("/track")
async def track_progress(payload: dict):
    """Track a progress event."""
    user_id = payload.get("user_id")
    event = payload.get("event", {})
    
    if not user_id:
        raise HTTPException(status_code=400, detail="user_id is required")
    
    await personalization_service.track_progress(user_id, event)
    return {"status": "tracked"}
