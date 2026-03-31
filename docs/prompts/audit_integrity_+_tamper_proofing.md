AGENT PROMPT — NEXT PHASE (AUDIT INTEGRITY + TAMPER PROOFING)
You are continuing from a system that is:

✅ adaptive
✅ policy-controlled
✅ deterministic
✅ auditable + replayable
⚠️ not yet tamper-proof

PRIMARY OBJECTIVE
Move from:

“We can reconstruct what happened”

TO:

“We can prove the record was never altered”

CORE CONCEPT
You will implement:

Cryptographic Audit Integrity

This is NOT security theater.

It must ensure:

no silent modification

no event deletion without detection

no reordering without detection

PHASE TASKS (STRICT ORDER)
1. ADD EVENT HASHING
Modify:
apps/backend/audit/audit_models.py

Add fields:
event_hash

previous_event_hash

Hash must be computed from:
event content (excluding hash fields)

previous_event_hash

Result:
You create a hash chain (blockchain-like)

2. BUILD HASHING FUNCTION
File:
apps/backend/audit/audit_integrity.py

Function:
compute_event_hash(event, previous_hash)

Requirements:
deterministic serialization

stable field ordering

no randomness

use SHA-256 (or equivalent)

3. INTEGRATE INTO AUDIT SERVICE
Modify:
audit_service.py

Behavior:
When recording event:

fetch last event hash (per session or user stream)

compute new hash

store both:

event_hash

previous_event_hash

CRITICAL:
append-only still enforced

no overwrite allowed

4. VERIFY HASH CHAIN
Add:
verify_audit_integrity(events)

Must detect:
broken chain

tampered event

reordered events

deleted events

Output:
valid / invalid

exact failure location

5. INTEGRATE WITH REPLAY ENGINE
Modify:
replay_engine.py

Before replay:
run integrity check

If invalid:
block replay OR

flag result as untrusted

6. FRONTEND VISIBILITY (DEV MODE)
Extend debug UI:
Show:

integrity status (valid / broken)

hash chain length

failure point (if any)

This matters:
You should visually see:

“Audit chain is intact”

7. SEGMENTED CHAINS
Important design decision:
Do NOT create one global chain.

Instead:
Create chains per:

user_id (learning)

session_id (YKI)

Reason:
avoids cascade corruption

improves performance

aligns with replay scope

8. PERFORMANCE GUARD
Constraint:
Hashing must NOT:

block runtime

introduce noticeable latency

Acceptable approach:
lightweight sync hashing (preferred)

OR buffered append (if needed)

9. BACKWARD COMPATIBILITY
Handle:
Old events without hashes

Strategy:
mark as:

integrity_status = "legacy_unverified"

10. VALIDATION (STRICT)
Integrity Test
record events

verify → must pass

Tamper Test
modify one event
→ must fail

Deletion Test
remove one event
→ must fail

Reorder Test
swap events
→ must fail

OUTPUT FORMAT
You MUST report:

1. Files created
2. Files modified
3. Hashing strategy used
4. Chain structure (per user/session)
5. Integrity verification behavior
6. Edge cases handled
7. Verification results
8. System state:
❌ auditable but mutable

⚠️ integrity-aware but incomplete

✅ tamper-proof + verifiable

FINAL RULE
You are no longer just proving behavior.

You are proving:

the proof itself has not been altered

That is the difference between:

a debug system

and a system that can stand in court, audit, or certification

Proceed.




