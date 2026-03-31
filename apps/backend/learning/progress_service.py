from dataclasses import asdict
from datetime import datetime, UTC

from learning.progress_models import UserModuleProgress, UserUnitProgress
from learning.repository import repository
from yki.session_store import DEFAULT_USER_ID

_unit_progress_store: dict[tuple[str, str], UserUnitProgress] = {}
_module_progress_store: dict[tuple[str, str], UserModuleProgress] = {}


def get_mastery_label(mastery_score: float):
    if mastery_score < 0.4:
        return "weak"
    if mastery_score < 0.7:
        return "improving"
    return "mastered"


def _round_score(value: float):
    return round(value, 4)


def _build_unit_progress(user_id: str, unit_id: str):
    return UserUnitProgress(user_id=user_id, unit_id=unit_id)


def _build_module_progress(user_id: str, module_id: str):
    return UserModuleProgress(user_id=user_id, module_id=module_id)


def _get_or_create_unit_progress(user_id: str, unit_id: str):
    key = (user_id, unit_id)

    if key not in _unit_progress_store:
        _unit_progress_store[key] = _build_unit_progress(user_id, unit_id)

    return _unit_progress_store[key]


def _serialize_unit_progress(progress: UserUnitProgress):
    return {
        **asdict(progress),
        "mastery_level": get_mastery_label(progress.mastery_score),
    }


def _serialize_module_progress(progress: UserModuleProgress):
    module = repository.modules.get(progress.module_id)
    unit_ids = module.unit_ids if module else []
    unit_progress = [
        _serialize_unit_progress(_unit_progress_store.get((progress.user_id, unit_id), _build_unit_progress(progress.user_id, unit_id)))
        for unit_id in unit_ids
    ]
    mastered_unit_count = sum(1 for item in unit_progress if item["mastery_score"] >= 0.7)
    low_mastery_unit_ids = [
        item["unit_id"]
        for item in unit_progress
        if item["attempts"] > 0 and item["mastery_score"] < 0.7
    ]

    return {
        **asdict(progress),
        "mastery_level": get_mastery_label(progress.mastery_score),
        "mastered_unit_count": mastered_unit_count,
        "total_unit_count": len(unit_ids),
        "low_mastery_unit_ids": low_mastery_unit_ids,
        "unit_progress": unit_progress,
    }


def _recalculate_module_progress(user_id: str, module_id: str):
    module = repository.modules.get(module_id)

    if not module:
        return None

    unit_progress_objects = [
        _unit_progress_store.get((user_id, unit_id), _build_unit_progress(user_id, unit_id))
        for unit_id in module.unit_ids
    ]

    if unit_progress_objects:
        mastered_unit_count = sum(1 for progress in unit_progress_objects if progress.mastery_score >= 0.7)
        mastery_score = _round_score(
            sum(progress.mastery_score for progress in unit_progress_objects) / len(unit_progress_objects)
        )
        completion_percentage = _round_score((mastered_unit_count / len(unit_progress_objects)) * 100)
    else:
        mastery_score = 0.0
        completion_percentage = 0.0

    module_progress = UserModuleProgress(
        user_id=user_id,
        module_id=module_id,
        completion_percentage=completion_percentage,
        mastery_score=mastery_score,
    )
    _module_progress_store[(user_id, module_id)] = module_progress
    return module_progress


def record_practice_result(user_id: str, exercise, is_correct: bool):
    unit_id = exercise.get("unit_id") or exercise.get("unitId")
    module_id = exercise.get("module_id") or exercise.get("moduleId")

    if unit_id not in repository.units or module_id not in repository.modules:
        return None
    if unit_id not in repository.modules[module_id].unit_ids:
        return None

    unit_progress = _get_or_create_unit_progress(user_id, unit_id)
    unit_progress.attempts += 1
    unit_progress.correct_attempts += 1 if is_correct else 0
    unit_progress.last_attempt_at = datetime.now(UTC).isoformat()
    unit_progress.mastery_score = _round_score(unit_progress.correct_attempts / unit_progress.attempts)

    module_progress = _recalculate_module_progress(user_id, module_id)

    return {
        "unitProgress": _serialize_unit_progress(unit_progress),
        "moduleProgress": _serialize_module_progress(module_progress),
    }


def get_unit_progress(unit_id: str, user_id: str = DEFAULT_USER_ID):
    if unit_id not in repository.units:
        return None

    progress = _unit_progress_store.get((user_id, unit_id), _build_unit_progress(user_id, unit_id))
    return _serialize_unit_progress(progress)


def get_module_progress(module_id: str, user_id: str = DEFAULT_USER_ID):
    if module_id not in repository.modules:
        return None

    progress = _module_progress_store.get((user_id, module_id))

    if progress is None:
        progress = _recalculate_module_progress(user_id, module_id)

    return _serialize_module_progress(progress)


def get_low_mastery_unit_ids(user_id: str = DEFAULT_USER_ID):
    low_mastery = []

    for unit_id in repository.units:
        progress = _unit_progress_store.get((user_id, unit_id), _build_unit_progress(user_id, unit_id))
        if progress.attempts > 0 and progress.mastery_score < 0.7:
            low_mastery.append(progress)

    low_mastery.sort(key=lambda progress: (progress.mastery_score, -progress.attempts, progress.unit_id))
    return [progress.unit_id for progress in low_mastery]


def reset_progress_store():
    _unit_progress_store.clear()
    _module_progress_store.clear()
