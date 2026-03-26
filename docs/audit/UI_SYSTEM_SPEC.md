# UI_SYSTEM_SPEC

This document is the hard UI contract derived from `docs/audit/UI_FORENSIC_ANALYSIS.md`.

Scope:

- structural UI system only
- no old-app code, assets, or styles imported
- no new visual ideas introduced
- login screen unchanged
- welcome screen unchanged
- color palette unchanged
- app functionality unchanged

If a screen violates this document, the screen is invalid.

## 1. DESIGN TOKENS

### 1.1 Spacing Scale

Allowed spacing tokens:

- `space-1 = 4px`
- `space-2 = 8px`
- `space-3 = 12px`
- `space-4 = 16px`
- `space-5 = 24px`
- `space-6 = 32px`

Rules:

- Only these spacing values are valid for layout spacing, padding, gaps, and margins.
- No free-form spacing values are allowed for structural layout.
- `space-1` is utility-only.
- `space-2` and `space-3` are for tight internal grouping.
- `space-4` is the minimum standard layout spacing.
- `space-5` is the default card padding and default web gutter.
- `space-6` is reserved for major section separation and shell framing.

### 1.2 Radius Scale

Allowed radius tokens:

- `radius-sm = 12px`
- `radius-md = 14px`
- `radius-lg = 16px`

Rules:

- No radius outside `12 / 14 / 16` is valid for cards, buttons, pills, or interactive containers.
- `radius-sm` is for compact controls.
- `radius-md` is for buttons and secondary controls.
- `radius-lg` is for all card surfaces.

### 1.3 Elevation System

Allowed elevation tokens:

- `elevation-1`
  - shadow intensity: low
  - blur behavior: soft blur, short spread
  - use: utility pills, compact controls, low-priority secondary surfaces
- `elevation-2`
  - shadow intensity: medium
  - blur behavior: soft blur, medium spread
  - use: standard info cards, prompt cards, answer cards, settings groups
- `elevation-3`
  - shadow intensity: high
  - blur behavior: medium-to-high blur, clear surface separation
  - use: hero cards, centered card-runtime object, modal cards, certificate/result focal cards

Rules:

- Elevation exists only to separate layers.
- Elevation must not be used as decoration.
- One screen may use multiple elevation levels, but only one surface may hold the highest level.

### 1.4 Width Tokens

Allowed width tokens:

- `width-shell-max = 1360px`
- `width-content-max = 1120px`
- `width-task-stage-max = 980px`
- `width-card-max = 460px`
- `width-support-card-max = 560px`
- `width-sidebar = 292px`

Rules:

- Shell width must never exceed `width-shell-max`.
- General content must never exceed `width-content-max`.
- Centered task stages must never exceed `width-task-stage-max`.
- Card-runtime focal cards must never exceed `width-card-max`.

### 1.5 Gutter Tokens

Allowed gutter rules:

- mobile horizontal padding = `space-4`
- tablet/web horizontal padding = `space-5`
- outer shell frame padding = `space-5` or `space-6`

Rules:

- Primary content may not touch viewport edges.
- Any edge-to-edge content requires explicit exception status. Default state is card-contained with gutters.

## 2. CARD SYSTEM

### 2.1 Global Card Contract

Card MUST:

- contain all primary task content
- use `radius-lg`
- use a defined padding token
- sit inside a screen with outer gutter
- belong to one of the approved card types

Card MUST NOT:

- exist without internal padding
- mix arbitrary padding sizes inside the same card family
- stretch edge-to-edge without outer page margin
- serve as both the primary card and a background layer

### 2.2 Card Types

#### `primary-card`

Required tokens:

- radius: `radius-lg`
- padding: `space-5`
- elevation: `elevation-2` or `elevation-3`

Allowed content:

- primary task content
- primary route decision
- main summary content
- main prompt or answer surface

Forbidden content:

- low-priority utility-only content
- raw debug payloads

#### `secondary-card`

Required tokens:

- radius: `radius-lg`
- padding: `space-4` or `space-5`
- elevation: `elevation-2`

Allowed content:

