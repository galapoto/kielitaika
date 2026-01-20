"""YKI evaluation with simple heuristics."""

from __future__ import annotations

from collections import Counter
from typing import Dict

from app.services import grammar_engine


def evaluate_speaking(transcript: str) -> dict:
    """Return heuristic speaking evaluation."""
    words = transcript.split()
    word_count = len(words)
    unique_count = len(set(words))
    pauses = transcript.count("...") + transcript.count("--")

    fluency = _score_range(word_count - pauses, thresholds=[5, 15, 30, 50])
    vocab = _score_range(unique_count, thresholds=[3, 8, 15, 25])
    grammar_result = _grammar_score(transcript)
    coherence = 3 if "koska" in transcript or "siksi" in transcript else 2

    scores = {
        "fluency": fluency,
        "grammar": grammar_result,
        "vocabulary": vocab,
        "coherence": coherence,
    }
    band = map_scores_to_cefr(scores)
    return {"scores": scores, "band": band}


def evaluate_writing(text: str) -> dict:
    """Return heuristic writing evaluation."""
    sentences = [s for s in text.replace("!", ".").replace("?", ".").split(".") if s.strip()]
    words = text.split()
    unique_count = len(set(words))
    grammar_result = _grammar_score(text)
    structure = _score_range(len(sentences), thresholds=[1, 2, 3, 4])
    vocab = _score_range(unique_count, thresholds=[5, 12, 25, 40])
    task_completion = 3 if len(words) >= 60 else 2

    scores = {
        "structure": structure,
        "accuracy": grammar_result,
        "task_completion": task_completion,
        "vocabulary": vocab,
    }
    band = map_scores_to_cefr(scores)
    return {"scores": scores, "band": band}


def map_scores_to_cefr(scores: Dict[str, int]) -> str:
    """Map averaged score to CEFR-like band."""
    if not scores:
        return "A2.1"
    avg = sum(scores.values()) / len(scores)
    if avg < 1.5:
        return "A2.1"
    if avg < 2.3:
        return "A2.2"
    if avg < 3.0:
        return "B1.1"
    return "B1.2"


def _grammar_score(text: str) -> int:
    """Convert grammar mistakes into a simple score."""
    analysis = _safe_sync(grammar_engine.analyze_grammar, text)
    mistakes = analysis.get("mistakes", []) if analysis else []
    count = len(mistakes)
    if count == 0:
        return 4
    if count == 1:
        return 3
    if count <= 3:
        return 2
    return 1


def _score_range(value: int, thresholds: list[int]) -> int:
    """Return 0-4 based on thresholds list of four ascending values."""
    levels = [0, 1, 2, 3, 4]
    for idx, threshold in enumerate(thresholds):
        if value < threshold:
            return levels[idx]
    return 4


def _safe_sync(func, arg):
    """Call async or sync grammar function defensively."""
    try:
        result = func(arg)
        if hasattr(result, "__await__"):
            # Called with async function; run in event loop if already awaited elsewhere.
            import asyncio

            return asyncio.get_event_loop().run_until_complete(result)
        return result
    except Exception:
        return None
