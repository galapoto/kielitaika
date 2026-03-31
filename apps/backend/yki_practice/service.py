from dataclasses import asdict
from hashlib import sha256

from audit.audit_service import get_session_events, record_event
from audit.replay_engine import replay_session, verify_replay_consistency
from audit.verification_engine import verify_certification
from learning.decision_version import get_decision_metadata
from learning.policy_engine import is_exam_mode_locked
from learning.progress_service import record_practice_result
from learning.repository import repository
from utils.hash_utils import deterministic_hash
from yki.session_store import DEFAULT_USER_ID
from yki_practice.certification_service import (
    create_certification_record,
    export_certification,
    reset_certification_store,
)
from yki_practice.generator import build_adaptive_context, build_practice_tasks
from yki_practice.session_models import PracticeSession

_practice_sessions: dict[str, PracticeSession] = {}
_practice_history: dict[str, list[dict]] = {}
_completed_session_ids: set[str] = set()
_completed_audit_session_ids: set[str] = set()
_presented_task_counts: dict[str, dict[str, int]] = {}
_session_counter = 0


def _next_session_id():
    global _session_counter
    _session_counter += 1
    return f"yki-practice-{_session_counter:04d}"


def _normalize_text(value):
    return (value or "").strip().lower()


def _checksum_text(value: str):
    return sha256((value or "").encode("utf-8")).hexdigest()[:12]


def _runtime_hash(value):
    return deterministic_hash(value)


def _runtime_metadata():
    return get_decision_metadata()


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
    metadata = _runtime_metadata()
    return {
        "decision_version": metadata["decision_version"],
        "policy_version": metadata["policy_version"],
        "decision_policy_version": metadata["decision_policy_version"],
        "governance_version": metadata["governance_version"],
        "change_reference": metadata["change_reference"],
        "exam_mode": is_exam_mode_locked(),
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
                "learning_influence": None,
            }
            for task in tasks
        ],
    }


def _task_sequence_hash(session: PracticeSession):
    return _runtime_hash(
        {
            "session_id": session.session_id,
            "task_ids": [task["id"] for task in session.tasks],
        }
    )


def _session_hash(session: PracticeSession):
    return _runtime_hash(
        {
            "current_task_index": session.current_task_index,
            "evaluated_tasks": [
                {
                    "has_evaluation": bool(task.get("evaluation")),
                    "submitted_answer": task.get("submittedAnswer"),
                    "task_id": task["id"],
                }
                for task in session.tasks
            ],
            "results": session.results,
            "session_id": session.session_id,
        }
    )


def _next_allowed_action(session: PracticeSession, current_task: dict | None):
    if current_task is None:
        return "complete"

    if current_task.get("evaluation"):
        return "advance"

    return "submit_only"


def _completion_state(session: PracticeSession, completed_count: int, current_task: dict | None):
    if current_task is None:
        status = "completed"
    elif current_task.get("evaluation"):
        status = "awaiting_advance"
    else:
        status = "active"

    return {
        "completed_task_count": completed_count,
        "status": status,
        "total_task_count": len(session.tasks),
    }


def _update_session_trace(session: PracticeSession, task: dict, evaluation: dict, learning_progress: dict | None):
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
        trace_entry["learning_influence"] = learning_progress["learningSignal"] if learning_progress else None
        return


def _serialize_session(session: PracticeSession):
    if session.precomputed_plan is None:
        session.precomputed_plan = {
            "task_ids": [task["id"] for task in session.tasks],
            "decision_version": session.decision_version,
            "policy_version": session.policy_version,
            "governance_version": session.session_trace.get("governance_version") if session.session_trace else None,
            "exam_mode": session.exam_mode,
        }
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
    next_allowed_action = _next_allowed_action(session, current_task)
    completion_state = _completion_state(session, completed_count, current_task)
    audit_timeline = get_session_events(session.session_id)
    audit_replay = replay_session(audit_timeline)
    audit_verification = verify_replay_consistency(audit_timeline)
    certification_export = export_certification(session.session_id)
    return {
        **asdict(session),
        "currentTask": current_task,
        "next_allowed_action": next_allowed_action,
        "completion_state": completion_state,
        "session_hash": _session_hash(session),
        "task_sequence_hash": _task_sequence_hash(session),
        "completedTaskCount": completed_count,
        "isComplete": is_complete,
        "sessionSummary": session_summary,
        "sessionTrace": session.session_trace,
        "examMode": session.exam_mode,
        "policyVersion": session.policy_version,
        "decisionVersion": session.decision_version,
        "governanceVersion": session.session_trace.get("governance_version") if session.session_trace else None,
        "changeReference": session.session_trace.get("change_reference") if session.session_trace else None,
        "precomputedPlan": session.precomputed_plan,
        "auditTimeline": audit_timeline,
        "auditReplay": audit_replay,
        "auditVerification": audit_verification,
        "certification": (
            {
                **certification_export,
                "verification": verify_certification(session.session_id),
            }
            if certification_export
            else None
        ),
    }


