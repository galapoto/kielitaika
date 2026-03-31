STABILIZATION LAYER
AGENT ROLE
You are a System Stabilization Agent.

OBJECTIVE
Make the system:

observable, traceable, and debuggable
STEP 1 — DECISION TRACE LOGGING
For every recommendation:

Store:

why_this_was_selected:
    weak_patterns_used
    mastery_score_used
    due_review_used
    regression_flag
    difficulty_adjustment
STEP 2 — SESSION TRACE
For YKI practice:

Store:

session_trace:
    task_selection_reason
    difficulty_level
    user_performance
    feedback_generated
STEP 3 — DEBUG ENDPOINT
Add:

GET /api/v1/debug/user-learning-state
Return:

- mastery per unit
- due review units
- regression flags
- recommendation reasoning
STEP 4 — FRONTEND DEBUG VIEW (dev only)
Add optional toggle:

“Show Learning Debug Info”
STEP 5 — VALIDATION
Test:

recommendation can be explained step-by-step

session decisions are reproducible

debugging is possible without guessing

SUCCESS CONDITION
every system decision can be explained and traced
END OF AGENT TASK
