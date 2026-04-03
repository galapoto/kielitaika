from __future__ import annotations

from datetime import datetime, UTC, timedelta
from typing import Any

from yki.contracts import (
    LISTENING_PLAYBACK_LIMIT,
    SECTION_ORDER,
    SPEAKING_MAX_RECORDING_SECONDS,
    WRITING_MINIMUM_WORDS,
    WRITING_RECOMMENDED_MAX_WORDS,
    DEFAULT_USER_ID,
    OrchestratedSession,
    activate_section,
    clamp_score,
    coerce_audio_duration_seconds,
    compute_session_hash,
    get_current_task,
    new_orchestrated_session,
)
from yki.engine_client import EngineClient
from yki.errors import ContractViolation, EngineFailure, InvalidTransition, SessionNotFound
from yki.session_registry import SessionRegistry
from yki.state_machine import compute_next_state
from yki.view_builder import build_certificate, build_governed_session_payload


class YKIOrchestrator:
    def __init__(
        self,
        engine: EngineClient | Any | None = None,
        registry: SessionRegistry | None = None,
        now_provider=None,
    ):
        self.engine = engine or EngineClient()
        self.registry = registry or SessionRegistry()
        self.now_provider = now_provider or (lambda: datetime.now(UTC))

    async def start_session(self, user_id: str = DEFAULT_USER_ID, payload: dict | None = None):
        engine_data = await self.engine.start_exam(payload or {})
        session = self._initialize_session(engine_data, user_id=user_id)
        self.registry.save(session)
        return {"session_id": session.session_id}

    async def get_session(self, session_id: str):
        session = self._get_required_session(session_id)
        self._enforce_timing(session)
        engine_data = await self.engine.get_session(session.engine_session_id)
        session.last_engine_data = engine_data
        self.registry.save(session)
        return build_governed_session_payload(session, engine_data)

    async def next(self, session_id: str):
        session = self._get_required_session(session_id)
        self._enforce_timing(session)
        session.state = compute_next_state(session, "next")
        await self._refresh_engine_data(session)
        self._maybe_finalize_session(session)
        self._persist(session)
        return {"session_id": session.session_id}

    async def submit_answer(self, session_id: str, payload: dict):
        session = self._get_required_session(session_id)
        self._enforce_timing(session)
        if session.status == "completed":
            raise InvalidTransition("SESSION_READ_ONLY")
        task = get_current_task(session)
        if task is None:
            raise InvalidTransition("NO_TASK_AVAILABLE")
        if task["kind"] not in {"reading_question", "listening_question", "writing_response"}:
            raise InvalidTransition("ANSWER_SUBMISSION_FAILED")

        answer = self._validate_answer(task, payload.get("answer"))
        if task["kind"] == "writing_response":
            await self.engine.submit_writing(
                session.engine_session_id,
                {
                    "task_id": task.get("engine_item_id", task["id"]),
                    "text": answer,
                },
            )
        else:
            engine_payload = {
                "item_id": task.get("engine_item_id", task["id"]),
                "question_id": task.get("engine_question_id", task["id"]),
                "answer": self._coerce_engine_answer(task, answer),
            }
            await self.engine.submit_answer(session.engine_session_id, engine_payload)
        task["evaluation"] = self._evaluate_text_task(task, answer)
        session.answers[task["id"]] = answer
        session.state = compute_next_state(session, "answer")
        await self._refresh_engine_data(session)
        self._persist(session)
        return {"session_id": session.session_id}

    async def play_audio(self, session_id: str, payload: dict | None = None):
        session = self._get_required_session(session_id)
        self._enforce_timing(session)
        if session.status == "completed":
            raise InvalidTransition("SESSION_READ_ONLY")
        task = get_current_task(session)
        if task is None or task["kind"] != "listening_prompt":
            raise InvalidTransition("NOT_LISTENING_SECTION")
        if not task.get("audio"):
            raise ContractViolation("AUDIO_ASSET_MISSING")
        play_count = session.audio_playback.get(task["id"], 0)
        if play_count >= task.get("playback_limit", LISTENING_PLAYBACK_LIMIT):
            raise InvalidTransition("PLAYBACK_LIMIT_REACHED")
        session.audio_playback[task["id"]] = play_count + 1
        session.state = compute_next_state(session, "play_audio")
        self._persist(session)
        return {"session_id": session.session_id}

    async def submit_recording(self, session_id: str, payload: dict):
        session = self._get_required_session(session_id)
        self._enforce_timing(session)
        if session.status == "completed":
            raise InvalidTransition("SESSION_READ_ONLY")
        task = get_current_task(session)
        if task is None or task["kind"] != "speaking_response":
            raise InvalidTransition("NOT_SPEAKING_SECTION")

        audio_ref = self._validate_recording(payload.get("audio"))
        await self.engine.submit_speaking(
            session.engine_session_id,
            {
                "item_id": task.get("engine_item_id", task["id"]),
                "audio_file_path": audio_ref,
                "duration_sec": max(1.0, float(coerce_audio_duration_seconds(audio_ref))),
            },
        )
        task["evaluation"] = self._evaluate_audio_task(audio_ref)
        session.recordings[task["id"]] = audio_ref
        session.state = compute_next_state(session, "record")
        await self._refresh_engine_data(session)
        self._persist(session)
        return {"session_id": session.session_id}

    def _get_required_session(self, session_id: str) -> OrchestratedSession:
        session = self.registry.get(session_id)
        if not session:
            raise SessionNotFound()
        return session

    async def _refresh_engine_data(self, session: OrchestratedSession):
        session.last_engine_data = await self.engine.get_session(session.engine_session_id)

    def _initialize_session(self, engine_data: dict, user_id: str) -> OrchestratedSession:
        structure = self._extract_structure(engine_data)
        engine_session_id = self._extract_engine_session_id(engine_data)
        engine_session_token = self._extract_engine_session_token(engine_data)
        session = new_orchestrated_session(
            engine_session_id=engine_session_id,
            engine_session_token=engine_session_token,
            structure=structure,
            user_id=user_id,
        )
        session.last_engine_data = engine_data
        activate_section(session, "reading", now=datetime.fromisoformat(session.started_at))
        return session

    def _extract_engine_session_id(self, engine_data: dict) -> str:
        for key in ("session_id", "sessionId", "id"):
            value = engine_data.get(key)
            if isinstance(value, str) and value:
                return value
        raise ContractViolation("ENGINE_SESSION_ID_MISSING")

    def _extract_engine_session_token(self, engine_data: dict) -> str | None:
        value = engine_data.get("engine_session_token")
        return value if isinstance(value, str) and value else None

    def _extract_structure(self, engine_data: dict) -> dict[str, list[dict[str, Any]]]:
        sections = engine_data.get("sections")
        if not isinstance(sections, list):
            raise ContractViolation("ENGINE_INVALID_RESPONSE")

        normalized = {section: [] for section in SECTION_ORDER}
        for section_payload in sections:
            section_name = self._normalize_section_name(section_payload)
            normalized[section_name] = self._normalize_tasks(
                section_name,
                section_payload,
            )

        missing = [section for section in SECTION_ORDER if not normalized[section]]
        if missing:
            raise ContractViolation("ENGINE_INVALID_RESPONSE")
        return normalized

    def _normalize_section_name(self, section_payload: dict) -> str:
        raw_name = (
            section_payload.get("name")
            or section_payload.get("section_type")
            or section_payload.get("section")
            or section_payload.get("id")
        )
        if raw_name not in SECTION_ORDER:
            raise ContractViolation("ENGINE_INVALID_SECTION")
        return raw_name

    def _normalize_tasks(self, section: str, section_payload: dict[str, Any]) -> list[dict[str, Any]]:
        tasks = (
            section_payload.get("tasks")
            or section_payload.get("items")
            or section_payload.get("screens")
            or []
        )
        normalized = []
        for index, raw_task in enumerate(tasks):
            if raw_task.get("item_id") and (
                raw_task.get("questions") is not None or raw_task.get("prompt") is not None
            ):
                normalized.extend(self._normalize_engine_item(section, raw_task, index))
                continue
            task = {
                "id": raw_task.get("id") or f"{section}-{index + 1}",
                "section": section,
                "title": raw_task.get("title") or f"{section.title()} Step {index + 1}",
                "prompt": raw_task.get("prompt") or raw_task.get("content") or "",
                "instructions": list(raw_task.get("instructions") or []),
            }

            kind = raw_task.get("kind") or raw_task.get("type")
            if kind in {"passage", "reading_passage"}:
                task["kind"] = "reading_passage"
                task["passage"] = raw_task.get("passage") or raw_task.get("content") or ""
            elif kind in {"question", "reading_question", "listening_question"}:
                task["kind"] = (
                    "listening_question" if section == "listening" else "reading_question"
                )
                task["question"] = raw_task.get("question") or raw_task.get("prompt") or ""
                task["options"] = list(raw_task.get("options") or [])
                task["correct_answer"] = raw_task.get("correctAnswer") or raw_task.get("correct_answer")
            elif kind in {"listening_prompt", "listening_audio", "listening_instruction"}:
                task["kind"] = "listening_prompt"
                task["audio"] = raw_task.get("audio") or (
                    {
                        "id": raw_task.get("audioAssetId") or f"{task['id']}-audio",
                        "url": raw_task.get("audioAssetUrl"),
                        "content_type": raw_task.get("audioContentType", "audio/wav"),
                        "duration_ms": raw_task.get("audioDurationMs", 3000),
                        "ready": True,
                    }
                    if raw_task.get("audioAssetUrl")
                    else raw_task.get("audio")
                )
                task["playback_limit"] = raw_task.get("playbackLimit", LISTENING_PLAYBACK_LIMIT)
            elif kind in {"writing_prompt", "writing_instruction"}:
                task["kind"] = "writing_prompt"
                task["question"] = raw_task.get("question") or raw_task.get("prompt") or ""
            elif kind in {"writing_response", "writing_task"}:
                task["kind"] = "writing_response"
                task["question"] = raw_task.get("question") or raw_task.get("prompt") or ""
                task["minimum_words"] = raw_task.get("minimumWords", WRITING_MINIMUM_WORDS)
                task["recommended_max_words"] = raw_task.get(
                    "recommendedMaxWords", WRITING_RECOMMENDED_MAX_WORDS
                )
            elif kind in {"speaking_prompt", "speaking_instruction"}:
                task["kind"] = "speaking_prompt"
                task["question"] = raw_task.get("question") or raw_task.get("prompt") or ""
            elif kind in {"speaking_response", "speaking_recording"}:
                task["kind"] = "speaking_response"
                task["question"] = raw_task.get("question") or raw_task.get("prompt") or ""
                task["max_duration_seconds"] = raw_task.get(
                    "maxDurationSeconds", SPEAKING_MAX_RECORDING_SECONDS
                )
            else:
                raise ContractViolation("ENGINE_INVALID_TASK")

            if not task["instructions"]:
                task["instructions"] = self._default_instructions(task["kind"])
            normalized.append(task)
        return normalized

    def _normalize_engine_item(self, section: str, raw_item: dict[str, Any], index: int) -> list[dict[str, Any]]:
        prompt = raw_item.get("prompt") or {}
        item_id = raw_item.get("item_id") or raw_item.get("id") or f"{section}-item-{index + 1}"
        tasks: list[dict[str, Any]] = []

        if section == "reading":
            tasks.append(
                {
                    "id": f"{item_id}:passage",
                    "section": section,
                    "kind": "reading_passage",
                    "title": prompt.get("title") or "Reading Passage",
                    "prompt": "Read the passage fully before moving to the question phase.",
                    "instructions": self._coerce_instructions(
                        prompt.get("instructions"),
                        "Read the passage fully before moving to the question phase.",
                    ),
                    "passage": prompt.get("text", ""),
                    "engine_item_id": item_id,
                }
            )
            for question in raw_item.get("questions") or []:
                tasks.append(
                    {
                        "id": question["id"],
                        "section": section,
                        "kind": "reading_question",
                        "title": f"Reading Question {question.get('index', 0) + 1}",
                        "prompt": "Choose the best answer based on the passage.",
                        "instructions": self._default_instructions("reading_question"),
                        "question": question.get("question", ""),
                        "options": list(question.get("options") or []),
                        "engine_item_id": item_id,
                        "engine_question_id": question["id"],
                    }
                )
            return tasks

        if section == "listening":
            audio_url = prompt.get("audio_url")
            tasks.append(
                {
                    "id": f"{item_id}:prompt",
                    "section": section,
                    "kind": "listening_prompt",
                    "title": "Listening Prompt",
                    "prompt": prompt.get("instruction") or "Play the prompt before answering.",
                    "instructions": self._coerce_instructions(
                        prompt.get("instructions"),
                        "Play the listening prompt before advancing.",
                    ),
                    "audio": (
                        {
                            "id": f"{item_id}-audio",
                            "url": audio_url,
                            "content_type": "audio/mpeg" if isinstance(audio_url, str) and audio_url.endswith(".mp3") else "audio/wav",
                            "duration_ms": 0,
                            "ready": bool(audio_url),
                        }
                        if audio_url
                        else None
                    ),
                    "playback_limit": LISTENING_PLAYBACK_LIMIT,
                    "engine_item_id": item_id,
                }
            )
            for question in raw_item.get("questions") or []:
                tasks.append(
                    {
                        "id": question["id"],
                        "section": section,
                        "kind": "listening_question",
                        "title": f"Listening Question {question.get('index', 0) + 1}",
                        "prompt": "Choose the best answer based on the audio prompt.",
                        "instructions": self._default_instructions("listening_question"),
                        "question": question.get("question", ""),
                        "options": list(question.get("options") or []),
                        "engine_item_id": item_id,
                        "engine_question_id": question["id"],
                    }
                )
            return tasks

        if section == "writing":
            instructions = prompt.get("instructions")
            tasks.append(
                {
                    "id": f"{item_id}:prompt",
                    "section": section,
                    "kind": "writing_prompt",
                    "title": "Writing Instructions",
                    "prompt": "Read the writing task instructions before opening the response screen.",
                    "instructions": self._coerce_instructions(
                        instructions,
                        "Read the writing task instructions before opening the response screen.",
                    ),
                    "question": instructions or "",
                    "engine_item_id": item_id,
                }
            )
            tasks.append(
                {
                    "id": item_id,
                    "section": section,
                    "kind": "writing_response",
                    "title": "Writing Response",
                    "prompt": "Write your response for the task below.",
                    "instructions": self._default_instructions("writing_response"),
                    "question": instructions or "",
                    "minimum_words": WRITING_MINIMUM_WORDS,
                    "recommended_max_words": WRITING_RECOMMENDED_MAX_WORDS,
                    "engine_item_id": item_id,
                }
            )
            return tasks

        if section == "speaking":
            prompt_text = prompt.get("context") or prompt.get("instruction") or "Read the speaking task."
            recording = raw_item.get("recording") or {}
            tasks.append(
                {
                    "id": f"{item_id}:prompt",
                    "section": section,
                    "kind": "speaking_prompt",
                    "title": "Speaking Instructions",
                    "prompt": "Read the speaking task before opening the response screen.",
                    "instructions": self._coerce_instructions(
                        prompt.get("instructions"),
                        "Read the speaking task before opening the response screen.",
                    ),
                    "question": prompt_text,
                    "engine_item_id": item_id,
                }
            )
            tasks.append(
                {
                    "id": item_id,
                    "section": section,
                    "kind": "speaking_response",
                    "title": "Speaking Response",
                    "prompt": "Record your spoken response for the task below.",
                    "instructions": self._default_instructions("speaking_response"),
                    "question": prompt_text,
                    "max_duration_seconds": int(
                        recording.get("max_duration_sec", SPEAKING_MAX_RECORDING_SECONDS)
                    ),
                    "engine_item_id": item_id,
                }
            )
            return tasks

        raise ContractViolation("ENGINE_INVALID_SECTION")

    def _coerce_instructions(self, value: Any, fallback: str) -> list[str]:
        if isinstance(value, list):
            return [str(item) for item in value]
        if isinstance(value, str) and value.strip():
            return [value]
        return [fallback]

    def _coerce_engine_answer(self, task: dict[str, Any], answer: str) -> int | str:
        options = task.get("options") or []
        if answer in options:
            return options.index(answer)
        return answer

    def _default_instructions(self, kind: str) -> list[str]:
        defaults = {
            "reading_passage": [
                "Read the passage fully before moving to the question phase.",
            ],
            "reading_question": [
                "Submit an answer before advancing.",
            ],
            "listening_prompt": [
                "Play the listening prompt before advancing.",
            ],
            "listening_question": [
                "Submit an answer before advancing.",
            ],
            "writing_prompt": [
                "Read the writing task instructions before opening the response screen.",
            ],
            "writing_response": [
                "Write the response and submit it before advancing.",
            ],
            "speaking_prompt": [
                "Read the speaking task before opening the recording screen.",
            ],
            "speaking_response": [
                "Record the response and submit it before advancing.",
            ],
        }
        return defaults.get(kind, ["This view is backend controlled."])

    def _enforce_timing(self, session: OrchestratedSession):
        current_time = self.now_provider()
        exam_expires_at = datetime.fromisoformat(session.started_at) + timedelta(
            seconds=sum(session.timing_manifest.values())
        )
        if current_time > exam_expires_at:
            raise ContractViolation("SESSION_EXPIRED")

        current_section = session.state.section
        if not current_section:
            return
        expires_at = session.section_windows[current_section]["expires_at"]
        if expires_at and current_time > datetime.fromisoformat(expires_at):
            raise ContractViolation("SECTION_EXPIRED")

    def _validate_answer(self, task: dict[str, Any], answer: Any) -> str:
        if not isinstance(answer, str):
            raise ContractViolation("ANSWER_REQUIRED")
        normalized = answer.strip()
        if not normalized:
            raise ContractViolation("ANSWER_REQUIRED")
        options = task.get("options") or []
        if options and normalized not in options:
            raise ContractViolation("INVALID_OPTION")
        return normalized

    def _validate_recording(self, audio_ref: Any) -> str:
        if not isinstance(audio_ref, str) or not audio_ref.strip():
            raise ContractViolation("AUDIO_REQUIRED")
        normalized = audio_ref.strip()
        if coerce_audio_duration_seconds(normalized) > SPEAKING_MAX_RECORDING_SECONDS:
            raise ContractViolation("AUDIO_TOO_LONG")
        return normalized

    def _evaluate_text_task(self, task: dict[str, Any], answer: str) -> dict[str, Any]:
        if task["kind"] in {"reading_question", "listening_question"}:
            correct_answer = task.get("correct_answer")
            is_correct = answer == correct_answer if isinstance(correct_answer, str) else True
            return {
                "score": 5 if is_correct else 1,
                "maxScore": 5,
                "criteria": [
                    {"name": "content", "score": 5 if is_correct else 1},
                    {"name": "relevance", "score": 5 if is_correct else 1},
                ],
                "feedback": "Answer matched the expected response." if is_correct else "Answer did not match the expected response.",
            }

        word_count = len(answer.split())
        content_score = min(5, max(1, round(word_count / 20))) if word_count else 0
        clarity_score = 5 if any(char in answer for char in ".!?") else 3
        relevance_score = 4 if word_count >= task.get("minimum_words", WRITING_MINIMUM_WORDS) else 2
        accuracy_score = 4 if any(char.isupper() for char in answer) else 3
        criteria = [
            {"name": "content", "score": clamp_score(content_score)},
            {"name": "clarity", "score": clamp_score(clarity_score)},
            {"name": "relevance", "score": clamp_score(relevance_score)},
            {"name": "language_accuracy", "score": clamp_score(accuracy_score)},
        ]
        return {
            "score": round(sum(item["score"] for item in criteria) / len(criteria)),
            "maxScore": 5,
            "criteria": criteria,
            "feedback": "Writing response was recorded by the orchestrator.",
        }

    def _evaluate_audio_task(self, audio_ref: str) -> dict[str, Any]:
        duration_seconds = coerce_audio_duration_seconds(audio_ref)
        content = clamp_score(max(1, round(duration_seconds / 6))) if duration_seconds else 1
        clarity = clamp_score(max(1, round(duration_seconds / 8))) if duration_seconds else 1
        fluency = clamp_score(max(1, round(duration_seconds / 7))) if duration_seconds else 1
        pronunciation = clamp_score(max(1, round(duration_seconds / 9))) if duration_seconds else 1
        relevance = clamp_score(max(1, round(duration_seconds / 6))) if duration_seconds else 1
        criteria = [
            {"name": "content", "score": content},
            {"name": "clarity", "score": clarity},
            {"name": "fluency", "score": fluency},
            {"name": "pronunciation", "score": pronunciation},
            {"name": "relevance", "score": relevance},
        ]
        return {
            "score": round(sum(item["score"] for item in criteria) / len(criteria)),
            "maxScore": 5,
            "criteria": criteria,
            "feedback": "Speaking response was recorded by the orchestrator.",
        }

    def _maybe_finalize_session(self, session: OrchestratedSession):
        if session.status != "completed":
            return
        completion = build_certificate(session)
        session.certificate = completion["certificate"]
        session.learning_feedback = completion["learning_feedback"]

    def _persist(self, session: OrchestratedSession):
        session.session_hash = compute_session_hash(session)
        self.registry.save(session)
