AGENT PROMPT — NEXT EXECUTION
You are continuing the KieliTaika system.

The system already has:

governed UI

strict backend contract

deterministic YKI runtime

append-only audit logging

replay verification with hash integrity

Your task is to introduce:

Certification Mode: Final Result Integrity + Sealed Output System

OBJECTIVE
Transform a completed YKI session into:

a finalized result artifact

a tamper-evident structure

a verifiable output that can be exported

CORE PRINCIPLE
A completed session must become:

immutable, reproducible, and independently verifiable

EXECUTION TASKS
1. SESSION FINALIZATION LAYER
Create:
apps/backend/yki_practice/certification_service.py
Responsibilities:
On session completion:

Generate:

certification_record = {
  session_id,
  user_id (if available),
  completion_timestamp,
  final_score (if applicable),
  session_hash,
  task_sequence_hash,
  audit_event_range,
  contract_version,
  certification_version
}
Rules:
MUST be generated only once

MUST be immutable after creation

MUST reference audit logs

2. FINAL RESULT HASH (CRITICAL)
Generate:

final_result_hash = hash(
  session_hash +
  task_sequence_hash +
  audit_event_range +
  contract_version
)
This becomes:

the fingerprint of the entire session

3. CERTIFICATION STORAGE
Store certification records:

append-only

separate from raw audit logs

queryable by session_id

4. EXPORTABLE RESULT FORMAT
Create endpoint:

GET /yki/certification/{session_id}
Return:

{
  certification_record,
  final_result_hash,
  replay_reference,
  verification_instructions
}
5. VERIFICATION FUNCTION
Create:
apps/backend/audit/verification_engine.py
Capability:
Given:

session_id
Recompute:

session_hash

task_sequence_hash

audit_event_range

Compare with stored certification.

If mismatch:

→ CERTIFICATION_INVALID

6. FRONTEND CERTIFICATION VIEW
Update:

packages/ui/screens/YkiPracticeScreen.tsx
After completion:

show final result

show certification status

show trace reference (read-only)

No recalculation allowed.

7. LOCK POST-COMPLETION STATE
After certification:

session cannot be resumed

no further submissions allowed

no mutation allowed anywhere

8. AUDIT LINKING
Ensure certification record references:

first audit event_id

last audit event_id

So full trace can be reconstructed

STRICT RULES
You MUST NOT:

allow certification overwrite

allow partial certification

compute score on frontend

allow post-certification mutation

create certification without full audit chain

VALIDATION
Run:

tsc --noEmit
node apps/client/tests/controlled_ui_contract_validation.test.cjs
python3 -m unittest discover -s apps/backend/tests
Add tests:

certification creation

certification immutability

verification success

verification failure (tampered audit)

OUTPUT FORMAT
1. Files created
2. Files modified
3. Validation results
4. Errors encountered
5. Success / failure
POST-RUN AUDIT (MANDATORY)
AUDIT
A. Certification Coverage
B. Fixes Applied
C. Verification Integrity Status
D. Remaining Risks
SYSTEM STATE
UI Governance: ✅ / ❌

Contract Enforcement: ✅ / ❌

YKI Integrity: ✅ / ❌

Audit Logging: ✅ / ❌

Replayability: ✅ / ❌

Certification Integrity: ✅ / ❌

SUCCESS CRITERIA
This phase is complete when:

every completed session produces a certification record

certification cannot be altered

verification can detect tampering

result can be exported and independently validated
