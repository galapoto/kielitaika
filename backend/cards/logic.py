from __future__ import annotations

import hashlib
import random
from typing import Any

from ..core.errors import AppError
from ..core.state_store import STORE
from ..core.utils import iso_now, new_id
from .material_bank import load_authority_cards


CARD_CONTENT_TYPES = ("vocabulary_card", "sentence_card", "grammar_card")
LEVEL_EXPANSION = {
    "A1_A2": ("A1_A2", "B1_B2"),
    "B1_B2": ("B1_B2", "A1_A2", "C1_C2"),
    "C1_C2": ("C1_C2", "B1_B2"),
}
LEVEL_ALIAS = {
    "A1": "A1_A2",
    "A2": "A1_A2",
    "A1_A2": "A1_A2",
    "A2_B1": "B1_B2",
    "B1": "B1_B2",
    "B2": "B1_B2",
    "B1_B2": "B1_B2",
    "C1": "C1_C2",
    "C2": "C1_C2",
    "C1_C2": "C1_C2",
}


def _normalized_level(level: str | None) -> str:
    return LEVEL_ALIAS.get(str(level or "").strip().upper(), "A1_A2")


def _filtered_cards(*, domain: str, content_type: str | None, profession: str | None) -> list[dict[str, Any]]:
    cards = load_authority_cards()
    if not cards:
        raise AppError(503, "CARDS_AUTHORITY_MISSING", "Normalized card authority bank is unavailable.", True, {"classification": "retryable"})

    requested_type = str(content_type or "").strip() or None
    requested_profession = str(profession or "").strip().lower() or None
    selected = []
    for card in cards:
        if requested_type and card["content_type"] != requested_type:
            continue
        if domain == "general":
            if card["path"] != "general":
                continue
        else:
            if card["path"] != "professional":
                continue
            if requested_profession and requested_profession != "none" and card["profession"] != requested_profession:
                continue
        selected.append(card)
    return selected


def _history_records(user_id: str) -> list[dict[str, Any]]:
    with STORE.locked(("user_content_history", user_id)):
        payload = STORE.get_ref("user_content_history", user_id)
        if isinstance(payload, list):
            return payload
        payload = []
        STORE.set("user_content_history", user_id, payload)
        return payload


def _served_history_index(user_id: str) -> tuple[set[str], dict[str, str]]:
    history = _history_records(user_id)
    seen_ids: set[str] = set()
    last_seen: dict[str, str] = {}
    for item in history:
        if not isinstance(item, dict):
            continue
        content_id = str(item.get("content_id") or "").strip()
        timestamp = str(item.get("timestamp") or "").strip()
        if not content_id:
            continue
        seen_ids.add(content_id)
        if timestamp:
            last_seen[content_id] = timestamp
    return seen_ids, last_seen


def _selection_seed(*, user_id: str, domain: str, content_type: str | None, profession: str | None, level_band: str, history_size: int) -> int:
    digest = hashlib.sha256(
        "|".join(
            [
                user_id,
                domain,
                content_type or "*",
                profession or "*",
                level_band,
                str(history_size),
                iso_now(),
            ]
        ).encode("utf-8")
    ).hexdigest()
    return int(digest[:16], 16)


def _rank_cards(
    cards: list[dict[str, Any]],
    *,
    user_id: str,
    domain: str,
    content_type: str | None,
    profession: str | None,
    level_band: str,
) -> list[dict[str, Any]]:
    seen_ids, last_seen = _served_history_index(user_id)
    prioritized: list[dict[str, Any]] = []
    for allowed_band in LEVEL_EXPANSION[level_band]:
        band_cards = [card for card in cards if card["level_band"] == allowed_band]
        unseen = [card for card in band_cards if card["id"] not in seen_ids]
        if unseen:
            rng = random.Random(
                _selection_seed(
                    user_id=user_id,
                    domain=domain,
                    content_type=content_type,
                    profession=profession,
                    level_band=allowed_band,
                    history_size=len(seen_ids),
                )
            )
            rng.shuffle(unseen)
            prioritized.extend(unseen)

    if prioritized:
        return prioritized

    recycled = list(cards)
    if not recycled:
        return recycled
    rng = random.Random(
        _selection_seed(
            user_id=user_id,
            domain=domain,
            content_type=content_type,
            profession=profession,
            level_band=level_band,
            history_size=len(seen_ids) + 1,
        )
    )
    recycled.sort(key=lambda card: (last_seen.get(card["id"], ""), card["level_band"], card["id"]))
    rng.shuffle(recycled)
    return recycled


def _record_served_cards(*, user_id: str, cards: list[dict[str, Any]]) -> None:
    if not cards:
        return
    now = iso_now()
    history = _history_records(user_id)
    for card in cards:
        history.append(
            {
                "user_id": user_id,
                "content_id": card["id"],
                "content_type": card["content_type"],
                "timestamp": now,
            }
        )


def _materialized_card(card: dict[str, Any], *, order_index: int, adaptive: bool) -> dict[str, Any]:
    materialized = {
        key: value
        for key, value in card.items()
        if key != "_signature"
    }
    materialized["state"] = "new"
    materialized["seen_count"] = 0
    materialized["correct_rate"] = 0.0
    materialized["order_index"] = order_index
    materialized["_adaptive"] = adaptive
    return materialized


def _cards_for_filters(
    *,
    user_id: str,
    domain: str,
    content_type: str | None,
    profession: str | None,
    level: str | None,
    adaptive: bool = False,
    limit: int = 10,
) -> list[dict[str, Any]]:
    if domain not in {"general", "professional"}:
        raise AppError(400, "VALIDATION_ERROR", "Cards domain must be general or professional.", False, {"classification": "non_retryable"})
    if content_type and content_type not in CARD_CONTENT_TYPES:
        raise AppError(400, "VALIDATION_ERROR", "Unsupported card content type.", False, {"classification": "non_retryable"})

    authority_cards = _filtered_cards(domain=domain, content_type=content_type, profession=profession)
    if not authority_cards:
        raise AppError(404, "CARDS_NO_AUTHORITY_MATCH", "No authoritative cards matched the requested filters.", False, {"classification": "terminal"})

    level_band = _normalized_level(level)
    ranked = _rank_cards(
        authority_cards,
        user_id=user_id,
        domain=domain,
        content_type=content_type,
        profession=profession,
        level_band=level_band,
    )
    selected = [_materialized_card(card, order_index=index, adaptive=adaptive) for index, card in enumerate(ranked[: max(1, limit)])]
    if not selected:
        raise AppError(404, "CARDS_NO_AUTHORITY_MATCH", "No authoritative cards are available for this user right now.", False, {"classification": "terminal"})
    _record_served_cards(user_id=user_id, cards=selected)
    return selected


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
    cards = _cards_for_filters(
        user_id=user_id,
        domain=domain,
        content_type=content_type,
        profession=profession,
        level=level,
        adaptive=adaptive,
        limit=limit,
    )
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
                "reason_code": "authority_unseen_card",
                "reason_message": "Authoritative card selected from the unseen pool.",
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
        card["seen_count"] += 1
        card["correct_rate"] = 1.0 if correct else 0.0
        card["state"] = "correct" if correct else "incorrect"
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
                "option_id": next((option["option_id"] for option in card["served_follow_up"]["options"] if option["text"] == card["_answer_value"]), None)
                if card["served_follow_up"]["variant_type"] == "recognition_mcq"
                else None,
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
