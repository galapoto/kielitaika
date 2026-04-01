from learning.graph_service import (
    get_related_units,
    get_unit,
    get_user_learning_debug_state,
)
from learning.practice_service import generate_practice, generate_practice_from_weakness
from learning.progress_service import (
    get_due_review_units,
    get_module_progress,
    get_unit_progress,
    record_practice_result,
)
from learning.system_service import (
    complete_learning_lesson,
    get_learning_system,
    submit_learning_lesson_answer,
)
from yki.session_store import DEFAULT_USER_ID


def get_learning_modules():
    return get_learning_system()


def get_learning_system_state(user_id: str = DEFAULT_USER_ID):
    return get_learning_system(user_id)


def answer_learning_lesson(
    module_id: str,
    lesson_id: str,
    exercise_id: str,
    answer: str,
    user_id: str = DEFAULT_USER_ID,
):
    return submit_learning_lesson_answer(module_id, lesson_id, exercise_id, answer, user_id)


def complete_learning_system_lesson(
    module_id: str,
    lesson_id: str,
    user_id: str = DEFAULT_USER_ID,
):
    return complete_learning_lesson(module_id, lesson_id, user_id)


def get_learning_unit(unit_id: str):
    return get_unit(unit_id)


def get_related_learning_units(unit_id: str):
    return get_related_units(unit_id)


def get_learning_practice(module_id: str):
    return generate_practice(module_id)


def get_recommended_learning_practice(user_id: str = DEFAULT_USER_ID):
    return generate_practice_from_weakness(user_id)


def submit_learning_progress(exercise, is_correct: bool, user_id: str = DEFAULT_USER_ID):
    return record_practice_result(user_id, exercise, is_correct)


def get_learning_unit_progress(unit_id: str, user_id: str = DEFAULT_USER_ID):
    return get_unit_progress(unit_id, user_id)


def get_learning_module_progress(module_id: str, user_id: str = DEFAULT_USER_ID):
    return get_module_progress(module_id, user_id)


def get_learning_due_review(user_id: str = DEFAULT_USER_ID):
    return get_due_review_units(user_id)


def get_learning_debug_state(user_id: str = DEFAULT_USER_ID):
    return get_user_learning_debug_state(user_id)
