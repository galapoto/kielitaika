# PHASE 6.2 — UI DIMENSION, FLOW, BACKGROUND, AND CARD REDESIGN CORRECTION

## PURPOSE

Fix the remaining frontend structure and layout problems in the app, with special focus on:

- distorted mobile flow
- missing / incorrectly applied background images
- incorrect screen isolation on mobile
- sidebar / drawer behavior on mobile
- incorrect naming and grouping of sections
- poor card layout and wrong card design
- inconsistent dimensions and spacing on web and mobile

This phase must both:

1. correct the implementation
2. produce documentation that explains the dimension and layout problems and the redesign plan

---

## CORE GOAL

The app must behave like a real application with:

- one active page at a time
- correct mobile flow
- proper responsive shell
- proper background usage
- correct navigation grouping
- correct card design for both mobile and web

The design language and spacing must be rebuilt using:

- old app flow from `/home/vitus/Documents/puhis/`
- card design docs from `/home/vitus/kielitaika/docs/ui_design/new_card_ui/`
- current app color system
- current app architecture and contracts

---

## NON-NEGOTIABLE RULES

- DO NOT change backend logic unless strictly required for navigation state or screen routing
- DO NOT change color system beyond making card background a slightly lighter version of the app color system
- DO NOT redesign the whole app freely
- DO NOT keep stacked multi-screen rendering
- DO NOT leave any screen in "continuous page" behavior
- DO NOT hardcode backgrounds directly inside random components
- DO NOT ignore mobile layout problems
- DO NOT leave naming inconsistent

Everything must be fixed systematically.

---

## REFERENCES TO STUDY BEFORE IMPLEMENTATION

### 1. Old app flow reference
`/home/vitus/Documents/puhis/`

Study the old app for:
- screen flow
- page isolation
- navigation movement
- YKI progression structure
- general product flow

Do NOT copy color or old visual design blindly.
Use it for flow and page sequencing only.

### 2. New card design docs
`/home/vitus/kielitaika/docs/ui_design/new_card_ui/`

This is authoritative for:
- card proportions
- spacing
- controls
- icon placement
- skip button position
- recall placement
- pagination/progress area
- state color logic

### 3. Current assets
`/home/vitus/kielitaika/frontend/app/assets/`

Study:
- background images
- logos
- icons
- sounds

### 4. Current app
`/home/vitus/kielitaika/frontend/app/`

Study:
- AppShell
- App.tsx
- screens
- theme
- card implementation
- background system

---

## SECTION 1 — FIX MOBILE FLOW FIRST

### Problem
Mobile still behaves like one continuous page.
The app must not feel like a long stacked document.

### Required correction
Implement true screen isolation on mobile.

### Rules
- Only one active screen renders at any time
- AppShell must work on mobile, not just desktop
- Mobile must use a drawer/sidebar system, not stacked content
- Drawer must open and close properly
- Screen content must be constrained to the content area only

### Validate
When mobile screen is:
- Home → only Home screen content is visible
- Practice → only Practice screen content is visible
- Conversation → only Conversation screen content is visible
- YKI Intro / Runtime / Result → only one of these is visible
- Professional Finnish → only that screen visible

No screen stacking allowed.

---

## SECTION 2 — FIX BACKGROUND IMAGE SYSTEM

### Problem
Background images are not appearing correctly across the app.

### Required correction
There must be background images in all pages of the app except:
- exam section
- practice areas

### Rules
- Background images must be centrally resolved from one background system
- Do not assign background images ad hoc inside individual screens
- Pages that should have backgrounds must render them consistently on mobile and web
- Practice areas and exam runtime must not use the decorative background image system
- Background image layering must not distort content spacing
- Backgrounds must not make text unreadable

### Required pages with backgrounds
At minimum review and correct:
- login/auth
- home
- conversation
- professional finnish
- settings
- main shell where applicable

### Required pages without decorative backgrounds
- practice runtime pages
- card runtime pages
- YKI exam runtime pages

---

## SECTION 3 — FIX NAVIGATION TREE AND LABELS

### Problem
Naming and grouping are wrong.

### Replace current navigation with this structure:

- Home
- Practice
  - Vocabulary
  - Grammar
  - Phrases
- Conversation
- YKI Exam
- Professional Finnish
- Settings

### Rules
- Remove "Cards" as a top-level user-facing name
- Remove "Roleplay" as the main user-facing name; use "Conversation"
- "Voice" must not remain as a vague user-facing destination unless its role is explicitly justified and renamed
- Sidebar and drawer must use the corrected naming on both mobile and web
- User profile block must remain with image placeholder and settings access

