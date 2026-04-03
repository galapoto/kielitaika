from dataclasses import asdict, dataclass, field
from datetime import UTC, datetime

from learning.decision_version import get_decision_metadata
from learning.system_content import LEARNING_LEVELS
from learning.system_models import (
    LearningExercise,
    LearningLesson,
    LearningSystemLevel,
    LearningSystemModule,
)
from practice.engine import evaluate_exercise_answer
from yki.contracts import DEFAULT_USER_ID


@dataclass
class LessonExerciseAttempt:
    attempted: bool = False
    last_correct: bool | None = None
    last_submitted_answer: str | None = None


@dataclass
class LearningSystemProgress:
    user_id: str
    completed_lesson_ids: list[str] = field(default_factory=list)
    completed_lesson_timestamps: dict[str, str] = field(default_factory=dict)
    current_lesson_id: str | None = None
    exercise_attempts: dict[str, dict[str, LessonExerciseAttempt]] = field(default_factory=dict)
    updated_at: str | None = None


_progress_store: dict[str, LearningSystemProgress] = {}


def _now():
    return datetime.now(UTC).isoformat()


def _ordered_modules():
    return [module for level in LEARNING_LEVELS for module in level.modules]


def _ordered_lessons():
    return [lesson for module in _ordered_modules() for lesson in module.lessons]


MODULE_INDEX = {module.id: module for module in _ordered_modules()}
LESSON_INDEX = {lesson.id: lesson for lesson in _ordered_lessons()}
MODULE_BY_LESSON = {
    lesson.id: module for module in _ordered_modules() for lesson in module.lessons
}
LEVEL_BY_MODULE = {
    module.id: level for level in LEARNING_LEVELS for module in level.modules
}
EXERCISE_BY_LESSON = {
    lesson.id: {exercise.id: exercise for exercise in lesson.exercises}
    for lesson in _ordered_lessons()
}
LESSON_SEQUENCE = [lesson.id for lesson in _ordered_lessons()]
TOTAL_LESSON_COUNT = len(LESSON_SEQUENCE)


def reset_learning_system_progress_store():
    _progress_store.clear()


def _default_current_lesson_id():
    return LESSON_SEQUENCE[0] if LESSON_SEQUENCE else None


def _get_or_create_progress(user_id: str):
    progress = _progress_store.get(user_id)

    if progress is None:
        progress = LearningSystemProgress(
            user_id=user_id,
            current_lesson_id=_default_current_lesson_id(),
            updated_at=_now(),
        )
        _progress_store[user_id] = progress

    if progress.current_lesson_id is None:
        progress.current_lesson_id = _resolve_next_lesson_id(progress.completed_lesson_ids)

    return progress


def _resolve_next_lesson_id(completed_lesson_ids: list[str]):
    completed = set(completed_lesson_ids)

    for lesson_id in LESSON_SEQUENCE:
        if lesson_id not in completed:
            return lesson_id

    return LESSON_SEQUENCE[-1] if LESSON_SEQUENCE else None


def _serialize_exercise_progress(
    lesson_id: str,
    exercise: LearningExercise,
    progress: LearningSystemProgress,
):
    lesson_attempts = progress.exercise_attempts.get(lesson_id, {})
    attempt = lesson_attempts.get(exercise.id, LessonExerciseAttempt())

    return {
        "exerciseId": exercise.id,
        "attempted": attempt.attempted,
        "lastCorrect": attempt.last_correct,
        "lastSubmittedAnswer": attempt.last_submitted_answer,
    }


def _serialize_lesson_progress(lesson: LearningLesson, progress: LearningSystemProgress):
    exercise_progress = [
        _serialize_exercise_progress(lesson.id, exercise, progress) for exercise in lesson.exercises
    ]
    answered_exercise_ids = [
        item["exerciseId"] for item in exercise_progress if item["attempted"]
    ]

    return {
        "completed": lesson.id in progress.completed_lesson_ids,
        "completedAt": progress.completed_lesson_timestamps.get(lesson.id),
        "answeredExerciseIds": answered_exercise_ids,
        "allExercisesCorrect": bool(exercise_progress)
        and all(item["lastCorrect"] is True for item in exercise_progress),
        "exerciseProgress": exercise_progress,
    }


def _serialize_exercise(exercise: LearningExercise):
    payload = asdict(exercise)
    payload.pop("expected_answer", None)
    payload["inputMode"] = payload.pop("input_mode")
    payload["deterministicKey"] = payload.pop("deterministic_key")
    return payload


def _serialize_lesson(lesson: LearningLesson, progress: LearningSystemProgress):
    return {
        "id": lesson.id,
        "title": lesson.title,
        "summary": lesson.summary,
        "explanation": lesson.explanation,
        "examples": lesson.examples,
        "items": [asdict(item) for item in lesson.items],
        "exercises": [_serialize_exercise(exercise) for exercise in lesson.exercises],
        "progress": _serialize_lesson_progress(lesson, progress),
    }


def _serialize_module(module: LearningSystemModule, progress: LearningSystemProgress):
    completed_count = sum(
        1 for lesson in module.lessons if lesson.id in progress.completed_lesson_ids
    )
    current_lesson_id = next(
        (lesson.id for lesson in module.lessons if lesson.id not in progress.completed_lesson_ids),
        module.lessons[-1].id,
    )

    return {
        "id": module.id,
        "title": module.title,
        "description": module.description,
        "levelId": module.level_id,
        "levelLabel": module.level_label,
        "currentLessonId": current_lesson_id,
        "completedLessonCount": completed_count,
        "totalLessonCount": len(module.lessons),
        "progressPercent": round(completed_count / len(module.lessons), 4),
        "lessons": [_serialize_lesson(lesson, progress) for lesson in module.lessons],
    }


