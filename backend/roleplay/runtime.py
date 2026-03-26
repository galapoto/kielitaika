from __future__ import annotations

from datetime import timedelta
from typing import Any

from ..core.config import SETTINGS
from ..core.errors import AppError
from ..core.state_store import STORE
from ..core.utils import iso_now, new_id, parse_iso, utc_now


ROLEPLAY_STAGE_BY_TURN = {0: "OPENING", 1: "ACTIVE_1", 2: "ACTIVE_2", 3: "ACTIVE_3", 4: "ACTIVE_4", 5: "COMPLETE"}


def _scenario_payload(scenario_id: str) -> dict[str, str]:
    family = "general_finnish"
    title = scenario_id.replace("_", " ").strip().title() or "Roleplay Scenario"
    if "terveys" in scenario_id or "ajanvaraus" in scenario_id:
        family = "professional_healthcare"
    return {"scenario_id": scenario_id, "family": family, "title": title}


def _external_status(status: str) -> str:
    mapping = {
        "ACTIVE": "active",
        "COMPLETE": "completed",
        "EXPIRED": "expired",
    }
    return mapping.get(str(status or "").upper(), "active")


def _is_expired(session: dict[str, Any]) -> bool:
    expires_at = parse_iso(session.get("expires_at"))
    return bool(expires_at and expires_at <= utc_now())


def _assert_session_access(*, session: dict[str, Any] | None, user_id: str) -> dict[str, Any]:
    if not session:
        raise AppError(404, "ROLEPLAY_NOT_FOUND", "Roleplay session was not found.", False, {"classification": "terminal"})
    if session.get("user_id") != user_id:
        raise AppError(403, "ROLEPLAY_FORBIDDEN", "Roleplay session is not available for this user.", False, {"classification": "non_retryable"})
    if _is_expired(session):
        session["status"] = "EXPIRED"
        raise AppError(410, "SESSION_EXPIRED", "Roleplay session has expired.", False, {"classification": "terminal", "session_type": "roleplay"})
    return session


def _serialize_session(session: dict[str, Any]) -> dict[str, Any]:
    return {
        "session_id": session["session_id"],
        "created_at": session["created_at"],
        "expires_at": session["expires_at"],
        "status": _external_status(session["status"]),
        "scenario": session["scenario"],
        "level": session["level"],
        "progress": session["progress"],
        "messages": session["messages"],
        "ui": session["ui"],
    }


def create_roleplay_session(*, user_id: str, scenario_id: str, level: str, display_preferences: dict[str, Any] | None) -> dict[str, Any]:
    opening = {
        "message_id": new_id("msg"),
        "speaker": "AI",
        "text": "Hei, miten voin auttaa sinua tanaan?",
        "translation": "Hi, how can I help you today?",
        "emotion": "professional",
        "timestamp": iso_now(),
    }

    session_id = new_id("rp")
    transcript_id = new_id("tr")
    review_id = new_id("rv")
    created_at = utc_now().replace(microsecond=0).isoformat()
    expires_at = (parse_iso(created_at) + timedelta(minutes=SETTINGS.roleplay_session_ttl_minutes)).replace(microsecond=0).isoformat()
    session = {
        "session_id": session_id,
        "user_id": user_id,
        "status": "ACTIVE",
        "created_at": created_at,
        "scenario": _scenario_payload(scenario_id),
        "level": level,
        "progress": {"user_turns_completed": 0, "user_turns_total": 5, "stage": "OPENING"},
        "messages": [opening],
        "turns": [
            {
                "turn_index": 0,
                "stage": "OPENING",
                "speaker": "AI",
                "text": opening["text"],
                "translation": opening["translation"],
                "emotion": opening["emotion"],
                "timestamp": opening["timestamp"],
            }
        ],
        "ui": {"show_input": True, "allow_submit": True, "allow_restart": False, "show_review": False},
        "transcript_id": transcript_id,
        "review_id": review_id,
        "display_preferences": display_preferences or {},
        "expires_at": expires_at,
    }
    with STORE.locked(("roleplay_sessions", session_id)):
        STORE.set("roleplay_sessions", session_id, session)
    return _serialize_session(session)


def _roleplay_reply(turn_number: int) -> tuple[str, str]:
    replies = {
        1: ("Selva. Minka asian vuoksi haluaisit varata ajan?", "professional"),
        2: ("Kiitos. Milloin sinulle sopisi parhaiten?", "professional"),
        3: ("Hyva. Onko sinulla muita oireita tai toiveita?", "professional"),
        4: ("Ymmarran. Vahvistan ajan viela ennen varauksen paatosta.", "professional"),
        5: ("Ole hyva. Aika on nyt varattu. Kiitos ja hyvaa paivanjatkoa.", "warm_professional"),
    }
    return replies[turn_number]


