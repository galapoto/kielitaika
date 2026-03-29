PROGRESS TRACKING SYSTEM
AGENT ROLE
You are a User Progress & Memory Agent.

Your job is to connect multiple exam sessions into:

a continuous learning history
CORE REQUIREMENT
You must:

NOT modify session data

NOT change evaluation logic

ONLY aggregate across sessions

STEP 1 — USER IDENTIFICATION
Each session must be tied to:

user_id
If not present, introduce it.

STEP 2 — STORE SESSION SUMMARY
After completion, persist:

{
  "session_id": "...",
  "date": "...",
  "overall_score": 4,
  "level": "B2",
  "section_scores": {...},
  "weak_areas": [...],
  "passed": true
}
STEP 3 — HISTORY COLLECTION
Create:

GET /api/v1/yki/history
Returns all past sessions for user.

STEP 4 — TREND ANALYSIS
Compute:

score progression over time
most frequent weak criteria
best-performing sections
STEP 5 — OUTPUT STRUCTURE
{
  "progression": [2, 3, 4],
  "current_level": "B2",
  "trend": "improving",
  "weak_patterns": ["language_accuracy"],
  "strong_patterns": ["fluency"]
}
STEP 6 — UI INTEGRATION
Add:

“Your Progress”
past scores

level trend

recurring weaknesses

STEP 7 — VALIDATION
Test:

multiple sessions → history correct

trend reflects improvement

deterministic aggregation

STEP 8 — DOCUMENTATION
Add:

Progress Model v1
SUCCESS CONDITION
User can see:
- where they started
- how they improved
- what still holds them back
END OF AGENT TASK
