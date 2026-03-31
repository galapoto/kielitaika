AGENT PROMPT — NEXT EXECUTION PHASE
Phase: Backend–Frontend Contract Lock + YKI Runtime Integrity Enforcement (End-to-End)
You are executing the next phase of the KieliTaika system.

This is a continuation task, not a rebuild.

You MUST respect all previously established invariants:

UI is fully governed (no client-side decision making)

Navigation is shell-controlled

State is backend-derived and validated

Persistence is versioned and validated

Offline mode is read-only and never authoritative

OBJECTIVE
Move the system from:

“Frontend obeys backend responses”

to:

“Frontend + Backend are cryptographically and structurally locked into a single deterministic runtime contract”

At the end of this phase:

The backend becomes the only authority of truth

The frontend becomes a pure renderer of governed state

YKI runtime becomes fully audit-safe and replayable

No undefined behavior exists between client and server

CORE PRINCIPLE
No interpretation.
No fallback logic.
No reconstruction.

If the backend does not explicitly define it → it does not exist.

EXECUTION TASKS
1. HARDEN GOVERNED RESPONSE CONTRACT (CRITICAL)
Goal:
Make it impossible for invalid backend data to reach UI rendering.

Actions:
1.1 Extend governed validation layer
File:

packages/core/api/governedResponseValidation.ts
Add:

strict schema version enforcement

required field presence validation (no optional runtime fields unless explicitly allowed)

deep structure validation for nested objects (especially YKI tasks)

Reject:

missing fields

unexpected fields

version mismatches

partial payloads

1.2 Enforce contract at transport level
File:

packages/core/api/apiClient.ts
Rules:

ALL responses MUST pass governed validation before returning

On failure → throw CONTRACT_VIOLATION (never return partial data)

No exceptions.

2. BACKEND RESPONSE NORMALIZATION (CRITICAL)
Goal:
Ensure backend responses are 100% deterministic and uniform.

Actions:
Identify backend endpoints:

learning

YKI session start

YKI session fetch

YKI task advance

YKI submission

For each:

Enforce:

consistent envelope:

{
  ok: boolean,
  data: object | null,
  error: { code, message, retryable } | null,
  meta: { version, timestamp }
}
remove all optional ambiguity

remove dynamic structure differences

enforce stable ordering (important for hashing/audit)

3. YKI RUNTIME INTEGRITY LOCK
Goal:
Make YKI exam flow non-deviatable and replayable

3.1 Enforce step integrity
Frontend must:

NEVER compute next step

NEVER infer task order

Only use:

current_task_index
next_allowed_action
completion_state
3.2 Add runtime integrity check
On every YKI state update:

Validate:

session_id matches persisted

task index progression is sequential

no skipping backward

no duplicate submissions

On violation:

→ HARD FAIL → render ApplicationErrorScreen

3.3 Add replay consistency marker
Persist:

session_hash
task_sequence_hash
Compare on restore.

If mismatch:

→ SESSION_CORRUPTED

4. BACKEND REVALIDATION ON EVERY CRITICAL ACTION
Goal:
Remove trust from client completely.

For these actions:

session start

resume

submit

advance

Frontend must:

send request

receive validated response

discard local assumptions

overwrite state entirely

5. REMOVE REMAINING DERIVED STATE (CLEANUP)
Audit frontend:

Search for:

computed next step

inferred UI state

fallback UI logic

default values for missing backend fields

Remove ALL of them.

6. ADD CONTRACT VERSION LOCKING
Goal:
Prevent frontend/backend drift

Add:

REQUIRED_BACKEND_VERSION
Frontend refuses to operate if:

backend version mismatch

contract version mismatch

7. ADD AUDIT TRAIL SUPPORT (FOUNDATION)
Goal:
Prepare system for full audit logging later

For every critical action:

Log (internally):

timestamp

action type

session_id

request payload hash

response payload hash

Do NOT send to UI yet.

STRICT RULES
You MUST NOT:

introduce fallback UI logic

introduce client-side reconstruction

allow optional undefined behavior

silently fix backend inconsistencies

bypass governed validation

allow UI rendering from unvalidated data

VALIDATION CHECKS (MANDATORY)
Run:

tsc --noEmit
node apps/client/tests/controlled_ui_contract_validation.test.cjs
Additionally:

Search checks:

no direct fetch usage

no unvalidated API usage

no router usage outside AppShell

no local YKI step computation

OUTPUT FORMAT
You MUST return:

1. Files modified
2. Files created
3. Validation results
4. Errors encountered
5. Success / failure
POST-RUN AUDIT (MANDATORY — ALWAYS INCLUDE)
At the end of execution, include:

AUDIT
A. Contract Violations Found
list all violations or “None”

B. Fixes Applied
exact corrections made

C. Remaining Risks
anything not yet fully deterministic

D. System State
Mark:

UI Governance: ✅ / ❌

Contract Enforcement: ✅ / ❌

YKI Integrity: ✅ / ❌

Backend Authority: ✅ / ❌

Persistence Safety: ✅ / ❌

SUCCESS CRITERIA
This phase is complete when:

frontend cannot render invalid data

backend defines 100% of runtime behavior

YKI flow cannot deviate under any condition

session replay produces identical results

no silent corrections exist anywhere
