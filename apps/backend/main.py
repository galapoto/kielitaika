import json
from urllib.error import HTTPError, URLError
from urllib.request import urlopen

from fastapi import FastAPI, HTTPException, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import FileResponse, JSONResponse

from api_contract import failure, record_contract_action, resolve_trace_id, success
from audit.audit_logger import next_event_id
from learning.adapter import (
    answer_learning_lesson,
    complete_learning_system_lesson,
    get_learning_debug_state,
    get_learning_due_review,
    get_learning_module_progress,
    get_learning_modules,
    get_learning_practice,
    get_learning_unit,
    get_learning_unit_progress,
    get_recommended_learning_practice,
    get_related_learning_units,
    submit_learning_progress,
)
from practice.adapter import (
    advance_daily_practice_session,
    get_daily_practice_session,
    start_daily_practice_session,
    submit_daily_practice_answer,
)
from speaking.adapter import (
    advance_speaking_session,
    get_speaking_session,
    start_speaking_session,
    submit_speaking_response,
)
from tts.audio_registry import get_audio_asset
from yki.adapter import (
    advance_governed_exam,
    answer_governed_audio,
    answer_governed_task,
    get_governed_exam,
    play_governed_listening_prompt,
    start_governed_exam,
)
from yki.contracts import DEFAULT_USER_ID
from yki.engine_client import get_engine_base_url
from yki_practice.adapter import (
    export_yki_certification,
    get_yki_certification,
    get_yki_practice,
    start_yki_practice,
    submit_yki_practice,
)

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/health")
def health():
    return {"status": "ok"}


@app.get("/engine/health")
def engine_health():
    engine_health_url = f"{get_engine_base_url()}/engine/health"
    try:
        with urlopen(engine_health_url, timeout=5) as response:
            payload = json.loads(response.read().decode("utf-8"))
        return payload
    except HTTPError as exc:
        return JSONResponse(
            status_code=exc.code,
            content={"status": "ERROR", "detail": "ENGINE_HEALTH_HTTP_ERROR"},
        )
    except (URLError, TimeoutError, ValueError):
        return JSONResponse(
            status_code=503,
            content={"status": "ERROR", "detail": "ENGINE_UNAVAILABLE"},
        )


@app.get("/api/audio/{audio_id}")
def audio_asset(audio_id: str):
    asset = get_audio_asset(audio_id)

    if asset is None:
        raise HTTPException(status_code=404, detail="AUDIO_ASSET_MISSING")

    return FileResponse(
        asset["file_path"],
        filename=asset["id"],
        media_type=asset["content_type"],
    )


def _trace_id(request: Request):
    return resolve_trace_id(request.headers.get("x-trace-id"))


def _success_response(
    request: Request,
    data,
    *,
    event_type: str,
    request_payload: dict | None = None,
    session_id: str | None = None,
    user_id: str | None = DEFAULT_USER_ID,
):
    trace_id = _trace_id(request)
    event_id = next_event_id()
    response = success(data, trace_id=trace_id, event_id=event_id)
    record_contract_action(
        event_type,
        session_id,
        request_payload or {},
        response,
        trace_id=trace_id,
        event_id=event_id,
        user_id=user_id,
    )
    return response


def _failure_response(
    request: Request,
    code: str,
    *,
    event_type: str,
    request_payload: dict | None = None,
    session_id: str | None = None,
    user_id: str | None = DEFAULT_USER_ID,
    message: str | None = None,
    retryable: bool = False,
):
    trace_id = _trace_id(request)
    event_id = next_event_id()
    response = failure(
        code,
        message=message,
        retryable=retryable,
        trace_id=trace_id,
        event_id=event_id,
    )
    record_contract_action(
        event_type,
        session_id,
        request_payload or {},
        response,
        trace_id=trace_id,
        event_id=event_id,
        user_id=user_id,
    )
    return response


