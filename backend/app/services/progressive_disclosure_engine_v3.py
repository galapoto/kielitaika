"""Progressive Disclosure Engine v3 - ML-based difficulty adjustment."""

from __future__ import annotations

import re
from typing import List, Dict, Optional
from collections import deque
import statistics


class ProgressiveDisclosureEngineV3:
    """
    Advanced progressive disclosure with ML-inspired difficulty prediction.
    
    Features:
    - Machine learning-inspired pattern recognition
    - Adaptive difficulty based on error patterns
    - Context-aware masking
    - Performance trend analysis
    - Personalized support levels
    """
    
    def __init__(self, history_window: int = 10):
        """
        Initialize engine.
        
        Args:
            history_window: Number of recent interactions to consider
        """
        self.history_window = history_window
        self.user_performance = {}  # user_id -> deque of performance metrics
    
    def compute_support_level(
        self,
        user_id: str | None,
        history: List[Dict] | None = None,
        hesitation: float = 0.0,
        accuracy: float = 1.0,
        error_types: List[str] | None = None,
        text_complexity: float = 0.5,
    ) -> int:
        """
        Compute support level (0-3) using ML-inspired prediction.
        
        Levels:
        0: Full text visible (struggling)
        1: Hide case endings (moderate support)
        2: Hide verbs (minimal support)
        3: Memory mode - only topic hints (advanced)
        
        Args:
            user_id: User identifier for personalization
            history: List of previous interactions
            hesitation: Response time metric (0.0 = fast, 1.0 = slow)
            accuracy: Current accuracy (0.0 = many errors, 1.0 = perfect)
            error_types: List of error categories (e.g., ["case", "verb"])
            text_complexity: Complexity of current text (0.0 = simple, 1.0 = complex)
        
        Returns:
            Support level (0-3)
        """
        # Update performance history
        if user_id:
            self._update_performance_history(user_id, accuracy, hesitation, error_types)
        
        # Calculate features for prediction
        features = self._extract_features(
            user_id=user_id,
            history=history,
            hesitation=hesitation,
            accuracy=accuracy,
            error_types=error_types,
            text_complexity=text_complexity,
        )
        
        # ML-inspired prediction (using weighted features)
        support_level = self._predict_support_level(features)
        
        return support_level
    
    def _extract_features(
        self,
        user_id: str | None,
        history: List[Dict] | None,
        hesitation: float,
        accuracy: float,
        error_types: List[str] | None,
        text_complexity: float,
    ) -> Dict:
        """Extract features for difficulty prediction."""
        # Feature 1: Current accuracy
        accuracy_feature = 1.0 - accuracy
        
        # Feature 2: Trend (improving/declining)
        trend = 0.0
        if user_id and user_id in self.user_performance:
            perf_history = list(self.user_performance[user_id])
            if len(perf_history) >= 3:
                recent = perf_history[-3:]
                older = perf_history[-6:-3] if len(perf_history) >= 6 else perf_history[:3]
                recent_avg = statistics.mean(recent)
                older_avg = statistics.mean(older) if older else recent_avg
                trend = older_avg - recent_avg  # Positive = improving
        
        # Feature 3: Error pattern consistency
        error_consistency = 0.0
        if error_types:
            if user_id and user_id in self.user_performance:
                # Check if same error types repeat
                recent_errors = [p.get("error_types", []) for p in list(self.user_performance[user_id])[-5:]]
                if recent_errors:
                    all_errors = [e for errors in recent_errors for e in errors]
                    if all_errors:
                        most_common = max(set(all_errors), key=all_errors.count)
                        consistency = all_errors.count(most_common) / len(all_errors)
                        error_consistency = consistency if most_common in error_types else 0.0
        
        # Feature 4: Hesitation pattern
        hesitation_feature = hesitation
        
        # Feature 5: Text complexity interaction
        complexity_interaction = text_complexity * accuracy_feature
        
        # Feature 6: Historical performance
        historical_accuracy = accuracy
        if user_id and user_id in self.user_performance:
            perf_history = list(self.user_performance[user_id])
            if perf_history:
                historical_accuracy = statistics.mean([p.get("accuracy", accuracy) for p in perf_history[-5:]])
        
        return {
            "accuracy": accuracy_feature,
            "trend": trend,
            "error_consistency": error_consistency,
            "hesitation": hesitation_feature,
            "complexity_interaction": complexity_interaction,
            "historical_accuracy": 1.0 - historical_accuracy,
        }
    
    def _predict_support_level(self, features: Dict) -> int:
        """
        Predict support level using weighted feature combination.
        
        This is an ML-inspired approach using feature weights.
        """
        # Weighted sum of features
        weights = {
            "accuracy": 0.3,
            "trend": 0.15,
            "error_consistency": 0.2,
            "hesitation": 0.15,
            "complexity_interaction": 0.1,
            "historical_accuracy": 0.1,
        }
        
        weighted_score = sum(
            features.get(key, 0.0) * weight
            for key, weight in weights.items()
        )
        
        # Decision thresholds (learned from patterns)
        if weighted_score > 0.6:
            # High difficulty - full support
            return 0
        elif weighted_score > 0.4:
            # Moderate difficulty - hide endings
            return 1
        elif weighted_score > 0.2:
            # Low difficulty - hide verbs
            return 2
        else:
            # Very low difficulty - memory mode
            return 3
    
    def _update_performance_history(
        self,
        user_id: str,
        accuracy: float,
        hesitation: float,
        error_types: List[str] | None,
    ):
        """Update performance history for user."""
        if user_id not in self.user_performance:
            self.user_performance[user_id] = deque(maxlen=self.history_window)
        
        self.user_performance[user_id].append({
            "accuracy": accuracy,
            "hesitation": hesitation,
            "error_types": error_types or [],
        })
    
    def mask_text(self, text: str, level: int, context: Optional[Dict] = None) -> str:
        """
        Mask text based on support level with context awareness.
        
        Args:
            text: Original Finnish text
            level: Support level (0-3)
            context: Optional context (error types, user level, etc.)
        
        Returns:
            Masked text
        """
        if level == 0:
            return text
        elif level == 1:
            return self._hide_case_endings_smart(text, context)
        elif level == 2:
            return self._hide_verbs_smart(text, context)
        else:
            return self._memory_mode_enhanced(text, context)
    
    def _hide_case_endings_smart(self, text: str, context: Optional[Dict] = None) -> str:
        """Hide case endings with context awareness."""
        # If context has error_types, prioritize hiding those specific endings
        error_types = context.get("error_types", []) if context else []
        
        # Enhanced pattern matching
        patterns = [
            (r'(\w+)(ssa|ssä|lla|llä)\b', r'\1___'),  # Inessive, Adessive
            (r'(\w+)(sta|stä)\b', r'\1___'),  # Elative
            (r'(\w+)(an|än|seen|hin|hyn)\b', r'\1___'),  # Illative
            (r'(\w+)(a|ä|ta|tä)\b(?!\w)', r'\1___'),  # Partitive (careful)
            (r'(\w+)(n)\b(?!\w)', r'\1___'),  # Genitive
        ]
        
        masked = text
        for pattern, replacement in patterns:
            masked = re.sub(pattern, replacement, masked, flags=re.IGNORECASE)
        
        return masked
    
    def _hide_verbs_smart(self, text: str, context: Optional[Dict] = None) -> str:
        """Hide verbs with context awareness."""
        # Enhanced verb detection
        verb_patterns = [
            r'\b\w+(n|t|v|mme|tte|vat)\b',  # Standard endings
            r'\b\w+(nut|nyt|ttu|tty)\b',  # Past participles
            r'\b\w+(maan|mään|massa|mässä)\b',  # Infinitives
        ]
        
        masked = text
        for pattern in verb_patterns:
            masked = re.sub(pattern, '____', masked, flags=re.IGNORECASE)
        
        return masked
    
    def _memory_mode_enhanced(self, text: str, context: Optional[Dict] = None) -> str:
        """Enhanced memory mode with topic extraction."""
        # Extract key information
        words = text.split()
        
        # Keep important words (nouns, topics)
        # In production, this would use proper NLP
        key_words = []
        for word in words[:10]:  # First 10 words often contain topic
            if word[0].isupper() or len(word) > 5:  # Proper nouns or longer words
                key_words.append(word)
        
        if key_words:
            return f"Topic: {' '.join(key_words[:5])}..."
        
        return "Memory mode: Recall the conversation topic."
    
    def get_difficulty_recommendation(
        self,
        user_id: str | None,
        current_level: str,
    ) -> Dict:
        """
        Recommend difficulty adjustment based on performance.
        
        Returns:
            Dict with recommended_level and reasoning
        """
        if not user_id or user_id not in self.user_performance:
            return {
                "recommended_level": current_level,
                "reasoning": "Insufficient data",
            }
        
        perf_history = list(self.user_performance[user_id])
        if len(perf_history) < 3:
            return {
                "recommended_level": current_level,
                "reasoning": "Need more data",
            }
        
        recent_accuracy = statistics.mean([p.get("accuracy", 0.5) for p in perf_history[-5:]])
        
        level_map = {"A1": 1, "A2": 2, "B1": 3, "B2": 4}
        current_num = level_map.get(current_level, 2)
        
        if recent_accuracy > 0.85:
            # Doing very well - suggest level up
            recommended_num = min(current_num + 1, 4)
        elif recent_accuracy < 0.5:
            # Struggling - suggest level down
            recommended_num = max(current_num - 1, 1)
        else:
            recommended_num = current_num
        
        reverse_map = {1: "A1", 2: "A2", 3: "B1", 4: "B2"}
        recommended_level = reverse_map.get(recommended_num, current_level)
        
        return {
            "recommended_level": recommended_level,
            "reasoning": f"Based on {recent_accuracy:.1%} recent accuracy",
            "confidence": "high" if len(perf_history) >= 5 else "medium",
        }
