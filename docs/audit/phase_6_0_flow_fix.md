# Phase 6.0 Flow Fix

Date: `2026-03-26`

## 1. Old Flow (Broken)

The app already had a top-level shell, but the YKI route behaved like a runtime inspector instead of a screen flow.

Broken characteristics:

- one generic `route === "yki"` branch owned intro, runtime metadata, active screen content, submission controls, and certificate loading in one stacked page
- YKI errors rendered inline inside that same block
- restored YKI runtime reopened the same stacked screen instead of a dedicated runtime state
- subscription gating remained fully active in development, so local testing could hit `Subscription expired`

Reference comparison to `/home/vitus/Documents/puhis/frontend`:

- Puhis uses explicit screen transitions
- YKI entry is a separate start screen
- runtime is its own screen
- result/end is its own screen

## 2. New Flow (Fixed)

The app now uses explicit screen state for the main frontend flow.

Primary screen model:

- `home`
- `cards`
- `roleplay`
- `voice`
- `yki_intro`
- `yki_runtime`
- `yki_result`

YKI flow:

- `home` -> `yki_intro`
- `yki_intro` -> `yki_runtime`
- `yki_runtime` -> `yki_result`
- `yki_result` -> `yki_intro`

Restore behavior:

- restored YKI cache now opens `yki_runtime`
- restored roleplay still opens `roleplay`
- default authenticated landing screen is `home`

## 3. Screen Map

Top-level renderer in `frontend/app/App.tsx` now chooses exactly one active screen.

Active screen mapping:

- `home` -> `DashboardScreen`
- `cards` -> `CardsScreen`
- `roleplay` -> `RoleplayScreen`
- `voice` -> `VoiceStudioScreen`
- `yki_intro` -> `YkiIntroScreen`
- `yki_runtime` -> `YkiExamScreen`
- `yki_result` -> `YkiResultScreen`

YKI ownership split:

- `YkiIntroScreen` starts or resumes the exam
- `YkiExamScreen` owns only the active runtime step
- `YkiResultScreen` owns completion/result review

## 4. Component Structure

App shell structure:

- `AppShell`
  - persistent sidebar
  - contained content window
  - one active content screen

Updated shell behavior:

- sidebar persists across authenticated screens
- YKI sidebar item stays active for intro/runtime/result
- layout now reads as a contained window instead of a full-page stacked surface

## 5. Dev Mode Logic

Backend:

- `backend/core/config.py` now exposes `dev_mode`
- default local behavior is enabled through `KT_DEV_MODE` fallback
- `backend/services/subscription_service.py` now:
  - returns unlocked subscription features in dev mode
  - bypasses `require_feature()` in dev mode

Frontend:

- `frontend/app/config/devMode.ts` defines the local frontend dev override
- `frontend/app/state/AppStateProvider.tsx` synthesizes an unlocked subscription snapshot if subscription fetch fails during dev

Result:

- local development no longer blocks YKI behind expired subscription state

## 6. Files Created / Modified

Created:

- `frontend/app/config/devMode.ts`
- `frontend/app/hooks/useAppScreen.ts`
- `frontend/app/screens/YkiIntroScreen.tsx`
- `frontend/app/screens/YkiResultScreen.tsx`
- `docs/audit/phase_6_0_flow_fix.md`

Modified:

- `frontend/app/App.tsx`
- `frontend/app/components/AppShell.tsx`
- `frontend/app/screens/DashboardScreen.tsx`
- `frontend/app/screens/YkiExamScreen.tsx`
- `frontend/app/state/AppStateProvider.tsx`
- `frontend/app/state/types.ts`
- `frontend/app/theme/global.css`
- `backend/core/config.py`
- `backend/services/subscription_service.py`

## Verification

Executed:

- `python3 -m py_compile backend/core/config.py backend/services/subscription_service.py`
- `npm run build`

Results:

- backend compile passed
- frontend build passed

## Outcome

The app now enforces one active screen at a time at the top level, YKI has a dedicated intro/runtime/result flow aligned with the Puhis model, the authenticated experience uses a persistent shell, and dev mode no longer blocks YKI behind subscription expiry.