@app.get("/api/v1/auth/status")
def auth_status(request: Request):
    return _success_response(
        request,
        {"isAuthenticated": False},
        event_type="AUTH_STATUS_LOADED",
        user_id=None,
    )


@app.get("/api/v1/home")
def home(request: Request):
    return _success_response(
        request,
        {"message": "Home data loaded"},
        event_type="HOME_LOADED",
        user_id=None,
    )


@app.get("/api/v1/learning/modules")
def learning_modules(request: Request):
    return _success_response(
        request,
        get_learning_modules(),
        event_type="LEARNING_MODULES_LOADED",
    )


@app.post("/api/v1/learning/modules/{module_id}/lessons/{lesson_id}/answer")
def learning_lesson_answer(module_id: str, lesson_id: str, body: dict, request: Request):
    exercise_id = body.get("exerciseId")
    answer = body.get("answer")

    if not isinstance(exercise_id, str) or not isinstance(answer, str):
        return _failure_response(
            request,
            "LEARNING_ANSWER_INVALID",
            event_type="LEARNING_LESSON_ANSWERED",
            request_payload={
                "module_id": module_id,
                "lesson_id": lesson_id,
                "body": body,
            },
        )

    updated = answer_learning_lesson(module_id, lesson_id, exercise_id, answer)

    if not updated:
        return _failure_response(
            request,
            "LEARNING_LESSON_NOT_FOUND",
            event_type="LEARNING_LESSON_ANSWERED",
            request_payload={
                "module_id": module_id,
                "lesson_id": lesson_id,
                "exercise_id": exercise_id,
            },
        )

    return _success_response(
        request,
        updated,
        event_type="LEARNING_LESSON_ANSWERED",
        request_payload={
            "module_id": module_id,
            "lesson_id": lesson_id,
            "exercise_id": exercise_id,
        },
    )


@app.post("/api/v1/learning/modules/{module_id}/lessons/{lesson_id}/complete")
def learning_lesson_complete(module_id: str, lesson_id: str, request: Request):
    updated = complete_learning_system_lesson(module_id, lesson_id)

    if not updated:
        return _failure_response(
            request,
            "LEARNING_LESSON_NOT_FOUND",
            event_type="LEARNING_LESSON_COMPLETED",
            request_payload={
                "module_id": module_id,
                "lesson_id": lesson_id,
            },
        )

    return _success_response(
        request,
        updated,
        event_type="LEARNING_LESSON_COMPLETED",
        request_payload={
            "module_id": module_id,
            "lesson_id": lesson_id,
        },
    )


@app.get("/api/v1/learning/unit/{unit_id}")
def learning_unit(unit_id: str, request: Request):
    unit = get_learning_unit(unit_id)

    if not unit:
        return _failure_response(
            request,
            "UNIT_NOT_FOUND",
            event_type="LEARNING_UNIT_LOADED",
            request_payload={"unit_id": unit_id},
        )

    return _success_response(
        request,
        unit,
        event_type="LEARNING_UNIT_LOADED",
        request_payload={"unit_id": unit_id},
    )


@app.get("/api/v1/learning/related/{unit_id}")
def learning_related(unit_id: str, request: Request):
    related = get_related_learning_units(unit_id)

    if not related:
        return _failure_response(
            request,
            "UNIT_NOT_FOUND",
            event_type="LEARNING_RELATED_UNITS_LOADED",
            request_payload={"unit_id": unit_id},
        )

    return _success_response(
        request,
        related,
        event_type="LEARNING_RELATED_UNITS_LOADED",
        request_payload={"unit_id": unit_id},
    )


@app.get("/api/v1/learning/practice/module/{module_id}")
def learning_practice_module(module_id: str, request: Request):
    practice = get_learning_practice(module_id)

    if not practice:
        return _failure_response(
            request,
            "MODULE_NOT_FOUND",
            event_type="LEARNING_PRACTICE_LOADED",
            request_payload={"module_id": module_id},
        )

    return _success_response(
        request,
        practice,
        event_type="LEARNING_PRACTICE_LOADED",
        request_payload={"module_id": module_id},
    )


