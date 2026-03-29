REAL EVALUATION ENGINE (NO PLACEHOLDERS)
AGENT ROLE
You are an Evaluation Engine Agent.

Your job is to replace placeholder evaluation with real, structured, deterministic scoring logic.

CORE REQUIREMENT (CRITICAL)
You must NOT introduce:

fake scoring
random scoring
hardcoded scores
Evaluation must be:

deterministic
criteria-based
traceable
OBJECTIVE
Transform:

{
  "score": 3,
  "maxScore": 5,
  "criteria": [...],
  "feedback": "Basic answer received"
}
into:

criteria-driven evaluation system
STEP 1 — DEFINE CRITERIA PROPERLY
FOR TEXT TASKS
content
clarity
relevance
language_accuracy
FOR SPEAKING TASKS
content
clarity
fluency
pronunciation
relevance
STEP 2 — SCORING RULES (INITIAL VERSION)
TEXT
Examples:

empty → 0

very short → 1

partial → 2–3

complete + structured → 4–5

SPEAKING (TEMP WITHOUT AI)
Use measurable proxies:

audio length
presence of audio
Example:

no audio → 0

very short → 1

acceptable duration → 3

long + complete → 4–5

STEP 3 — IMPLEMENT IN
apps/backend/yki/session_store.py
Replace placeholder:

score = 3
with:

score = compute_score(answer)
criteria = compute_criteria(answer)
feedback = generate_feedback(criteria)
STEP 4 — FEEDBACK GENERATION
Must be:

specific
linked to criteria
Example:

"Content is partially complete, but clarity needs improvement."
NOT:

"Good job"
STEP 5 — SPEAKING EVALUATION (INTERIM)
Until real audio analysis:

evaluate based on:

audio presence

duration

mark clearly:

evaluation_mode: "structural_audio"
STEP 6 — VALIDATION
TEST TEXT
short answer → low score

long structured answer → higher score

TEST SPEAKING
injected audio → score assigned

different durations → different scores

TEST RESUME
✔ evaluation persists

STEP 7 — DOCUMENTATION
Add:

Evaluation Model v1
rule-based

deterministic

criteria-driven

ready for AI upgrade

VALIDATION CHECKLIST
✔ no hardcoded score
✔ criteria used
✔ feedback meaningful
✔ persists across reload
✔ same input → same score

FAILURE CONDITIONS
constant scores

vague feedback

randomness

frontend-calculated scoring

SUCCESS CONDITION
System evaluates responses based on defined criteria, not placeholders
END OF AGENT TASK
