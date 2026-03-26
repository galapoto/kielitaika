# LAYOUT_REWRITE_LOG

Phase:

- `phase_7_3A_structural_rewrite`

Scope:

- structural rewrite only
- no routing changes
- no logic changes
- no functionality changes
- no auth/login redesign

## Shared Structural Change

Applied shared structural wrapper:

- [`ScreenScaffold.tsx`](/home/vitus/kielitaika/frontend/app/components/ScreenScaffold.tsx)

Applied shared layout-zone rules:

- [`global.css`](/home/vitus/kielitaika/frontend/app/theme/global.css)

System rules enforced:

- every active screen uses a clear header zone
- every active screen has a content zone
- every active screen has an explicit lower action zone
- primary content is wrapped inside one dominant card surface
- unrelated card stacking was reduced or demoted to secondary surfaces

## Screens Changed

### Home / Dashboard

File:

- [`DashboardScreen.tsx`](/home/vitus/kielitaika/frontend/app/screens/DashboardScreen.tsx)

Structural violations before:

- header and content were fused into one large surface
- feature-launch actions lived inside the dominant content card
- multiple action cards competed with the main dashboard surface

Rules applied:

- extracted a dedicated header zone
- kept one dominant `dashboard-surface` as the primary content card
- moved route-launch cards into the action zone

Validation:

- [x] Has header/content/action zones
- [x] Only one primary focal surface
- [x] No raw content outside cards
- [x] CTA correctly placed

### Practice / Cards

File:

- [`CardsScreen.tsx`](/home/vitus/kielitaika/frontend/app/screens/CardsScreen.tsx)

Structural violations before:

- intro CTA lived inside the content card
- runtime submit/skip actions were embedded inside the card body
- runtime had no explicit action zone outside the active card

Rules applied:

- added scaffolded header/content/action structure
- kept intro and runtime as mutually exclusive branches
- moved session start into the action zone
- moved runtime submit/skip into the action zone
- kept one dominant card stage as the primary runtime surface

Validation:

- [x] Has header/content/action zones
- [x] Only one primary focal surface
- [x] No raw content outside cards
- [x] CTA correctly placed

### Conversation

File:

- [`RoleplayScreen.tsx`](/home/vitus/kielitaika/frontend/app/screens/RoleplayScreen.tsx)

Structural violations before:

- configuration card and session card competed for primacy
- transcript/review controls lived inside the setup card
- no explicit lower action zone existed

Rules applied:

- added scaffolded header/content/action structure
- setup state now uses one primary content card
- active session now uses one primary transcript/input card
- transcript/review fetch controls moved into the action zone
- transcript/review payloads are wrapped in secondary cards

Validation:

- [x] Has header/content/action zones
- [x] Only one primary focal surface
- [x] No raw content outside cards
- [x] CTA correctly placed

### Professional Finnish / Voice Studio

Files:

- [`ProfessionalFinnishScreen.tsx`](/home/vitus/kielitaika/frontend/app/screens/ProfessionalFinnishScreen.tsx)
- [`VoiceStudioScreen.tsx`](/home/vitus/kielitaika/frontend/app/screens/VoiceStudioScreen.tsx)

Structural violations before:

- recorder controls, analysis actions, and request actions were spread across multiple cards
- no explicit single action zone existed
- multiple mid-card CTAs competed across recorder, pronunciation, and TTS sections

Rules applied:

- added scaffolded header/content/action structure
- kept recorder card as the dominant primary surface
- moved upload / analyze / TTS / reset into the action zone
- kept transcript, pronunciation, and TTS payloads inside secondary cards

Validation:

- [x] Has header/content/action zones
- [x] Only one primary focal surface
- [x] No raw content outside cards
- [x] CTA correctly placed

### YKI Intro

File:

- [`YkiIntroScreen.tsx`](/home/vitus/kielitaika/frontend/app/screens/YkiIntroScreen.tsx)

Structural violations before:

- header content and action controls were all inside one panel
- no separate action zone existed

Rules applied:

