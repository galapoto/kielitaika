YKI TASK DELIVERY FOUNDATION
AGENT ROLE
You are a YKI Task Delivery Agent.

Your task is to introduce task-level state inside each section.

You are NOT allowed to:

generate real YKI content

modify frontend

break session_store structure

bypass backend authority

OBJECTIVE
Extend session state to include:

Tasks inside each section
STEP 1 — EXTEND SESSION STRUCTURE
MODIFY
apps/backend/yki/session_store.py
UPDATE create_session()
ADD tasks structure
"sections": {
    "reading": {
        "tasks": [],
        "currentTaskIndex": 0
    },
    "listening": {
        "tasks": [],
        "currentTaskIndex": 0
    },
    "writing": {
        "tasks": [],
        "currentTaskIndex": 0
    },
    "speaking": {
        "tasks": [],
        "currentTaskIndex": 0
    }
}
STEP 2 — MOCK TASK GENERATION
ADD FUNCTION
def generate_mock_tasks(section_name: str):
    return [
        {"id": f"{section_name}-task-1", "type": "mock"},
        {"id": f"{section_name}-task-2", "type": "mock"}
    ]
STEP 3 — LOAD TASKS ON SECTION ENTRY
MODIFY advance_section()
AFTER setting next_section
if not session["sections"][next_section]["tasks"]:
    session["sections"][next_section]["tasks"] = generate_mock_tasks(next_section)
STEP 4 — EXPOSE CURRENT TASK
ADD FUNCTION
def get_current_task(session_id: str):
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

    return section_data["tasks"][idx]
STEP 5 — ADD NEXT TASK TRANSITION
ADD FUNCTION
def next_task(session_id: str):
    session = _sessions.get(session_id)
    if not session:
        return None

    section = session["progress"]["currentSection"]
    if not section:
        return None

    section_data = session["sections"][section]
    section_data["currentTaskIndex"] += 1

    return session
STEP 6 — CONNECT TO ADAPTER
MODIFY
apps/backend/yki/adapter.py
ADD
from yki.session_store import get_current_task, next_task

def get_task(session_id: str):
    return get_current_task(session_id)

def advance_task(session_id: str):
    return next_task(session_id)
STEP 7 — ADD BACKEND ROUTES
MODIFY
apps/backend/main.py
ADD
@app.get("/api/v1/yki/{session_id}/task")
def yki_task(session_id: str):
    task = get_task(session_id)

    if not task:
        return {
            "ok": False,
            "data": None,
            "error": {"message": "NO_TASK_AVAILABLE"}
        }

    return success(task)


@app.post("/api/v1/yki/{session_id}/task/next")
def yki_next_task(session_id: str):
    session = advance_task(session_id)

    if not session:
        return {
            "ok": False,
            "data": None,
            "error": {"message": "SESSION_NOT_FOUND"}
        }

    return success(session)
STEP 8 — VALIDATION
TEST FLOW
1. Start exam
2. Advance to reading
3. Fetch task
GET /api/v1/yki/{session_id}/task
✔ returns task-1

4. Advance task
POST /api/v1/yki/{session_id}/task/next
5. Fetch again
✔ returns task-2

6. After last task
✔ returns NO_TASK_AVAILABLE

STEP 9 — DOCUMENTATION
Update:

docs/project_plans/monorepo_structure.md
Add:

YKI Task Delivery Layer

Explain:

per-section task structure

backend-controlled task progression

why frontend cannot generate tasks

VALIDATION CHECKLIST
✔ tasks generated per section
✔ tasks persist in session
✔ current task retrievable
✔ task progression works
✔ no frontend logic

FAILURE CONDITIONS
tasks regenerated on each request

frontend required to track index

tasks exist outside session

SUCCESS CONDITION
Backend controls BOTH section and task progression
END OF AGENT TASK