@app.get("/api/v1/learning/practice/recommended")
def learning_practice_recommended(request: Request):
    practice = get_recommended_learning_practice()

    if not practice:
        return _failure_response(
            request,
            "PRACTICE_NOT_AVAILABLE",
            event_type="LEARNING_RECOMMENDED_PRACTICE_LOADED",
        )

    return _success_response(
        request,
        practice,
        event_type="LEARNING_RECOMMENDED_PRACTICE_LOADED",
    )


@app.get("/api/v1/learning/review/due")
def learning_review_due(request: Request):
    return _success_response(
        request,
        {"units": get_learning_due_review()},
        event_type="LEARNING_DUE_REVIEW_LOADED",
    )


@app.post("/api/v1/daily-practice/start")
def daily_practice_start(request: Request):
    return _success_response(
        request,
        start_daily_practice_session(),
        event_type="DAILY_PRACTICE_SESSION_STARTED",
    )


@app.get("/api/v1/daily-practice/{session_id}")
def daily_practice_session(session_id: str, request: Request):
    result = get_daily_practice_session(session_id)

    if isinstance(result, dict) and "error" in result:
        return _failure_response(
            request,
            result["error"],
            event_type="DAILY_PRACTICE_SESSION_LOADED",
            request_payload={"session_id": session_id},
            session_id=session_id,
        )

    return _success_response(
        request,
        result,
        event_type="DAILY_PRACTICE_SESSION_LOADED",
        request_payload={"session_id": session_id},
        session_id=session_id,
    )


@app.post("/api/v1/daily-practice/{session_id}/submit")
def daily_practice_submit(session_id: str, body: dict, request: Request):
    answer = body.get("answer")
    result = submit_daily_practice_answer(session_id, answer)

    if isinstance(result, dict) and "error" in result:
        return _failure_response(
            request,
            result["error"],
            event_type="DAILY_PRACTICE_ANSWER_SUBMITTED",
            request_payload={"answer": answer, "session_id": session_id},
            session_id=session_id,
        )

    return _success_response(
        request,
        result,
        event_type="DAILY_PRACTICE_ANSWER_SUBMITTED",
        request_payload={"answer": answer, "session_id": session_id},
        session_id=session_id,
    )


@app.post("/api/v1/daily-practice/{session_id}/next")
def daily_practice_next(session_id: str, request: Request):
    result = advance_daily_practice_session(session_id)

    if isinstance(result, dict) and "error" in result:
        return _failure_response(
            request,
            result["error"],
            event_type="DAILY_PRACTICE_SESSION_ADVANCED",
            request_payload={"session_id": session_id},
            session_id=session_id,
        )

    return _success_response(
        request,
        result,
        event_type="DAILY_PRACTICE_SESSION_ADVANCED",
        request_payload={"session_id": session_id},
        session_id=session_id,
    )


@app.post("/api/v1/speaking/start")
def speaking_start(request: Request):
    return _success_response(
        request,
        start_speaking_session(),
        event_type="SPEAKING_SESSION_STARTED",
    )


@app.get("/api/v1/speaking/{session_id}")
def speaking_session(session_id: str, request: Request):
    result = get_speaking_session(session_id)

    if isinstance(result, dict) and "error" in result:
        return _failure_response(
            request,
            result["error"],
            event_type="SPEAKING_SESSION_LOADED",
            request_payload={"session_id": session_id},
            session_id=session_id,
        )

    return _success_response(
        request,
        result,
        event_type="SPEAKING_SESSION_LOADED",
        request_payload={"session_id": session_id},
        session_id=session_id,
    )


