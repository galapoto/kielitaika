from yki.session_store import (
    advance_section,
    create_session,
    get_governed_exam_session,
    get_certificate,
    get_current_task,
    get_progress_history,
    get_session,
    is_session_expired,
    next_task,
    play_listening_prompt,
    resume_session,
    submit_audio,
    submit_answer,
)


def start_exam():
    return create_session()


def start_governed_exam():
    session = create_session()
    return {"session_id": session["sessionId"]}


def get_exam(session_id: str):
    session = get_session(session_id)

    if isinstance(session, dict) and "error" in session:
        return session
    if is_session_expired(session):
        return {"error": "SESSION_EXPIRED"}

    return session


def get_governed_exam(session_id: str):
    return get_governed_exam_session(session_id)


def resume_exam(session_id: str):
    result = resume_session(session_id)

    if isinstance(result, dict) and "error" in result:
        return result

    return result


def next_section(session_id: str):
    result = advance_section(session_id)

    if isinstance(result, dict) and "error" in result:
        return result

    return result


def advance_governed_exam(session_id: str):
    result = next_task(session_id)

    if not result:
        return {"error": "SESSION_INVALID"}
    if isinstance(result, dict) and "error" in result:
        return result

    return {"session_id": session_id}


def get_task(session_id: str):
    result = get_current_task(session_id)

    if isinstance(result, dict) and "error" in result:
        return result

    return result


def advance_task(session_id: str):
    result = next_task(session_id)

    if isinstance(result, dict) and "error" in result:
        return result

    return result


def answer_task(session_id: str, answer):
    result = submit_answer(session_id, answer)

    if isinstance(result, dict) and "error" in result:
        return result

    return result


def answer_governed_task(session_id: str, answer):
    result = submit_answer(session_id, answer)

    if not result:
        return {"error": "ANSWER_SUBMISSION_FAILED"}
    if isinstance(result, dict) and "error" in result:
        return result

    return {"session_id": session_id}


def answer_audio(session_id: str, audio_ref: str):
    result = submit_audio(session_id, audio_ref)

    if isinstance(result, dict) and "error" in result:
        return result

    return result


def answer_governed_audio(session_id: str, audio_ref: str):
    result = submit_audio(session_id, audio_ref)

    if not result:
        return {"error": "AUDIO_SUBMISSION_FAILED"}
    if isinstance(result, dict) and "error" in result:
        return result

    return {"session_id": session_id}


def play_current_listening_prompt(session_id: str):
    result = play_listening_prompt(session_id)

    if isinstance(result, dict) and "error" in result:
        return result

    return result


def play_governed_listening_prompt(session_id: str):
    result = play_listening_prompt(session_id)

    if not result:
        return {"error": "PLAYBACK_FAILED"}
    if isinstance(result, dict) and "error" in result:
        return result

    return {"session_id": session_id}


def get_exam_certificate(session_id: str):
    result = get_certificate(session_id)

    if isinstance(result, dict) and "error" in result:
        return result

    return result


def get_user_progress_history():
    return get_progress_history()
