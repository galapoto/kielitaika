# Final Validation Report

Date: 2026-04-03
Prompt: `docs/prompts/agent_prompt_final_validation_real_world_execution_phase.md`
Validation commit base: `08607928`

## 1. Dependency Validation Result

Result: passed.

Actions performed:

- Added `apps/backend/requirements.txt`
- Created fresh environment: `/tmp/kielitaika_backend_validation_env`
- Installed dependencies with:
  - `fastapi==0.135.2`
  - `uvicorn==0.42.0`
  - `httpx==0.28.1`
- Verified clean install succeeded in the fresh environment

Notes:

- The fresh environment validation proved the backend dependency set is now declared.
- Live backend execution for later steps was run from `apps/backend/.venv` because sandboxed port binding from the temporary venv process was blocked unless escalated.

## 2. YKI Full Flow Result

Result: blocked.

What was validated successfully:

- External engine started successfully on `http://0.0.0.0:8181`
- Backend started successfully on `http://127.0.0.1:8002`
- Governed session start succeeded
- Reading section progressed successfully through live API calls
- Transition from reading to listening succeeded
- Listening prompt playback succeeded

Exact failure:

- First listening question submission failed
- Backend response:
  - `ok: false`
  - `error.code: ENGINE_ERROR`
- Engine log showed `400 Bad Request` on:
  - `POST /exam/{session_id}/answer`

Observed failing session state:

- Section: `listening`
- View kind: `listening_question`
- Input mode: `choice`
- Question: `Mitä unen aikana tapahtuu asiantuntijan mukaan?`

Conclusion:

- Engine is being used consistently.
- The end-to-end YKI flow does not complete successfully under real execution.
- This is a hard block for deployment readiness.

## 3. Android Validation Result

Result: blocked by environment.

Evidence:

- `adb devices` returned no connected Android device or emulator.

Impact:

- Mandatory real-device validation could not be executed for:
  - audio playback
  - recording
  - permission flow
  - background/foreground lifecycle
  - interruption handling

Conclusion:

- Android validation remains incomplete.
- This alone prevents a `READY FOR DEPLOYMENT` verdict under the prompt requirements.

## 4. Failure Handling Result

Result: partial pass.

Validated:

- Engine-down failure test passed
- After stopping the engine, `POST /api/v1/yki/sessions/start` returned:
  - `error.code: ENGINE_UNAVAILABLE`
  - `retryable: true`
- This confirms fail-closed behavior with a structured error envelope

Not fully validated:

- Real slow-network timeout was not reproduced in this environment
- Timeout behavior remains covered by backend automated tests from the prior audit pass, not by this live run

## 5. Stress Test Result

Result: blocked by live flow failure.

What was observed:

- Repeated rapid progression through the reading section did not crash the backend
- State remained coherent through multiple `GET`, `next`, and `answer` cycles
- The first real listening answer caused a real engine/backend integration failure before broader stress scenarios could be completed

Conclusion:

- No crash was observed during early rapid progression
- Full stress validation is incomplete because the live flow fails before the full exam can be exercised

## 6. Client Validation Result

Result: partial.

Validated:

- `npm run web` started the Expo client process and began project startup
- No immediate startup error was emitted

Not validated:

- Full interactive client exercise
- Android execution
- real audio/recording UX behavior on device

## 7. Bugs Found

1. Real-engine listening answer submission fails in live flow

- Symptom:
  - Backend returns `ENGINE_ERROR`
  - Engine returns `400 Bad Request` on listening answer submit
- Severity:
  - critical
- Effect:
  - end-to-end YKI flow cannot complete in real execution

2. Android final validation could not be executed

- Symptom:
  - no connected device or emulator
- Severity:
  - release-blocking for this validation phase
- Effect:
  - prompt-mandated real-device verification is incomplete

3. Slow-network real-world validation remains incomplete

- Symptom:
  - no live network-throttling or delay harness was available in this pass
- Severity:
  - medium
- Effect:
  - real timeout behavior is not proven by live execution in this report

## 8. Final Verdict

BLOCKED

Exact reasons:

- Real YKI end-to-end flow fails at the first listening question because the external engine rejects the answer submission with `400 Bad Request`
- Mandatory Android real-device validation could not be performed because no device or emulator was attached

The system is not ready for deployment based on this validation phase.
