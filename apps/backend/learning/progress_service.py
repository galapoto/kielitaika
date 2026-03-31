from dataclasses import asdict
from datetime import datetime, timedelta, UTC

from audit.audit_service import record_event
from learning.decision_version import get_decision_metadata
from learning.policy_engine import (
    clamp_retry_count,
    get_stagnation_policy,
    resolve_stagnation_stage,
)
from learning.progress_models import RecommendationOutcome, UserModuleProgress, UserUnitProgress
from learning.repository import repository
from yki.session_store import DEFAULT_USER_ID

_unit_progress_store: dict[tuple[str, str], UserUnitProgress] = {}
_module_progress_store: dict[tuple[str, str], UserModuleProgress] = {}
_recommendation_outcome_store: list[RecommendationOutcome] = []
_learning_signal_log_store: list[dict] = []
MAX_REVIEW_INTERVAL_DAYS = 7
RECENT_MASTERY_WEIGHTS = [0.2, 0.3, 0.6]
MAX_SIGNAL_HISTORY = 8


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


def _clamp_score(value: float, minimum: float = 0.0, maximum: float = 1.0):
    return max(minimum, min(maximum, _round_score(value)))


def _build_unit_progress(user_id: str, unit_id: str):
    return UserUnitProgress(user_id=user_id, unit_id=unit_id)


def _build_module_progress(user_id: str, module_id: str):
    return UserModuleProgress(user_id=user_id, module_id=module_id)


def _parse_timestamp(value: str | None):
    if not value:
        return None
    try:
        return datetime.fromisoformat(value)
    except ValueError:
        return None


def _get_runtime_metadata():
    return get_decision_metadata()


def _get_stagnation_settings():
    policy = get_stagnation_policy()
    return {
        "attempt_threshold": policy["threshold_attempts"],
        "improvement_epsilon": policy["improvement_epsilon"],
        "retry_limit": policy["retry_limit"],
        "escalation_path": policy["escalation_path"],
    }


def get_stagnation_config():
    settings = _get_stagnation_settings()
    metadata = _get_runtime_metadata()
    return {
        "attemptThreshold": settings["attempt_threshold"],
        "improvementEpsilon": settings["improvement_epsilon"],
        "retryLimit": settings["retry_limit"],
        "policyVersion": metadata["policy_version"],
        "governanceVersion": metadata["governance_version"],
        "escalationPath": settings["escalation_path"],
    }


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
        "stagnated": progress.stagnated,
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


def _get_recent_signal_history(progress: UserUnitProgress):
    return progress.signal_history[-MAX_SIGNAL_HISTORY:]


def _serialize_learning_signal_log(entry: dict):
    return {
        **entry,
        "impact_label": _get_effectiveness_impact_label(
            entry.get("effectiveness_score", 0.0),
            improvement_delta=entry.get("improvement_delta", 0.0),
            stagnated=entry.get("stagnated", False),
        ),
    }


def _record_learning_signal(
    *,
    user_id: str,
    module_id: str,
    unit_id: str,
    signal_source: str,
    is_correct: bool,
    now: datetime,
    previous_mastery_score: float,
    updated_mastery_score: float,
    metadata: dict | None,
):
    signal_entry = {
        "user_id": user_id,
        "module_id": module_id,
        "unit_id": unit_id,
        "signal_source": signal_source,
        "is_correct": is_correct,
        "task_type": metadata.get("taskType") if metadata else None,
        "task_section": metadata.get("taskSection") if metadata else None,
        "difficulty_level": metadata.get("difficultyLevel") if metadata else None,
        "recorded_at": now.isoformat(),
        "previous_mastery_score": _round_score(previous_mastery_score),
        "updated_mastery_score": _round_score(updated_mastery_score),
        "improvement_delta": _round_score(updated_mastery_score - previous_mastery_score),
        "effectiveness_score": _clamp_score(max(0.0, updated_mastery_score - previous_mastery_score)),
        "stagnated": False,
    }
    _learning_signal_log_store.append(signal_entry)
    return signal_entry


def _resolve_stagnation_reason(outcome: RecommendationOutcome):
    return (
        f"No meaningful mastery change after {outcome.subsequent_attempts} attempts "
        f"since recommendation {outcome.recommended_at}. Policy stage: {outcome.policy_stage}."
    )


