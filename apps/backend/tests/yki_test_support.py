import sys
from copy import deepcopy
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parents[1]))

import yki.adapter as yki_adapter
from yki.adapter import advance_governed_exam, answer_governed_audio, answer_governed_task, play_governed_listening_prompt
from yki.orchestrator import YKIOrchestrator
from yki.session_registry import SessionRegistry


def build_engine_sections(missing_audio: bool = False):
    listening_audio = None
    if not missing_audio:
        listening_audio = {
            "id": "listening-prompt-asset",
            "url": "/api/audio/listening-prompt-asset",
            "content_type": "audio/wav",
            "duration_ms": 3200,
            "ready": True,
        }

    return [
        {
            "name": "reading",
            "tasks": [
                {
                    "id": "reading-passage-1",
                    "kind": "reading_passage",
                    "title": "Reading Passage",
                    "prompt": "Read the passage fully before the questions begin.",
                    "passage": "Employees are planning a workplace language day for onboarding ideas.",
                },
                {
                    "id": "reading-question-1",
                    "kind": "reading_question",
                    "title": "Reading Question 1",
                    "prompt": "Choose the best answer.",
                    "question": "What is the main goal of the language day?",
                    "options": [
                        "To collect practical Finnish-learning ideas for onboarding.",
                        "To replace onboarding entirely.",
                        "To test grammar rules only.",
                    ],
                    "correctAnswer": "To collect practical Finnish-learning ideas for onboarding.",
                },
                {
                    "id": "reading-question-2",
                    "kind": "reading_question",
                    "title": "Reading Question 2",
                    "prompt": "Choose the best answer.",
                    "question": "Who wants the suggestions collected?",
                    "options": [
                        "The supervisor",
                        "A new employee",
                        "An external examiner",
                    ],
                    "correctAnswer": "The supervisor",
                },
            ],
        },
        {
            "name": "listening",
            "tasks": [
                {
                    "id": "listening-prompt-1",
                    "kind": "listening_prompt",
                    "title": "Listening Prompt",
                    "prompt": "Play the prompt before answering the listening questions.",
                    "audio": listening_audio,
                    "playbackLimit": 1,
                },
                {
                    "id": "listening-question-1",
                    "kind": "listening_question",
                    "title": "Listening Question 1",
                    "prompt": "Choose the best answer.",
                    "question": "Why is the meeting being changed?",
                    "options": [
                        "The train is delayed.",
                        "The speaker is sick.",
                        "The office is closed.",
                    ],
                    "correctAnswer": "The train is delayed.",
                },
                {
                    "id": "listening-question-2",
                    "kind": "listening_question",
                    "title": "Listening Question 2",
                    "prompt": "Choose the best answer.",
                    "question": "What does the caller want to do?",
                    "options": [
                        "Move the meeting to a later time.",
                        "Cancel the meeting completely.",
                        "Invite more people.",
                    ],
                    "correctAnswer": "Move the meeting to a later time.",
                },
            ],
        },
        {
            "name": "writing",
            "tasks": [
                {
                    "id": "writing-prompt-1",
                    "kind": "writing_prompt",
                    "title": "Writing Instructions",
                    "prompt": "Read the writing task instructions before responding.",
                    "question": "Write an email to your teacher explaining why you need to move a lesson.",
                },
                {
                    "id": "writing-response-1",
                    "kind": "writing_response",
                    "title": "Writing Response",
                    "prompt": "Write the response for the task below.",
                    "question": "Write an email to your teacher explaining why you need to move a lesson.",
                    "minimumWords": 80,
                    "recommendedMaxWords": 180,
                },
            ],
        },
        {
            "name": "speaking",
            "tasks": [
                {
                    "id": "speaking-prompt-1",
                    "kind": "speaking_prompt",
                    "title": "Speaking Instructions",
                    "prompt": "Read the speaking task before recording.",
                    "question": "Describe a work situation where clear communication prevented a problem.",
                },
                {
                    "id": "speaking-response-1",
                    "kind": "speaking_response",
                    "title": "Speaking Response",
                    "prompt": "Record your spoken response for the task below.",
                    "question": "Describe a work situation where clear communication prevented a problem.",
                    "maxDurationSeconds": 30,
                },
            ],
        },
    ]


class FakeEngineClient:
    def __init__(self, *, missing_audio: bool = False, raise_on_get: bool = False):
        self.missing_audio = missing_audio
        self.raise_on_get = raise_on_get
        self.sessions = {}
        self.counter = 0

    async def start_exam(self, payload=None):
        self.counter += 1
        session_id = f"engine-session-{self.counter}"
        session = {
            "session_id": session_id,
            "engine_session_token": session_id,
            "sections": deepcopy(build_engine_sections(missing_audio=self.missing_audio)),
            "responses": {},
        }
        self.sessions[session_id] = session
        return deepcopy(session)

    async def get_session(self, session_id: str):
        if self.raise_on_get:
            from yki.errors import EngineFailure

            raise EngineFailure("ENGINE_UNAVAILABLE")
        return deepcopy(self.sessions[session_id])

    async def submit_answer(self, session_id: str, payload: dict):
        key = payload.get("question_id") or payload.get("task_id")
        self.sessions[session_id]["responses"][key] = payload["answer"]
        return {"ok": True}

    async def submit_writing(self, session_id: str, payload: dict):
        self.sessions[session_id]["responses"][payload["task_id"]] = payload["text"]
        return {"ok": True}

    async def submit_audio(self, session_id: str, payload: dict):
        self.sessions[session_id]["responses"][payload["task_id"]] = payload.get("audio_file_path") or payload.get("audio")
        return {"ok": True}

    async def submit_speaking(self, session_id: str, payload: dict):
        self.sessions[session_id]["responses"][payload["item_id"]] = payload["audio_file_path"]
        return {"ok": True}


def install_fake_orchestrator(*, missing_audio: bool = False, raise_on_get: bool = False):
    yki_adapter.orchestrator = YKIOrchestrator(
        engine=FakeEngineClient(missing_audio=missing_audio, raise_on_get=raise_on_get),
        registry=SessionRegistry(),
    )


def move_to_listening_prompt(session_id: str):
    advance_governed_exam(session_id)
    answer_governed_task(
        session_id,
        "To collect practical Finnish-learning ideas for onboarding.",
    )
    advance_governed_exam(session_id)
    answer_governed_task(session_id, "The supervisor")
    advance_governed_exam(session_id)
    advance_governed_exam(session_id)


def complete_exam(session_id: str):
    move_to_listening_prompt(session_id)
    play_governed_listening_prompt(session_id)
    advance_governed_exam(session_id)
    answer_governed_task(session_id, "The train is delayed.")
    advance_governed_exam(session_id)
    answer_governed_task(session_id, "Move the meeting to a later time.")
    advance_governed_exam(session_id)
    advance_governed_exam(session_id)
    advance_governed_exam(session_id)
    answer_governed_task(
        session_id,
        (
            "Hei opettaja. Tarvitsen uuden ajan oppitunnille, koska sairastuin ja en pysty "
            "osallistumaan huomenna. Voisimmeko siirtaa tunnin ensi viikolle. "
            "Ystavallisin terveisin opiskelija."
        ),
    )
    advance_governed_exam(session_id)
    advance_governed_exam(session_id)
    advance_governed_exam(session_id)
    answer_governed_audio(session_id, "clip_duration_ms=18000")
    advance_governed_exam(session_id)
    advance_governed_exam(session_id)
