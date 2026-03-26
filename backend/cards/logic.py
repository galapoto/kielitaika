from __future__ import annotations

from typing import Any

from ..core.errors import AppError
from ..core.state_store import STORE
from ..core.utils import iso_now, new_id


CARD_CONTENT_TYPES = ("vocabulary_card", "sentence_card", "grammar_card")


def _seed_card(index: int, *, domain: str, content_type: str, profession: str, level: str, adaptive: bool = False) -> dict[str, Any]:
    base_word = {
        "vocabulary_card": "potilas",
        "sentence_card": "Potilas odottaa vastaanotolla.",
        "grammar_card": "vastaanotolla",
    }[content_type]
    variant_type = {
        "vocabulary_card": "recognition_mcq",
        "sentence_card": "typed_recall",
        "grammar_card": "fill_in",
    }[content_type]
    options = [
        {"option_id": "o1", "text": "potilas"},
        {"option_id": "o2", "text": "laakari"},
        {"option_id": "o3", "text": "hoitaja"},
    ] if variant_type == "recognition_mcq" else []
    return {
        "id": new_id("card"),
        "content_type": content_type,
        "path": domain,
        "domain": domain,
        "profession": profession,
        "level_band": level,
        "difficulty": "core",
        "tags": [domain, content_type],
        "prompt_family": "core",
        "word": base_word,
        "state": "new",
        "seen_count": 0,
        "correct_rate": 0.0,
        "front_text": base_word,
        "back_prompt": "Answer the prompt.",
        "audio": None,
        "served_follow_up": {
            "variant_type": variant_type,
            "prompt": "Choose, recall, or complete the answer.",
            "options": options,
            "blank_template": "Potilas odottaa ____." if variant_type == "fill_in" else None,
            "context_text": None,
            "stimulus_text": None,
        },
        "order_index": index,
        "_answer_value": "potilas" if content_type != "grammar_card" else "vastaanotolla",
        "_accepted_variants": ["potilas", "o1"] if variant_type == "recognition_mcq" else (["potilas"] if content_type == "vocabulary_card" else [base_word.lower()]),
        "_adaptive": adaptive,
    }


def _cards_for_filters(*, domain: str, content_type: str | None, profession: str | None, level: str | None, adaptive: bool = False) -> list[dict[str, Any]]:
    effective_types = [content_type] if content_type else list(CARD_CONTENT_TYPES)
    resolved_profession = profession or ("general_workplace" if domain == "professional" else "none")
    resolved_level = level or "A1_A2"
    return [
        _seed_card(i, domain=domain, content_type=card_type, profession=resolved_profession, level=resolved_level, adaptive=adaptive)
        for i, card_type in enumerate(effective_types)
    ]


def _session_state(session: dict[str, Any]) -> dict[str, Any]:
    return {
        "session_id": session["session_id"],
        "status": session["status"],
        "current_card_index": session["current_card_index"],
        "total_cards": len(session["cards"]),
        "answered_count": session["answered_count"],
        "created_at": session["created_at"],
        "updated_at": session["updated_at"],
    }


def _public_card(card: dict[str, Any]) -> dict[str, Any]:
    return {key: value for key, value in card.items() if not key.startswith("_")}


def start_cards_session(*, user_id: str, domain: str, content_type: str | None, profession: str | None, level: str | None, adaptive: bool = False, limit: int = 10) -> dict[str, Any]:
    cards = _cards_for_filters(domain=domain, content_type=content_type, profession=profession, level=level, adaptive=adaptive)[:max(1, limit)]
    session_id = new_id("cards")
    now = iso_now()
    session = {
        "session_id": session_id,
        "user_id": user_id,
        "status": "ACTIVE",
        "current_card_index": 0,
        "answered_count": 0,
        "created_at": now,
        "updated_at": now,
        "cards": cards,
        "adaptive": adaptive,
    }
    with STORE.locked(("cards_sessions", session_id)):
        STORE.set("cards_sessions", session_id, session)
    data: dict[str, Any] = {
        "session": _session_state(session),
        "first_card": _public_card(cards[0]),
    }
    if adaptive:
        data["review_queue_id"] = new_id("queue")
        data["selection_reasons"] = [
            {
                "card_id": card["id"],
                "reason_code": "new_card",
                "reason_message": "New card selected for learning.",
                "due_at": None,
                "difficulty_score": 0.5,
                "success_rate": 0.0,
                "total_attempts": 0,
                "streak": 0,
                "variant_index": 0,
                "variant_type": card["served_follow_up"]["variant_type"],
            }
            for card in cards
        ]
    return data


