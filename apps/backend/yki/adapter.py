import asyncio

from yki.errors import YKIError
from yki.orchestrator import YKIOrchestrator
from yki.session_store import (
    advance_section as legacy_advance_section,
    create_session as legacy_create_session,
    get_certificate as legacy_get_certificate,
    get_current_task as legacy_get_current_task,
    get_progress_history as legacy_get_progress_history,
    get_session as legacy_get_session,
    is_session_expired,
    next_task as legacy_next_task,
    play_listening_prompt as legacy_play_listening_prompt,
    resume_session as legacy_resume_session,
    submit_answer as legacy_submit_answer,
    submit_audio as legacy_submit_audio,
)

orchestrator = YKIOrchestrator()


def _run(coro):
    try:
        return asyncio.run(coro)
    except YKIError as exc:
        return {"error": exc.code}


def start_exam():
    return legacy_create_session()


def start_governed_exam():
    return _run(orchestrator.start_session())


def get_exam(session_id: str):
    session = legacy_get_session(session_id)
    if isinstance(session, dict) and "error" in session:
        return session
    if is_session_expired(session):
        return {"error": "SESSION_EXPIRED"}
    return session


def get_governed_exam(session_id: str):
    return _run(orchestrator.get_session(session_id))


def resume_exam(session_id: str):
    result = legacy_resume_session(session_id)
    if isinstance(result, dict) and "error" in result:
        return result
    return result


def next_section(session_id: str):
    result = legacy_advance_section(session_id)
    if isinstance(result, dict) and "error" in result:
        return result
    return result


def advance_governed_exam(session_id: str):
    return _run(orchestrator.next(session_id))


def get_task(session_id: str):
    result = legacy_get_current_task(session_id)
    if isinstance(result, dict) and "error" in result:
        return result
    return result


def advance_task(session_id: str):
    result = legacy_next_task(session_id)
    if isinstance(result, dict) and "error" in result:
        return result
    return result


def answer_task(session_id: str, answer):
    result = legacy_submit_answer(session_id, answer)
    if isinstance(result, dict) and "error" in result:
        return result
    return result


def answer_governed_task(session_id: str, answer):
    return _run(orchestrator.submit_answer(session_id, {"answer": answer}))


def answer_audio(session_id: str, audio_ref: str):
    result = legacy_submit_audio(session_id, audio_ref)
    if isinstance(result, dict) and "error" in result:
        return result
    return result


def answer_governed_audio(session_id: str, audio_ref: str):
    return _run(orchestrator.submit_recording(session_id, {"audio": audio_ref}))


def play_current_listening_prompt(session_id: str):
    result = legacy_play_listening_prompt(session_id)
    if isinstance(result, dict) and "error" in result:
        return result
    return result


def play_governed_listening_prompt(session_id: str):
    return _run(orchestrator.play_audio(session_id))


def get_exam_certificate(session_id: str):
    result = legacy_get_certificate(session_id)
    if isinstance(result, dict) and "error" in result:
        return result
    return result


def get_user_progress_history():
    return legacy_get_progress_history()
