from fastapi import APIRouter, HTTPException

from app.services import workplace_engine
from app.services.subscription_service import enforce_feature, log_feature_usage

router = APIRouter()


@router.get("/fields")
async def list_fields():
    """List supported workplace fields (professions)."""
    fields = workplace_engine.list_fields()
    return {"fields": fields}


@router.post("/lesson")
async def lesson(payload: dict):
    """Return a combined lesson for a field."""
    field = payload.get("field", "")
    level = payload.get("level", "B1")
    user_id = payload.get("user_id")

    allowed, reason = await enforce_feature("workplace", user_id)
    if not allowed:
        raise HTTPException(status_code=402, detail=reason or "Subscription required")

    lesson_data = workplace_engine.get_field_lesson(field, level)
    await log_feature_usage(user_id, "workplace")
    return {"lesson": lesson_data}


@router.post("/dialogue")
async def dialogue(payload: dict):
    """Generate a roleplay scenario for a field."""
    field = payload.get("field", "")
    title = payload.get("scenario_title")
    level = payload.get("level", "B1")
    user_id = payload.get("user_id")

    allowed, reason = await enforce_feature("workplace", user_id)
    if not allowed:
        raise HTTPException(status_code=402, detail=reason or "Subscription required")

    dialogue_data = workplace_engine.generate_field_dialogue(field, title, level)
    await log_feature_usage(user_id, "workplace")
    return dialogue_data


@router.post("/evaluate")
async def evaluate(payload: dict):
    """Evaluate a user's roleplay response."""
    field = payload.get("field", "")
    transcript = payload.get("transcript", "")
    user_id = payload.get("user_id")

    allowed, reason = await enforce_feature("workplace", user_id)
    if not allowed:
        raise HTTPException(status_code=402, detail=reason or "Subscription required")

    evaluation = workplace_engine.evaluate_response(field, transcript)
    await log_feature_usage(user_id, "workplace")
    return evaluation