- supplementary info
- progress summaries
- settings groups
- contextual instructions

Forbidden content:

- the only primary CTA zone on a task screen unless explicitly designated as the dominant card

#### `interactive-card`

Required tokens:

- radius: `radius-lg`
- padding: `space-4` or `space-5`
- elevation: `elevation-2`

Allowed content:

- level selection
- module launchers
- route launchers
- answer options when implemented as card rows

Forbidden content:

- mixed utility and task content with no selection state

#### `modal-card`

Required tokens:

- radius: `radius-lg`
- padding: `space-5`
- elevation: `elevation-3`

Allowed content:

- blocking warnings
- confirmations
- final-state interruptions
- locked-feature messages

Forbidden content:

- persistent dashboard content

### 2.3 Card Padding Rules

- `primary-card` default padding = `space-5`
- `secondary-card` default padding = `space-4`
- `interactive-card` default padding = `space-4`
- `modal-card` default padding = `space-5`

Rules:

- Padding may increase by exactly one token only when content density requires it.
- Padding may not vary arbitrarily inside one card family.

## 3. LAYOUT RULES

### 3.1 Mandatory Screen Structure

Every screen MUST follow this structure:

1. Header zone
2. Content zone
3. Action zone

Header zone:

- optional for simple centered card mode
- mandatory for dashboard, exam, review, and deep-route screens

Content zone:

- MUST be card-contained
- MUST expose one dominant surface

Action zone:

- MUST contain the primary CTA for the screen
- MUST be visually anchored to the lower edge of the active workspace

### 3.2 Prohibited Layouts

The following layouts are invalid:

- raw primary content text placed directly on the background
- mixed section-feed layout and centered-card layout inside the same primary workspace
- multiple competing primary zones
- full-width primary task content with no card containment
- dashboards that double as debug consoles

### 3.3 Content Width Rules

General rules:

- shell width <= `width-shell-max`
- content width <= `width-content-max`
- task stage width <= `width-task-stage-max`
- centered card width <= `width-card-max`

Mobile rules:

- primary task cards use full available width minus mobile gutter
- centered card screens keep the active card centered

Desktop rules:

- content may widen only to separate roles
- desktop widening may create split panels
- desktop widening may not create unbounded horizontal spread

### 3.4 Primary Zone Rule

- Every screen may have exactly one primary focal zone.
- Secondary zones may support the primary zone.
- Secondary zones must not compete with the primary zone through size, elevation, or CTA emphasis.

## 4. CTA SYSTEM

### 4.1 Primary CTA Position

Primary CTA positions are fixed:

- mobile: bottom-center
- desktop: bottom-right

Exceptions:

- centered card-runtime screens may use bottom-center on all breakpoints
- exceptions must be applied consistently across the full screen family

### 4.2 Primary CTA Contract

Primary CTA MUST:

- be the most visually dominant action on the screen
- sit inside the action zone
- stay in a stable location across similar screens
- use the same button family as other primary CTAs

Primary CTA MUST NOT:

- appear mid-screen as the main action
- compete with a secondary CTA placed at equal weight
- move between unrelated positions inside one screen family

### 4.3 Secondary CTA Contract

Secondary CTA MUST:

- remain visually subordinate
- stay grouped near the primary CTA
- avoid stealing placement priority

Secondary CTA MUST NOT:

- occupy the primary CTA position
- use stronger emphasis than the primary CTA

## 5. NAVIGATION RULES

### 5.1 Top Bar Structure

Deep-route and task screens MUST use a top bar containing:

- left control: back or menu
- title or route identity
- right utility: home, progress, timer, or context action

Rules:

- top bar content must remain horizontally aligned
- top bar must remain visually separate from the content card zone

### 5.2 Drawer Behavior

Drawer MUST:

- be the global route container on mobile when shell navigation is hidden
- slide over content with overlay
- contain identity block, route list, and bottom utilities

Drawer MUST NOT:

- become the content container for active task content
- replace the page header inside deep-route screens

### 5.3 Bottom Navigation Rules

If bottom navigation is used:

- it is fixed
- it is route-based
- it is not used for intra-screen task switching

