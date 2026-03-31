DECISION CONTROL LAYER
AGENT ROLE
You are a Decision Control Agent.

OBJECTIVE
Turn recommendation logic into:

explicit, tunable, and stable scoring system
STEP 1 — DEFINE WEIGHTS
Create:

/apps/backend/learning/decision_weights.py
Define:

WEIGHTS = {
    "weak_pattern": 0.3,
    "low_mastery": 0.25,
    "due_review": 0.2,
    "regression": 0.15,
    "difficulty_alignment": 0.1,
}
STEP 2 — APPLY WEIGHTS
Update:

graph_service.py
Each factor must contribute:

weighted_score = factor_score * weight
STEP 3 — NORMALIZE SCORES
Ensure:

final_score ∈ [0, 1]
STEP 4 — TRACE EXTENSION
Extend trace:

score_breakdown:
    weak_pattern: value
    low_mastery: value
    due_review: value
    regression: value
    difficulty: value
    final_score: value
STEP 5 — CONFIGURABILITY
Allow:

weights override via config (optional)
STEP 6 — VALIDATION
Test:

changing weights changes recommendation

same inputs → same outputs

trace matches score calculation

SUCCESS CONDITION
recommendation logic is:
- explicit
- tunable
- explainable
END OF AGENT TASK
