"""Micro Output Task Engine – 10-second speaking nudges."""

from __future__ import annotations

import random
from datetime import datetime
from typing import Dict, List


TASK_LIBRARY: List[dict] = [
    {
        "id": "desk_objects",
        "prompt": "List 3 objects you see on your desk in Finnish.",
        "seconds": 10,
        "hints": ["esim. kirja, puhelin, kahvi"],
    },
    {
        "id": "feel_good",
        "prompt": "Say one thing that made you smile today.",
        "seconds": 10,
        "hints": ["käytä mennyttä aikamuotoa, esim. 'Minua ilahdutti ...'"]
    },
    {
        "id": "room_items",
        "prompt": "Describe what is in your room right now.",
        "seconds": 10,
        "hints": ["aloita: 'Huoneessani on ...'"]
    },
    {
        "id": "plans",
        "prompt": "Share one plan for this evening.",
        "seconds": 10,
        "hints": ["aloita: 'Aion ...'"]
    },
    {
        "id": "food",
        "prompt": "Name 2 things you like to eat and why.",
        "seconds": 10,
        "hints": ["käytä koska: 'Pidän ... koska ...'"]
    },
]


def generate_micro_task(user_id: str | None = None) -> Dict:
    """Return a simple 10-second output task."""
    task = random.choice(TASK_LIBRARY)
    return {
        **task,
        "created_at": datetime.utcnow().isoformat(),
        "user_id": user_id,
    }


def evaluate_micro_task(task_id: str, transcript: str) -> Dict:
    """
    Evaluate micro task completion with enhanced feedback.
    
    Analyzes:
    - Word count and completeness
    - Grammar structure (basic checks)
    - Fluency indicators
    - Encouragement level
    """
    transcript = transcript or ""
    word_count = len(transcript.split()) if transcript else 0
    
    # Determine completeness based on task type
    task_info = next((t for t in TASK_LIBRARY if t["id"] == task_id), None)
    expected_min_words = 5 if task_info else 6
    
    completeness = "excellent" if word_count >= expected_min_words + 3 else \
                   "good" if word_count >= expected_min_words else \
                   "light" if word_count >= 3 else "minimal"
    
    # Basic grammar checks
    grammar_notes = []
    transcript_lower = transcript.lower()
    
    # Check for verb usage
    if any(word in transcript_lower for word in ["olen", "olet", "on", "ovat"]):
        grammar_notes.append("✅ Used 'olla' correctly")
    elif word_count > 0:
        grammar_notes.append("💡 Try using verbs like 'olen', 'on'")
    
    # Check for case endings (simplified)
    if any(ending in transcript_lower for ending in ["ssa", "ssä", "sta", "stä", "lla", "llä"]):
        grammar_notes.append("✅ Used location cases")
    
    # Generate feedback
    if completeness == "excellent":
        feedback = "Erinomaista! Hyvä yksityiskohtaisuus ja selkeys."
        encouragement = "high"
    elif completeness == "good":
        feedback = "Hyvä! Selkeä ja ymmärrettävä vastaus."
        encouragement = "medium"
    elif completeness == "light":
        feedback = "Hyvä alku! Yritä lisätä vielä yksi yksityiskohta."
        encouragement = "medium"
    else:
        feedback = "Yritä uudelleen. Muista sanoa vähintään muutama sana."
        encouragement = "low"
    
    return {
        "task_id": task_id,
        "transcript_word_count": word_count,
        "completeness": completeness,
        "encouragement": encouragement,
        "feedback": feedback,
        "grammar_notes": grammar_notes,
        "next_step": "Try the conversation feature to practice more!" if completeness in ["good", "excellent"] else "Keep practicing short responses!",
    }

