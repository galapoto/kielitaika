from fastapi import APIRouter

from app.services import shadowing_engine

router = APIRouter()


@router.get("/line")
async def get_line(level: str = "A1"):
    """Return a short line to shadow."""
    return {"line": shadowing_engine.get_shadow_line(level)}


@router.post("/score")
async def score(payload: dict):
    """Score a shadowing attempt (transcript-based placeholder)."""
    expected = payload.get("expected", "")
    transcript = payload.get("transcript", "")
    return {"result": shadowing_engine.score_shadowing(expected, transcript)}