def _sync_unit_stagnation(user_id: str, unit_id: str):
    progress = _get_or_create_unit_progress(user_id, unit_id)
    latest_outcome = max(
        (
            outcome
            for outcome in _recommendation_outcome_store
            if outcome.user_id == user_id and outcome.unit_id == unit_id
        ),
        default=None,
        key=lambda outcome: outcome.recommended_at,
    )

    if latest_outcome is None or latest_outcome.status != "stagnated":
        progress.stagnated = False
        progress.stagnation_reason = None
        progress.stagnation_detected_at = None
        progress.stagnation_retry_count = 0
        progress.stagnation_stage = resolve_stagnation_stage(0)
        return

    progress.stagnated = True
    progress.stagnation_reason = _resolve_stagnation_reason(latest_outcome)
    progress.stagnation_detected_at = (
        latest_outcome.attempt_history[-1]["recorded_at"]
        if latest_outcome.attempt_history
        else latest_outcome.recommended_at
    )
    progress.stagnation_retry_count = latest_outcome.retry_count
    progress.stagnation_stage = latest_outcome.policy_stage


def _serialize_unit_progress(progress: UserUnitProgress):
    now = _current_time()
    metadata = _get_runtime_metadata()
    progress.post_recommendation_performance = get_post_recommendation_performance(
        progress.user_id,
        progress.unit_id,
    )
    return {
        **asdict(progress),
        "signal_history": _get_recent_signal_history(progress),
        "policy_version": metadata["policy_version"],
        "governance_version": metadata["governance_version"],
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
    stagnated_unit_ids = [item["unit_id"] for item in unit_progress if item["stagnated"]]

    return {
        **asdict(progress),
        "mastery_level": get_mastery_label(progress.mastery_score),
        "mastered_unit_count": mastered_unit_count,
        "total_unit_count": len(unit_ids),
        "low_mastery_unit_ids": low_mastery_unit_ids,
        "due_review_unit_ids": due_review_unit_ids,
        "recent_mistake_unit_ids": recent_mistake_unit_ids,
        "stagnated_unit_ids": stagnated_unit_ids,
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
        "policy_version": outcome.policy_version,
        "impact_label": _get_effectiveness_impact_label(
            outcome.effectiveness_score,
            improvement_delta=outcome.improvement_delta,
            stagnated=outcome.status == "stagnated",
        ),
    }


def _get_effectiveness_impact_label(
    effectiveness_score: float,
    *,
    improvement_delta: float = 0.0,
    stagnated: bool = False,
):
    settings = _get_stagnation_settings()
    if stagnated:
        return "stagnated"
    if effectiveness_score >= 0.2:
        return "high_impact"
    if effectiveness_score > 0:
        return "positive"
    if improvement_delta < 0:
        return "ineffective"
    if abs(improvement_delta) <= settings["improvement_epsilon"]:
        return "neutral"
    return "positive"


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
    policy_version: str,
    factors_used: list[str],
    weights_used: dict[str, float],
):
    now = _current_time().isoformat()
    settings = _get_stagnation_settings()

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
                and outcome.policy_version == policy_version
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
                policy_version=policy_version,
                baseline_mastery_score=progress.mastery_score,
                latest_mastery_score=progress.mastery_score,
                factors_used=factors_used,
                weights_used=weights_used,
                attempt_history=[],
                policy_trace={
                    "policy_version": policy_version,
                    "stagnation_retry_limit": settings["retry_limit"],
                },
            )
        )
        progress.post_recommendation_performance = get_post_recommendation_performance(user_id, unit_id)