Bottom navigation MUST NOT:

- duplicate the same decisions already exposed in the active content card

### 5.4 Fixed vs Scrollable

Fixed or anchored:

- global shell
- drawer/sidebar
- top bar
- progress/timer strip
- action zone

Scrollable:

- long text
- review content
- settings lists
- prompt details

Rule:

- fixed structure must not scroll away before the active task context is understood

## 6. INTERACTION RULES

### 6.1 Quiz

Selection behavior:

- one answer group is active at a time
- selected state must be visible immediately
- answer options may be rows or cards, but must stay within one answer container

State change rules:

- selection updates state locally
- progress updates only after a committed answer or controlled advance
- completion transitions into review or results, not another dashboard surface

### 6.2 Cards

Focus behavior:

- the card object is the single focal element
- only utility controls directly related to the card may share the top region
- surrounding support UI must remain secondary

Allowed controls:

- audio
- recall / flip
- skip
- next / submit
- progress dots / progress bar

Cards MUST NOT:

- include unrelated settings or debug controls in the card stage
- share primary attention with a second large panel

### 6.3 Dashboard

Routing priority rules:

- dashboard exists to route the user toward the next relevant action
- one dominant route card or hero card must appear first
- secondary cards may summarize progress or support routes

Dashboard MUST NOT:

- expose unrelated system controls as co-equal primary content
- distribute equal emphasis across many competing launch surfaces

## 7. VISUAL HIERARCHY RULES

### 7.1 Focal Element Limit

- Maximum number of primary focal elements per screen = `1`

If more than one element reads as primary, the screen is invalid.

### 7.2 Secondary Element Behavior

Secondary elements MUST:

- support the primary zone
- use equal or lower elevation than the primary zone
- avoid larger area than the primary zone

### 7.3 Depth Creation Rules

Depth may be created only by:

- background vs surface contrast
- elevation token
- containment boundaries
- stable action anchoring

Depth MUST NOT be created by:

- random border thickness changes
- unrelated motion
- arbitrary gradient stacking
- free-form opacity experimentation

## 8. HARD DO / DO NOT

### DO

- use card containers for all primary task content
- use only defined spacing tokens
- use only defined radius tokens
- keep one dominant focal zone
- anchor the primary CTA at the bottom of the active workspace
- preserve shell/content/action separation
- keep navigation fixed and task content scrollable where needed

### DO NOT

- place primary content directly on the background
- mix layout paradigms inside one screen
- introduce new spacing values
- introduce new radius values
- let multiple cards compete as primary focal zones
- move primary CTA position across similar screens
- widen task content beyond its defined max width
- expose debug or raw data surfaces as part of user-facing layout

## UI VALIDATION CHECKLIST

Use this checklist to validate any screen.

### Spacing

- Does every structural gap use one of `4 / 8 / 12 / 16 / 24 / 32`?
- Does every card use a valid padding token?
- Does the screen keep the required outer gutter?

### Radius

- Do all cards, controls, and buttons use only `12 / 14 / 16`?

### Elevation

- Is every elevated surface mapped to `elevation-1`, `elevation-2`, or `elevation-3`?
- Is the highest elevation used by only one dominant surface?

### Layout

- Does the screen follow `header -> content zone -> action zone`?
- Is all primary content card-contained?
- Is there only one primary focal zone?
- Is the primary CTA anchored at the correct lower position?

### Width

- Is shell width <= `1360`?
- Is content width <= `1120`?
- Is task stage width <= `980`?
- Is centered card width <= `460`?

### Navigation

- Is global navigation separated from screen content?
- Is fixed chrome stable while content scrolls?

### Interaction

- Does quiz selection remain inside one answer container?
- Does card mode keep the card as the only focal object?
- Does dashboard prioritize routing over information sprawl?

### Invalid Screen Triggers

If any answer below is `yes`, the screen is invalid:

- Is primary task text placed directly on the background?
- Are there two competing primary zones?
- Is the primary CTA mid-screen?
- Are new spacing values introduced?
- Are new radius values introduced?
- Is debug payload shown as normal user content?
