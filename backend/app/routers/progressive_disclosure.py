"""API endpoints for Progressive Disclosure Engine."""

from fastapi import APIRouter, HTTPException
from pydantic import BaseModel

from app.services.progressive_disclosure_engine_v3 import ProgressiveDisclosureEngineV3

router = APIRouter()
_progressive_disclosure = ProgressiveDisclosureEngineV3()


class SupportLevelRequest(BaseModel):
    """Request model for computing support level."""
    user_id: str | None = None
    history: list[dict] | None = None
    hesitation: float = 0.0
    accuracy: float = 1.0
    error_types: list[str] | None = None
    text_complexity: float = 0.5
    current_level: str = "A1"


class MaskTextRequest(BaseModel):
    """Request model for text masking."""
    text: str
    level: int
    context: dict | None = None


@router.post("/compute-level")
async def compute_support_level(request: SupportLevelRequest):
    """
    Compute progressive disclosure support level based on user performance.
    
    Returns support level (0-3):
    - 0: Full text visible (struggling)
    - 1: Hide case endings (moderate support)
    - 2: Hide verbs (minimal support)
    - 3: Memory mode (advanced, topic hints only)
    """
    if not 0 <= request.accuracy <= 1.0:
        raise HTTPException(
            status_code=400,
            detail="Accuracy must be between 0.0 and 1.0"
        )
    
    if not 0 <= request.hesitation <= 1.0:
        raise HTTPException(
            status_code=400,
            detail="Hesitation must be between 0.0 and 1.0"
        )
    
    level = _progressive_disclosure.compute_support_level(
        user_id=request.user_id,
        history=request.history,
        hesitation=request.hesitation,
        accuracy=request.accuracy,
        error_types=request.error_types,
        text_complexity=request.text_complexity,
    )
    
    # Get difficulty recommendation if user_id provided
    recommendation = None
    if request.user_id:
        recommendation = _progressive_disclosure.get_difficulty_recommendation(
            request.user_id,
            request.current_level,
        )
    
    return {
        "support_level": level,
        "description": _get_level_description(level),
        "recommendation": recommendation,
    }


@router.post("/mask-text")
async def mask_text(request: MaskTextRequest):
    """
    Apply progressive disclosure masking to text.
    
    Args:
        text: Finnish text to mask
        level: Support level (0-3)
    
    Returns:
        Masked text based on support level
    """
    if not 0 <= request.level <= 3:
        raise HTTPException(
            status_code=400,
            detail="Support level must be between 0 and 3"
        )
    
    masked = _progressive_disclosure.mask_text(
        request.text,
        request.level,
        context=request.context,
    )
    
    return {
        "original": request.text,
        "masked": masked,
        "level": request.level,
        "description": _get_level_description(request.level),
    }


def _get_level_description(level: int) -> str:
    """Get human-readable description of support level."""
    descriptions = {
        0: "Full text visible - all support provided",
        1: "Case endings hidden - moderate scaffolding",
        2: "Verbs hidden - minimal scaffolding",
        3: "Memory mode - topic hints only"
    }
    return descriptions.get(level, "Unknown level")

