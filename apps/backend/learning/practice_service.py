from learning.graph_service import list_modules_for_user
from learning.progress_service import get_unit_progress
from learning.models import GrammarUnit, PhraseUnit, VocabularyUnit
from learning.repository import repository
from yki.contracts import DEFAULT_USER_ID

GRAMMAR_PRACTICE_TEMPLATES = {
    "grammar-verb-present": {
        "fill_blank": {
            "question": "Mina ___ Helsingissa.",
            "correct_answer": "asun",
        },
        "sentence_correction": {
            "question": "Correct the sentence: Mina asua Helsingissa.",
            "correct_answer": "Mina asun Helsingissa.",
        },
    },
    "grammar-time-adverbs": {
        "fill_blank": {
            "question": "Heraan ___ aikaisin.",
            "correct_answer": "aamulla",
        },
        "sentence_correction": {
            "question": "Correct the sentence: Mina lepaan ilta kotona.",
            "correct_answer": "Mina lepaan illalla kotona.",
        },
    },
    "grammar-local-cases": {
        "fill_blank": {
            "question": "Menen ___ lukemaan.",
            "correct_answer": "kirjastoon",
        },
        "sentence_correction": {
            "question": "Correct the sentence: Kirjasto on asema vieressa.",
            "correct_answer": "Kirjasto on aseman vieressa.",
        },
    },
    "grammar-question-forms": {
        "fill_blank": {
            "question": "___ asema on?",
            "correct_answer": "Missa",
        },
        "sentence_correction": {
            "question": "Correct the sentence: Missa on asema.",
            "correct_answer": "Missa asema on?",
        },
    },
    "grammar-object-cases": {
        "fill_blank": {
            "question": "Lahetin ___ opettajalle.",
            "correct_answer": "sahkopostin",
        },
        "sentence_correction": {
            "question": "Correct the sentence: En lahetin sahkopostin.",
            "correct_answer": "En lahettanyt sahkopostia.",
        },
    },
    "grammar-conjunctions": {
        "fill_blank": {
            "question": "Minulla on iltavuoro, ___ en ehdi kokoukseen.",
            "correct_answer": "joten",
        },
        "sentence_correction": {
            "question": "Correct the sentence: Opiskelen iltaisin paivalla olen toissa.",
            "correct_answer": "Opiskelen iltaisin, koska paivalla olen toissa.",
        },
    },
}

PHRASE_COMPLETION_TARGETS = {
    "phrase-heraan-aamulla": "kuusi",
    "phrase-asun-helsingissa": "keskustassa",
    "phrase-missa-asema-on": "asema",
    "phrase-kirjasto-on-lahella": "vieressa",
    "phrase-voinko-siirtaa-kokousta": "huomiseen",
    "phrase-lahetin-sahkopostin": "opettajalle",
    "phrase-minulla-on-iltavuoro": "kokoukseen",
}


def build_exercise(
    *,
    exercise_id: str,
    exercise_type: str,
    question: str,
    correct_answer: str,
    unit_id: str,
    unit_kind: str,
    module_id: str,
    input_mode: str,
    options=None,
):
    return {
        "id": exercise_id,
        "type": exercise_type,
        "question": question,
        "correct_answer": correct_answer,
        "unit_id": unit_id,
        "unit_kind": unit_kind,
        "module_id": module_id,
        "input_mode": input_mode,
        "options": options or [],
    }


def get_module_unit_objects(module_id: str):
    module = repository.modules.get(module_id)
    if not module:
        return None
    return [repository.units[unit_id] for unit_id in module.unit_ids]


def rotate_options(options, unit_id: str):
    if not options:
        return []
    rotation = sum(ord(char) for char in unit_id) % len(options)
    return options[rotation:] + options[:rotation]


def resolve_unit_difficulty(unit):
    return repository.resolve_difficulty_level(unit)


def get_difficulty_rank(difficulty_level: str):
    return {"easy": 0, "medium": 1, "hard": 2}.get(difficulty_level, 1)


def get_preferred_difficulty(unit_objects, user_id: str):
    attempted_progress = []

    for unit in unit_objects:
        progress = get_unit_progress(unit.id, user_id)
        if progress and progress["attempts"] > 0:
            attempted_progress.append(progress)

    if not attempted_progress:
        return "medium"

    average_mastery = sum(item["mastery_score"] for item in attempted_progress) / len(attempted_progress)

    if average_mastery < 0.4:
        return "easy"
    if average_mastery > 0.7:
        return "hard"
    return "medium"


def sort_unit_objects_for_user(unit_objects, user_id: str):
    preferred_difficulty = get_preferred_difficulty(unit_objects, user_id)
    preferred_rank = get_difficulty_rank(preferred_difficulty)

    def sort_key(unit):
        rank = get_difficulty_rank(resolve_unit_difficulty(unit))
        if preferred_difficulty == "hard":
            return (abs(rank - preferred_rank), -rank, unit.id)
        if preferred_difficulty == "easy":
            return (abs(rank - preferred_rank), rank, unit.id)
        return (abs(rank - preferred_rank), rank, unit.id)

    return sorted(unit_objects, key=sort_key)


def build_phrase_options(unit: PhraseUnit):
    same_module = [
        phrase.finnish
        for phrase in repository.phrase_units.values()
        if phrase.id != unit.id and any(module_id in unit.module_ids for module_id in phrase.module_ids)
    ]
    global_fallback = [
        phrase.finnish for phrase in repository.phrase_units.values() if phrase.id != unit.id
    ]

    distractors = []
    for phrase_text in same_module + global_fallback:
        if phrase_text not in distractors:
            distractors.append(phrase_text)
        if len(distractors) == 2:
            break

    return rotate_options([unit.finnish, *distractors], unit.id)


