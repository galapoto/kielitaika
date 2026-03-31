from learning.repository import repository
from learning.progress_service import get_due_review_units, get_low_mastery_unit_ids
from yki.session_store import DEFAULT_USER_ID, get_progress_history

LEVEL_ORDER = ["A1", "A2", "B1", "B2", "C1", "C2"]
SECTION_SEQUENCE = ["reading", "listening", "writing", "speaking"]
SECTION_TIME_LIMITS = {
    "reading": 180,
    "listening": 120,
    "writing": 300,
    "speaking": 90,
}


def get_level_rank(level: str | None):
    if level not in LEVEL_ORDER:
        return 0
    return LEVEL_ORDER.index(level)


def get_level_at_rank(rank: int):
    return LEVEL_ORDER[max(0, min(rank, len(LEVEL_ORDER) - 1))]


def get_difficulty_rank(value: str | None):
    return {"easy": 0, "medium": 1, "hard": 2}.get(value or "medium", 1)


def determine_preferred_difficulty(current_level: str, weak_patterns, due_review_unit_ids, low_mastery_unit_ids):
    if weak_patterns or due_review_unit_ids or low_mastery_unit_ids:
        return "easy"
    if get_level_rank(current_level) >= get_level_rank("B1"):
        return "hard"
    return "medium"


def build_adaptive_context(user_id: str = DEFAULT_USER_ID):
    progress_history = get_progress_history(user_id)
    weak_patterns = progress_history.get("weak_patterns", [])
    current_level = progress_history.get("current_level") or "A1"
    due_review_units = get_due_review_units(user_id)
    due_review_unit_ids = [item["unit"]["id"] for item in due_review_units]
    low_mastery_unit_ids = get_low_mastery_unit_ids(user_id)

    current_level_rank = get_level_rank(current_level)
    needs_support = bool(weak_patterns or due_review_unit_ids or low_mastery_unit_ids)
    practice_level = (
        get_level_at_rank(max(0, current_level_rank - 1))
        if needs_support
        else current_level
    )

    focus_areas = []
    focus_areas.extend(weak_patterns)
    focus_areas.extend(due_review_unit_ids[:2])
    focus_areas.extend(
        unit_id for unit_id in low_mastery_unit_ids[:2] if unit_id not in focus_areas
    )

    if not focus_areas:
        focus_areas = ["balanced_practice"]

    return {
        "currentLevel": current_level,
        "practiceLevel": practice_level,
        "preferredDifficulty": determine_preferred_difficulty(
            current_level,
            weak_patterns,
            due_review_unit_ids,
            low_mastery_unit_ids,
        ),
        "weakPatterns": weak_patterns,
        "dueReviewUnitIds": due_review_unit_ids,
        "lowMasteryUnitIds": low_mastery_unit_ids,
        "focusAreas": focus_areas,
    }


def _build_fallback_units(practice_level: str):
    practice_rank = get_level_rank(practice_level)
    candidates = [
        repository.get_unit(unit_id)
        for unit_id in repository.units
        if get_level_rank(repository.units[unit_id].level) <= practice_rank
    ]
    candidates = [item for item in candidates if item is not None]
    candidates.sort(key=lambda item: (get_level_rank(item["level"]), item["title"], item["id"]))
    return candidates


def select_practice_units(user_id: str = DEFAULT_USER_ID):
    context = build_adaptive_context(user_id)
    prioritized_ids = context["dueReviewUnitIds"] + [
        unit_id
        for unit_id in context["lowMasteryUnitIds"]
        if unit_id not in context["dueReviewUnitIds"]
    ]

    selected_units = []
    seen = set()

    for unit_id in prioritized_ids:
        unit = repository.get_unit(unit_id)
        if unit and unit_id not in seen:
            selected_units.append(unit)
            seen.add(unit_id)

    fallback_units = sorted(
        _build_fallback_units(context["practiceLevel"]),
        key=lambda unit: (
            abs(get_difficulty_rank(unit.get("difficultyLevel")) - get_difficulty_rank(context["preferredDifficulty"])),
            unit["id"],
        ),
    )

    for unit in fallback_units:
        if unit["id"] not in seen:
            selected_units.append(unit)
            seen.add(unit["id"])
        if len(selected_units) >= len(SECTION_SEQUENCE):
            break

    if len(selected_units) < len(SECTION_SEQUENCE):
        for unit in repository.list_modules()[0]["units"]:
            if unit["id"] not in seen:
                selected_units.append(unit)
                seen.add(unit["id"])
            if len(selected_units) >= len(SECTION_SEQUENCE):
                break

    return context, selected_units[: len(SECTION_SEQUENCE)]


