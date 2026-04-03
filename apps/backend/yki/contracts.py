from __future__ import annotations

from dataclasses import dataclass, field
from datetime import datetime, timedelta, UTC
from hashlib import sha256
from typing import Any
from uuid import uuid4

SECTION_ORDER = ["reading", "listening", "writing", "speaking"]
SECTION_TIME_LIMITS_MINUTES = {
    "reading": 60,
    "listening": 40,
    "writing": 55,
    "speaking": 20,
}
WARNING_THRESHOLD_SECONDS = 300
LISTENING_PLAYBACK_LIMIT = 1
WRITING_MINIMUM_WORDS = 80
WRITING_RECOMMENDED_MAX_WORDS = 180
SPEAKING_MAX_RECORDING_SECONDS = 30
DEFAULT_USER_ID = "local-user"
ENGINE_STATE_SOURCE_PATH = "/api/v1/yki/sessions/{session_id}"
LEVEL_MAPPING = {
    0: "A1",
    1: "A1",
    2: "A2",
    3: "B1",
    4: "B2",
    5: "C1/C2",
}
ADAPTIVE_SUGGESTION_MAP = {
    "content": "Practice giving fuller answers with key details and examples.",
    "clarity": "Practice organizing responses into a clear beginning, middle, and end.",
    "relevance": "Focus on answering the exact task before adding extra detail.",
    "language_accuracy": "Practice sentence structure and punctuation in short daily drills.",
    "fluency": "Practice speaking for longer uninterrupted stretches.",
    "pronunciation": "Practice listening and repeating short phrases to improve pronunciation.",
}


def utc_now() -> datetime:
    return datetime.now(UTC)


def utc_now_iso() -> str:
    return utc_now().isoformat()


def build_runtime_manifest() -> dict[str, Any]:
    return {
        "engineDrivenUi": True,
        "navigationLocked": True,
        "sectionLocking": True,
        "warningThresholdSeconds": WARNING_THRESHOLD_SECONDS,
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
    }


def empty_progress_history() -> dict[str, Any]:
    return {
        "sessions": [],
        "progression": [],
        "current_level": None,
        "trend": "stable",
        "weak_patterns": [],
        "strong_patterns": [],
    }


@dataclass
class SessionState:
    view_type: str
    section: str | None
    index: int
    sub_index: int = 0


@dataclass
class OrchestratedSession:
    session_id: str
    engine_session_id: str
    engine_session_token: str | None
    user_id: str
    state: SessionState
    structure: dict[str, list[dict[str, Any]]]
    started_at: str
    section_start_time: str
    timing_manifest: dict[str, int]
    created_at: str
    answers: dict[str, str] = field(default_factory=dict)
    recordings: dict[str, str] = field(default_factory=dict)
    audio_playback: dict[str, int] = field(default_factory=dict)
    visited_views: list[str] = field(default_factory=list)
    completed_sections: list[str] = field(default_factory=list)
    session_hash: str = ""
    task_sequence_hash: str = ""
    status: str = "active"
    certificate: dict[str, Any] | None = None
    learning_feedback: dict[str, Any] | None = None
    progress_history: dict[str, Any] = field(default_factory=empty_progress_history)
    runtime: dict[str, Any] = field(default_factory=build_runtime_manifest)
    last_engine_data: dict[str, Any] | None = None
    section_windows: dict[str, dict[str, str | None]] = field(default_factory=dict)
    engine_timing_enforced: bool = True
    validation_mode: bool = False

    def __post_init__(self):
        if not self.session_hash:
            self.task_sequence_hash = self.task_sequence_hash or compute_task_sequence_hash(
                self.structure
            )
            self.session_hash = compute_session_hash(self)
        if not self.section_windows:
            self.section_windows = build_section_windows(self.started_at, self.timing_manifest)


def build_timing_manifest_from_minutes(
    minutes_by_section: dict[str, int] | None = None,
) -> dict[str, int]:
    effective_minutes = minutes_by_section or SECTION_TIME_LIMITS_MINUTES
    return {
        section: int(effective_minutes[section]) * 60
        for section in SECTION_ORDER
    }


def build_section_windows(
    started_at: str,
    timing_manifest: dict[str, int] | None = None,
) -> dict[str, dict[str, str | None]]:
    windows: dict[str, dict[str, str | None]] = {}
    for section in SECTION_ORDER:
        windows[section] = {
            "started_at": None,
            "expires_at": None,
        }

    current_started_at = datetime.fromisoformat(started_at)
    effective_manifest = timing_manifest or build_timing_manifest_from_minutes()
    for section in SECTION_ORDER:
        duration_seconds = int(effective_manifest.get(section, 0))
        windows[section]["started_at"] = current_started_at.isoformat()
        windows[section]["expires_at"] = (
            current_started_at + timedelta(seconds=duration_seconds)
        ).isoformat()
        current_started_at = current_started_at + timedelta(seconds=duration_seconds)
    return windows


