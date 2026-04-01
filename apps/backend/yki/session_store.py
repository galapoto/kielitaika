import re
import uuid
from datetime import datetime, timedelta

from yki.ai_evaluation import TEXT_CRITERIA, fetch_ai_text_evaluation
from yki.storage import InMemorySessionStorage, RedisSessionStorage

SECTION_ORDER = ["reading", "listening", "writing", "speaking"]
SECTION_TIME_LIMITS = {
    "reading": 20,
    "listening": 20,
    "writing": 30,
    "speaking": 30,
}
LEVEL_MAPPING = {
    0: "A1",
    1: "A1",
    2: "A2",
    3: "B1",
    4: "B2",
    5: "C1/C2",
}
DEFAULT_TARGET_LEVEL_SCORE = 3
ADAPTIVE_CRITERIA_ORDER = [
    "content",
    "clarity",
    "relevance",
    "language_accuracy",
    "fluency",
    "pronunciation",
]
ADAPTIVE_SUGGESTION_MAP = {
    "content": "Practice giving fuller answers with key details, examples, and supporting ideas.",
    "clarity": "Practice organizing responses into a clear beginning, middle, and end.",
    "relevance": "Focus on answering the exact question asked before adding extra details.",
    "language_accuracy": "Practice sentence structure, grammar, and punctuation in short daily drills.",
    "fluency": "Practice speaking in longer uninterrupted stretches to build fluency.",
    "pronunciation": "Practice listening and repeating short phrases to improve pronunciation control.",
}
ADAPTIVE_MAINTENANCE_SUGGESTION = (
    "Performance is stable across criteria. Maintain it with full mock exams and varied topic practice."
)
REALISM_WARNING_THRESHOLD_SECONDS = 300
LISTENING_PLAYBACK_LIMIT = 1
WRITING_MINIMUM_WORDS = 80
WRITING_RECOMMENDED_MAX_WORDS = 180
SPEAKING_MAX_RECORDING_SECONDS = 30
DEFAULT_USER_ID = "local-user"
ENGINE_STATE_SOURCE_PATH = "/api/v1/yki/sessions/{session_id}"
storage = InMemorySessionStorage()
try:
    storage = RedisSessionStorage()
except Exception:
    storage = InMemorySessionStorage()


def create_session():
    session_id = str(uuid.uuid4())
    now = datetime.utcnow()

    session = {
        "sessionId": session_id,
        "userId": DEFAULT_USER_ID,
        "status": "active",
        "createdAt": now.isoformat(),
        "timing": {
            "startedAt": now.isoformat(),
            "expiresAt": (now + timedelta(minutes=120)).isoformat(),
        },
        "targetLevelScore": DEFAULT_TARGET_LEVEL_SCORE,
        "certificate": None,
        "learning_feedback": None,
        "runtime": {
            "engineDrivenUi": True,
            "navigationLocked": True,
            "sectionLocking": True,
            "warningThresholdSeconds": REALISM_WARNING_THRESHOLD_SECONDS,
            "listening": {
                "playbackLimit": LISTENING_PLAYBACK_LIMIT,
            },
            "writing": {
                "minimumWords": WRITING_MINIMUM_WORDS,
                "recommendedMaxWords": WRITING_RECOMMENDED_MAX_WORDS,
            },
            "speaking": {
                "maxRecordingSeconds": SPEAKING_MAX_RECORDING_SECONDS,
            },
        },
        "progress": {
            "currentSection": SECTION_ORDER[0],
            "completedSections": [],
        },
        "sections": {
            "reading": {
                "tasks": [],
                "currentTaskIndex": 0,
                "startedAt": None,
                "expiresAt": None,
            },
            "listening": {
                "tasks": [],
                "currentTaskIndex": 0,
                "startedAt": None,
                "expiresAt": None,
            },
            "writing": {
                "tasks": [],
                "currentTaskIndex": 0,
                "startedAt": None,
                "expiresAt": None,
            },
            "speaking": {
                "tasks": [],
                "currentTaskIndex": 0,
                "startedAt": None,
                "expiresAt": None,
            },
        },
    }

    initialize_section_runtime(session, SECTION_ORDER[0], now=now)
    storage.create(session)
    return session


def get_session(session_id: str):
    session = storage.get(session_id)
    if session:
        return session

    meta = storage.get_meta(session_id)
    if meta:
        return {"error": "SESSION_EXPIRED"}

    return {"error": "SESSION_NOT_FOUND"}


def resume_session(session_id: str):
    session = get_session(session_id)
    if isinstance(session, dict) and "error" in session:
        return session

    if is_session_expired(session):
        return {"error": "SESSION_EXPIRED"}

    session = ensure_completion_artifacts(session_id, session)
    if isinstance(session, dict) and "error" in session:
        return {"error": "EXAM_NOT_FINISHED"}

    current_section = session["progress"]["currentSection"]
    current_task_id = None

    if current_section:
        section_data = session["sections"][current_section]
        current_task_index = section_data["currentTaskIndex"]
        tasks = section_data["tasks"]

        if current_task_index < len(tasks):
            current_task_id = tasks[current_task_index]["id"]

    return {
        "sessionId": session["sessionId"],
        "currentSection": current_section,
        "currentTaskId": current_task_id,
        "sectionProgress": session["sections"],
        "timing": session["timing"],
        "certificate": session.get("certificate"),
        "learning_feedback": session.get("learning_feedback"),
        "runtime": session.get("runtime"),
        "progressHistory": get_history_overview(session["userId"]),
    }


