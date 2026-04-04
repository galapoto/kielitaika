# Listening Timing Validation

Date: 2026-04-04
Prompt: `docs/prompts/listening_timing_validation_run.md`
Device: `SM02E4060333233`
Backend: `http://192.168.100.41:8002`
Engine: `http://127.0.0.1:8181`
Execution mode: `test`
Deterministic seed: `automation-fixed`
App URL: `exp://192.168.100.41:8083/--/auth`

## Changes Applied Before Validation

- Backend listening timing enforcement now skips expiry while the session is still on `listening_prompt` and no playback has started.
- Backend first-play handling now restarts the listening section window from the play action so the answer budget is not consumed by prompt-entry latency.
- Backend test-mode timing policy now guarantees at least `35` seconds for `listening`.
- The Android forensic runner now:
  - wakes the device
  - dismisses non-secure system UI layers before launch
  - fails explicitly when a secure keyguard PIN screen is still present

## Full Timeline

1. `2026-04-04T17:03:07.052873+00:00` `DEVICE_READY`
2. `2026-04-04T17:03:07.679021+00:00` `DEVICE_UI_PREP`
3. `2026-04-04T17:03:09.302645+00:00` `DEVICE_UI_PREP`
4. `2026-04-04T17:03:10.374241+00:00` `APP_FORCE_STOP`
5. `2026-04-04T17:03:11.714831+00:00` `APP_LAUNCH`
6. `2026-04-04T17:03:15.275259+00:00` `DEVICE_UI_PREP`
7. `2026-04-04T17:03:18.515064+00:00` `DEVICE_LOCKED`

## Listening Timing Fields

- `prompt_start_time`: not reached
- `audio_play_start`: not reached
- `audio_play_end`: not reached
- `next_enabled_time`: not reached
- `question_render_time`: not reached
- `answer_time`: not reached
- `expiry_time`: not reached

## Total Time Spent

- Total runtime before abort: about `11.46s`
- Time spent inside listening: `0s`

## Remaining Time At Each Step

- Before governed session creation: not available because the app never reached the exam surface
- During listening prompt: not available
- During listening question: not available
- At answer submit: not available

## Supporting Timing Verification

The real-device run was blocked before the exam surface, so listening timing proof currently comes from backend verification:

- `python3 -m unittest apps.backend.tests.test_yki_exam_runtime -v`
  - PASS
  - confirms test mode exposes a `35s` listening window floor
- `python3 -m unittest apps.backend.tests.test_yki_audio_media_pipeline -v`
  - PASS
  - confirms `listening_prompt` does not expire before first play
  - confirms the first play restarts the listening answer window

## Verdict

FAIL

The listening timing patch is implemented and covered by tests, but the required real-device validation run could not reach the listening section because the handset was blocked by a secure PIN keyguard after app launch. The runner now reports this explicitly instead of misclassifying it as a missing start button.
