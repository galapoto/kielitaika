PRACTICE ENGINE
AGENT ROLE
You are a Practice Engine Agent.

OBJECTIVE
Turn learning content into:

interactive exercises
CORE REQUIREMENT
DO NOT change content structure

DO NOT break graph relationships

BUILD on top of existing units

STEP 1 — PRACTICE TYPES
Implement:

1. Vocabulary Practice
   - word → translation
   - translation → word

2. Grammar Practice
   - fill in the blank
   - sentence correction

3. Phrase Practice
   - complete sentence
   - choose correct phrase
STEP 2 — BACKEND
Create:

/apps/backend/learning/practice_service.py
Functions:

generate_practice(module_id)
generate_practice_from_weakness(user_id)
STEP 3 — PRACTICE OBJECT
Example:

{
  "type": "fill_blank",
  "question": "Minä ___ opiskelija.",
  "correct_answer": "olen",
  "unit_id": "word_olla"
}
STEP 4 — API
Add:

GET /api/v1/learning/practice/module/{module_id}
GET /api/v1/learning/practice/recommended
STEP 5 — FRONTEND
Create:

PracticeView.tsx
Supports:

question display

input

submit

feedback

STEP 6 — FEEDBACK
Immediate:

✔ correct / incorrect
✔ correct answer shown
STEP 7 — VALIDATION
Test:

module → practice generated

weak_patterns → targeted practice

deterministic output

SUCCESS CONDITION
User can:
- learn content
- immediately practice it
- see feedback
END OF AGENT TASK
