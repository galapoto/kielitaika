from yki.session_store import DEFAULT_USER_ID
from yki_practice.service import (
    get_practice_session,
    start_practice_session,
    submit_practice_answer,
)


def start_yki_practice(user_id: str = DEFAULT_USER_ID):
    return start_practice_session(user_id)


def get_yki_practice(session_id: str):
    return get_practice_session(session_id)


def submit_yki_practice(session_id: str, answer: str | None, action: str = "submit_and_next"):
    return submit_practice_answer(session_id, answer, action)
