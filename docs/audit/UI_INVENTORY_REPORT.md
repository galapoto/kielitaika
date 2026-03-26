# UI_INVENTORY_REPORT

## SECTION 1 — Layout Systems

| File path | Purpose | Where it is used | Suspected duplicates |
| --- | --- | --- | --- |
| `/home/vitus/kielitaika/frontend/app/App.tsx` | Top-level app layout, active-screen outlet, path synchronization, logo overlay injection | Root app render | Shadow duplicate with route logic in `AppStateProvider.tsx` because navigation state and URL state are both authorities |
| `/home/vitus/kielitaika/frontend/app/components/AppShell.tsx` | Persistent shell with sidebar, drawer behavior, profile area, navigation tree | Authenticated app surface via `App.tsx` | None active; this is the only live shell |
| `/home/vitus/kielitaika/frontend/app/components/ScreenScaffold.tsx` | Shared screen skeleton with header/content/action zones | All authenticated screens except auth/loading | None active; canonical screen wrapper |
| `/home/vitus/kielitaika/frontend/app/components/Panel.tsx` | Shared card/panel surface | Auth, settings, dashboard, debug, conversation, voice, YKI, error boundary | Shadow overlap with `CardsScreen.tsx`, which intentionally owns its own card layout |
| `/home/vitus/kielitaika/frontend/app/theme/backgrounds.ts` | Background authority, screen-to-background mapping, decorative restrictions | `App.tsx`, `Logo.tsx`, loading/auth flows | Fragmented with `global.css` and `App.tsx` because the visual layer is split across three files |
| `/home/vitus/kielitaika/frontend/app/theme/global.css` | Global shell, panel, responsive drawer, card, auth, flow, and debug styling | Entire frontend | Fragmented styling authority with `tokens.css` and `backgrounds.ts` |
| `/home/vitus/kielitaika/frontend/app/theme/tokens.css` | CSS variable token file | Global stylesheet import in `main.tsx` | Partial overlap with hardcoded values in `global.css` |
| `/home/vitus/kielitaika/frontend/app/components/LoadingScreen.tsx` | Boot/loading gate surface | `App.tsx` during boot/restore | Shadow overlap with auth/error shells because it uses a full-page centered card pattern outside `AppShell` |
| `/home/vitus/kielitaika/frontend/app/components/GlobalErrorBoundary.tsx` | Unhandled error fallback screen | `main.tsx` root wrapper | Shadow duplicate of auth-card shell structure and debug/error visibility system |

## SECTION 2 — Screens

| File path | Purpose | Where it is used | Suspected duplicates |
| --- | --- | --- | --- |
| `/home/vitus/kielitaika/frontend/app/screens/AuthScreen.tsx` | Login/register/Google entry | `App.tsx` unauthenticated branch | Shares auth-card shell pattern with `GlobalErrorBoundary.tsx` |
| `/home/vitus/kielitaika/frontend/app/screens/DashboardScreen.tsx` | Home landing screen | `App.tsx` `home` branch | No file duplicate, but still carries dashboard-era structure markers |
| `/home/vitus/kielitaika/frontend/app/screens/CardsScreen.tsx` | Practice intro + runtime | `App.tsx` `practice` branch | No active duplicate; old `PracticeScreen.tsx` was removed |
| `/home/vitus/kielitaika/frontend/app/screens/RoleplayScreen.tsx` | Conversation setup/runtime/review | `App.tsx` `conversation` branch | No active duplicate; old `ConversationScreen.tsx` was removed |
| `/home/vitus/kielitaika/frontend/app/screens/VoiceStudioScreen.tsx` | Professional Finnish speaking/pronunciation/tools | `App.tsx` `professional` branch | Shadow overlap with speaking portions of `YkiExamScreen.tsx` |
| `/home/vitus/kielitaika/frontend/app/screens/YkiIntroScreen.tsx` | YKI exam entry and level selection | `App.tsx` `yki_intro` branch | Fragmented YKI flow with `YkiExamScreen.tsx` and `YkiResultScreen.tsx` |
| `/home/vitus/kielitaika/frontend/app/screens/YkiExamScreen.tsx` | YKI runtime flow for reading/listening/writing/speaking | `App.tsx` `yki_runtime` branch | Fragmented speaking/audio behavior with `VoiceStudioScreen.tsx` |
| `/home/vitus/kielitaika/frontend/app/screens/YkiResultScreen.tsx` | YKI result summary | `App.tsx` `yki_result` branch | Fragmented YKI flow with intro/runtime |
| `/home/vitus/kielitaika/frontend/app/screens/SettingsScreen.tsx` | Account and subscription details | `App.tsx` `settings` branch | None active |
| `/home/vitus/kielitaika/frontend/app/screens/DebugScreen.tsx` | Persisted logs, nav events, API/runtime failures | `App.tsx` `debug` branch | Partial overlap with `GlobalErrorBoundary.tsx` for surfaced failures |

