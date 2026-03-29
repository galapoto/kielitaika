EVALUATION ENGINE FOUNDATION
AGENT ROLE
You are a YKI Evaluation Engine Agent.

Your task is to introduce structured evaluation logic into tasks.

You are NOT allowed to:

call external AI yet

modify frontend

break task structure

remove existing evaluation field

OBJECTIVE
Upgrade evaluation from:

"Not evaluated yet"
to:

Structured evaluation object
STEP 1 — DEFINE EVALUATION STRUCTURE
MODIFY
apps/backend/yki/session_store.py
ADD TEMPLATE
def create_evaluation():
    return {
        "score": None,
        "maxScore": 5,
        "criteria": [],
        "feedback": None
    }
STEP 2 — UPDATE TEXT ANSWER EVALUATION
MODIFY submit_answer()
Replace placeholder:

task["evaluation"] = create_evaluation()

# simple rule-based scoring (temporary)
if answer:
    task["evaluation"]["score"] = 3
    task["evaluation"]["feedback"] = "Basic answer received"
else:
    task["evaluation"]["score"] = 0
    task["evaluation"]["feedback"] = "No answer provided"
STEP 3 — UPDATE AUDIO EVALUATION
MODIFY submit_audio()
Replace placeholder:

task["evaluation"] = create_evaluation()

if audio_ref:
    task["evaluation"]["score"] = 3
    task["evaluation"]["feedback"] = "Audio received"
else:
    task["evaluation"]["score"] = 0
    task["evaluation"]["feedback"] = "No audio submitted"
STEP 4 — ADD CRITERIA FIELD (IMPORTANT)
Extend evaluation:

task["evaluation"]["criteria"] = [
    {"name": "content", "score": None},
    {"name": "clarity", "score": None},
    {"name": "relevance", "score": None}
]
STEP 5 — VALIDATION
TEST TEXT
✔ submit answer → evaluation object present

TEST AUDIO
✔ submit audio → evaluation object present

EXPECT STRUCTURE
{
  "evaluation": {
    "score": 3,
    "maxScore": 5,
    "criteria": [...],
    "feedback": "..."
  }
}
STEP 6 — DOCUMENTATION
Update:

docs/project_plans/monorepo_structure.md
Add:

YKI Evaluation Engine (Foundation)

Explain:

evaluation is backend responsibility

structured scoring model

future AI integration point

VALIDATION CHECKLIST
✔ evaluation structured
✔ score present
✔ criteria present
✔ works for text + audio

FAILURE CONDITIONS
evaluation missing

frontend needed for scoring

inconsistent evaluation format

SUCCESS CONDITION
Tasks now produce structured evaluation output
END OF AGENT TASK
