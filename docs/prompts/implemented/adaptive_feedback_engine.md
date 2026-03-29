ADAPTIVE FEEDBACK ENGINE
AGENT ROLE
You are an Adaptive Feedback Agent.

Your job is to convert static evaluation data into:

actionable learning guidance
CORE REQUIREMENT
You must:

NOT modify scores

NOT re-evaluate answers

ONLY interpret existing evaluation data

STEP 1 — ANALYZE WEAK AREAS
From all tasks:

Aggregate:

criteria averages:
- content
- clarity
- relevance
- language_accuracy
- fluency
- pronunciation
STEP 2 — IDENTIFY WEAK CRITERIA
Rule:

criteria_score ≤ 2 → weak
criteria_score = 3 → borderline
criteria_score ≥ 4 → strong
STEP 3 — GENERATE SUGGESTIONS
Map weaknesses to guidance:

Example:

low language_accuracy →
→ suggest grammar-focused practice

low relevance →
→ suggest task interpretation practice
STEP 4 — OUTPUT STRUCTURE
{
  "weak_areas": ["language_accuracy", "relevance"],
  "suggestions": [
    "Practice sentence structure and grammar",
    "Focus on answering the exact question asked"
  ]
}
STEP 5 — PERSISTENCE
Store in:

session["learning_feedback"]
STEP 6 — UI INTEGRATION
Display under results:

“How to Improve”
show top 2–3 weaknesses

show clear suggestions

STEP 7 — VALIDATION
Test:

strong performance → minimal suggestions

weak performance → clear guidance

deterministic output

STEP 8 — DOCUMENTATION
Add:

Adaptive Feedback Model v1
SUCCESS CONDITION
User leaves with:
- clear understanding of weaknesses
- clear next actions
END OF AGENT TASK
