# Final Validation Unblocked Audit

Date: 2026-04-03
Repository: `/home/vitus/kielitaika-app`
Scope: `validation_mode_+_final_unblock_strict_safe_mode.md`

## 1. Validation mode design

A strictly isolated validation override was added behind `YKI_VALIDATION_MODE=true`.

Changed files:

- `packages/core/config/env.ts`
- `apps/backend/yki/orchestrator.py`
- `apps/backend/yki/contracts.py`
- `apps/backend/yki/view_builder.py`
- `apps/backend/tests/yki_test_support.py`
- `apps/backend/tests/test_yki_exam_runtime.py`

Behavior:

- Production default remains unchanged because validation mode is off unless explicitly enabled.
- The override only relaxes section-boundary progression in the backend orchestrator.
- Engine calls remain real.
- API contract versions remain unchanged.
- Every backend override trigger is logged as `VALIDATION_MODE_OVERRIDE`.

## 2. Engine full flow result

Result: blocked.

Live validation was executed against the real external engine with:

- engine base URL `http://127.0.0.1:8181`
- backend validation mode enabled
- governed YKI session driven through real `/start`, `/get`, `/answer`, `/play`, and `/next` calls

Observed outcome:

- Reading completed successfully.
- Backend validation mode allowed transition to listening before the normal wait window.
- The first listening answer failed through the real engine path.

Real failure evidence:

- Backend returned governed error `ENGINE_ERROR`.
- Engine response was HTTP `400 Bad Request`.
- Engine detail: `Section listening has not started yet`.

Conclusion:

- Backend-only validation mode is not sufficient to complete the full exam.
- The external engine still enforces its own section clock on answer submission.

## 3. Listening completion proof

Listening completion was not proven.

What was proven:

- Validation mode can expose the listening section earlier at the governed backend layer.
- The real engine rejects listening answers until its own window opens.

What was not proven:

- Full listening completion
- Writing completion after a real listening pass
- Speaking completion after a real listening and writing pass
- End-to-end exam completion under validation mode

## 4. Android media validation

Result: blocked.

Device status:

- `adb devices` on 2026-04-03 showed a connected real device: `SM02E4060333233`

On-device execution:

- Expo opened the project on-device at `exp://192.168.100.41:8081`
- Focused Android activity became `host.exp.exponent/.experience.ExperienceActivity`

Observed outcome:

- The app redboxed immediately on-device with `Maximum update depth exceeded`
- UI dump from `/sdcard/ui.xml` confirmed the redbox was visible in Expo Go

Impact:

- Playback test could not be executed
- Recording test could not be executed
- Permission prompt validation could not be executed
- Background playback or recording validation could not be executed

## 5. Differences vs production behavior

Validation mode changes only:

- section-complete gating in the orchestrator
- rendered `next` enablement for the section-complete view
- override logging

Validation mode does not change:

- engine timing rules
- engine payloads
- governed API envelope versions
- default production behavior when the flag is off

Strict production behavior was revalidated live after turning the flag off:

- backend on port `8003` ran without `YKI_VALIDATION_MODE`
- reading reached `section_complete`
- `next_enabled` was `false`
- `/next` returned `NEXT_SECTION_NOT_AVAILABLE`

## 6. Risks

- Validation mode can create a false expectation of full unblock, but the real engine remains authoritative and still blocks early listening answers.
- Android runtime stability is not currently proven on the connected device because the app redboxed before media validation could begin.
- Deploying on the basis of this run would misstate both backend end-to-end readiness and Android media readiness.

## 7. Verification summary

Passed:

- `python3 -m unittest apps/backend/tests/test_yki_exam_runtime.py apps/backend/tests/test_yki_audio_media_pipeline.py apps/backend/tests/test_api_contract_envelope.py`
- `./node_modules/.bin/tsc --noEmit -p tsconfig.json`
- `npm run controlled_ui_contract_validation`

Additional live checks:

- Validation mode override log observed during live session progression
- Real engine failure reproduced at the listening answer boundary
- Strict gating restoration verified live with validation mode off
- Android device connection and Expo launch confirmed

## 8. Final verdict

BLOCKED

Reasons:

- Full YKI flow did not complete with the real engine because listening answers are still time-gated by the engine.
- Android media validation could not be completed because the app crashed on-device with `Maximum update depth exceeded`.
