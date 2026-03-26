# UI_FORENSIC_ANALYSIS

This document extracts the structural UI system of the original app at `/home/vitus/Documents/puhis/`.

Scope:

- black-box structural and behavioral analysis only
- no copied code, CSS, assets, or component implementations
- system rules stated as rebuildable constraints

Evidence basis:

- route graph and navigator structure
- screen inventory
- shared token files
- reusable shell/card/progress primitives
- archived old-UI screenshots inside the old repo

Confidence labels used below:

- `Confirmed`: directly supported by source structure and repeated screen evidence
- `Probable`: supported by repeated visual evidence but not fully runtime-verified in this pass

## 1. SCREEN TAXONOMY

### 1.1 Auth Screens

Screens:

- `Welcome`
- `Login`
- `Register`
- `IntentQuiz`
- `PlanSelection`
- `ProfessionSelection`
- `PracticeFrequency`

Purpose:

- enter the system
- classify the user into a learning path
- collect enough intent data to route into the correct main product mode

Layout pattern:

- single-screen onboarding sequence
- one dominant card or hero surface at a time
- minimal competing content
- primary action leads forward, not sideways

Dominant components:

- welcome/auth card
- step selection cards
- primary CTA
- secondary auth switch actions

System rule:

- auth is a guided stack, not an open dashboard

### 1.2 Dashboard Screens

Screens:

- `Home`
- `Workplace`
- `YKIScreen`

Purpose:

- orient the user inside one product mode
- expose the next relevant route, not every possible subsystem

Layout pattern:

- background surface with one or two dominant information cards
- top region with identity or route context
- limited shortcut count
- progress visible early

Dominant components:

- instruction or hero card
- progress card or progress ring
- route launcher cards
- home/profile affordances

System rule:

- dashboard screens are route directors, not full data consoles

### 1.3 Learning Screens

Screens:

- `Conversation`
- `Fluency`
- `GuidedTurn`
- `Shadowing`
- `MicroOutput`
- `Vocabulary`
- `Quiz`
- `LessonDetail`
- `Notes`
- `Practice`
- `Roleplay`

Purpose:

- run one learning interaction mode at a time
- keep the user focused on one content object, one transcript, or one response loop

Layout pattern:

- one dominant interaction card or transcript zone
- support controls grouped close to the active learning object
- action completion always visually anchored near the active task

Dominant components:

- transcript surface
- module card
- option cards
- mic or audio control
- launcher cards for practice modes

System rule:

- learning screens are interaction-first; settings/configuration remain secondary

### 1.4 Exam Screens

Screens:

- `YKIInfo`
- `ExamIntroScreen`
- `ExamRuntimeScreen`
- `ExamRunnerScreen`
- `ReadingSection`
- `ListeningSection`
- `WritingSection`
- `SpeakingSection`
- `SubmitExamScreen`
- `SubmissionProcessingScreen`

Purpose:

- stage the assessment
- keep the user inside a controlled, linear task flow

Layout pattern:

- fixed or strongly anchored header
- visible progress/timer strip
- one prompt zone
- one answer zone
- one primary next-step action

Dominant components:

- app header
- progress bar
- content card
- prompt card
- answer selector/editor/recording surface
- submit/next CTA

System rule:

- exam screens are not mixed-mode dashboards; they are bounded workspaces

### 1.5 Results Screens

Screens:

- `YKIExamEnd`
- `ResultsOverviewScreen`
- `CEFRLevelScreen`
- `CertificateScreen`
- `ExamHistoryScreen`
- `ExportResultsScreen`

Purpose:

- summarize completed effort
- convert raw performance into a calm reviewable outcome

Layout pattern:

- summary-first layout
- high-contrast score card near the top
- section breakdown under summary
- one next-step CTA per result state

Dominant components:

- score card
- section breakdown card
- certificate card
- results CTA

System rule:

- results screens resolve the flow; they do not restart complexity

### 1.6 Review Screens

Screens:

- `ReviewAnswersScreen`
- `DetailedFeedbackScreen`

Purpose:

- let the user inspect what happened after completion

Layout pattern:

- ordered list or section-based review
- persistent scoring/progress context
- corrective details kept inside cards, not loose page text

Dominant components:

- breakdown card
- answer review rows
- feedback detail cards

System rule:

- review is structured inspection, not freeform reporting

### 1.7 Card Screens

Screens:

- `Practice`
- vocabulary/sentence/grammar card runtime entry points

Purpose:

- present one study item at a time
- keep the card itself as the focal object

Layout pattern:

- centered portrait card
- compact utility controls at the top edge
- progress dots/bar below
- single bottom action anchor

Dominant components:

- primary card
- audio icon
- recall/flip control
- skip CTA
- progress dots

System rule:

- card mode is a centered-object layout, not a section feed

## 2. LAYOUT GRAMMAR

### 2.1 Base layout model

