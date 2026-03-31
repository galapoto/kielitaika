from learning.decision_version import DECISION_VERSION
from learning.decision_weights import get_decision_weights
from learning.progress_service import (
    get_due_review_units,
    get_low_mastery_unit_ids,
    get_module_progress,
    get_recommendation_effectiveness_summary,
    get_recommendation_outcomes,
    register_recommendation_outcomes,
)
from learning.repository import repository
from yki.session_store import DEFAULT_USER_ID, get_progress_history

LEVEL_ORDER = ["A1", "A2", "B1", "B2", "C1", "C2"]


def get_level_rank(level: str | None):
    if level not in LEVEL_ORDER:
        return None
    return LEVEL_ORDER.index(level)


def get_level_distance(user_level: str | None, module_level: str):
    user_rank = get_level_rank(user_level)
    module_rank = get_level_rank(module_level)

    if user_rank is None or module_rank is None:
        return None

    return abs(user_rank - module_rank)


def _round_score(value: float):
    return round(value, 4)


def _clamp_score(value: float):
    return max(0.0, min(1.0, _round_score(value)))


def _normalize_count(count: int, total: int):
    if total <= 0:
        return 0.0
    return _clamp_score(count / total)


def build_suggestion_reason(
    module,
    matched_weaknesses,
    current_level: str | None,
    low_mastery_unit_ids,
    due_review_unit_ids,
    recent_mistake_unit_ids,
):
    if due_review_unit_ids:
        return "Recommended because review is due for this module."
    if recent_mistake_unit_ids:
        return "Recommended to repeat recent mistakes before they settle in."
    if low_mastery_unit_ids:
        return "Recommended to revisit units with low mastery in this module."
    if matched_weaknesses and module["level"] == current_level:
        return "Recommended for your current level and weak areas."
    if matched_weaknesses:
        return f"Recommended to target: {', '.join(matched_weaknesses)}."
    if module["level"] == current_level:
        return "Recommended for your current level."
    if current_level is None and module["level"] == "A1":
        return "Recommended as a starting point before progress data exists."
    return None


def resolve_difficulty_adjustment(
    *,
    current_level: str | None,
    module_level: str,
    matched_weaknesses,
    prioritized_unit_ids,
    review_due_unit_ids,
    regression_flag: bool,
):
    if regression_flag or review_due_unit_ids or prioritized_unit_ids:
        return "support_lowered"
    if matched_weaknesses:
        return "targeted_support"

    level_distance = get_level_distance(current_level, module_level)
    if current_level is None:
        return "baseline"
    if level_distance == 0:
        return "level_aligned"

    module_rank = get_level_rank(module_level)
    current_rank = get_level_rank(current_level)
    if module_rank is not None and current_rank is not None and module_rank > current_rank:
        return "stretch"
    return "review_aligned"


def get_difficulty_alignment_score(
    current_level: str | None,
    module_level: str,
    difficulty_adjustment: str,
):
    if current_level is None:
        return 0.25 if module_level == "A1" else 0.0

    level_distance = get_level_distance(current_level, module_level)
    if level_distance is None:
        return 0.0

    max_distance = max(1, len(LEVEL_ORDER) - 1)
    base_score = _clamp_score(1 - (level_distance / max_distance))

    if difficulty_adjustment == "support_lowered":
        return max(base_score, 0.85)
    if difficulty_adjustment == "targeted_support":
        return max(base_score, 0.75)
    if difficulty_adjustment == "stretch":
        return max(base_score, 0.6)
    if difficulty_adjustment == "level_aligned":
        return max(base_score, 0.9)
    return base_score


def build_weighted_score_breakdown(
    factor_scores: dict[str, float],
    weights: dict[str, float],
):
    breakdown = {}

    for factor_name, factor_score in factor_scores.items():
        weight = weights[factor_name]
        breakdown[factor_name] = {
            "factor_score": _round_score(factor_score),
            "weight": weight,
            "weighted_score": _round_score(factor_score * weight),
        }

    breakdown["final_score"] = _clamp_score(
        sum(item["weighted_score"] for item in breakdown.values())
    )
    return breakdown


def get_recommended_unit_ids(module):
    prioritized_unit_ids = list(
        dict.fromkeys(
            [
                *module["dueReviewUnitIds"],
                *module["lowMasteryUnitIds"],
                *module["regressionUnitIds"],
                *module["recentMistakeUnitIds"],
            ]
        )
    )
    if prioritized_unit_ids:
        return prioritized_unit_ids
    return module["unitIds"]


