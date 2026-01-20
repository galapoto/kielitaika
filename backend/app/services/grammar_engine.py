"""Basic grammar engine with lightweight heuristic rules."""

from __future__ import annotations

from typing import List, Dict


def detect_case_errors(text: str) -> List[Dict]:
    """Detect obvious case errors using simple string heuristics."""
    errors = []
    lowered = text.lower()
    if "kauppassa" in lowered:
        errors.append(
            {
                "type": "case",
                "original": "kauppassa",
                "suggested": "kaupassa",
                "reason": "Inessive uses -ssa/-ssä; double p not needed here.",
            }
        )
    if "minä mennä" in lowered:
        errors.append(
            {
                "type": "verb",
                "original": "minä mennä",
                "suggested": "minä menen",
                "reason": "Conjugate the verb with person ending (-n).",
            }
        )
    if "haluan kahvi" in lowered:
        errors.append(
            {
                "type": "case",
                "original": "kahvi",
                "suggested": "kahvia",
                "reason": "Partitive object after haluta → kahvia.",
            }
        )
    return errors


def detect_verb_errors(text: str) -> List[Dict]:
    """Detect basic verb form issues."""
    errors = []
    lowered = text.lower()
    if "minä olla" in lowered:
        errors.append(
            {
                "type": "verb",
                "original": "minä olla",
                "suggested": "minä olen",
                "reason": "Verb olla needs person ending (-n) in 1st person.",
            }
        )
    if "sinä olla" in lowered:
        errors.append(
            {
                "type": "verb",
                "original": "sinä olla",
                "suggested": "sinä olet",
                "reason": "Verb olla 2nd person: olet.",
            }
        )
    if "hän olla" in lowered:
        errors.append(
            {
                "type": "verb",
                "original": "hän olla",
                "suggested": "hän on",
                "reason": "Verb olla 3rd person: on.",
            }
        )
    return errors


def detect_puhekieli(text: str) -> List[Dict]:
    """Detect informal Finnish markers without correcting them."""
    markers = []
    lowered = text.lower()
    for slang in ("mä ", "sä ", "me mennään", "ei oo"):
        if slang in lowered:
            markers.append(
                {
                    "type": "puhekieli",
                    "original": slang.strip(),
                    "suggested": None,
                    "reason": "Informal Finnish detected; keep if preferred, otherwise switch to kirjakieli.",
                }
            )
    return markers


def classify_mistakes(detections: list) -> list:
    """Return detections unchanged; placeholder for richer typing."""
    return detections


def build_explanation(mistake: dict) -> dict:
    """Return human-readable explanation for a mistake."""
    return {
        "error": mistake.get("original"),
        "correction": mistake.get("suggested"),
        "reason": mistake.get("reason"),
        "type": mistake.get("type"),
    }


def summarize_analysis(mistakes: list) -> str:
    """Summarize overall grammar status."""
    if not mistakes:
        return "No clear issues found (heuristic check)."
    return f"Detected {len(mistakes)} potential issues."


async def analyze_grammar(text: str) -> dict:
    """Run basic grammar checks and return structured info."""
    case_errors = detect_case_errors(text)
    verb_errors = detect_verb_errors(text)
    puhekieli_markers = detect_puhekieli(text)
    mistakes = classify_mistakes(case_errors + verb_errors + puhekieli_markers)
    return {
        "mistakes": mistakes,
        "suggestions": [build_explanation(m) for m in mistakes],
        "analysis_summary": summarize_analysis(mistakes),
    }
