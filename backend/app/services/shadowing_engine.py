"""Shadowing helper – supplies short lines and scoring for rhythm practice."""

from __future__ import annotations

import random
import re
from datetime import datetime
from typing import Dict, List


# Level-appropriate shadowing lines
LINES_BY_LEVEL = {
    "A1": [
        "Hyvää huomenta!",
        "Kiitos paljon!",
        "Anteeksi, en ymmärrä.",
        "Minä olen...",
        "Missä on...?",
        "Paljonko maksaa?",
    ],
    "A2": [
        "Voinko auttaa sinua?",
        "Minulla on kiire töihin.",
        "Mitä mieltä olet tästä?",
        "Käydään kävelyllä illalla.",
        "Haluaisin varata pöydän.",
        "Milloin bussi lähtee?",
    ],
    "B1": [
        "Olisin kiitollinen, jos voisit auttaa minua tässä asiassa.",
        "Mielestäni tämä ratkaisu on järkevä ja kustannustehokas.",
        "Voisitko selittää tämän asian tarkemmin?",
        "Olen samaa mieltä kanssasi tästä aiheesta.",
        "Tarvitsen apua tämän ongelman ratkaisemiseksi.",
    ],
}


def get_shadow_line(level: str = "A1") -> Dict:
    """Return a short Finnish line to shadow with metadata."""
    # Normalize level
    if level.startswith("A1"):
        level_key = "A1"
    elif level.startswith("A2"):
        level_key = "A2"
    else:
        level_key = "B1"
    
    lines = LINES_BY_LEVEL.get(level_key, LINES_BY_LEVEL["A1"])
    line = random.choice(lines)
    
    # Generate hint based on level
    if level_key == "A1":
        hint = "Kuuntele rytmi ja toista heti perässä. Älä murehdi täydellisyyttä!"
    elif level_key == "A2":
        hint = "Keskity pituuksiin (pitkät vs. lyhyet vokaalit) ja rytmiin."
    else:
        hint = "Kopioi rytmi ja intonaatio. Kiinnitä huomiota sanajärjestykseen."
    
    return {
        "text": line,
        "level": level_key,
        "hint": hint,
        "word_count": len(line.split()),
        "created_at": datetime.utcnow().isoformat(),
    }


def score_shadowing(expected: str, transcript: str) -> Dict:
    """
    Score shadowing attempt with improved analysis.
    
    Analyzes:
    - Exact match
    - Word count similarity
    - Key word presence
    - Rhythm (word count ratio)
    """
    expected = expected or ""
    transcript = transcript or ""
    
    expected_clean = expected.strip().lower()
    transcript_clean = transcript.strip().lower()
    
    # Exact match
    if transcript_clean == expected_clean:
        return {
            "score": 4.0,
            "rhythm": "excellent",
            "accuracy": 1.0,
            "feedback": "Erinomaista! Täydellinen toisto.",
            "improvements": [],
        }
    
    # Word-level analysis
    expected_words = re.findall(r'\b\w+\b', expected_clean)
    transcript_words = re.findall(r'\b\w+\b', transcript_clean)
    
    # Calculate word accuracy
    if expected_words:
        # Check how many expected words appear in transcript
        matched_words = sum(1 for word in expected_words if word in transcript_clean)
        word_accuracy = matched_words / len(expected_words)
    else:
        word_accuracy = 0.0
    
    # Rhythm analysis (word count ratio)
    expected_word_count = len(expected_words)
    transcript_word_count = len(transcript_words)
    
    if expected_word_count > 0:
        word_count_ratio = transcript_word_count / expected_word_count
        if 0.8 <= word_count_ratio <= 1.2:
            rhythm = "good"
        elif 0.6 <= word_count_ratio < 0.8 or 1.2 < word_count_ratio <= 1.5:
            rhythm = "ok"
        else:
            rhythm = "needs_work"
    else:
        rhythm = "needs_work"
        word_count_ratio = 0
    
    # Overall score (weighted: 60% word accuracy, 40% rhythm)
    rhythm_score = 1.0 if rhythm == "good" else (0.7 if rhythm == "ok" else 0.4)
    overall_score = (word_accuracy * 0.6 + rhythm_score * 0.4) * 4
    
    # Generate feedback
    if overall_score >= 3.5:
        feedback = "Hyvä! Melkein täydellinen toisto."
    elif overall_score >= 2.5:
        feedback = "Hyvä yritys! Kiinnitä huomiota sanojen järjestykseen."
    elif overall_score >= 1.5:
        feedback = "Hyvä alku! Kuuntele tarkemmin pituuksia ja rytmiä."
    else:
        feedback = "Yritä uudelleen. Keskity kuuntelemaan tarkemmin."
    
    # Generate improvement suggestions
    improvements = []
    if word_accuracy < 0.8:
        improvements.append("Kuuntele tarkemmin kaikkia sanoja")
    if rhythm == "needs_work":
        improvements.append("Kopioi rytmi tarkemmin")
    if transcript_word_count < expected_word_count * 0.7:
        improvements.append("Muista kaikki sanat")
    
    return {
        "score": round(overall_score, 1),
        "rhythm": rhythm,
        "accuracy": round(word_accuracy, 2),
        "word_count_ratio": round(word_count_ratio, 2),
        "feedback": feedback,
        "improvements": improvements,
        "matched_words": matched_words if expected_words else 0,
        "total_words": len(expected_words),
    }

