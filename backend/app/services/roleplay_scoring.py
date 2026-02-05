from __future__ import annotations

from dataclasses import dataclass
from typing import List


@dataclass(frozen=True)
class RoleplayScoreResult:
    overall_score: float
    fluency_score: float
    grammar_score: float
    vocabulary_score: float
    relevance_score: float
    cefr_estimate: str | None
    feedback_fi: str


def _normalize_score(value: float) -> float:
    return max(0.0, min(100.0, round(value, 2)))


def score_roleplay(
    turns: List[dict],
    profession_field: str,
    cefr_level: str,
) -> RoleplayScoreResult:
    """
    Deterministic scoring stub for roleplay attempts.

    This intentionally avoids any randomness or external calls.
    It uses transcript length heuristics only, making it repeat-safe.
    """
    if not turns:
        return RoleplayScoreResult(
            overall_score=0.0,
            fluency_score=0.0,
            grammar_score=0.0,
            vocabulary_score=0.0,
            relevance_score=0.0,
            cefr_estimate=None,
            feedback_fi="Arviointi epäonnistui: ei vastauksia.",
        )

    user_tokens = [
        (t.get("user_transcript") or "").strip()
        for t in turns
    ]
    total_chars = sum(len(t) for t in user_tokens)
    avg_len = total_chars / max(1, len(user_tokens))

    # Deterministic heuristics (length-based, bounded)
    fluency = _normalize_score(40 + min(60, avg_len / 2))
    grammar = _normalize_score(35 + min(65, avg_len / 2.5))
    vocabulary = _normalize_score(30 + min(70, avg_len / 2.2))
    relevance = _normalize_score(50 + min(50, avg_len / 3))

    overall = _normalize_score((fluency + grammar + vocabulary + relevance) / 4)

    feedback = (
        f"Hyvää työtä! Vastauksesi olivat tasaisia ({len(user_tokens)} vuoroa). "
        f"Jatka harjoittelua ammattialan ({profession_field}) sanastolla tasolle {cefr_level}."
    )

    return RoleplayScoreResult(
        overall_score=overall,
        fluency_score=fluency,
        grammar_score=grammar,
        vocabulary_score=vocabulary,
        relevance_score=relevance,
        cefr_estimate=cefr_level,
        feedback_fi=feedback,
    )
