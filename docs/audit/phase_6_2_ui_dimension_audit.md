# Phase 6.2 UI Dimension Audit

## Scope

This audit covers the remaining frontend structure and layout problems that were still visible after phase 6.1:

- mobile flow distortion
- background image misuse
- practice card runtime mismatch with the approved design
- inconsistent naming and grouping
- shell and content-area dimension issues

References used:

- old flow model: `/home/vitus/Documents/puhis/frontend`
- card design authority: `/home/vitus/kielitaika/docs/ui_design/new_card_ui/new_design_text.md`
- current frontend shell: `/home/vitus/kielitaika/frontend/app`

## Current Problems Found

### 1. Mobile Flow Failures

Before correction, mobile no longer stacked multiple top-level screens, but it still had dimension issues that made the app feel document-like instead of screen-based:

- the shell frame used the same desktop-centered dimensions on mobile
- the content area did not enforce a tighter safe-area rhythm
- the practice screen still rendered like a long admin panel instead of a bounded runtime

Files responsible:

- [`frontend/app/components/AppShell.tsx`](/home/vitus/kielitaika/frontend/app/components/AppShell.tsx)
- [`frontend/app/theme/global.css`](/home/vitus/kielitaika/frontend/app/theme/global.css)
- [`frontend/app/screens/CardsScreen.tsx`](/home/vitus/kielitaika/frontend/app/screens/CardsScreen.tsx)

### 2. Background Failures

The background system was centralized, but the routing rules were wrong:

- practice used decorative image backgrounds even though practice areas should stay clean
- YKI screens used decorative backgrounds even though exam screens should avoid them
- settings had no dedicated background target
- the frame pseudo-element always added decorative radial overlays, even when a screen should have none

Files responsible:

- [`frontend/app/App.tsx`](/home/vitus/kielitaika/frontend/app/App.tsx)
- [`frontend/app/theme/backgrounds.ts`](/home/vitus/kielitaika/frontend/app/theme/backgrounds.ts)
- [`frontend/app/theme/global.css`](/home/vitus/kielitaika/frontend/app/theme/global.css)

### 3. Card Layout Failures

The previous practice runtime did not match the authoritative card design:

- it used generic `Panel` blocks
- the card was not centered as the primary object
- controls were arranged as backend-debug form controls instead of a card-first learning UI
- skip was not placed in the lower card area
- pagination dots and progress bar were missing from the runtime composition
- state color logic from `card.state` was not surfaced visually
- the user-facing `Phrases` section was mapped to a non-existent `phrase_card` backend type

Files responsible:

- [`frontend/app/screens/CardsScreen.tsx`](/home/vitus/kielitaika/frontend/app/screens/CardsScreen.tsx)
- [`frontend/app/services/cardsService.ts`](/home/vitus/kielitaika/frontend/app/services/cardsService.ts) for the preserved API contract

### 4. Naming Problems

The navigation rename from phase 6.1 was structurally correct, but the runtime mapping still had one contract mismatch:

- `Phrases` did not map to the existing backend `sentence_card` content type

Files responsible:

- [`frontend/app/screens/CardsScreen.tsx`](/home/vitus/kielitaika/frontend/app/screens/CardsScreen.tsx)

### 5. Spacing and Dimension Problems

The main dimension issues found were:

- shell width and height were still desktop-heavy on smaller devices
- screen content did not consistently cap width by screen type
- card runtime proportions were too wide and too panel-like
- mobile practice layout lacked a card-centered focal hierarchy
- decorative frame effects were still applied to non-decorative screens

Files responsible:

- [`frontend/app/theme/global.css`](/home/vitus/kielitaika/frontend/app/theme/global.css)
- [`frontend/app/screens/CardsScreen.tsx`](/home/vitus/kielitaika/frontend/app/screens/CardsScreen.tsx)

## Old App Flow Findings

From `/home/vitus/Documents/puhis/frontend/app/App.js` and `/home/vitus/Documents/puhis/frontend/app/navigation/AppNavigator.tsx`:

- the old app used navigator-driven page isolation
- only one active route rendered at a time
- auth flow, onboarding flow, and main app flow were separated at the top level
- screen transitions were structural, not stylistic

What should be preserved:

- one active page at a time
- centralized shell ownership
- route-level flow separation
- screen-specific background decisions from one background authority

What should not be preserved:

- the old visual style
- legacy naming split across multiple overlapping route trees
- oversized debug or transitional copy

## Old App Dimension Lessons

From the old screens and spacing tokens:

- the spacing system was effectively an 8px-based rhythm
- screen containers were padded early and then allowed to breathe inside a constrained content area
- YKI and practice screens were structurally separate destinations, not sections inside one page
- backgrounds were screen-level wrappers, not random component decorations

## Exact Dimension Issues Identified

### Shell and Content

Previous issue:

- one shell size was reused without enough mobile constraint

Correction targets applied:

- shell width capped at `1360px`
- sidebar width set to `292px`
- general screen stack width capped at `1120px`
- practice screen width capped at `980px`

### Drawer

Previous issue:

- mobile drawer worked, but spacing and shell framing still felt oversized

Correction targets applied:

- drawer width `min(84vw, 320px)`
- mobile shell outer padding reduced to `10px` to `14px`
- mobile content padding tightened to `68px 16px 16px`

### Card Runtime

Previous issue:

- card runtime had no authoritative proportions

Correction targets applied:

- card wrapper width `min(100%, 460px)`
- card inner height `560px` on web
- card inner height `520px` to `500px` on mobile breakpoints
- answer panel max width `320px`
- bottom progress width `min(60vw, 260px)`

## Implemented Fix Summary

Implemented in this phase:

- practice and exam screens now use clean non-decorative backgrounds from the central background resolver
- settings now has its own centralized decorative background target
- practice runtime was rebuilt as a centered card-first layout
- card state color now follows backend `card.state`
- `Phrases` now maps to `sentence_card`
- shell spacing and mobile padding were tightened to make mobile feel like a bounded app window instead of a continuous document

## Files Modified In This Phase

- [`frontend/app/App.tsx`](/home/vitus/kielitaika/frontend/app/App.tsx)
- [`frontend/app/screens/CardsScreen.tsx`](/home/vitus/kielitaika/frontend/app/screens/CardsScreen.tsx)
- [`frontend/app/theme/backgrounds.ts`](/home/vitus/kielitaika/frontend/app/theme/backgrounds.ts)
- [`frontend/app/theme/global.css`](/home/vitus/kielitaika/frontend/app/theme/global.css)

## Verification

- `npm run build` passed in `/home/vitus/kielitaika/frontend`
- no backend logic was changed in this phase
- manual browser/device review was not performed in this run, so mobile interaction and final visual polish still need live confirmation
