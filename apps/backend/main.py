from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from api_contract import failure, record_contract_action, success

from learning.adapter import (
    get_learning_debug_state,
    get_learning_due_review,
    get_learning_modules,
    get_learning_module_progress,
    get_learning_practice,
    get_learning_unit_progress,
    get_learning_unit,
    get_recommended_learning_practice,
    get_related_learning_units,
    submit_learning_progress,
)
from yki.adapter import (
    advance_task,
    answer_audio,
    answer_task,
    get_exam_certificate,
    get_exam,
    get_user_progress_history,
    get_task,
    next_section,
    play_current_listening_prompt,
    resume_exam,
    start_exam,
)
from yki_practice.adapter import get_yki_practice, start_yki_practice, submit_yki_practice

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/api/v1/auth/status")
def auth_status():
    return success({"isAuthenticated": False})


@app.get("/api/v1/home")
def home():
    return success({"message": "Home data loaded"})


@app.get("/api/v1/learning/modules")
def learning_modules():
    return success(get_learning_modules())


@app.get("/api/v1/learning/unit/{unit_id}")
def learning_unit(unit_id: str):
    unit = get_learning_unit(unit_id)

    if not unit:
        return failure("UNIT_NOT_FOUND")

    return success(unit)


@app.get("/api/v1/learning/related/{unit_id}")
def learning_related(unit_id: str):
    related = get_related_learning_units(unit_id)

    if not related:
        return failure("UNIT_NOT_FOUND")

    return success(related)


@app.get("/api/v1/learning/practice/module/{module_id}")
def learning_practice_module(module_id: str):
    practice = get_learning_practice(module_id)

    if not practice:
        return failure("MODULE_NOT_FOUND")

    return success(practice)


@app.get("/api/v1/learning/practice/recommended")
def learning_practice_recommended():
    practice = get_recommended_learning_practice()

    if not practice:
        return failure("PRACTICE_NOT_AVAILABLE")

    return success(practice)


@app.get("/api/v1/learning/review/due")
def learning_review_due():
    return success({"units": get_learning_due_review()})


@app.post("/api/v1/learning/progress/submit")
def learning_progress_submit(body: dict):
    exercise = body.get("exercise")
    is_correct = body.get("isCorrect")

    if not exercise or not isinstance(is_correct, bool):
        return failure("INVALID_PROGRESS_SUBMISSION")

    progress = submit_learning_progress(exercise, is_correct)

    if not progress:
        return failure("PROGRESS_SUBMISSION_FAILED")

    return success(progress)


@app.get("/api/v1/learning/progress/unit/{unit_id}")
def learning_progress_unit(unit_id: str):
    progress = get_learning_unit_progress(unit_id)

    if not progress:
        return failure("UNIT_NOT_FOUND")

    return success(progress)


@app.get("/api/v1/learning/progress/module/{module_id}")
def learning_progress_module(module_id: str):
    progress = get_learning_module_progress(module_id)

    if not progress:
        return failure("MODULE_NOT_FOUND")

    return success(progress)


@app.get("/api/v1/debug/user-learning-state")
def debug_user_learning_state():
    return success(get_learning_debug_state())


@app.get("/api/v1/yki")
def yki():
    return success({"status": "YKI placeholder"})


@app.post("/api/v1/yki-practice/start")
def yki_practice_start():
    response = success(start_yki_practice())
    record_contract_action("YKI_PRACTICE_START", response["data"]["session_id"], {}, response)
    return response


@app.get("/api/v1/yki-practice/{session_id}")
def yki_practice_get(session_id: str):
    session = get_yki_practice(session_id)

    if not session:
        return failure("SESSION_NOT_FOUND")

    response = success(session)
    record_contract_action("YKI_PRACTICE_FETCH", session_id, {"session_id": session_id}, response)
    return response


