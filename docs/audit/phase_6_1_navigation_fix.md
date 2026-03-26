# Phase 6.1 Navigation Fix

## Mobile Navigation Behavior

- Added `useResponsiveLayout()` in [`frontend/app/hooks/useResponsiveLayout.ts`](/home/vitus/kielitaika/frontend/app/hooks/useResponsiveLayout.ts) to switch shell behavior at `980px`.
- On mobile, the sidebar is hidden by default and opened with a top-left menu button.
- The mobile sidebar is implemented as a slide drawer inside the same `AppShell`.
- A full overlay sits above content while the drawer is open and closes the drawer on tap.
- The active screen title is shown in the mobile top bar so content still reads as a single active screen.

## Sidebar Implementation

- There is one shared shell in [`frontend/app/components/AppShell.tsx`](/home/vitus/kielitaika/frontend/app/components/AppShell.tsx) for both desktop and mobile.
- Desktop keeps the fixed left sidebar layout introduced in phase 6.0.
- Mobile reuses the same sidebar markup and navigation tree, but applies drawer classes from [`frontend/app/theme/global.css`](/home/vitus/kielitaika/frontend/app/theme/global.css).
- The sidebar now includes:
  - profile placeholder
  - username
  - subscription badge
  - settings link
  - sign-out action

## Screen Structure

- `App.tsx` remains the single screen switch point: [`frontend/app/App.tsx`](/home/vitus/kielitaika/frontend/app/App.tsx).
- Only one top-level screen renders at a time from the `screen` state.
- Screen names were normalized in [`frontend/app/state/types.ts`](/home/vitus/kielitaika/frontend/app/state/types.ts):
  - `home`
  - `practice`
  - `conversation`
  - `yki_intro`
  - `yki_runtime`
  - `yki_result`
  - `professional`
  - `settings`
- Dedicated wrappers now isolate each feature:
  - [`frontend/app/screens/PracticeScreen.tsx`](/home/vitus/kielitaika/frontend/app/screens/PracticeScreen.tsx)
  - [`frontend/app/screens/ConversationScreen.tsx`](/home/vitus/kielitaika/frontend/app/screens/ConversationScreen.tsx)
  - [`frontend/app/screens/ProfessionalFinnishScreen.tsx`](/home/vitus/kielitaika/frontend/app/screens/ProfessionalFinnishScreen.tsx)
  - [`frontend/app/screens/SettingsScreen.tsx`](/home/vitus/kielitaika/frontend/app/screens/SettingsScreen.tsx)

## Renamed Navigation Tree

- Home
- Practice
  - Vocabulary
  - Grammar
  - Phrases
- Conversation
- YKI Exam
- Professional Finnish
- Settings

Changes applied:

- `Cards` was renamed to `Practice`
- `Roleplay` was renamed to `Conversation`
- `Voice` was redefined as `Professional Finnish`
- Practice subsections are controlled through `PracticeSection` instead of separate stacked blocks

## Files Modified

- [`frontend/app/App.tsx`](/home/vitus/kielitaika/frontend/app/App.tsx)
- [`frontend/app/components/AppShell.tsx`](/home/vitus/kielitaika/frontend/app/components/AppShell.tsx)
- [`frontend/app/hooks/useResponsiveLayout.ts`](/home/vitus/kielitaika/frontend/app/hooks/useResponsiveLayout.ts)
- [`frontend/app/screens/CardsScreen.tsx`](/home/vitus/kielitaika/frontend/app/screens/CardsScreen.tsx)
- [`frontend/app/screens/ConversationScreen.tsx`](/home/vitus/kielitaika/frontend/app/screens/ConversationScreen.tsx)
- [`frontend/app/screens/DashboardScreen.tsx`](/home/vitus/kielitaika/frontend/app/screens/DashboardScreen.tsx)
- [`frontend/app/screens/PracticeScreen.tsx`](/home/vitus/kielitaika/frontend/app/screens/PracticeScreen.tsx)
- [`frontend/app/screens/ProfessionalFinnishScreen.tsx`](/home/vitus/kielitaika/frontend/app/screens/ProfessionalFinnishScreen.tsx)
- [`frontend/app/screens/RoleplayScreen.tsx`](/home/vitus/kielitaika/frontend/app/screens/RoleplayScreen.tsx)
- [`frontend/app/screens/SettingsScreen.tsx`](/home/vitus/kielitaika/frontend/app/screens/SettingsScreen.tsx)
- [`frontend/app/screens/VoiceStudioScreen.tsx`](/home/vitus/kielitaika/frontend/app/screens/VoiceStudioScreen.tsx)
- [`frontend/app/state/AppStateProvider.tsx`](/home/vitus/kielitaika/frontend/app/state/AppStateProvider.tsx)
- [`frontend/app/state/types.ts`](/home/vitus/kielitaika/frontend/app/state/types.ts)
- [`frontend/app/theme/global.css`](/home/vitus/kielitaika/frontend/app/theme/global.css)

## Verification

- `npm run build` passed in `/home/vitus/kielitaika/frontend`.
- The implemented structure now enforces one top-level active screen from `App.tsx`.
- Mobile navigation behavior was implemented in code, but not manually browser-tested in this run.
