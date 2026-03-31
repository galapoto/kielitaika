from dataclasses import asdict

from learning.progress_service import record_practice_result
from learning.repository import repository
from yki.session_store import DEFAULT_USER_ID
from yki_practice.generator import build_adaptive_context, build_practice_tasks
from yki_practice.session_models import PracticeSession

_practice_sessions: dict[str, PracticeSession] = {}
_practice_history: dict[str, list[dict]] = {}
_completed_session_ids: set[str] = set()
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
    linked_learning_unit = repository.get_unit(related_learning_unit)
    rule_applies = None
    if linked_learning_unit:
        rule_applies = (
            linked_learning_unit["details"].get("rule")
            or linked_learning_unit["summary"]
            or linked_learning_unit["example"]
        )
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
        why_wrong = (
            "The answer stayed aligned with the prompt."
            if is_correct
            else f"Your answer did not match the expected target '{correct_answer}'."
        )
        return {
            "score": score,
            "maxScore": 5,
            "isCorrect": is_correct,
            "explanation": explanation,
            "whyWrong": why_wrong,
            "ruleApplies": rule_applies,
            "relatedLearningUnitId": related_learning_unit,
            "linkedLearningUnit": linked_learning_unit,
        }

    words = [word for word in answer.split() if word.strip()]
    keyword_hits = sum(1 for keyword in task["keywords"] if _normalize_text(keyword) in normalized_answer)
    score = min(5, max(1, len(words) // 3 + keyword_hits))
    explanation = (
        "Good coverage of the prompt and keywords."
        if score >= 4
        else "Add more detail and include the guided idea more clearly."
    )
    missing_keywords = [
        keyword for keyword in task["keywords"] if _normalize_text(keyword) not in normalized_answer
    ]
    why_wrong = (
        "The response covered the guided target clearly."
        if score >= 3
        else f"Key prompt elements were missing: {', '.join(missing_keywords) or 'more supporting detail'}."
    )
    return {
        "score": score,
        "maxScore": 5,
        "isCorrect": score >= 3,
        "explanation": explanation,
        "whyWrong": why_wrong,
        "ruleApplies": rule_applies,
        "relatedLearningUnitId": related_learning_unit,
        "linkedLearningUnit": linked_learning_unit,
    }


def _build_improvement_trend(session: PracticeSession):
    if not session.results:
        return "baseline"

    current_average = sum(result["score"] for result in session.results) / len(session.results)
    previous_summaries = _practice_history.get(session.user_id, [])

    if not previous_summaries:
        return "baseline"

    previous_average = previous_summaries[-1]["averageScore"]
    if current_average > previous_average + 0.5:
        return "improving"
    if current_average < previous_average - 0.5:
        return "needs_support"
    return "stable"


def _build_session_summary(session: PracticeSession):
    if not session.results:
        return {
            "strengths": [],
            "weaknesses": [],
            "improvement_trend": "baseline",
            "recommended_focus": session.focus_areas,
            "averageScore": 0.0,
        }

    strengths = []
    weaknesses = []
    recommended_focus = []

    for result in session.results:
        if result["score"] >= 4:
            strengths.append(f"{result['section']} confidence improved.")
        if result["score"] <= 2:
            weaknesses.append(f"{result['section']} needs more support.")
            recommended_focus.append(result["relatedLearningUnitId"])

        learning_progress = result.get("learningProgress")
        if learning_progress and learning_progress["unitProgress"]["regression_detected"]:
            weaknesses.append(
                f"Regression detected in {result['relatedLearningUnitId']}."
            )
            recommended_focus.append(result["relatedLearningUnitId"])

    if not strengths:
        strengths.append("Practice data is still building.")

    if not weaknesses:
        weaknesses.append("No major weaknesses detected in this session.")

    for focus_area in session.focus_areas:
        if focus_area not in recommended_focus:
            recommended_focus.append(focus_area)

    return {
        "strengths": list(dict.fromkeys(strengths))[:3],
        "weaknesses": list(dict.fromkeys(weaknesses))[:3],
        "improvement_trend": _build_improvement_trend(session),
        "recommended_focus": recommended_focus[:4],
        "averageScore": round(sum(result["score"] for result in session.results) / len(session.results), 2),
    }


def _record_completed_session_summary(session: PracticeSession):
    if session.session_id in _completed_session_ids:
        return

    summary = _build_session_summary(session)
    _practice_history.setdefault(session.user_id, []).append(summary)
    _completed_session_ids.add(session.session_id)


def _build_session_trace(context: dict, tasks: list[dict]):
    return {
        "adaptiveContext": context,
        "tasks": [
            {
                "taskId": task["id"],
                "section": task["section"],
                "relatedLearningUnitId": task["relatedLearningUnitId"],
                "task_selection_reason": task["taskSelectionReason"],
                "difficulty_level": task["difficultyLevel"],
                "user_performance": None,
                "feedback_generated": None,
            }
            for task in tasks
        ],
    }


def _update_session_trace(session: PracticeSession, task: dict, evaluation: dict):
    if not session.session_trace:
        return

    for trace_entry in session.session_trace["tasks"]:
        if trace_entry["taskId"] != task["id"]:
            continue

        trace_entry["user_performance"] = {
            "score": evaluation["score"],
            "maxScore": evaluation["maxScore"],
            "isCorrect": evaluation["isCorrect"],
        }
        trace_entry["feedback_generated"] = {
            "explanation": evaluation["explanation"],
            "whyWrong": evaluation["whyWrong"],
            "ruleApplies": evaluation["ruleApplies"],
            "linkedLearningUnitId": evaluation["relatedLearningUnitId"],
        }
        return


def _serialize_session(session: PracticeSession):
    session_summary = _build_session_summary(session)
    session.session_summary = session_summary
    is_complete = sum(1 for task in session.tasks if task.get("evaluation")) == len(session.tasks)
    if is_complete:
        _record_completed_session_summary(session)

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
        "isComplete": is_complete,
        "sessionSummary": session_summary,
        "sessionTrace": session.session_trace,
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
        session_trace=_build_session_trace(context, tasks),
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
            "whyWrong": evaluation["whyWrong"],
            "ruleApplies": evaluation["ruleApplies"],
            "relatedLearningUnitId": current_task["relatedLearningUnitId"],
            "linkedLearningUnit": evaluation["linkedLearningUnit"],
            "learningProgress": learning_progress,
        }
    )
    _update_session_trace(session, current_task, evaluation)

    if action != "submit_only":
        session.current_task_index = min(session.current_task_index + 1, len(session.tasks))

    return _serialize_session(session)


def reset_practice_sessions():
    global _session_counter
    _practice_sessions.clear()
    _practice_history.clear()
    _completed_session_ids.clear()
    _session_counter = 0


def get_adaptive_focus_preview(user_id: str = DEFAULT_USER_ID):
    return build_adaptive_context(user_id)
