"""Daily Recharge Engine – selects short daily vocab + grammar bundle."""

from __future__ import annotations

from typing import Dict, List
from datetime import datetime
import random

from app.services import memory_service, vocab_engine, path_engine
from app.services.personalization_service import generate_learning_plan


class DailyRechargeEngine:
    """
    Generates a compact "recharge" pack for the day.

    The pack mixes:
    - 2–5 vocabulary items pulled from recent mistakes, level lists, and profession lists
    - one micro grammar bite with examples
    - a mini challenge to nudge output
    - lightweight image prompts (text only; callers can send to an image API)
    - a suggested topic for the next conversation turn
    """

    def __init__(self):
        self._fallback_topics = [
            "Your morning routine",
            "What you cooked yesterday",
            "A short work update",
            "Weekend plans",
            "Describe your room",
        ]

    async def generate_today_recharge(self, user_id: str | None) -> Dict:
        """Return today's vocab, grammar bite, mini challenge, and conversation preview."""
        # Get learning snapshot from personalization service
        # This will use database if available, fallback to in-memory if not
        try:
            learning_plan = await generate_learning_plan(user_id or "anonymous")
        except Exception:
            # Fallback if personalization service unavailable
            learning_plan = {
                "grammar_focus": [],
                "vocabulary_focus": [],
                "profession": None,
            }

        # Collect inputs from memory and plan.
        recent_messages = await memory_service.get_recent_messages(user_id, limit=12)
        recent_user_texts = [m.get("content", "") for m in recent_messages if m.get("role") == "user"]
        latest_text = recent_user_texts[-1] if recent_user_texts else ""

        # Pick vocab sources.
        vocab_items = self._select_vocab_items(
            errors=learning_plan.get("grammar_focus", []),
            missing_core=learning_plan.get("vocabulary_focus", []),
            profession=learning_plan.get("profession"),
            user_id=user_id,
        )

        grammar_bite = await self._build_grammar_bite(user_id, learning_plan)
        mini_challenge = self._build_mini_challenge(vocab_items)
        images = self._build_image_prompts(vocab_items)
        next_topic = self._pick_next_topic(latest_text)

        return {
            "generated_at": datetime.utcnow().isoformat(),
            "vocab": vocab_items,
            "images": images,
            "grammar": grammar_bite,
            "mini_challenge": mini_challenge,
            "next_conversation_topic": next_topic,
        }

    def integrate_with_conversation(self, user_id: str | None, context: str | None = None) -> str:
        """Inject recharge targets into the next conversation's system prompt."""
        note = (
            "Start by helping the student use today's recharge vocabulary and highlight "
            "the grammar bite in your first two replies. "
            "Gently weave the mini challenge into the dialogue if possible."
        )
        if context:
            return f"{note} Context: {context}"
        return note

    def _select_vocab_items(
        self,
        errors: List[str] | None,
        missing_core: List[str] | None,
        profession: str | None,
    ) -> List[Dict]:
        """Pick a small, diverse vocab set (2–5 items)."""
        selected: List[Dict] = []

        # 1) One item from recent grammar focus if present.
        if errors:
            word = str(errors[0])
            selected.append({"fi": word, "en": "(review)"})

        # 2) One from missing core vocabulary.
        if missing_core:
            word = missing_core[0]
            selected.append({"fi": word, "en": "core word"})

        # 3) One from profession list if provided.
        if profession:
            profession_vocab = vocab_engine.get_vocab_units("workplace", profession, limit=5)
            if profession_vocab:
                selected.append(random.choice(profession_vocab))

        # 4) Fill the rest from general list.
        general_vocab = vocab_engine.get_vocab_units("general", limit=8)
        for item in general_vocab:
            if len(selected) >= 5:
                break
            if item not in selected:
                selected.append(item)

        # Ensure at least two items.
        return selected[: max(2, min(5, len(selected)))]

    async def _build_grammar_bite(self, user_id: str | None, learning_plan: Dict) -> Dict:
        """Return a single micro grammar reminder with examples, based on user errors if available."""
        # Try to get most common error from learning plan
        top_errors = learning_plan.get("grammar_focus", [])
        
        # Error-based grammar selection
        if top_errors and len(top_errors) > 0:
            error = str(top_errors[0]).lower()
            
            # Map common errors to grammar bites
            if "ssa" in error or "ssä" in error or "inessive" in error:
                return {
                    "title": "Inessive case (-ssa/-ssä)",
                    "meaning": "means 'in something'",
                    "examples": [
                        "Olen koulussa. (I am at school)",
                        "Auto on parkkihallissa. (The car is in the parking garage)",
                    ],
                }
            elif "partitive" in error or "-a" in error or "-ä" in error:
                return {
                    "title": "Partitive case (-a/-ä)",
                    "meaning": "Use for partial amounts or ongoing actions",
                    "examples": [
                        "Juon kahvia. (I drink coffee)",
                        "Ostan omenoita. (I buy apples)",
                    ],
                }
            elif "verb" in error or "conjugation" in error:
                return {
                    "title": "Verb conjugation",
                    "meaning": "First person: -n, second: -t, third: -V",
                    "examples": [
                        "Minä menen. (I go)",
                        "Sinä menet. (You go)",
                        "Hän menee. (He/She goes)",
                    ],
                }
        
        # Fallback: rotate through common grammar points
        grammar_bites = [
            {
                "title": "Inessive case (-ssa/-ssä)",
                "meaning": "means 'in something'",
                "examples": [
                    "Olen koulussa. (I am at school)",
                    "Auto on parkkihallissa. (The car is in the parking garage)",
                ],
            },
            {
                "title": "Partitive case (-a/-ä)",
                "meaning": "Use for partial amounts or ongoing actions",
                "examples": [
                    "Juon kahvia. (I drink coffee)",
                    "Ostan omenoita. (I buy apples)",
                ],
            },
            {
                "title": "Verb conjugation",
                "meaning": "First person: -n, second: -t, third: -V",
                "examples": [
                    "Minä menen. (I go)",
                    "Sinä menet. (You go)",
                    "Hän menee. (He/She goes)",
                ],
            },
            {
                "title": "Word order: V2 rule",
                "meaning": "The verb is usually in the second position",
                "examples": [
                    "Minä menen kouluun. (I go to school)",
                    "Huomenna menen kouluun. (Tomorrow I go to school)",
                ],
            },
        ]
        
        # Select based on day of week for variety
        day_index = datetime.now().weekday()
        return grammar_bites[day_index % len(grammar_bites)]

    def _build_mini_challenge(self, vocab_items: List[Dict]) -> Dict:
        """
        Create a tiny practice nudge using today's vocab.
        
        Types:
        - fill_blank: Fill in the blank with word from bank
        - match: Match word to image (future)
        """
        words = [item.get("fi") for item in vocab_items[:3] if item.get("fi")]
        
        if not words:
            words = ["omena", "koulu", "kahvi"]  # Fallback
        
        # Create fill-in-the-blank challenge
        sentences = [
            "Minä juon ___. (I drink ___)",
            "___ on pöydällä. (___ is on the table)",
            "Hän menee ___. (He/She goes to ___)",
        ]
        
        # Pick a sentence and set correct answer
        import random
        sentence_template = random.choice(sentences)
        correct_word = words[0] if words else "omena"
        
        return {
            "type": "fill_blank",
            "prompt": "Choose the correct word to complete the sentence.",
            "sentence": sentence_template.replace("___", "_____"),
            "word_bank": words,
            "answer": correct_word,
        }

    def _build_image_prompts(self, vocab_items: List[Dict]) -> List[Dict]:
        """
        Generate image prompts for vocabulary items.
        
        Creates detailed, realistic prompts suitable for image generation APIs.
        Format optimized for DALL-E, Stable Diffusion, or similar services.
        
        Enhanced to generate more context-aware prompts based on word type.
        """
        prompts = []
        for item in vocab_items:
            word = item.get("fi", "")
            translation = item.get("en", "")
            if not word:
                continue
            
            # Enhanced prompt generation based on word characteristics
            word_lower = word.lower()
            translation_lower = translation.lower() if translation else ""
            
            # Detect word type and generate appropriate prompt
            if any(indicator in translation_lower for indicator in ["object", "thing", "item", "noun", "food", "drink"]):
                # Objects, food, drinks - show the item clearly
                if "omena" in word_lower or "apple" in translation_lower:
                    prompt = "realistic simple red apple on white background, clean minimalist style, educational illustration"
                elif "kahvi" in word_lower or "coffee" in translation_lower:
                    prompt = "realistic simple cup of coffee on white background, clean minimalist style, educational illustration"
                elif "koulu" in word_lower or "school" in translation_lower:
                    prompt = "realistic simple school building on white background, clean minimalist style, educational illustration"
                else:
                    prompt = f"realistic simple {word} on white background, clean minimalist style, educational illustration"
            elif any(indicator in translation_lower for indicator in ["verb", "action", "do", "go", "come", "eat", "drink"]):
                # Verbs - show the action
                if "juoda" in word_lower or "drink" in translation_lower:
                    prompt = "simple illustration showing person drinking from cup, clean style, white background"
                elif "mennä" in word_lower or "go" in translation_lower:
                    prompt = "simple illustration showing person walking, clean style, white background"
                else:
                    prompt = f"simple illustration showing action of {word}, clean style, white background"
            else:
                # Default: realistic simple representation
                prompt = f"realistic simple illustration of '{word}' concept, clean minimalist style, white background, educational"
            
            prompts.append({
                "word": word,
                "translation": translation,
                "prompt": prompt,
                "style": "minimalist",
                "background": "white",
            })
        return prompts

    def _pick_next_topic(self, latest_text: str) -> str:
        """Suggest a follow-up topic, loosely based on the last user message."""
        if latest_text:
            return f"Continue talking about: {latest_text[:80]}"
        return random.choice(self._fallback_topics)


_daily_recharge_engine = DailyRechargeEngine()


async def generate_today_recharge(user_id: str | None) -> Dict:
    """Module-level helper for convenience."""
    return await _daily_recharge_engine.generate_today_recharge(user_id)


def integrate_recharge_into_prompt(user_id: str | None, context: str | None = None) -> str:
    """Return note that injects recharge targets into conversation prompts."""
    return _daily_recharge_engine.integrate_with_conversation(user_id, context)