def _get_section_indices(tasks: list[dict], section: str):
    return [index for index, task in enumerate(tasks) if task["section"] == section]


def _reset_task_state(task: dict):
    task["submittedAnswer"] = None
    task["evaluation"] = None


def _record_task_presented(session: PracticeSession, trigger: str):
    if session.current_task_index >= len(session.tasks):
        return

    task = session.tasks[session.current_task_index]
    metadata = _runtime_metadata()
    task_counts = _presented_task_counts.setdefault(session.session_id, {})
    presentation_count = task_counts.get(task["id"], 0) + 1
    task_counts[task["id"]] = presentation_count
    record_event(
        {
            "user_id": session.user_id,
            "session_id": session.session_id,
            "event_type": "YKI_TASK_PRESENTED",
            "session_hash": _session_hash(session),
            "task_sequence_hash": _task_sequence_hash(session),
            "decision_version": metadata["decision_version"],
            "policy_version": metadata["policy_version"],
            "governance_version": metadata["governance_version"],
            "change_reference": metadata["change_reference"],
            "input_snapshot": {
                "task_index": session.current_task_index,
                "trigger": trigger,
                "presentation_count": presentation_count,
            },
            "output_snapshot": {
                "task_id": task["id"],
                "section": task["section"],
                "related_learning_unit_id": task["relatedLearningUnitId"],
                "difficulty_level": task.get("difficultyLevel"),
                "task_selection_reason": task["taskSelectionReason"],
                "session_hash": _session_hash(session),
                "task_sequence_hash": _task_sequence_hash(session),
            },
            "constraint_metadata": {
                "decision_policy_version": metadata["decision_policy_version"],
                "exam_mode": session.exam_mode,
            },
        }
    )


def _record_session_completed_if_needed(session: PracticeSession, trigger: str):
    if session.session_id in _completed_audit_session_ids:
        return

    is_complete = sum(1 for task in session.tasks if task.get("evaluation")) == len(session.tasks)
    if not is_complete:
        return

    summary = _build_session_summary(session)
    metadata = _runtime_metadata()
    record_event(
        {
            "user_id": session.user_id,
            "session_id": session.session_id,
            "event_type": "YKI_SESSION_COMPLETED",
            "session_hash": _session_hash(session),
            "task_sequence_hash": _task_sequence_hash(session),
            "decision_version": metadata["decision_version"],
            "policy_version": metadata["policy_version"],
            "governance_version": metadata["governance_version"],
            "change_reference": metadata["change_reference"],
            "input_snapshot": {
                "trigger": trigger,
                "result_count": len(session.results),
            },
            "output_snapshot": {
                "completed_task_ids": [task["id"] for task in session.tasks],
                "average_score": summary["averageScore"],
                "recommended_focus": summary["recommended_focus"],
                "improvement_trend": summary["improvement_trend"],
                "session_hash": _session_hash(session),
                "task_sequence_hash": _task_sequence_hash(session),
            },
            "constraint_metadata": {
                "exam_mode": session.exam_mode,
                "decision_policy_version": metadata["decision_policy_version"],
            },
        }
    )
    _completed_audit_session_ids.add(session.session_id)
    create_certification_record(
        session_id=session.session_id,
        user_id=session.user_id,
        final_score=summary["averageScore"],
        session_hash=_session_hash(session),
        task_sequence_hash=_task_sequence_hash(session),
    )


