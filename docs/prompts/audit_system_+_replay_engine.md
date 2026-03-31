(AUDIT SYSTEM + REPLAY ENGINE)
You are continuing from a system that is:

✅ adaptive
✅ policy-controlled
✅ deterministic
⚠️ not yet externally auditable or replayable

PRIMARY OBJECTIVE
Move from:

“System behaves correctly”

TO:

“System can prove it behaved correctly”

CORE REQUIREMENT
Every important action must become:

recorded

reconstructable

replayable

verifiable

KEY CONCEPT
You are building an Audit Trail + Replay Engine

This is NOT logging.

This is forensic reconstruction capability.

PHASE TASKS (STRICT ORDER)
1. CREATE AUDIT EVENT MODEL
File:
apps/backend/audit/audit_models.py

Define:
Each event MUST include:

event_id

timestamp

user_id

session_id (nullable for learning)

event_type

Event types (minimum):
RECOMMENDATION_GENERATED

RECOMMENDATION_SERVED

UNIT_ATTEMPTED

UNIT_COMPLETED

STAGNATION_DETECTED

POLICY_APPLIED

YKI_SESSION_STARTED

YKI_TASK_PRESENTED

YKI_RESPONSE_SUBMITTED

YKI_SESSION_COMPLETED

Each event MUST carry:
decision_version

policy_version

input snapshot (minimal but sufficient)

output snapshot

constraint metadata (what was clamped, rejected)

2. BUILD AUDIT LOGGER
File:
apps/backend/audit/audit_service.py

Requirements:
append-only

no mutation allowed

lightweight storage (in-memory or file for now)

API:
record_event(event)

get_session_events(session_id)

get_user_events(user_id)

3. INSTRUMENT THE SYSTEM (CRITICAL)
You MUST inject audit logging into:

Learning
graph_service.py

when recommendations generated

progress_service.py

when attempts recorded

when stagnation triggered

policy engine

when constraints applied

YKI
session start

each task presentation

each answer submission

session completion

RULE
No silent decisions.

If the system decides something important → it is logged.

4. CREATE REPLAY ENGINE
File:
apps/backend/audit/replay_engine.py

Function:
Reconstruct a session from audit events.

Must:
rebuild:

recommendation sequence

YKI task flow

decisions made

Validation:
Replay must produce:

identical sequence

identical decisions

5. CONSISTENCY CHECKER
Add:
verify_replay_consistency(events)

Must detect:
mismatch in decisions

missing events

version inconsistencies

6. FRONTEND AUDIT VIEW (DEV MODE)
Extend debug UI:
Add:

“Audit Timeline”

Show:
ordered events

decision_version

policy_version

actions taken

Optional but strong:
replay visualization (step through session)

7. EVENT SIZE CONTROL
Constraint:
Do NOT dump full payloads.

You MUST:
store minimal reproducible inputs

avoid duplication

avoid large blobs

8. BACKWARD SAFETY
Ensure:

system works without audit enabled

audit layer does not break runtime

9. VALIDATION (STRICT)
Replay Test
run session

capture events

replay session

→ MUST match exactly

Audit Completeness
no missing critical events

Determinism Integrity
replay == original

OUTPUT FORMAT
You MUST report:

1. Files created
2. Files modified
3. Event model structure
4. Audit coverage (what is logged)
5. Replay capability description
6. Edge cases handled
7. Verification results
8. System state:
❌ deterministic but not auditable

⚠️ auditable but incomplete

✅ auditable + replayable + verifiable

FINAL RULE
You are no longer building features.

You are building trust in the system.

If a regulator, examiner, or company asks:

“Prove this system behaved correctly”

You must be able to answer:

“Here is the exact reconstruction.”

Proceed.