@app.post("/api/v1/speaking/{session_id}/submit")
def speaking_submit(session_id: str, body: dict, request: Request):
    transcript = body.get("transcript")
    recording_captured = body.get("recordingCaptured", False)

    if not isinstance(transcript, str) or not isinstance(recording_captured, bool):
        return _failure_response(
            request,
            "SPEAKING_SUBMISSION_INVALID",
            event_type="SPEAKING_RESPONSE_SUBMITTED",
            request_payload={"body": body, "session_id": session_id},
            session_id=session_id,
        )

    result = submit_speaking_response(session_id, transcript, recording_captured)

    if isinstance(result, dict) and "error" in result:
        return _failure_response(
            request,
            result["error"],
            event_type="SPEAKING_RESPONSE_SUBMITTED",
            request_payload={"body": body, "session_id": session_id},
            session_id=session_id,
        )

    return _success_response(
        request,
        result,
        event_type="SPEAKING_RESPONSE_SUBMITTED",
        request_payload={"body": body, "session_id": session_id},
        session_id=session_id,
    )


@app.post("/api/v1/speaking/{session_id}/next")
def speaking_next(session_id: str, request: Request):
    result = advance_speaking_session(session_id)

    if isinstance(result, dict) and "error" in result:
        return _failure_response(
            request,
            result["error"],
            event_type="SPEAKING_SESSION_ADVANCED",
            request_payload={"session_id": session_id},
            session_id=session_id,
        )

    return _success_response(
        request,
        result,
        event_type="SPEAKING_SESSION_ADVANCED",
        request_payload={"session_id": session_id},
        session_id=session_id,
    )


@app.post("/api/v1/learning/progress/submit")
def learning_progress_submit(body: dict, request: Request):
    exercise = body.get("exercise")
    is_correct = body.get("isCorrect")

    if not exercise or not isinstance(is_correct, bool):
        return _failure_response(
            request,
            "INVALID_PROGRESS_SUBMISSION",
            event_type="LEARNING_PROGRESS_SUBMITTED",
            request_payload=body,
        )

    progress = submit_learning_progress(exercise, is_correct)

    if not progress:
        return _failure_response(
            request,
            "PROGRESS_SUBMISSION_FAILED",
            event_type="LEARNING_PROGRESS_SUBMITTED",
            request_payload=body,
        )

    return _success_response(
        request,
        progress,
        event_type="LEARNING_PROGRESS_SUBMITTED",
        request_payload=body,
    )


@app.get("/api/v1/learning/progress/unit/{unit_id}")
def learning_progress_unit(unit_id: str, request: Request):
    progress = get_learning_unit_progress(unit_id)

    if not progress:
        return _failure_response(
            request,
            "UNIT_NOT_FOUND",
            event_type="LEARNING_UNIT_PROGRESS_LOADED",
            request_payload={"unit_id": unit_id},
        )

    return _success_response(
        request,
        progress,
        event_type="LEARNING_UNIT_PROGRESS_LOADED",
        request_payload={"unit_id": unit_id},
    )


@app.get("/api/v1/learning/progress/module/{module_id}")
def learning_progress_module(module_id: str, request: Request):
    progress = get_learning_module_progress(module_id)

    if not progress:
        return _failure_response(
            request,
            "MODULE_NOT_FOUND",
            event_type="LEARNING_MODULE_PROGRESS_LOADED",
            request_payload={"module_id": module_id},
        )

    return _success_response(
        request,
        progress,
        event_type="LEARNING_MODULE_PROGRESS_LOADED",
        request_payload={"module_id": module_id},
    )


@app.get("/api/v1/debug/user-learning-state")
def debug_user_learning_state(request: Request):
    return _success_response(
        request,
        get_learning_debug_state(),
        event_type="LEARNING_DEBUG_STATE_LOADED",
    )


@app.get("/api/v1/yki")
def yki(request: Request):
    return _success_response(
        request,
        {"status": "YKI placeholder"},
        event_type="YKI_STATUS_LOADED",
    )