def generate_mock_tasks(section_name: str):
    if section_name == "reading":
        return [
            {
                "id": "reading-passage-1",
                "kind": "passage",
                "section": "reading",
                "status": "pending",
                "title": "Reading Passage",
                "prompt": "Read the passage fully before the question phase begins.",
                "instructions": [
                    "No questions are shown during the passage phase.",
                    "Use Next to move from the passage into the question flow.",
                ],
                "passage": (
                    "Tyopaikalla suunnitellaan yhteista kielipaivaa, jossa jokainen tyontekija "
                    "esittelee yhden tavan harjoitella suomea arjessa. Esihenkilo toivoo, etta "
                    "paivan aikana kerataan ehdotuksia, joita voidaan kayttaa uusien "
                    "tyontekijoiden perehdytyksessa."
                ),
                "timeLimitSeconds": SECTION_TIME_LIMITS["reading"] * 60,
            },
            {
                "id": "reading-question-1",
                "kind": "question",
                "section": "reading",
                "status": "pending",
                "title": "Reading Question 1",
                "prompt": "Choose the best answer based on the passage.",
                "question": "What is the main goal of the language day?",
                "options": [
                    "To collect practical Finnish-learning ideas for onboarding.",
                    "To test every employee on grammar rules.",
                    "To replace onboarding with self-study only.",
                ],
                "correctAnswer": "To collect practical Finnish-learning ideas for onboarding.",
                "timeLimitSeconds": SECTION_TIME_LIMITS["reading"] * 60,
            },
            {
                "id": "reading-question-2",
                "kind": "question",
                "section": "reading",
                "status": "pending",
                "title": "Reading Question 2",
                "prompt": "Choose the best answer based on the passage.",
                "question": "Who wants the suggestions to be collected?",
                "options": [
                    "A new employee",
                    "The supervisor",
                    "An external examiner",
                ],
                "correctAnswer": "The supervisor",
                "timeLimitSeconds": SECTION_TIME_LIMITS["reading"] * 60,
            },
        ]

    if section_name == "listening":
        return [
            {
                "id": "listening-prompt-1",
                "kind": "listening_prompt",
                "section": "listening",
                "status": "pending",
                "title": "Listening Prompt",
                "prompt": "Listen to the prompt before the question phase begins.",
                "instructions": [
                    "Questions remain hidden until you move forward from this prompt screen.",
                    "Playback is engine-limited and cannot be reset.",
                ],
                "audioPrompt": "A caller asks to move a meeting because the train is delayed.",
                "playbackCount": 0,
                "playbackLimit": LISTENING_PLAYBACK_LIMIT,
                "timeLimitSeconds": SECTION_TIME_LIMITS["listening"] * 60,
            },
            {
                "id": "listening-question-1",
                "kind": "question",
                "section": "listening",
                "status": "pending",
                "title": "Listening Question 1",
                "prompt": "Choose the best answer based on the audio prompt.",
                "question": "Why is the meeting being changed?",
                "options": [
                    "The speaker is sick.",
                    "The train is delayed.",
                    "The office is closed.",
                ],
                "correctAnswer": "The train is delayed.",
                "timeLimitSeconds": SECTION_TIME_LIMITS["listening"] * 60,
            },
            {
                "id": "listening-question-2",
                "kind": "question",
                "section": "listening",
                "status": "pending",
                "title": "Listening Question 2",
                "prompt": "Choose the best answer based on the audio prompt.",
                "question": "What does the caller want to do?",
                "options": [
                    "Cancel the meeting completely.",
                    "Move the meeting to a later time.",
                    "Invite more people to the meeting.",
                ],
                "correctAnswer": "Move the meeting to a later time.",
                "timeLimitSeconds": SECTION_TIME_LIMITS["listening"] * 60,
            },
        ]

    if section_name == "writing":
        return [
            {
                "id": "writing-prompt-1",
                "kind": "writing_prompt",
                "section": "writing",
                "status": "pending",
                "title": "Writing Instructions",
                "prompt": "Read the task instructions before opening the writing response screen.",
                "instructions": [
                    f"Write at least {WRITING_MINIMUM_WORDS} words.",
                    f"Aim to stay within {WRITING_RECOMMENDED_MAX_WORDS} words.",
                ],
                "question": "Write an email to your teacher explaining why you need to move a lesson.",
                "timeLimitSeconds": SECTION_TIME_LIMITS["writing"] * 60,
            },
            {
                "id": "writing-response-1",
                "kind": "writing_response",
                "section": "writing",
                "type": "writing",
                "answer": None,
                "status": "pending",
                "evaluation": None,
                "title": "Writing Response",
                "prompt": "Write your response for the task below.",
                "question": "Write an email to your teacher explaining why you need to move a lesson.",
                "minimumWords": WRITING_MINIMUM_WORDS,
                "recommendedMaxWords": WRITING_RECOMMENDED_MAX_WORDS,
                "timeLimitSeconds": SECTION_TIME_LIMITS["writing"] * 60,
            },
        ]

    if section_name == "speaking":
        return [
            {
                "id": "speaking-prompt-1",
                "kind": "speaking_prompt",
                "section": "speaking",
                "status": "pending",
                "title": "Speaking Instructions",
                "prompt": "Read the speaking task before opening the response screen.",
                "instructions": [
                    "Plan the response briefly, then record once you are ready.",
                    "When you stop recording, the response is submitted immediately.",
                ],
                "question": "Describe a work situation where clear communication prevented a problem.",
                "timeLimitSeconds": SECTION_TIME_LIMITS["speaking"] * 60,
            },
            {
                "id": "speaking-response-1",
                "kind": "speaking_response",
                "section": "speaking",
                "type": "speaking",
                "audio": None,
                "status": "pending",
                "evaluation": None,
                "title": "Speaking Response",
                "prompt": "Record your spoken response for the task below.",
                "question": "Describe a work situation where clear communication prevented a problem.",
                "maxDurationSeconds": SPEAKING_MAX_RECORDING_SECONDS,
                "timeLimitSeconds": SECTION_TIME_LIMITS["speaking"] * 60,
            }
        ]

    return []


