1. Files created
- `apps/backend/audit/storage_adapter.py`
- `apps/backend/audit/external_verify.py`
- `docs/prompts/implemented/durability_+_external_trust_layer.md`

2. Files modified
- `apps/backend/audit/audit_logger.py`
- `apps/backend/audit/audit_service.py`
- `apps/backend/learning/progress_service.py`
- `apps/backend/main.py`
- `apps/backend/tests/test_audit_replay.py`
- `apps/backend/tests/test_certification_integrity.py`
- `apps/backend/yki_practice/adapter.py`
- `apps/backend/yki_practice/certification_service.py`
- `apps/backend/yki_practice/service.py`
- `apps/client/features/yki-practice/hooks/useYkiPractice.ts`
- `apps/client/features/yki-practice/services/ykiPracticeService.ts`
- `apps/client/state/YkiPracticeRoute.tsx`
- `packages/core/api/governedResponseValidation.ts`
- `packages/ui/screens/YkiPracticeScreen.tsx`

3. Validation results
- `./apps/client/node_modules/.bin/tsc --noEmit -p apps/client/tsconfig.json`
- `node apps/client/tests/controlled_ui_contract_validation.test.cjs`
- `python3 -m unittest discover -s apps/backend/tests`
- `python3 -m compileall apps/backend`

4. Errors encountered
- The first durability pass deadlocked because YKI submission held the SQLite runtime transaction while `record_practice_result()` opened a second audit transaction. I fixed that by making the progress audit writes connection-aware and passing the active transaction through.
- `YkiPracticeRoute.tsx` assumed `certification.verification` was always present, but the export payload intentionally makes it optional. I added guarded access.
- `test_audit_replay.py` still imported the removed JSONL path. It now validates durable audit rows from SQLite instead.

5. Success / failure
- Success

AUDIT
A. Persistence Coverage
- Audit events, certifications, runtime counters, and YKI practice sessions now persist in SQLite under `apps/backend/runtime/kielitaika_runtime.sqlite3`.
- YKI sessions are loaded from storage, not in-memory globals, and can be exported/restored by `session_id`.
- Certification export returns the exact stored export payload.

B. Fixes Applied
- Replaced the old primary `/tmp` JSONL runtime with a durable storage adapter.
- Added transaction boundaries so YKI completion audit and certification creation commit or roll back together.
- Added canonical export plus external verification through `apps/backend/audit/external_verify.py`.
- Added read-only frontend download flow for sealed YKI results.

C. External Verification Status
- Exported certification payloads include `certification_record`, `final_result_hash`, `verification_instructions`, and `hash_algorithm`.
- External verification recomputes the stable hash and returns `VALID` or `INVALID`.
- Tests cover export equality, external verification, and restore/replay recovery.

D. Remaining Risks
- SQLite is a solid durability baseline, but multi-process write contention is still bounded by SQLite locking semantics rather than a distributed coordination layer.
- `reset_*` test helpers currently clear the full runtime store, which is correct for isolated tests but should not be exposed in production paths.

SYSTEM STATE
- UI Governance: ✅
- Contract Enforcement: ✅
- YKI Integrity: ✅
- Audit Logging: ✅
- Replayability: ✅
- Certification Integrity: ✅
- Persistence Durability: ✅
- External Verifiability: ✅
