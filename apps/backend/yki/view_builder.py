from __future__ import annotations

from datetime import datetime, timedelta, UTC

from yki.contracts import (
    ADAPTIVE_SUGGESTION_MAP,
    ENGINE_STATE_SOURCE_PATH,
    SECTION_ORDER,
    WARNING_THRESHOLD_SECONDS,
    clamp_score,
    current_section_index,
    get_completed_step_count,
    get_current_task,
    get_section_completed_step_count,
    is_display_only_kind,
    map_score_to_level,
    task_requires_answer,
    task_requires_playback,
    task_requires_recording,
    view_key_for_state,
)


def build_view(
    session,
    engine_data: dict | None = None,
    current_time: datetime | None = None,
):
    now = current_time or datetime.now(UTC)
    if session.state.view_type == "exam_complete":
        return {
            "actions": {
                "next": None,
                "play_prompt": None,
                "submit": None,
            },
            "answer_status": "locked",
            "input_mode": "none",
            "instructions": [
                "Certification has been generated.",
                "This runtime is now read-only.",
            ],
            "kind": "exam_complete",
            "options": [],
            "passage": None,
            "playback": None,
            "prompt": "The YKI exam flow is complete.",
            "question": None,
            "recording": None,
            "response_locked": True,
            "section": None,
            "submitted_answer": None,
            "submitted_audio": None,
            "title": "Exam Complete",
            "view_key": "exam-complete",
        }

    if session.state.view_type == "section_complete":
        current_section = session.state.section
        current_index = current_section_index(session)
        next_section = SECTION_ORDER[current_index + 1] if current_index + 1 < len(SECTION_ORDER) else None
        next_section_started_at = None
        if next_section:
            next_section_started_at = session.section_windows[next_section]["started_at"]
        next_enabled = True
        if session.engine_timing_enforced and next_section_started_at:
            next_enabled = now >= datetime.fromisoformat(next_section_started_at)
        next_label = (
            "Complete Exam"
            if current_index == len(SECTION_ORDER) - 1
            else f"Continue to {SECTION_ORDER[current_index + 1].title()}"
        )
        return {
            "actions": {
                "next": {
                    "enabled": next_enabled,
                    "kind": "next",
                    "label": next_label,
                },
                "play_prompt": None,
                "submit": None,
            },
            "answer_status": "none",
            "input_mode": "none",
            "instructions": [
                f"{current_section.title()} is sealed.",
                (
                    "Advance forward to continue the orchestrated exam flow."
                    if next_enabled or not next_section
                    else f"Waiting for engine section window: {next_section}."
                ),
            ],
            "kind": "section_complete",
            "options": [],
            "passage": None,
            "playback": None,
            "prompt": "All required steps in this section are locked.",
            "question": None,
            "recording": None,
            "response_locked": True,
            "section": current_section,
            "submitted_answer": None,
            "submitted_audio": None,
            "title": f"{current_section.title()} Complete",
            "view_key": f"{current_section}-complete",
        }

    task = get_current_task(session)
    section = session.state.section
    answered = task["id"] in session.answers
    recorded = task["id"] in session.recordings
    played = session.audio_playback.get(task["id"], 0)
    response_locked = answered or recorded or (task_requires_playback(task) and played >= 1)
    next_enabled = is_display_only_kind(task["kind"]) and not task_requires_playback(task)
    if task_requires_playback(task):
        next_enabled = played >= 1
    elif task_requires_answer(task):
        next_enabled = answered
    elif task_requires_recording(task):
        next_enabled = recorded

    input_mode = "none"
    if task["kind"] in {"reading_question", "listening_question"}:
        input_mode = "choice" if task.get("options") else "text"
    elif task["kind"] == "writing_response":
        input_mode = "text"
    elif task["kind"] == "speaking_response":
        input_mode = "audio"

    answer_status = "pending"
    if answered or recorded:
        answer_status = "submitted"

    actions = {
        "next": {
            "enabled": next_enabled,
            "kind": "next",
            "label": "Next",
        },
        "play_prompt": None,
        "submit": None,
    }

    if task_requires_answer(task) or task_requires_recording(task):
        actions["submit"] = {
            "enabled": not response_locked,
            "kind": "submit",
            "label": "Submit Response",
        }

    playback = None
    if task_requires_playback(task):
        limit = task.get("playback_limit", 1)
        audio = task.get("audio")
        playback = {
            "count": played,
            "limit": limit,
            "remaining": max(0, limit - played),
            "ready": bool(audio),
            "audio": audio if audio else None,
        }
        actions["play_prompt"] = {
            "enabled": played < limit and bool(audio),
            "kind": "play_prompt",
            "label": "Play Prompt",
        }

    return {
        "actions": actions,
        "answer_status": answer_status,
        "input_mode": input_mode,
        "instructions": list(task.get("instructions", [])),
        "kind": task["kind"],
        "options": list(task.get("options", [])),
        "passage": task.get("passage"),
        "playback": playback,
        "prompt": task.get("prompt", ""),
        "question": task.get("question"),
        "recording": (
            {
                "max_duration_seconds": task.get("max_duration_seconds", 30),
            }
            if task["kind"] == "speaking_response"
            else None
        ),
        "response_locked": response_locked,
        "section": section,
        "submitted_answer": session.answers.get(task["id"]),
        "submitted_audio": session.recordings.get(task["id"]),
        "title": task.get("title", ""),
        "view_key": view_key_for_state(session.state, session.structure),
    }


