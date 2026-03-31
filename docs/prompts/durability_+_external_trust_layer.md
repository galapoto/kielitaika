You are continuing the KieliTaika system.

The system already provides:

deterministic runtime

strict contract enforcement

append-only audit logging

replay verification

sealed certification artifacts

Your task is to upgrade the system into:

durable, externally verifiable, and production-deployable infrastructure

OBJECTIVE
Ensure that:

audit logs survive process restarts

certification records are durable and queryable

results can be exported and verified outside the system

multi-instance execution does not break determinism

CORE PRINCIPLE
If the system restarts and loses history → it is not compliant.

If results cannot be verified outside your backend → they are not trustworthy.

EXECUTION TASKS
1. REPLACE LOCAL JSONL STORAGE
Current problem:
/tmp storage is process-bound

not shared across instances

not durable

Implement persistent storage layer
Create abstraction:

apps/backend/audit/storage_adapter.py
Support:
file-based (dev)

database-backed (production)

Minimum production requirement:
Use:

SQLite (acceptable baseline) OR

PostgreSQL (preferred)

Data structures:
audit_events
event_id

session_id

timestamp

payload hashes

trace_id

certifications
session_id

final_result_hash

certification_record

created_at

2. ATOMIC WRITE GUARANTEES
Ensure:

audit write + certification write cannot partially succeed

use transaction boundaries

If failure occurs:

→ rollback

3. CERTIFICATION EXPORT (CRITICAL)
Create endpoint:
GET /api/v1/yki/certification/{session_id}/export
Output:
JSON (canonical)

optional signed version (next step ready)

Include:
certification_record
final_result_hash
verification_instructions
hash_algorithm
4. EXTERNAL VERIFICATION SCRIPT
Create:

apps/backend/audit/external_verify.py
Capability:
Given exported JSON:

recompute hashes

validate integrity

output:

VALID / INVALID
5. HASH CONSISTENCY LOCK
Ensure:

same serialization rules used everywhere

no environment-dependent differences

Test across:

backend runtime

replay engine

verification engine

external script

6. MULTI-INSTANCE SAFETY
Ensure:

no in-memory-only state

all session state recoverable from storage

no race conditions on session updates

7. BACKUP + RESTORE (BASIC)
Provide:

export audit logs by session_id

restore capability for debugging/replay

8. FRONTEND EXPORT UI
Update:

YkiPracticeScreen.tsx
Add:

“Download Result”

fetch export endpoint

download JSON

Read-only only.

STRICT RULES
You MUST NOT:

keep /tmp as primary storage

allow partial writes

allow certification without persistence

allow export to differ from stored record

introduce non-deterministic serialization

VALIDATION
Run:

tsc --noEmit
node apps/client/tests/controlled_ui_contract_validation.test.cjs
python3 -m unittest discover -s apps/backend/tests
Add:

persistence tests

export consistency tests

external verification tests

OUTPUT FORMAT
1. Files created
2. Files modified
3. Validation results
4. Errors encountered
5. Success / failure
POST-RUN AUDIT (MANDATORY)
AUDIT
A. Persistence Coverage
B. Fixes Applied
C. External Verification Status
D. Remaining Risks
SYSTEM STATE
UI Governance: ✅ / ❌

Contract Enforcement: ✅ / ❌

YKI Integrity: ✅ / ❌

Audit Logging: ✅ / ❌

Replayability: ✅ / ❌

Certification Integrity: ✅ / ❌

Persistence Durability: ✅ / ❌

External Verifiability: ✅ / ❌

SUCCESS CRITERIA
This phase is complete when:

audit logs survive restarts

certification is permanently stored

export matches stored record exactly

external script can verify results

system works across multiple instances

