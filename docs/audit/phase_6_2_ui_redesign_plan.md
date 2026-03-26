# Phase 6.2 UI Redesign Plan

## Goal

Bring the frontend into a stable page-based application shape with:

- one active screen at a time
- one responsive shell across desktop and mobile
- centralized background rules
- corrected navigation naming
- card runtime rebuilt to match the approved design language

## Responsive Shell Plan

### Desktop

- keep one shared `AppShell`
- use a fixed-width sidebar and one scrollable content area
- constrain shell width to `1360px`
- keep content framed inside a contained app window rather than full-bleed page sections

### Mobile

- use the same `AppShell`
- convert sidebar into a slide drawer
- keep drawer closed by default
- use a top-left menu button and overlay close action
- tighten outer shell padding to avoid wasted frame space

## Sidebar and Drawer Plan

Navigation tree:

- Home
- Practice
  - Vocabulary
  - Grammar
  - Phrases
- Conversation
- YKI Exam
- Professional Finnish
- Settings

Sidebar requirements:

- preserve profile placeholder
- preserve username
- preserve subscription badge
- preserve settings access
- preserve sign-out action

## Page Isolation Plan

Top-level rendering remains owned by [`frontend/app/App.tsx`](/home/vitus/kielitaika/frontend/app/App.tsx).

Rules:

- one `screen` value
- one active top-level screen component
- no stacked feature pages
- no background assignment inside arbitrary child components

Applied mapping:

- `home` -> dashboard screen
- `practice` -> dedicated practice runtime surface
- `conversation` -> conversation screen
- `professional` -> professional Finnish screen
- `settings` -> settings screen
- `yki_intro` / `yki_runtime` / `yki_result` -> YKI flow screens

## Background System Plan

Central authority:

- [`frontend/app/theme/backgrounds.ts`](/home/vitus/kielitaika/frontend/app/theme/backgrounds.ts)

Rules:

- auth uses decorative login image
- home uses decorative home image
- conversation uses decorative conversation image
- professional Finnish uses decorative workplace image
- settings uses decorative misc image
- practice uses plain gradient only
- YKI intro/runtime/result use plain gradient only
- decorative radial overlays are disabled for plain screens

## Card Redesign Implementation Plan

Authority:

- `/home/vitus/kielitaika/docs/ui_design/new_card_ui/new_design_text.md`

Structure to enforce:

- top recall pill row
- centered layered card
- audio icon top-left
- state/refresh icon top-right
- dominant centered word
- answer reveal state inside the same card
- divider above skip button
- skip button anchored to lower card area
- dots and progress bar below the card

Runtime behavior:

- use backend `card.state` for blue / red / green state logic
- use backend `served_follow_up` options when present
- keep text input fallback when options are absent
- keep skip wired to the existing next-card API
- keep answer submission wired to the existing answer API
- use browser speech synthesis as a safe frontend pronunciation fallback when no audio asset exists

## Spacing and Sizing Plan

Global rhythm:

- base spacing on `8 / 16 / 24 / 32`

Shell:

- outer shell padding: `clamp(14px, 2vw, 24px)`
- mobile shell padding: `10px`
- sidebar width: `292px`
- general content width cap: `1120px`

Practice runtime:

- practice screen max width: `980px`
- card width: `460px`
- card height: `560px`
- mobile card height: `520px` then `500px`
- answer panel max width: `320px`

Safe-area rules:

- mobile title/menu live above content padding
- content starts below the mobile navigation controls
- drawer width capped at `320px`

## Old App Lessons Applied

Kept from old app:

- centralized screen ownership
- one-screen-at-a-time flow
- screen-level background decisions
- constrained content rather than free-form scroll stacking

Not carried over from old app:

- legacy visual design
- older route naming split
- legacy onboarding/auth copy patterns

## File-By-File Implementation Roadmap

### Shell and Background

- [`frontend/app/App.tsx`](/home/vitus/kielitaika/frontend/app/App.tsx)
  - keep top-level screen switch authoritative
  - map each screen to the correct background class
- [`frontend/app/theme/backgrounds.ts`](/home/vitus/kielitaika/frontend/app/theme/backgrounds.ts)
  - keep all decorative and plain-background rules centralized
- [`frontend/app/theme/global.css`](/home/vitus/kielitaika/frontend/app/theme/global.css)
  - enforce shell dimensions, mobile safe-area padding, drawer dimensions, and non-decorative frame states

### Practice Runtime

- [`frontend/app/screens/CardsScreen.tsx`](/home/vitus/kielitaika/frontend/app/screens/CardsScreen.tsx)
  - keep current cards API
  - remap `Phrases` to `sentence_card`
  - render the new centered card runtime
  - apply state-aware color logic
  - preserve skip, answer submit, and progress updates

## Verification Plan

- run `npm run build`
- manually check desktop shell
- manually check mobile drawer open/close
- manually verify practice has no decorative background image
- manually verify YKI screens have no decorative background image
- manually verify settings shows decorative background
- manually verify skip, reveal, and submit behavior in the practice runtime

## Completion State

This plan was applied in code for the shell/background/card changes above. Remaining work is live browser verification and any small spacing refinements discovered during that pass.
