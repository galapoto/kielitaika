# DUPLICATE_AUDIT_REPORT

Phase:

- `phase_7_4_deep_duplicate_detection_removal`

Scope scanned:

- `frontend/app/screens/`
- `frontend/app/components/`
- `frontend/app/theme/`
- `frontend/app/hooks/`

Method:

- codebase-wide duplicate scan using `rg`
- classification against Phase 7.2 and 7.3 structural rules
- cleanup limited to convergence toward one authority per concept

## 1. Duplicate Inventory

### 1.1 Wrapper screen duplication

Location:

- `frontend/app/screens/PracticeScreen.tsx` (entire file, removed)
- `frontend/app/screens/ConversationScreen.tsx` (entire file, removed)
- `frontend/app/screens/ProfessionalFinnishScreen.tsx` (entire file, removed)
- [`App.tsx`](/home/vitus/kielitaika/frontend/app/App.tsx)

Type:

- `D. Component duplication`

Severity:

- `high`

Problem:

- These files represented the same screen concepts as `CardsScreen`, `RoleplayScreen`, and `VoiceStudioScreen`, but added only one-line forwarding wrappers.
- This created duplicate concept ownership for practice, conversation, and professional screen entry.

Source of truth:

- [`CardsScreen.tsx`](/home/vitus/kielitaika/frontend/app/screens/CardsScreen.tsx)
- [`RoleplayScreen.tsx`](/home/vitus/kielitaika/frontend/app/screens/RoleplayScreen.tsx)
- [`VoiceStudioScreen.tsx`](/home/vitus/kielitaika/frontend/app/screens/VoiceStudioScreen.tsx)
- [`App.tsx`](/home/vitus/kielitaika/frontend/app/App.tsx) as the single screen outlet authority

Action:

- `remove`

Result:

- App now renders the real screen implementations directly.
- Redundant wrapper files were deleted.

### 1.2 Screen state access duplication

Location:

- `frontend/app/hooks/useAppScreen.ts` (entire file, removed)

Type:

- `E. Logic duplication`

Severity:

- `medium`

Problem:

- `useAppScreen` duplicated direct access already available from `useAppState`.
- It introduced a second access path for the same screen state without adding new behavior.

Source of truth:

- `useAppState` from app state provider

Action:

- `remove`

Result:

- The unused duplicate hook was deleted.

### 1.3 Nested panel duplication in raw JSON surfaces

Location:

- [`JsonPreview.tsx`](/home/vitus/kielitaika/frontend/app/components/JsonPreview.tsx): line 3 before cleanup
- usage sites:
  - [`RoleplayScreen.tsx`](/home/vitus/kielitaika/frontend/app/screens/RoleplayScreen.tsx)
  - [`VoiceStudioScreen.tsx`](/home/vitus/kielitaika/frontend/app/screens/VoiceStudioScreen.tsx)

Type:

- `A. Structural duplication`
- `D. Component duplication`

Severity:

- `high`

Problem:

- `JsonPreview` rendered its own `.panel` wrapper.
- The component was already being placed inside `Panel` surfaces in user screens.
- This created duplicate card shells and nested panel structure for the same content zone.

Source of truth:

- outer `Panel` on the host screen
- `JsonPreview` should provide payload content only

Action:

- `refactor`

Result:

- `JsonPreview` no longer creates a second panel shell.
- It now renders only the payload block and header content.

### 1.4 Inline formatting duplication for error payload display

Location:

- [`GlobalErrorBoundary.tsx`](/home/vitus/kielitaika/frontend/app/components/GlobalErrorBoundary.tsx): line 71 before cleanup

Type:

- `C. Style duplication`

Severity:

- `medium`

Problem:

- Inline `whiteSpace: "pre-wrap"` duplicated formatting concerns that belong in `global.css`.

Source of truth:

- [`global.css`](/home/vitus/kielitaika/frontend/app/theme/global.css)

Action:

- `refactor`

Result:

- Inline formatting was replaced with a dedicated CSS class.

### 1.5 Duplicate concept markers in screen regression contract

Location:

- [`ui_regression_tests.ts`](/home/vitus/kielitaika/frontend/app/system/ui_regression_tests.ts): `REQUIRED_APP_SCREEN_MARKERS`

Type:

- `D. Component duplication`

Severity:

- `high`

Problem:

- Regression markers still enforced deleted wrapper screens as the expected route-entry structure.
- The contract no longer matched the true screen authority after cleanup.

Source of truth:

- [`App.tsx`](/home/vitus/kielitaika/frontend/app/App.tsx) direct screen rendering

Action:

- `refactor`

Result:

- Regression markers now validate the direct authorities:
  - `CardsScreen`
  - `RoleplayScreen`
  - `VoiceStudioScreen`

