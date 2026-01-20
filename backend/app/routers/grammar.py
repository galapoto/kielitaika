from fastapi import APIRouter
from app.services.grammar_engine import analyze_grammar

router = APIRouter()


@router.post("/analyze")
async def analyze(payload: dict):
    text = payload.get("text", "")
    result = await analyze_grammar(text)
    return result