def initialize_section_runtime(session, section_name: str, now=None):
    current_time = now or datetime.utcnow()
    section = session["sections"][section_name]

    if not section["tasks"]:
        section["tasks"] = generate_mock_tasks(section_name)

    section["currentTaskIndex"] = 0
    section["startedAt"] = current_time.isoformat()
    section["expiresAt"] = (
        current_time + timedelta(minutes=SECTION_TIME_LIMITS[section_name])
    ).isoformat()


def is_answerable_task(task):
    return task.get("kind") in {"question", "writing_response", "speaking_response"}


def is_display_only_task(task):
    return task.get("kind") in {
        "passage",
        "listening_prompt",
        "writing_prompt",
        "speaking_prompt",
    }


def build_empty_answer_evaluation(task):
    if task.get("kind") == "speaking_response":
        return {
            "score": 0,
            "maxScore": 5,
            "criteria": criteria_scores_to_list(
                {
                    "content": 0,
                    "clarity": 0,
                    "fluency": 0,
                    "pronunciation": 0,
                    "relevance": 0,
                }
            ),
            "feedback": "No audio response was submitted before the step was skipped.",
            "evaluation_mode": "structural_audio",
        }

    return {
        "score": 0,
        "maxScore": 5,
        "criteria": criteria_scores_to_list(
            {
                "content": 0,
                "clarity": 0,
                "relevance": 0,
                "language_accuracy": 0,
            }
        ),
        "feedback": "No written response was submitted before the step was skipped.",
        "evaluation_mode": "rule_based_text_v1",
    }


def mark_task_skipped(task):
    task["status"] = "answered"
    task["skipped"] = True
    if task.get("kind") == "speaking_response":
        task["audio"] = None
    else:
        task["answer"] = ""
    task["evaluation"] = build_empty_answer_evaluation(task)


def is_section_complete(session, section_name: str):
    tasks = session["sections"][section_name]["tasks"]
    return all(task.get("status") in {"answered", "completed"} for task in tasks)


def create_evaluation():
    return {
        "score": None,
        "maxScore": 5,
        "criteria": [],
        "feedback": None,
    }


def clamp_score(value: int):
    return max(0, min(5, value))


def criteria_scores_to_list(criteria_scores):
    return [{"name": name, "score": score} for name, score in criteria_scores.items()]


def average_criteria_score(criteria_scores):
    return round(sum(criteria_scores.values()) / len(criteria_scores))


def build_feedback(criteria_scores, feedback_map):
    weak_criteria = [
        name for name, score in criteria_scores.items() if score <= 2 and name in feedback_map
    ]

    if not weak_criteria:
        return "Response is complete, clear, and relevant across the evaluated criteria."

    ordered_feedback = []
    for criterion in weak_criteria:
        message = feedback_map[criterion]
        if message not in ordered_feedback:
            ordered_feedback.append(message)

    return " ".join(ordered_feedback)


def score_text_content(answer: str):
    word_count = len(answer.split())

    if word_count == 0:
        return 0
    if word_count <= 3:
        return 1
    if word_count <= 8:
        return 2
    if word_count <= 16:
        return 3
    if word_count <= 30:
        return 4
    return 5


def score_text_clarity(answer: str):
    sentences = [part.strip() for part in re.split(r"[.!?]+", answer) if part.strip()]
    word_count = len(answer.split())

    if word_count == 0:
        return 0
    if word_count <= 4:
        return 1
    if not sentences:
        return 2
    if len(sentences) == 1 and word_count < 12:
        return 2
    if len(sentences) == 1:
        return 3
    if len(sentences) == 2:
        return 4
    return 5


def score_text_relevance(answer: str):
    lowered = answer.lower()
    unique_words = {
        token for token in re.findall(r"[a-zA-ZåäöÅÄÖ]+", lowered) if len(token) >= 4
    }

    if not answer.strip():
        return 0
    if len(unique_words) <= 1:
        return 1
    if len(unique_words) <= 3:
        return 2
    if len(unique_words) <= 5:
        return 3
    if len(unique_words) <= 8:
        return 4
    return 5


def score_text_language_accuracy(answer: str):
    word_count = len(answer.split())
    punctuation_count = len(re.findall(r"[.!?,;:]", answer))
    has_sentence_case = bool(re.search(r"(?:^|[.!?]\s+)[A-ZÅÄÖ]", answer))

    if word_count == 0:
        return 0
    if word_count <= 3:
        return 1
    base_score = 2
    if punctuation_count >= 1:
        base_score += 1
    if punctuation_count >= 2 or has_sentence_case:
        base_score += 1
    if has_sentence_case and punctuation_count >= 2:
        base_score += 1

    return clamp_score(base_score)


def evaluate_rule_based_text_answer(answer: str):
    normalized_answer = answer.strip()
    criteria_scores = {
        "content": score_text_content(normalized_answer),
        "clarity": score_text_clarity(normalized_answer),
        "relevance": score_text_relevance(normalized_answer),
        "language_accuracy": score_text_language_accuracy(normalized_answer),
    }
    score = average_criteria_score(criteria_scores)
    feedback = build_feedback(
        criteria_scores,
        {
            "content": "Content is too limited and needs more development.",
            "clarity": "Clarity is weak and the response needs clearer structure.",
            "relevance": "Relevance is limited and the response should stay closer to the task.",
            "language_accuracy": "Language accuracy needs improvement in sentence formation and mechanics.",
        },
    )

    return {
        "score": score,
        "maxScore": 5,
        "criteria": criteria_scores_to_list(criteria_scores),
        "feedback": feedback,
        "evaluation_mode": "rule_based_text_v1",
    }


def criteria_list_to_map(criteria):
    return {criterion["name"]: criterion["score"] for criterion in criteria}


def combine_feedback(rule_feedback: str, ai_feedback: str):
    ordered_parts = []
    for part in (ai_feedback.strip(), rule_feedback.strip()):
        if part and part not in ordered_parts:
            ordered_parts.append(part)
    return " ".join(ordered_parts)


