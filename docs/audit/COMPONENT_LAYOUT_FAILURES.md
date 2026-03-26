# COMPONENT_LAYOUT_FAILURES

## Home components

### `DashboardScreen`

Source: [`frontend/app/screens/DashboardScreen.tsx`](/home/vitus/kielitaika/frontend/app/screens/DashboardScreen.tsx):13-64

Failures:

- Home still renders a full header, panel, multi-card meta grid, and action zone in one fixed-height shell.
- `.dashboard-hero-block` uses a two-column ratio that can become vertically tall once cards wrap or copy grows.
- The home surface does not define a local overflow strategy, so it relies completely on the now-locked parent chain.

## Settings components

Source: [`frontend/app/screens/SettingsScreen.tsx`](/home/vitus/kielitaika/frontend/app/screens/SettingsScreen.tsx):7-39

Failures:

- Adds both a header and an extra action card plus a main panel.
- The action card is rendered in the bottom action zone even though the screen has no dedicated scroll outlet.

## Debug components

Source: [`frontend/app/screens/DebugScreen.tsx`](/home/vitus/kielitaika/frontend/app/screens/DebugScreen.tsx):34-99

Failures:

- Debug content can become arbitrarily tall because log entries are unbounded.
- The screen has no local scroll container, so it depends on the page scaffold chain.
- `pre.json-preview` has its own local overflow, but the page itself does not.

## Practice components

Source: [`frontend/app/screens/CardsScreen.tsx`](/home/vitus/kielitaika/frontend/app/screens/CardsScreen.tsx):245-395

Failures:

- Intro state uses header + intro card + action zone within a non-scrollable shell.
- Runtime state heavily relies on fixed heights and aspect ratios:
  - `.practice-screen { height: 100%; }`
  - `.practice-runtime-root { height: 100%; }`
  - `.practice-card-wrapper { aspect-ratio: 2 / 3; }`
- This is fine for the card runtime but fragile when combined with global clipping.

## Exam components

Source: [`frontend/app/screens/YkiIntroScreen.tsx`](/home/vitus/kielitaika/frontend/app/screens/YkiIntroScreen.tsx):44-113
and [`frontend/app/screens/YkiExamScreen.tsx`](/home/vitus/kielitaika/frontend/app/screens/YkiExamScreen.tsx):372-558

Failures:

- YKI intro can exceed height because it has header + panel + meta-grid + level-selector + actions.
- YKI runtime contains reading passages, audio, question lists, text area, speaking recorder, and transcript blocks.
- These do exceed viewport height, which is why `.yki-flow-screen { overflow-y: auto; }` is necessary.

## Shared component constraints

### `Panel`

Source: [`frontend/app/theme/global.css`](/home/vitus/kielitaika/frontend/app/theme/global.css):733-753

- `overflow: hidden` clips panel internals by default.
- That is acceptable for decoration bleed, but it can hide content if panel internals later depend on overflow.

### `ScreenScaffold`

Source: [`frontend/app/components/ScreenScaffold.tsx`](/home/vitus/kielitaika/frontend/app/components/ScreenScaffold.tsx):3-9

- No direct layout bug in JSX.
- All failures are inherited from `.screen-shell`, `.screen-content-zone`, and `.screen-action-zone`.

### `LoadingScreen` / `AuthScreen`

Source:
- [`frontend/app/components/LoadingScreen.tsx`](/home/vitus/kielitaika/frontend/app/components/LoadingScreen.tsx):4-12
- [`frontend/app/screens/AuthScreen.tsx`](/home/vitus/kielitaika/frontend/app/screens/AuthScreen.tsx):162-221

- Both still depend on `min-height: 100vh` full-page centered card layouts.
- They are separate from the main shell and therefore bypass the app-shell clipping chain.

## Component Constraint Summary

- The worst offenders are not “bad components” in isolation.
- The failure comes from valid components being placed inside a page container system that no longer permits overflow or reflow.
