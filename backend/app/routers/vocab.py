from fastapi import APIRouter

from app.services import path_engine, vocab_engine

router = APIRouter()


@router.get("/paths")
async def available_paths():
    """List learning paths for onboarding selection."""
    return {"paths": path_engine.list_paths()}


@router.get("/units")
async def units(path: str = "general", field: str | None = None, limit: int = 12):
    """Return vocabulary items for a given path/field."""
    return {"items": vocab_engine.get_vocab_units(path, field, limit)}


@router.post("/missing")
async def missing(payload: dict):
    """Detect workplace vocabulary not yet used in a transcript."""
    field = payload.get("field", "")
    transcript = payload.get("transcript", "")
    return {"missing": vocab_engine.detect_missing_vocab(field, transcript)}


@router.post("/srs")
async def spaced_repetition(payload: dict):
    """Build a spaced repetition queue from recent mistakes."""
    error_terms = payload.get("errors", []) or []
    field = payload.get("field")
    limit = payload.get("limit", 15)
    return {"queue": vocab_engine.build_spaced_repetition_list(error_terms, field, limit)}
