AGENT PROMPT — NEXT PHASE (ADAPTIVE INTELLIGENCE + RUNTIME INTEGRITY)
You are continuing from a functionally bridged system.

The system works.

Now you must make it intelligent, self-correcting, and reliable under real usage.

CURRENT STATE (DO NOT BREAK)
Auth (mock fallback) works

App shell stable

Learning system:

recommendations working

effectiveness tracked

YKI practice:

sessions start

tasks progress

Debug visibility:

decision_version

effectiveness

factor traces

PRIMARY OBJECTIVE
Move from:

“System shows data”

TO:

“System uses data to change behavior in real time”

CORE PRINCIPLE
The system must begin to react to effectiveness.

Not just log it.

PHASE TASKS (STRICT ORDER)
1. EFFECTIVENESS → RECOMMENDATION FEEDBACK LOOP
Goal:
Recommendations must change based on actual performance.

Backend (NO new endpoints, extend logic only)
File:
apps/backend/learning/graph_service.py

You MUST:
Adjust recommendation weights using:

effectiveness_score

improvement_delta

attempt history

Behavior:
High effectiveness → increase priority

Low effectiveness → reduce priority OR reintroduce with variation

No improvement → trigger retry logic

Add:
adaptive_weight_modifier()

integrate into recommendation scoring

2. STAGNATION DETECTION
Goal:
Detect when the user is not improving.

File:
progress_service.py

Add logic:
If:

attempts > threshold

improvement_delta ≈ 0

→ mark as:

status = "stagnated"

Required:
stagnation threshold config

included in debug output

3. FRONTEND RESPONSE TO STAGNATION
File:
LearningRoute.tsx + LearningScreen.tsx

Behavior:
If unit is stagnated:

Show:

retry suggestion

alternative unit

“switch difficulty” option

Constraint:
No UI improvisation.

Use existing:

Button

Section

Text

4. YKI PERFORMANCE → LEARNING PIPELINE LINK
Goal:
YKI performance must influence learning recommendations.

Files:
ykiPracticeService.ts

progress_service.py

You MUST:
After YKI session:

extract:

success/failure

task type

difficulty

→ feed into:

learning progress model

Result:
YKI is no longer isolated.

It becomes a signal source for learning adaptation.

5. SESSION CONSISTENCY GUARD (CRITICAL)
Problem:
State drift between UI and backend can break exam realism.

File:
packages/core/api/apiClient.ts

Add:
response validation guard:

ensure session_id consistency

ensure decision_version consistency

If mismatch:
throw CONTRACT_VIOLATION

log in debug panel

6. DEBUG PANEL → DIAGNOSTIC TOOL
Extend debug UI:
Must include:

stagnation flags

adaptive weight changes

recommendation rejection reasons

YKI → learning influence logs

Goal:
You should be able to answer:

“Why did the system recommend this?”

without reading backend code.

7. FAIL-SAFE UI STATES
You MUST handle:
empty recommendations

failed YKI session start

missing effectiveness data

Behavior:
show controlled fallback

never blank screen

never crash

8. DATA INTEGRITY ENFORCEMENT
Backend:
Ensure:

no negative effectiveness_score

no invalid improvement_delta

timestamps consistent

Add validation layer in:
progress_models.py

9. TYPE + RUNTIME VALIDATION (STRICT)
Must pass:
full tsc (no timeout)

backend tests

manual runtime verification

VALIDATION CHECKLIST
Intelligence
 recommendations change after performance

 stagnation detected

 retry logic triggered

Integration
 YKI affects learning

 learning affects future recommendations

Stability
 no crashes

 fallback states work

Debug
 full reasoning visible

 no black-box behavior

OUTPUT FORMAT
You MUST report:

1. Files created
2. Files modified
3. New adaptive behaviors introduced
4. Edge cases handled
5. Verification results
6. System state:
❌ reactive but unstable

⚠️ adaptive but incomplete

✅ adaptive and stable

FINAL RULE
Do NOT just “connect things”.

You are building a system that must behave like:

a controlled, exam-grade, learning intelligence engine

Every change must move toward:

determinism

explainability

adaptation

Proceed.
