import uuid
from datetime import datetime

from speaking.engine import build_prompt_catalog, evaluate_spoken_response, pre_render_prompt_audio

DEFAULT_USER_ID = "local-user"
_sessions = {}


def _build_public_audio(asset):
    return {
        "asset_id": asset["id"],
        "url": asset["url"],
        "duration_ms": asset["duration_ms"],
        "ready": True,
    }


def _build_public_prompt(prompt):
    return {
        "id": prompt["id"],
        "title": prompt["title"],
        "prompt_text": prompt["prompt_text"],
        "response_guidance": prompt["response_guidance"],
        "answer_status": prompt["status"],
        "prompt_audio": _build_public_audio(prompt["prompt_audio"]),
    }


def _build_latest_result(prompt):
    evaluation = prompt.get("evaluation")
    if not evaluation:
        return None

    return {
        "prompt_id": prompt["id"],
        "correct": evaluation["correct"],
        "submitted_transcript": evaluation["submitted_transcript"],
        "expected_response": evaluation["expected_response"],
        "difference": evaluation["difference"],
        "evaluation_mode": evaluation["evaluation_mode"],
        "recording_captured": prompt["recording_captured"],
        "capture_mode": prompt["capture_mode"],
    }


def _build_completion_state(session):
    total_count = len(session["prompts"])
    attempts = len(session["attempts"])
    correct_count = sum(1 for attempt in session["attempts"] if attempt["correct"])

    return {
        "prompts_served": min(session["current_prompt_index"] + 1, total_count) if total_count else 0,
        "attempts": attempts,
        "correct_count": correct_count,
        "total_count": total_count,
        "accuracy": (correct_count / attempts) if attempts else 0,
        "session_complete": session["status"] == "completed",
    }


def build_public_session(session):
    current_prompt = None
    if session["current_prompt_index"] < len(session["prompts"]):
        current_prompt = _build_public_prompt(session["prompts"][session["current_prompt_index"]])

    return {
        "session_id": session["session_id"],
        "user_id": session["user_id"],
        "status": session["status"],
        "current_prompt_index": session["current_prompt_index"],
        "current_prompt": current_prompt,
        "latest_result": session["latest_result"],
        "completion_state": _build_completion_state(session),
        "actions": {
            "play_prompt": current_prompt is not None,
            "submit": bool(current_prompt and current_prompt["answer_status"] == "pending"),
            "next": bool(current_prompt and current_prompt["answer_status"] == "answered"),
        },
    }


def create_session():
    session_id = str(uuid.uuid4())
    prompts = []

    for prompt in build_prompt_catalog():
        prompts.append(
            {
                **prompt,
                "prompt_audio": pre_render_prompt_audio(prompt),
                "evaluation": None,
                "transcript": None,
                "recording_captured": False,
                "capture_mode": "transcript_only",
                "status": "pending",
            }
        )

    session = {
        "session_id": session_id,
        "user_id": DEFAULT_USER_ID,
        "status": "active",
        "created_at": datetime.utcnow().isoformat(),
        "current_prompt_index": 0,
        "prompts": prompts,
        "attempts": [],
        "latest_result": None,
    }
    _sessions[session_id] = session
    return build_public_session(session)


def get_session(session_id: str):
    session = _sessions.get(session_id)
    if not session:
        return {"error": "SESSION_NOT_FOUND"}
    return session


def get_public_session(session_id: str):
    session = get_session(session_id)
    if isinstance(session, dict) and "error" in session:
        return session
    return build_public_session(session)


def submit_response(session_id: str, transcript: str, recording_captured: bool):
    session = get_session(session_id)
    if isinstance(session, dict) and "error" in session:
        return session

    if session["status"] == "completed":
        return {"error": "SESSION_READ_ONLY"}

    if session["current_prompt_index"] >= len(session["prompts"]):
        return {"error": "NO_PROMPT_AVAILABLE"}

    prompt = session["prompts"][session["current_prompt_index"]]
    if prompt["status"] == "answered":
        return {"error": "PROMPT_ALREADY_ANSWERED"}

    evaluation = evaluate_spoken_response(prompt, transcript)
    prompt["transcript"] = evaluation["submitted_transcript"]
    prompt["evaluation"] = evaluation
    prompt["recording_captured"] = bool(recording_captured)
    prompt["capture_mode"] = (
        "recording_with_transcript" if recording_captured else "transcript_only"
    )
    prompt["status"] = "answered"
    session["latest_result"] = _build_latest_result(prompt)
    session["attempts"].append(session["latest_result"])

    return build_public_session(session)


def advance_session(session_id: str):
    session = get_session(session_id)
    if isinstance(session, dict) and "error" in session:
        return session

    if session["status"] == "completed":
        return {"error": "SESSION_READ_ONLY"}

    if session["current_prompt_index"] >= len(session["prompts"]):
        return {"error": "NO_PROMPT_AVAILABLE"}

    prompt = session["prompts"][session["current_prompt_index"]]
    if prompt["status"] != "answered":
        return {"error": "PROMPT_NOT_ANSWERED"}

    session["current_prompt_index"] += 1

    if session["current_prompt_index"] >= len(session["prompts"]):
        session["status"] = "completed"

    return build_public_session(session)
