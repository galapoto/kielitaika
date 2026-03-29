ANSWER + EVALUATION FOUNDATION
AGENT ROLE
You are a YKI Answer Handling Agent.

Your task is to introduce:

Answer submission + storage + evaluation hook
You are NOT allowed to:

implement real scoring logic

modify frontend

bypass session_store

break contract

OBJECTIVE
Extend task system so that:

user answers can be submitted

answers are stored in session

evaluation placeholder is attached

STEP 1 — EXTEND TASK STRUCTURE
MODIFY
apps/backend/yki/session_store.py
UPDATE generate_mock_tasks()
def generate_mock_tasks(section_name: str):
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
STEP 2 — ADD ANSWER SUBMISSION
ADD FUNCTION
def submit_answer(session_id: str, answer):
    session = _sessions.get(session_id)
    if not session:
        return None

    section = session["progress"]["currentSection"]
    if not section:
        return None

    section_data = session["sections"][section]
    idx = section_data["currentTaskIndex"]

    if idx >= len(section_data["tasks"]):
        return None

    task = section_data["tasks"][idx]

    task["answer"] = answer
    task["status"] = "answered"

    # placeholder evaluation
    task["evaluation"] = {
        "score": None,
        "feedback": "Not evaluated yet"
    }

    return task
STEP 3 — CONNECT TO ADAPTER
MODIFY
apps/backend/yki/adapter.py
ADD
from yki.session_store import submit_answer

def answer_task(session_id: str, answer):
    return submit_answer(session_id, answer)
STEP 4 — ADD BACKEND ROUTE
MODIFY
apps/backend/main.py
ADD
@app.post("/api/v1/yki/{session_id}/task/answer")
def yki_answer(session_id: str, body: dict):
    answer = body.get("answer")

    result = answer_task(session_id, answer)

    if not result:
        return {
            "ok": False,
            "data": None,
            "error": {"message": "ANSWER_SUBMISSION_FAILED"}
        }

    return success(result)
STEP 5 — VALIDATION
TEST FLOW
1. Start exam
2. Move to reading
3. Get task
4. Submit answer
POST /api/v1/yki/{session_id}/task/answer
{
  "answer": "my response"
}
✔ Response contains:

{
  "answer": "my response",
  "status": "answered",
  "evaluation": { "score": null }
}
5. Fetch session
✔ task now includes stored answer

STEP 6 — DOCUMENTATION
Update:

docs/project_plans/monorepo_structure.md
Add:

YKI Answer Layer

Include:

answer stored in session

evaluation placeholder

backend responsibility

VALIDATION CHECKLIST
✔ answers persist
✔ task status updates
✔ evaluation placeholder exists
✔ backend handles submission

FAILURE CONDITIONS
answers not stored

frontend required to track answers

evaluation done on frontend

SUCCESS CONDITION
Backend now owns user interaction state
END OF AGENT TASK

