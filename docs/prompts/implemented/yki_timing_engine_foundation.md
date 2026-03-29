YKI TIMING ENGINE FOUNDATION
AGENT ROLE
You are a YKI Timing Engine Agent.

Your task is to introduce time-based control into the exam session.

You are NOT allowed to:

modify frontend

use client-side timers

implement UI countdown

break contract

OBJECTIVE
Add:

Time-aware session and section control
STEP 1 — ADD SESSION TIMING
MODIFY
apps/backend/yki/session_store.py
UPDATE create_session()
Add:

from datetime import datetime, timedelta
Then extend session:

"timing": {
    "startedAt": datetime.utcnow(),
    "expiresAt": (datetime.utcnow() + timedelta(minutes=120)).isoformat()
}
STEP 2 — ADD SECTION TIMING
ADD CONFIG
SECTION_TIME_LIMITS = {
    "reading": 20,
    "listening": 20,
    "writing": 30,
    "speaking": 30
}
(minutes)

EXTEND SESSION STRUCTURE
Inside each section:

"startedAt": None,
"expiresAt": None
STEP 3 — START TIMER ON SECTION ENTRY
MODIFY advance_section()
After setting next_section:

from datetime import datetime, timedelta

now = datetime.utcnow()

duration = SECTION_TIME_LIMITS[next_section]

session["sections"][next_section]["startedAt"] = now.isoformat()
session["sections"][next_section]["expiresAt"] = (now + timedelta(minutes=duration)).isoformat()
STEP 4 — ADD EXPIRATION CHECK
ADD FUNCTION
def is_session_expired(session):
    from datetime import datetime
    return datetime.utcnow().isoformat() > session["timing"]["expiresAt"]
ADD FUNCTION
def is_section_expired(session):
    from datetime import datetime

    section = session["progress"]["currentSection"]
    if not section:
        return False

    expires_at = session["sections"][section]["expiresAt"]
    if not expires_at:
        return False

    return datetime.utcnow().isoformat() > expires_at
STEP 5 — ENFORCE TIME IN ACTIONS
MODIFY submit_answer, next_task, advance_section
Add at top:

if is_session_expired(session):
    return {"error": "SESSION_EXPIRED"}

if is_section_expired(session):
    return {"error": "SECTION_EXPIRED"}
STEP 6 — ROUTE HANDLING
Ensure backend returns:

"error": { "message": "SESSION_EXPIRED" }
or

"error": { "message": "SECTION_EXPIRED" }
STEP 7 — VALIDATION
TEST
1. Expired session (simulate)
✔ all endpoints → SESSION_EXPIRED

2. Expired section
✔ cannot answer
✔ cannot advance task

3. Valid session still works
✔ no regression

STEP 8 — DOCUMENTATION
Update:

docs/project_plans/monorepo_structure.md
Add:

YKI Timing Engine

Explain:

backend time authority

session vs section expiration

enforcement rules

VALIDATION CHECKLIST
✔ timing added to session
✔ section timers initialized
✔ expiration enforced
✔ contract preserved

FAILURE CONDITIONS
frontend required for timing

time not enforced

expired sessions still active

SUCCESS CONDITION
Backend enforces time-bound exam behavior
