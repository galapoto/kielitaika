from fastapi import APIRouter, HTTPException
from app.services import yki_engine, yki_exam_service
from app.services.subscription_service import enforce_feature, log_feature_usage

router = APIRouter()


@router.get("/health")
async def yki_health():
    return {"status": "yki-ready"}


@router.post("/speaking")
async def evaluate_speaking(payload: dict):
    transcript = payload.get("transcript", "")
    user_id = payload.get("user_id")
    allowed, reason = await enforce_feature("yki", user_id)
    if not allowed:
        raise HTTPException(status_code=402, detail=reason or "Subscription required")
    result = yki_engine.evaluate_speaking(transcript)
    await log_feature_usage(user_id, "yki")
    return result


@router.post("/writing")
async def evaluate_writing(payload: dict):
    text = payload.get("text", "")
    user_id = payload.get("user_id")
    allowed, reason = await enforce_feature("yki", user_id)
    if not allowed:
        raise HTTPException(status_code=402, detail=reason or "Subscription required")
    result = yki_engine.evaluate_writing(text)
    await log_feature_usage(user_id, "yki")
    return result


@router.post("/exam/generate")
async def generate_exam(payload: dict):
    """Generate a complete YKI exam simulation."""
    exam_type = payload.get("exam_type", "full")  # full, speaking_only, writing_only
    level = payload.get("level", "intermediate")  # basic, intermediate
    user_id = payload.get("user_id")
    allowed, reason = await enforce_feature("yki", user_id)
    if not allowed:
        raise HTTPException(status_code=402, detail=reason or "Subscription required")
    exam = yki_exam_service.generate_exam(exam_type, level)
    await log_feature_usage(user_id, "yki")
    return {"exam": exam}


@router.post("/exam/submit")
async def submit_exam(payload: dict):
    """Submit and evaluate a complete exam."""
    exam_id = payload.get("exam_id", "")
    speaking_responses = payload.get("speaking_responses", [])
    writing_responses = payload.get("writing_responses", [])
    user_id = payload.get("user_id")
    allowed, reason = await enforce_feature("yki", user_id)
    if not allowed:
        raise HTTPException(status_code=402, detail=reason or "Subscription required")

    evaluation = yki_exam_service.evaluate_exam_submission(
        exam_id=exam_id,
        speaking_responses=speaking_responses,
        writing_responses=writing_responses,
    )
    await log_feature_usage(user_id, "yki")
    return {"evaluation": evaluation}
