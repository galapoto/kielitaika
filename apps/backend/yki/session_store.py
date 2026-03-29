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
            "currentSection": None,
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
    if section_name == "listening":
        return [
            {
                "id": f"{section_name}-task-1",
                "type": "listening",
                "status": "pending",
                "evaluation": None,
                "playbackCount": 0,
                "playbackLimit": LISTENING_PLAYBACK_LIMIT,
            },
            {
                "id": f"{section_name}-task-2",
                "type": "listening",
                "status": "pending",
                "evaluation": None,
                "playbackCount": 0,
                "playbackLimit": LISTENING_PLAYBACK_LIMIT,
            },
        ]

    if section_name == "speaking":
        return [
            {
                "id": f"{section_name}-task-1",
                "type": "speaking",
                "audio": None,
                "status": "pending",
                "evaluation": None,
                "maxDurationSeconds": SPEAKING_MAX_RECORDING_SECONDS,
            }
        ]

    return [
        {
            "id": f"{section_name}-task-1",
            "type": "mock",
            "answer": None,
            "status": "pending",
            "evaluation": None,
        },
        {
            "id": f"{section_name}-task-2",
            "type": "mock",
            "answer": None,
            "status": "pending",
            "evaluation": None,
        },
    ]


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
        evaluation = task.get("evaluation")
        if not evaluation or evaluation.get("score") is None:
            return None
        scores.append(clamp_score(evaluation["score"]))

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
    if task["status"] == "answered":
        return {"error": "TASK_ALREADY_ANSWERED"}

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

    if is_session_expired(session):
        return {"error": "SESSION_EXPIRED"}

    if is_section_expired(session):
        return {"error": "SECTION_EXPIRED"}

    current = session["progress"]["currentSection"]

    if current:
        tasks = session["sections"][current]["tasks"]
        for task in tasks:
            if task["status"] != "answered":
                return {"error": "SECTION_NOT_COMPLETE"}

    if current is None:
        next_section = SECTION_ORDER[0]
    else:
        idx = SECTION_ORDER.index(current)
        if idx + 1 >= len(SECTION_ORDER):
            session["status"] = "completed"
            session = ensure_completion_artifacts(session_id, session)
            return session
        next_section = SECTION_ORDER[idx + 1]

    session["progress"]["currentSection"] = next_section
    now = datetime.utcnow()
    duration = SECTION_TIME_LIMITS[next_section]

    if not session["sections"][next_section]["tasks"]:
        session["sections"][next_section]["tasks"] = generate_mock_tasks(next_section)
    session["sections"][next_section]["startedAt"] = now.isoformat()
    session["sections"][next_section]["expiresAt"] = (
        now + timedelta(minutes=duration)
    ).isoformat()

    if next_section not in session["progress"]["completedSections"]:
        session["progress"]["completedSections"].append(next_section)

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

    section = session["progress"]["currentSection"]
    if not section:
        return None

    section_data = session["sections"][section]
    idx = section_data["currentTaskIndex"]

    if idx >= len(section_data["tasks"]):
        return None

    return section_data["tasks"][idx]


def next_task(session_id: str):
    session = get_session(session_id)
    if isinstance(session, dict) and "error" in session:
        return session

    if is_session_expired(session):
        return {"error": "SESSION_EXPIRED"}

    if is_section_expired(session):
        return {"error": "SECTION_EXPIRED"}

    section = session["progress"]["currentSection"]
    if not section:
        return None

    section_data = session["sections"][section]
    if section_data["currentTaskIndex"] >= len(section_data["tasks"]):
        return {"error": "NO_TASK_AVAILABLE"}

    current_task = section_data["tasks"][section_data["currentTaskIndex"]]

    if current_task["status"] != "answered":
        return {"error": "TASK_NOT_ANSWERED"}

    section_data["currentTaskIndex"] += 1
    storage.update(session_id, session)
    return session


def submit_answer(session_id: str, answer):
    session = get_session(session_id)
    if isinstance(session, dict) and "error" in session:
        return session

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

    if task["status"] == "answered":
        return {"error": "TASK_ALREADY_ANSWERED"}

    normalized_answer = answer.strip() if isinstance(answer, str) else ""

    task["answer"] = answer
    task["status"] = "answered"
    task["evaluation"] = evaluate_text_answer(normalized_answer)

    storage.update(session_id, session)
    return task


def submit_audio(session_id: str, audio_ref: str):
    session = get_session(session_id)
    if isinstance(session, dict) and "error" in session:
        return session

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

    if task["status"] == "answered":
        return {"error": "TASK_ALREADY_ANSWERED"}

    task["audio"] = audio_ref
    task["status"] = "answered"
    task["evaluation"] = evaluate_speaking_audio(audio_ref)

    storage.update(session_id, session)
    return task