def combine_text_evaluations(rule_evaluation, ai_evaluation):
    rule_criteria = criteria_list_to_map(rule_evaluation["criteria"])
    ai_score = average_criteria_score(
        {name: ai_evaluation[name] for name in TEXT_CRITERIA}
    )
    merged_criteria = {
        name: round((rule_criteria[name] + ai_evaluation[name]) / 2)
        for name in TEXT_CRITERIA
    }

    return {
        "score": round((rule_evaluation["score"] + ai_score) / 2),
        "maxScore": 5,
        "criteria": criteria_scores_to_list(merged_criteria),
        "feedback": combine_feedback(rule_evaluation["feedback"], ai_evaluation["feedback"]),
        "evaluation_mode": "hybrid_text_v2",
    }


def evaluate_text_answer(answer: str, ai_fetcher=None):
    rule_evaluation = evaluate_rule_based_text_answer(answer)
    ai_evaluation = fetch_ai_text_evaluation(answer, completion_fetcher=ai_fetcher)
    if not ai_evaluation:
        return rule_evaluation

    return combine_text_evaluations(rule_evaluation, ai_evaluation)


def evaluate_transcript_text(transcript: str, ai_fetcher=None):
    return evaluate_text_answer(transcript, ai_fetcher=ai_fetcher)


def extract_audio_duration_seconds(audio_ref: str):
    if not audio_ref:
        return 0

    patterns = [
        r"duration_ms[=:_-](\d+)",
        r"duration[=:_-](\d+)",
        r"len_ms[=:_-](\d+)",
    ]

    for pattern in patterns:
        match = re.search(pattern, audio_ref)
        if match:
            raw_value = int(match.group(1))
            if "ms" in pattern or "duration_ms" in pattern or "len_ms" in pattern:
                return raw_value / 1000
            return raw_value

    return 0


def score_speaking_content(audio_ref: str, duration_seconds: float):
    if not audio_ref:
        return 0
    if duration_seconds < 2:
        return 1
    if duration_seconds < 6:
        return 2
    if duration_seconds < 12:
        return 3
    if duration_seconds < 20:
        return 4
    return 5


def score_speaking_clarity(audio_ref: str, duration_seconds: float):
    if not audio_ref:
        return 0
    if duration_seconds < 1.5:
        return 1
    if duration_seconds < 5:
        return 2
    if duration_seconds < 10:
        return 3
    if duration_seconds < 18:
        return 4
    return 5


def score_speaking_fluency(audio_ref: str, duration_seconds: float):
    if not audio_ref:
        return 0
    if duration_seconds < 2:
        return 1
    if duration_seconds < 7:
        return 2
    if duration_seconds < 12:
        return 3
    if duration_seconds < 20:
        return 4
    return 5


def score_speaking_pronunciation(audio_ref: str, duration_seconds: float):
    if not audio_ref:
        return 0
    if duration_seconds < 2:
        return 1
    if duration_seconds < 6:
        return 2
    if duration_seconds < 10:
        return 3
    if duration_seconds < 18:
        return 4
    return 5


def score_speaking_relevance(audio_ref: str, duration_seconds: float):
    if not audio_ref:
        return 0
    if duration_seconds < 1:
        return 1
    if duration_seconds < 4:
        return 2
    if duration_seconds < 8:
        return 3
    if duration_seconds < 15:
        return 4
    return 5


def evaluate_speaking_audio(audio_ref: str):
    duration_seconds = extract_audio_duration_seconds(audio_ref)
    criteria_scores = {
        "content": score_speaking_content(audio_ref, duration_seconds),
        "clarity": score_speaking_clarity(audio_ref, duration_seconds),
        "fluency": score_speaking_fluency(audio_ref, duration_seconds),
        "pronunciation": score_speaking_pronunciation(audio_ref, duration_seconds),
        "relevance": score_speaking_relevance(audio_ref, duration_seconds),
    }
    score = average_criteria_score(criteria_scores)
    feedback = build_feedback(
        criteria_scores,
        {
            "content": "Content coverage is limited because the audio response is too short.",
            "clarity": "Clarity is limited; a more sustained response would improve structural clarity.",
            "fluency": "Fluency appears limited because the spoken response duration is short.",
            "pronunciation": "Pronunciation cannot be assessed strongly from a very short structural audio sample.",
            "relevance": "Relevance is difficult to confirm from a minimal audio response.",
        },
    )

    return {
        "score": score,
        "maxScore": 5,
        "criteria": criteria_scores_to_list(criteria_scores),
        "feedback": feedback,
        "evaluation_mode": "structural_audio",
    }


def get_section_tasks(session, section_name: str):
    return session["sections"][section_name]["tasks"]


def get_section_score(session, section_name: str):
    tasks = get_section_tasks(session, section_name)
    if not tasks:
        return None

    scores = []
    for task in tasks:
        if not is_answerable_task(task):
            continue
        evaluation = task.get("evaluation")
        if not evaluation or evaluation.get("score") is None:
            return None
        scores.append(clamp_score(evaluation["score"]))

    if not scores:
        return None

    return round(sum(scores) / len(scores))


def get_certificate_evaluation_mode(session):
    text_modes = []
    all_modes = []

    for section_name in SECTION_ORDER:
        for task in get_section_tasks(session, section_name):
            evaluation = task.get("evaluation")
            if not evaluation or not evaluation.get("evaluation_mode"):
                continue
            all_modes.append(evaluation["evaluation_mode"])
            if section_name != "speaking":
                text_modes.append(evaluation["evaluation_mode"])

    unique_text_modes = list(dict.fromkeys(text_modes))
    if len(unique_text_modes) == 1:
        return unique_text_modes[0]

    unique_all_modes = list(dict.fromkeys(all_modes))
    if len(unique_all_modes) == 1:
        return unique_all_modes[0]
    if unique_text_modes:
        return unique_text_modes[0]
    if unique_all_modes:
        return unique_all_modes[0]

    return None


