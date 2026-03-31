from dataclasses import asdict

from learning.progress_service import record_practice_result
from yki.session_store import DEFAULT_USER_ID
from yki_practice.generator import build_adaptive_context, build_practice_tasks
from yki_practice.session_models import PracticeSession

_practice_sessions: dict[str, PracticeSession] = {}
_session_counter = 0


def _next_session_id():
    global _session_counter
    _session_counter += 1
    return f"yki-practice-{_session_counter:04d}"


def _normalize_text(value):
    return (value or "").strip().lower()


def _build_evaluation(task: dict, answer: str):
    normalized_answer = _normalize_text(answer)
    related_learning_unit = task["relatedLearningUnitId"]
    section = task["section"]

    if section in {"reading", "listening"}:
        correct_answer = task["correctAnswer"]
        is_correct = normalized_answer == _normalize_text(correct_answer)
        score = 5 if is_correct else 2
        explanation = (
            f"Matched the expected answer '{correct_answer}'."
            if is_correct
            else f"The strongest match was '{correct_answer}'."
        )
        return {
            "score": score,
            "maxScore": 5,
            "isCorrect": is_correct,
            "explanation": explanation,
            "relatedLearningUnitId": related_learning_unit,
        }

    words = [word for word in answer.split() if word.strip()]
    keyword_hits = sum(1 for keyword in task["keywords"] if _normalize_text(keyword) in normalized_answer)
    score = min(5, max(1, len(words) // 3 + keyword_hits))
    explanation = (
        "Good coverage of the prompt and keywords."
        if score >= 4
        else "Add more detail and include the guided idea more clearly."
    )
    return {
        "score": score,
        "maxScore": 5,
        "isCorrect": score >= 3,
        "explanation": explanation,
        "relatedLearningUnitId": related_learning_unit,
    }


def _serialize_session(session: PracticeSession):
    current_task = (
        session.tasks[session.current_task_index]
        if session.current_task_index < len(session.tasks)
        else None
    )
    completed_count = sum(1 for task in session.tasks if task.get("evaluation"))
    return {
        **asdict(session),
        "currentTask": current_task,
        "completedTaskCount": completed_count,
        "isComplete": completed_count == len(session.tasks),
    }


def _get_section_indices(tasks: list[dict], section: str):
    return [index for index, task in enumerate(tasks) if task["section"] == section]


def _reset_task_state(task: dict):
    task["submittedAnswer"] = None
    task["evaluation"] = None


def start_practice_session(user_id: str = DEFAULT_USER_ID):
    context, tasks = build_practice_tasks(user_id)
    session = PracticeSession(
        session_id=_next_session_id(),
        user_id=user_id,
        level=context["practiceLevel"],
        focus_areas=context["focusAreas"],
        tasks=tasks,
        results=[],
    )
    _practice_sessions[session.session_id] = session
    return _serialize_session(session)


def get_practice_session(session_id: str):
    session = _practice_sessions.get(session_id)
    if not session:
        return None
    return _serialize_session(session)


def submit_practice_answer(session_id: str, answer: str | None, action: str = "submit_and_next"):
    session = _practice_sessions.get(session_id)
    if not session:
        return None

    if session.current_task_index >= len(session.tasks):
        return _serialize_session(session)

    current_task = session.tasks[session.current_task_index]

    if action == "advance":
        if current_task.get("evaluation"):
            session.current_task_index = min(session.current_task_index + 1, len(session.tasks))
        return _serialize_session(session)

    if action == "retry_task":
        _reset_task_state(current_task)
        return _serialize_session(session)

    if action == "retry_section":
        section_indices = _get_section_indices(session.tasks, current_task["section"])
        session.results = [
            result for result in session.results if result["section"] != current_task["section"]
        ]
        for index in section_indices:
            _reset_task_state(session.tasks[index])
        session.current_task_index = section_indices[0]
        return _serialize_session(session)

    evaluation = _build_evaluation(current_task, answer or "")
    current_task["submittedAnswer"] = answer or ""
    current_task["evaluation"] = evaluation
    learning_progress = record_practice_result(
        session.user_id,
        {
            "unit_id": current_task["relatedLearningUnitId"],
            "module_id": current_task["relatedModuleId"],
        },
        evaluation["isCorrect"],
    )
    session.results = [
        result for result in session.results if result["taskId"] != current_task["id"]
    ]
    session.results.append(
        {
            "taskId": current_task["id"],
            "section": current_task["section"],
            "score": evaluation["score"],
            "explanation": evaluation["explanation"],
            "relatedLearningUnitId": current_task["relatedLearningUnitId"],
            "learningProgress": learning_progress,
        }
    )

    if action != "submit_only":
        session.current_task_index = min(session.current_task_index + 1, len(session.tasks))

    return _serialize_session(session)


def reset_practice_sessions():
    global _session_counter
    _practice_sessions.clear()
    _session_counter = 0


def get_adaptive_focus_preview(user_id: str = DEFAULT_USER_ID):
    return build_adaptive_context(user_id)
