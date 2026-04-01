from speaking.session_store import (
    advance_session,
    create_session,
    get_public_session,
    submit_response,
)


def start_speaking_session():
    return create_session()


def get_speaking_session(session_id: str):
    return get_public_session(session_id)


def submit_speaking_response(session_id: str, transcript: str, recording_captured: bool):
    return submit_response(session_id, transcript, recording_captured)


def advance_speaking_session(session_id: str):
    return advance_session(session_id)
