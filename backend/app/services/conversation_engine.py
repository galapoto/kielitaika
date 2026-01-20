"""Conversation engine for PUHIS."""

from __future__ import annotations

import httpx
from app.core.config import get_settings
from app.services import grammar_engine, memory_service, path_engine
from app.services.daily_recharge_engine import (
    generate_today_recharge,
    integrate_recharge_into_prompt,
)
from app.services.cefr_micro_ladder import ladder_for_level
from app.services.session_summary_engine import build_quick_summary, forecast_topic
from app.services.progressive_disclosure_engine import ProgressiveDisclosureEngine

settings = get_settings()
OPENAI_URL = "https://api.openai.com/v1/chat/completions"

# Initialize progressive disclosure engine
_progressive_disclosure = ProgressiveDisclosureEngine()


async def run_conversation(
    user_text: str,
    user_id: str | None,
    level: str = "A1",
    correction_mode: str = "medium",
    path: str = "general",
    profession: str | None = None,
    enable_progressive_disclosure: bool = True,
):
    """
    Orchestrate grammar analysis, prompt building, and model call.
    
    Args:
        user_text: User's input text
        user_id: User identifier for context
        level: CEFR level (A1, A2, B1)
        correction_mode: Correction intensity (light, medium, strict)
        path: Learning path (general, workplace, yki)
        profession: Profession for workplace path
        enable_progressive_disclosure: Whether to apply text masking
    
    Returns:
        Dictionary with reply, grammar info, progressive disclosure, and metadata
    """
    grammar_info = await grammar_engine.analyze_grammar(user_text)
    context_summary = await memory_service.compress_context(user_id)
    recharge_bundle = await generate_today_recharge(user_id)
    
    # Get recent messages for progressive disclosure calculation
    recent_messages = await memory_service.get_recent_messages(user_id, limit=10)
    
    # Calculate accuracy from grammar info
    accuracy = 1.0
    if grammar_info.get("mistakes"):
        mistake_count = len(grammar_info["mistakes"])
        # Rough accuracy estimate (fewer mistakes = higher accuracy)
        accuracy = max(0.0, 1.0 - (mistake_count * 0.1))
    
    # Compute support level for progressive disclosure
    support_level = 0
    masked_reply = None
    if enable_progressive_disclosure:
        support_level = _progressive_disclosure.compute_support_level(
            history=[{"accuracy": accuracy}],
            hesitation=0.0,  # Could be calculated from timing data
            accuracy=accuracy
        )
    
    system_prompt = build_system_prompt(
        level=level,
        correction_mode=correction_mode,
        path=path,
        profession=profession,
        context_summary=context_summary,
        grammar_info=grammar_info,
        support_level=support_level,
        recharge_bundle=recharge_bundle,
        user_id=user_id,
    )

    # If no API key configured, return deterministic stub for local dev.
    if not settings.openai_api_key:
        reply = "Hei! (stubbed response)."
    else:
        reply = await _call_openai(system_prompt, user_text)

    # Apply progressive disclosure masking to the reply
    if enable_progressive_disclosure and support_level > 0:
        masked_reply = _progressive_disclosure.mask_text(reply, support_level)
    else:
        masked_reply = reply

    await memory_service.save_message(user_id, "user", user_text)
    await memory_service.save_message(user_id, "assistant", reply)

    summary = build_quick_summary(recent_messages + [{"role": "user", "content": user_text}], reply)
    topic_forecast = forecast_topic(user_text)

    return {
        "reply": reply,  # Full reply
        "masked_reply": masked_reply,  # Reply with progressive disclosure applied
        "support_level": support_level,
        "grammar": grammar_info,
        "summary": summary,
        "meta": {
            "path": path,
            "profession": profession,
            "level": level,
            "correction_mode": correction_mode,
            "progressive_disclosure_enabled": enable_progressive_disclosure,
            "topic_forecast": topic_forecast,
            "micro_ladder": ladder_for_level(level),
        },
    }


def build_system_prompt(
    level: str,
    correction_mode: str,
    path: str,
    profession: str | None,
    context_summary: str,
    grammar_info: dict,
    support_level: int = 0,
    recharge_bundle: dict | None = None,
    user_id: str | None = None,
) -> str:
    """
    Construct the system prompt used for LLM calls.
    
    Args:
        level: CEFR level
        correction_mode: How strict corrections should be
        path: Learning path
        profession: User's profession (for workplace path)
        context_summary: Compressed conversation history
        grammar_info: Grammar analysis results
        support_level: Progressive disclosure support level (0-3)
    """
    # Get persona from path_engine
    persona = path_engine.persona_for_path(path, profession)

    # Add progressive disclosure guidance
    disclosure_note = ""
    if support_level > 0:
        disclosure_note = f"""
Note: User is at support level {support_level}. 
- Level 1: Hide case endings
- Level 2: Hide verbs  
- Level 3: Memory mode (topic hints only)
Adjust your responses to match their current scaffolding needs.
"""

    recharge_note = integrate_recharge_into_prompt(user_id=user_id, context=context_summary)
    recharge_summary = ""
    if recharge_bundle:
        vocab_list = [item.get("fi") for item in recharge_bundle.get("vocab", [])[:4] if item.get("fi")]
        grammar_bite = recharge_bundle.get("grammar", {}).get("title")
        next_topic = recharge_bundle.get("next_conversation_topic")
        recharge_summary = f"Today's recharge: vocab={vocab_list}, grammar={grammar_bite}, next topic={next_topic}."

    confidence_note = ""
    if correction_mode == "confidence":
        confidence_note = (
            "Confidence Mode: do not interrupt with corrections. Let the user speak freely. "
            "Only summarize key fixes at the end of each reply in one concise line."
        )

    prompt = f"""
You are SuomiTutor, an AI Finnish teacher.
Persona: {persona}.
User level: {level}.
Correction mode: {correction_mode}.
Learning path: {path}.
Profession: {profession or 'n/a'}.
Context: {context_summary}.
Grammar notes: {grammar_info}.
{disclosure_note}
{recharge_note}
{recharge_summary}
 {confidence_note}
Respond concisely in Finnish first, then provide corrections according to the mode.
Always end with a short question to keep the dialogue going.
"""
    return prompt.strip()


async def _call_openai(system_prompt: str, user_text: str) -> str:
    """Call OpenAI chat completion with minimal parsing and error handling."""
    headers = {"Authorization": f"Bearer {settings.openai_api_key}"}
    payload = {
        "model": "gpt-4.1-mini",
        "messages": [
            {"role": "system", "content": system_prompt},
            {"role": "user", "content": user_text},
        ],
    }
    async with httpx.AsyncClient(timeout=30) as client:
        resp = await client.post(OPENAI_URL, json=payload, headers=headers)
        resp.raise_for_status()
        data = resp.json()
    return data["choices"][0]["message"]["content"].strip()
