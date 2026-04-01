from practice.session_store import (
    advance_session,
    create_session,
    get_public_session,
    submit_answer,
)


def start_daily_practice_session():
    return create_session()


def get_daily_practice_session(session_id: str):
    return get_public_session(session_id)


def submit_daily_practice_answer(session_id: str, answer):
    return submit_answer(session_id, answer)


def advance_daily_practice_session(session_id: str):
    return advance_session(session_id)
