YKI FLOW CONTROL ENGINE
AGENT ROLE
You are a YKI Flow Control Agent.

Your task is to introduce controlled state transitions for exam progression.

You are NOT allowed to:

generate real exam content

modify frontend

introduce UI logic

bypass session_store

OBJECTIVE
Add:

Deterministic session progression logic
STEP 1 — DEFINE FLOW ORDER
MODIFY
apps/backend/yki/session_store.py
ADD
SECTION_ORDER = ["reading", "listening", "writing", "speaking"]
STEP 2 — ADD TRANSITION FUNCTION
ADD
def advance_section(session_id: str):
    session = _sessions.get(session_id)

    if not session:
        return None

    current = session["progress"]["currentSection"]

    if current is None:
        next_section = SECTION_ORDER[0]
    else:
        idx = SECTION_ORDER.index(current)
        if idx + 1 >= len(SECTION_ORDER):
            session["status"] = "completed"
            return session
        next_section = SECTION_ORDER[idx + 1]

    session["progress"]["currentSection"] = next_section

    if next_section not in session["progress"]["completedSections"]:
        session["progress"]["completedSections"].append(next_section)

    return session
STEP 3 — EXPOSE VIA ADAPTER
MODIFY
apps/backend/yki/adapter.py
ADD
from yki.session_store import advance_section

def next_section(session_id: str):
    return advance_section(session_id)
STEP 4 — ADD BACKEND ROUTE
MODIFY
apps/backend/main.py
ADD
@app.post("/api/v1/yki/{session_id}/next")
def yki_next(session_id: str):
    session = next_section(session_id)

    if not session:
        return {
            "ok": False,
            "data": None,
            "error": {"message": "SESSION_NOT_FOUND"}
        }

    return success(session)
STEP 5 — VALIDATION
TEST FLOW
1. Start
POST /api/v1/yki/start
2. Advance repeatedly
POST /api/v1/yki/{session_id}/next
EXPECT SEQUENCE
None → reading → listening → writing → speaking → completed
VERIFY
state changes persist

no skipping sections

final state = completed

STEP 6 — DOCUMENTATION
Update:

docs/project_plans/monorepo_structure.md
Add:

YKI Flow Engine

Include:

section order

backend-controlled transitions

why frontend cannot control flow

VALIDATION CHECKLIST
✔ deterministic order enforced
✔ backend controls progression
✔ session updates persist
✔ no frontend dependency

FAILURE CONDITIONS
frontend required to decide next step

section order bypassed

state not persisted

SUCCESS CONDITION
Backend becomes the exam flow engine
END OF AGENT TASK