def map_score_to_level(score: int):
    return LEVEL_MAPPING[clamp_score(score)]


def has_passed_certificate(section_scores, overall_score, target_level_score):
    minimum_section_score = max(0, target_level_score - 1)
    return overall_score >= target_level_score and all(
        score >= minimum_section_score for score in section_scores.values()
    )


def build_certificate(session):
    section_scores = {}

    for section_name in SECTION_ORDER:
        section_score = get_section_score(session, section_name)
        if section_score is None:
            return {"error": "CERTIFICATE_NOT_READY"}
        section_scores[section_name] = clamp_score(section_score)

    overall_score = round(sum(section_scores.values()) / len(section_scores))
    target_level_score = session.get("targetLevelScore", DEFAULT_TARGET_LEVEL_SCORE)

    return {
        "overall_score": overall_score,
        "level": map_score_to_level(overall_score),
        "passed": has_passed_certificate(
            section_scores, overall_score, target_level_score
        ),
        "section_scores": section_scores,
        "evaluation_mode": get_certificate_evaluation_mode(session),
    }


def build_learning_feedback(session):
    criteria_totals = {name: 0 for name in ADAPTIVE_CRITERIA_ORDER}
    criteria_counts = {name: 0 for name in ADAPTIVE_CRITERIA_ORDER}

    for section_name in SECTION_ORDER:
        for task in get_section_tasks(session, section_name):
            evaluation = task.get("evaluation")
            if not evaluation:
                continue

            for criterion in evaluation.get("criteria", []):
                name = criterion.get("name")
                score = criterion.get("score")
                if (
                    name not in criteria_totals
                    or score is None
                    or not isinstance(score, (int, float))
                ):
                    continue

                criteria_totals[name] += score
                criteria_counts[name] += 1

    ranked_criteria = []
    for criterion_name in ADAPTIVE_CRITERIA_ORDER:
        count = criteria_counts[criterion_name]
        if count == 0:
            continue

        average_score = round(criteria_totals[criterion_name] / count)
        ranked_criteria.append((criterion_name, average_score))

    weak_criteria = [name for name, score in ranked_criteria if score <= 2]
    borderline_criteria = [name for name, score in ranked_criteria if score == 3]

    focus_areas = (weak_criteria + borderline_criteria)[:3]
    if not focus_areas:
        return {
            "weak_areas": [],
            "suggestions": [ADAPTIVE_MAINTENANCE_SUGGESTION],
        }

    return {
        "weak_areas": focus_areas,
        "suggestions": [ADAPTIVE_SUGGESTION_MAP[name] for name in focus_areas],
    }


def ensure_completion_artifacts(session_id: str, session):
    if session.get("status") != "completed":
        return session

    changed = False

    if not session.get("certificate"):
        certificate = build_certificate(session)
        if isinstance(certificate, dict) and "error" in certificate:
            return certificate
        session["certificate"] = certificate
        changed = True

    if not session.get("learning_feedback"):
        session["learning_feedback"] = build_learning_feedback(session)
        changed = True

    upsert_progress_summary(session)

    if changed:
        storage.update(session_id, session)

    return session


def get_section_status(session, section_name: str):
    if session.get("status") == "completed" and section_name in session["progress"]["completedSections"]:
        return "completed"

    if session["progress"]["currentSection"] == section_name:
        section = session["sections"][section_name]
        if section["currentTaskIndex"] >= len(section["tasks"]):
            return "awaiting_next"
        return "active"

    if section_name in session["progress"]["completedSections"]:
        return "completed"

    return "locked"


def get_current_runtime_task(session):
    section_name = session["progress"]["currentSection"]
    if not section_name:
        return None

    section = session["sections"][section_name]
    index = section["currentTaskIndex"]
    tasks = section["tasks"]

    if index >= len(tasks):
        return None

    return tasks[index]


def build_timing_manifest(session):
    now = datetime.utcnow()
    current_section = session["progress"]["currentSection"]
    current_section_data = (
        session["sections"][current_section] if current_section else None
    )

    def remaining_seconds(expires_at):
        if not expires_at:
            return 0
        return max(0, int((datetime.fromisoformat(expires_at) - now).total_seconds()))

    section_windows = {}
    for section_name in SECTION_ORDER:
        section_data = session["sections"][section_name]
        section_windows[section_name] = {
            "duration_minutes": SECTION_TIME_LIMITS[section_name],
            "expires_at": section_data["expiresAt"],
            "started_at": section_data["startedAt"],
            "remaining_seconds": remaining_seconds(section_data["expiresAt"]),
        }

    return {
        "server_now": now.isoformat(),
        "exam_started_at": session["timing"]["startedAt"],
        "exam_expires_at": session["timing"]["expiresAt"],
        "exam_remaining_seconds": remaining_seconds(session["timing"]["expiresAt"]),
        "current_section_started_at": current_section_data["startedAt"] if current_section_data else None,
        "current_section_expires_at": current_section_data["expiresAt"] if current_section_data else None,
        "current_section_remaining_seconds": remaining_seconds(
            current_section_data["expiresAt"] if current_section_data else None
        ),
        "warning_threshold_seconds": session["runtime"]["warningThresholdSeconds"],
        "sections": section_windows,
    }


def build_section_progress(session):
    progress_rows = []

    for section_name in SECTION_ORDER:
        section = session["sections"][section_name]
        completed_step_count = len(
            [task for task in section["tasks"] if task.get("status") in {"answered", "completed"}]
        )
        progress_rows.append(
            {
                "section": section_name,
                "status": get_section_status(session, section_name),
                "current_step_index": section["currentTaskIndex"],
                "total_steps": len(section["tasks"]),
                "completed_step_count": completed_step_count,
                "started_at": section["startedAt"],
                "expires_at": section["expiresAt"],
            }
        )

    return progress_rows


