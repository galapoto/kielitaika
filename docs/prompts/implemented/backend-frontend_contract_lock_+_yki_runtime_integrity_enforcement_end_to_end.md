# BACKEND-FRONTEND CONTRACT LOCK + YKI RUNTIME INTEGRITY

## 1. Files modified

* `apps/backend/main.py`
* `apps/backend/tests/test_audit_replay.py`
* `apps/backend/tests/test_yki_practice_mode.py`
* `apps/backend/yki_practice/adapter.py`
* `apps/backend/yki_practice/service.py`
* `apps/client/features/learning/services/learningService.ts`
* `apps/client/features/yki-practice/services/ykiPracticeService.ts`
* `apps/client/state/AppShell.tsx`
* `apps/client/state/YkiPracticeRoute.tsx`
* `apps/client/state/sessionPersistence.ts`
* `apps/client/tests/controlled_ui_contract_validation.test.cjs`
* `packages/core/api/apiClient.ts`
* `packages/core/api/governedResponseValidation.ts`
* `packages/core/models/apiTypes.ts`
* `packages/core/services/apiClient.ts`
* `packages/core/services/authService.ts`
* `packages/ui/screens/YkiPracticeScreen.tsx`

## 2. Files created

* `apps/backend/api_contract.py`
* `apps/backend/tests/test_api_contract_envelope.py`

## 3. Validation results

Passed:

* `./apps/client/node_modules/.bin/tsc --noEmit -p apps/client/tsconfig.json`
* `node apps/client/tests/controlled_ui_contract_validation.test.cjs`
* `python3 -m unittest discover -s apps/backend/tests`
* `python3 -m compileall apps/backend`

Audit checks:

* router ownership remains limited to `AppShell.tsx`
* no raw YKI retry/skip action strings remain in active runtime sources
* only the governed transport client contains source-level `fetch()`

## 4. Errors encountered

Resolved during execution:

* strict-required schema enforcement changed old test expectations from `GOVERNANCE_MISSING` to `CONTRACT_VIOLATION`
* YKI backend tests still assumed `submit_only` auto-advanced; they were updated to the locked two-step flow
* importing `main.py` in a unit test pulled `fastapi`; response-envelope helpers were extracted to `api_contract.py`
* backend test runs generated `__pycache__` artifacts; they were removed before commit

## 5. Success / failure

* Success

## AUDIT

### A. Contract Violations Found

* transport envelope lacked locked `meta.version` and `meta.contract_version`
* service-layer validation happened after transport return instead of inside transport
* YKI runtime still allowed permissive backend actions and frontend-side action inference
* backend success/failure envelopes were not normalized across endpoints

### B. Fixes Applied

* added required backend and contract version locks in `governedResponseValidation.ts`
* added strict transport-envelope validation with required `meta`
* moved governed response validation into `apiClient.ts`
* normalized backend response envelopes through `api_contract.py`
* added backend-side request/response hash logging foundation for critical YKI actions
* added required YKI runtime fields: `next_allowed_action`, `completion_state`, `session_hash`, `task_sequence_hash`
* removed retry and combined-submit runtime paths from YKI practice flow
* added client-side YKI sequential integrity checks and restore hash checks
* moved YKI UI progression to backend-defined fields only
* removed the unused legacy `packages/core/services/ykiService.ts`

### C. Remaining Risks

* classic non-practice YKI endpoints are now envelope-normalized, but the active frontend runtime still focuses on `yki-practice`; deeper schema-specific validation for legacy YKI routes is not yet used by UI
* internal contract audit trail is stored in memory only and is not yet persisted

### D. System State

* UI Governance: ✅
* Contract Enforcement: ✅
* YKI Integrity: ✅
* Backend Authority: ✅
* Persistence Safety: ✅
