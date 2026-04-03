# Final Android And Engine Validation Audit

Date: 2026-04-03
Repository: `/home/vitus/kielitaika-app`
Scope: `android_crash_fix_+_engine_aligned_validation_strict.md`

## 1. Android crash root cause

Root cause was in `apps/client/state/YkiExamRoute.tsx`.

The route used `useFocusEffect` with a non-memoized inline callback:

- a fresh callback was created on every render
- `useFocusEffect` treats callback identity as part of its effect lifecycle
- cleanup ran repeatedly
- the cleanup called `setRecording(false)`
- that state write caused another render and another callback replacement cycle

This matches the on-device redbox:

- `Maximum update depth exceeded`

Files inspected during root-cause check:

- `apps/client/app/_layout.tsx`
- `apps/client/state/AppShell.tsx`
- `apps/client/state/YkiExamRoute.tsx`

No shell-level navigation loop was required to explain the crash. The unstable focus-effect callback was sufficient.

## 2. Fix applied

Applied change:

- `apps/client/state/YkiExamRoute.tsx`

Fix:

- imported `useCallback`
- wrapped the `useFocusEffect` callback in `useCallback(..., [])`
- preserved the existing cleanup behavior for audio stop and recording stop

This stabilizes the focus lifecycle so cleanup is not re-registered every render.

## 3. Engine timing alignment

The previous validation-mode assumption was incorrect: backend validation mode cannot bypass real engine timing.

Applied changes:

- `apps/backend/yki/orchestrator.py`
- `apps/backend/yki/view_builder.py`
- `apps/backend/tests/test_yki_exam_runtime.py`

Behavior after the fix:

- backend no longer allows section advancement before the next engine window opens
- section-complete view now explicitly shows:
  - `Waiting for engine section window: listening.`
- backend logs the wait condition instead of issuing `VALIDATION_MODE_OVERRIDE`
- `/next` fail-closes with `NEXT_SECTION_NOT_AVAILABLE`

## 4. Engine timing limitation explanation

Real engine capability check:

- `GET /health` returned `{"status":"ok"}`
- `GET /engine/health` returned `status=OK`
- `GET /engine/status` returned:
  - `engine_version: 3.3`
  - `deterministic_mode: true`

Important result:

- no `test_mode`
- no `fast_mode`
- no engine-side timing override surfaced by the status endpoints

Conclusion:

- there is no supported engine status signal that allows this repo to skip the real section clock
- strict validation must either wait for the real window or stop at a partial proof

## 5. Validation results

Passed local verification:

- `python3 -m unittest apps/backend/tests/test_yki_exam_runtime.py apps/backend/tests/test_yki_audio_media_pipeline.py apps/backend/tests/test_api_contract_envelope.py`
- `./node_modules/.bin/tsc --noEmit -p tsconfig.json`
- `npm run controlled_ui_contract_validation`

Passed live backend verification:

- real engine-backed governed session completed reading
- section-complete view returned:
  - `Waiting for engine section window: listening.`
- `next_enabled` was `false`
- `/next` returned `NEXT_SECTION_NOT_AVAILABLE`

## 6. Listening completion proof

Listening completion was not proven.

What was proven:

- the backend now aligns with engine timing instead of bypassing it
- the real reading-to-listening boundary fail-closes correctly
- the engine status surface does not provide a fast/test mode for section timing

What was not proven:

- waiting through the full real reading window and then submitting a listening answer successfully
- end-to-end full exam completion under live timing

## 7. Android validation

### Launch stability

Passed.

Observed on-device after the fix:

- Expo Go opened the project on the connected Android device
- logcat showed normal app startup and screen transitions to `auth` then `home`
- no `Maximum update depth exceeded`
- no redbox was present in the UI dump after the fix
- UI dump showed the real Home screen with governed navigation buttons

### Media validation

Not fully completed.

What was proven:

- the Android app now launches and remains stable at runtime entry
- the previous crash no longer blocks media testing

What remains incomplete:

- governed YKI exam session start from the device remained transport-error prone in this pass
- listening playback lifecycle on-device
- speaking recording lifecycle on-device
- permission prompt capture for the governed exam path
- background playback/recording validation

Notes:

- an initial on-device YKI exam attempt failed because the backend had been started on `127.0.0.1`, which is not reachable from the phone
- backend was then restarted on `0.0.0.0:8002`
- the app remained stable after the crash fix, but the governed YKI exam start still surfaced transport-error logs on-device before I could obtain a clean exam interaction trace

## 8. Final verdict

BLOCKED

Reasons:

- full listening completion was not proven against the real engine because no fast/test timing mode is exposed and the real wait window was not completed in this pass
- Android media validation is only partially completed; launch stability is fixed, but playback/recording/permissions/background behavior for the governed exam flow were not fully exercised on-device, and governed exam start remained transport-error prone in this pass
