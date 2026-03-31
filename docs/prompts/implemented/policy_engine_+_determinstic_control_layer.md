(POLICY ENGINE + DETERMINISTIC CONTROL LAYER)
You are continuing from a system that is:

✅ adaptive
✅ explainable
⚠️ not yet strictly controlled

PRIMARY OBJECTIVE
Move from:

“System adapts based on signals”

TO:

“System adapts within strict, auditable, deterministic boundaries”

CORE IDEA
You now introduce a Policy Engine.

This engine will:

constrain adaptation

enforce exam realism

guarantee reproducibility

prevent drift

NON-NEGOTIABLE RULE
The system must be able to answer:

“If I replay this session, will I get the same decisions?”

If the answer is not yes, you failed.

PHASE TASKS (STRICT ORDER)
1. INTRODUCE DECISION POLICY LAYER
Create:
apps/backend/learning/policy_engine.py

This module MUST:
Define:

allowed adaptation bounds

max/min weight adjustments

retry limits

stagnation handling rules

YKI influence caps

Example controls:
effectiveness_weight ∈ [0.8, 1.2]

stagnation retry max = N

YKI influence max contribution = X%

CRITICAL:
Policy must NOT be hardcoded randomly inside logic.

It must be:

centralized

versioned

auditable

2. VERSION THE POLICY (MANDATORY)
Extend:
decision_version.py

Add:
policy_version

combine with decision_version

Result:
Every recommendation must carry:

decision_version

policy_version

3. LOCK ADAPTIVE WEIGHTS THROUGH POLICY
Modify:
graph_service.py

You MUST:
Wrap:

adaptive_weight_modifier()

Inside:

policy constraints

Behavior:
Even if model suggests extreme change:

→ clamp to policy limits

4. DETERMINISTIC SEEDING (CRITICAL FOR YKI)
Goal:
Same input → same output

You MUST:
Introduce deterministic seed:

Based on:

user_id

session_id

decision_version

Apply to:
recommendation ordering

tie-breaking

fallback selection

Result:
NO randomness allowed without seed.

5. POLICY-AWARE STAGNATION HANDLING
Modify:
progress_service.py

Ensure:
retry count respects policy max

escalation path defined:

Example:

retry

alternative unit

difficulty shift

forced progression

Must be:
explicit

traceable in debug

6. YKI MODE HARDENING (EXAM MODE)
Modify:
yki_practice/service.py

Introduce:
exam_mode = true

In exam mode:
❌ NO adaptive changes mid-session

❌ NO recommendation reshuffling

✅ all decisions precomputed at start

This is CRITICAL.
YKI must behave like:

a locked exam, not a learning system

7. PRECOMPUTE SESSION PLAN
When session starts:
generate full task sequence

store in session state

During session:
ONLY read from precomputed plan

NO dynamic generation mid-session
8. DEBUG PANEL → POLICY VISIBILITY
Extend debug UI:
Must now show:

policy_version

applied constraints

clamped values

rejected adaptive changes

You should see:
“model suggested X, policy allowed Y”

9. BACKWARD COMPATIBILITY CHECK
Ensure:
existing sessions still work

decision_version mismatch handled safely

10. VALIDATION (STRICT)
Determinism Test
Run:

Same input twice →

recommendations identical

ordering identical

weights identical

YKI Test
session start

full run

no mid-session drift

Policy Test
force extreme values

verify clamping

OUTPUT FORMAT
You MUST report:

1. Files created
2. Files modified
3. Policy rules introduced
4. Determinism guarantees added
5. Exam-mode constraints enforced
6. Edge cases handled
7. Verification results
8. System state:
❌ adaptive but uncontrolled

⚠️ partially policy-bound

✅ deterministic + policy-controlled

FINAL RULE
You are no longer building a smart system.

You are building a controlled system that happens to be smart.

Every adaptive behavior must now answer to:

policy

determinism

auditability

Proceed.
