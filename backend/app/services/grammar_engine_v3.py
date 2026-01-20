"""Grammar Engine v3 - Hybrid Omorfi + AI + Rule-based analysis."""

from __future__ import annotations

from typing import Dict, List, Optional
import re

import httpx
from app.core.config import get_settings
from app.services import grammar_engine
from app.utils import omorfi_wrapper

settings = get_settings()
OPENAI_URL = "https://api.openai.com/v1/chat/completions"


class GrammarEngineV3:
    """
    Advanced grammar engine combining:
    - Omorfi morphological analysis (when available)
    - Rule-based detection
    - LLM-powered contextual analysis
    - Severity classification
    """
    
    def __init__(self):
        self.omorfi_available = False
        self._check_omorfi()
    
    def _check_omorfi(self):
        """Check if Omorfi is available."""
        try:
            result = omorfi_wrapper.parse("test")
            # If Omorfi returns actual analysis (not "pending"), it's available
            if result and result.get("analysis") != "pending":
                self.omorfi_available = True
        except Exception:
            self.omorfi_available = False
    
    async def analyze(self, text: str, use_llm: bool = False) -> Dict:
        """
        Comprehensive grammar analysis using hybrid approach.
        
        Args:
            text: Finnish text to analyze
            use_llm: Whether to use LLM for contextual analysis
        
        Returns:
            Complete analysis with errors, corrections, and explanations
        """
        # Step 1: Basic rule-based detection (always available)
        rule_errors = self._rule_based_analysis(text)
        
        # Step 2: Omorfi morphological analysis (if available)
        omorfi_errors = []
        if self.omorfi_available:
            omorfi_errors = self._omorfi_analysis(text)
        
        # Step 3: Combine and classify
        all_errors = rule_errors + omorfi_errors
        classified = self.classify_errors(all_errors)
        
        # Step 4: Assign severity
        errors_with_severity = self._assign_severity(classified)
        
        # Step 5: Generate explanations
        explanations = [self.generate_explanation(err) for err in errors_with_severity]
        
        # Step 6: LLM contextual check (optional, for complex cases)
        llm_suggestions = []
        if use_llm and errors_with_severity:
            llm_suggestions = await self._llm_contextual_check(text, errors_with_severity)
        
        return {
            "mistakes": errors_with_severity,
            "suggestions": explanations,
            "llm_suggestions": llm_suggestions,
            "analysis_summary": self._summarize_analysis(errors_with_severity),
            "severity_breakdown": self._severity_breakdown(errors_with_severity),
            "confidence": "high" if self.omorfi_available else "medium",
        }
    
    def _rule_based_analysis(self, text: str) -> List[Dict]:
        """Use existing rule-based detection."""
        # Use existing grammar_engine functions
        case_errors = grammar_engine.detect_case_errors(text)
        verb_errors = grammar_engine.detect_verb_errors(text)
        puhekieli = grammar_engine.detect_puhekieli(text)
        
        return case_errors + verb_errors + puhekieli
    
    def _omorfi_analysis(self, text: str) -> List[Dict]:
        """
        Use Omorfi for morphological analysis.
        
        Detects:
        - Incorrect case endings
        - Verb conjugation errors
        - Word form issues
        """
        errors = []
        
        try:
            # Parse text with Omorfi
            analysis = omorfi_wrapper.parse(text)
            
            # Extract morphological information
            if isinstance(analysis, dict) and "analysis" in analysis:
                # Omorfi returns word analyses
                # Check for morphological inconsistencies
                words = text.split()
                
                for word in words:
                    word_analysis = analysis.get("analysis", {}).get(word, {})
                    if word_analysis:
                        # Check case endings (pass sentence context)
                        case_error = self._check_case_with_omorfi(word, word_analysis, sentence_context=text)
                        if case_error:
                            errors.append(case_error)
                        
                        # Check verb forms (pass sentence context)
                        verb_error = self._check_verb_with_omorfi(word, word_analysis, sentence_context=text)
                        if verb_error:
                            errors.append(verb_error)
        except Exception as e:
            # Omorfi not available or error - fall back to rules
            pass
        
        return errors
    
    def _check_case_with_omorfi(self, word: str, analysis: Dict, sentence_context: Optional[str] = None) -> Optional[Dict]:
        """Check case usage with Omorfi analysis."""
        # Extract case from morphological tags
        tags = analysis.get("tags", [])
        case = None
        
        # Look for case tags (e.g., "INE" for inessive, "ILL" for illative)
        case_map = {
            "INE": "inessive",
            "ILL": "illative",
            "ELA": "elative",
            "ADE": "adessive",
            "PAR": "partitive",
            "GEN": "genitive",
            "ACC": "accusative",
        }
        
        for tag in tags:
            if tag in case_map:
                case = case_map[tag]
                break
        
        # Basic case checking with common verb patterns
        if sentence_context:
            context_lower = sentence_context.lower()
            word_lower = word.lower()
            
            # Check for common verb + case patterns
            # Verbs requiring partitive object
            partitive_verbs = ["haluta", "juoda", "syödä", "ostaa", "lukea"]
            if any(verb in context_lower for verb in partitive_verbs):
                if case != "partitive" and word_lower in context_lower:
                    # Check if this word should be partitive
                    if "minä" in context_lower or "sinä" in context_lower or "hän" in context_lower:
                        return {
                            "type": "case",
                            "word": word,
                            "detected_case": case,
                            "expected_case": "partitive",
                            "reason": f"After verbs like {[v for v in partitive_verbs if v in context_lower][0]}, the object typically takes partitive case.",
                        }
            
            # Motion verbs + location cases
            motion_verbs = ["mennä", "tulla", "lähteä", "kävellä"]
            if any(verb in context_lower for verb in motion_verbs):
                # Motion into → illative, motion inside → inessive
                if "sisään" in context_lower or "kotiin" in context_lower:
                    if case != "illative" and word_lower in context_lower:
                        return {
                            "type": "case",
                            "word": word,
                            "detected_case": case,
                            "expected_case": "illative",
                            "reason": "Motion into a place requires illative case (-an/-en/-in, -seen, -hin).",
                        }
        
        # Without context, we can't determine if case is wrong
        # This would require full sentence parsing or LLM analysis
        return None
    
    def _check_verb_with_omorfi(self, word: str, analysis: Dict, sentence_context: Optional[str] = None) -> Optional[Dict]:
        """Check verb conjugation with Omorfi analysis."""
        tags = analysis.get("tags", [])
        
        # Check if it's a verb
        if "V" not in tags:  # V = verb
            return None
        
        # Extract person/number from tags
        person = None
        number = None
        for tag in tags:
            if tag.startswith("SG") or tag.startswith("PL"):
                number = tag
            if tag in ["1", "2", "3"]:
                person = tag
        
        # Basic verb agreement checking with common patterns
        if sentence_context:
            context_lower = sentence_context.lower()
            word_lower = word.lower()
            
            # Check for subject-verb agreement patterns
            # First person singular
            if "minä" in context_lower and word_lower in context_lower:
                # Verb should be 1st person singular (typically ends in -n)
                if not word_lower.endswith(("n", "en", "in", "an", "än")):
                    # Check if it's infinitive or wrong form
                    if word_lower.endswith(("a", "ä", "da", "dä")):
                        return {
                            "type": "verb",
                            "word": word,
                            "detected_form": "infinitive",
                            "expected_form": "1st person singular",
                            "reason": "With 'minä' (I), the verb should be conjugated in 1st person singular (typically ends in -n).",
                        }
            
            # Second person singular
            if "sinä" in context_lower and word_lower in context_lower:
                # Verb should be 2nd person singular (typically ends in -t)
                if not word_lower.endswith(("t", "et", "it", "at", "ät")):
                    if word_lower.endswith(("a", "ä", "da", "dä")):
                        return {
                            "type": "verb",
                            "word": word,
                            "detected_form": "infinitive",
                            "expected_form": "2nd person singular",
                            "reason": "With 'sinä' (you), the verb should be conjugated in 2nd person singular (typically ends in -t).",
                        }
            
            # Third person singular
            if any(pronoun in context_lower for pronoun in ["hän", "se"]) and word_lower in context_lower:
                # Verb should be 3rd person singular (varies by verb type)
                # Common: ends in vowel or -i
                if word_lower.endswith(("a", "ä", "da", "dä")):
                    return {
                        "type": "verb",
                        "word": word,
                        "detected_form": "infinitive",
                        "expected_form": "3rd person singular",
                        "reason": "With 'hän' or 'se', the verb should be conjugated in 3rd person singular.",
                    }
        
        # Without context, we can't determine if verb agreement is wrong
        # This would require full sentence parsing or LLM analysis
        return None
    
    def classify_errors(self, errors: List[Dict]) -> List[Dict]:
        """
        Classify errors into categories with enhanced typing.
        
        Categories:
        - case: Case ending errors
        - verb: Verb conjugation errors
        - agreement: Subject-verb agreement
        - word_order: V2 word order violations
        - spelling: Spelling mistakes
        - register: Puhekieli/kirjakieli issues
        """
        classified = []
        
        for error in errors:
            error_type = error.get("type", "unknown")
            
            # Enhanced classification
            if error_type == "case":
                classified.append({
                    **error,
                    "category": "case",
                    "subcategory": self._classify_case_error(error),
                })
            elif error_type == "verb":
                classified.append({
                    **error,
                    "category": "verb",
                    "subcategory": self._classify_verb_error(error),
                })
            elif error_type == "puhekieli":
                classified.append({
                    **error,
                    "category": "register",
                    "subcategory": "informal_detected",
                })
            else:
                classified.append({
                    **error,
                    "category": error_type,
                    "subcategory": "general",
                })
        
        return classified
    
    def _classify_case_error(self, error: Dict) -> str:
        """Classify specific case error type."""
        original = error.get("original", "").lower()
        suggested = error.get("suggested", "").lower()
        
        # Detect case endings
        if "ssa" in original or "ssä" in original:
            return "inessive"
        elif "an" in original or "än" in original or "seen" in original:
            return "illative"
        elif "sta" in original or "stä" in original:
            return "elative"
        elif "lla" in original or "llä" in original:
            return "adessive"
        elif original.endswith(("a", "ä", "ta", "tä")):
            return "partitive"
        elif original.endswith("n"):
            return "genitive"
        
        return "case_general"
    
    def _classify_verb_error(self, error: Dict) -> str:
        """Classify specific verb error type."""
        original = error.get("original", "").lower()
        
        if "minä" in original and "mennä" in original:
            return "missing_person_ending"
        elif "olla" in original:
            return "infinitive_used"
        
        return "conjugation_general"
    
    def _assign_severity(self, errors: List[Dict]) -> List[Dict]:
        """
        Assign severity levels to errors.
        
        Severity levels:
        - critical: Blocks comprehension
        - high: Significant meaning change
        - medium: Noticeable but understandable
        - low: Minor stylistic issue
        """
        errors_with_severity = []
        
        for error in errors:
            category = error.get("category", "unknown")
            error_type = error.get("type", "unknown")
            
            # Severity rules
            if category == "case" and error_type in ("partitive", "genitive"):
                severity = "high"  # Object case is critical
            elif category == "verb" and "missing_person_ending" in error.get("subcategory", ""):
                severity = "critical"  # Unconjugated verb is critical
            elif category == "register":
                severity = "low"  # Register is stylistic
            elif category == "word_order":
                severity = "medium"  # Word order affects flow
            else:
                severity = "medium"
            
            errors_with_severity.append({
                **error,
                "severity": severity,
            })
        
        return errors_with_severity
    
    def generate_explanation(self, mistake: Dict) -> Dict:
        """
        Generate comprehensive explanation for a mistake.
        
        Includes:
        - Error identification
        - Correction
        - Rule explanation
        - Example
        - CEFR level
        """
        error_type = mistake.get("type", "unknown")
        category = mistake.get("category", "unknown")
        severity = mistake.get("severity", "medium")
        
        # Base explanation
        explanation = {
            "error": mistake.get("original"),
            "correction": mistake.get("suggested"),
            "reason": mistake.get("reason", "Grammar rule violation"),
            "type": error_type,
            "category": category,
            "severity": severity,
        }
        
        # Add rule explanation based on category
        if category == "case":
            explanation["rule"] = self._get_case_rule(mistake)
            explanation["example"] = self._get_case_example(mistake)
        elif category == "verb":
            explanation["rule"] = self._get_verb_rule(mistake)
            explanation["example"] = self._get_verb_example(mistake)
        
        # CEFR level (simplified)
        if severity == "critical":
            explanation["cefr_level"] = "A1-A2"
        elif severity == "high":
            explanation["cefr_level"] = "A2"
        else:
            explanation["cefr_level"] = "A2-B1"
        
        return explanation
    
    def _get_case_rule(self, mistake: Dict) -> str:
        """Get rule explanation for case error."""
        subcategory = mistake.get("subcategory", "")
        
        rules = {
            "partitive": "Partitiivia käytetään objektina monissa verbien kanssa, esim. 'haluta', 'rakastaa'.",
            "inessive": "Inessiivi ilmaisee sijaintia: -ssa/-ssä.",
            "illative": "Illatiivi ilmaisee liikettä johonkin: -an/-än, -seen, -hin.",
            "elative": "Elatiivi ilmaisee liikettä jostain: -sta/-stä.",
        }
        
        return rules.get(subcategory, "Tarkista sijamuoto.")
    
    def _get_case_example(self, mistake: Dict) -> str:
        """Get example for case error."""
        subcategory = mistake.get("subcategory", "")
        
        examples = {
            "partitive": "Haluan kahvia (ei: kahvi)",
            "inessive": "Olen kaupassa (ei: kauppa)",
            "illative": "Menen kauppaan (ei: kauppa)",
        }
        
        return examples.get(subcategory, "")
    
    def _get_verb_rule(self, mistake: Dict) -> str:
        """Get rule explanation for verb error."""
        subcategory = mistake.get("subcategory", "")
        
        if "missing_person_ending" in subcategory:
            return "Verbi tarvitsee persoonapäätteen: minä menen (ei: minä mennä)."
        elif "infinitive_used" in subcategory:
            return "Käytä konjugoitua muotoa, ei infinitiiviä: minä olen (ei: minä olla)."
        
        return "Tarkista verbin muoto."
    
    def _get_verb_example(self, mistake: Dict) -> str:
        """Get example for verb error."""
        return mistake.get("suggested", "") + " (ei: " + mistake.get("original", "") + ")"
    
    async def _llm_contextual_check(self, text: str, errors: List[Dict]) -> List[Dict]:
        """
        Use LLM for contextual grammar checking.
        
        This catches errors that rule-based and morphological analysis miss,
        such as:
        - Context-dependent case usage
        - Idiomatic expressions
        - Register appropriateness
        """
        if not settings.openai_api_key:
            return []
        
        try:
            # Build prompt for LLM contextual analysis
            errors_summary = "\n".join([
                f"- {err.get('type', 'unknown')}: {err.get('word', '')} - {err.get('reason', '')}"
                for err in errors[:5]  # Limit to first 5 for context
            ])
            
            prompt = f"""Analyze this Finnish sentence for contextual grammar errors that rule-based analysis might miss:

Sentence: {text}

Detected errors so far:
{errors_summary if errors_summary else "None detected"}

Focus on:
1. Context-dependent case usage (e.g., partitive vs. accusative)
2. Verb agreement with subject
3. Word order issues
4. Register appropriateness (puhekieli vs. kirjakieli)
5. Idiomatic expressions

Return a JSON array of additional errors found, or empty array if none. Format:
[
  {{
    "type": "case|verb|word_order|register",
    "word": "problematic word",
    "reason": "brief explanation",
    "severity": "low|medium|high|critical"
  }}
]"""
            
            headers = {"Authorization": f"Bearer {settings.openai_api_key}"}
            payload = {
                "model": "gpt-4o-mini",
                "messages": [
                    {"role": "system", "content": "You are a Finnish grammar expert. Return only valid JSON arrays."},
                    {"role": "user", "content": prompt},
                ],
                "temperature": 0.3,  # Lower temperature for more consistent grammar analysis
            }
            
            async with httpx.AsyncClient(timeout=15.0) as client:
                resp = await client.post(OPENAI_URL, json=payload, headers=headers)
                resp.raise_for_status()
                data = resp.json()
                content = data["choices"][0]["message"]["content"].strip()
                
                # Parse JSON response
                import json
                # Try to extract JSON from markdown code blocks if present
                if "```json" in content:
                    content = content.split("```json")[1].split("```")[0].strip()
                elif "```" in content:
                    content = content.split("```")[1].split("```")[0].strip()
                
                llm_errors = json.loads(content)
                if isinstance(llm_errors, list):
                    return llm_errors
                return []
        except Exception:
            # If LLM call fails, return empty list (fallback to rule-based only)
            return []
    
    def _summarize_analysis(self, errors: List[Dict]) -> str:
        """Generate summary of analysis."""
        if not errors:
            return "Hyvä! Ei havaittuja kielioppivirheitä."
        
        critical = len([e for e in errors if e.get("severity") == "critical"])
        high = len([e for e in errors if e.get("severity") == "high"])
        medium = len([e for e in errors if e.get("severity") == "medium"])
        low = len([e for e in errors if e.get("severity") == "low"])
        
        if critical > 0:
            return f"Havaittu {len(errors)} virhettä, joista {critical} kriittistä. Tarkista erityisesti verbit."
        elif high > 0:
            return f"Havaittu {len(errors)} virhettä, joista {high} merkittävää. Harjoittele sijamuotoja."
        else:
            return f"Havaittu {len(errors)} pientä virhettä. Jatka harjoittelua!"
    
    def _severity_breakdown(self, errors: List[Dict]) -> Dict:
        """Break down errors by severity."""
        return {
            "critical": len([e for e in errors if e.get("severity") == "critical"]),
            "high": len([e for e in errors if e.get("severity") == "high"]),
            "medium": len([e for e in errors if e.get("severity") == "medium"]),
            "low": len([e for e in errors if e.get("severity") == "low"]),
        }


# Global instance
_grammar_engine_v3 = GrammarEngineV3()


async def analyze_grammar_v3(text: str, use_llm: bool = False) -> Dict:
    """Analyze grammar using Grammar Engine v3."""
    return await _grammar_engine_v3.analyze(text, use_llm=use_llm)
