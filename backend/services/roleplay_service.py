from __future__ import annotations

from typing import Any

from ..roleplay.runtime import (
    create_roleplay_session as create_roleplay_session_logic,
    get_roleplay_review as get_roleplay_review_logic,
    get_roleplay_session as get_roleplay_session_logic,
    get_roleplay_transcript as get_roleplay_transcript_logic,
    submit_roleplay_turn as submit_roleplay_turn_logic,
)


def create_roleplay_session(*, user_id: str, scenario_id: str, level: str, display_preferences: dict[str, Any] | None) -> dict[str, Any]:
    return create_roleplay_session_logic(user_id=user_id, scenario_id=scenario_id, level=level, display_preferences=display_preferences)


def submit_roleplay_turn(*, user_id: str, session_id: str, user_message: str) -> dict[str, Any]:
    return submit_roleplay_turn_logic(user_id=user_id, session_id=session_id, user_message=user_message)


def get_roleplay_session(*, user_id: str, session_id: str) -> dict[str, Any]:
    return get_roleplay_session_logic(user_id=user_id, session_id=session_id)


def get_roleplay_transcript(*, user_id: str, session_id: str) -> dict[str, Any]:
    return get_roleplay_transcript_logic(user_id=user_id, session_id=session_id)


def get_roleplay_review(*, user_id: str, session_id: str) -> dict[str, Any]:
    return get_roleplay_review_logic(user_id=user_id, session_id=session_id)
