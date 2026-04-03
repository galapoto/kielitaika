from learning.policy_engine import build_deterministic_seed, deterministic_order_key
from learning.practice_service import generate_exercises_for_unit
from learning.repository import repository
from utils.hash_utils import deterministic_hash

DAILY_PRACTICE_SESSION_SIZE = 3


def _exercise_title(exercise):
    title_map = {
        "word_to_translation": "Vocabulary Check",
        "translation_to_word": "Translation Recall",
        "fill_blank": "Grammar Fill-In",
        "sentence_correction": "Sentence Correction",
        "complete_sentence": "Phrase Completion",
        "choose_correct_phrase": "Phrase Match",
    }
    return title_map.get(exercise["type"], "Daily Practice")


def _exercise_explanation(exercise):
    return f"Expected answer: {exercise['correct_answer']}"


def _normalize_exercise(exercise):
    payload = {
        "id": f"daily-{exercise['id']}",
        "type": exercise["type"],
        "title": _exercise_title(exercise),
        "prompt": exercise["question"],
        "options": list(exercise.get("options") or []),
        "expected_answer": exercise["correct_answer"],
        "explanation": _exercise_explanation(exercise),
        "input_mode": exercise["input_mode"],
        "unit_id": exercise["unit_id"],
        "unit_kind": exercise["unit_kind"],
        "module_id": exercise["module_id"],
    }
    payload["deterministic_key"] = deterministic_hash(
        {
            "expected_answer": payload["expected_answer"],
            "id": payload["id"],
            "input_mode": payload["input_mode"],
            "module_id": payload["module_id"],
            "options": payload["options"],
            "prompt": payload["prompt"],
            "type": payload["type"],
            "unit_id": payload["unit_id"],
            "unit_kind": payload["unit_kind"],
        }
    )
    return payload


def _build_candidate_catalog():
    catalog = []
    for unit_id in sorted(repository.units):
        unit = repository.units[unit_id]
        for exercise in generate_exercises_for_unit(unit):
            catalog.append(_normalize_exercise(exercise))
    return catalog


def _select_session_exercises(catalog, *, session_seed: str, limit: int, avoid_ids: set[str] | None = None):
    avoid_ids = avoid_ids or set()
    ranked = sorted(
        catalog,
        key=lambda exercise: (
            exercise["id"] in avoid_ids,
            deterministic_order_key(session_seed, exercise["id"]),
            exercise["id"],
        ),
    )

    selected = []
    selected_ids = set()
    seen_unit_ids = set()
    seen_kinds = set()

    for exercise in ranked:
        if exercise["id"] in selected_ids or exercise["unit_id"] in seen_unit_ids:
            continue
        if exercise["unit_kind"] in seen_kinds:
            continue
        selected.append(exercise)
        selected_ids.add(exercise["id"])
        seen_unit_ids.add(exercise["unit_id"])
        seen_kinds.add(exercise["unit_kind"])
        if len(selected) >= limit:
            return selected

    for exercise in ranked:
        if exercise["id"] in selected_ids or exercise["unit_id"] in seen_unit_ids:
            continue
        selected.append(exercise)
        selected_ids.add(exercise["id"])
        seen_unit_ids.add(exercise["unit_id"])
        if len(selected) >= limit:
            return selected

    return selected


def build_exercise_catalog(session_id: str | None = None, avoid_ids=None):
    session_seed = build_deterministic_seed("daily-practice-session", session_id or "preview")
    return _select_session_exercises(
        _build_candidate_catalog(),
        session_seed=session_seed,
        limit=DAILY_PRACTICE_SESSION_SIZE,
        avoid_ids=set(avoid_ids or []),
    )


def normalize_answer(answer):
    if isinstance(answer, str):
        return answer.strip()
    return ""


def evaluate_exercise_answer(exercise, answer):
    normalized_answer = normalize_answer(answer)

    if exercise["input_mode"] == "text":
        is_correct = normalized_answer.casefold() == exercise["expected_answer"].casefold()
    else:
        is_correct = normalized_answer == exercise["expected_answer"]

    return {
        "correct": is_correct,
        "expected_answer": exercise["expected_answer"],
        "explanation": exercise.get("explanation"),
        "submitted_answer": normalized_answer,
    }
