from dataclasses import asdict
from datetime import datetime, timedelta, UTC

from learning.progress_models import RecommendationOutcome, UserModuleProgress, UserUnitProgress
from learning.repository import repository
from yki.session_store import DEFAULT_USER_ID

_unit_progress_store: dict[tuple[str, str], UserUnitProgress] = {}
_module_progress_store: dict[tuple[str, str], UserModuleProgress] = {}
_recommendation_outcome_store: list[RecommendationOutcome] = []
MAX_REVIEW_INTERVAL_DAYS = 7
RECENT_MASTERY_WEIGHTS = [0.2, 0.3, 0.6]


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
        "regression_detected": progress.regression_detected,
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


def _calculate_mastery_score(progress: UserUnitProgress, is_correct: bool):
    recent_results = [*(progress.recent_results or []), is_correct]
    recent_results = recent_results[-len(RECENT_MASTERY_WEIGHTS) :]

    if len(recent_results) == 1:
        return recent_results, 1.0 if is_correct else 0.0

    weights = RECENT_MASTERY_WEIGHTS[-len(recent_results) :]
    total_weight = sum(weights)
    weighted_score = sum(
        weight * float(result) for weight, result in zip(weights, recent_results, strict=False)
    )
    return recent_results, _round_score(weighted_score / total_weight)


def _get_or_create_unit_progress(user_id: str, unit_id: str):
    key = (user_id, unit_id)

    if key not in _unit_progress_store:
        _unit_progress_store[key] = _build_unit_progress(user_id, unit_id)

    return _unit_progress_store[key]


def _serialize_unit_progress(progress: UserUnitProgress):
    now = _current_time()
    progress.post_recommendation_performance = get_post_recommendation_performance(
        progress.user_id,
        progress.unit_id,
    )
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


def _serialize_recommendation_outcome(outcome: RecommendationOutcome):
    return {
        **asdict(outcome),
        "impact_label": _get_effectiveness_impact_label(outcome.effectiveness_score),
    }


def _get_effectiveness_impact_label(effectiveness_score: float):
    if effectiveness_score >= 0.2:
        return "high_impact"
    if effectiveness_score > 0:
        return "positive"
    if effectiveness_score == 0:
        return "neutral"
    return "ineffective"


def get_post_recommendation_performance(user_id: str, unit_id: str):
    outcomes = [
        _serialize_recommendation_outcome(outcome)
        for outcome in _recommendation_outcome_store
        if outcome.user_id == user_id and outcome.unit_id == unit_id
    ]
    outcomes.sort(key=lambda item: (item["recommended_at"], item["unit_id"]))
    return outcomes


def register_recommendation_outcomes(
    user_id: str,
    module_id: str,
    unit_ids: list[str],
    decision_version: str,
    factors_used: list[str],
    weights_used: dict[str, float],
):
    now = _current_time().isoformat()

    for unit_id in unit_ids:
        progress = _get_or_create_unit_progress(user_id, unit_id)
        existing_active = next(
            (
                outcome
                for outcome in _recommendation_outcome_store
                if outcome.user_id == user_id
                and outcome.module_id == module_id
                and outcome.unit_id == unit_id
                and outcome.decision_version == decision_version
                and outcome.status == "active"
            ),
            None,
        )
        if existing_active is not None:
            continue

        _recommendation_outcome_store.append(
            RecommendationOutcome(
                user_id=user_id,
                module_id=module_id,
                unit_id=unit_id,
                decision_version=decision_version,
                recommended_at=now,
                baseline_mastery_score=progress.mastery_score,
                latest_mastery_score=progress.mastery_score,
                factors_used=factors_used,
                weights_used=weights_used,
            )
        )
        progress.post_recommendation_performance = get_post_recommendation_performance(user_id, unit_id)


def _update_recommendation_outcomes(user_id: str, unit_id: str, mastery_score: float):
    updated = False

    for outcome in _recommendation_outcome_store:
        if outcome.user_id != user_id or outcome.unit_id != unit_id or outcome.status != "active":
            continue

        outcome.subsequent_attempts += 1
        outcome.latest_mastery_score = mastery_score
        outcome.improvement_delta = _round_score(mastery_score - outcome.baseline_mastery_score)
        outcome.effectiveness_score = outcome.improvement_delta
        if outcome.subsequent_attempts >= 3 or abs(outcome.improvement_delta) >= 0.2:
            outcome.status = "completed"
        updated = True

    if updated:
        progress = _get_or_create_unit_progress(user_id, unit_id)
        progress.post_recommendation_performance = get_post_recommendation_performance(user_id, unit_id)


