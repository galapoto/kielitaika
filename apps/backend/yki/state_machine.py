from __future__ import annotations

from yki.contracts import (
    SECTION_ORDER,
    SessionState,
    activate_section,
    get_current_task,
    task_requires_answer,
    task_requires_playback,
    task_requires_recording,
    view_key_for_state,
)
from yki.errors import InvalidTransition


def compute_next_state(session, action: str) -> SessionState:
    if action not in {"next", "answer", "play_audio", "record"}:
        raise InvalidTransition("INVALID_ACTION")

    current_state = session.state
    if session.status == "completed" or current_state.view_type == "exam_complete":
        raise InvalidTransition("SESSION_READ_ONLY")

    if action == "next":
        return _advance_state(session)

    task = get_current_task(session)
    if task is None:
        raise InvalidTransition("NO_TASK_AVAILABLE")

    if action == "answer":
        if not task_requires_answer(task):
            raise InvalidTransition("ANSWER_SUBMISSION_FAILED")
        if task["id"] not in session.answers:
            raise InvalidTransition("ANSWER_REQUIRED")
        return current_state

    if action == "play_audio":
        if not task_requires_playback(task):
            raise InvalidTransition("NOT_LISTENING_SECTION")
        if session.audio_playback.get(task["id"], 0) <= 0:
            raise InvalidTransition("AUDIO_NOT_PLAYED")
        return current_state

    if not task_requires_recording(task):
        raise InvalidTransition("NOT_SPEAKING_SECTION")
    if task["id"] not in session.recordings:
        raise InvalidTransition("RECORDING_REQUIRED")
    return current_state


def _advance_state(session) -> SessionState:
    current_state = session.state
    if current_state.view_type == "section_complete":
        return _advance_section(session)

    task = get_current_task(session)
    if task is None:
        raise InvalidTransition("NO_TASK_AVAILABLE")

    if task_requires_answer(task) and task["id"] not in session.answers:
        raise InvalidTransition("TASK_NOT_ANSWERED")
    if task_requires_recording(task) and task["id"] not in session.recordings:
        raise InvalidTransition("RECORDING_REQUIRED")
    if task_requires_playback(task) and session.audio_playback.get(task["id"], 0) < 1:
        raise InvalidTransition("PLAYBACK_REQUIRED")

    next_index = current_state.index + 1
    section = current_state.section
    section_tasks = session.structure[section]

    if next_index < len(section_tasks):
        next_state = SessionState(
            view_type=section_tasks[next_index]["kind"],
            section=section,
            index=next_index,
        )
        session.visited_views.append(view_key_for_state(next_state, session.structure))
        return next_state

    if section not in session.completed_sections:
        session.completed_sections.append(section)

    next_state = SessionState(
        view_type="section_complete",
        section=section,
        index=len(section_tasks),
    )
    session.visited_views.append(view_key_for_state(next_state, session.structure))
    return next_state


def _advance_section(session) -> SessionState:
    current_section = session.state.section
    if current_section is None:
        raise InvalidTransition("NO_SECTION_AVAILABLE")

    current_index = SECTION_ORDER.index(current_section)
    if current_index + 1 >= len(SECTION_ORDER):
        session.status = "completed"
        next_state = SessionState(view_type="exam_complete", section=None, index=0)
        session.visited_views.append(view_key_for_state(next_state, session.structure))
        return next_state

    next_section = SECTION_ORDER[current_index + 1]
    activate_section(session, next_section)
    next_state = SessionState(
        view_type=session.structure[next_section][0]["kind"],
        section=next_section,
        index=0,
    )
    session.visited_views.append(view_key_for_state(next_state, session.structure))
    return next_state
