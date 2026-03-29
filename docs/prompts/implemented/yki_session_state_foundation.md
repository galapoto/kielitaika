YKI SESSION STATE FOUNDATION
AGENT ROLE
You are a YKI Session State Agent.

Your job is to introduce a stateful session system inside the backend.

You are NOT allowed to:

modify frontend

add UI logic

generate exam content

connect real engine yet

OBJECTIVE
Introduce:

Backend-managed session state
So that:

sessions persist during runtime

backend becomes the single source of truth

STEP 1 — CREATE SESSION STORE
CREATE
apps/backend/yki/session_store.py
IMPLEMENT
import uuid
from datetime import datetime

_sessions = {}

def create_session():
    session_id = str(uuid.uuid4())

    session = {
        "sessionId": session_id,
        "status": "active",
        "createdAt": datetime.utcnow().isoformat(),
        "progress": {
            "currentSection": None,
            "completedSections": []
        }
    }

    _sessions[session_id] = session
    return session

def get_session(session_id: str):
    return _sessions.get(session_id)
STEP 2 — CONNECT TO ADAPTER
MODIFY
apps/backend/yki/adapter.py
UPDATE
from yki.session_store import create_session, get_session

def start_exam():
    return create_session()

def get_exam(session_id: str):
    session = get_session(session_id)

    if not session:
        return None

    return session
STEP 3 — HANDLE NULL SESSION SAFELY
MODIFY
apps/backend/main.py
UPDATE ROUTE
@app.get("/api/v1/yki/{session_id}")
def yki_get(session_id: str):
    session = get_exam(session_id)

    if not session:
        return {
            "ok": False,
            "data": None,
            "error": {"message": "SESSION_NOT_FOUND"}
        }

    return success(session)
STEP 4 — VALIDATION
RUN
uvicorn main:app --reload
TEST
1. Start session
POST /api/v1/yki/start
✔ returns unique sessionId

2. Retrieve session
GET /api/v1/yki/{sessionId}
✔ returns SAME session

3. Invalid session
GET /api/v1/yki/invalid-id
✔ returns:

{
  "ok": false,
  "data": null,
  "error": { "message": "SESSION_NOT_FOUND" }
}
STEP 5 — DOCUMENTATION
Update:

docs/project_plans/monorepo_structure.md
Add:

YKI Session Store

Explain:

in-memory for now

will later be replaced (Redis / DB)

backend owns session lifecycle

VALIDATION CHECKLIST
✔ session_store exists
✔ session persists in memory
✔ adapter uses session_store
✔ backend returns correct session
✔ invalid session handled

FAILURE CONDITIONS
session generated but not stored

session recreated on each request

frontend required to track state

SUCCESS CONDITION
Backend now controls exam state lifecycle
END OF AGENT TASK