def _update_recommendation_outcomes(
    user_id: str,
    unit_id: str,
    mastery_score: float,
    *,
    signal_source: str,
    signal_metadata: dict | None,
    recorded_at: datetime,
):
    updated = False
    settings = _get_stagnation_settings()

    for outcome in _recommendation_outcome_store:
        if outcome.user_id != user_id or outcome.unit_id != unit_id:
            continue
        if outcome.status not in {"active", "stagnated"}:
            continue

        previous_status = outcome.status
        previous_policy_stage = outcome.policy_stage

        outcome.subsequent_attempts += 1
        outcome.latest_mastery_score = mastery_score
        outcome.improvement_delta = _round_score(mastery_score - outcome.baseline_mastery_score)
        outcome.effectiveness_score = _clamp_score(max(0.0, outcome.improvement_delta))
        outcome.attempt_history.append(
            {
                "attempt_number": outcome.subsequent_attempts,
                "mastery_score": mastery_score,
                "improvement_delta": outcome.improvement_delta,
                "signal_source": signal_source,
                "task_type": signal_metadata.get("taskType") if signal_metadata else None,
                "task_section": signal_metadata.get("taskSection") if signal_metadata else None,
                "difficulty_level": signal_metadata.get("difficultyLevel") if signal_metadata else None,
                "recorded_at": recorded_at.isoformat(),
            }
        )
        if (
            outcome.subsequent_attempts >= settings["attempt_threshold"]
            and abs(outcome.improvement_delta) <= settings["improvement_epsilon"]
        ):
            outcome.status = "stagnated"
            outcome.retry_count = clamp_retry_count(outcome.retry_count + 1)
            outcome.policy_stage = resolve_stagnation_stage(outcome.retry_count)
        elif outcome.improvement_delta >= 0.2:
            outcome.status = "completed"
            outcome.retry_count = 0
            outcome.policy_stage = resolve_stagnation_stage(0)
        elif outcome.subsequent_attempts >= settings["attempt_threshold"] and outcome.improvement_delta < 0:
            outcome.status = "completed"
            outcome.retry_count = clamp_retry_count(outcome.retry_count + 1)
            if outcome.retry_count >= settings["retry_limit"]:
                outcome.policy_stage = resolve_stagnation_stage(settings["retry_limit"] + 1)
            else:
                outcome.policy_stage = resolve_stagnation_stage(outcome.retry_count)
        if outcome.status == "stagnated" and outcome.retry_count >= settings["retry_limit"]:
            outcome.policy_stage = resolve_stagnation_stage(settings["retry_limit"] + 1)
        outcome.policy_trace = {
            "policy_version": outcome.policy_version,
            "retry_limit": settings["retry_limit"],
            "retry_count": outcome.retry_count,
            "policy_stage": outcome.policy_stage,
            "signal_source": signal_source,
        }
        if outcome.status == "stagnated" and (
            previous_status != "stagnated" or previous_policy_stage != outcome.policy_stage
        ):
            record_event(
                {
                    "user_id": user_id,
                    "session_id": None,
                    "event_type": "STAGNATION_DETECTED",
                    "decision_version": outcome.decision_version,
                    "policy_version": outcome.policy_version,
                    "input_snapshot": {
                        "module_id": outcome.module_id,
                        "unit_id": outcome.unit_id,
                        "subsequent_attempts": outcome.subsequent_attempts,
                        "signal_source": signal_source,
                    },
                    "output_snapshot": {
                        "module_id": outcome.module_id,
                        "unit_id": outcome.unit_id,
                        "status": outcome.status,
                        "retry_count": outcome.retry_count,
                        "policy_stage": outcome.policy_stage,
                        "improvement_delta": outcome.improvement_delta,
                    },
                    "constraint_metadata": {
                        "policy_trace": outcome.policy_trace,
                    },
                }
            )
        updated = True

    if updated:
        progress = _get_or_create_unit_progress(user_id, unit_id)
        progress.post_recommendation_performance = get_post_recommendation_performance(user_id, unit_id)
        _sync_unit_stagnation(user_id, unit_id)


def get_recommendation_outcomes(user_id: str = DEFAULT_USER_ID):
    outcomes = [
        _serialize_recommendation_outcome(outcome)
        for outcome in _recommendation_outcome_store
        if outcome.user_id == user_id
    ]
    outcomes.sort(key=lambda item: (item["recommended_at"], item["module_id"], item["unit_id"]))
    return outcomes


def get_learning_signal_logs(user_id: str = DEFAULT_USER_ID):
    logs = [
        _serialize_learning_signal_log(entry)
        for entry in _learning_signal_log_store
        if entry["user_id"] == user_id
    ]
    logs.sort(key=lambda item: (item["recorded_at"], item["unit_id"]))
    return logs


