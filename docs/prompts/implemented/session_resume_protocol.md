SESSION RESUME PROTOCOL
AGENT ROLE
You are a Session Continuity Agent.

Your job is to allow a client to:

reconnect to an existing active session
without restarting the exam.

OBJECTIVE
Introduce a safe and deterministic:

session resume mechanism
CONSTRAINTS
You are NOT allowed to:

change existing endpoints

change session structure

modify evaluation logic

break contract

You may only:

add new endpoint(s)

expose existing state safely

STEP 1 — ADD RESUME ENDPOINT
ROUTE
GET /api/v1/yki/resume/{session_id}
RESPONSE
Must return:

{
  "ok": true,
  "data": {
    "sessionId": "...",
    "currentSection": "...",
    "currentTaskId": "...",
    "sectionProgress": {...},
    "timing": {...}
  },
  "error": null
}
STEP 2 — RESUME LOGIC
FILE
apps/backend/yki/session_store.py
IMPLEMENT
def resume_session(session_id):
    session = storage.get(session_id)

    if not session:
        meta = storage.get_meta(session_id)

        if meta:
            raise SESSION_EXPIRED
        else:
            raise SESSION_NOT_FOUND

    return {
        "sessionId": session["sessionId"],
        "currentSection": session["currentSection"],
        "currentTaskId": session.get("currentTaskId"),
        "sectionProgress": session.get("sections"),
        "timing": session.get("timing")
    }
STEP 3 — DO NOT RECOMPUTE STATE
Critical rule:

resume MUST return stored state
NOT:

reconstructed state
STEP 4 — VALIDATION
TEST 1 — active session
start session

progress to reading

call resume

✔ must return correct section + task

TEST 2 — after restart
✔ resume still works

TEST 3 — expired session
✔ returns SESSION_EXPIRED

TEST 4 — invalid session
✔ returns SESSION_NOT_FOUND

STEP 5 — DOCUMENTATION
Update:

docs/project_plans/monorepo_structure.md
Add:

Session Resume Contract
client must store sessionId

resume endpoint restores state

no reconstruction allowed

VALIDATION CHECKLIST
✔ resume returns correct state
✔ works after restart
✔ respects expiry semantics
✔ no contract break

FAILURE CONDITIONS
resume recomputes instead of reading

mismatch between stored and returned state

incorrect task pointer

SUCCESS CONDITION
User can continue exam seamlessly after reconnect
END OF AGENT TASK
