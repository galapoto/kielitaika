import asyncio

from yki.errors import YKIError
from yki.orchestrator import YKIOrchestrator

orchestrator = YKIOrchestrator()


def _run(coro):
    try:
        return asyncio.run(coro)
    except YKIError as exc:
        return {"error": exc.code}


def start_governed_exam(payload: dict | None = None):
    return _run(orchestrator.start_session(payload=payload))


def get_governed_exam(session_id: str):
    return _run(orchestrator.get_session(session_id))


def advance_governed_exam(session_id: str):
    return _run(orchestrator.next(session_id))


def answer_governed_task(session_id: str, answer):
    return _run(orchestrator.submit_answer(session_id, {"answer": answer}))


def answer_governed_audio(session_id: str, audio_ref: str, duration_ms: int | None = None):
    payload = {"audio": audio_ref}
    if duration_ms is not None:
        payload["duration_ms"] = duration_ms
    return _run(orchestrator.submit_recording(session_id, payload))


def upload_governed_audio(session_id: str, *, filename: str, content_type: str, content: bytes):
    return _run(
        orchestrator.upload_recording(
            session_id,
            filename=filename,
            content_type=content_type,
            content=content,
        )
    )


def play_governed_listening_prompt(session_id: str):
    return _run(orchestrator.play_audio(session_id))


def record_governed_forensic_event(session_id: str, payload: dict | None = None):
    return _run(orchestrator.record_client_event(session_id, payload))


def get_governed_forensics(session_id: str):
    return _run(orchestrator.get_forensics(session_id))


def get_latest_governed_session_reference():
    return _run(orchestrator.get_latest_session_reference())