`Confirmed`

- The system is primarily card-based.
- Full screens are built from a background layer plus one or more card surfaces.
- Raw task text is usually contained within cards.
- Free-floating text outside cards is mostly limited to headers, labels, progress strips, or small metadata.

### 2.2 Outer margin system

`Confirmed`

- Shared token files define an 8px base.
- Repeated outer page padding resolves to approximately `24`.
- Mobile screens typically begin inside a padded safe region, then place cards within that field.

Blueprint rule:

- Outer page gutters are medium, never edge-to-edge for primary content.

### 2.3 Internal spacing rhythm

`Confirmed`

- Repeated spacing values form an 8-based rhythm.
- Card padding is consistently medium-large.
- Titles, helper text, and controls use predictable vertical grouping rather than ad hoc gaps.

Blueprint rule:

- internal spacing rhythm uses `8 / 16 / 24 / 32`

### 2.4 Content containment

`Confirmed`

- Primary content is almost always contained within centered or padded cards.
- Even on web exam layouts, the content is broken into bounded left and right panels rather than left as raw full-width text.

Blueprint rule:

- no primary task text should exist as loose page content when a card container is expected

### 2.5 Vertical vs horizontal balance

`Confirmed`

- Mobile emphasizes vertical stacking.
- Web preserves the same card logic but converts key screens, especially exam screens, into split horizontal panels.
- Horizontal layout is used for role separation, not for density alone.

Blueprint rule:

- horizontal expansion must separate prompt and response zones, not merely widen cards

### 2.6 Scroll behavior

`Confirmed`

- Global shell regions and task content regions are separated.
- Long content scrolls inside a bounded content area.
- Fixed navigation and progress remain visually stable while task content changes.

Blueprint rule:

- interaction chrome stays anchored; content scrolls beneath it

## 3. CARD SYSTEM

### 3.1 Radius scale

`Confirmed`

- Shared radius tokens show a two-level system:
  - card radius around `16`
  - button radius around `14`

Blueprint rule:

- There are not many competing radius families.
- Surfaces and actions use near-neighbor radii, creating one visual family.

### 3.2 Shadow behavior

`Confirmed`

- Elevated cards use soft, downward shadow.
- Shadow is stronger on dark premium cards and module cards.
- White task cards also use elevation, but with softer blur and less visible border weight.

Blueprint rule:

- shadow is used to detach cards from atmospheric backgrounds, not to dramatize every component

### 3.3 Elevation hierarchy

`Confirmed`

Low elevation:

- compact control surfaces
- utility pills
- inline option cards

Medium elevation:

- standard info cards
- dashboard cards
- prompt cards

High elevation:

- hero cards
- module launch cards
- centered card-learning object
- certificate/result focal cards

Blueprint rule:

- elevation communicates importance, not theme variation

### 3.4 Padding rules

`Confirmed`

- Content cards use medium-large internal padding.
- Compact control cards use smaller but still comfortable padding.
- Primary cards do not collapse to tight, dense packing.

Blueprint rule:

- padding must be consistent enough that cards read as members of one system, not individually styled objects

### 3.5 Card types

#### Primary Card

Role:

- carries the main task or main route decision

Characteristics:

- strongest elevation
- readable contrast
- medium-large padding
- clear CTA docking

#### Secondary Card

Role:

- supports the main card with context, progress, or supplementary information

Characteristics:

- lower emphasis
- smaller footprint
- same radius family

#### Interactive Card

Role:

- selectable module, level, answer, or practice route

Characteristics:

- clear pressed/selected state
- contained text and icon
- state change through border/fill/emphasis, not structural deformation

#### Modal Card

Role:

- temporary focus, warning, or state interruption

Characteristics:

- elevated above background context
- tightly scoped content
- one primary action path

## 4. NAVIGATION STRUCTURE

### 4.1 Top bar behavior

`Confirmed`

- Deep screens frequently use a top header with:
  - screen title
  - back affordance or home affordance
  - progress/timer or utility controls

Blueprint rule:

- the top bar establishes task context before content begins

### 4.2 Drawer and global navigation

`Confirmed`

- Global navigation is drawer-based in the main app.
- Drawer contains:
  - profile identity
  - route list
  - settings/theme/logout utilities at the bottom

Blueprint rule:

- global navigation is persistent system infrastructure, not embedded inside each screen’s content body

### 4.3 Bottom navigation

`Confirmed`

- A bottom navigation pattern exists as a reusable system for mode switching in some mobile contexts.
- Its structure is fixed-position, icon-led, and route-oriented.

Blueprint rule:

- bottom navigation, when used, is a stable route rail, not an inline section list

### 4.4 CTA placement

`Confirmed`

- Primary CTA placement is highly consistent:
  - bottom-right on wider exam layouts
  - bottom-centered on mobile card flows
  - lower portion of the dominant card on dashboard-style screens

