from dataclasses import asdict
from datetime import datetime, timedelta, UTC

from learning.progress_models import UserModuleProgress, UserUnitProgress
from learning.repository import repository
from yki.session_store import DEFAULT_USER_ID

_unit_progress_store: dict[tuple[str, str], UserUnitProgress] = {}
_module_progress_store: dict[tuple[str, str], UserModuleProgress] = {}
MAX_REVIEW_INTERVAL_DAYS = 7


def _current_time():
    return datetime.now(UTC)


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


def _parse_timestamp(value: str | None):
    if not value:
        return None
    return datetime.fromisoformat(value)


def _is_due_for_review(progress: UserUnitProgress, now: datetime):
    if progress.attempts == 0 or not progress.next_review_at:
        return False

    next_review_at = _parse_timestamp(progress.next_review_at)
    if next_review_at is None:
        return False

    return now >= next_review_at


def _build_review_metadata(progress: UserUnitProgress, now: datetime):
    if not progress.next_review_at:
        return {
            "due_for_review": False,
            "urgency": "scheduled",
            "days_overdue": 0,
            "recent_mistake": False,
        }

    next_review_at = _parse_timestamp(progress.next_review_at)
    due_for_review = next_review_at is not None and now >= next_review_at
    days_overdue = 0

    if due_for_review and next_review_at is not None:
        days_overdue = max(0, (now.date() - next_review_at.date()).days)

    urgency = "scheduled"
    if due_for_review and days_overdue > 0:
        urgency = "overdue"
    elif due_for_review:
        urgency = "due_now"

    recent_mistake = (
        progress.attempts > 0
        and progress.correct_attempts < progress.attempts
        and progress.streak_correct == 0
    )

    return {
        "due_for_review": due_for_review,
        "urgency": urgency,
        "days_overdue": days_overdue,
        "recent_mistake": recent_mistake,
    }


def _calculate_review_schedule(progress: UserUnitProgress, is_correct: bool, now: datetime):
    if is_correct:
        streak_correct = progress.streak_correct + 1
        review_interval_days = min(MAX_REVIEW_INTERVAL_DAYS, streak_correct * 2)
    else:
        streak_correct = 0
        review_interval_days = 1

    next_review_at = now + timedelta(days=review_interval_days)
    return streak_correct, review_interval_days, next_review_at.isoformat()


def _get_or_create_unit_progress(user_id: str, unit_id: str):
    key = (user_id, unit_id)

    if key not in _unit_progress_store:
        _unit_progress_store[key] = _build_unit_progress(user_id, unit_id)

    return _unit_progress_store[key]


def _serialize_unit_progress(progress: UserUnitProgress):
    now = _current_time()
    return {
        **asdict(progress),
        "mastery_level": get_mastery_label(progress.mastery_score),
        **_build_review_metadata(progress, now),
    }


def _serialize_module_progress(progress: UserModuleProgress):
    now = _current_time()
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
    due_review_unit_ids = [item["unit_id"] for item in unit_progress if item["due_for_review"]]
    recent_mistake_unit_ids = [item["unit_id"] for item in unit_progress if item["recent_mistake"]]

    return {
        **asdict(progress),
        "mastery_level": get_mastery_label(progress.mastery_score),
        "mastered_unit_count": mastered_unit_count,
        "total_unit_count": len(unit_ids),
        "low_mastery_unit_ids": low_mastery_unit_ids,
        "due_review_unit_ids": due_review_unit_ids,
        "recent_mistake_unit_ids": recent_mistake_unit_ids,
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

    now = _current_time()
    unit_progress = _get_or_create_unit_progress(user_id, unit_id)
    unit_progress.attempts += 1
    unit_progress.correct_attempts += 1 if is_correct else 0
    unit_progress.last_attempt_at = now.isoformat()
    unit_progress.last_practiced_at = now.isoformat()
    (
        unit_progress.streak_correct,
        unit_progress.review_interval_days,
        unit_progress.next_review_at,
    ) = _calculate_review_schedule(unit_progress, is_correct, now)
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


def get_due_review_units(user_id: str = DEFAULT_USER_ID):
    now = _current_time()
    due_units = []

    for unit_id in repository.units:
        progress = _unit_progress_store.get((user_id, unit_id))
        if progress is None or not _is_due_for_review(progress, now):
            continue

        unit = repository.get_unit(unit_id)
        if not unit:
            continue

        review_metadata = _build_review_metadata(progress, now)
        priority_score = (
            int(progress.mastery_score < 0.7) * 20
            + int(review_metadata["due_for_review"]) * 25
            + review_metadata["days_overdue"] * 5
            + int(review_metadata["recent_mistake"]) * 15
        )
        due_units.append(
            {
                "unit": unit,
                "progress": _serialize_unit_progress(progress),
                "urgency": review_metadata["urgency"],
                "reviewPriorityScore": priority_score,
            }
        )

    due_units.sort(
        key=lambda item: (
            -item["reviewPriorityScore"],
            item["progress"]["next_review_at"] or "",
            item["unit"]["id"],
        )
    )
    return due_units


def reset_progress_store():
    _unit_progress_store.clear()
    _module_progress_store.clear()
