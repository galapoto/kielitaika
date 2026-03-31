REINFORCEMENT ENGINE
AGENT ROLE
You are a Learning Reinforcement Agent.

OBJECTIVE
Add:

intelligent repetition + spaced reinforcement
on top of existing mastery system.

HARD RULES
DO NOT modify learning content

DO NOT modify practice generation

DO NOT break determinism

ONLY extend progress behavior

STEP 1 — EXTEND PROGRESS MODEL
Update:

UserUnitProgress
Add:

last_practiced_at
next_review_at
review_interval_days
streak_correct
STEP 2 — SPACED REPETITION LOGIC
Define:

if correct:
    streak += 1
    interval = min(7, streak * 2)
else:
    streak = 0
    interval = 1
Then:

next_review_at = now + interval
STEP 3 — UPDATE ON SUBMISSION
In:

record_practice_result(...)
Also update:

streak

interval

next_review_at

STEP 4 — PRIORITY SCORING
Update recommendation logic:

Priority score = combination of:

low mastery
+ due for review (now >= next_review_at)
+ recent mistakes
STEP 5 — NEW ENDPOINT
Add:

GET /api/v1/learning/review/due
Returns:

units due for reinforcement
STEP 6 — FRONTEND
Add:

On LearningHome:

“Review Now” section
Show:

due units

urgency indicator

STEP 7 — PRACTICE INTEGRATION
If user opens:

/practice
System should:

prioritize due units first
STEP 8 — VALIDATION
Test:

correct answers increase interval

wrong answers reset interval

due units appear consistently

recommendations shift toward due units

SUCCESS CONDITION
system ensures:
- weak items repeat
- strong items fade out
- learning stabilizes over time
END OF AGENT TASK

