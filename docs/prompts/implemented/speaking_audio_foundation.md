SPEAKING AUDIO FOUNDATION
AGENT ROLE
You are a YKI Speaking Pipeline Agent.

Your task is to introduce audio submission handling into the backend.

You are NOT allowed to:

implement real audio storage (no S3 yet)

modify frontend

add evaluation logic

break existing task system

OBJECTIVE
Extend task system so that:

Speaking tasks accept audio submissions
STEP 1 — EXTEND TASK STRUCTURE
MODIFY
apps/backend/yki/session_store.py
UPDATE generate_mock_tasks()
Add conditional for speaking:

def generate_mock_tasks(section_name: str):
    if section_name == "speaking":
        return [
            {
                "id": f"{section_name}-task-1",
                "type": "speaking",
                "audio": None,
                "status": "pending",
                "evaluation": None
            }
        ]

    return [
        {
            "id": f"{section_name}-task-1",
            "type": "mock",
            "answer": None,
            "status": "pending",
            "evaluation": None
        },
        {
            "id": f"{section_name}-task-2",
            "type": "mock",
            "answer": None,
            "status": "pending",
            "evaluation": None
        }
    ]
STEP 2 — ADD AUDIO SUBMISSION
ADD FUNCTION
def submit_audio(session_id: str, audio_ref: str):
    session = _sessions.get(session_id)
    if not session:
        return None

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

    task["evaluation"] = {
        "score": None,
        "feedback": "Audio received, not evaluated"
    }

    return task
STEP 3 — CONNECT TO ADAPTER
MODIFY
apps/backend/yki/adapter.py
ADD
from yki.session_store import submit_audio

def answer_audio(session_id: str, audio_ref: str):
    return submit_audio(session_id, audio_ref)
STEP 4 — ADD ROUTE
MODIFY
apps/backend/main.py
ADD
@app.post("/api/v1/yki/{session_id}/task/audio")
def yki_audio(session_id: str, body: dict):
    audio_ref = body.get("audio")

    result = answer_audio(session_id, audio_ref)

    if not result:
        return {
            "ok": False,
            "data": None,
            "error": {"message": "AUDIO_SUBMISSION_FAILED"}
        }

    if "error" in result:
        return {
            "ok": False,
            "data": None,
            "error": {"message": result["error"]}
        }

    return success(result)
STEP 5 — VALIDATION
TEST
1. Move to speaking section
2. Submit audio
POST /api/v1/yki/{session_id}/task/audio

{
  "audio": "audio-file-ref-123"
}
✔ Expect:

{
  "audio": "audio-file-ref-123",
  "status": "answered"
}
3. Submit again
✔ → TASK_ALREADY_ANSWERED

4. Try in non-speaking section
✔ → NOT_SPEAKING_SECTION

STEP 6 — DOCUMENTATION
Update:

docs/project_plans/monorepo_structure.md
Add:

YKI Speaking Pipeline

Explain:

audio handled as reference

backend owns audio linkage

evaluation deferred

VALIDATION CHECKLIST
✔ speaking tasks created
✔ audio stored in task
✔ correct section enforcement
✔ contract preserved

FAILURE CONDITIONS
audio stored in frontend

audio overwrites existing answer

speaking treated like text task

SUCCESS CONDITION
Speaking tasks behave as audio-based interactions
END OF AGENT TASK