## 2. Duplicate Groups Classified by System Rule

### 2.1 Structural duplication

Detected:

- nested panel structure inside `JsonPreview`

Severity:

- `high`

Cleanup:

- removed duplicated panel shell from `JsonPreview`

Final state:

- no remaining nested panel duplication was found in active screens

### 2.2 Action duplication

Detected:

- no critical remaining duplicated CTA functions across action zone and content zone

Notes:

- buttons remaining inside cards are interactive controls or option selectors, not duplicated primary CTAs
- the practice progress bar fill width remains inline because it is state-driven value rendering, not layout duplication

Severity:

- `none critical`

Cleanup:

- no additional action removals required in this pass

### 2.3 Style duplication

Detected:

- inline pre-wrap formatting in `GlobalErrorBoundary`

Severity:

- `medium`

Cleanup:

- moved formatting into `global.css`

Final state:

- scanned scope no longer contains inline `style={...}` layout formatting except the dynamic progress fill width in `CardsScreen`, which is runtime data output rather than duplicated layout styling

### 2.4 Component duplication

Detected:

- wrapper screen files for practice, conversation, professional
- nested panel behavior in `JsonPreview`

Severity:

- `high`

Cleanup:

- wrapper files deleted
- `JsonPreview` converged to content-only responsibility

### 2.5 Logic duplication

Detected:

- unused `useAppScreen` hook duplicating direct app-state access

Severity:

- `medium`

Cleanup:

- hook deleted

## 3. Cleanup Actions Applied

### Removed

- `frontend/app/screens/PracticeScreen.tsx`
- `frontend/app/screens/ConversationScreen.tsx`
- `frontend/app/screens/ProfessionalFinnishScreen.tsx`
- `frontend/app/hooks/useAppScreen.ts`

### Refactored

- [`App.tsx`](/home/vitus/kielitaika/frontend/app/App.tsx)
  - direct screen authorities now used for practice, conversation, and professional
- [`JsonPreview.tsx`](/home/vitus/kielitaika/frontend/app/components/JsonPreview.tsx)
  - removed duplicate panel shell
- [`GlobalErrorBoundary.tsx`](/home/vitus/kielitaika/frontend/app/components/GlobalErrorBoundary.tsx)
  - removed inline formatting duplication
- [`global.css`](/home/vitus/kielitaika/frontend/app/theme/global.css)
  - added `json-preview-wrap` and `json-preview-block`
- [`ui_regression_tests.ts`](/home/vitus/kielitaika/frontend/app/system/ui_regression_tests.ts)
  - updated screen markers to the actual direct authorities

### Merged

- practice screen concept -> `CardsScreen`
- conversation screen concept -> `RoleplayScreen`
- professional screen concept -> `VoiceStudioScreen`

## 4. Final Source-of-Truth Map

Practice screen authority:

- [`CardsScreen.tsx`](/home/vitus/kielitaika/frontend/app/screens/CardsScreen.tsx)

Conversation screen authority:

- [`RoleplayScreen.tsx`](/home/vitus/kielitaika/frontend/app/screens/RoleplayScreen.tsx)

Professional speaking screen authority:

- [`VoiceStudioScreen.tsx`](/home/vitus/kielitaika/frontend/app/screens/VoiceStudioScreen.tsx)

Layout authority:

- [`ScreenScaffold.tsx`](/home/vitus/kielitaika/frontend/app/components/ScreenScaffold.tsx)
- [`global.css`](/home/vitus/kielitaika/frontend/app/theme/global.css)

Panel/card container authority:

- [`Panel.tsx`](/home/vitus/kielitaika/frontend/app/components/Panel.tsx)

Raw payload display authority:

- [`JsonPreview.tsx`](/home/vitus/kielitaika/frontend/app/components/JsonPreview.tsx)

App screen outlet authority:

- [`App.tsx`](/home/vitus/kielitaika/frontend/app/App.tsx)

## 5. Final Verification

Passed:

- `PATH=./scripts:$PATH ts-node app/system/ui_violation_detector.ts`
- `npm run build`

Phase 7.2 + 7.3 rule confirmation:

- `ScreenScaffold` remains the active screen layout authority for rewritten application screens
- duplicate wrapper screens were removed
- no nested duplicate card shells remain in `JsonPreview`
- no remaining wrapper hook duplicates app screen state
- no critical duplicate CTA structures were found in the scanned frontend scope

## 6. Remaining Intentional Non-Duplicates

These were retained intentionally and are not duplicates:

- Auth screen panel structure
  - preserved by explicit product constraint
- Buttons inside card surfaces for option selection, recall, audio, or recording
  - interactive controls, not duplicate primary CTAs
- Runtime-dependent inline width on practice progress fill
  - state output, not duplicated layout authority
