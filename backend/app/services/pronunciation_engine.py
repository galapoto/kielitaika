"""Pronunciation Engine - Analyzes Finnish pronunciation quality."""

import re
from typing import Dict, List


class PronunciationEngine:
    """Analyze Finnish pronunciation focusing on vowel/consonant length."""
    
    def analyze_audio(
        self, 
        audio_bytes: bytes | None = None,
        expected_text: str = "",
        transcript: str = ""
    ) -> Dict:
        """
        Analyze pronunciation based on transcript vs expected text.
        
        Note: Full audio analysis requires phoneme alignment (advanced).
        This version uses text-based heuristics as a starting point.
        
        Args:
            audio_bytes: Raw audio data (for future phoneme analysis)
            expected_text: What the user should have said
            transcript: What Whisper transcribed (may differ due to pronunciation)
        
        Returns:
            Dictionary with score and feedback
        """
        if not expected_text or not transcript:
            return {
                "score": 0,
                "vowel_issues": [],
                "consonant_issues": [],
                "rhythm": "unknown",
                "feedback": "No text provided for analysis."
            }
        
        # Normalize texts for comparison
        expected_lower = expected_text.lower().strip()
        transcript_lower = transcript.lower().strip()
        
        # Detect vowel length issues
        vowel_issues = self.detect_vowel_length(expected_lower, transcript_lower)
        
        # Detect consonant length issues
        consonant_issues = self.detect_consonant_length(expected_lower, transcript_lower)
        
        # Calculate overall score (0-4)
        score = self._calculate_score(vowel_issues, consonant_issues, expected_lower, transcript_lower)
        
        # Generate feedback
        feedback = self._generate_feedback(score, vowel_issues, consonant_issues)
        
        return {
            "score": score,
            "vowel_issues": vowel_issues,
            "consonant_issues": consonant_issues,
            "rhythm": self._assess_rhythm(expected_lower, transcript_lower),
            "feedback": feedback
        }
    
    def detect_vowel_length(self, expected: str, transcript: str) -> List[Dict]:
        """
        Detect vowel length errors (critical in Finnish).
        
        Examples:
        - "tuli" (fire) vs "tuuli" (wind) - single vs double vowel
        - "mato" (worm) vs "matto" (rug) - affects meaning
        """
        issues = []
        
        # Find words with double vowels in expected
        double_vowel_pattern = r'\b\w*(aa|ee|ii|oo|uu|yy|ää|öö)\w*\b'
        expected_words = re.findall(double_vowel_pattern, expected)
        
        for word in expected_words:
            # Check if transcript has the double vowel
            if word not in transcript:
                # Try to find similar word with single vowel
                single_vowel = re.sub(r'(.)\1', r'\1', word)
                if single_vowel in transcript:
                    issues.append({
                        "word": word,
                        "expected": "long vowel",
                        "detected": "short vowel",
                        "example": f"'{word}' should have long vowel"
                    })
        
        # Find words that should have single vowels but got double
        single_vowel_words = re.findall(r'\b\w+\b', expected)
        for word in single_vowel_words:
            # Check for accidental doubling
            doubled = re.sub(r'([aeiouyäö])(?=\w)', r'\1\1', word)
            if doubled in transcript and word not in transcript:
                issues.append({
                    "word": word,
                    "expected": "short vowel",
                    "detected": "long vowel",
                    "example": f"'{word}' should have short vowel"
                })
        
        return issues
    
    def detect_consonant_length(self, expected: str, transcript: str) -> List[Dict]:
        """
        Detect consonant length errors (gemination).
        
        Examples:
        - "muta" (mud) vs "mutta" (but) - single vs double consonant
        - "tapa" (way) vs "tappa" (kill) - critical difference
        """
        issues = []
        
        # Find words with double consonants in expected
        double_consonant_pattern = r'\b\w*(kk|pp|tt|ss|nn|mm|ll|rr|ff|hh|vv|jj|gg|dd|bb|zz|cc|xx|ww)\w*\b'
        expected_words = re.findall(double_consonant_pattern, expected)
        
        for word in expected_words:
            if word not in transcript:
                # Check if single consonant version exists in transcript
                single_consonant = re.sub(r'(.)\1', r'\1', word)
                if single_consonant in transcript:
                    issues.append({
                        "word": word,
                        "expected": "long consonant",
                        "detected": "short consonant",
                        "example": f"'{word}' should have long consonant (gemination)"
                    })
        
        return issues
    
    def _calculate_score(
        self, 
        vowel_issues: List[Dict],
        consonant_issues: List[Dict],
        expected: str,
        transcript: str
    ) -> int:
        """
        Calculate pronunciation score (0-4).
        
        4: Excellent (no issues)
        3: Good (minor issues)
        2: Fair (some issues)
        1: Poor (many issues)
        0: Very poor (severe issues)
        """
        # Base score on word similarity
        expected_words = set(re.findall(r'\b\w+\b', expected.lower()))
        transcript_words = set(re.findall(r'\b\w+\b', transcript.lower()))
        
        if not expected_words:
            return 0
        
        word_match_ratio = len(expected_words & transcript_words) / len(expected_words)
        
        # Penalize for vowel/consonant issues
        total_issues = len(vowel_issues) + len(consonant_issues)
        issue_penalty = min(total_issues * 0.2, 1.0)
        
        # Calculate final score
        raw_score = word_match_ratio * 4 - issue_penalty
        score = max(0, min(4, int(round(raw_score))))
        
        return score
    
    def _assess_rhythm(self, expected: str, transcript: str) -> str:
        """Assess speech rhythm (simplified)."""
        expected_word_count = len(re.findall(r'\b\w+\b', expected))
        transcript_word_count = len(re.findall(r'\b\w+\b', transcript))
        
        if expected_word_count == 0:
            return "unknown"
        
        ratio = transcript_word_count / expected_word_count
        
        if ratio < 0.7:
            return "too_slow"
        elif ratio > 1.3:
            return "too_fast"
        else:
            return "good"
    
    def _generate_feedback(
        self,
        score: int,
        vowel_issues: List[Dict],
        consonant_issues: List[Dict]
    ) -> str:
        """Generate human-readable feedback."""
        if score >= 4:
            return "Erinomaista! Hyvä ääntäminen."
        elif score >= 3:
            return "Hyvä! Pienet parannusmahdollisuudet."
        elif score >= 2:
            feedback_parts = []
            if vowel_issues:
                feedback_parts.append("Huomioi vokaalien pituus.")
            if consonant_issues:
                feedback_parts.append("Huomioi konsonanttien pituus.")
            return " ".join(feedback_parts) if feedback_parts else "Harjoittele lisää."
        else:
            return "Harjoittele vokaali- ja konsonanttipituuksia. Ne ovat tärkeitä suomen kielessä."

