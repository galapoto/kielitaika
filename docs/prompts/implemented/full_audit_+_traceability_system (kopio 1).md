AGENT PROMPT — NEXT EXECUTION
Phase: FULL AUDIT + TRACEABILITY SYSTEM
You are continuing the KieliTaika execution.

The system already enforces:

governed UI

contract-locked transport

backend authority

deterministic YKI runtime

session integrity via hashes

Your task is to make the system:

fully auditable, replayable, and traceable at every step

OBJECTIVE
Every critical action in the system must produce a verifiable audit record that allows:

full session replay

forensic inspection

debugging without guesswork

certification-grade traceability

CORE PRINCIPLE
If an action cannot be reconstructed later → it is not allowed to exist.

EXECUTION TASKS
1. CENTRAL AUDIT LOGGER (BACKEND)
Create:
apps/backend/audit/audit_logger.py
Responsibilities:
For every critical event, log:

{
  event_id,
  timestamp,
  session_id,
  user_id (if available),
  event_type,
  request_payload_hash,
  response_payload_hash,
  contract_version,
  session_hash,
  task_sequence_hash
}
Rules:
MUST be append-only

MUST NOT mutate past entries

MUST be deterministic

2. HOOK INTO ALL CRITICAL FLOWS
Attach audit logging to:

YKI:
session start

session resume

task advance

answer submission

Learning:
module load

unit load

answer submission (if applicable)

3. HASH STANDARDIZATION (CRITICAL)
Create shared hashing utility:
apps/backend/utils/hash_utils.py
Rules:

stable JSON serialization (sorted keys)

no whitespace variance

same input → same hash always

Use for:

request hash

response hash

session_hash (already exists, standardize)

task_sequence_hash

4. REPLAY ENGINE (FOUNDATION)
Create:
apps/backend/audit/replay_engine.py
Capabilities:
Given:

session_id
Must reconstruct:

full sequence of events

exact backend responses

task progression

Validation:
Replayed sequence must produce:

identical session_hash

identical task_sequence_hash

If not:

→ REPLAY_MISMATCH error

5. AUDIT STORAGE STRATEGY
Start simple (no overengineering):

JSONL file OR structured DB table

But MUST support:

chronological ordering

session filtering

deterministic reads

6. FRONTEND TRACE ID PROPAGATION
Modify:

packages/core/api/apiClient.ts
Add:

x-trace-id header per request

Rules:

unique per action

included in backend audit log

7. ERROR TRACE ENRICHMENT
All backend errors must include:

trace_id
event_id (if applicable)
Frontend must display:

controlled error

trace reference (not raw stack)

8. REMOVE ANY NON-TRACEABLE PATHS
Audit system for:

silent failures

unlogged actions

background mutations

Eliminate them.

STRICT RULES
You MUST NOT:

log partial data

skip logging for “minor” actions

allow non-deterministic timestamps (use consistent format)

allow hash inconsistencies

store mutable audit records

VALIDATION
Run:

tsc --noEmit
node apps/client/tests/controlled_ui_contract_validation.test.cjs
python3 -m unittest discover -s apps/backend/tests
Add new tests:

audit log creation

replay consistency

hash determinism

OUTPUT FORMAT
1. Files created
2. Files modified
3. Validation results
4. Errors encountered
5. Success / failure
POST-RUN AUDIT (MANDATORY)
AUDIT
A. Missing Audit Coverage
B. Fixes Applied
C. Replay Integrity Status
D. Remaining Risks
SYSTEM STATE
UI Governance: ✅ / ❌

Contract Enforcement: ✅ / ❌

YKI Integrity: ✅ / ❌

Audit Logging: ✅ / ❌

Replayability: ✅ / ❌

SUCCESS CRITERIA
This phase is complete when:

every action is logged

every session can be replayed

hashes match across replay

no hidden behavior exists

errors are traceable
