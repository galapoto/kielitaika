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


def build_suggestion_reason(module, matched_weaknesses, current_level: str | None):
    if matched_weaknesses and module["level"] == current_level:
        return "Recommended for your current level and weak areas."
    if matched_weaknesses:
        return f"Recommended to target: {', '.join(matched_weaknesses)}."
    if module["level"] == current_level:
        return "Recommended for your current level."
    if current_level is None and module["level"] == "A1":
        return "Recommended as a starting point before progress data exists."
    return None


def score_module(module, weak_patterns, current_level: str | None):
    matched_weaknesses = [
        weak_pattern for weak_pattern in weak_patterns if weak_pattern in module["focusTags"]
    ]
    weakness_score = len(matched_weaknesses) * 10
    level_distance = get_level_distance(current_level, module["level"])
    level_score = 0

    if current_level is None:
        level_score = 3 if module["level"] == "A1" else 0
    elif level_distance is not None:
        level_score = max(0, 3 - level_distance)

    suggestion_score = weakness_score + level_score

    return {
        **module,
        "matchedWeaknesses": matched_weaknesses,
        "suggested": bool(matched_weaknesses) or level_score > 0,
        "suggestionReason": build_suggestion_reason(module, matched_weaknesses, current_level),
        "suggestionScore": suggestion_score,
    }


def list_modules_for_user(user_id: str = DEFAULT_USER_ID):
    progress = get_progress_history(user_id)
    weak_patterns = progress.get("weak_patterns", [])
    current_level = progress.get("current_level")
    scored_modules = [
        score_module(module, weak_patterns, current_level)
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