@app.post("/api/v1/yki-practice/start")
def yki_practice_start(request: Request):
    session = start_yki_practice()
    return _success_response(
        request,
        session,
        event_type="YKI_PRACTICE_SESSION_STARTED",
        session_id=session["session_id"],
        user_id=session.get("user_id"),
    )


@app.get("/api/v1/yki-practice/{session_id}")
def yki_practice_get(session_id: str, request: Request):
    session = get_yki_practice(session_id)

    if not session:
        return _failure_response(
            request,
            "SESSION_NOT_FOUND",
            event_type="YKI_PRACTICE_SESSION_RESUMED",
            request_payload={"session_id": session_id},
            session_id=session_id,
        )

    return _success_response(
        request,
        session,
        event_type="YKI_PRACTICE_SESSION_RESUMED",
        request_payload={"session_id": session_id},
        session_id=session_id,
        user_id=session.get("user_id"),
    )


@app.post("/api/v1/yki-practice/{session_id}/submit")
def yki_practice_submit(session_id: str, body: dict, request: Request):
    answer = body.get("answer")
    action = body.get("action", "submit_only")
    session = submit_yki_practice(session_id, answer, action)

    request_payload = {
        "action": action,
        "answer": answer,
        "session_id": session_id,
    }

    if not session:
        return _failure_response(
            request,
            "SESSION_NOT_FOUND",
            event_type="YKI_PRACTICE_SUBMITTED",
            request_payload=request_payload,
            session_id=session_id,
        )

    if isinstance(session, dict) and "error" in session:
        return _failure_response(
            request,
            session["error"],
            event_type="YKI_PRACTICE_SUBMITTED",
            request_payload=request_payload,
            session_id=session_id,
        )

    return _success_response(
        request,
        session,
        event_type="YKI_PRACTICE_SUBMITTED",
        request_payload=request_payload,
        session_id=session_id,
        user_id=session.get("user_id"),
    )


@app.post("/api/v1/yki/start")
def yki_start(request: Request):
    return _failure_response(
        request,
        "YKI_LEGACY_ENDPOINT_DISABLED",
        event_type="YKI_EXAM_SESSION_STARTED",
        message="Use /api/v1/yki/sessions/start.",
    )


@app.post("/api/v1/yki/sessions/start")
def yki_sessions_start(request: Request):
    session = start_governed_exam()

    if isinstance(session, dict) and "error" in session:
        return _failure_response(
            request,
            session["error"],
            event_type="YKI_EXAM_RUNTIME_STARTED",
            retryable=session["error"] in {"ENGINE_TIMEOUT", "ENGINE_UNAVAILABLE"},
        )

    return _success_response(
        request,
        session,
        event_type="YKI_EXAM_RUNTIME_STARTED",
        session_id=session["session_id"],
    )


@app.get("/api/v1/yki/sessions/{session_id}")
def yki_sessions_get(session_id: str, request: Request):
    session = get_governed_exam(session_id)

    if isinstance(session, dict) and "error" in session:
        return _failure_response(
            request,
            session["error"],
            event_type="YKI_EXAM_RUNTIME_LOADED",
            request_payload={"session_id": session_id},
            retryable=session["error"] == "SECTION_EXPIRED",
            session_id=session_id,
        )

    return _success_response(
        request,
        session,
        event_type="YKI_EXAM_RUNTIME_LOADED",
        request_payload={"session_id": session_id},
        session_id=session_id,
    )


@app.post("/api/v1/yki/sessions/{session_id}/next")
def yki_sessions_next(session_id: str, request: Request):
    result = advance_governed_exam(session_id)

    if isinstance(result, dict) and "error" in result:
        return _failure_response(
            request,
            result["error"],
            event_type="YKI_EXAM_RUNTIME_ADVANCED",
            request_payload={"session_id": session_id},
            retryable=result["error"] in {"SECTION_EXPIRED"},
            session_id=session_id,
        )

    return _success_response(
        request,
        result,
        event_type="YKI_EXAM_RUNTIME_ADVANCED",
        request_payload={"session_id": session_id},
        session_id=session_id,
    )


