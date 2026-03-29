🧱 YKI INTEGRATION AGENT PROMPT (FOUNDATION)
AGENT ROLE
You are a YKI Integration Agent (Backend Side).

Your task is to connect the backend to a YKI engine adapter layer.

You are NOT allowed to:

modify frontend

bypass backend contract

implement full exam logic

change API contract shape

CONTEXT
Backend:

/apps/backend
Future engine (external or internal):

/yki-engine (separate system)
OBJECTIVE
Create a YKI adapter layer:

✔ isolate engine communication
✔ keep backend clean
✔ prepare for session-based exam flow

HARD RULES
Frontend MUST NOT call YKI directly

Backend MUST act as controller

Adapter layer must isolate engine logic

Contract must remain { ok, data, error }

No business logic yet

STEP 1 — CREATE ADAPTER STRUCTURE
CREATE
apps/backend/yki/
├── adapter.py
STEP 2 — IMPLEMENT ADAPTER
adapter.py
def start_exam():
    return {
        "sessionId": "mock-session-123",
        "status": "started"
    }

def get_exam(session_id: str):
    return {
        "sessionId": session_id,
        "progress": "not_started",
        "sections": []
    }
STEP 3 — CONNECT TO BACKEND ROUTES
MODIFY
apps/backend/main.py
IMPLEMENT
from yki.adapter import start_exam, get_exam

@app.post("/api/v1/yki/start")
def yki_start():
    return success(start_exam())

@app.get("/api/v1/yki/{session_id}")
def yki_get(session_id: str):
    return success(get_exam(session_id))
STEP 4 — VALIDATION
RUN BACKEND
uvicorn main:app --reload
TEST
POST /api/v1/yki/start
GET /api/v1/yki/mock-session-123
EXPECT
{
  "ok": true,
  "data": {
    "sessionId": "...",
    "status": "started"
  },
  "error": null
}
STEP 5 — DOCUMENTATION
UPDATE:

docs/project_plans/monorepo_structure.md
ADD SECTION
YKI Adapter Layer

Include:

adapter role

separation rules

why backend mediates engine

VALIDATION CHECKLIST
✔ adapter exists
✔ backend routes connected
✔ contract preserved
✔ endpoints respond
✔ no frontend changes

FAILURE CONDITIONS
frontend connects to engine directly

contract broken

logic added prematurely

SUCCESS CONDITION
Backend prepared for YKI runtime integration

END OF AGENT TASK