def _serialize_level(level: LearningSystemLevel, progress: LearningSystemProgress):
    return {
        "id": level.id,
        "title": level.title,
        "cefr": level.cefr,
        "description": level.description,
        "modules": [_serialize_module(module, progress) for module in level.modules],
    }


def _module_progress_rows(progress: LearningSystemProgress):
    return [
        {
            "moduleId": module.id,
            "title": module.title,
            "completedLessonCount": sum(
                1 for lesson in module.lessons if lesson.id in progress.completed_lesson_ids
            ),
            "totalLessonCount": len(module.lessons),
            "currentLessonId": next(
                (
                    lesson.id
                    for lesson in module.lessons
                    if lesson.id not in progress.completed_lesson_ids
                ),
                module.lessons[-1].id,
            ),
            "progressPercent": round(
                sum(1 for lesson in module.lessons if lesson.id in progress.completed_lesson_ids)
                / len(module.lessons),
                4,
            ),
        }
        for module in _ordered_modules()
    ]


def _current_level_and_module(progress: LearningSystemProgress):
    current_lesson_id = progress.current_lesson_id or _default_current_lesson_id()
    if current_lesson_id is None:
        return None, None

    module = MODULE_BY_LESSON[current_lesson_id]
    level = LEVEL_BY_MODULE[module.id]
    return level.id, module.id


def _serialize_system_payload(
    progress: LearningSystemProgress,
    *,
    latest_evaluation: dict | None = None,
    latest_transition: str | None = None,
):
    metadata = get_decision_metadata()
    current_level_id, current_module_id = _current_level_and_module(progress)

    return {
        "levels": [_serialize_level(level, progress) for level in LEARNING_LEVELS],
        "moduleProgress": _module_progress_rows(progress),
        "currentLevelId": current_level_id,
        "currentModuleId": current_module_id,
        "currentLessonId": progress.current_lesson_id,
        "completedLessonIds": progress.completed_lesson_ids,
        "completedLessonCount": len(progress.completed_lesson_ids),
        "totalLessonCount": TOTAL_LESSON_COUNT,
        "latestEvaluation": latest_evaluation,
        "latestTransition": latest_transition,
        "decisionVersion": metadata["decision_version"],
        "policyVersion": metadata["policy_version"],
        "governanceVersion": metadata["governance_version"],
        "changeReference": metadata["change_reference"],
        "governanceStatus": metadata["governance_status"],
    }


def get_learning_system(user_id: str = DEFAULT_USER_ID):
    progress = _get_or_create_progress(user_id)
    return _serialize_system_payload(progress)


def _validate_lesson_location(module_id: str, lesson_id: str):
    module = MODULE_INDEX.get(module_id)
    lesson = LESSON_INDEX.get(lesson_id)

    if module is None or lesson is None:
        return None, None

    if lesson_id not in [item.id for item in module.lessons]:
        return None, None

    return module, lesson


def submit_learning_lesson_answer(
    module_id: str,
    lesson_id: str,
    exercise_id: str,
    answer: str,
    user_id: str = DEFAULT_USER_ID,
):
    _, lesson = _validate_lesson_location(module_id, lesson_id)

    if lesson is None:
        return None

    exercise = EXERCISE_BY_LESSON.get(lesson_id, {}).get(exercise_id)
    if exercise is None:
        return None

    progress = _get_or_create_progress(user_id)
    progress.current_lesson_id = lesson_id
    progress.updated_at = _now()

    evaluation = evaluate_exercise_answer(
        {
            "expected_answer": exercise.expected_answer,
            "explanation": exercise.explanation,
            "input_mode": exercise.input_mode,
        },
        answer,
    )

    progress.exercise_attempts.setdefault(lesson_id, {})[exercise_id] = LessonExerciseAttempt(
        attempted=True,
        last_correct=evaluation["correct"],
        last_submitted_answer=evaluation["submitted_answer"],
    )

    return _serialize_system_payload(
        progress,
        latest_evaluation={
            "lessonId": lesson_id,
            "exerciseId": exercise_id,
            "correct": evaluation["correct"],
            "submittedAnswer": evaluation["submitted_answer"],
            "expectedAnswer": evaluation["expected_answer"],
            "explanation": evaluation["explanation"],
        },
        latest_transition=None,
    )


def complete_learning_lesson(
    module_id: str,
    lesson_id: str,
    user_id: str = DEFAULT_USER_ID,
):
    _, lesson = _validate_lesson_location(module_id, lesson_id)

    if lesson is None:
        return None

    progress = _get_or_create_progress(user_id)
    progress.current_lesson_id = lesson_id

    if lesson_id not in progress.completed_lesson_ids:
        progress.completed_lesson_ids.append(lesson_id)
        progress.completed_lesson_timestamps[lesson_id] = _now()

    progress.completed_lesson_ids = [
        item for item in LESSON_SEQUENCE if item in set(progress.completed_lesson_ids)
    ]
    progress.updated_at = _now()
    next_lesson_id = _resolve_next_lesson_id(progress.completed_lesson_ids)
    progress.current_lesson_id = next_lesson_id

    if len(progress.completed_lesson_ids) == TOTAL_LESSON_COUNT:
        latest_transition = "All structured lessons are complete."
    else:
        next_lesson = LESSON_INDEX[next_lesson_id] if next_lesson_id else lesson
        latest_transition = f"{lesson.title} completed. Next lesson: {next_lesson.title}."

    return _serialize_system_payload(
        progress,
        latest_evaluation=None,
        latest_transition=latest_transition,
    )