@app.post("/api/v1/yki/sessions/{session_id}/answer")
def yki_sessions_answer(session_id: str, body: dict, request: Request):
    answer = body.get("answer")
    result = answer_governed_task(session_id, answer)

    if isinstance(result, dict) and "error" in result:
        return _failure_response(
            request,
            result["error"],
            event_type="YKI_EXAM_RUNTIME_ANSWERED",
            request_payload={"answer": answer, "session_id": session_id},
            retryable=False,
            session_id=session_id,
        )

    return _success_response(
        request,
        result,
        event_type="YKI_EXAM_RUNTIME_ANSWERED",
        request_payload={"answer": answer, "session_id": session_id},
        session_id=session_id,
    )


@app.post("/api/v1/yki/sessions/{session_id}/audio")
def yki_sessions_audio(session_id: str, body: dict, request: Request):
    audio_ref = body.get("audio")
    result = answer_governed_audio(session_id, audio_ref)

    if isinstance(result, dict) and "error" in result:
        return _failure_response(
            request,
            result["error"],
            event_type="YKI_EXAM_RUNTIME_AUDIO_SUBMITTED",
            request_payload={"audio": audio_ref, "session_id": session_id},
            retryable=False,
            session_id=session_id,
        )

    return _success_response(
        request,
        result,
        event_type="YKI_EXAM_RUNTIME_AUDIO_SUBMITTED",
        request_payload={"audio": audio_ref, "session_id": session_id},
        session_id=session_id,
    )


@app.post("/api/v1/yki/sessions/{session_id}/play")
def yki_sessions_play(session_id: str, request: Request):
    result = play_governed_listening_prompt(session_id)

    if isinstance(result, dict) and "error" in result:
        return _failure_response(
            request,
            result["error"],
            event_type="YKI_EXAM_RUNTIME_PLAYED",
            request_payload={"session_id": session_id},
            retryable=False,
            session_id=session_id,
        )

    return _success_response(
        request,
        result,
        event_type="YKI_EXAM_RUNTIME_PLAYED",
        request_payload={"session_id": session_id},
        session_id=session_id,
    )


@app.get("/api/v1/yki/certification/{session_id}")
def yki_certification(session_id: str, request: Request):
    certification = get_yki_certification(session_id)

    if not certification:
        return _failure_response(
            request,
            "CERTIFICATION_NOT_FOUND",
            event_type="YKI_CERTIFICATION_LOADED",
            request_payload={"session_id": session_id},
            session_id=session_id,
        )

    return _success_response(
        request,
        certification,
        event_type="YKI_CERTIFICATION_LOADED",
        request_payload={"session_id": session_id},
        session_id=session_id,
    )


@app.get("/api/v1/yki/certification/{session_id}/export")
def yki_certification_export(session_id: str, request: Request):
    export_payload = export_yki_certification(session_id)

    if not export_payload:
        return _failure_response(
            request,
            "CERTIFICATION_NOT_FOUND",
            event_type="YKI_CERTIFICATION_EXPORTED",
            request_payload={"session_id": session_id},
            session_id=session_id,
        )

    return _success_response(
        request,
        export_payload,
        event_type="YKI_CERTIFICATION_EXPORTED",
        request_payload={"session_id": session_id},
        session_id=session_id,
    )


@app.get("/api/v1/yki/resume/{session_id}")
def yki_resume(session_id: str, request: Request):
    return _failure_response(
        request,
        "YKI_LEGACY_ENDPOINT_DISABLED",
        event_type="YKI_EXAM_SESSION_RESUMED",
        request_payload={"session_id": session_id},
        session_id=session_id,
        message="Use /api/v1/yki/sessions/{session_id}.",
    )


