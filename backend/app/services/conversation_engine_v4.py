"""Conversation Engine v4 - Advanced adaptation and multi-turn intelligence."""

from __future__ import annotations

from typing import Dict, List, Optional
import re
import httpx
from app.core.config import get_settings
from app.services import grammar_engine, memory_service, path_engine
from app.services.progressive_disclosure_engine_v3 import ProgressiveDisclosureEngineV3
from app.services.grammar_engine_v3 import analyze_grammar_v3
from app.services.personalization_service import generate_learning_plan
from app.services.daily_recharge_engine import (
    generate_today_recharge,
    integrate_recharge_into_prompt,
)
from app.services.session_summary_engine import build_quick_summary, forecast_topic
from app.services.cefr_micro_ladder import ladder_for_level

settings = get_settings()
OPENAI_URL = "https://api.openai.com/v1/chat/completions"

_progressive_disclosure = ProgressiveDisclosureEngineV3()


class ConversationEngineV4:
    """
    Advanced conversation engine with:
    - Multi-turn context awareness
    - Adaptive difficulty adjustment
    - Struggle detection and intervention
    - Personalized teaching style
    - Error pattern recognition
    """
    
    def __init__(self):
        self.conversation_history = {}  # user_id -> conversation state
        self.error_patterns = {}  # user_id -> error frequency
    
    async def handle_conversation(
        self,
        user_text: str,
        user_id: str | None,
        level: str = "A1",
        correction_mode: str = "medium",
        path: str = "general",
        profession: str | None = None,
        enable_progressive_disclosure: bool = True,
    ) -> Dict:
        """
        Handle conversation with advanced adaptation.
        
        Features:
        - Detects user struggle and adjusts difficulty
        - Tracks error patterns
        - Adapts teaching style based on performance
        - Provides contextual help
        """
        # Load conversation state
        state = self._get_conversation_state(user_id)
        
        # Analyze user input with Grammar Engine v3
        grammar_info = await analyze_grammar_v3(user_text, use_llm=False)
        recharge_bundle = await generate_today_recharge(user_id)
        
        # Update error patterns
        self._update_error_patterns(user_id, grammar_info)
        
        # Detect struggle
        is_struggling = self._detect_struggle(user_id, grammar_info, state)
        
        # Adjust difficulty if struggling
        if is_struggling:
            level = self._adjust_difficulty_down(level)
            correction_mode = "light"
            enable_progressive_disclosure = True
        
        # Get context
        context_summary = await memory_service.compress_context(user_id)
        recent_messages = await memory_service.get_recent_messages(user_id, limit=10)
        
        # Calculate accuracy
        accuracy = self._calculate_accuracy(grammar_info)
        
        # Compute support level with v3 ML-based engine
        support_level = 0
        if enable_progressive_disclosure:
            error_types = [err.get("error_type", "") for err in grammar_info.get("mistakes", [])]
            support_level = _progressive_disclosure.compute_support_level(
                user_id=user_id,
                history=state.get("recent_performance", []),
                hesitation=state.get("hesitation", 0.0),
                accuracy=accuracy,
                error_types=error_types,
                text_complexity=self._estimate_text_complexity(user_text),
            )
        
        # Get today's recharge for integration
        recharge_note = integrate_recharge_into_prompt(user_id, context_summary)
        
        # Build advanced prompt
        system_prompt = self._build_advanced_prompt(
            level=level,
            correction_mode=correction_mode,
            path=path,
            profession=profession,
            context_summary=context_summary,
            grammar_info=grammar_info,
            support_level=support_level,
            is_struggling=is_struggling,
            error_patterns=self.error_patterns.get(user_id, {}),
            conversation_state=state,
            recharge_bundle=recharge_bundle,
            user_id=user_id,
        )
        
        # Get AI response
        if not settings.openai_api_key:
            reply = "Hei! (stubbed response)."
        else:
            reply = await self._call_openai_advanced(system_prompt, user_text, recent_messages)
        
        # Apply progressive disclosure
        masked_reply = reply
        if enable_progressive_disclosure and support_level > 0:
            error_types = [err.get("error_type", "") for err in grammar_info.get("mistakes", [])]
            context = {
                "error_types": error_types,
                "user_level": level,
                "is_struggling": is_struggling,
            }
            masked_reply = _progressive_disclosure.mask_text(reply, support_level, context=context)
        
        # Update conversation state
        self._update_conversation_state(
            user_id,
            user_text,
            reply,
            grammar_info,
            accuracy,
            is_struggling,
        )
        
        # Save to memory
        await memory_service.save_message(user_id, "user", user_text)
        await memory_service.save_message(user_id, "assistant", reply)
        
        # Generate follow-up suggestions
        follow_ups = self._generate_follow_ups(grammar_info, is_struggling, path)
        
        summary = build_quick_summary(recent_messages + [{"role": "user", "content": user_text}], reply)
        topic_forecast = forecast_topic(user_text)

        return {
            "reply": reply,
            "masked_reply": masked_reply,
            "support_level": support_level,
            "grammar": grammar_info,
            "is_struggling": is_struggling,
            "difficulty_adjusted": is_struggling,
            "follow_up_suggestions": follow_ups,
            "summary": summary,
            "meta": {
                "path": path,
                "profession": profession,
                "level": level,
                "correction_mode": correction_mode,
                "progressive_disclosure_enabled": enable_progressive_disclosure,
                "conversation_turn": state.get("turn_count", 0),
                "topic_forecast": topic_forecast,
                "micro_ladder": ladder_for_level(level),
            },
        }
    
    def _get_conversation_state(self, user_id: str | None) -> Dict:
        """Get or create conversation state for user."""
        if not user_id:
            return {}
        
        if user_id not in self.conversation_history:
            self.conversation_history[user_id] = {
                "turn_count": 0,
                "recent_performance": [],
                "hesitation": 0.0,
                "last_error_count": 0,
                "struggle_count": 0,
            }
        
        return self.conversation_history[user_id]
    
    def _update_error_patterns(self, user_id: str | None, grammar_info: Dict) -> None:
        """Track error patterns for user."""
        if not user_id:
            return
        
        if user_id not in self.error_patterns:
            self.error_patterns[user_id] = {}
        
        mistakes = grammar_info.get("mistakes", [])
        for mistake in mistakes:
            error_type = mistake.get("type", "unknown")
            category = mistake.get("category", "unknown")
            key = f"{category}:{error_type}"
            
            self.error_patterns[user_id][key] = self.error_patterns[user_id].get(key, 0) + 1
    
    def _detect_struggle(
        self,
        user_id: str | None,
        grammar_info: Dict,
        state: Dict,
    ) -> bool:
        """Detect if user is struggling."""
        if not user_id:
            return False
        
        mistakes = grammar_info.get("mistakes", [])
        error_count = len(mistakes)
        
        # Check for critical errors
        critical_errors = len([m for m in mistakes if m.get("severity") == "critical"])
        
        # Check recent performance
        recent_performance = state.get("recent_performance", [])
        if len(recent_performance) >= 3:
            recent_errors = sum(p.get("error_count", 0) for p in recent_performance[-3:])
            if recent_errors > 5:
                return True
        
        # Multiple critical errors = struggling
        if critical_errors >= 2:
            return True
        
        # High error rate
        if error_count >= 3:
            return True
        
        return False
    
    def _adjust_difficulty_down(self, current_level: str) -> str:
        """Adjust difficulty level down if user is struggling."""
        level_map = {
            "B1": "A2",
            "A2": "A1",
            "A1": "A1",  # Can't go lower
        }
        return level_map.get(current_level, current_level)
    
    def _calculate_accuracy(self, grammar_info: Dict) -> float:
        """Calculate accuracy from grammar analysis."""
        mistakes = grammar_info.get("mistakes", [])
        if not mistakes:
            return 1.0
        
        # Weight by severity
        total_severity = 0
        for mistake in mistakes:
            severity = mistake.get("severity", "medium")
            if severity == "critical":
                total_severity += 3
            elif severity == "high":
                total_severity += 2
            elif severity == "medium":
                total_severity += 1
            else:
                total_severity += 0.5
        
        # Normalize to 0-1
        max_severity = len(mistakes) * 3
        accuracy = max(0.0, 1.0 - (total_severity / max_severity))
        
        return accuracy
    
    def _estimate_text_complexity(self, text: str) -> float:
        """
        Estimate text complexity (0.0 = simple, 1.0 = complex).
        
        Factors:
        - Word length
        - Sentence length
        - Vocabulary complexity
        - Grammar structures
        """
        if not text:
            return 0.5
        
        words = text.split()
        if not words:
            return 0.5
        
        # Factor 1: Average word length
        avg_word_length = sum(len(w) for w in words) / len(words)
        word_complexity = min(1.0, (avg_word_length - 4) / 8)  # Normalize: 4 chars = 0, 12+ = 1
        
        # Factor 2: Sentence length
        sentences = text.split('.')
        avg_sentence_length = sum(len(s.split()) for s in sentences) / max(len(sentences), 1)
        sentence_complexity = min(1.0, (avg_sentence_length - 5) / 15)  # Normalize: 5 words = 0, 20+ = 1
        
        # Factor 3: Complex grammar indicators (case endings, compound words)
        complex_indicators = len(re.findall(r'\w+(ssa|ssä|lla|llä|sta|stä|an|än|seen)', text, re.IGNORECASE))
        grammar_complexity = min(1.0, complex_indicators / max(len(words), 1) * 10)
        
        # Weighted combination
        complexity = (word_complexity * 0.3 + sentence_complexity * 0.4 + grammar_complexity * 0.3)
        return max(0.0, min(1.0, complexity))
    
    def _build_advanced_prompt(
        self,
        level: str,
        correction_mode: str,
        path: str,
        profession: str | None,
        context_summary: str,
        grammar_info: Dict,
        support_level: int,
        is_struggling: bool,
        error_patterns: Dict,
        conversation_state: Dict,
        recharge_bundle: Dict | None,
        user_id: str | None,
    ) -> str:
        """Build advanced system prompt with adaptation."""
        persona = path_engine.persona_for_path(path, profession)

        # Integrate recharge content into prompt
        recharge_note = integrate_recharge_into_prompt(user_id=user_id, context=context_summary)
        vocab_list = [item.get("fi") for item in (recharge_bundle or {}).get("vocab", [])[:4] if item.get("fi")]
        next_topic = (recharge_bundle or {}).get("next_conversation_topic")
        grammar_title = (recharge_bundle or {}).get("grammar", {}).get("title")
        
        # Build recharge integration text
        recharge_integration = ""
        if vocab_list:
            recharge_integration += f"\n\nTODAY'S RECHARGE VOCABULARY: Please help the student use these words naturally: {', '.join(vocab_list)}"
        if grammar_title:
            recharge_integration += f"\nTODAY'S GRAMMAR FOCUS: {grammar_title} - Try to include this grammar rule in your first 2 responses."
        if next_topic:
            recharge_integration += f"\nCONVERSATION TOPIC: {next_topic}"
        
        # Add struggle detection
        struggle_note = ""
        if is_struggling:
            struggle_note = """
IMPORTANT: User is struggling. 
- Use simpler language
- Provide more encouragement
- Break down explanations into smaller steps
- Be extra patient and supportive
"""
        
        # Add error pattern awareness
        error_note = ""
        if error_patterns:
            top_errors = sorted(error_patterns.items(), key=lambda x: x[1], reverse=True)[:3]
            error_note = f"""
User's common errors: {', '.join([e[0] for e in top_errors])}
Focus corrections on these areas when relevant.
"""
        
        # Progressive disclosure note
        disclosure_note = ""
        if support_level > 0:
            disclosure_note = f"""
Progressive disclosure level: {support_level}
- Level 1: Hide case endings
- Level 2: Hide verbs
- Level 3: Memory mode
Adjust responses to match scaffolding needs.
"""
        
        # Conversation state
        turn_count = conversation_state.get("turn_count", 0)
        state_note = ""
        if turn_count > 5:
            state_note = "User has been practicing. Vary topics and maintain engagement."

        # Build recharge integration text for system prompt
        recharge_integration = ""
        if vocab_list:
            recharge_integration += f"\n\nTODAY'S RECHARGE VOCABULARY: Please help the student use these words naturally: {', '.join(vocab_list)}"
        if grammar_title:
            recharge_integration += f"\nTODAY'S GRAMMAR FOCUS: {grammar_title} - Try to include this grammar rule in your first 2 responses."
        if next_topic:
            recharge_integration += f"\nCONVERSATION TOPIC: {next_topic}"

        confidence_note = ""
        if correction_mode == "confidence":
            confidence_note = (
                "Confidence Mode: do not interrupt with corrections. Let the user speak. "
                "Offer a single-line summary of fixes only after your reply."
            )

        prompt = f"""
You are SuomiTutor, an advanced AI Finnish teacher.
Persona: {persona}
User level: {level}
Correction mode: {correction_mode}
Learning path: {path}
Profession: {profession or 'n/a'}
Conversation turn: {turn_count}
{struggle_note}
{error_note}
{disclosure_note}
{state_note}
{recharge_note}
{recharge_integration}
{confidence_note}

Context: {context_summary}
Grammar notes: {grammar_info.get('analysis_summary', 'No major issues')}

Teaching approach:
1. Respond naturally in Finnish first (1-3 sentences)
2. Provide corrections AFTER the main response
3. Give brief, level-appropriate explanations
4. End with an engaging question or prompt
5. Adapt complexity based on user's performance

If user is struggling:
- Simplify vocabulary
- Use shorter sentences
- Provide more examples
- Give extra encouragement

Always maintain a supportive, encouraging tone.
"""
        return prompt.strip()
    
    async def _call_openai_advanced(
        self,
        system_prompt: str,
        user_text: str,
        recent_messages: List[Dict],
    ) -> str:
        """Call OpenAI with conversation history."""
        messages = [
            {"role": "system", "content": system_prompt},
        ]
        
        # Add recent conversation history (last 5 exchanges)
        for msg in recent_messages[-10:]:  # Last 10 messages (5 exchanges)
            role = msg.get("role", "user")
            content = msg.get("content", "")
            if role in ("user", "assistant") and content:
                messages.append({"role": role, "content": content})
        
        # Add current user message
        messages.append({"role": "user", "content": user_text})
        
        headers = {"Authorization": f"Bearer {settings.openai_api_key}"}
        payload = {
            "model": "gpt-4o-mini",  # Updated model name
            "messages": messages,
            "temperature": 0.7,
        }
        
        async with httpx.AsyncClient(timeout=30) as client:
            resp = await client.post(OPENAI_URL, json=payload, headers=headers)
            resp.raise_for_status()
            data = resp.json()
        
        return data["choices"][0]["message"]["content"].strip()
    
    def _update_conversation_state(
        self,
        user_id: str | None,
        user_text: str,
        reply: str,
        grammar_info: Dict,
        accuracy: float,
        is_struggling: bool,
    ) -> None:
        """Update conversation state."""
        if not user_id:
            return
        
        state = self._get_conversation_state(user_id)
        state["turn_count"] = state.get("turn_count", 0) + 1
        
        # Update performance history
        if "recent_performance" not in state:
            state["recent_performance"] = []
        
        state["recent_performance"].append({
            "error_count": len(grammar_info.get("mistakes", [])),
            "accuracy": accuracy,
            "timestamp": "now",  # Would use actual timestamp
        })
        
        # Keep only last 10 performance records
        state["recent_performance"] = state["recent_performance"][-10:]
        
        # Update struggle count
        if is_struggling:
            state["struggle_count"] = state.get("struggle_count", 0) + 1
        else:
            state["struggle_count"] = 0  # Reset if not struggling
    
    def _generate_follow_ups(
        self,
        grammar_info: Dict,
        is_struggling: bool,
        path: str,
    ) -> List[str]:
        """Generate follow-up practice suggestions."""
        suggestions = []
        
        mistakes = grammar_info.get("mistakes", [])
        
        if is_struggling:
            suggestions.append("Harjoittele yksinkertaisempia lauseita.")
            suggestions.append("Keskitty yhden asian kerrallaan.")
        else:
            if mistakes:
                top_error = mistakes[0].get("type", "")
                if top_error == "case":
                    suggestions.append("Harjoittele sijamuotoja seuraavassa harjoituksessa.")
                elif top_error == "verb":
                    suggestions.append("Harjoittele verbien taivutusmuotoja.")
        
        if path == "workplace":
            suggestions.append("Kokeile työpaikkaroolileikkiä harjoitellaksesi ammatillista suomea.")
        elif path == "yki":
            suggestions.append("Harjoittele YKI-tehtäviä valmistautuaksesi kokeeseen.")
        
        return suggestions


# Global instance
_conversation_engine_v4 = ConversationEngineV4()


async def run_conversation_v4(
    user_text: str,
    user_id: str | None,
    level: str = "A1",
    correction_mode: str = "medium",
    path: str = "general",
    profession: str | None = None,
    enable_progressive_disclosure: bool = True,
) -> Dict:
    """Run conversation using Conversation Engine v4."""
    return await _conversation_engine_v4.handle_conversation(
        user_text=user_text,
        user_id=user_id,
        level=level,
        correction_mode=correction_mode,
        path=path,
        profession=profession,
        enable_progressive_disclosure=enable_progressive_disclosure,
    )