def build_completion_state(session):
    total_steps = sum(len(session["sections"][section]["tasks"]) for section in SECTION_ORDER)
    completed_steps = sum(
        len(
            [
                task
                for task in session["sections"][section]["tasks"]
                if task.get("status") in {"answered", "completed"}
            ]
        )
        for section in SECTION_ORDER
    )

    return {
        "completed_section_count": len(session["progress"]["completedSections"]),
        "completed_step_count": completed_steps,
        "status": "completed" if session.get("status") == "completed" else "active",
        "total_section_count": len(SECTION_ORDER),
        "total_step_count": total_steps,
    }


def build_current_view(session):
    if session.get("status") == "completed":
        return {
            "actions": {
                "next": None,
                "play_prompt": None,
                "submit": None,
            },
            "answer_status": "locked",
            "input_mode": "none",
            "instructions": [
                "Certification has been generated.",
                "This runtime is now read-only.",
            ],
            "kind": "exam_complete",
            "prompt": "The YKI exam flow is complete.",
            "question": None,
            "options": [],
            "playback": None,
            "recording": None,
            "response_locked": True,
            "section": None,
            "title": "Exam Complete",
            "view_key": "exam-complete",
        }

    current_section = session["progress"]["currentSection"]
    section = session["sections"][current_section]
    index = section["currentTaskIndex"]

    if index >= len(section["tasks"]):
        next_label = (
            "Complete Exam"
            if SECTION_ORDER.index(current_section) == len(SECTION_ORDER) - 1
            else f"Continue to {SECTION_ORDER[SECTION_ORDER.index(current_section) + 1].title()}"
        )
        return {
            "actions": {
                "next": {
                    "enabled": True,
                    "kind": "next",
                    "label": next_label,
                },
                "play_prompt": None,
                "submit": None,
            },
            "answer_status": "none",
            "input_mode": "none",
            "instructions": [
                f"{current_section.title()} is sealed.",
                "Advance forward to continue the engine-controlled exam flow.",
            ],
            "kind": "section_complete",
            "prompt": "All required steps in this section are locked.",
            "question": None,
            "options": [],
            "playback": None,
            "recording": None,
            "response_locked": True,
            "section": current_section,
            "title": f"{current_section.title()} Complete",
            "view_key": f"{current_section}-complete",
        }

    task = section["tasks"][index]
    skipped = bool(task.get("skipped"))
    answer_status = (
        "submitted"
        if task["status"] == "answered" and not skipped
        else "skipped"
        if skipped
        else "pending"
    )

    instructions = list(task.get("instructions", []))
    if not instructions:
        instructions = [
            "This view is engine-controlled.",
            "Only the available forward action can change exam state.",
        ]

    actions = {
        "next": None,
        "play_prompt": None,
        "submit": None,
    }

    if is_display_only_task(task):
        actions["next"] = {
            "enabled": True,
            "kind": "next",
            "label": "Next",
        }
    elif is_answerable_task(task):
        actions["submit"] = {
            "enabled": task["status"] == "pending",
            "kind": "submit",
            "label": "Submit Response",
        }
        actions["next"] = {
            "enabled": True,
            "kind": "next",
            "label": "Next",
        }

    if task.get("kind") == "listening_prompt":
        playback_limit = task.get("playbackLimit", LISTENING_PLAYBACK_LIMIT)
        playback_count = task.get("playbackCount", 0)
        actions["play_prompt"] = {
            "enabled": playback_count < playback_limit,
            "kind": "play_prompt",
            "label": "Play Prompt",
        }

    kind_map = {
        "passage": "reading_passage",
        "listening_prompt": "listening_prompt",
        "question": f"{task['section']}_question",
        "writing_prompt": "writing_prompt",
        "writing_response": "writing_response",
        "speaking_prompt": "speaking_prompt",
        "speaking_response": "speaking_response",
    }

    input_mode = "none"
    if task.get("kind") == "question":
        input_mode = "choice" if task.get("options") else "text"
    elif task.get("kind") == "writing_response":
        input_mode = "text"
    elif task.get("kind") == "speaking_response":
        input_mode = "audio"

    return {
        "actions": actions,
        "answer_status": answer_status,
        "input_mode": input_mode,
        "instructions": instructions,
        "kind": kind_map[task["kind"]],
        "options": task.get("options", []),
        "passage": task.get("passage"),
        "playback": (
            {
                "count": task.get("playbackCount", 0),
                "limit": task.get("playbackLimit", LISTENING_PLAYBACK_LIMIT),
                "remaining": max(
                    0,
                    task.get("playbackLimit", LISTENING_PLAYBACK_LIMIT)
                    - task.get("playbackCount", 0),
                ),
            }
            if task.get("kind") == "listening_prompt"
            else None
        ),
        "prompt": task.get("prompt"),
        "question": task.get("question"),
        "recording": (
            {
                "max_duration_seconds": task.get("maxDurationSeconds", SPEAKING_MAX_RECORDING_SECONDS)
            }
            if task.get("kind") == "speaking_response"
            else None
        ),
        "response_locked": task["status"] != "pending",
        "section": current_section,
        "submitted_answer": task.get("answer"),
        "submitted_audio": task.get("audio"),
        "title": task.get("title"),
        "view_key": f"{current_section}:{task['id']}",
    }


def build_navigation_state(session):
    current_view = build_current_view(session)
    next_action = current_view["actions"]["next"]
    return {
        "back_allowed": False,
        "can_next": bool(next_action and next_action["enabled"]),
        "forward_only": True,
        "interaction_locked": current_view["response_locked"] and not next_action,
        "next_label": next_action["label"] if next_action else None,
        "read_only": session.get("status") == "completed",
        "skip_allowed": current_view["input_mode"] in {"choice", "text", "audio"},
        "state_locked": True,
    }