def activate_section(session: OrchestratedSession, section: str, now: datetime | None = None):
    current_time = now or utc_now()
    existing_window = session.section_windows.get(section) or {}
    started_at = existing_window.get("started_at") or current_time.isoformat()
    session.section_start_time = started_at
    session.section_windows[section] = {
        "started_at": started_at,
        "expires_at": existing_window.get("expires_at") or (
            datetime.fromisoformat(started_at) + timedelta(seconds=int(session.timing_manifest.get(section, 0)))
        ).isoformat(),
    }


def compute_task_sequence_hash(structure: dict[str, list[dict[str, Any]]]) -> str:
    ordered_ids = []
    for section in SECTION_ORDER:
        ordered_ids.extend(task["id"] for task in structure.get(section, []))
    return sha256("|".join(ordered_ids).encode("utf-8")).hexdigest()


def compute_session_hash(session: OrchestratedSession) -> str:
    fingerprint = "|".join(
        [
            session.session_id,
            session.engine_session_id,
            session.started_at,
            session.task_sequence_hash or compute_task_sequence_hash(session.structure),
        ]
    )
    return sha256(fingerprint.encode("utf-8")).hexdigest()


def new_orchestrated_session(
    engine_session_id: str,
    engine_session_token: str | None,
    structure: dict[str, list[dict[str, Any]]],
    user_id: str = DEFAULT_USER_ID,
    timing_manifest: dict[str, int] | None = None,
    engine_timing_enforced: bool = True,
    validation_mode: bool = False,
) -> OrchestratedSession:
    created_at = utc_now_iso()
    effective_timing_manifest = timing_manifest or build_timing_manifest_from_minutes()
    session = OrchestratedSession(
        session_id=str(uuid4()),
        engine_session_id=engine_session_id,
        engine_session_token=engine_session_token,
        user_id=user_id,
        state=SessionState(view_type=structure["reading"][0]["kind"], section="reading", index=0),
        structure=structure,
        started_at=created_at,
        section_start_time=created_at,
        timing_manifest=effective_timing_manifest,
        created_at=created_at,
        engine_timing_enforced=engine_timing_enforced,
        validation_mode=validation_mode,
    )
    session.visited_views.append(view_key_for_state(session.state, structure))
    return session


def is_display_only_kind(kind: str) -> bool:
    return kind in {"reading_passage", "listening_prompt", "writing_prompt", "speaking_prompt"}


def is_answerable_kind(kind: str) -> bool:
    return kind in {"reading_question", "listening_question", "writing_response", "speaking_response"}


def task_requires_answer(task: dict[str, Any]) -> bool:
    return task["kind"] in {"reading_question", "listening_question", "writing_response"}


def task_requires_recording(task: dict[str, Any]) -> bool:
    return task["kind"] == "speaking_response"


def task_requires_playback(task: dict[str, Any]) -> bool:
    return task["kind"] == "listening_prompt"


def view_key_for_state(
    state: SessionState,
    structure: dict[str, list[dict[str, Any]]],
) -> str:
    if state.view_type == "exam_complete":
        return "exam-complete"
    if state.view_type == "section_complete" and state.section:
        return f"{state.section}-complete"
    if state.section is None:
        return "orchestrator-unknown"
    task = structure[state.section][state.index]
    return f"{state.section}:{task['id']}"


def get_current_task(session: OrchestratedSession) -> dict[str, Any] | None:
    section = session.state.section
    if section is None or session.state.view_type in {"section_complete", "exam_complete"}:
        return None
    tasks = session.structure.get(section, [])
    if session.state.index >= len(tasks):
        return None
    return tasks[session.state.index]


def get_completed_step_count(session: OrchestratedSession) -> int:
    count = 0
    for section in SECTION_ORDER:
        tasks = session.structure.get(section, [])
        for task in tasks:
            if task["kind"] in {"reading_passage", "listening_prompt", "writing_prompt", "speaking_prompt"}:
                if view_key_for_task(section, task) in session.visited_views:
                    count += 1
            elif task["id"] in session.answers or task["id"] in session.recordings:
                count += 1
    return count


def view_key_for_task(section: str, task: dict[str, Any]) -> str:
    return f"{section}:{task['id']}"


def get_section_completed_step_count(session: OrchestratedSession, section: str) -> int:
    tasks = session.structure.get(section, [])
    count = 0
    for task in tasks:
        if is_display_only_kind(task["kind"]) and view_key_for_task(section, task) in session.visited_views:
            count += 1
        elif task["id"] in session.answers or task["id"] in session.recordings:
            count += 1
    return count


def current_section_index(session: OrchestratedSession) -> int | None:
    if session.state.section is None:
        return None
    return SECTION_ORDER.index(session.state.section)


def coerce_audio_duration_seconds(audio_ref: str) -> int:
    for separator in ("duration_ms=", "duration_ms:", "duration_ms-", "duration="):
        if separator not in audio_ref:
            continue
        raw = audio_ref.split(separator, 1)[1].split("_", 1)[0]
        digits = "".join(char for char in raw if char.isdigit())
        if not digits:
            continue
        value = int(digits)
        if "duration_ms" in separator:
            return max(0, round(value / 1000))
        return max(0, value)
    return 0


def clamp_score(value: int) -> int:
    return max(0, min(5, value))


def map_score_to_level(score: int) -> str:
    return LEVEL_MAPPING[clamp_score(score)]