def submit_roleplay_turn(*, user_id: str, session_id: str, user_message: str) -> dict[str, Any]:
    message = str(user_message or "").strip()
    if not message:
        raise AppError(400, "VALIDATION_ERROR", "User message is required.", False, {"classification": "non_retryable"})

    with STORE.locked(("roleplay_sessions", session_id)):
        session = _assert_session_access(session=STORE.get_ref("roleplay_sessions", session_id), user_id=user_id)
        if session["status"] == "COMPLETE":
            raise AppError(409, "ROLEPLAY_COMPLETE", "Roleplay session is already complete.", False, {"classification": "terminal"})
        completed = int(session["progress"]["user_turns_completed"]) + 1
        stage = "COMPLETE" if completed >= 5 else f"ACTIVE_{completed}"
        user_entry = {
            "message_id": new_id("msg"),
            "speaker": "USER",
            "text": message,
            "timestamp": iso_now(),
        }
        ai_text, emotion = _roleplay_reply(min(completed, 5))
        ai_entry = {
            "message_id": new_id("msg"),
            "speaker": "AI",
            "text": ai_text,
            "translation": None,
            "emotion": emotion,
            "timestamp": iso_now(),
        }
        session["messages"].extend([user_entry, ai_entry])
        session["turns"].append(
            {
                "turn_index": len(session["turns"]),
                "stage": stage if completed < 5 else "FINAL_USER_TURN",
                "speaker": "USER",
                "text": message,
                "evaluation": {
                    "intent": "response",
                    "grammar_signals": [],
                    "fluency_signal": "stable",
                },
                "timestamp": user_entry["timestamp"],
            }
        )
        session["turns"].append(
            {
                "turn_index": len(session["turns"]),
                "stage": "COMPLETE" if completed >= 5 else stage,
                "speaker": "AI",
                "text": ai_text,
                "translation": None,
                "emotion": emotion,
                "timestamp": ai_entry["timestamp"],
            }
        )
        session["progress"] = {"user_turns_completed": completed, "user_turns_total": 5, "stage": "COMPLETE" if completed >= 5 else stage}
        session["status"] = "COMPLETE" if completed >= 5 else "ACTIVE"
        session["ui"] = {
            "show_input": completed < 5,
            "allow_submit": completed < 5,
            "allow_restart": completed >= 5,
            "show_review": completed >= 5,
        }
        return {
            "session_id": session["session_id"],
            "created_at": session["created_at"],
            "expires_at": session["expires_at"],
            "status": _external_status(session["status"]),
            "progress": session["progress"],
            "appended_messages": [user_entry, ai_entry],
            "ui": session["ui"],
        }


def get_roleplay_session(*, user_id: str, session_id: str) -> dict[str, Any]:
    with STORE.locked(("roleplay_sessions", session_id)):
        session = _assert_session_access(session=STORE.get_ref("roleplay_sessions", session_id), user_id=user_id)
        return _serialize_session(session)


def get_roleplay_transcript(*, user_id: str, session_id: str) -> dict[str, Any]:
    with STORE.locked(("roleplay_sessions", session_id)):
        session = _assert_session_access(session=STORE.get_ref("roleplay_sessions", session_id), user_id=user_id)
        return {
        "transcript_id": session["transcript_id"],
        "session_id": session["session_id"],
        "scenario_id": session["scenario"]["scenario_id"],
        "level": session["level"],
        "created_at": session["created_at"],
        "expires_at": session["expires_at"],
        "status": _external_status(session["status"]),
        "turns": session["turns"],
        "summary": {
            "level_estimate": session["level"],
            "task_completion": "successful" if session["status"] == "COMPLETE" else "in_progress",
            "focus_points": ["full sentence confidence", "task continuation"],
        },
    }


def get_roleplay_review(*, user_id: str, session_id: str) -> dict[str, Any]:
    with STORE.locked(("roleplay_sessions", session_id)):
        session = _assert_session_access(session=STORE.get_ref("roleplay_sessions", session_id), user_id=user_id)
        if session["status"] != "COMPLETE":
            raise AppError(409, "ROLEPLAY_REVIEW_UNAVAILABLE", "Roleplay review is available only after completion.", False, {"classification": "terminal"})
        return {
        "session_id": session["session_id"],
        "created_at": session["created_at"],
        "expires_at": session["expires_at"],
        "status": _external_status(session["status"]),
        "overall": {
            "task_completion": "successful",
            "interaction_quality": "good",
            "level_estimate": session["level"],
        },
        "scores": {
            "fluency": 74,
            "grammar": 68,
            "vocabulary": 71,
            "appropriateness": 79,
        },
        "focus_points": [
            {
                "label": "Longer complete responses",
                "description": "You often answered correctly but briefly.",
            }
        ],
        "recommended_next_actions": [
            f"Retry same scenario at {session['level']}",
            "Practice follow-up phrases",
        ],
    }