def start_practice_session(user_id: str = DEFAULT_USER_ID):
    metadata = _runtime_metadata()
    session_id = _next_session_id()
    context, tasks = build_practice_tasks(user_id, session_id)
    session = PracticeSession(
        session_id=session_id,
        user_id=user_id,
        level=context["practiceLevel"],
        focus_areas=context["focusAreas"],
        tasks=tasks,
        exam_mode=is_exam_mode_locked(),
        policy_version=metadata["policy_version"],
        decision_version=metadata["decision_version"],
        precomputed_plan={
            "task_ids": [task["id"] for task in tasks],
            "decision_version": metadata["decision_version"],
            "policy_version": metadata["policy_version"],
            "decision_policy_version": metadata["decision_policy_version"],
            "governance_version": metadata["governance_version"],
            "change_reference": metadata["change_reference"],
            "exam_mode": is_exam_mode_locked(),
            "deterministic_seed": context.get("deterministicSeed"),
        },
        results=[],
        session_trace=_build_session_trace(context, tasks),
    )
    _practice_sessions[session.session_id] = session
    record_event(
        {
            "user_id": user_id,
            "session_id": session.session_id,
            "event_type": "YKI_SESSION_STARTED",
            "session_hash": _session_hash(session),
            "task_sequence_hash": _task_sequence_hash(session),
            "decision_version": metadata["decision_version"],
            "policy_version": metadata["policy_version"],
            "governance_version": metadata["governance_version"],
            "change_reference": metadata["change_reference"],
            "input_snapshot": {
                "focus_areas": context["focusAreas"],
                "practice_level": context["practiceLevel"],
            },
            "output_snapshot": {
                "exam_mode": session.exam_mode,
                "precomputed_plan": session.precomputed_plan,
                "tasks": [
                    {
                        "task_id": task["id"],
                        "section": task["section"],
                        "related_learning_unit_id": task["relatedLearningUnitId"],
                        "difficulty_level": task["difficultyLevel"],
                        "task_selection_reason": task["taskSelectionReason"],
                    }
                    for task in tasks
                ],
                "session_hash": _session_hash(session),
                "task_sequence_hash": _task_sequence_hash(session),
            },
            "constraint_metadata": {
                "decision_policy_version": metadata["decision_policy_version"],
            },
        }
    )
    _record_task_presented(session, "session_start")
    return _serialize_session(session)


def get_practice_session(session_id: str):
    session = _practice_sessions.get(session_id)
    if not session:
        return None
    return _serialize_session(session)


def submit_practice_answer(session_id: str, answer: str | None, action: str = "submit_only"):
    session = _practice_sessions.get(session_id)
    if not session:
        return None

    if export_certification(session_id):
        return {"error": "SESSION_CERTIFIED"}

    if session.current_task_index >= len(session.tasks):
        return {"error": "SESSION_CERTIFIED"}

    current_task = session.tasks[session.current_task_index]
    allowed_action = _next_allowed_action(session, current_task)

    if action not in {"submit_only", "advance"}:
        return {"error": "YKI_RUNTIME_ACTION_INVALID"}

    if action == "advance":
        if allowed_action != "advance":
            return {"error": "YKI_RUNTIME_ACTION_INVALID"}

        session.current_task_index = min(session.current_task_index + 1, len(session.tasks))
        _record_task_presented(session, "advance")
        _record_session_completed_if_needed(session, "advance")
        return _serialize_session(session)

    if allowed_action != "submit_only":
        return {"error": "YKI_RUNTIME_ACTION_INVALID"}

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
        signal_source="yki_practice",
        signal_metadata={
            "sessionId": session.session_id,
            "decisionVersion": session.decision_version,
            "taskType": current_task["type"],
            "taskSection": current_task["section"],
            "difficultyLevel": current_task.get("difficultyLevel"),
        },
    )
    metadata = _runtime_metadata()
    record_event(
        {
            "user_id": session.user_id,
            "session_id": session.session_id,
            "event_type": "YKI_RESPONSE_SUBMITTED",
            "session_hash": _session_hash(session),
            "task_sequence_hash": _task_sequence_hash(session),
            "decision_version": metadata["decision_version"],
            "policy_version": metadata["policy_version"],
            "governance_version": metadata["governance_version"],
            "change_reference": metadata["change_reference"],
            "input_snapshot": {
                "task_id": current_task["id"],
                "section": current_task["section"],
                "action": action,
                "answer_length": len(answer or ""),
                "answer_checksum": _checksum_text(answer or ""),
            },
            "output_snapshot": {
                "task_id": current_task["id"],
                "score": evaluation["score"],
                "max_score": evaluation["maxScore"],
                "is_correct": evaluation["isCorrect"],
                "related_learning_unit_id": current_task["relatedLearningUnitId"],
                "session_hash": _session_hash(session),
                "task_sequence_hash": _task_sequence_hash(session),
            },
            "constraint_metadata": {
                "exam_mode": session.exam_mode,
                "decision_policy_version": metadata["decision_policy_version"],
            },
        }
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
            "learningSignal": learning_progress["learningSignal"] if learning_progress else None,
        }
    )
    _update_session_trace(session, current_task, evaluation, learning_progress)

    _record_session_completed_if_needed(session, action)

    return _serialize_session(session)


def reset_practice_sessions():
    global _session_counter
    _practice_sessions.clear()
    _practice_history.clear()
    _completed_session_ids.clear()
    _completed_audit_session_ids.clear()
    _presented_task_counts.clear()
    _session_counter = 0
    reset_certification_store()


def get_adaptive_focus_preview(user_id: str = DEFAULT_USER_ID):
    return build_adaptive_context(user_id)


def get_practice_certification(session_id: str):
    certification = export_certification(session_id)
    if not certification:
        return None

    return {
        **certification,
        "verification": verify_certification(session_id),
    }
