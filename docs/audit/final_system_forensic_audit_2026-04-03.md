# Final System Forensic Audit

Date: 2026-04-03

## 1. Summary

System state after this enforcement pass:

- The governed YKI backend no longer advances into listening before the engine allows it.
- Real backend-to-engine reading submissions were verified live with engine request logging enabled.
- The backend now fails closed at the reading-to-listening boundary with `NEXT_SECTION_NOT_AVAILABLE` instead of surfacing a downstream engine `400`.
- The Android Expo launch loop that previously crashed in `app/_layout.tsx` was fixed and did not reproduce in a clean post-fix relaunch.

Key fixes applied:

- Added full engine request and error payload logging in `apps/backend/yki/engine_client.py`.
- Aligned governed YKI section timing with engine timing in `apps/backend/yki/contracts.py`.
- Enforced next-section availability in `apps/backend/yki/orchestrator.py`.
- Reflected timing-gated section advancement in `apps/backend/yki/view_builder.py`.
- Added backend test coverage for the timing gate in `apps/backend/tests/test_yki_exam_runtime.py`.
- Removed duplicate auth hydration in `apps/client/app/_layout.tsx`.
- Guarded Expo Router replacements in `apps/client/state/AppShell.tsx` to avoid same-route remount loops.

## 2. Files Modified

- `apps/backend/tests/test_yki_exam_runtime.py`
- `apps/backend/tests/yki_test_support.py`
- `apps/backend/yki/contracts.py`
- `apps/backend/yki/engine_client.py`
- `apps/backend/yki/errors.py`
- `apps/backend/yki/orchestrator.py`
- `apps/backend/yki/view_builder.py`
- `apps/client/app/_layout.tsx`
- `apps/client/state/AppShell.tsx`

## 3. Engine Fix Details

Root cause:

- The backend was using shorter local section windows than the external engine.
- The engine uses `reading=60`, `listening=40`, `writing=55`, `speaking=20` minutes.
- The backend had been advancing to listening before the engine considered the listening section active.

Captured real mismatch evidence from direct engine execution:

- Reading answer payload succeeded with `200`.
- Listening answer payload with the same contract shape failed with `400 {"detail": "Section listening has not started yet"}`.

Fix applied:

- Governed session timing now derives from engine-aligned timing.
- All section windows are precomputed from exam start.
- `next` is blocked while the next engine-enforced section window is still closed.
- Section-complete views render `next.enabled: false` and instruct the user to wait for the next section window.

Live backend proof after the fix:

- Real reading traversal reached `section_complete`.
- The live session returned:
  - `terminal_kind: section_complete`
  - `blocked_error: NEXT_SECTION_NOT_AVAILABLE`
  - instructions: `Reading is sealed.` and `Wait until the listening section window opens.`

## 4. YKI Flow Validation

Verified live:

- Session start through `/api/v1/yki/sessions/start`
- Real reading progression against the external engine
- Real engine answer submissions logged from the backend
- Reading-to-listening boundary fail-closed behavior

Verified by tests:

- `ENGINE_UNAVAILABLE`
- invalid engine payload handling
- timeout handling
- orchestrated runtime transitions

Not fully proven in live execution:

- Full listening answer submission through the real engine after the listening window opens
- Full writing and speaking completion in one real engine-backed run

Reason:

- The external engine enforces the real reading window before listening can start.
- This pass verified the contract fix and the fail-closed behavior, but did not wait through the full real reading time window.

## 5. Android Validation

Device:

- `adb devices` reported `SM02E4060333233 device`

Verified on device:

- Expo app launched on Android through `npm run android`
- Metro bundled successfully
- `adb dumpsys activity` showed Expo Go `ExperienceActivity` in the foreground

Crash finding:

- Initial Android run reproduced a real runtime failure:
  - `Maximum update depth exceeded`
  - error boundary hit from `app/_layout.tsx`
- This was traced to repeated auth/shell remount behavior.

Fix applied:

- Removed duplicate auth hydration from `apps/client/app/_layout.tsx`
- Added same-path router replacement guards in `apps/client/state/AppShell.tsx`

Post-fix validation:

- Cleared logcat
- Relaunched on device
- Re-scanned logcat
- The previous `Maximum update depth exceeded` and `ERROR_BOUNDARY` signatures did not reappear

Not proven on device:

- listening prompt playback lifecycle
- microphone permission flow
- recording start/stop/submit lifecycle
- background/foreground audio and recording cleanup

## 6. Failure Testing

Live failure injection:

- Engine stopped
- `POST /api/v1/yki/sessions/start` returned structured `ENGINE_UNAVAILABLE`

Tested in backend suite:

- timeout path
- invalid engine response path

## 7. Multi-Engine Validation

Validated through the backend test matrix:

- YKI runtime tests passed
- YKI audio media pipeline tests passed
- daily practice engine tests passed
- speaking practice engine tests passed
- learning system engine tests passed

Full backend discovery result:

- `python3 -m unittest discover -s apps/backend/tests`
- `70` tests passed

## 8. State Consistency

Verified:

- governed YKI session progression remains forward-only
- section windows are deterministic from session start
- section-complete transition is blocked until the next section window opens
- no legacy YKI execution path was re-enabled during this pass

Residual observation:

- `yki.session_store.py` remains referenced outside governed YKI runtime for non-runtime helpers such as progress-history access

## 9. Audio Forensic Results

Backend/runtime side:

- Listening prompt gating remains single-play governed by runtime contract
- Backend no longer attempts to advance into a not-yet-open listening section

Android side:

- The app-shell launch crash was fixed
- Real audio playback and recording behavior was not fully exercised on-device in this pass

## 10. Codebase Scan Results

Targeted source scan excluding `node_modules` and built output found:

- `session_store` references in:
  - `apps/backend/practice/adapter.py`
  - `apps/backend/speaking/adapter.py`
  - `apps/backend/yki_practice/generator.py`
  - `apps/backend/learning/graph_service.py`
  - backend tests
- No source-level browser runtime usage was found for:
  - `window`
  - `document`
  - `navigator`
  - `localStorage`
  - `setInterval`
  - `setTimeout`

Classification:

- YKI runtime legacy path: not found in governed YKI execution path
- non-YKI/session helper usage: still present and currently allowed
- timer/browser API risk in runtime code: not found in the scanned source set

## 11. Remaining Risks

- The committed repo now declares `httpx` in backend requirements, but a local backend venv without dependency sync will still fail live startup until requirements are installed.
- Full real listening completion was not proven after the actual engine listening window opened.
- Android audio playback, microphone permission handling, recording submission, and background lifecycle were not fully validated on device.

## 12. Final Verdict

BLOCKED

Exact blockers:

- Full real listening execution was not proven end-to-end after the engine-enforced listening window opened.
- Android media lifecycle validation is incomplete: playback, recording, permission prompt, and background/foreground handling were not fully exercised on the attached device.

What is proven and fixed:

- The backend contract defect that caused the earlier listening `400` surface failure is fixed at the orchestration layer.
- The system now fails closed at the section boundary instead of sending the user into an invalid engine state.
- The Android app-shell launch loop reproduced in the first device run was fixed and did not reproduce in the clean post-fix relaunch.