def build_navigation(session, current_time: datetime | None = None):
    current_view = build_view(session, current_time=current_time)
    next_action = current_view["actions"]["next"]
    return {
        "back_allowed": False,
        "can_next": bool(next_action and next_action["enabled"]),
        "forward_only": True,
        "interaction_locked": current_view["response_locked"] and not bool(next_action and next_action["enabled"]),
        "next_label": next_action["label"] if next_action else None,
        "read_only": session.status == "completed",
        "skip_allowed": False,
        "state_locked": True,
    }


def build_progress(session):
    rows = []
    for section in SECTION_ORDER:
        section_tasks = session.structure.get(section, [])
        if section == session.state.section:
            status = "completed" if session.status == "completed" and section in session.completed_sections else (
                "awaiting_next" if session.state.view_type == "section_complete" else "active"
            )
            current_step_index = session.state.index
        elif section in session.completed_sections:
            status = "completed"
            current_step_index = len(section_tasks)
        else:
            status = "locked"
            current_step_index = 0
        rows.append(
            {
                "section": section,
                "status": status,
                "current_step_index": current_step_index,
                "total_steps": len(section_tasks),
                "completed_step_count": get_section_completed_step_count(session, section),
                "started_at": session.section_windows[section]["started_at"],
                "expires_at": session.section_windows[section]["expires_at"],
            }
        )
    return rows


def build_timing(session, current_time: datetime | None = None):
    now = current_time or datetime.now(UTC)

    def remaining_seconds(expires_at: str | None) -> int:
        if not expires_at:
            return 0
        return max(0, int((datetime.fromisoformat(expires_at) - now).total_seconds()))

    exam_expires_at = datetime.fromisoformat(session.started_at) + timedelta(
        seconds=sum(session.timing_manifest.values())
    )
    current_section = session.state.section
    current_window = session.section_windows[current_section] if current_section else {
        "started_at": None,
        "expires_at": None,
    }

    return {
        "server_now": now.isoformat(),
        "exam_started_at": session.started_at,
        "exam_expires_at": exam_expires_at.isoformat(),
        "exam_remaining_seconds": max(
            0,
            int((exam_expires_at - now).total_seconds()),
        ),
        "current_section_started_at": current_window["started_at"],
        "current_section_expires_at": current_window["expires_at"],
        "current_section_remaining_seconds": remaining_seconds(current_window["expires_at"]),
        "warning_threshold_seconds": WARNING_THRESHOLD_SECONDS,
        "sections": {
            section: {
                "duration_minutes": int(session.timing_manifest[section] / 60),
                "expires_at": session.section_windows[section]["expires_at"],
                "started_at": session.section_windows[section]["started_at"],
                "remaining_seconds": remaining_seconds(session.section_windows[section]["expires_at"]),
            }
            for section in SECTION_ORDER
        },
    }


def build_completion_state(session):
    return {
        "completed_section_count": len(session.completed_sections),
        "completed_step_count": get_completed_step_count(session),
        "status": "completed" if session.status == "completed" else "active",
        "total_section_count": len(SECTION_ORDER),
        "total_step_count": sum(len(session.structure.get(section, [])) for section in SECTION_ORDER),
    }


def build_governed_session_payload(
    session,
    engine_data: dict | None = None,
    current_time: datetime | None = None,
):
    return {
        "session_id": session.session_id,
        "user_id": session.user_id,
        "status": "read_only" if session.status == "completed" else session.status,
        "state_source": {
            "mode": "engine_controlled",
            "path": ENGINE_STATE_SOURCE_PATH.format(session_id=session.session_id),
        },
        "section_order": SECTION_ORDER,
        "current_section": session.state.section,
        "current_view": build_view(session, engine_data, current_time=current_time),
        "navigation": build_navigation(session, current_time=current_time),
        "timing_manifest": build_timing(session, current_time=current_time),
        "completion_state": build_completion_state(session),
        "section_progress": build_progress(session),
        "certificate": session.certificate,
        "learning_feedback": session.learning_feedback,
        "progress_history": session.progress_history,
        "runtime": session.runtime,
    }


def build_certificate(session):
    section_scores = {}
    weak_areas = []

    for section in SECTION_ORDER:
        tasks = session.structure.get(section, [])
        scores = []
        for task in tasks:
            evaluation = task.get("evaluation")
            if not evaluation:
                continue
            scores.append(clamp_score(int(evaluation["score"])))
            for criterion in evaluation.get("criteria", []):
                if criterion["score"] <= 2:
                    weak_areas.append(criterion["name"])
        section_scores[section] = round(sum(scores) / len(scores)) if scores else 0

    overall_score = round(sum(section_scores.values()) / len(section_scores)) if section_scores else 0
    deduped_weak_areas = list(dict.fromkeys(weak_areas))[:3]
    return {
        "certificate": {
            "overall_score": overall_score,
            "level": map_score_to_level(overall_score),
            "passed": overall_score >= 3 and all(score >= 2 for score in section_scores.values()),
            "section_scores": section_scores,
            "evaluation_mode": "orchestrated_engine_v1",
        },
        "learning_feedback": {
            "weak_areas": deduped_weak_areas,
            "suggestions": [
                ADAPTIVE_SUGGESTION_MAP[name]
                for name in deduped_weak_areas
                if name in ADAPTIVE_SUGGESTION_MAP
            ],
        },
    }
