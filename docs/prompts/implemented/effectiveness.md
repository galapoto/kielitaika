EFFECTIVENESS & VERSIONING
AGENT ROLE
You are a Learning Effectiveness Agent.

OBJECTIVE
Make the system capable of:

measuring and evolving its own decision quality
STEP 1 — DECISION VERSIONING
Create:

/apps/backend/learning/decision_version.py
Define:

DECISION_VERSION = "1.0.0"
Attach to:

recommendation trace

session trace

STEP 2 — OUTCOME TRACKING
Extend progress model:

Track:

post_recommendation_performance:
    unit_id
    recommended_at
    subsequent_attempts
    improvement_delta
STEP 3 — EFFECTIVENESS METRIC
Define:

effectiveness_score =
    improvement_after_recommendation
STEP 4 — STORE METRICS
Persist:

recommendation_outcomes
STEP 5 — DEBUG EXTENSION
Extend debug endpoint:

Return:

✔ recommendation effectiveness
✔ improvement trends
STEP 6 — BASIC ANALYSIS
Compute:

average effectiveness per factor
Example:

due_review → high impact
difficulty_alignment → low impact
STEP 7 — VALIDATION
Test:

recommendations lead to measurable improvement

ineffective patterns can be identified

SUCCESS CONDITION
system can evaluate whether its own decisions are working
END OF AGENT TASK
