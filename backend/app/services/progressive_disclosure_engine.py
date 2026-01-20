"""Progressive Disclosure Engine - Controls text visibility to scaffold learning."""

import re
from typing import List, Dict


class ProgressiveDisclosureEngine:
    """Controls how much support text user sees based on their performance."""
    
    def compute_support_level(
        self, 
        history: List[Dict] | None = None,
        hesitation: float = 0.0,
        accuracy: float = 1.0
    ) -> int:
        """
        Compute support level (0-3) based on user performance.
        
        Levels:
        0: Full text visible (struggling)
        1: Hide case endings (moderate support)
        2: Hide verbs (minimal support)
        3: Memory mode - only topic hints (advanced)
        
        Args:
            history: List of previous interactions with error rates
            hesitation: Time between user responses (0.0 = fast, 1.0 = slow)
            accuracy: Accuracy score (0.0 = many errors, 1.0 = perfect)
        
        Returns:
            Support level (0-3)
        """
        if history is None:
            history = []
        
        # Calculate average error rate from history
        error_rate = 1.0 - accuracy
        avg_error_rate = error_rate
        if history:
            errors = [1.0 - h.get("accuracy", 1.0) for h in history[-5:]]
            if errors:
                avg_error_rate = sum(errors) / len(errors)
        
        # Decision logic
        if avg_error_rate > 0.5 or hesitation > 0.7:
            # User struggling - show full text
            return 0
        elif avg_error_rate > 0.25 or hesitation > 0.5:
            # Moderate difficulty - hide endings
            return 1
        elif avg_error_rate > 0.1:
            # Doing well - hide verbs
            return 2
        else:
            # Excellent - memory mode
            return 3
    
    def mask_text(self, text: str, level: int) -> str:
        """
        Mask text based on support level.
        
        Args:
            text: Original Finnish text
            level: Support level (0-3)
        
        Returns:
            Masked text with appropriate parts hidden
        """
        if level == 0:
            # Full text visible
            return text
        elif level == 1:
            # Hide case endings (e.g., "talossa" -> "talo___")
            return self._hide_case_endings(text)
        elif level == 2:
            # Hide verbs
            return self._hide_verbs(text)
        else:
            # Level 3: Memory mode - return topic only
            return self._memory_mode(text)
    
    def _hide_case_endings(self, text: str) -> str:
        """Hide Finnish case endings, leaving word stems visible."""
        # Common case endings to hide
        # Inessive: -ssa/-ssä, -lla/-llä
        # Elative: -sta/-stä
        # Illative: -an/-än, -seen, -hin/-hin
        # Partitive: -a/-ä, -ta/-tä
        # Genitive: -n
        # Adessive: -lla/-llä
        # Allative: -lle
        
        # Pattern: word ending with common case endings
        patterns = [
            (r'(\w+)(ssa|ssä|lla|llä)\b', r'\1___'),  # Inessive, Adessive
            (r'(\w+)(sta|stä)\b', r'\1___'),  # Elative
            (r'(\w+)(an|än|seen|hin|hyn)\b', r'\1___'),  # Illative
            (r'(\w+)(a|ä|ta|tä)\b', r'\1___'),  # Partitive (be careful with this)
            (r'(\w+)(n)\b(?!\w)', r'\1___'),  # Genitive (not followed by word char)
        ]
        
        masked = text
        for pattern, replacement in patterns:
            masked = re.sub(pattern, replacement, masked, flags=re.IGNORECASE)
        
        return masked
    
    def _hide_verbs(self, text: str) -> str:
        """Hide verbs, replacing with blanks."""
        # Simple heuristic: words ending in common verb endings
        # -n (1st person), -t (2nd person), -v (3rd person), -mme, -tte, -vat
        verb_pattern = r'\b\w+(n|t|v|mme|tte|vat)\b'
        masked = re.sub(verb_pattern, '____', text, flags=re.IGNORECASE)
        return masked
    
    def _memory_mode(self, text: str) -> str:
        """Return only topic/keywords, no full text."""
        # Extract key nouns and topics (simplified)
        # In a real implementation, this would use NLP to extract topics
        words = text.split()
        # Keep only capitalized words (often proper nouns/topics) and first few words
        key_words = [w for w in words[:3] if w[0].isupper()] + words[:2]
        if key_words:
            return f"Topic: {' '.join(key_words[:5])}..."
        return "Memory mode: Recall the conversation topic."
    
    def enable_memory_mode(self, text: str) -> str:
        """Enable pure memory mode - no text support."""
        return self._memory_mode(text)

