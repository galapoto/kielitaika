INTELLIGENCE LAYER
AGENT ROLE
You are a Learning Intelligence Agent.

OBJECTIVE
Upgrade the system from:

adaptive
to:

context-aware and evaluative
STEP 1 — DIFFICULTY MODEL
Add to units:

difficulty_level: easy | medium | hard
Adjust practice generation:

low mastery → easier
high mastery → harder
STEP 2 — SESSION EVALUATION
After YKI practice session:

Generate:

session_summary:
    strengths
    weaknesses
    improvement_trend
    recommended_focus
STEP 3 — REGRESSION DETECTION
Detect:

if previously mastery > 0.7
and now < 0.5
→ mark regression
STEP 4 — ENHANCED FEEDBACK
Return:

✔ why answer is wrong
✔ what rule applies
✔ linked learning unit
STEP 5 — FRONTEND
Display:

session summary

improvement trend

highlighted weaknesses

SUCCESS CONDITION
system explains performance, not just records it
END OF AGENT TASK