def next_card(*, user_id: str, session_id: str) -> dict[str, Any]:
    with STORE.locked(("cards_sessions", session_id)):
        session = STORE.get_ref("cards_sessions", session_id)
        if not session:
            raise AppError(404, "CARDS_INVALID_SESSION", "Card session was not found.", False, {"classification": "terminal"})
        if session.get("user_id") != user_id:
            raise AppError(403, "CARDS_SESSION_FORBIDDEN", "Card session is not available for this user.", False, {"classification": "non_retryable"})
        if session["status"] != "ACTIVE":
            return {
                "session": _session_state(session),
                "card": None,
                "completed": True,
            }
        current_index = session["current_card_index"]
        if current_index >= len(session["cards"]):
            session["status"] = "COMPLETED"
            session["updated_at"] = iso_now()
            return {
                "session": _session_state(session),
                "card": None,
                "completed": True,
            }
        return {
            "session": _session_state(session),
            "card": _public_card(session["cards"][current_index]),
            "completed": False,
        }


def answer_card(*, user_id: str, session_id: str, user_answer: str) -> dict[str, Any]:
    normalized_answer = str(user_answer or "").strip().lower()
    if not normalized_answer:
        raise AppError(400, "VALIDATION_ERROR", "Answer is required.", False, {"classification": "non_retryable"})

    with STORE.locked(("cards_sessions", session_id)):
        session = STORE.get_ref("cards_sessions", session_id)
        if not session:
            raise AppError(404, "CARDS_INVALID_SESSION", "Card session was not found.", False, {"classification": "terminal"})
        if session.get("user_id") != user_id:
            raise AppError(403, "CARDS_SESSION_FORBIDDEN", "Card session is not available for this user.", False, {"classification": "non_retryable"})
        if session["status"] != "ACTIVE":
            raise AppError(409, "CARDS_SESSION_INACTIVE", "Card session is no longer active.", False, {"classification": "terminal"})
        card = session["cards"][session["current_card_index"]]
        accepted = [variant.lower() for variant in card["_accepted_variants"]]
        correct = normalized_answer in accepted
        session["answered_count"] += 1
        session["current_card_index"] += 1
        session["updated_at"] = iso_now()
        session_completed = session["current_card_index"] >= len(session["cards"])
        if session_completed:
            session["status"] = "COMPLETED"
        next_preview = None if session_completed else _public_card(session["cards"][session["current_card_index"]])
        payload: dict[str, Any] = {
            "correct": correct,
            "is_correct": correct,
            "expected_variant_type": card["served_follow_up"]["variant_type"],
            "evaluation_mode": "option_id" if card["served_follow_up"]["variant_type"] == "recognition_mcq" else "normalized_text",
            "submitted_answer_normalized": normalized_answer,
            "correct_answer": {
                "value": card["_answer_value"],
                "option_id": "o1" if card["served_follow_up"]["variant_type"] == "recognition_mcq" else None,
                "display_text": card["_answer_value"],
            },
            "accepted_variants": card["_accepted_variants"],
            "explanation": "Correct." if correct else "Try the expected answer next time.",
            "next_recommended_action": "continue" if not session_completed else "complete",
            "session_completed": session_completed,
            "session": _session_state(session),
            "next_card": next_preview,
            "adaptive_update": None,
        }
        if session.get("adaptive"):
            payload["adaptive_update"] = {
                "card_id": card["id"],
                "total_attempts": 1,
                "correct_attempts": 1 if correct else 0,
                "incorrect_attempts": 0 if correct else 1,
                "success_rate": 1.0 if correct else 0.0,
                "streak": 1 if correct else 0,
                "difficulty_score": 0.3 if correct else 0.7,
                "next_due_at": None,
                "interval_days": 0 if not correct else 1,
                "review_status": "scheduled",
                "last_variant_type": card["served_follow_up"]["variant_type"],
                "explanation": "Adaptive state updated.",
            }
        return payload