@app.get("/api/v1/yki/history")
def yki_history(request: Request):
    return _failure_response(
        request,
        "YKI_LEGACY_ENDPOINT_DISABLED",
        event_type="YKI_HISTORY_LOADED",
        message="Use /api/v1/yki/sessions/{session_id} for governed runtime state.",
    )


@app.get("/api/v1/yki/{session_id}")
def yki_get(session_id: str, request: Request):
    return _failure_response(
        request,
        "YKI_LEGACY_ENDPOINT_DISABLED",
        event_type="YKI_EXAM_SESSION_LOADED",
        request_payload={"session_id": session_id},
        session_id=session_id,
        message="Use /api/v1/yki/sessions/{session_id}.",
    )


@app.get("/api/v1/yki/{session_id}/certificate")
def yki_certificate(session_id: str, request: Request):
    return _failure_response(
        request,
        "YKI_LEGACY_ENDPOINT_DISABLED",
        event_type="YKI_CERTIFICATE_LOADED",
        request_payload={"session_id": session_id},
        session_id=session_id,
        message="Use /api/v1/yki/certification/{session_id}.",
    )


@app.post("/api/v1/yki/{session_id}/next")
def yki_next(session_id: str, request: Request):
    return _failure_response(
        request,
        "YKI_LEGACY_ENDPOINT_DISABLED",
        event_type="YKI_EXAM_SECTION_ADVANCED",
        request_payload={"session_id": session_id},
        session_id=session_id,
        message="Use /api/v1/yki/sessions/{session_id}/next.",
    )


@app.get("/api/v1/yki/{session_id}/task")
def yki_task(session_id: str, request: Request):
    return _failure_response(
        request,
        "YKI_LEGACY_ENDPOINT_DISABLED",
        event_type="YKI_EXAM_TASK_LOADED",
        request_payload={"session_id": session_id},
        session_id=session_id,
        message="Use /api/v1/yki/sessions/{session_id}.",
    )


@app.post("/api/v1/yki/{session_id}/task/next")
def yki_next_task(session_id: str, request: Request):
    return _failure_response(
        request,
        "YKI_LEGACY_ENDPOINT_DISABLED",
        event_type="YKI_EXAM_TASK_ADVANCED",
        request_payload={"session_id": session_id},
        session_id=session_id,
        message="Use /api/v1/yki/sessions/{session_id}/next.",
    )


@app.post("/api/v1/yki/{session_id}/task/answer")
def yki_answer(session_id: str, body: dict, request: Request):
    return _failure_response(
        request,
        "YKI_LEGACY_ENDPOINT_DISABLED",
        event_type="YKI_EXAM_TASK_ANSWERED",
        request_payload={"answer": body.get("answer"), "session_id": session_id},
        session_id=session_id,
        message="Use /api/v1/yki/sessions/{session_id}/answer.",
    )


@app.post("/api/v1/yki/{session_id}/task/audio")
def yki_audio(session_id: str, body: dict, request: Request):
    return _failure_response(
        request,
        "YKI_LEGACY_ENDPOINT_DISABLED",
        event_type="YKI_EXAM_AUDIO_ANSWERED",
        request_payload={"audio": body.get("audio"), "session_id": session_id},
        session_id=session_id,
        message="Use /api/v1/yki/sessions/{session_id}/audio.",
    )


@app.post("/api/v1/yki/{session_id}/task/play")
def yki_play_task(session_id: str, request: Request):
    return _failure_response(
        request,
        "YKI_LEGACY_ENDPOINT_DISABLED",
        event_type="YKI_EXAM_TASK_PLAYED",
        request_payload={"session_id": session_id},
        session_id=session_id,
        message="Use /api/v1/yki/sessions/{session_id}/play.",
    )


@app.get("/api/v1/practice")
def practice(request: Request):
    return _success_response(
        request,
        {"status": "Practice placeholder"},
        event_type="PRACTICE_STATUS_LOADED",
    )
