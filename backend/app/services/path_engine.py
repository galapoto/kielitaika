"""Helpers for routing users to the right learning path."""

from __future__ import annotations

from typing import Dict, List, Optional

PATH_DEFINITIONS: Dict[str, dict] = {
    "general": {
        "label": "Yleinen suomi",
        "description": "Everyday Finnish conversation and grammar practice.",
    },
    "workplace": {
        "label": "Töihin",
        "description": "Profession-specific Finnish with roleplay and vocabulary drills.",
    },
    "yki": {
        "label": "YKI",
        "description": "Exam-style speaking and writing preparation with scoring.",
    },
}


def determine_path(user_settings: Optional[dict] = None, explicit: Optional[str] = None) -> str:
    """Pick the active path from explicit input or stored settings."""
    if explicit and explicit in PATH_DEFINITIONS:
        return explicit
    if user_settings:
        preferred = user_settings.get("preferred_path")
        if preferred in PATH_DEFINITIONS:
            return preferred
    return "general"


def persona_for_path(path: str, profession: Optional[str] = None) -> str:
    """Return a persona hint for LLM prompts based on path and profession."""
    normalized = (path or "general").lower()
    if normalized == "yki":
        return "Neutral YKI examiner who keeps feedback concise"
    if normalized == "workplace":
        if profession:
            return f"{profession.title()} workplace mentor who is supportive but precise"
        return "Workplace coach focused on clear, safe communication"
    return "Friendly Finnish tutor"


def list_paths() -> List[dict]:
    """Expose available paths with metadata for UI selection."""
    return [
        {"id": key, "label": value["label"], "description": value["description"]}
        for key, value in PATH_DEFINITIONS.items()
    ]


def merge_feedback_across_paths(feedback_items: List[dict]) -> dict:
    """
    Combine feedback objects (e.g., from grammar + YKI + workplace).

    The current heuristic flattens feedback while preserving unique keys so the
    UI can display a single summary block without losing detail.
    """
    merged: dict = {"highlights": [], "scores": {}, "notes": []}
    for item in feedback_items:
        if not item:
            continue
        highlights = item.get("highlights") or item.get("suggestions") or []
        merged["highlights"].extend(highlights)
        scores = item.get("scores")
        if isinstance(scores, dict):
            merged["scores"].update(scores)
        summary = item.get("analysis_summary") or item.get("summary")
        if summary:
            merged["notes"].append(summary)
    # De-duplicate highlights while preserving order
    seen = set()
    unique_highlights = []
    for entry in merged["highlights"]:
        key = str(entry)
        if key in seen:
            continue
        seen.add(key)
        unique_highlights.append(entry)
    merged["highlights"] = unique_highlights
    return merged