---

## SECTION 4 — CARD SYSTEM REDESIGN (AUTHORITATIVE)

### Problem
The current card system does not match the required design.

### Authoritative design source
`/home/vitus/kielitaika/docs/ui_design/new_card_ui/`

### Implement for both mobile and web
The card system must be rebuilt to visually and structurally match the referenced design, while using a slightly lighter version of the app’s current color family.

### Mandatory features
- centered layered card
- recall buttons at top left and top right
- top-left audio button
- top-right state/refresh button
- large centered word
- divider above skip button
- skip button positioned exactly in lower card area
- pagination dots
- progress indicator
- proper state color logic:
  - new = blue
  - practiced but not mastered = red
  - mastered = green

### Mandatory interaction behavior
- card flip/reveal behavior
- audio button feedback
- skip action
- state icon behavior
- progress update
- optional swipe if already architecturally safe

### Layout rules
Use the spacing guidance from the design doc:
- 8px grid
- centered card
- top controls properly spaced
- no stretched or distorted card proportions
- no cramped inner card layout

### Web adaptation
Web must use the same structure and proportions logic, not a random desktop reinterpretation.
It may scale, but must still look like the same design system.

---

## SECTION 5 — DIMENSION AND SPACING AUDIT

### Problem
The UI is distorted and not well aligned, especially on mobile.

### Required work
Audit the current dimension system and compare:
- current app
- old app flow behavior
- required new card design
- actual responsive shell implementation

### You must identify:
- where containers are too wide or too tall
- where cards are stretched
- where sidebar/content proportions are wrong
- where padding/gaps are inconsistent
- where mobile spacing breaks
- where screen-safe areas are not respected
- where card runtime dimensions are incorrect

### Then produce a correction plan
This plan must specify:
- container widths
- max content widths
- card widths/heights
- shell proportions
- sidebar widths
- drawer widths
- padding system
- vertical rhythm
- safe area rules
- mobile vs web scaling rules

---

## SECTION 6 — OLD APP FLOW / DIMENSION REPORT

### Required analysis
Study the old app at `/home/vitus/Documents/puhis/` and produce a report that explains:

- how the old app handled page-to-page flow
- how the old app isolated one page at a time
- how the old app dimensions were structured
- how content areas, cards, and layouts were proportioned
- what should be preserved from the old flow model
- what should not be preserved

This is not about colors.
This is about:
- flow
- dimension logic
- page structure
- navigation behavior

---

## SECTION 7 — IMPLEMENTATION CORRECTIONS

### Required code changes
Make the actual frontend corrections required to:
- fix mobile drawer/sidebar behavior
- fix single-screen rendering
- fix navigation naming
- fix background image application
- rebuild the card system to the authoritative design
- clean up spacing and dimensions
- improve alignment and proportions for web and mobile

### Constraint
Changes must be systematic, not piecemeal hacks.

---

## SECTION 8 — OUTPUT DOCUMENTS

Create BOTH of these in:

`/home/vitus/kielitaika/docs/audit/`

### 1. `phase_6_2_ui_dimension_audit.md`
Must contain:
- current problems
- mobile flow failures
- background failures
- card layout failures
- naming problems
- spacing and dimension problems
- old app flow findings
- exact dimension issues found
- exact files responsible

### 2. `phase_6_2_ui_redesign_plan.md`
Must contain:
- full correction plan
- responsive shell plan
- sidebar/drawer plan
- page isolation plan
- background system plan
- card redesign implementation plan
- spacing and sizing plan
- old app dimension lessons applied
- file-by-file implementation roadmap

---

## SECTION 9 — SUCCESS CONDITIONS

This phase is only complete if ALL of the following are true:

- mobile no longer behaves like one long continuous page
- mobile has working sidebar drawer behavior
- desktop and mobile share one coherent shell
- correct background images appear where they should
- practice and exam areas correctly avoid decorative backgrounds
- navigation naming is corrected
- card system matches the provided design language and structure
- web and mobile dimensions feel proportional and aligned
- both audit documents are created in `/home/vitus/kielitaika/docs/audit/`

---

## FAILURE CONDITIONS

This phase fails if:
- mobile still stacks screens
- card system remains structurally different from the required design
- background image rules are still inconsistent
- naming remains wrong
- dimensions remain distorted
- the agent fixes UI without producing the required audit documentation

---

## FINAL NOTE

This phase is not cosmetic.
It is a structural UI correction phase.

The result must make the app:
- readable
- proportional
- page-based
- responsive
- aligned with old app flow
- aligned with the new card design system
