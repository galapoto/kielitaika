# CLEANUP_EXECUTION_PLAN

## Objective

Prepare the frontend for a clean rebuild by removing dead surfaces, collapsing split authorities, and preserving rollback safety.

## Order of Operations

### 1. Freeze the current verified baseline

- Keep: `/home/vitus/kielitaika/frontend/app/system/ui_invariants.ts`
- Keep: `/home/vitus/kielitaika/frontend/app/system/ui_violation_detector.ts`
- Keep: `/home/vitus/kielitaika/frontend/app/system/ui_regression_tests.ts`
- Why first: These files are the safety net for the cleanup work.
- Rollback safety: Run `npm run validate:ui-invariants` and `npm run build` before and after each cleanup batch.

### 2. Remove dead component surfaces

- Delete candidate: `/home/vitus/kielitaika/frontend/app/components/JsonPreview.tsx`
- Keep replacement: `/home/vitus/kielitaika/frontend/app/screens/DebugScreen.tsx`
- Validation before deletion: Confirm no imports exist.
- Rollback safety: Single-file restoration is trivial because there are no current imports.

### 3. Normalize fatal error handling

- Keep: `/home/vitus/kielitaika/frontend/app/services/debugLogger.ts`
- Rewrite: `/home/vitus/kielitaika/frontend/app/components/GlobalErrorBoundary.tsx`
- Goal: Stop reusing the auth-shell layout and align fatal error presentation with the debug/error system.
- Risk: Medium, because this touches last-resort failure handling.
- Rollback safety: Change only the boundary presentation layer, not the root wiring in `/home/vitus/kielitaika/frontend/app/main.tsx`.

### 4. Collapse routing authority

- Keep temporary source of truth: `/home/vitus/kielitaika/frontend/app/state/AppStateProvider.tsx`
- Rewrite next: `/home/vitus/kielitaika/frontend/app/App.tsx`
- Create later: dedicated route mapping module for screen <-> path conversion
- Goal: Remove the current shadow split between state-managed navigation and inline path translation.
- Risk: High
- Rollback safety: Introduce the routing module first, switch consumers second, then remove duplicated helpers.

### 5. Extract shared speaking task UI

- Keep shared hook: `/home/vitus/kielitaika/frontend/app/hooks/useRecorder.ts`
- Keep screens: `/home/vitus/kielitaika/frontend/app/screens/VoiceStudioScreen.tsx`, `/home/vitus/kielitaika/frontend/app/screens/YkiExamScreen.tsx`
- Extract later: shared speaking task component(s) under `/home/vitus/kielitaika/frontend/app/components/`
- Goal: Remove duplicated microphone/status/audio/task structure.
- Risk: High
- Rollback safety: Extract presentation only first, leave service calls and flow branching in the screen files until stable.

### 6. Consolidate visual-layer authority

- Keep: `/home/vitus/kielitaika/frontend/app/theme/backgrounds.ts`
- Rewrite: `/home/vitus/kielitaika/frontend/app/App.tsx`
- Refactor: `/home/vitus/kielitaika/frontend/app/theme/global.css`
- Goal: Move background layer, logo overlay, and content-shell rules into one clearer ownership model.
- Risk: Medium
- Rollback safety: Preserve current class names until the detector is updated alongside the refactor.

### 7. Audit and purge dead assets

- Audit candidates:
  `/home/vitus/kielitaika/frontend/app/assets/images/backgrounds/dark/admindashboardscreen/admin_dashboard.png`
  `/home/vitus/kielitaika/frontend/app/assets/images/backgrounds/dark/certificatedetailscree/certificate_detail_screen.png`
  `/home/vitus/kielitaika/frontend/app/assets/images/backgrounds/dark/certificatelistscreen/certificate_list_screen.png`
  `/home/vitus/kielitaika/frontend/app/assets/images/backgrounds/dark/fluency_screen/fluency_screen.png`
  `/home/vitus/kielitaika/frontend/app/assets/images/backgrounds/dark/grammarlabscreen/grammar_lab_screen.png`
  `/home/vitus/kielitaika/frontend/app/assets/images/backgrounds/dark/guidedturnscreen/guided_turn_screen.png`
  `/home/vitus/kielitaika/frontend/app/assets/images/backgrounds/dark/practice/practice_dark.png`
  `/home/vitus/kielitaika/frontend/app/assets/images/backgrounds/dark/yki/yki_listen_dark.png`
  `/home/vitus/kielitaika/frontend/app/assets/images/backgrounds/dark/yki/yki_read_dark.png`
  `/home/vitus/kielitaika/frontend/app/assets/images/backgrounds/dark/yki/yki_speak_dark.png`
  `/home/vitus/kielitaika/frontend/app/assets/images/backgrounds/dark/yki/yki_write_dark.png`
  and matching unused light-mode files
- Goal: Remove dead visual inventory after proof of zero references.
- Risk: Low
- Rollback safety: Delete in one isolated commit after a reference scan.

### 8. Reconcile design authority documents

- Keep canonical source: `/home/vitus/kielitaika/docs/ui_design/core_design_principle.md`
- Review/merge: `/home/vitus/kielitaika/docs/ui_design/updated_core_design_principle.md`
- Goal: Replace shadow authority with one final design contract before the next rebuild phase.
- Risk: Low
- Rollback safety: Documentation-only change.

## What To Keep

- `AppShell.tsx`
- `ScreenScaffold.tsx`
- `backgrounds.ts`
- `debugLogger.ts`
- `DebugScreen.tsx`
- `ui_invariants.ts`
- `ui_violation_detector.ts`

## What To Delete

- `JsonPreview.tsx` after no-import confirmation
- Unused background/screenshot assets after reference scan

## What To Merge

- Route mapping and screen authority
- Fatal error UI with the debug/error system
- Shared speaking-task presentation
- Design document authority

## What To Rewrite

- `GlobalErrorBoundary.tsx`
- `App.tsx` route/path coordination
- Portions of `global.css` into a stricter tokenized system

## Rollback Rule

- Every cleanup batch must remain independently reversible and must leave `npm run validate:ui-invariants` and `npm run build` green.