def build_governed_session(session_id: str, session):
    current_section = session["progress"]["currentSection"]
    current_view = build_current_view(session)

    return {
        "session_id": session["sessionId"],
        "user_id": session["userId"],
        "status": "read_only" if session.get("status") == "completed" else session.get("status", "active"),
        "state_source": {
            "mode": "engine_controlled",
            "path": ENGINE_STATE_SOURCE_PATH.format(session_id=session_id),
        },
        "section_order": SECTION_ORDER,
        "current_section": current_section,
        "current_view": current_view,
        "navigation": build_navigation_state(session),
        "timing_manifest": build_timing_manifest(session),
        "completion_state": build_completion_state(session),
        "section_progress": build_section_progress(session),
        "certificate": session.get("certificate"),
        "learning_feedback": session.get("learning_feedback"),
        "progress_history": get_history_overview(session["userId"]),
        "runtime": session.get("runtime"),
    }


def build_session_summary(session):
    certificate = session.get("certificate")
    learning_feedback = session.get("learning_feedback")

    if not certificate or not learning_feedback:
        return None

    return {
        "session_id": session["sessionId"],
        "date": session.get("createdAt"),
        "overall_score": certificate["overall_score"],
        "level": certificate["level"],
        "section_scores": certificate["section_scores"],
        "weak_areas": learning_feedback.get("weak_areas", []),
        "passed": certificate["passed"],
    }


def upsert_progress_summary(session):
    summary = build_session_summary(session)
    if not summary:
        return

    storage.upsert_history_summary(session["userId"], summary)


def get_trend_label(progression):
    if len(progression) < 2:
        return "stable"
    if progression[-1] > progression[0]:
        return "improving"
    if progression[-1] < progression[0]:
        return "declining"
    return "stable"


def get_ranked_patterns(counts, preferred_order):
    ranked = sorted(
        counts.items(),
        key=lambda item: (-item[1], preferred_order.index(item[0])),
    )
    return [name for name, count in ranked if count > 0][:3]


def build_history_overview(history):
    progression = [item["overall_score"] for item in history]
    current_level = history[-1]["level"] if history else None

    weak_counts = {name: 0 for name in ADAPTIVE_CRITERIA_ORDER}
    section_totals = {name: 0 for name in SECTION_ORDER}
    section_counts = {name: 0 for name in SECTION_ORDER}

    for item in history:
        for weak_area in item.get("weak_areas", []):
            if weak_area in weak_counts:
                weak_counts[weak_area] += 1

        for section_name in SECTION_ORDER:
            score = item.get("section_scores", {}).get(section_name)
            if score is None:
                continue
            section_totals[section_name] += score
            section_counts[section_name] += 1

    section_averages = {}
    for section_name in SECTION_ORDER:
        count = section_counts[section_name]
        if count:
            section_averages[section_name] = round(section_totals[section_name] / count)

    weak_patterns = get_ranked_patterns(weak_counts, ADAPTIVE_CRITERIA_ORDER)
    strong_patterns = get_ranked_patterns(section_averages, SECTION_ORDER)

    return {
        "progression": progression,
        "current_level": current_level,
        "trend": get_trend_label(progression),
        "weak_patterns": weak_patterns,
        "strong_patterns": strong_patterns,
    }


def get_history_overview(user_id: str):
    history = storage.get_history(user_id)
    history = sorted(history, key=lambda item: item["date"])
    overview = build_history_overview(history)

    return {
        "sessions": history,
        "progression": overview["progression"],
        "current_level": overview["current_level"],
        "trend": overview["trend"],
        "weak_patterns": overview["weak_patterns"],
        "strong_patterns": overview["strong_patterns"],
    }


def get_progress_history(user_id: str = DEFAULT_USER_ID):
    return get_history_overview(user_id)


def get_certificate(session_id: str):
    session = get_session(session_id)
    if isinstance(session, dict) and "error" in session:
        return session

    if is_session_expired(session):
        return {"error": "SESSION_EXPIRED"}

    session = ensure_completion_artifacts(session_id, session)
    if isinstance(session, dict) and "error" in session:
        return {"error": "EXAM_NOT_FINISHED"}

    certificate = session.get("certificate")
    if certificate:
        return certificate

    if session.get("status") != "completed":
        return {"error": "EXAM_NOT_FINISHED"}

    return {"error": "EXAM_NOT_FINISHED"}


def play_listening_prompt(session_id: str):
    session = get_session(session_id)
    if isinstance(session, dict) and "error" in session:
        return session

    if session.get("status") == "completed":
        return {"error": "SESSION_READ_ONLY"}

    if is_session_expired(session):
        return {"error": "SESSION_EXPIRED"}

    if is_section_expired(session):
        return {"error": "SECTION_EXPIRED"}

    section = session["progress"]["currentSection"]
    if section != "listening":
        return {"error": "NOT_LISTENING_SECTION"}

    section_data = session["sections"][section]
    idx = section_data["currentTaskIndex"]
    if idx >= len(section_data["tasks"]):
        return {"error": "NO_TASK_AVAILABLE"}

    task = section_data["tasks"][idx]
    if task.get("kind") != "listening_prompt":
        return {"error": "NOT_LISTENING_SECTION"}

    playback_limit = task.get("playbackLimit", LISTENING_PLAYBACK_LIMIT)
    playback_count = task.get("playbackCount", 0)
    if playback_count >= playback_limit:
        return {"error": "PLAYBACK_LIMIT_REACHED"}

    task["playbackCount"] = playback_count + 1
    storage.update(session_id, session)
    return task


def is_session_expired(session):
    return datetime.utcnow() > datetime.fromisoformat(session["timing"]["expiresAt"])


def is_section_expired(session):
    section = session["progress"]["currentSection"]
    if not section:
        return False

    expires_at = session["sections"][section]["expiresAt"]
    if not expires_at:
        return False

    return datetime.utcnow() > datetime.fromisoformat(expires_at)