def _normalize_choice(text: str):
    return text.strip().lower()


def _build_reading_task(unit: dict, index: int):
    related_units = [
        repository.get_unit(unit_id) for unit_id in unit["relatedUnitIds"][:2]
    ]
    related_titles = [item["title"] for item in related_units if item]
    options = [unit["title"], *related_titles]
    options = list(dict.fromkeys(options))
    options.sort(key=_normalize_choice)

    return {
        "id": f"practice-reading-{index}",
        "section": "reading",
        "type": "multiple_choice",
        "title": "Reading Drill",
        "prompt": f"Read: {unit['example']}",
        "question": f"Which topic best matches this short passage?",
        "options": options,
        "correctAnswer": unit["title"],
        "timeLimitSeconds": SECTION_TIME_LIMITS["reading"],
        "relatedLearningUnitId": unit["id"],
        "relatedModuleId": unit["moduleIds"][0],
    }


def _build_listening_task(unit: dict, index: int):
    module = repository.get_module(unit["moduleIds"][0])
    options = [unit["title"], module["title"], unit["kind"].capitalize()]
    options = list(dict.fromkeys(options))
    options.sort(key=_normalize_choice)

    return {
        "id": f"practice-listening-{index}",
        "section": "listening",
        "type": "tts_choice",
        "title": "Listening Drill",
        "ttsPrompt": unit["example"],
        "question": "Which keyword best matches the spoken prompt?",
        "options": options,
        "correctAnswer": unit["title"],
        "timeLimitSeconds": SECTION_TIME_LIMITS["listening"],
        "relatedLearningUnitId": unit["id"],
        "relatedModuleId": unit["moduleIds"][0],
    }


def _build_writing_task(unit: dict, index: int):
    keywords = [unit["title"].split()[0], unit["kind"], unit["level"]]
    return {
        "id": f"practice-writing-{index}",
        "section": "writing",
        "type": "guided_text",
        "title": "Writing Drill",
        "prompt": f"Write 2-3 sentences using the idea '{unit['title']}'.",
        "guidance": unit["summary"],
        "keywords": keywords,
        "timeLimitSeconds": SECTION_TIME_LIMITS["writing"],
        "relatedLearningUnitId": unit["id"],
        "relatedModuleId": unit["moduleIds"][0],
    }


def _build_speaking_task(unit: dict, index: int):
    keywords = [unit["title"].split()[0], unit["kind"]]
    return {
        "id": f"practice-speaking-{index}",
        "section": "speaking",
        "type": "timed_response",
        "title": "Speaking Drill",
        "prompt": f"Give a short spoken-style answer about '{unit['title']}'.",
        "guidance": unit["example"],
        "keywords": keywords,
        "timeLimitSeconds": SECTION_TIME_LIMITS["speaking"],
        "relatedLearningUnitId": unit["id"],
        "relatedModuleId": unit["moduleIds"][0],
    }


def build_practice_tasks(user_id: str = DEFAULT_USER_ID):
    context, units = select_practice_units(user_id)
    builders = [
        _build_reading_task,
        _build_listening_task,
        _build_writing_task,
        _build_speaking_task,
    ]
    tasks = [builder(unit, index) for index, (builder, unit) in enumerate(zip(builders, units), start=1)]
    return context, tasks
