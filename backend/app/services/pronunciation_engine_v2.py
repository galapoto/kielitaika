"""Pronunciation Engine v2 - Phoneme alignment and advanced analysis."""

from __future__ import annotations

from typing import Dict, List, Optional, Tuple
import re
import difflib

from app.services.pronunciation_engine import PronunciationEngine


class PronunciationEngineV2(PronunciationEngine):
    """
    Enhanced pronunciation engine with phoneme alignment.
    
    Features:
    - Phoneme-level comparison
    - Vowel/consonant length detection (improved)
    - Stress pattern analysis
    - Rhythm and intonation
    - Segment-by-segment feedback
    """
    
    # Finnish phoneme mappings (simplified)
    FINNISH_PHONEMES = {
        'a': 'a', 'ä': 'æ', 'e': 'e', 'i': 'i', 'o': 'o', 'ö': 'ø', 'u': 'u', 'y': 'y',
        'aa': 'aː', 'ää': 'æː', 'ee': 'eː', 'ii': 'iː', 'oo': 'oː', 'öö': 'øː', 'uu': 'uː', 'yy': 'yː',
        'p': 'p', 't': 't', 'k': 'k', 'b': 'b', 'd': 'd', 'g': 'g',
        'pp': 'pː', 'tt': 'tː', 'kk': 'kː', 'bb': 'bː', 'dd': 'dː', 'gg': 'gː',
        'm': 'm', 'n': 'n', 'ng': 'ŋ', 'l': 'l', 'r': 'r', 'v': 'v', 'j': 'j', 'h': 'h',
        'mm': 'mː', 'nn': 'nː', 'll': 'lː', 'rr': 'rː', 'vv': 'vː',
        's': 's', 'ss': 'sː', 'f': 'f', 'ff': 'fː',
    }
    
    def analyze_audio_v2(
        self,
        audio_bytes: bytes | None = None,
        expected_text: str = "",
        transcript: str = "",
        phoneme_sequence: Optional[List[str]] = None,
    ) -> Dict:
        """
        Advanced pronunciation analysis with phoneme alignment.
        
        Args:
            audio_bytes: Raw audio data
            expected_text: Expected pronunciation
            transcript: Actual transcript from STT
            phoneme_sequence: Optional pre-computed phoneme sequence
        
        Returns:
            Enhanced analysis with phoneme-level details
        """
        if not expected_text or not transcript:
            return self._empty_analysis()
        
        # Get base analysis from v1
        base_analysis = self.analyze_audio(audio_bytes, expected_text, transcript)
        
        # Enhanced phoneme-level analysis
        expected_phonemes = self._text_to_phonemes(expected_text)
        transcript_phonemes = self._text_to_phonemes(transcript)
        
        # Align phonemes
        alignment = self._align_phonemes(expected_phonemes, transcript_phonemes)
        
        # Detect phoneme-level errors
        phoneme_errors = self._detect_phoneme_errors(alignment)
        
        # Enhanced vowel/consonant analysis
        vowel_analysis = self._analyze_vowels_v2(expected_text, transcript, alignment)
        consonant_analysis = self._analyze_consonants_v2(expected_text, transcript, alignment)
        
        # Stress and rhythm analysis
        stress_analysis = self._analyze_stress_patterns(expected_text, transcript)
        rhythm_analysis = self._analyze_rhythm_v2(expected_text, transcript, alignment)
        
        # Calculate enhanced score
        enhanced_score = self._calculate_enhanced_score(
            base_analysis["score"],
            phoneme_errors,
            vowel_analysis,
            consonant_analysis,
            stress_analysis,
        )
        
        # Generate detailed feedback
        detailed_feedback = self._generate_detailed_feedback(
            phoneme_errors,
            vowel_analysis,
            consonant_analysis,
            stress_analysis,
            rhythm_analysis,
        )
        
        return {
            **base_analysis,
            "score": enhanced_score,
            "phoneme_alignment": alignment,
            "phoneme_errors": phoneme_errors,
            "vowel_analysis": vowel_analysis,
            "consonant_analysis": consonant_analysis,
            "stress_analysis": stress_analysis,
            "rhythm_analysis": rhythm_analysis,
            "detailed_feedback": detailed_feedback,
            "segment_feedback": self._generate_segment_feedback(alignment),
            "improvement_priorities": self._prioritize_improvements(phoneme_errors),
        }
    
    def _text_to_phonemes(self, text: str) -> List[str]:
        """
        Convert Finnish text to phoneme sequence.
        
        This is a simplified version. A full implementation would use
        a proper Finnish phoneme converter or phoneme alignment tool.
        """
        text_lower = text.lower().strip()
        phonemes = []
        
        # Simple approach: map characters to phonemes
        i = 0
        while i < len(text_lower):
            # Check for double letters first (long vowels/consonants)
            if i < len(text_lower) - 1:
                double = text_lower[i:i+2]
                if double in self.FINNISH_PHONEMES:
                    phonemes.append(self.FINNISH_PHONEMES[double])
                    i += 2
                    continue
            
            # Single character
            char = text_lower[i]
            if char in self.FINNISH_PHONEMES:
                phonemes.append(self.FINNISH_PHONEMES[char])
            elif char.isalpha():
                # Unknown character, use as-is
                phonemes.append(char)
            i += 1
        
        return phonemes
    
    def _align_phonemes(
        self,
        expected: List[str],
        actual: List[str],
    ) -> List[Dict]:
        """
        Align expected and actual phoneme sequences.
        
        Uses sequence alignment to match phonemes and identify:
        - Matches
        - Substitutions
        - Insertions
        - Deletions
        """
        # Use difflib for sequence matching
        matcher = difflib.SequenceMatcher(None, expected, actual)
        alignment = []
        
        for tag, i1, i2, j1, j2 in matcher.get_opcodes():
            if tag == 'equal':
                # Perfect match
                for k in range(i2 - i1):
                    alignment.append({
                        "expected": expected[i1 + k],
                        "actual": actual[j1 + k],
                        "match": True,
                        "type": "match",
                    })
            elif tag == 'replace':
                # Substitution
                for k in range(max(i2 - i1, j2 - j1)):
                    alignment.append({
                        "expected": expected[i1 + k] if i1 + k < i2 else None,
                        "actual": actual[j1 + k] if j1 + k < j2 else None,
                        "match": False,
                        "type": "substitution",
                    })
            elif tag == 'delete':
                # Deletion (expected phoneme missing)
                for k in range(i2 - i1):
                    alignment.append({
                        "expected": expected[i1 + k],
                        "actual": None,
                        "match": False,
                        "type": "deletion",
                    })
            elif tag == 'insert':
                # Insertion (extra phoneme)
                for k in range(j2 - j1):
                    alignment.append({
                        "expected": None,
                        "actual": actual[j1 + k],
                        "match": False,
                        "type": "insertion",
                    })
        
        return alignment
    
    def _detect_phoneme_errors(self, alignment: List[Dict]) -> List[Dict]:
        """Detect specific phoneme-level errors."""
        errors = []
        
        for i, segment in enumerate(alignment):
            if not segment["match"]:
                error_type = segment["type"]
                
                if error_type == "substitution":
                    errors.append({
                        "position": i,
                        "expected_phoneme": segment["expected"],
                        "actual_phoneme": segment["actual"],
                        "error_type": "phoneme_substitution",
                        "severity": self._phoneme_severity(segment["expected"], segment["actual"]),
                    })
                elif error_type == "deletion":
                    errors.append({
                        "position": i,
                        "expected_phoneme": segment["expected"],
                        "error_type": "phoneme_deletion",
                        "severity": "high",
                    })
                elif error_type == "insertion":
                    errors.append({
                        "position": i,
                        "actual_phoneme": segment["actual"],
                        "error_type": "phoneme_insertion",
                        "severity": "medium",
                    })
        
        return errors
    
    def _phoneme_severity(self, expected: Optional[str], actual: Optional[str]) -> str:
        """Determine severity of phoneme substitution."""
        if not expected or not actual:
            return "medium"
        
        # Critical: vowel length differences (tuli vs tuuli)
        if expected.endswith(':') and not actual.endswith(':'):
            return "critical"
        if not expected.endswith(':') and actual.endswith(':'):
            return "critical"
        
        # High: consonant length differences (muta vs mutta)
        if len(expected) > len(actual) + 1 or len(actual) > len(expected) + 1:
            return "high"
        
        # Medium: other substitutions
        return "medium"
    
    def _analyze_vowels_v2(
        self,
        expected: str,
        transcript: str,
        alignment: List[Dict],
    ) -> Dict:
        """Enhanced vowel analysis with phoneme alignment."""
        base_vowel_issues = self.detect_vowel_length(expected, transcript)
        
        # Find vowel errors in alignment
        vowel_errors = []
        for segment in alignment:
            if not segment["match"] and segment.get("expected"):
                expected_ph = segment["expected"]
                if expected_ph in ['a', 'aː', 'ä', 'æ', 'e', 'i', 'iː', 'o', 'oː', 'ö', 'ø', 'u', 'uː', 'y', 'yː']:
                    vowel_errors.append({
                        "phoneme": expected_ph,
                        "position": segment.get("position"),
                        "error": segment["type"],
                    })
        
        return {
            "base_issues": base_vowel_issues,
            "phoneme_errors": vowel_errors,
            "total_vowel_errors": len(vowel_errors),
            "long_vowel_errors": len([e for e in vowel_errors if 'ː' in str(e.get("phoneme", ""))]),
        }
    
    def _analyze_consonants_v2(
        self,
        expected: str,
        transcript: str,
        alignment: List[Dict],
    ) -> Dict:
        """Enhanced consonant analysis with phoneme alignment."""
        base_consonant_issues = self.detect_consonant_length(expected, transcript)
        
        # Find consonant errors in alignment
        consonant_errors = []
        for segment in alignment:
            if not segment["match"] and segment.get("expected"):
                expected_ph = segment["expected"]
                # Check if it's a consonant phoneme
                if expected_ph not in ['a', 'aː', 'ä', 'æ', 'e', 'i', 'iː', 'o', 'oː', 'ö', 'ø', 'u', 'uː', 'y', 'yː']:
                    consonant_errors.append({
                        "phoneme": expected_ph,
                        "position": segment.get("position"),
                        "error": segment["type"],
                    })
        
        return {
            "base_issues": base_consonant_issues,
            "phoneme_errors": consonant_errors,
            "total_consonant_errors": len(consonant_errors),
            "gemination_errors": len([e for e in consonant_errors if 'ː' in str(e.get("phoneme", ""))]),
        }
    
    def _analyze_stress_patterns(self, expected: str, transcript: str) -> Dict:
        """
        Analyze stress patterns in Finnish.
        
        Finnish has fixed stress on the first syllable.
        """
        expected_words = expected.split()
        transcript_words = transcript.split()
        
        stress_errors = []
        
        # Check word count match
        if len(expected_words) != len(transcript_words):
            stress_errors.append({
                "type": "word_count_mismatch",
                "expected_count": len(expected_words),
                "actual_count": len(transcript_words),
            })
        
        # Check first syllable stress (simplified)
        # In Finnish, stress is always on first syllable
        # This would require syllable segmentation for full analysis
        
        return {
            "errors": stress_errors,
            "word_count_match": len(expected_words) == len(transcript_words),
            "stress_pattern": "first_syllable",  # Finnish rule
        }
    
    def _analyze_rhythm_v2(
        self,
        expected: str,
        transcript: str,
        alignment: List[Dict],
    ) -> Dict:
        """Enhanced rhythm analysis."""
        base_rhythm = self._assess_rhythm(expected.lower(), transcript.lower())
        
        # Analyze phoneme timing from alignment
        match_ratio = sum(1 for s in alignment if s["match"]) / len(alignment) if alignment else 0
        
        return {
            "base_assessment": base_rhythm,
            "phoneme_match_ratio": match_ratio,
            "rhythm_score": match_ratio * 4,  # Scale to 0-4
            "fluency": "good" if match_ratio > 0.8 else "needs_practice",
        }
    
    def _calculate_enhanced_score(
        self,
        base_score: int,
        phoneme_errors: List[Dict],
        vowel_analysis: Dict,
        consonant_analysis: Dict,
        stress_analysis: Dict,
    ) -> int:
        """Calculate enhanced pronunciation score."""
        # Start with base score
        score = float(base_score)
        
        # Penalize for phoneme errors
        critical_errors = len([e for e in phoneme_errors if e.get("severity") == "critical"])
        high_errors = len([e for e in phoneme_errors if e.get("severity") == "high"])
        
        score -= critical_errors * 0.5
        score -= high_errors * 0.3
        
        # Penalize for vowel/consonant errors
        vowel_penalty = min(vowel_analysis.get("total_vowel_errors", 0) * 0.2, 1.0)
        consonant_penalty = min(consonant_analysis.get("total_consonant_errors", 0) * 0.15, 1.0)
        
        score -= vowel_penalty
        score -= consonant_penalty
        
        # Ensure score stays in 0-4 range
        return max(0, min(4, int(round(score))))
    
    def _generate_detailed_feedback(
        self,
        phoneme_errors: List[Dict],
        vowel_analysis: Dict,
        consonant_analysis: Dict,
        stress_analysis: Dict,
        rhythm_analysis: Dict,
    ) -> str:
        """Generate detailed, actionable feedback."""
        feedback_parts = []
        
        # Phoneme-level feedback
        critical_phoneme_errors = [e for e in phoneme_errors if e.get("severity") == "critical"]
        if critical_phoneme_errors:
            feedback_parts.append(
                f"Kriittisiä ääntämisvirheitä: {len(critical_phoneme_errors)}. "
                "Keskitty erityisesti vokaalipituuksiin."
            )
        
        # Vowel feedback
        if vowel_analysis.get("total_vowel_errors", 0) > 0:
            feedback_parts.append(
                f"Vokaalivirheitä: {vowel_analysis['total_vowel_errors']}. "
                "Harjoittele pitkien ja lyhyiden vokaalien eroa."
            )
        
        # Consonant feedback
        if consonant_analysis.get("gemination_errors", 0) > 0:
            feedback_parts.append(
                f"Konsonanttipituusvirheitä: {consonant_analysis['gemination_errors']}. "
                "Muista geminaatio (kaksoiskonsonantit)."
            )
        
        # Rhythm feedback
        if rhythm_analysis.get("fluency") == "needs_practice":
            feedback_parts.append("Harjoittele sujuvuutta ja rytmiä.")
        
        if not feedback_parts:
            return "Erinomaista ääntämistä! Jatka hyvää työtä."
        
        return " ".join(feedback_parts)
    
    def _generate_segment_feedback(self, alignment: List[Dict]) -> List[Dict]:
        """Generate feedback for each segment."""
        segment_feedback = []
        
        for i, segment in enumerate(alignment):
            if not segment["match"]:
                segment_feedback.append({
                    "segment_index": i,
                    "expected": segment.get("expected"),
                    "actual": segment.get("actual"),
                    "error_type": segment.get("type"),
                    "feedback": self._segment_specific_feedback(segment),
                })
        
        return segment_feedback
    
    def _segment_specific_feedback(self, segment: Dict) -> str:
        """Generate feedback for a specific segment."""
        error_type = segment.get("type", "")
        expected = segment.get("expected", "")
        actual = segment.get("actual", "")
        
        if error_type == "substitution":
            if expected and 'ː' in expected and actual and 'ː' not in actual:
                return "Pitkä vokaali puuttuu. Harjoittele vokaalipituuksia."
            elif actual and 'ː' in actual and expected and 'ː' not in expected:
                return "Vokaali on liian pitkä. Lyhennä vokaalia."
            return f"Ääntämisvirhe: odotettiin '{expected}', äännetty '{actual}'."
        elif error_type == "deletion":
            return f"Puuttuva äänne: '{expected}'. Tarkista ääntäminen."
        elif error_type == "insertion":
            return f"Ylimääräinen äänne: '{actual}'. Poista äänne."
        
        return "Ääntämisvirhe tässä kohdassa."
    
    def _prioritize_improvements(self, phoneme_errors: List[Dict]) -> List[str]:
        """Prioritize improvement areas based on errors."""
        priorities = []
        
        # Count error types
        critical_count = len([e for e in phoneme_errors if e.get("severity") == "critical"])
        vowel_errors = len([e for e in phoneme_errors if 'a' in str(e.get("expected_phoneme", "")) or 'i' in str(e.get("expected_phoneme", ""))])
        consonant_errors = len([e for e in phoneme_errors if e.get("severity") == "high"])
        
        if critical_count > 0:
            priorities.append("1. Vokaalipituudet (kriittinen)")
        if vowel_errors > 2:
            priorities.append("2. Vokaalien ääntäminen")
        if consonant_errors > 2:
            priorities.append("3. Konsonanttipituudet (geminaatio)")
        
        if not priorities:
            priorities.append("Jatka harjoittelua ylläpitääksesi tason.")
        
        return priorities
    
    def _empty_analysis(self) -> Dict:
        """Return empty analysis structure."""
        return {
            "score": 0,
            "vowel_issues": [],
            "consonant_issues": [],
            "rhythm": "unknown",
            "feedback": "No text provided for analysis.",
            "phoneme_alignment": [],
            "phoneme_errors": [],
            "detailed_feedback": "Ei analysoitavaa tekstiä.",
        }


# Global instance
_pronunciation_engine_v2 = PronunciationEngineV2()


async def analyze_pronunciation_v2(
    audio_bytes: bytes | None = None,
    expected_text: str = "",
    transcript: str = "",
) -> Dict:
    """Analyze pronunciation using Pronunciation Engine v2."""
    return _pronunciation_engine_v2.analyze_audio_v2(
        audio_bytes=audio_bytes,
        expected_text=expected_text,
        transcript=transcript,
    )
