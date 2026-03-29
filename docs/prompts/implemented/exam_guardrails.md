EXAM GUARDRAILS
AGENT ROLE
You are a YKI Guardrail Enforcement Agent.

Your job is to enforce strict rules on session behavior.

You are NOT allowed to:

modify frontend

change API contract

implement scoring logic

remove existing features

OBJECTIVE
Introduce validation rules so that:

Invalid actions are rejected by backend
STEP 1 — PREVENT DOUBLE ANSWERING
MODIFY
apps/backend/yki/session_store.py
UPDATE submit_answer()
Add check BEFORE assigning answer:

if task["status"] == "answered":
    return {"error": "TASK_ALREADY_ANSWERED"}
STEP 2 — PREVENT TASK ADVANCE WITHOUT ANSWER
MODIFY next_task()
Add:

current_task = section_data["tasks"][section_data["currentTaskIndex"]]

if current_task["status"] != "answered":
    return {"error": "TASK_NOT_ANSWERED"}
STEP 3 — PREVENT SECTION ADVANCE WITH UNFINISHED TASKS
MODIFY advance_section()
Add BEFORE switching section:

current = session["progress"]["currentSection"]

if current:
    tasks = session["sections"][current]["tasks"]
    for t in tasks:
        if t["status"] != "answered":
            return {"error": "SECTION_NOT_COMPLETE"}
STEP 4 — HANDLE ERRORS CLEANLY
MODIFY adapter.py
Wrap returns like:

result = submit_answer(session_id, answer)

if isinstance(result, dict) and "error" in result:
    return result
STEP 5 — UPDATE ROUTES
MODIFY main.py
Example:

if isinstance(result, dict) and "error" in result:
    return {
        "ok": False,
        "data": None,
        "error": {"message": result["error"]}
    }
STEP 6 — VALIDATION
TEST CASES
1. Answer same task twice
✔ second attempt → TASK_ALREADY_ANSWERED

2. Advance task without answering
✔ → TASK_NOT_ANSWERED

3. Advance section with incomplete tasks
✔ → SECTION_NOT_COMPLETE

4. Valid flow still works
✔ no regression

STEP 7 — DOCUMENTATION
Update:

docs/project_plans/monorepo_structure.md
Add:

YKI Guardrail Layer

Explain:

backend enforces exam rules

prevents invalid transitions

ensures integrity

VALIDATION CHECKLIST
✔ invalid actions rejected
✔ valid flow unaffected
✔ contract preserved
✔ no frontend dependency

FAILURE CONDITIONS
frontend required to enforce rules

invalid transitions still allowed

silent failures

SUCCESS CONDITION
Backend enforces exam integrity rules
END OF AGENT TASK
