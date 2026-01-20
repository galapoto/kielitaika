"""Mini pronunciation nudge generator."""

from __future__ import annotations

import re
from typing import Dict, List, Optional


def mini_nudge(expected_text: str | None, transcript: str | None) -> Dict:
    """
    Return a small, positive nudge for pronunciation focus.
    
    Analyzes differences between expected and transcript to provide
    targeted feedback on vowel length, consonant doubling, and rhythm.
    """
    expected_text = expected_text or ""
    transcript = transcript or ""
    
    expected_clean = expected_text.lower().strip()
    transcript_clean = transcript.lower().strip()
    
    # Analyze differences
    issues = _detect_pronunciation_issues(expected_clean, transcript_clean)
    
    # Generate targeted nudges
    nudges = []
    
    if issues.get("vowel_length"):
        nudges.append({
            "type": "vowel_length",
            "message": "Kuuntele vokaalien pituus: 'aa' on pitkä, 'a' on lyhyt. Korosta pitkiä vokaaleja.",
            "example": "tuli (fire) vs. tuuli (wind)",
        })
    
    if issues.get("consonant_doubling"):
        nudges.append({
            "type": "consonant",
            "message": "Harjoittele kaksoiskonsonantteja: 'kanna' (carry) vs. 'kana' (chicken).",
            "example": "kanna vs. kana",
        })
    
    if issues.get("missing_words"):
        nudges.append({
            "type": "completeness",
            "message": "Muista sanoa kaikki sanat. Puhu rauhassa ja selkeästi.",
            "example": expected_text[:50] + "...",
        })
    
    if not nudges:
        # Default positive nudge
        nudges.append({
            "type": "general",
            "message": "Hyvä! Jatka harjoittelua. Keskity rytmiin ja pituuksiin.",
            "example": "Sano rauhassa: 'Minä harjoittelen ääntämistä joka päivä.'",
        })
    
    return {
        "nudges": nudges,
        "focus": issues.get("primary_focus", "rhythm"),
        "expected": expected_text[:100],
        "transcript": transcript[:100],
        "similarity": issues.get("similarity", 0.0),
    }


def _detect_pronunciation_issues(expected: str, transcript: str) -> Dict:
    """Detect pronunciation issues by comparing expected and transcript."""
    issues = {
        "vowel_length": False,
        "consonant_doubling": False,
        "missing_words": False,
        "similarity": 0.0,
        "primary_focus": "rhythm",
    }
    
    if not expected or not transcript:
        return issues
    
    # Check for exact match
    if expected == transcript:
        issues["similarity"] = 1.0
        return issues
    
    # Word-level comparison
    expected_words = set(re.findall(r'\b\w+\b', expected))
    transcript_words = set(re.findall(r'\b\w+\b', transcript))
    
    # Calculate similarity
    if expected_words:
        matched_words = len(expected_words & transcript_words)
        issues["similarity"] = matched_words / len(expected_words)
        issues["missing_words"] = matched_words < len(expected_words) * 0.8
    
    # Check for vowel length issues (simplified: look for common patterns)
    # Long vowels: aa, ee, ii, oo, uu, ää, öö, yy
    long_vowel_pattern = r'[aeiouäöy]{2}'
    expected_long_vowels = set(re.findall(long_vowel_pattern, expected))
    transcript_long_vowels = set(re.findall(long_vowel_pattern, transcript))
    
    if expected_long_vowels and not transcript_long_vowels.issuperset(expected_long_vowels):
        issues["vowel_length"] = True
        issues["primary_focus"] = "vowel_length"
    
    # Check for consonant doubling issues
    # Look for double consonants: kk, pp, tt, etc.
    double_consonant_pattern = r'([bcdfghjklmnpqrstvwxyz])\1'
    expected_doubles = set(re.findall(double_consonant_pattern, expected))
    transcript_doubles = set(re.findall(double_consonant_pattern, transcript))
    
    if expected_doubles and not transcript_doubles.issuperset(expected_doubles):
        issues["consonant_doubling"] = True
        if not issues["vowel_length"]:
            issues["primary_focus"] = "consonant_doubling"
    
    return issues