def score_module(
    module,
    weak_patterns,
    current_level: str | None,
    low_mastery_unit_ids,
    due_review_unit_ids,
    user_id: str,
    weight_overrides: dict | None = None,
):
    matched_weaknesses = [
        weak_pattern for weak_pattern in weak_patterns if weak_pattern in module["focusTags"]
    ]
    prioritized_unit_ids = [
        unit_id for unit_id in module["unitIds"] if unit_id in low_mastery_unit_ids
    ]
    module_progress = get_module_progress(module["id"], user_id)
    review_due_unit_ids = [
        unit_id for unit_id in module["unitIds"] if unit_id in due_review_unit_ids
    ]
    recent_mistake_unit_ids = [
        unit_id for unit_id in module_progress["recent_mistake_unit_ids"]
        if unit_id in module["unitIds"]
    ]
    regression_unit_ids = [
        item["unit_id"]
        for item in module_progress["unit_progress"]
        if item["unit_id"] in module["unitIds"] and item["regression_detected"]
    ]
    weakness_score = len(matched_weaknesses) * 10
    mastery_score = len(prioritized_unit_ids) * 15
    review_score = len(review_due_unit_ids) * 20
    recent_mistake_score = len(recent_mistake_unit_ids) * 12
    level_distance = get_level_distance(current_level, module["level"])
    level_score = 0

    if current_level is None:
        level_score = 3 if module["level"] == "A1" else 0
    elif level_distance is not None:
        level_score = max(0, 3 - level_distance)

    suggestion_score = weakness_score + mastery_score + review_score + recent_mistake_score + level_score
    difficulty_adjustment = resolve_difficulty_adjustment(
        current_level=current_level,
        module_level=module["level"],
        matched_weaknesses=matched_weaknesses,
        prioritized_unit_ids=prioritized_unit_ids,
        review_due_unit_ids=review_due_unit_ids,
        regression_flag=bool(regression_unit_ids),
    )
    weights = get_decision_weights(weight_overrides)
    factor_scores = {
        "weak_pattern": _normalize_count(len(matched_weaknesses), len(module["focusTags"])),
        "low_mastery": _normalize_count(len(prioritized_unit_ids), len(module["unitIds"])),
        "due_review": _normalize_count(len(review_due_unit_ids), len(module["unitIds"])),
        "regression": _normalize_count(len(regression_unit_ids), len(module["unitIds"])),
        "difficulty_alignment": get_difficulty_alignment_score(
            current_level,
            module["level"],
            difficulty_adjustment,
        ),
    }
    score_breakdown = build_weighted_score_breakdown(factor_scores, weights)
    suggestion_score = score_breakdown["final_score"]
    why_this_was_selected = {
        "decision_version": DECISION_VERSION,
        "weak_patterns_used": matched_weaknesses,
        "mastery_score_used": {
            "module_mastery_score": module_progress["mastery_score"],
            "low_mastery_unit_ids": prioritized_unit_ids,
        },
        "due_review_used": {
            "unit_ids": review_due_unit_ids,
            "count": len(review_due_unit_ids),
        },
        "regression_flag": bool(regression_unit_ids),
        "regression_unit_ids": regression_unit_ids,
        "difficulty_adjustment": difficulty_adjustment,
        "weights_used": weights,
    }

    return {
        **module,
        "moduleProgress": module_progress,
        "lowMasteryUnitIds": prioritized_unit_ids,
        "dueReviewUnitIds": review_due_unit_ids,
        "recentMistakeUnitIds": recent_mistake_unit_ids,
        "matchedWeaknesses": matched_weaknesses,
        "regressionUnitIds": regression_unit_ids,
        "suggested": (
            bool(matched_weaknesses)
            or bool(prioritized_unit_ids)
            or bool(review_due_unit_ids)
            or bool(recent_mistake_unit_ids)
            or bool(regression_unit_ids)
            or score_breakdown["final_score"] > 0
        ),
        "suggestionReason": build_suggestion_reason(
            module,
            matched_weaknesses,
            current_level,
            prioritized_unit_ids,
            review_due_unit_ids,
            recent_mistake_unit_ids,
        ),
        "whyThisWasSelected": why_this_was_selected,
        "scoreBreakdown": score_breakdown,
        "suggestionScore": suggestion_score,
    }


