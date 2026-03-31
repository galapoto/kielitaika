from learning.progress_service import get_due_review_units, get_low_mastery_unit_ids, get_module_progress
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


def score_module(
    module,
    weak_patterns,
    current_level: str | None,
    low_mastery_unit_ids,
    due_review_unit_ids,
    user_id: str,
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
    why_this_was_selected = {
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
            or level_score > 0
            or bool(prioritized_unit_ids)
            or bool(review_due_unit_ids)
            or bool(recent_mistake_unit_ids)
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
        "suggestionScoreBreakdown": {
            "weakness": weakness_score,
            "mastery": mastery_score,
            "review": review_score,
            "recentMistake": recent_mistake_score,
            "level": level_score,
            "total": suggestion_score,
        },
        "suggestionScore": suggestion_score,
    }


def list_modules_for_user(user_id: str = DEFAULT_USER_ID):
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

    return {
        "modules": scored_modules,
        "suggestedModules": suggested_modules,
        "currentLevel": current_level,
        "weakPatterns": weak_patterns,
        "lowMasteryUnitIds": list(low_mastery_unit_ids),
        "dueReviewUnitIds": list(due_review_unit_ids),
    }


def get_user_learning_debug_state(user_id: str = DEFAULT_USER_ID):
    module_listing = list_modules_for_user(user_id)
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
            "suggestionScoreBreakdown": module["suggestionScoreBreakdown"],
            "whyThisWasSelected": module["whyThisWasSelected"],
        }
        for module in module_listing["modules"]
    ]

    return {
        "currentLevel": module_listing["currentLevel"],
        "weakPatterns": module_listing["weakPatterns"],
        "unitMastery": unit_progress,
        "dueReviewUnits": due_review_units,
        "regressionFlags": regression_flags,
        "recommendationReasoning": recommendation_reasoning,
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
