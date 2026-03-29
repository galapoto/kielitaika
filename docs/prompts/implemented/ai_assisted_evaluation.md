AI-ASSISTED EVALUATION (CONTROLLED)
AGENT ROLE
You are an AI Evaluation Integration Agent.

Your job is to augment the rule-based evaluation with LLM-assisted semantic scoring, without losing determinism or control.

CORE REQUIREMENT
You must NOT:

replace rule-based evaluation

introduce randomness

return unconstrained free-form output

break scoring consistency

OBJECTIVE
Enhance evaluation to include:

meaning understanding
language quality
coherence
STEP 1 — HYBRID MODEL
Evaluation must be:

final_score = combine(rule_score, ai_score)
NOT:

ai_score alone
STEP 2 — STRUCTURED PROMPT
LLM must return:

{
  "content": 0-5,
  "clarity": 0-5,
  "relevance": 0-5,
  "language_accuracy": 0-5,
  "feedback": "..."
}
STEP 3 — STRICT OUTPUT PARSING
Reject responses that are:

not JSON

missing fields

out of range

Fallback to:

rule-based evaluation only
STEP 4 — TEMPERATURE CONTROL
Set:

temperature = 0
to ensure:

determinism as much as possible
STEP 5 — SCORE MERGING
Example:

final_score = round((rule_score + ai_score) / 2)
STEP 6 — SPEAKING (FUTURE PREP)
Prepare interface for:

transcription → same evaluation pipeline
But do NOT implement full speech analysis yet.

STEP 7 — VALIDATION
TEST
same input → same AI score (within tolerance)

invalid AI output → fallback triggered

evaluation persists

STEP 8 — DOCUMENTATION
Add:

Evaluation Model v2
rule-based base

AI augmentation

deterministic constraints

SUCCESS CONDITION
Evaluation becomes semantically aware without losing control
END OF AGENT TASK

