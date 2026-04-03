import uuid
from datetime import datetime

from practice.engine import build_exercise_catalog, evaluate_exercise_answer, normalize_answer

DEFAULT_USER_ID = "local-user"
_sessions = {}
_last_exercise_ids = []


def build_public_exercise(exercise):
    return {
        "id": exercise["id"],
        "type": exercise["type"],
        "title": exercise["title"],
        "prompt": exercise["prompt"],
        "options": exercise["options"],
        "input_mode": exercise["input_mode"],
        "answer_status": exercise["status"],
    }


def build_latest_result(exercise):
    evaluation = exercise.get("evaluation")
    if not evaluation:
        return None

    return {
        "exercise_id": exercise["id"],
        "type": exercise["type"],
        "correct": evaluation["correct"],
        "submitted_answer": evaluation["submitted_answer"],
        "expected_answer": evaluation["expected_answer"],
        "explanation": evaluation["explanation"],
    }


def build_completion_state(session):
    total_count = len(session["exercises"])
    completed_count = len(session["submissions"])
    correct_count = sum(1 for submission in session["submissions"] if submission["correct"])

    return {
        "completed_count": completed_count,
        "total_count": total_count,
        "accuracy": (correct_count / completed_count) if completed_count else 0,
        "session_complete": session["status"] == "completed",
    }


def build_public_session(session):
    current_exercise = None
    if session["current_exercise_index"] < len(session["exercises"]):
        current_exercise = build_public_exercise(
            session["exercises"][session["current_exercise_index"]]
        )

    return {
        "session_id": session["session_id"],
        "user_id": session["user_id"],
        "status": session["status"],
        "current_exercise_index": session["current_exercise_index"],
        "current_exercise": current_exercise,
        "latest_result": session["latest_result"],
        "completion_state": build_completion_state(session),
        "actions": {
            "submit": bool(current_exercise and current_exercise["answer_status"] == "pending"),
            "next": bool(current_exercise and current_exercise["answer_status"] == "answered"),
        },
    }


def create_session():
    session_id = str(uuid.uuid4())
    exercises = []

    for exercise in build_exercise_catalog(session_id=session_id, avoid_ids=_last_exercise_ids):
        exercises.append(
            {
                **exercise,
                "answer": None,
                "evaluation": None,
                "status": "pending",
            }
        )

    session = {
        "session_id": session_id,
        "user_id": DEFAULT_USER_ID,
        "status": "active",
        "created_at": datetime.utcnow().isoformat(),
        "current_exercise_index": 0,
        "exercises": exercises,
        "submissions": [],
        "latest_result": None,
    }
    _last_exercise_ids[:] = [exercise["id"] for exercise in exercises]
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


def submit_answer(session_id: str, answer):
    session = get_session(session_id)
    if isinstance(session, dict) and "error" in session:
        return session

    if session["status"] == "completed":
        return {"error": "SESSION_READ_ONLY"}

    if session["current_exercise_index"] >= len(session["exercises"]):
        return {"error": "NO_EXERCISE_AVAILABLE"}

    exercise = session["exercises"][session["current_exercise_index"]]

    if exercise["status"] == "answered":
        return {"error": "EXERCISE_ALREADY_ANSWERED"}

    normalized_answer = normalize_answer(answer)
    if exercise["input_mode"] == "choice" and normalized_answer not in exercise["options"]:
        return {"error": "INVALID_OPTION"}

    evaluation = evaluate_exercise_answer(exercise, normalized_answer)
    exercise["answer"] = evaluation["submitted_answer"]
    exercise["evaluation"] = evaluation
    exercise["status"] = "answered"
    session["latest_result"] = build_latest_result(exercise)
    session["submissions"].append(session["latest_result"])

    return build_public_session(session)


def advance_session(session_id: str):
    session = get_session(session_id)
    if isinstance(session, dict) and "error" in session:
        return session

    if session["status"] == "completed":
        return {"error": "SESSION_READ_ONLY"}

    if session["current_exercise_index"] >= len(session["exercises"]):
        return {"error": "NO_EXERCISE_AVAILABLE"}

    exercise = session["exercises"][session["current_exercise_index"]]
    if exercise["status"] != "answered":
        return {"error": "EXERCISE_NOT_ANSWERED"}

    session["current_exercise_index"] += 1

    if session["current_exercise_index"] >= len(session["exercises"]):
        session["status"] = "completed"

    return build_public_session(session)