## SECTION 3 — Shared Components

| File path | Purpose | Where it is used | Suspected duplicates |
| --- | --- | --- | --- |
| `/home/vitus/kielitaika/frontend/app/components/Button.tsx` | Shared button primitive with audio tap behavior | Authenticated screens, auth screen, shell footer | None active |
| `/home/vitus/kielitaika/frontend/app/components/Field.tsx` | Shared input and textarea fields | Auth, practice, conversation, voice, YKI | None active |
| `/home/vitus/kielitaika/frontend/app/components/Logo.tsx` | Brand mark/wordmark | App shell, auth screen, loading screen | Fragmented with direct logo overlay image usage in `App.tsx` |
| `/home/vitus/kielitaika/frontend/app/components/StatusBanner.tsx` | Shared success/error/neutral feedback surface | Auth, practice, conversation, voice, YKI, error boundary | None active |
| `/home/vitus/kielitaika/frontend/app/components/JsonPreview.tsx` | Raw JSON renderer | Not imported anywhere in current app | Dead component |
| `/home/vitus/kielitaika/frontend/app/hooks/useResponsiveLayout.ts` | Mobile/desktop responsive hook | `AppShell.tsx` | None active |
| `/home/vitus/kielitaika/frontend/app/hooks/useRecorder.ts` | MediaRecorder wrapper | `VoiceStudioScreen.tsx`, `YkiExamScreen.tsx` | None active, but it underpins two separate speaking UIs |

## SECTION 4 — Styling Systems

| File path | Purpose | Where it is used | Suspected duplicates |
| --- | --- | --- | --- |
| `/home/vitus/kielitaika/frontend/app/theme/global.css` | Primary authored CSS system | Entire frontend | Overlaps with `tokens.css` and hardcoded screen-specific CSS |
| `/home/vitus/kielitaika/frontend/app/theme/tokens.css` | CSS variables and token roots | Entire frontend | Partial overlap with repeated literals in `global.css` |
| `/home/vitus/kielitaika/frontend/app/theme/backgrounds.ts` | JS-managed background style system | `App.tsx`, `Logo.tsx`, loading/auth | Fragmented authority with CSS |
| `/home/vitus/kielitaika/frontend/app/system/ui_invariants.ts` | Locked UI rules and width/spacing/card contracts | `CardsScreen.tsx`, `backgrounds.ts`, detector | None active |
| `/home/vitus/kielitaika/frontend/app/system/ui_regression_tests.ts` | Required markers/scenarios for detector | `ui_violation_detector.ts` | None active |
| `/home/vitus/kielitaika/frontend/app/system/ui_violation_detector.ts` | Build-time enforcement of invariants | `npm run validate:ui-invariants`, `prebuild` | None active |

## Notes

- Active screen wrappers that used to duplicate flow responsibility are already removed: `/home/vitus/kielitaika/frontend/app/screens/PracticeScreen.tsx`, `/home/vitus/kielitaika/frontend/app/screens/ConversationScreen.tsx`, `/home/vitus/kielitaika/frontend/app/screens/ProfessionalFinnishScreen.tsx`, and `/home/vitus/kielitaika/frontend/app/hooks/useAppScreen.ts`.
- The asset tree still contains many unused background and screenshot files that are not referenced anywhere in the current runtime, especially under `/home/vitus/kielitaika/frontend/app/assets/images/backgrounds/` and `/home/vitus/kielitaika/frontend/app/assets/images/`.
