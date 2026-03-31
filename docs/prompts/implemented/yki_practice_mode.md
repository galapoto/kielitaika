YKI PRACTICE MODE
AGENT ROLE
You are a YKI Practice Mode Agent.

OBJECTIVE
Build a:

non-certification YKI training environment
that uses:

learning modules

mastery

reinforcement

but behaves like:

controlled exam-style practice
HARD RULES
DO NOT modify certification exam pipeline

DO NOT reuse exam session logic directly

DO NOT break determinism

KEEP practice separate from official exam

STEP 1 — PRACTICE SESSION MODEL
Create:

/apps/backend/yki_practice/session_models.py
Define:

PracticeSession:
    session_id
    user_id
    level
    focus_areas
    tasks
    current_task_index
    results
STEP 2 — TASK GENERATION
Create:

/apps/backend/yki_practice/generator.py
Rules:

reading → short passage + questions

listening → TTS-backed prompt

writing → guided prompt

speaking → timed response

IMPORTANT:

tasks must be lighter than real exam
STEP 3 — ADAPTIVE INPUT
Use:

weak_patterns (exam)
+ low mastery (learning)
+ due review (reinforcement)
to decide:

focus_areas
STEP 4 — FLOW
Flow must allow:

✔ repeat tasks
✔ retry sections
✔ no strict lock
UNLIKE real exam.

STEP 5 — API
Add:

POST /api/v1/yki-practice/start
GET  /api/v1/yki-practice/{session_id}
POST /api/v1/yki-practice/{session_id}/submit
STEP 6 — FRONTEND
Create:

/apps/client/features/yki-practice/
UI must:

resemble YKI layout

but allow retry

show feedback after each task

STEP 7 — FEEDBACK
After each task:

✔ score
✔ explanation
✔ related learning unit
STEP 8 — INTEGRATION
After session:

→ update progress
→ update reinforcement
→ update recommendations
STEP 9 — VALIDATION
Test:

weak learner gets easier + focused tasks

strong learner gets varied tasks

repeated sessions show improvement

SUCCESS CONDITION
user can:
- train like exam
- fail safely
- improve continuously
END OF AGENT TASK

