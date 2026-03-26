# DUPLICATE_ANALYSIS_REPORT

## Duplicate Group 1

- Component Name: Raw JSON viewer
- Files: `/home/vitus/kielitaika/frontend/app/components/JsonPreview.tsx`
- Type: DEAD
- Why duplicate exists: It served earlier debug-style UI surfaces, but those surfaces were removed from conversation, voice, and YKI screens.
- Which one is closest to design system: None. The design system forbids raw backend payloads in user UI.
- Which one should survive: No live user-facing instance. If raw payload inspection is still needed, move the capability inside `/home/vitus/kielitaika/frontend/app/screens/DebugScreen.tsx`.
- Risk level: Low

## Duplicate Group 2

- Component Name: Auth-style full-screen card shell
- Files: `/home/vitus/kielitaika/frontend/app/screens/AuthScreen.tsx`, `/home/vitus/kielitaika/frontend/app/components/GlobalErrorBoundary.tsx`
- Type: SHADOW
- Why duplicate exists: The error boundary reuses the auth shell/card composition instead of a dedicated error layout.
- Which one is closest to design system: `AuthScreen.tsx` because it is intentional product UI; `GlobalErrorBoundary.tsx` is a fallback surface.
- Which one should survive: Keep `AuthScreen.tsx` as product UI. Rewrite `GlobalErrorBoundary.tsx` later to a dedicated debug/error presentation or route.
- Risk level: Medium

## Duplicate Group 3

- Component Name: Navigation authority
- Files: `/home/vitus/kielitaika/frontend/app/App.tsx`, `/home/vitus/kielitaika/frontend/app/state/AppStateProvider.tsx`
- Type: SHADOW
- Why duplicate exists: `AppStateProvider.tsx` holds screen state while `App.tsx` independently maps screen state to URL paths and practice subsections.
- Which one is closest to design system: Neither fully. A real route layer would centralize this.
- Which one should survive: Keep `AppStateProvider.tsx` as temporary screen authority, but move all route mapping into a single dedicated routing module in the next rebuild.
- Risk level: High

## Duplicate Group 4

- Component Name: Speaking capture flow
- Files: `/home/vitus/kielitaika/frontend/app/screens/VoiceStudioScreen.tsx`, `/home/vitus/kielitaika/frontend/app/screens/YkiExamScreen.tsx`, `/home/vitus/kielitaika/frontend/app/hooks/useRecorder.ts`
- Type: FRAGMENTED
- Why duplicate exists: Recording, microphone state, audio playback, and speaking-submit behavior are split across a general speaking screen and YKI-specific speaking runtime.
- Which one is closest to design system: `VoiceStudioScreen.tsx` is closer because it presents a single-purpose speaking loop.
- Which one should survive: Keep `useRecorder.ts` as the shared hook, but extract a reusable speaking task surface for both screens.
- Risk level: High

## Duplicate Group 5

- Component Name: Error/log surfacing
- Files: `/home/vitus/kielitaika/frontend/app/components/GlobalErrorBoundary.tsx`, `/home/vitus/kielitaika/frontend/app/services/debugLogger.ts`, `/home/vitus/kielitaika/frontend/app/screens/DebugScreen.tsx`
- Type: FRAGMENTED
- Why duplicate exists: Fatal errors are rendered in a blocking boundary, while operational errors are persisted in debug logs and shown separately.
- Which one is closest to design system: `DebugScreen.tsx` because it aligns with the built-in `/debug` requirement.
- Which one should survive: Keep `debugLogger.ts` and `DebugScreen.tsx`; refactor `GlobalErrorBoundary.tsx` to log and redirect or render through the same visual system.
- Risk level: Medium

## Duplicate Group 6

- Component Name: Background visual authority
- Files: `/home/vitus/kielitaika/frontend/app/theme/backgrounds.ts`, `/home/vitus/kielitaika/frontend/app/theme/global.css`, `/home/vitus/kielitaika/frontend/app/App.tsx`
- Type: FRAGMENTED
- Why duplicate exists: Screen background selection lives in JS, logo overlay lives in `App.tsx`, and shell/background presentation lives in CSS.
- Which one is closest to design system: `backgrounds.ts` is the strongest authority for screen mapping, but it does not yet own the full layer contract.
- Which one should survive: Keep `backgrounds.ts` as source of truth and consolidate the overlay contract under a single layout-layer module.
- Risk level: Medium

## Duplicate Group 7

- Component Name: Unused visual asset families
- Files: `/home/vitus/kielitaika/frontend/app/assets/images/backgrounds/dark/admindashboardscreen/admin_dashboard.png`, `/home/vitus/kielitaika/frontend/app/assets/images/backgrounds/dark/certificatedetailscree/certificate_detail_screen.png`, `/home/vitus/kielitaika/frontend/app/assets/images/backgrounds/dark/certificatelistscreen/certificate_list_screen.png`, `/home/vitus/kielitaika/frontend/app/assets/images/backgrounds/dark/fluency_screen/fluency_screen.png`, `/home/vitus/kielitaika/frontend/app/assets/images/backgrounds/dark/grammarlabscreen/grammar_lab_screen.png`, `/home/vitus/kielitaika/frontend/app/assets/images/backgrounds/dark/guidedturnscreen/guided_turn_screen.png`, `/home/vitus/kielitaika/frontend/app/assets/images/backgrounds/dark/practice/practice_dark.png`, `/home/vitus/kielitaika/frontend/app/assets/images/backgrounds/dark/yki/yki_listen_dark.png`, `/home/vitus/kielitaika/frontend/app/assets/images/backgrounds/dark/yki/yki_read_dark.png`, `/home/vitus/kielitaika/frontend/app/assets/images/backgrounds/dark/yki/yki_speak_dark.png`, `/home/vitus/kielitaika/frontend/app/assets/images/backgrounds/dark/yki/yki_write_dark.png`, and the matching light-mode counterparts
- Type: DEAD
- Why duplicate exists: The asset library is much larger than the current background mapping and appears to be inherited from earlier UI directions.
- Which one is closest to design system: Only files referenced in `backgrounds.ts` are active.
- Which one should survive: Keep currently referenced images and reclassify the rest before deletion.
- Risk level: Low

## Duplicate Group 8

- Component Name: Core design authority documents
- Files: `/home/vitus/kielitaika/docs/ui_design/core_design_principle.md`, `/home/vitus/kielitaika/docs/ui_design/updated_core_design_principle.md`
- Type: SHADOW
- Why duplicate exists: The updated document adds corrective implementation guidance but does not replace the original source of truth cleanly.
- Which one is closest to design system: `core_design_principle.md` is the declared source of truth; `updated_core_design_principle.md` is an implementation correction memo.
- Which one should survive: Keep both for now, then fold stable rules from the updated document into a single canonical contract.
- Risk level: Medium

## Conclusion

- Active runtime TSX duplicates are much lower than before due to the Phase 7.4 removals.
- Duplicates still exist in three important forms: split routing authority, split error/debug surfacing, and split speaking-flow implementation.
- The largest dead duplicate surface is now the asset library, not the active screen tree.
