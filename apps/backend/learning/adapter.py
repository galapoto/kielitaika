from learning.graph_service import get_related_units, get_unit, list_modules_for_user
from learning.practice_service import generate_practice, generate_practice_from_weakness
from yki.session_store import DEFAULT_USER_ID


def get_learning_modules():
    return list_modules_for_user()


def get_learning_unit(unit_id: str):
    return get_unit(unit_id)


def get_related_learning_units(unit_id: str):
    return get_related_units(unit_id)


def get_learning_practice(module_id: str):
    return generate_practice(module_id)


def get_recommended_learning_practice(user_id: str = DEFAULT_USER_ID):
    return generate_practice_from_weakness(user_id)
