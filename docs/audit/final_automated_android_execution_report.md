# Final Automated Android Execution Report

Date: 2026-04-04
Prompt: `docs/prompts/final_android_forensic_execution__post_automation_rix.md`
Base prompt: `docs/prompts/implemented/final_android_automated_execution_+_forensic_instrumentation.md`
Device: `SM02E4060333233`
Backend: `http://192.168.100.41:8002`
Engine: `http://127.0.0.1:8181`
Execution mode: `test`
Deterministic seed requested: `automation-fixed`
App URL used for live runs: `exp://192.168.100.41:8083/--/auth`

## Execution Timeline

1. Patched the Android forensic runner to satisfy the post-automation selector rules:
   - selector order is now `accessibilityLabel`, then `resource-id`, then visible text
   - every tap logs the selector that matched
   - blocked taps log bounds, clickable state, enabled state, and parent hierarchy
2. Patched governed session reset and persistence handling on the client:
   - `/auth` now clears persisted governed runtime state before routing home
   - stale persisted exam sessions are blocked from being re-saved after local reset
3. Patched backend timing enforcement:
   - `section_complete` no longer hard-fails with `SECTION_EXPIRED` while waiting for the next section window to open
   - regression coverage was added in `apps/backend/tests/test_yki_exam_runtime.py`
4. Corrected the live stack for physical-device execution:
   - client `.env` now targets `http://192.168.100.41:8002`
   - backend was restarted with `YKI_ENGINE_BASE_URL=http://127.0.0.1:8181`
   - Metro was relaunched on `8083` so the device loaded the corrected bundle
5. Patched client refresh cadence for timed section gates:
   - `section_complete` now refreshes every second while next is disabled
   - other governed exam views refresh every five seconds instead of every fifteen
6. Repeated real-device forensic reruns on 2026-04-04 progressively advanced the boundary:
   - first live reruns reached `reading_passage`
   - subsequent reruns reached `section_complete`
   - later reruns reached `listening_prompt`
   - latest rerun reached `listening_question`
7. Latest deterministic forensic run:
   - session id: `e00f2462-4a0b-4f96-9d9f-73be838dc574`
   - reading passage advanced successfully
   - reading question answer submitted successfully
   - reading section gate opened and advanced into listening
   - listening prompt playback was triggered and `Next` became tappable
   - listening question rendered on-device
   - the governed runtime then failed with `SECTION_EXPIRED` before the listening answer could be completed and advanced

## Section Completion Status

- reading: PASS
- listening: FAIL
- writing: FAIL
- speaking: FAIL

Reading is now proven end to end on the real device. The flow advances into the listening section and reaches the first listening question, but the deterministic run still expires inside listening before the question lifecycle can complete.

## Media Lifecycle Report

- Listening prompt playback is now exercised on-device through the governed `play` action.
- The runner verifies prompt unlock through the top-layer `yki-next-button`.
- Pause/resume is attempted only when there is enough remaining section time; otherwise the runner records `PROMPT_PAUSE_RESUME_SKIPPED_LOW_TIME` and prioritizes forward progress.
- Speaking media lifecycle instrumentation exists in the client and runner, but no successful speaking phase was reached in the latest deterministic execution.

## Timing Analysis

- Engine test profile remains approximately `70` total seconds.
- The client-side `section_complete` refresh lag was reduced from `15` seconds to `1` second while the next section gate is disabled.
- Despite that fix, the governed listening section still has too little usable time budget in the live Android flow once prompt playback, UI update latency, and question rendering are included.
- Latest deterministic failure sequence on 2026-04-04:
  - `2026-04-04T11:27:34.579096+00:00`: runner confirmed `listening_prompt`
  - `2026-04-04T11:27:37.177626+00:00`: runner tapped `yki-play-audio`
  - `2026-04-04T11:27:42.492101+00:00`: runner tapped `yki-next-button`
  - `2026-04-04T11:27:47.026779+00:00`: runner confirmed `listening_question`
  - `2026-04-04T11:27:49.521776+00:00`: runner tapped the first listening answer
  - `2026-04-04T11:27:49.922954+00:00`: backend returned `SECTION_EXPIRED`

## Failure Point

Exact current blocking step:

- session: `e00f2462-4a0b-4f96-9d9f-73be838dc574`
- section: `listening`
- view kind reached: `listening_question`
- runner-side last successful interaction:
  - selector: `accessibilityLabel`
  - value: `juoksemassa`
  - timestamp: `2026-04-04T11:27:49.521776+00:00`
- backend failure immediately after:
  - `SECTION_EXPIRED`
  - trace `trace-000284`
  - event `audit-001477`

Current root-cause assessment:

- the original Android automation-surface blocker is fixed
- the stale-session restart blocker is fixed
- the `section_complete` expiry blocker is fixed
- the remaining deterministic failure is a governed timing-budget issue inside the listening section on the real device
- the live flow now spends enough time on prompt playback, UI state propagation, and question render that the listening section expires before a full answer-submit-next cycle completes

## Determinism Check

- Deterministic request forwarding is confirmed:
  - backend forensics recorded `requested_mode=test`
  - backend forensics recorded `requested_seed=automation-fixed`
- A random-seed proof run was not executed because the fixed-seed PASS criteria are still not met.
- Running the random-seed variant before fixing the listening expiry would not provide useful rotation evidence.

## Verification Performed

- `python3 -m unittest apps.backend.tests.test_yki_exam_runtime -v`
- `python3 -m unittest apps.backend.tests.test_yki_audio_media_pipeline -v`
- repeated live Android forensic runs using:
  - `python3 tools/yki_android_forensic_runner.py --backend-base-url http://127.0.0.1:8002 --device-id SM02E4060333233 --app-url exp://192.168.100.41:8083/--/auth --run-label final-post-automation-rix --output /tmp/final_post_automation_rix.json`

## Final Verdict

FAIL

Blocking reason:

- the deterministic real-device run now reaches `listening_question`, but the governed session still expires inside listening before the run can complete the section and continue to writing and speaking
- the prompt completion criteria are therefore still unmet:
  - no full exam completion
  - no certification payload
  - no PASS verdict