- added scaffolded header zone
- kept level selection and exam metadata inside one primary content card
- moved start/resume actions into the action zone

Validation:

- [x] Has header/content/action zones
- [x] Only one primary focal surface
- [x] No raw content outside cards
- [x] CTA correctly placed

### YKI Runtime

File:

- [`YkiExamScreen.tsx`](/home/vitus/kielitaika/frontend/app/screens/YkiExamScreen.tsx)

Structural violations before:

- runtime header lived inside the main content card
- writing and speaking submit actions were embedded mid-content
- end-of-exam actions competed with screen-level task actions

Rules applied:

- added scaffolded header/content/action structure
- moved runtime title/session context into the header zone
- preserved one dominant runtime content card
- moved writing submit and speaking submit into the action zone
- kept exam submission controls inside the same anchored action zone

Validation:

- [x] Has header/content/action zones
- [x] Only one primary focal surface
- [x] No raw content outside cards
- [x] CTA correctly placed

### YKI Result

File:

- [`YkiResultScreen.tsx`](/home/vitus/kielitaika/frontend/app/screens/YkiResultScreen.tsx)

Structural violations before:

- summary and actions were fused into one content panel
- no dedicated action zone existed

Rules applied:

- added scaffolded header zone
- kept summary metadata inside one primary content card
- moved back/load-certificate actions into the action zone

Validation:

- [x] Has header/content/action zones
- [x] Only one primary focal surface
- [x] No raw content outside cards
- [x] CTA correctly placed

### Settings

File:

- [`SettingsScreen.tsx`](/home/vitus/kielitaika/frontend/app/screens/SettingsScreen.tsx)

Structural violations before:

- settings consisted of one card with no explicit header zone
- no explicit lower structural zone existed

Rules applied:

- added scaffolded header zone
- kept account metadata inside one primary content card
- added a contained lower zone for navigation guidance so the screen follows the same structural contract

Validation:

- [x] Has header/content/action zones
- [x] Only one primary focal surface
- [x] No raw content outside cards
- [x] CTA correctly placed

## Screens Intentionally Not Rewritten

### Auth

File:

- [`AuthScreen.tsx`](/home/vitus/kielitaika/frontend/app/screens/AuthScreen.tsx)

Reason:

- protected by prior phase constraints preserving the login/welcome concept
- no routing or auth behavior changes were allowed in this phase

### Boot / Loading

File:

- [`App.tsx`](/home/vitus/kielitaika/frontend/app/App.tsx)

Reason:

- boot/loading state remains a transitional runtime surface rather than a standard product screen family

## Files Modified

- [`ScreenScaffold.tsx`](/home/vitus/kielitaika/frontend/app/components/ScreenScaffold.tsx)
- [`DashboardScreen.tsx`](/home/vitus/kielitaika/frontend/app/screens/DashboardScreen.tsx)
- [`CardsScreen.tsx`](/home/vitus/kielitaika/frontend/app/screens/CardsScreen.tsx)
- [`RoleplayScreen.tsx`](/home/vitus/kielitaika/frontend/app/screens/RoleplayScreen.tsx)
- [`VoiceStudioScreen.tsx`](/home/vitus/kielitaika/frontend/app/screens/VoiceStudioScreen.tsx)
- [`YkiIntroScreen.tsx`](/home/vitus/kielitaika/frontend/app/screens/YkiIntroScreen.tsx)
- [`YkiExamScreen.tsx`](/home/vitus/kielitaika/frontend/app/screens/YkiExamScreen.tsx)
- [`YkiResultScreen.tsx`](/home/vitus/kielitaika/frontend/app/screens/YkiResultScreen.tsx)
- [`SettingsScreen.tsx`](/home/vitus/kielitaika/frontend/app/screens/SettingsScreen.tsx)
- [`global.css`](/home/vitus/kielitaika/frontend/app/theme/global.css)

## Verification

Passed:

- `PATH=./scripts:$PATH ts-node app/system/ui_violation_detector.ts`
- `npm run build`
