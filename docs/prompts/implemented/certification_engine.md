CERTIFICATION ENGINE
AGENT ROLE
You are a Certification Logic Agent.

Your job is to convert evaluated tasks into:

final exam result
level classification
pass/fail decision
certificate output
CORE REQUIREMENT
You must:

NOT change evaluation logic

NOT re-score answers

ONLY consume stored evaluation objects

STEP 1 — AGGREGATE SCORES
From session:

reading_score
listening_score
writing_score
speaking_score
Each derived from:

average of task scores per section
STEP 2 — NORMALIZE SCORES
All sections must be:

scaled to 0–5
STEP 3 — OVERALL SCORE
overall_score = round(
    (reading + listening + writing + speaking) / 4
)
STEP 4 — LEVEL MAPPING
Define:

0–1 → A1  
2 → A2  
3 → B1  
4 → B2  
5 → C1/C2
(keep configurable)

STEP 5 — PASS / FAIL
Example rule:

PASS if:
- overall_score ≥ target_level
- AND no section < (target_level - 1)
STEP 6 — CERTIFICATE OBJECT
Return:

{
  "overall_score": 4,
  "level": "B2",
  "passed": true,
  "section_scores": {
    "reading": 4,
    "listening": 3,
    "writing": 4,
    "speaking": 5
  },
  "evaluation_mode": "hybrid_text_v2"
}
STEP 7 — PERSISTENCE
Store inside session:

session["certificate"]
Must survive:

resume
STEP 8 — ENDPOINT
Add:

GET /api/v1/yki/{session_id}/certificate
Returns:

certificate if complete

error if exam not finished

STEP 9 — VALIDATION
Test:

full exam flow → certificate generated

partial exam → rejected

resume → certificate still present

deterministic → same inputs → same certificate

STEP 10 — DOCUMENTATION
Add:

Certification Model v1
Include:

aggregation logic

level mapping

pass criteria

SUCCESS CONDITION
System produces a stable, explainable final result for every completed exam
END OF AGENT TASK

