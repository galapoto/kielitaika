from __future__ import annotations

from typing import Any

from ..cards.logic import answer_card as answer_card_logic, next_card as next_card_logic, start_cards_session as start_cards_session_logic


def start_cards_session(*, user_id: str, domain: str, content_type: str | None, profession: str | None, level: str | None, adaptive: bool = False, limit: int = 10) -> dict[str, Any]:
    return start_cards_session_logic(
        user_id=user_id,
        domain=domain,
        content_type=content_type,
        profession=profession,
        level=level,
        adaptive=adaptive,
        limit=limit,
    )


def next_card(*, user_id: str, session_id: str) -> dict[str, Any]:
    return next_card_logic(user_id=user_id, session_id=session_id)


def answer_card(*, user_id: str, session_id: str, user_answer: str) -> dict[str, Any]:
    return answer_card_logic(user_id=user_id, session_id=session_id, user_answer=user_answer)
