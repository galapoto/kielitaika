# UI Invariant Enforcement

## Why This Exists

Phase 6.2 exposed that the frontend was only correct by convention.

The app had rules for:

- one active screen at a time
- centralized backgrounds
- non-decorative practice and YKI surfaces
- fixed card layout authority
- stable naming and backend mappings
- mobile shell constraints

But those rules were not enforced structurally.

That made regressions possible through ordinary implementation drift:

- a developer could reintroduce decorative backgrounds to restricted screens
- a screen could start composing card UI with generic containers again
- a content label could drift away from the backend contract
- mobile shell spacing could change without any build failure
- the app could remain “correct” only because someone remembered the rules

## Why Manual Discipline Is Not Enough

UI regressions of this class are not caused by one obvious broken function.

They usually happen when:

- background logic gets copied into a screen
- naming gets updated in one file but not in the contract mapping
- shell spacing changes slightly and no one notices until mobile review
- card runtime structure gets reused through generic layout components

None of those failures are reliably prevented by code review alone.

They need system-level enforcement.

## What Was Added

### 1. Source-of-Truth Invariants

[`frontend/app/system/ui_invariants.ts`](/home/vitus/kielitaika/frontend/app/system/ui_invariants.ts)

This file locks:

- single active screen requirement
- background authority ownership
- decorative restrictions for practice and YKI
- width caps for shell, content, practice, and card runtime
- allowed backend card content types
- user-facing practice label to backend content-type mapping

### 2. Regression Scenarios

[`frontend/app/system/ui_regression_tests.ts`](/home/vitus/kielitaika/frontend/app/system/ui_regression_tests.ts)

This file defines the screen and layout scenarios the detector checks:

- background expectations per screen
- required width-cap rules
- required mobile drawer rules
- required card runtime structure markers

### 3. Static Violation Detector

[`frontend/app/system/ui_violation_detector.ts`](/home/vitus/kielitaika/frontend/app/system/ui_violation_detector.ts)

This detector fails hard when it sees:

- background rules outside the background authority
- missing screen background mappings
- decorative background drift on restricted screens
- card structure drift in `CardsScreen`
- invented backend content types
- missing width-cap or mobile-shell rules
- `clamp()` reintroduced into enforced sizing paths

### 4. Build-Time Enforcement

[`frontend/package.json`](/home/vitus/kielitaika/frontend/package.json)

`npm run build` now runs:

- `prebuild -> ts-node app/system/ui_violation_detector.ts`

If the detector finds a violation, the build stops before Vite runs.

### 5. Local TypeScript Runner

[`frontend/scripts/ts-node`](/home/vitus/kielitaika/frontend/scripts/ts-node)

The repo did not already include `ts-node`. A checked-in local runner was added so the prebuild invariant check can execute in this workspace without relying on external installation state.

## Runtime Locks Added

### Backgrounds

[`frontend/app/theme/backgrounds.ts`](/home/vitus/kielitaika/frontend/app/theme/backgrounds.ts)

- backgrounds are now resolved through `getScreenBackground(screen)`
- missing screen mappings throw
- decorative backgrounds on restricted screens throw

### Cards

[`frontend/app/screens/CardsScreen.tsx`](/home/vitus/kielitaika/frontend/app/screens/CardsScreen.tsx)

- card content-type mapping now comes from `ui_invariants.ts`
- runtime card structure is asserted before render
- unknown backend content types fail closed
- unknown card states fail closed

## What Breaks If This Layer Is Removed

If this enforcement layer is removed, the frontend returns to convention-based correctness.

That means the repo becomes vulnerable again to:

- silent background drift
- silent mobile shell regression
- card layout drift through generic composition
- backend contract mismatch in user-facing labels
- architecture erosion that only appears during late manual review

## Expected Outcome

The goal is not to make UI impossible to change.

The goal is to make architecture-breaking UI changes impossible to introduce silently.

If someone changes a protected rule now, the build should fail immediately instead of allowing the regression to ship.
