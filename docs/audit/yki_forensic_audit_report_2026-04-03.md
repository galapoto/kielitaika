# YKI Forensic Audit Report

Date: 2026-04-03
Audit commit: `08607928`
Scope: YKI governed runtime, external engine integration, legacy-path isolation, multi-engine validation, failure handling, timer/lifecycle scan, platform safety scan.

## 1. Files Modified

- `apps/backend/yki/adapter.py`
- `apps/backend/yki/orchestrator.py`
- `apps/backend/yki/engine_client.py`
- `apps/backend/yki/contracts.py`
- `apps/backend/main.py`
- `apps/backend/tests/test_yki_exam_runtime.py`
- `apps/backend/tests/yki_test_support.py`
- `apps/backend/learning/adapter.py`
- `apps/backend/learning/graph_service.py`
- `apps/backend/learning/practice_service.py`
- `apps/backend/learning/progress_service.py`
- `apps/backend/learning/system_service.py`
- `apps/backend/yki_practice/adapter.py`
- `apps/backend/yki_practice/generator.py`
- `apps/backend/yki_practice/service.py`

## 2. Files Deleted

No runtime files were deleted.

`apps/backend/yki/session_store.py` was explicitly retained because it still has live non-YKI references:

- `apps/backend/yki_practice/generator.py`
- `apps/backend/learning/graph_service.py`

Those references currently use `get_progress_history`, so deletion would be unsafe.

## 3. Execution Path Verification

Result: confirmed orchestrator-only YKI flow.

Evidence:

- `apps/backend/yki/adapter.py` now calls only `YKIOrchestrator`.
- `rg -n "session_store" apps/backend/yki -S` returned no YKI runtime usage after the adapter purge.
- Governed YKI routes in `apps/backend/main.py` route through:
  - `start_governed_exam`
  - `get_governed_exam`
  - `advance_governed_exam`
  - `answer_governed_task`
  - `answer_governed_audio`
  - `play_governed_listening_prompt`
- Legacy YKI endpoints in `apps/backend/main.py` now fail closed with `YKI_LEGACY_ENDPOINT_DISABLED`.

Additional isolation work:

- `DEFAULT_USER_ID` imports were moved from `yki.session_store` to `yki.contracts` in `main.py`, learning modules, and YKI practice modules.
- Remaining `yki.session_store` references are outside the governed YKI execution path.

## 4. Engine Verification

Result: confirmed YKI requests hit the external engine.

Validated flow:

1. Start external engine with `./run_engine.sh`
2. Start backend with `YKI_ENGINE_BASE_URL=http://127.0.0.1:8181`
3. Exercise governed flow:
   - `POST /api/v1/yki/sessions/start`
   - `GET /api/v1/yki/sessions/{id}`
   - `POST /api/v1/yki/sessions/{id}/answer`
   - `POST /api/v1/yki/sessions/{id}/next`

Observed outcomes:

- Backend returned a real governed session id.
- Session state advanced from reading passage to reading question.
- Submitted answer was accepted and the next task advanced correctly.
- Engine logs showed successful requests for:
  - `POST /exam/start`
  - `GET /exam/{session_id}`
  - `POST /exam/{session_id}/answer`

Integration fixes required for real-engine compatibility:

- `engine_client.start_exam()` now sends a default payload when needed.
- Orchestrator now normalizes real engine section and item schemas.
- Objective answers are coerced into engine-compatible payloads.
- Writing and speaking submissions now use dedicated engine submission methods.

## 5. Multi-Engine Validation Results

Result: all audited engines validated operational in automated coverage.

Validated engines:

- YKI external engine
- Speaking engine
- Daily practice engine
- Learning system

Automated validation:

- `python3 -m unittest discover -s apps/backend/tests`
  - Passed: `69` tests
- Focused engine suites also passed during audit:
  - YKI runtime tests
  - YKI audio/media pipeline tests
  - Daily practice engine tests
  - Speaking practice engine tests
  - Learning system engine tests

## 6. Failure Testing Results

Result: fail-closed behavior confirmed.

Engine down:

- External engine was stopped while backend remained running.
- `POST /api/v1/yki/sessions/start` returned structured failure with `ENGINE_UNAVAILABLE`.
- No fallback path was observed.

Invalid response:

- Added explicit test coverage for invalid engine response handling in `apps/backend/tests/test_yki_exam_runtime.py`.
- Expected failure path: `ENGINE_INVALID_RESPONSE`.

Timeout:

- Added explicit test coverage for engine timeout handling in `apps/backend/tests/test_yki_exam_runtime.py`.
- Expected failure path: `ENGINE_TIMEOUT`.

## 7. Audio + Recording Audit

Result: no regression found in current backend path.

Evidence:

- `apps/backend/tests/test_yki_audio_media_pipeline.py` passed.
- Governed listening playback remains routed through orchestrator.
- Speaking submission path is explicitly wired to engine submission via `submit_speaking`.

Scope note:

- This audit verified backend playback/recording flow integrity and submission path behavior.
- Frontend media UX was not modified in this pass.

## 8. State Consistency Audit

Result: no state leakage found in audited flow.

Evidence:

- Session creation uses orchestrated session records with explicit section/task state.
- Real-engine session identity is preserved through extracted engine session identifiers and optional engine session token storage.
- Session reads after `start`, `answer`, and `next` returned coherent section/view progression.

No evidence found of:

- duplicate session ids
- cross-session data leakage
- silent fallback to legacy runtime state

## 9. Timer + Lifecycle Audit

Result: no orphan timer usage found in first-party runtime code.

Search result:

- `rg -n "setInterval|setTimeout" apps/client packages apps/backend -S`

Relevant first-party match:

- `packages/core/utils/timerSafe.ts`

Assessment:

- Timer usage is centralized in a wrapper that returns cleanup functions.
- No uncontrolled timer use was found in audited first-party runtime files.

## 10. Platform Safety Audit

Result: zero direct browser-only platform API usage found in first-party client/package runtime code.

Search performed:

- `rg -n '\b(window|document|navigator|localStorage)\b' apps/client packages -S`

Outcome:

- No matches.

Note:

- Wider repository scans produce false positives from backend strings such as `section_windows` and content literals such as `"window"` in practice data. Those are not platform API usage.

## 11. Remaining Risks

- `apps/backend/yki/session_store.py` still exists because non-YKI modules still depend on `get_progress_history`.
- Real-engine runtime requires `httpx` in the backend interpreter. There is no committed backend dependency manifest in this repo that declares it.
- Deprecation warnings remain in older session/audio modules that use `datetime.utcnow()`. They did not block validation but should be cleaned separately.

## 12. Final Verdict

READY FOR FULL VALIDATION

Reasoning:

- Governed YKI runtime is now orchestrator-driven.
- Legacy YKI endpoints are isolated and fail closed.
- Real external engine traffic was verified directly.
- Broad backend and client validation passed.
- No safe basis exists yet to delete `apps/backend/yki/session_store.py`, so it was correctly retained.