def get_stagnated_units(user_id: str = DEFAULT_USER_ID):
    stagnated_units = []
    metadata = _get_runtime_metadata()

    for unit_id in repository.units:
        progress = _unit_progress_store.get((user_id, unit_id))
        if progress is None or not progress.stagnated:
            continue

        unit = repository.get_unit(unit_id)
        if not unit:
            continue

        related_units = repository.get_related_units(unit_id)
        alternative_unit = next((item for item in related_units if item["id"] != unit_id), None)
        if alternative_unit is None:
            module = repository.get_module(unit["moduleIds"][0])
            if module:
                alternative_unit = next(
                    (item for item in module["units"] if item["id"] != unit_id),
                    None,
                )

        difficulty_level = unit.get("difficultyLevel") or "medium"
        switch_difficulty_to = {
            "easy": "medium",
            "medium": "easy",
            "hard": "medium",
        }.get(difficulty_level, "medium")
        policy_stage = progress.stagnation_stage
        retry_suggestion = {
            "retry_current_unit": "Retry this unit again before escalating.",
            "alternative_unit": "Switch to a related support unit before retrying.",
            "switch_difficulty": "Retry this unit with a safer difficulty level.",
            "forced_progression": "Stop retrying this unit and move forward to the alternative path.",
        }.get(policy_stage, "Retry this unit with an easier variation and a related support unit.")

        stagnated_units.append(
            {
                "unitId": unit_id,
                "title": unit["title"],
                "attempts": progress.attempts,
                "masteryScore": progress.mastery_score,
                "stagnationReason": progress.stagnation_reason,
                "retrySuggestion": retry_suggestion,
                "alternativeUnit": alternative_unit,
                "switchDifficultyTo": switch_difficulty_to,
                "retryCount": progress.stagnation_retry_count,
                "policyStage": progress.stagnation_stage,
                "policyVersion": metadata["policy_version"],
                "governanceVersion": metadata["governance_version"],
            }
        )

    stagnated_units.sort(key=lambda item: (-item["attempts"], item["unitId"]))
    return stagnated_units


