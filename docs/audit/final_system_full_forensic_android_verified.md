# Final System Full Forensic Android Verified

Date: 2026-04-03
Repository: `/home/vitus/kielitaika-app`
Scope: `final_system_fix_+_android_engine_full_audit.md`

## 1. System topology (final confirmed)

Confirmed production path:

- Android client / Expo app
- backend on `http://192.168.100.41:8002`
- external YKI engine on `http://127.0.0.1:8181`

Confirmed backend routes used in this pass:

- `GET /health`
- `GET /engine/health`
- `POST /api/v1/yki/start`
- `POST /api/v1/yki/sessions/start`

Confirmed runtime path:

- governed exam execution still runs only through `frontend -> backend -> external engine`
- legacy `/api/v1/yki/...` routes remain fail-closed and do not execute exam logic

## 2. All fixes applied

Files changed in this pass:

- `apps/client/.env`
- `apps/client/dist/index.html`
- `apps/client/dist/_expo/static/js/web/entry-a9d1206fe639a0a1139656f739019b53.js`
- `packages/core/config/env.ts`
- `apps/backend/main.py`
- `apps/backend/yki/contracts.py`
- `apps/backend/yki/orchestrator.py`
- `apps/backend/yki/progress_history.py`
- `apps/backend/learning/graph_service.py`
- `apps/backend/yki_practice/generator.py`
- `apps/backend/tests/test_yki_exam_runtime.py`
- `apps/backend/tests/yki_test_support.py`

Concrete fixes:

1. Android backend target fixed

- `apps/client/.env` now points `EXPO_PUBLIC_API_URL` and `EXPO_PUBLIC_AUDIO_URL` at `http://192.168.100.41:8002`
- exported web bundle was regenerated so the tracked compiled asset no longer hardcodes port `8000`

2. Validation shortcut plumbing removed

- removed `YKI_VALIDATION_MODE` from `packages/core/config/env.ts`
- removed `validation_mode` fields/parameters from `apps/backend/yki/contracts.py`
- removed validation-mode plumbing and logging from `apps/backend/yki/orchestrator.py`
- updated runtime tests and fake orchestrator support to match the production-only path

3. Legacy `session_store` helper imports removed from live non-runtime modules

- `apps/backend/learning/graph_service.py` no longer imports `get_progress_history` from `yki.session_store`
- `apps/backend/yki_practice/generator.py` no longer imports `get_progress_history` from `yki.session_store`
- added `apps/backend/yki/progress_history.py` for the retained history helper logic

4. Backend operational health routes added

- `GET /health` now returns `{"status":"ok"}`
- `GET /engine/health` now proxies the engine health surface and fail-closes with `503` if unavailable

## 3. Engine interaction proof

Live engine checks passed:

- `GET http://127.0.0.1:8181/health` returned `{"status":"ok"}`
- `GET http://127.0.0.1:8181/engine/health` returned `status: OK`
- `GET http://127.0.0.1:8181/engine/status` returned:
  - `engine_version: 3.3`
  - `deterministic_mode: true`
  - no `test_mode`
  - no `fast_mode`

Live backend checks against the governed engine-backed path passed:

- backend was started successfully on `0.0.0.0:8002`
- `GET http://127.0.0.1:8002/health` returned `{"status":"ok"}`
- `GET http://127.0.0.1:8002/engine/health` returned the engine `status: OK` payload
- `POST http://127.0.0.1:8002/api/v1/yki/start` returned controlled fail-closed `YKI_LEGACY_ENDPOINT_DISABLED`
- `POST http://127.0.0.1:8002/api/v1/yki/sessions/start` returned a governed session id after `httpx` was installed into the backend venv

Important blocker found during live execution:

- before installing `apps/backend/requirements.txt`, the governed start route failed with `HTTPX_UNAVAILABLE`
- this was environment drift, not a repo manifest omission, because `httpx==0.28.1` was already declared in `apps/backend/requirements.txt`

Real listening submission and real progression beyond the engine timing gate were not proven in this pass.

## 4. Android proof

Connected device:

- `adb devices` reported `SM02E4060333233    device`

