# IMPLEMENTATION_STATUS

## Question 1

Are all designed systems implemented?

Answer: No.

### Fully Implemented

- Single active-screen outlet through `/home/vitus/kielitaika/frontend/app/App.tsx`
- Persistent authenticated app shell via `/home/vitus/kielitaika/frontend/app/components/AppShell.tsx`
- Mobile drawer behavior via `/home/vitus/kielitaika/frontend/app/components/AppShell.tsx` and `/home/vitus/kielitaika/frontend/app/theme/global.css`
- Screen background authority via `/home/vitus/kielitaika/frontend/app/theme/backgrounds.ts`
- Global transparent logo overlay via `/home/vitus/kielitaika/frontend/app/App.tsx`
- Built-in debug screen and persisted logs via `/home/vitus/kielitaika/frontend/app/screens/DebugScreen.tsx` and `/home/vitus/kielitaika/frontend/app/services/debugLogger.ts`
- Build-time UI invariant enforcement via `/home/vitus/kielitaika/frontend/app/system/ui_invariants.ts`, `/home/vitus/kielitaika/frontend/app/system/ui_regression_tests.ts`, and `/home/vitus/kielitaika/frontend/app/system/ui_violation_detector.ts`

### Partially Implemented

- Route architecture
  Evidence: URL syncing exists, but the repo does not implement the full route tree described in the design docs.
- Icon system
  Evidence: Lucide is used in shell and many screen actions, but practice still uses emoji/text symbols and there is no global icon contract file yet.
- Spacing/token system
  Evidence: `tokens.css` exists, but most spacing, radius, and size rules remain hardcoded in `global.css`.
- Typography system
  Evidence: Inter is the base font, but headings still use Georgia and there is no unified type scale contract in code.
- Error system
  Evidence: Operational logging is implemented, but fatal errors still render through a separate auth-like fallback.

### Not Implemented

- Dedicated nested route families such as:
  `/conversation/session`
  `/conversation/result`
  `/yki/reading`
  `/yki/listening`
  `/yki/writing`
  `/professional/speaking`
  `/professional/pronunciation`
  `/professional/tools`
  `/settings/profile`
  `/settings/subscription`
- A single code-level icon system spec
- A single code-level design token system covering spacing, radius, type scale, and placement rules
- White reading-card treatment for reading-heavy content as a reusable primitive

## Question 2

Are duplicates already present?

Answer: Yes.

### Evidence

- Dead component duplicate:
  `/home/vitus/kielitaika/frontend/app/components/JsonPreview.tsx` is unused.
- Shadow layout duplicate:
  `/home/vitus/kielitaika/frontend/app/components/GlobalErrorBoundary.tsx` duplicates the auth-shell presentation pattern.
- Split navigation authority:
  `/home/vitus/kielitaika/frontend/app/App.tsx` and `/home/vitus/kielitaika/frontend/app/state/AppStateProvider.tsx` both participate in route/screen authority.
- Fragmented speaking implementation:
  `/home/vitus/kielitaika/frontend/app/screens/VoiceStudioScreen.tsx` and `/home/vitus/kielitaika/frontend/app/screens/YkiExamScreen.tsx`
- Dead asset families:
  large sets of background assets under `/home/vitus/kielitaika/frontend/app/assets/images/backgrounds/` are not referenced anywhere.

## Verification Results

- `npm run validate:ui-invariants`: passed
- `npm run build`: passed

## Final Assessment

- The repo does implement the core shell, screen isolation, debug capture, and build-time guardrails.
- It does not yet implement the full designed system as specified by the two design documents.
- Duplicates are present, but they are now concentrated in dead assets, fallback UI, and fragmented ownership boundaries rather than duplicate top-level screens.