Blueprint rule:

- interaction resolves at the lower edge of the active workspace

### 4.5 Progress indicators

`Confirmed`

- Exam mode uses top progress strips, timer displays, or indexed navigation.
- Card mode uses dots and compact bars.
- Dashboard mode uses progress rings or summary cards.

Blueprint rule:

- progress style is family-specific, but always present in long-running flows

### 4.6 Fixed vs scrollable

`Confirmed`

Fixed or strongly anchored:

- top header
- drawer/sidebar
- progress/timer zones
- final CTA dock in task screens

Scrollable:

- passage text
- review content
- settings lists
- long informational sections

Blueprint rule:

- the user’s current task state remains visible while detailed content moves

## 5. INTERACTION PATTERNS

### 5.1 Quiz

Focus area:

- one question block and its answer options

Secondary actions:

- flagging
- notes
- navigation index

Disabled states:

- inactive or unavailable progress actions
- subdued visual emphasis without removing layout

Feedback:

- selected option receives a filled or highlighted state
- progress updates after selection/advance
- completion leads into review or results, not back into the same question mode

Blueprint rule:

- quiz interaction always centers on a single answer surface

### 5.2 Cards

Focus area:

- one portrait card object

Secondary actions:

- audio
- recall/flip
- skip

Disabled states:

- low-emphasis utility controls remain visible but clearly inactive when unavailable

Feedback:

- card state changes through icon, label, tint, or button state
- progress dots update incrementally
- completion resolves into session termination action, not stacked summary text

Blueprint rule:

- card mode never competes with adjacent panels for attention

### 5.3 Dashboard

Focus area:

- next route or next meaningful activity

Secondary actions:

- settings
- drawer open
- profile
- limited shortcuts

Disabled states:

- locked modules still occupy a defined card or route slot

Feedback:

- active plan and progress are surfaced early
- launch actions are immediate

Blueprint rule:

- dashboard interaction is routing, not multitasking

## 6. VISUAL HIERARCHY

### 6.1 First attention target

`Confirmed`

The first visual target is usually one of:

- the screen title in the header
- the hero/intro card
- the central active card
- the exam prompt/answer card pair

Blueprint rule:

- each screen family has exactly one first-read focal object

### 6.2 Visual layers

`Confirmed`

The system consistently uses three layers:

1. atmospheric background layer
2. content surface layer
3. action/progress layer

Blueprint rule:

- depth is created by separating ambiance, task surface, and action emphasis

### 6.3 Depth creation

`Confirmed`

Depth is created by:

- dark-to-light contrast
- shadow separation
- contained card boundaries
- stable action anchoring

Not by:

- dense ornament
- heavy border stacks
- arbitrary motion

Blueprint rule:

- depth exists to clarify structure, not to decorate every component

## 7. CONSISTENCY RULES

The following invariants are observable across the old system.

### 7.1 Layout invariants

- Every major interactive screen is card-based.
- Primary content is bounded inside surfaces.
- No major screen relies on uncontained full-width raw content as its main pattern.
- Screen families do not mix unrelated paradigms on the same level.

### 7.2 Navigation invariants

- Global navigation is separate from task content.
- Deep routes preserve a visible context anchor through header/back/home/progress.
- Long flows always expose progress.

### 7.3 CTA invariants

- Primary CTA appears at the lower edge of the active task region.
- Secondary CTAs never visually outrank the primary CTA.
- CTA placement remains stable within each screen family.

### 7.4 Card invariants

- Interactive elements live inside or directly adjacent to card surfaces.
- Card radius and padding families are narrow and repeatable.
- Elevation signals importance.

### 7.5 Content invariants

- Dashboard screens direct the user toward the next mode.
- Learning screens focus on one active object or transcript.
- Exam screens maintain a strict task workspace model.
- Result screens summarize before they branch.

### 7.6 Motion invariants

`Probable`

- motion supports transitions and state changes
- motion does not redefine hierarchy

### 7.7 Non-mixing rule

- No screen should mix card-centered learning layout with section-feed dashboard layout inside the same primary workspace.

### 7.8 Rebuild-critical rule set

If the system is rebuilt without the original assets, the following must still hold:

- one dominant card or panel group per screen
- medium outer padding
- 8-based spacing rhythm
- narrow radius family
- clear top context anchor
- visible progress in long flows
- lower-edge primary CTA placement
- atmospheric background separated from readable task surfaces

## FINAL BLUEPRINT SUMMARY

The original UI is a card-governed interface with a stable route shell. It does not rely on raw page composition. It relies on bounded surfaces, predictable progress, and lower-edge action anchoring. The rebuild target is therefore not “dark premium styling.” The rebuild target is:

- route-separated shell
- card-contained content
- one focal task surface
- one stable progress channel
- one visually dominant completion action

If those five rules are preserved, the original system can be reconstructed without the original code or assets.