Transport proof completed:

- `adb shell ping -c 1 192.168.100.41` succeeded
- `adb shell toybox nc -z -w 3 192.168.100.41 8002` succeeded after running `adb` outside the sandbox

What was proven:

- the Android device can reach the backend host IP
- the Android device can open a TCP connection to backend port `8002`
- the repo is no longer configured to point the app at port `8000`

What was not fully proven in this pass:

- device-side HTTP body capture for `/health`, `/engine/health`, or `/api/v1/yki/start`
- a fresh on-device governed exam start after the `.env` change
- a complete on-device reading -> listening transition

Reason:

- `toybox nc` on-device was sufficient for TCP proof but not for reliable HTTP-response capture in this shell environment
- Expo / governed exam interaction was not re-run end-to-end in this pass after the backend/network corrections

## 5. Media lifecycle verification

Not fully verified in this pass.

Not proven on-device here:

- listening playback end-to-end
- playback stop on navigation
- microphone permission prompt behavior
- speaking recording creation and upload
- background audio cleanup behavior

No media regression fix was required by code inspection in this pass, but the prompt-required real-device media proof remains incomplete.

## 6. Legacy removal proof

Confirmed removals:

- `rg -n "YKI_VALIDATION_MODE|validation_mode" apps packages -S` returned no matches after cleanup
- no live cross-module imports remain of `from yki.session_store import ...`

Remaining legacy route surface in `apps/backend/main.py`:

- `/api/v1/yki/start`
- `/api/v1/yki/resume/{session_id}`
- `/api/v1/yki/history`
- `/api/v1/yki/{session_id}`
- `/api/v1/yki/{session_id}/certificate`
- `/api/v1/yki/{session_id}/next`
- `/api/v1/yki/{session_id}/task`
- `/api/v1/yki/{session_id}/task/next`
- `/api/v1/yki/{session_id}/task/answer`
- `/api/v1/yki/{session_id}/task/audio`
- `/api/v1/yki/{session_id}/task/play`

These routes are not active runtime paths. They all return controlled `YKI_LEGACY_ENDPOINT_DISABLED` responses and point callers to the governed `/api/v1/yki/sessions/...` routes.

Conclusion:

- only one active YKI execution path remains
- a disabled legacy compatibility surface still exists for fail-closed guidance

## 7. Failure surface analysis

Mandatory validation results:

- `python3 -m unittest apps/backend/tests/test_yki_exam_runtime.py apps/backend/tests/test_yki_audio_media_pipeline.py apps/backend/tests/test_api_contract_envelope.py`
  - passed (`13` tests)
- `npm run controlled_ui_contract_validation`
  - passed
- TypeScript check
  - prompt command `./node_modules/.bin/tsc --noEmit -p tsconfig.json` is not runnable from repo root because there is no root `node_modules/.bin/tsc`
  - equivalent command `./apps/client/node_modules/.bin/tsc --noEmit -p tsconfig.json` fails with pre-existing UI typing errors across `apps/client` and `packages/ui`

Additional validation:

- `npm run build` in `apps/client` passed and regenerated the tracked web export

Remaining blockers:

1. Full real listening completion is still unproven.

- The engine remains strict and deterministic.
- No engine fast/test timing override is exposed.
- The required real wait through the listening window was not completed in this pass.

2. Android governed flow is still only partially proven.

- transport to `8002` is now proven
- endpoint/config alignment is fixed
- full on-device governed exam execution was not re-run through listening after the transport fix

3. Android media lifecycle remains unverified.

- playback, recording, permissions, and background cleanup were not exercised end-to-end on the connected device in this pass

4. Root TypeScript validation remains blocked by existing repo issues.

- monorepo root lacks the prompt-specified binary path
- equivalent typecheck still fails on existing UI typing problems unrelated to this pass

## Final verdict

BLOCKED

Exact blockers:

- full real listening submission and progression were not completed under the engine's actual time window
- Android playback/recording/permission/background behavior were not validated end-to-end on the connected device
- the prompt-specified TypeScript validation is not clean in the current repo state