def get_recommendation_effectiveness_summary(user_id: str = DEFAULT_USER_ID):
    outcomes = get_recommendation_outcomes(user_id)
    measured_outcomes = [item for item in outcomes if item["subsequent_attempts"] > 0]

    if not measured_outcomes:
        factor_averages = {
            factor: {
                "average_effectiveness": 0.0,
                "average_improvement_delta": 0.0,
                "samples": 0,
                "stagnated_count": 0,
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
            "stagnatedOutcomeCount": 0,
            "factorAverages": factor_averages,
            "improvementTrends": [],
        }

    factor_totals: dict[str, list[float]] = {}
    factor_improvements: dict[str, list[float]] = {}
    factor_stagnation_counts: dict[str, int] = {}
    improvement_trends = []
    stagnated_outcome_count = 0

    for outcome in measured_outcomes:
        for factor in outcome["factors_used"]:
            factor_totals.setdefault(factor, []).append(outcome["effectiveness_score"])
            factor_improvements.setdefault(factor, []).append(outcome["improvement_delta"])
            if outcome["status"] == "stagnated":
                factor_stagnation_counts[factor] = factor_stagnation_counts.get(factor, 0) + 1

        improvement_trends.append(
            {
                "unitId": outcome["unit_id"],
                "moduleId": outcome["module_id"],
                "decisionVersion": outcome["decision_version"],
                "subsequentAttempts": outcome["subsequent_attempts"],
                "improvementDelta": outcome["improvement_delta"],
                "effectivenessScore": outcome["effectiveness_score"],
                "impactLabel": outcome["impact_label"],
                "status": outcome["status"],
            }
        )
        if outcome["status"] == "stagnated":
            stagnated_outcome_count += 1

    factor_averages = {}
    for factor in [
        "weak_pattern",
        "low_mastery",
        "due_review",
        "regression",
        "difficulty_alignment",
    ]:
        scores = factor_totals.get(factor, [])
        improvements = factor_improvements.get(factor, [])
        average_effectiveness = _round_score(sum(scores) / len(scores)) if scores else 0.0
        average_improvement_delta = (
            _round_score(sum(improvements) / len(improvements)) if improvements else 0.0
        )
        stagnated_count = factor_stagnation_counts.get(factor, 0)
        factor_averages[factor] = {
            "average_effectiveness": average_effectiveness,
            "average_improvement_delta": average_improvement_delta,
            "samples": len(scores),
            "stagnated_count": stagnated_count,
            "impact_label": _get_effectiveness_impact_label(
                average_effectiveness,
                improvement_delta=average_improvement_delta,
                stagnated=stagnated_count > 0 and average_effectiveness == 0.0,
            ),
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
        "stagnatedOutcomeCount": stagnated_outcome_count,
        "factorAverages": factor_averages,
        "improvementTrends": improvement_trends,
    }


def record_practice_result(
    user_id: str,
    exercise,
    is_correct: bool,
    *,
    signal_source: str = "learning_practice",
    signal_metadata: dict | None = None,
):
    unit_id = exercise.get("unit_id") or exercise.get("unitId")
    module_id = exercise.get("module_id") or exercise.get("moduleId")

    if unit_id not in repository.units or module_id not in repository.modules:
        return None
    if unit_id not in repository.modules[module_id].unit_ids:
        return None

    now = _current_time()
    unit_progress = _get_or_create_unit_progress(user_id, unit_id)
    previous_mastery_score = unit_progress.mastery_score
    previously_mastered = unit_progress.mastery_score >= 0.7
    unit_progress.attempts += 1
    unit_progress.correct_attempts += 1 if is_correct else 0
    unit_progress.last_attempt_at = now.isoformat()
    unit_progress.last_practiced_at = now.isoformat()
    if signal_source == "yki_practice":
        unit_progress.yki_influence_count += 1
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
    signal_entry = _record_learning_signal(
        user_id=user_id,
        module_id=module_id,
        unit_id=unit_id,
        signal_source=signal_source,
        is_correct=is_correct,
        now=now,
        previous_mastery_score=previous_mastery_score,
        updated_mastery_score=unit_progress.mastery_score,
        metadata=signal_metadata,
    )
    unit_progress.signal_history = [*unit_progress.signal_history, signal_entry][-MAX_SIGNAL_HISTORY:]
    _update_recommendation_outcomes(
        user_id,
        unit_id,
        unit_progress.mastery_score,
        signal_source=signal_source,
        signal_metadata=signal_metadata,
        recorded_at=now,
    )
    signal_entry["stagnated"] = unit_progress.stagnated

    module_progress = _recalculate_module_progress(user_id, module_id)
    serialized_unit_progress = _serialize_unit_progress(unit_progress)
    serialized_module_progress = _serialize_module_progress(module_progress)
    serialized_signal = _serialize_learning_signal_log(signal_entry)
    metadata = _get_runtime_metadata()

    record_event(
        {
            "user_id": user_id,
            "session_id": signal_metadata.get("sessionId") if signal_metadata else None,
            "event_type": "UNIT_ATTEMPTED",
            "decision_version": signal_metadata.get("decisionVersion", metadata["decision_version"])
            if signal_metadata
            else metadata["decision_version"],
            "policy_version": metadata["policy_version"],
            "governance_version": metadata["governance_version"],
            "change_reference": metadata["change_reference"],
            "input_snapshot": {
                "module_id": module_id,
                "unit_id": unit_id,
                "is_correct": is_correct,
                "signal_source": signal_source,
                "task_type": signal_metadata.get("taskType") if signal_metadata else None,
                "task_section": signal_metadata.get("taskSection") if signal_metadata else None,
            },
            "output_snapshot": {
                "module_id": module_id,
                "unit_id": unit_id,
                "attempts": serialized_unit_progress["attempts"],
                "mastery_score": serialized_unit_progress["mastery_score"],
                "mastery_level": serialized_unit_progress["mastery_level"],
                "stagnated": serialized_unit_progress["stagnated"],
            },
            "constraint_metadata": {
                "review_interval_days": serialized_unit_progress["review_interval_days"],
                "next_review_at": serialized_unit_progress["next_review_at"],
            },
        }
    )

    if not previously_mastered and unit_progress.mastery_score >= 0.7:
        record_event(
            {
                "user_id": user_id,
                "session_id": signal_metadata.get("sessionId") if signal_metadata else None,
                "event_type": "UNIT_COMPLETED",
                "decision_version": signal_metadata.get("decisionVersion", metadata["decision_version"])
                if signal_metadata
                else metadata["decision_version"],
                "policy_version": metadata["policy_version"],
                "governance_version": metadata["governance_version"],
                "change_reference": metadata["change_reference"],
                "input_snapshot": {
                    "module_id": module_id,
                    "unit_id": unit_id,
                    "signal_source": signal_source,
                },
                "output_snapshot": {
                    "module_id": module_id,
                    "unit_id": unit_id,
                    "mastery_score": serialized_unit_progress["mastery_score"],
                    "mastery_level": serialized_unit_progress["mastery_level"],
                    "attempts": serialized_unit_progress["attempts"],
                },
                "constraint_metadata": {
                    "previous_mastery_score": previous_mastery_score,
                },
            }
        )

    return {
        "unitProgress": serialized_unit_progress,
        "moduleProgress": serialized_module_progress,
        "learningSignal": serialized_signal,
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
            + int(progress.stagnated) * 20
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
    _learning_signal_log_store.clear()