def get_recommendation_outcomes(user_id: str = DEFAULT_USER_ID):
    outcomes = [
        _serialize_recommendation_outcome(outcome)
        for outcome in _recommendation_outcome_store
        if outcome.user_id == user_id
    ]
    outcomes.sort(key=lambda item: (item["recommended_at"], item["module_id"], item["unit_id"]))
    return outcomes


def get_recommendation_effectiveness_summary(user_id: str = DEFAULT_USER_ID):
    outcomes = get_recommendation_outcomes(user_id)
    measured_outcomes = [item for item in outcomes if item["subsequent_attempts"] > 0]

    if not measured_outcomes:
        factor_averages = {
            factor: {
                "average_effectiveness": 0.0,
                "samples": 0,
                "impact_label": "neutral",
            }
            for factor in [
                "weak_pattern",
                "low_mastery",
                "due_review",
                "regression",
                "difficulty_alignment",
            ]
        }
        return {
            "overallAverageEffectiveness": 0.0,
            "measuredOutcomeCount": 0,
            "factorAverages": factor_averages,
            "improvementTrends": [],
        }

    factor_totals: dict[str, list[float]] = {}
    improvement_trends = []

    for outcome in measured_outcomes:
        for factor in outcome["factors_used"]:
            factor_totals.setdefault(factor, []).append(outcome["effectiveness_score"])

        improvement_trends.append(
            {
                "unitId": outcome["unit_id"],
                "moduleId": outcome["module_id"],
                "decisionVersion": outcome["decision_version"],
                "subsequentAttempts": outcome["subsequent_attempts"],
                "improvementDelta": outcome["improvement_delta"],
                "effectivenessScore": outcome["effectiveness_score"],
                "impactLabel": outcome["impact_label"],
            }
        )

    factor_averages = {}
    for factor in [
        "weak_pattern",
        "low_mastery",
        "due_review",
        "regression",
        "difficulty_alignment",
    ]:
        scores = factor_totals.get(factor, [])
        average_effectiveness = _round_score(sum(scores) / len(scores)) if scores else 0.0
        factor_averages[factor] = {
            "average_effectiveness": average_effectiveness,
            "samples": len(scores),
            "impact_label": _get_effectiveness_impact_label(average_effectiveness),
        }

    overall_average = _round_score(
        sum(item["effectiveness_score"] for item in measured_outcomes) / len(measured_outcomes)
    )
    improvement_trends.sort(
        key=lambda item: (-item["effectivenessScore"], item["unitId"], item["moduleId"])
    )

    return {
        "overallAverageEffectiveness": overall_average,
        "measuredOutcomeCount": len(measured_outcomes),
        "factorAverages": factor_averages,
        "improvementTrends": improvement_trends,
    }


def record_practice_result(user_id: str, exercise, is_correct: bool):
    unit_id = exercise.get("unit_id") or exercise.get("unitId")
    module_id = exercise.get("module_id") or exercise.get("moduleId")

    if unit_id not in repository.units or module_id not in repository.modules:
        return None
    if unit_id not in repository.modules[module_id].unit_ids:
        return None

    now = _current_time()
    unit_progress = _get_or_create_unit_progress(user_id, unit_id)
    previous_mastery_score = unit_progress.mastery_score
    unit_progress.attempts += 1
    unit_progress.correct_attempts += 1 if is_correct else 0
    unit_progress.last_attempt_at = now.isoformat()
    unit_progress.last_practiced_at = now.isoformat()
    (
        unit_progress.streak_correct,
        unit_progress.review_interval_days,
        unit_progress.next_review_at,
    ) = _calculate_review_schedule(unit_progress, is_correct, now)
    unit_progress.previous_mastery_score = previous_mastery_score
    unit_progress.recent_results, unit_progress.mastery_score = _calculate_mastery_score(
        unit_progress,
        is_correct,
    )
    unit_progress.regression_detected = (
        previous_mastery_score > 0.7 and unit_progress.mastery_score < 0.5
    )
    _update_recommendation_outcomes(user_id, unit_id, unit_progress.mastery_score)

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
    _recommendation_outcome_store.clear()
