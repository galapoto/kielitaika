Files created
- `apps/backend/audit/audit_logger.py`
- `apps/backend/utils/__init__.py`
- `apps/backend/utils/hash_utils.py`
- `apps/backend/tests/test_hash_utils.py`

Files modified
- `apps/backend/api_contract.py`
- `apps/backend/audit/audit_integrity.py`
- `apps/backend/audit/audit_models.py`
- `apps/backend/audit/audit_service.py`
- `apps/backend/audit/replay_engine.py`
- `apps/backend/main.py`
- `apps/backend/tests/test_api_contract_envelope.py`
- `apps/backend/tests/test_audit_replay.py`
- `apps/backend/yki_practice/service.py`
- `apps/client/features/learning/services/learningService.ts`
- `apps/client/features/yki-practice/hooks/useYkiPractice.ts`
- `apps/client/features/yki-practice/services/ykiPracticeService.ts`
- `apps/client/state/LearningRoute.tsx`
- `apps/client/state/YkiPracticeRoute.tsx`
- `apps/client/tests/controlled_ui_contract_validation.test.cjs`
- `packages/core/api/apiClient.ts`
- `packages/core/api/governedResponseValidation.ts`
- `packages/core/models/apiTypes.ts`
- `packages/ui/screens/ApplicationErrorScreen.tsx`
- `packages/ui/screens/LearningScreen.tsx`

Validation results
- `./apps/client/node_modules/.bin/tsc --noEmit -p apps/client/tsconfig.json` passed
- `node apps/client/tests/controlled_ui_contract_validation.test.cjs` passed
- `python3 -m unittest discover -s apps/backend/tests` passed
- `python3 -m compileall apps/backend` passed
- Router audit grep showed navigation ownership only in `apps/client/state/AppShell.tsx`
- Direct `fetch()` audit grep showed only `packages/core/api/apiClient.ts`

Errors encountered
- A replay test initially mutated the wrong event shape and then the wrong failure mode. I corrected it to preserve a valid hash chain while producing a replay-only mismatch.

Success / failure
- Success

AUDIT
A. Missing Audit Coverage
- No remaining unaudited critical YKI runtime actions were found in the active backend routes.
- Learning module load, unit load, progress submit, and debug-state reads now emit audited endpoint records.

B. Fixes Applied
- Added append-only JSONL audit storage with deterministic reads.
- Standardized backend hashing through `utils/hash_utils.py`.
- Added trace-aware response envelopes with `trace_id` and `event_id`.
- Propagated `x-trace-id` from the client transport.
- Enriched YKI domain events with `session_hash` and `task_sequence_hash`.
- Extended replay verification to validate request hashes, response hashes, and runtime hash continuity.
- Surfaced controlled trace references in learning and YKI error UI.

C. Replay Integrity Status
- Replay integrity is valid for the current audited session flows.
- Replay now returns exact recorded response snapshots and final session/task hashes.
- Replay mismatch detection is covered by backend tests.

D. Remaining Risks
- Audit storage is file-backed JSONL in `/tmp`, so it is append-only and deterministic but still local-process scoped rather than multi-instance durable.
- Legacy non-practice YKI exam routes are audited at the API envelope level, but their deeper domain replay semantics remain less detailed than YKI practice.

SYSTEM STATE
- UI Governance: ✅
- Contract Enforcement: ✅
- YKI Integrity: ✅
- Audit Logging: ✅
- Replayability: ✅
