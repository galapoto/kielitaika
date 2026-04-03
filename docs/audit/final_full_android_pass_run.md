# Final Full Android Pass Run

Date: 2026-04-03
Repository: `/home/vitus/kielitaika-app`
Prompt: `docs/prompts/final_system_unblocking_+_full_android_proof_execution.md`
Device: `SM02E4060333233`

## 1. Execution summary

Live services used for this run:

- external YKI engine: `http://0.0.0.0:8181`
- backend: `http://0.0.0.0:8002`
- Android device backend target: `http://192.168.100.41:8002`
- Android device engine reachability: `192.168.100.41:8181`

Code changes applied before the proof run:

- `packages/core/config/env.ts`
  - added `EXPO_PUBLIC_YKI_EXAM_MODE`
- `apps/client/features/yki-exam/services/ykiExamService.ts`
  - forwards `mode` to `/api/v1/yki/sessions/start`
- `apps/backend/main.py`
  - accepts start request payloads on `/api/v1/yki/sessions/start`
- `apps/backend/yki/adapter.py`
  - forwards start payloads into the orchestrator
- `apps/backend/yki/orchestrator.py`
  - reads section timing from engine metadata `duration_profile_seconds`
- `apps/backend/tests/yki_test_support.py`
  - fake engine now records start payloads and test timing profiles
- `apps/backend/tests/test_yki_exam_runtime.py`
  - added explicit engine-mode forwarding and duration-profile coverage
- `packages/core/services/authService.ts`
  - mock auth fallback now survives contract violations from missing `/api/v1/auth/login`
- `apps/client/state/authStore.ts`
  - authenticated state is applied before persistence so auth transition does not hang

Validation completed before the Android proof:

- `.venv/bin/python -m unittest tests/test_yki_exam_runtime.py tests/test_yki_audio_media_pipeline.py tests/test_api_contract_envelope.py`
  - result: `15` tests passed
- `./node_modules/.bin/tsc --noEmit -p tsconfig.learning.json`
  - passed

## 2. Step-by-step validation

### Android binding

Verified from the real Android device:

- `GET /health`
  - reachable
- `GET /engine/health`
  - reachable
- `POST /api/v1/yki/sessions/start`
  - reachable

Host-side proof collected during the run:

- `GET /health` returned `{"status":"ok"}`
- `GET /engine/health` returned engine `OK`
- `GET /engine/status` returned:
  - `supported_modes: ["production", "test"]`
  - `active_session_modes.test: 1`
  - `timing_profiles.test.reading = 10`
  - `timing_profiles.test.listening = 10`
  - `timing_profiles.test.writing = 10`
  - `timing_profiles.test.speaking = 10`

### Android auth and home shell

Observed on the device:

- app loaded into Expo Go
- auth screen rendered
- sign-in initially stalled because the mock fallback path threw on contract violation
- after the auth fallback fix and auth-store transition fix, the device entered Home successfully

Confirmed Home UI text:

- `Home`
- `Authenticated session ready.`
- `Email: learner`
- `Runtime Flows`
- `YKI Exam`

### Android exam start

Real Android-started governed session:

- session id: `befa1b6f-a441-4b33-a660-0e38014ff853`
- device-originated backend log source: `192.168.100.36`

Captured proof:

- Metro log:
  - `YKI exam session start requested.`
  - `API request started.` for `/api/v1/yki/sessions/start`
  - `API request completed.` with status `200`
  - `YKI exam session start completed.`
  - `YKI exam session load completed.`
- backend log:
  - `YKI engine request method=POST path=/exam/start payload={"level_band": "B1_B2", "mode": "test"}`
  - `192.168.100.36:35410 - "POST /api/v1/yki/sessions/start HTTP/1.1" 200 OK`
  - `192.168.100.36:35410 - "GET /api/v1/yki/sessions/befa1b6f-a441-4b33-a660-0e38014ff853 HTTP/1.1" 200 OK`

This proves:

- Android UI started the session
- backend forwarded engine `test` mode
- external engine remained the only source of truth for session creation
- governed validation passed through the client start/load path

### Reading section

Fresh test-mode governed session captured for structural validation:

- session id: `ecadff6a-30cf-4191-af0e-a6795fb6fe11`
- current section: `reading`
- current view kind: `reading_passage`
- total section count: `4`
- total step count: `55`
- reading total steps: `21`
- listening total steps: `26`
- writing total steps: `4`
- speaking total steps: `4`

Exact timing from the same live session payload:

- exam remaining seconds at capture: `37`
- reading remaining seconds at capture: `7`
- listening remaining seconds at capture: `17`
- writing remaining seconds at capture: `27`
- speaking remaining seconds at capture: `37`

This is a deterministic, live contradiction:

- engine `test` mode grants roughly `40` total seconds
- the engine still emits the full `55`-step exam graph
- a complete Android exam lifecycle cannot be executed before section expiry under the current engine contract

### Listening, writing, speaking, and completion

The Android-started session could not complete the exam lifecycle.

Observed failure:

- backend eventually returned `SECTION_EXPIRED`
- Android UI moved to `Runtime Blocked`
- on-device error copy:
  - `YKI exam runtime validation failed. The governed exam flow has been stopped.`

## 3. Media validation results

Playback:

- not proven end-to-end
- no valid listening window could be reached and completed before engine expiry

Pause/resume/stop:

- not proven

Recording:

- not proven
- speaking was not reachable within the engine `test` profile

Background/foreground and lock/unlock:

- not proven as part of a valid listening or speaking execution

Resource cleanup:

- partial only
- `useFocusEffect` cleanup remains in place
- no media leak was observed during this run, but a full proof was not possible because listening and speaking were not completed

## 4. Determinism proof

Deterministic properties confirmed:

- `GET /engine/status` reported `deterministic_mode: true`
- `GET /engine/status` reported fixed `test` timing values of `10` seconds per section
- backend timing manifests now match the engine metadata profile instead of falling back to production-like minute windows

Deterministic blocking condition confirmed across fresh sessions:

- the engine repeatedly returns the full governed exam structure
- the engine repeatedly applies the same `10` second section profile in `test` mode
- that combination deterministically leads to `SECTION_EXPIRED` before full Android completion is possible

## 5. Failure scan results

Resolved during this run:

1. Auth fallback was not resilient to governed contract failures on missing `/api/v1/auth/login`.
2. Auth route transition was blocked by awaiting persistence before applying authenticated state.
3. Exam start did not previously forward engine mode from client to backend.
4. Backend timing extraction did not previously consume engine metadata duration profiles.

Still detected:

1. Engine `test` mode is not aligned with the actual exam size.
2. Full Android completion is impossible under the current engine `test` timing contract.
3. Media lifecycle proof cannot be completed because listening and speaking cannot be lawfully executed to completion before expiry.
4. The final report outcome requested by the prompt, `PASS`, is unattainable without changing the engine’s test-mode session model or timing profile.

## Final verdict

FAIL

Exact blocking reason:

- the external engine is in `test` mode, but it still serves the full `55`-step exam while allocating only `10` seconds per section
- the Android app can authenticate, reach Home, start a governed session, and load the reading view
- the governed session then deterministically expires before the full exam lifecycle can be completed on-device
- because listening, writing, speaking, certification generation, and final submission could not be completed under the current engine contract, a `PASS` verdict is not defensible
