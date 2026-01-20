"""Quick session summary + topic forecast helpers."""

from __future__ import annotations

from datetime import datetime
from typing import List, Dict

_FORECAST_TOPICS = [
    "Your weekend plans",
    "Cooking a simple meal",
    "A short work update",
    "What you see from your window",
    "One thing you learned today",
]


def build_quick_summary(messages: List[Dict] | None, last_reply: str | None) -> Dict:
    """Return a light-weight motivational summary for the last turn."""
    user_messages = [m for m in messages or [] if m.get("role") == "user"]
    latest_user = user_messages[-1]["content"] if user_messages else ""

    return {
        "generated_at": datetime.utcnow().isoformat(),
        "strength": "Hyvä tempo! Jatka puhumista ilman taukoja.",
        "easy_fix": "Kiinnitä huomiota vokaalin pituuksiin (esim. tulee vs. tullee).",
        "practice_phrase": "Kokeile sanoa: 'Tänään opin jotain uutta.'",
        "echo": latest_user[:120],
    }


def forecast_topic(latest_user_message: str | None = None) -> str:
    """Suggest a topic for the next turn to build anticipation."""
    if latest_user_message:
        return f"Next: continue about '{latest_user_message[:60]}'."
    return _FORECAST_TOPICS[(len(latest_user_message or "") % len(_FORECAST_TOPICS))]

