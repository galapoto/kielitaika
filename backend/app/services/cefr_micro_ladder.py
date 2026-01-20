"""CEFR micro-ladder helper for small level steps."""

from __future__ import annotations

from typing import Dict


def ladder_for_level(level: str) -> Dict:
    """Return micro-steps around the current CEFR prediction."""
    ladder = ["A1.0", "A1.1", "A1.2", "A2.0", "A2.1", "A2.2", "B1.0", "B1.1", "B1.2"]
    target = level or "A1.0"
    if target not in ladder:
        ladder.append(target)
    ladder = sorted(set(ladder), key=lambda x: ladder.index(x) if x in ladder else len(ladder))
    current_index = ladder.index(target)
    prev_step = ladder[current_index - 1] if current_index > 0 else ladder[0]
    next_step = ladder[current_index + 1] if current_index + 1 < len(ladder) else ladder[-1]
    return {
        "current": target,
        "previous": prev_step,
        "next": next_step,
        "ladder": ladder,
    }