def generate_vocabulary_exercises(unit: VocabularyUnit):
    primary_module_id = unit.module_ids[0]
    return [
        build_exercise(
            exercise_id=f"{unit.id}-word-to-translation",
            exercise_type="word_to_translation",
            question=f"What is the English translation of '{unit.finnish}'?",
            correct_answer=unit.english,
            unit_id=unit.id,
            unit_kind="vocabulary",
            module_id=primary_module_id,
            input_mode="text",
        ),
        build_exercise(
            exercise_id=f"{unit.id}-translation-to-word",
            exercise_type="translation_to_word",
            question=f"What is the Finnish word for '{unit.english}'?",
            correct_answer=unit.finnish,
            unit_id=unit.id,
            unit_kind="vocabulary",
            module_id=primary_module_id,
            input_mode="text",
        ),
    ]


def generate_grammar_exercises(unit: GrammarUnit):
    template = GRAMMAR_PRACTICE_TEMPLATES[unit.id]
    primary_module_id = unit.module_ids[0]
    return [
        build_exercise(
            exercise_id=f"{unit.id}-fill-blank",
            exercise_type="fill_blank",
            question=template["fill_blank"]["question"],
            correct_answer=template["fill_blank"]["correct_answer"],
            unit_id=unit.id,
            unit_kind="grammar",
            module_id=primary_module_id,
            input_mode="text",
        ),
        build_exercise(
            exercise_id=f"{unit.id}-sentence-correction",
            exercise_type="sentence_correction",
            question=template["sentence_correction"]["question"],
            correct_answer=template["sentence_correction"]["correct_answer"],
            unit_id=unit.id,
            unit_kind="grammar",
            module_id=primary_module_id,
            input_mode="text",
        ),
    ]


def generate_phrase_exercises(unit: PhraseUnit):
    primary_module_id = unit.module_ids[0]
    missing_word = PHRASE_COMPLETION_TARGETS[unit.id]
    completion_question = unit.finnish.replace(missing_word, "___", 1)

    return [
        build_exercise(
            exercise_id=f"{unit.id}-complete-sentence",
            exercise_type="complete_sentence",
            question=f"Complete the phrase: {completion_question}",
            correct_answer=missing_word,
            unit_id=unit.id,
            unit_kind="phrase",
            module_id=primary_module_id,
            input_mode="text",
        ),
        build_exercise(
            exercise_id=f"{unit.id}-choose-correct-phrase",
            exercise_type="choose_correct_phrase",
            question=f"Choose the Finnish phrase that matches: {unit.english}",
            correct_answer=unit.finnish,
            unit_id=unit.id,
            unit_kind="phrase",
            module_id=primary_module_id,
            input_mode="choice",
            options=build_phrase_options(unit),
        ),
    ]


def generate_exercises_for_unit(unit):
    if isinstance(unit, VocabularyUnit):
        return generate_vocabulary_exercises(unit)
    if isinstance(unit, GrammarUnit):
        return generate_grammar_exercises(unit)
    if isinstance(unit, PhraseUnit):
        return generate_phrase_exercises(unit)
    return []


def build_practice_bundle(module, exercises, source, recommendation=None):
    return {
        "module": {
            "id": module["id"],
            "title": module["title"],
            "level": module["level"],
            "focusTags": module["focusTags"],
        },
        "source": source,
        "recommendation": recommendation,
        "exerciseCount": len(exercises),
        "exercises": exercises,
    }


def prioritize_review_exercises(exercises, prioritized_unit_ids):
    if not prioritized_unit_ids:
        return exercises

    priority_index = {unit_id: index for index, unit_id in enumerate(prioritized_unit_ids)}
    return sorted(
        exercises,
        key=lambda exercise: (
            priority_index.get(exercise["unit_id"], len(priority_index)),
            exercise["unit_id"],
            exercise["id"],
        ),
    )


def generate_practice(module_id: str, user_id: str = DEFAULT_USER_ID):
    module = repository.get_module(module_id)
    unit_objects = get_module_unit_objects(module_id)
    if not module or unit_objects is None:
        return None

    exercises = []
    for unit in sort_unit_objects_for_user(unit_objects, user_id):
        exercises.extend(generate_exercises_for_unit(unit))

    return build_practice_bundle(module, exercises, "module")


def generate_practice_from_weakness(user_id: str = DEFAULT_USER_ID):
    modules_data = list_modules_for_user(user_id)
    suggested_modules = modules_data.get("suggestedModules", [])
    selected_module = suggested_modules[0] if suggested_modules else modules_data["modules"][0]
    practice = generate_practice(selected_module["id"], user_id)

    if not practice:
        return None

    practice["source"] = "recommended"
    prioritized_unit_ids = (
        selected_module.get("dueReviewUnitIds", [])
        + [
            unit_id
            for unit_id in selected_module.get("lowMasteryUnitIds", [])
            if unit_id not in selected_module.get("dueReviewUnitIds", [])
        ]
    )
    practice["exercises"] = prioritize_review_exercises(practice["exercises"], prioritized_unit_ids)
    practice["recommendation"] = {
        "reason": selected_module.get("suggestionReason"),
        "weakPatterns": modules_data.get("weakPatterns", []),
        "currentLevel": modules_data.get("currentLevel"),
        "matchedWeaknesses": selected_module.get("matchedWeaknesses", []),
        "prioritizedUnitIds": prioritized_unit_ids,
        "dueReviewUnitIds": selected_module.get("dueReviewUnitIds", []),
    }
    return practice
