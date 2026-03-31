# rn_first_ui_system_foundation_with_post_run_audit

Implemented an RN-first UI foundation centered on `packages/ui/primitives` and moved the active authenticated app shell onto that primitive layer without changing backend/state data flow.

## Primitive layer

- Added `packages/ui/primitives/ScreenContainer.tsx`
- Added `packages/ui/primitives/Stack.tsx`
- Added `packages/ui/primitives/Row.tsx`
- Added `packages/ui/primitives/Card.tsx`
- Added `packages/ui/primitives/Text.tsx`
- Added `packages/ui/primitives/Button.tsx`
- Added `packages/ui/primitives/Input.tsx`
- Added `packages/ui/primitives/index.ts`

## Token layer

- Locked spacing scale to `4, 8, 16, 24, 32, 40, 48`
- Consolidated typography, color, and radius tokens in `packages/ui/theme/tokens.ts`
- Kept compatibility exports in `colors.ts`, `spacing.ts`, and `typography.ts`

## Active screens refactored

- `packages/ui/screens/AuthScreen.tsx`
- `packages/ui/screens/HomeScreen.tsx`
- `packages/ui/screens/LearningScreen.tsx`
- `packages/ui/screens/YkiPracticeScreen.tsx`
- Active shell/loading states in `apps/client/state/AppShell.tsx`, `apps/client/state/LearningRoute.tsx`, and `apps/client/state/YkiPracticeRoute.tsx`

## Audit

### Violations Found

- `apps/client/features/learning/LearningHome.tsx`: legacy raw RN layout + inline `StyleSheet` usage. Severity: MAJOR.
- `apps/client/features/learning/ModuleView.tsx`: legacy raw RN layout + inline `StyleSheet` usage. Severity: MAJOR.
- `apps/client/features/learning/UnitView.tsx`: legacy raw RN layout + inline `StyleSheet` usage. Severity: MAJOR.
- `apps/client/features/practice/PracticeView.tsx`: legacy raw RN layout + inline `StyleSheet` usage. Severity: MAJOR.
- `apps/client/features/yki/YkiFeature.tsx`: legacy raw RN layout + inline `StyleSheet` usage. Severity: MAJOR.
- `apps/client/features/yki-practice/YkiPracticeFeature.tsx`: legacy raw RN layout + inline `StyleSheet` usage. Severity: MAJOR.

### Fixes Applied

- Migrated the active route-shell screens to RN-first primitives under `packages/ui/primitives`
- Replaced active-path compatibility layout usage with `ScreenContainer`, `Card`, `Stack`, `Row`, `Text`, `Button`, and `Input`
- Preserved governed validation flow; UI still consumes only validated service data
- Removed UI exposure of YKI retry actions from `useYkiPractice`

### Remaining Risks

- Legacy feature views still exist outside the active shell path and have not yet been migrated to the new primitive system
- Compatibility wrappers under `packages/ui/components/*` remain for older imports; they now delegate to the primitive system, but they still exist as transitional surface area

### System State

- ⚠️ partially structured
- Active runtime path is structured + contract-safe
- Full repo-wide UI migration is not complete

## Validation

- `./apps/client/node_modules/.bin/tsc --noEmit -p apps/client/tsconfig.json`
- `node apps/client/tests/controlled_ui_contract_validation.test.cjs`
