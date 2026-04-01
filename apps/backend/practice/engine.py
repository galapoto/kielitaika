from utils.hash_utils import deterministic_hash


def build_exercise_catalog():
    exercises = [
        {
            "id": "daily-vocabulary-1",
            "type": "vocabulary_selection",
            "title": "Vocabulary Check",
            "prompt": "Choose the correct meaning of the Finnish word 'kirja'.",
            "options": ["book", "door", "window"],
            "expected_answer": "book",
            "explanation": "'Kirja' means 'book' in Finnish.",
            "input_mode": "choice",
        },
        {
            "id": "daily-sentence-1",
            "type": "sentence_completion",
            "title": "Sentence Completion",
            "prompt": "Complete the sentence: Huomenna mina ___ toihin aikaisin.",
            "options": [],
            "expected_answer": "menen",
            "explanation": "'Menen' is the correct first-person singular verb form for going.",
            "input_mode": "text",
        },
        {
            "id": "daily-grammar-1",
            "type": "grammar_selection",
            "title": "Grammar Selection",
            "prompt": "Choose the correct form: Me ___ kahvia aamulla.",
            "options": ["juomme", "juon", "juovat"],
            "expected_answer": "juomme",
            "explanation": "'Me' requires the plural first-person verb form 'juomme'.",
            "input_mode": "choice",
        },
    ]

    for exercise in exercises:
        exercise["deterministic_key"] = deterministic_hash(
            {
                "expected_answer": exercise["expected_answer"],
                "id": exercise["id"],
                "input_mode": exercise["input_mode"],
                "options": exercise["options"],
                "prompt": exercise["prompt"],
                "type": exercise["type"],
            }
        )

    return exercises


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