def advance_section(session_id: str):
    session = get_session(session_id)
    if isinstance(session, dict) and "error" in session:
        return session

    if session.get("status") == "completed":
        return {"error": "SESSION_READ_ONLY"}

    if is_session_expired(session):
        return {"error": "SESSION_EXPIRED"}

    if is_section_expired(session):
        return {"error": "SECTION_EXPIRED"}

    current = session["progress"]["currentSection"]

    if current and not is_section_complete(session, current):
        return {"error": "SECTION_NOT_COMPLETE"}

    if current is None:
        next_section = SECTION_ORDER[0]
    else:
        current_index = SECTION_ORDER.index(current)
        if current not in session["progress"]["completedSections"]:
            session["progress"]["completedSections"].append(current)

        if current_index + 1 >= len(SECTION_ORDER):
            session["status"] = "completed"
            session = ensure_completion_artifacts(session_id, session)
            return session

        next_section = SECTION_ORDER[current_index + 1]

    session["progress"]["currentSection"] = next_section
    initialize_section_runtime(session, next_section)
    storage.update(session_id, session)
    return session


def get_current_task(session_id: str):
    session = get_session(session_id)
    if isinstance(session, dict) and "error" in session:
        return session

    if is_session_expired(session):
        return {"error": "SESSION_EXPIRED"}

    if is_section_expired(session):
        return {"error": "SECTION_EXPIRED"}

    return get_current_runtime_task(session)


def next_task(session_id: str):
    session = get_session(session_id)
    if isinstance(session, dict) and "error" in session:
        return session

    if session.get("status") == "completed":
        return {"error": "SESSION_READ_ONLY"}

    if is_session_expired(session):
        return {"error": "SESSION_EXPIRED"}

    if is_section_expired(session):
        return {"error": "SECTION_EXPIRED"}

    section = session["progress"]["currentSection"]
    if not section:
        return None

    section_data = session["sections"][section]

    if section_data["currentTaskIndex"] >= len(section_data["tasks"]):
        advanced = advance_section(session_id)
        if isinstance(advanced, dict) and "error" in advanced:
            return advanced
        return advanced

    current_task = section_data["tasks"][section_data["currentTaskIndex"]]

    if is_display_only_task(current_task):
        current_task["status"] = "completed"
    elif is_answerable_task(current_task) and current_task["status"] == "pending":
        mark_task_skipped(current_task)
    elif current_task["status"] != "answered":
        return {"error": "TASK_NOT_ANSWERED"}

    section_data["currentTaskIndex"] += 1

    if section_data["currentTaskIndex"] > len(section_data["tasks"]):
        return {"error": "NO_TASK_AVAILABLE"}

    storage.update(session_id, session)
    return session


def submit_answer(session_id: str, answer):
    session = get_session(session_id)
    if isinstance(session, dict) and "error" in session:
        return session

    if session.get("status") == "completed":
        return {"error": "SESSION_READ_ONLY"}

    if is_session_expired(session):
        return {"error": "SESSION_EXPIRED"}

    if is_section_expired(session):
        return {"error": "SECTION_EXPIRED"}

    section = session["progress"]["currentSection"]
    if not section:
        return None

    section_data = session["sections"][section]
    idx = section_data["currentTaskIndex"]

    if idx >= len(section_data["tasks"]):
        return None

    task = section_data["tasks"][idx]

    if not is_answerable_task(task) or task.get("kind") == "speaking_response":
        return {"error": "ANSWER_SUBMISSION_FAILED"}

    if task["status"] == "answered":
        return {"error": "TASK_ALREADY_ANSWERED"}

    normalized_answer = answer.strip() if isinstance(answer, str) else ""

    if task.get("options") and normalized_answer and normalized_answer not in task["options"]:
        return {"error": "INVALID_OPTION"}

    task["answer"] = normalized_answer
    task["status"] = "answered"
    task["skipped"] = normalized_answer == ""
    task["evaluation"] = evaluate_text_answer(normalized_answer)

    storage.update(session_id, session)
    return task


def submit_audio(session_id: str, audio_ref: str):
    session = get_session(session_id)
    if isinstance(session, dict) and "error" in session:
        return session

    if session.get("status") == "completed":
        return {"error": "SESSION_READ_ONLY"}

    if is_session_expired(session):
        return {"error": "SESSION_EXPIRED"}

    if is_section_expired(session):
        return {"error": "SECTION_EXPIRED"}

    section = session["progress"]["currentSection"]
    if section != "speaking":
        return {"error": "NOT_SPEAKING_SECTION"}

    section_data = session["sections"][section]
    idx = section_data["currentTaskIndex"]

    if idx >= len(section_data["tasks"]):
        return None

    task = section_data["tasks"][idx]

    if task.get("kind") != "speaking_response":
        return {"error": "NOT_SPEAKING_SECTION"}

    if task["status"] == "answered":
        return {"error": "TASK_ALREADY_ANSWERED"}

    if audio_ref and extract_audio_duration_seconds(audio_ref) > SPEAKING_MAX_RECORDING_SECONDS:
        return {"error": "AUDIO_TOO_LONG"}

    task["audio"] = audio_ref
    task["status"] = "answered"
    task["skipped"] = not bool(audio_ref)
    task["evaluation"] = evaluate_speaking_audio(audio_ref)

    storage.update(session_id, session)
    return task


def get_governed_exam_session(session_id: str):
    session = get_session(session_id)
    if isinstance(session, dict) and "error" in session:
        return session

    if is_session_expired(session):
        return {"error": "SESSION_EXPIRED"}

    if is_section_expired(session):
        return {"error": "SECTION_EXPIRED"}

    session = ensure_completion_artifacts(session_id, session)
    if isinstance(session, dict) and "error" in session:
        return session

    return build_governed_session(session_id, session)