def list_modules_for_user(user_id: str = DEFAULT_USER_ID, weight_overrides: dict | None = None):
    progress = get_progress_history(user_id)
    weak_patterns = progress.get("weak_patterns", [])
    current_level = progress.get("current_level")
    low_mastery_unit_ids = set(get_low_mastery_unit_ids(user_id))
    due_review_unit_ids = {
        item["unit"]["id"] for item in get_due_review_units(user_id)
    }
    scored_modules = [
        score_module(
            module,
            weak_patterns,
            current_level,
            low_mastery_unit_ids,
            due_review_unit_ids,
            user_id,
            weight_overrides,
        )
        for module in repository.list_modules()
    ]
    scored_modules.sort(
        key=lambda module: (
            -module["suggestionScore"],
            get_level_rank(module["level"]) if get_level_rank(module["level"]) is not None else 99,
            module["title"],
        )
    )
    suggested_modules = [module for module in scored_modules if module["suggested"]][:3]
    for module in suggested_modules:
        register_recommendation_outcomes(
            user_id,
            module["id"],
            get_recommended_unit_ids(module),
            DECISION_VERSION,
            [
                factor_name
                for factor_name, values in module["scoreBreakdown"].items()
                if factor_name != "final_score" and values["factor_score"] > 0
            ],
            module["whyThisWasSelected"]["weights_used"],
        )

    return {
        "modules": scored_modules,
        "suggestedModules": suggested_modules,
        "currentLevel": current_level,
        "weakPatterns": weak_patterns,
        "lowMasteryUnitIds": list(low_mastery_unit_ids),
        "dueReviewUnitIds": list(due_review_unit_ids),
        "weightsUsed": get_decision_weights(weight_overrides),
        "decisionVersion": DECISION_VERSION,
    }


def get_user_learning_debug_state(user_id: str = DEFAULT_USER_ID, weight_overrides: dict | None = None):
    module_listing = list_modules_for_user(user_id, weight_overrides)
    unit_progress = []

    for unit_id in repository.units:
        unit = repository.get_unit(unit_id)
        progress = get_module_progress(unit["moduleIds"][0], user_id)["unit_progress"]
        unit_state = next((item for item in progress if item["unit_id"] == unit_id), None)
        if not unit or unit_state is None:
            continue

        unit_progress.append(
            {
                "unit": unit,
                "progress": unit_state,
            }
        )

    unit_progress.sort(key=lambda item: (item["unit"]["title"], item["unit"]["id"]))
    due_review_units = get_due_review_units(user_id)
    regression_flags = [
        {
            "unitId": item["unit"]["id"],
            "title": item["unit"]["title"],
            "previousMasteryScore": item["progress"]["previous_mastery_score"],
            "masteryScore": item["progress"]["mastery_score"],
        }
        for item in unit_progress
        if item["progress"]["regression_detected"]
    ]

    recommendation_reasoning = [
        {
            "moduleId": module["id"],
            "title": module["title"],
            "suggested": module["suggested"],
            "suggestionReason": module["suggestionReason"],
            "suggestionScore": module["suggestionScore"],
            "scoreBreakdown": module["scoreBreakdown"],
            "whyThisWasSelected": module["whyThisWasSelected"],
        }
        for module in module_listing["modules"]
    ]
    recommendation_outcomes = get_recommendation_outcomes(user_id)
    recommendation_effectiveness = get_recommendation_effectiveness_summary(user_id)

    return {
        "decisionVersion": DECISION_VERSION,
        "currentLevel": module_listing["currentLevel"],
        "weakPatterns": module_listing["weakPatterns"],
        "unitMastery": unit_progress,
        "dueReviewUnits": due_review_units,
        "regressionFlags": regression_flags,
        "recommendationReasoning": recommendation_reasoning,
        "recommendationOutcomes": recommendation_outcomes,
        "recommendationEffectiveness": recommendation_effectiveness,
        "improvementTrends": recommendation_effectiveness["improvementTrends"],
        "weightsUsed": module_listing["weightsUsed"],
    }


def get_unit(unit_id: str):
    return repository.get_unit(unit_id)


def get_related_units(unit_id: str):
    unit = repository.get_unit(unit_id)
    if not unit:
        return None

    return {
        "unit": unit,
        "relatedUnits": repository.get_related_units(unit_id),
    }
