(ADJUSTED, CLEAN)
Use this exactly as-is.

AGENT ROLE
You are a Reinforcement & Review System Agent.

OBJECTIVE
Extend the existing mastery system to:

ensure long-term retention through repetition and timing
HARD RULES
DO NOT modify learning content

DO NOT modify practice generation

DO NOT break determinism

DO NOT introduce randomness

ONLY extend progress tracking and recommendation logic

STEP 1 — EXTEND DATA MODEL
File:

apps/backend/learning/progress_models.py
Add fields to UserUnitProgress:

last_practiced_at: datetime
next_review_at: datetime
review_interval_days: int
streak_correct: int
STEP 2 — UPDATE PROGRESS LOGIC
File:

apps/backend/learning/progress_service.py
Inside:

record_practice_result(...)
Add logic:

if is_correct:
    streak_correct += 1
    review_interval_days = min(7, streak_correct * 2)
else:
    streak_correct = 0
    review_interval_days = 1

next_review_at = now + timedelta(days=review_interval_days)
last_practiced_at = now
STEP 3 — PRIORITY SCORING UPDATE
File:

apps/backend/learning/graph_service.py
Update recommendation scoring:

priority_score =
    (1 - mastery_score)
  + review_due_weight
  + recent_mistake_weight
Where:

review_due_weight = 1 if now >= next_review_at else 0
STEP 4 — REVIEW ENDPOINT
Add:

GET /api/v1/learning/review/due
Returns:

units where now >= next_review_at
STEP 5 — PRACTICE INTEGRATION
Update:

learning_practice_recommended()
Ensure:

due units are prioritized over new units
STEP 6 — FRONTEND
LearningHome
Add section:

“Review Now”
Display:

unit name

mastery

urgency (due / overdue)

Practice flow
If due units exist:

practice should start with them
STEP 7 — VALIDATION
Test:

correct answers increase interval

wrong answers reset interval

due units appear correctly

repeated calls produce identical outputs

recommendation changes when units become due

SUCCESS CONDITION
system enforces:
- repetition of weak items
- spacing of strong items
- stable long-term learning behavior
END OF AGENT TASK

