import asyncio

from yki.errors import YKIError
from yki.orchestrator import YKIOrchestrator

orchestrator = YKIOrchestrator()


def _run(coro):
    try:
        return asyncio.run(coro)
    except YKIError as exc:
        return {"error": exc.code}


def start_governed_exam():
    return _run(orchestrator.start_session())


def get_governed_exam(session_id: str):
    return _run(orchestrator.get_session(session_id))


def advance_governed_exam(session_id: str):
    return _run(orchestrator.next(session_id))


def answer_governed_task(session_id: str, answer):
    return _run(orchestrator.submit_answer(session_id, {"answer": answer}))


def answer_governed_audio(session_id: str, audio_ref: str):
    return _run(orchestrator.submit_recording(session_id, {"audio": audio_ref}))


def play_governed_listening_prompt(session_id: str):
    return _run(orchestrator.play_audio(session_id))