@app.post("/api/v1/yki-practice/{session_id}/submit")
def yki_practice_submit(session_id: str, body: dict):
    answer = body.get("answer")
    action = body.get("action", "submit_and_next")
    session = submit_yki_practice(session_id, answer, action)

    if not session:
        return failure("SESSION_NOT_FOUND")

    if isinstance(session, dict) and "error" in session:
        return failure(session["error"])

    response = success(session)
    record_contract_action(
        "YKI_PRACTICE_SUBMIT",
        session_id,
        {
            "action": action,
            "answer": answer,
            "session_id": session_id,
        },
        response,
    )
    return response


@app.post("/api/v1/yki/start")
def yki_start():
    return success(start_exam())


@app.get("/api/v1/yki/resume/{session_id}")
def yki_resume(session_id: str):
    session = resume_exam(session_id)

    if isinstance(session, dict) and "error" in session:
        return failure(session["error"])

    response = success(session)
    record_contract_action("YKI_SESSION_RESUME", session_id, {"session_id": session_id}, response)
    return response


@app.get("/api/v1/yki/history")
def yki_history():
    return success(get_user_progress_history())


@app.get("/api/v1/yki/{session_id}")
def yki_get(session_id: str):
    session = get_exam(session_id)

    if not session:
        return failure("SESSION_NOT_FOUND")
    if isinstance(session, dict) and "error" in session:
        return failure(session["error"])

    response = success(session)
    record_contract_action("YKI_SESSION_FETCH", session_id, {"session_id": session_id}, response)
    return response


@app.get("/api/v1/yki/{session_id}/certificate")
def yki_certificate(session_id: str):
    certificate = get_exam_certificate(session_id)

    if not certificate:
        return failure("EXAM_NOT_FINISHED")
    if isinstance(certificate, dict) and "error" in certificate:
        return failure(certificate["error"])

    return success(certificate)


@app.post("/api/v1/yki/{session_id}/next")
def yki_next(session_id: str):
    session = next_section(session_id)

    if not session:
        return failure("SESSION_NOT_FOUND")
    if isinstance(session, dict) and "error" in session:
        return failure(session["error"])

    response = success(session)
    record_contract_action("YKI_SESSION_ADVANCE", session_id, {"session_id": session_id}, response)
    return response


@app.get("/api/v1/yki/{session_id}/task")
def yki_task(session_id: str):
    task = get_task(session_id)

    if not task:
        return failure("NO_TASK_AVAILABLE")
    if isinstance(task, dict) and "error" in task:
        return failure(task["error"])

    return success(task)


@app.post("/api/v1/yki/{session_id}/task/next")
def yki_next_task(session_id: str):
    session = advance_task(session_id)

    if not session:
        return failure("SESSION_NOT_FOUND")
    if isinstance(session, dict) and "error" in session:
        return failure(session["error"])

    response = success(session)
    _record_contract_action("YKI_TASK_ADVANCE", session_id, {"session_id": session_id}, response)
    return response


@app.post("/api/v1/yki/{session_id}/task/answer")
def yki_answer(session_id: str, body: dict):
    answer = body.get("answer")
    result = answer_task(session_id, answer)

    if not result:
        return failure("ANSWER_SUBMISSION_FAILED")
    if isinstance(result, dict) and "error" in result:
        return failure(result["error"])

    response = success(result)
    record_contract_action(
        "YKI_TASK_SUBMIT",
        session_id,
        {"answer": answer, "session_id": session_id},
        response,
    )
    return response


@app.post("/api/v1/yki/{session_id}/task/audio")
def yki_audio(session_id: str, body: dict):
    audio_ref = body.get("audio")
    result = answer_audio(session_id, audio_ref)

    if not result:
        return failure("AUDIO_SUBMISSION_FAILED")
    if isinstance(result, dict) and "error" in result:
        return failure(result["error"])

    return success(result)


@app.post("/api/v1/yki/{session_id}/task/play")
def yki_play_task(session_id: str):
    result = play_current_listening_prompt(session_id)

    if not result:
        return failure("PLAYBACK_FAILED")
    if isinstance(result, dict) and "error" in result:
        return failure(result["error"])

    return success(result)


@app.get("/api/v1/practice")
def practice():
    return success({"status": "Practice placeholder"})
