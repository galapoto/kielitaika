# PHASE 6.3 — LAYOUT CORRECTION (STRICT, NON-DESIGN)

## ROLE

You are a **layout correction agent**.

You are NOT:
- a designer
- a feature builder
- a refactorer

You are fixing:
- layout hierarchy
- DOM structure
- rendering flow
- background application
- mobile vs web behavior

---

## GOAL

Make the app behave like:

- one focused screen at a time
- one dominant visual element per screen
- no vertical stacking of major sections
- proper centered layout for practice runtime
- correct background rendering per screen

---

## CRITICAL RULES

- DO NOT redesign UI
- DO NOT change colors
- DO NOT change component meaning
- DO NOT modify backend
- DO NOT introduce new UI systems

ONLY fix:
→ layout
→ rendering structure
→ DOM hierarchy

---

# SECTION 1 — FIX PRACTICE SCREEN DOM STRUCTURE

## PROBLEM

Current structure:

- intro panel always visible
- runtime rendered below it
- results in vertical stacking
- card is not dominant

---

## REQUIRED FIX

In:

`frontend/app/screens/CardsScreen.tsx`

---

### STEP 1 — CONDITIONAL INTRO

Replace:

```tsx
<section className="practice-intro-card">
WITH:

{!runtime && (
  <section className="practice-intro-card">
and close it properly.

STEP 2 — REMOVE STACKING STRUCTURE
REMOVE:

<section className="practice-runtime-shell">
REPLACE with:

<div className="practice-runtime-root">
STEP 3 — ENSURE ONLY ONE MAIN BLOCK
Final structure MUST be:

<div className="practice-screen">

  {!runtime && (
    <section className="practice-intro-card">
      ...
    </section>
  )}

  {runtime && (
    <div className="practice-runtime-root">
      <div className="practice-card-stage">
        ...
      </div>
    </div>
  )}

</div>
SECTION 2 — FORCE CARD TO BE CENTERED (CRITICAL)
In global.css or relevant file:

ADD:

.practice-runtime-root {
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  height: 100%;
  width: 100%;
}

.practice-card-stage {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 24px;
  width: 100%;
}
SECTION 3 — FIX ROOT HEIGHT (BLOCKER)
If this is missing, nothing will center.

ADD:

html, body, #root {
  height: 100%;
}
SECTION 4 — FIX APP BACKGROUND SYSTEM (CRITICAL)
PROBLEM
Using inline styles:

style={getBackgroundStyle(...)}
This breaks layering and overrides.

REQUIRED FIX
In:

frontend/app/App.tsx

STEP 1 — REMOVE inline style
REMOVE:

style={getBackgroundStyle(backgroundScreen, colorScheme)}
STEP 2 — REPLACE WITH CLASS SYSTEM
Use:

className={`app-frame ${getBackgroundClass(backgroundScreen, colorScheme)}`}
STEP 3 — ENSURE CLASS EXISTS
In:

frontend/app/theme/backgrounds.ts

Ensure:

export function getBackgroundClass(screen, scheme) {
  return BACKGROUND_CLASS_MAP[screen]
}
SECTION 5 — REMOVE GLOBAL BACKGROUND OVERRIDES
Search in:

global.css

all component CSS

REMOVE OR FIX:
.app-frame::before

.app-shell::before

any always-on gradients

RULE
Decorative backgrounds must ONLY come from:

→ backgrounds.ts

SECTION 6 — ENSURE SINGLE SCREEN DOM OUTPUT
In:

frontend/app/App.tsx

VERIFY
This must remain:

<div className="route-stage" key={app.screen}>
  {screen}
</div>
ENSURE
No screen renders:

inside another screen

alongside another screen

SECTION 7 — FIX MOBILE LAYOUT (NOT OPTIONAL)
In CSS:

ADD:
.app-frame {
  min-height: 100vh;
}

.app-shell {
  max-width: 1360px;
  margin: 0 auto;
  height: 100%;
}

.route-stage {
  height: 100%;
  display: flex;
  flex-direction: column;
}
ENSURE
Mobile:

no full-width uncontrolled content

no vertical overflow stacking of major sections

SECTION 8 — VERIFY CARD DOM DOMINANCE
After fix, DOM MUST look like:

<div class="practice-screen">
  <div class="practice-runtime-root">
    <div class="practice-card-stage">
      <div class="practice-card-wrapper">
MUST NOT CONTAIN:
intro panel above card (when runtime active)

large form blocks above card

SECTION 9 — FORCE DEBUG CHECK (MANDATORY)
Temporarily add:

.practice-card-wrapper {
  outline: 2px solid red;
}
IF YOU DO NOT SEE IT CENTERED
→ layout fix is incomplete
→ wrong container is being styled

SECTION 10 — OUTPUT DOCUMENT
Create:

/home/vitus/kielitaika/docs/audit/phase_6_3_layout_fix.md

INCLUDE:
what was wrong in DOM structure

what caused stacking behavior

how card dominance was restored

how background system was fixed

what CSS rules were blocking layout

what files were modified

SUCCESS CONDITIONS
You are DONE only if:

practice intro disappears when runtime starts

card is centered both vertically and horizontally

no stacked layout exists

mobile no longer feels like a long scroll page

backgrounds change correctly per screen

no inline background styles remain

card is the dominant visual element

FAILURE CONDITIONS
FAIL if:

intro still visible during runtime

card is not centered

layout still scrolls like a document

background looks identical across screens

multiple sections are stacked vertically

FINAL NOTE
This is not a visual polish phase.

This is a layout correctness phase.

If done correctly:

→ the UI will immediately look cleaner
→ the card system will finally become visible
→ mobile will feel like an app, not a webpage

