# Listening Timing Validation

Date: 2026-04-04
Prompt: `docs/prompts/listening_timing_validation_run.md`
Device: `SM02E4060333233`
Backend: `http://192.168.100.41:8002`
Engine: `http://127.0.0.1:8181`
Execution mode: `test`
Deterministic seed: `automation-fixed`
App URL: `exp://192.168.100.41:8083/--/auth`

## Current Test Profile

- reading: `30s`
- listening: `50s`
- writing: `50s`
- speaking: `40s`

## What Changed Before Validation

- Backend test-mode start payload now forces explicit section durations for real-device validation.
- Listening prompt expiry still remains suspended until first play.
- First play still restarts the listening window on the backend.
- Writing and speaking now have larger real-device slack.
- Final section completion no longer dies just because the exam clock hit zero before `exam_complete` was materialized.
- Completed governed sessions now load without depending on a fresh engine round-trip.
- Android selector resolution now prefers enabled and clickable matches when duplicate nodes share the same automation ID.
- Android prompt handling now waits longer for governed unlock and longer for post-tap view settlement.

## Verification Performed

- `python3 -m unittest apps.backend.tests.test_yki_exam_runtime -v`
- `python3 -m unittest apps.backend.tests.test_yki_audio_media_pipeline -v`
- `venv/bin/python -m unittest engine.tests.test_engine_test_mode -v`

All three test suites passed on 2026-04-04.

## Latest Dedicated Validation Run

- Artifact: `/tmp/listening_timing_validation.json`
- Session: `3cf57399-0d07-47ec-8195-3118a46c77f3`
- Result: `FAIL`

Observed sequence:

1. Reading passage rendered and advanced.
2. Reading question answer was tapped.
3. Backend then returned `SECTION_EXPIRED` before the question cycle settled.

## Additional Live Evidence

Across the repeated real-device reruns in this turn:

- listening prompt repeatedly rendered on-device
- `yki-play-audio` was repeatedly found and tapped
- `yki-next-button` repeatedly unlocked after play
- `listening_question` repeatedly rendered on-device
- first listening answer was repeatedly tapped

That means the original listening-surface blocker is no longer the dominant failure. The residual instability is in the broader real-device settle path and timing consumption before and around the section boundary.

## Verdict

FAIL

The backend listening timing model is materially improved and covered by tests, but the dedicated real-device validation run still does not complete deterministically enough to produce a clean listening-only PASS artifact. The remaining blocker is runner/client settle instability on the physical device, not missing listening controls or missing backend timing logic.
