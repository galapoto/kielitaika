PROGRESS & MASTERY
AGENT ROLE
You are a Progress & Mastery Agent.

OBJECTIVE
Turn practice results into:

persistent learning intelligence
CORE RULES
DO NOT modify learning content

DO NOT modify practice generation logic

ONLY build tracking + interpretation layer

STEP 1 — DATA MODEL
Create:

/apps/backend/learning/progress_models.py
Define:

UserUnitProgress:
    user_id
    unit_id
    attempts
    correct_attempts
    last_attempt_at
    mastery_score  # 0–1

UserModuleProgress:
    user_id
    module_id
    completion_percentage
    mastery_score
STEP 2 — STORE PRACTICE RESULTS
Create:

/apps/backend/learning/progress_service.py
Function:

record_practice_result(user_id, exercise, is_correct)
Update:

attempts

correct_attempts

mastery_score

STEP 3 — MASTERY LOGIC
Define:

mastery_score = correct_attempts / attempts
Add thresholds:

0.0–0.4 → weak
0.4–0.7 → improving
0.7–1.0 → mastered
STEP 4 — MODULE COMPLETION
Compute:

module completion = % of units with mastery > 0.7
STEP 5 — API
Add:

POST /api/v1/learning/progress/submit
GET  /api/v1/learning/progress/unit/{unit_id}
GET  /api/v1/learning/progress/module/{module_id}
STEP 6 — FRONTEND
Update PracticeView:

After submit:

→ send result to backend
Add:

progress bar per module

mastery indicator per unit

STEP 7 — CONNECT TO RECOMMENDATION
Update:

learning_practice_recommended()
to use:

low mastery units → priority
STEP 8 — VALIDATION
Test:

repeated practice improves mastery

weak units are prioritized

mastered units appear less

SUCCESS CONDITION
System can:
- remember user performance
- measure mastery
- adapt practice over time
END OF AGENT TASK
