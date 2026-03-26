You are performing a structural UI rewrite of the application.

Input:
docs/audit/UI_SYSTEM_SPEC.md

---

## GOAL

Enforce layout structure across all screens WITHOUT focusing on styling details.

This phase is about:

* screen skeleton correctness
* layout zones
* content containment

NOT about:

* visual polish
* shadows, colors, or fine styling

---

## HARD RULE

You are allowed to:

* move components
* wrap content in cards
* restructure layout hierarchy

You are NOT allowed to:

* change logic
* change functionality
* change routing
* change component behavior

---

## PRIMARY TASK

For EVERY screen:

### 1. ENFORCE 3-ZONE STRUCTURE

Every screen MUST be rewritten into:

1. Header zone
2. Content zone (card-contained)
3. Action zone (CTA anchored)

If a screen does not clearly have these → rewrite it.

---

### 2. REMOVE SCATTERED LAYOUT

Eliminate:

* raw sections floating on background
* mixed layout paradigms
* stacked unrelated cards

Replace with:

* one dominant card
* optional secondary cards
* clear vertical hierarchy

---

### 3. ENFORCE PRIMARY ZONE RULE

Each screen MUST have:

* exactly ONE dominant content surface

If multiple surfaces compete:

* demote or restructure them

---

### 4. EXTRACT CTA INTO ACTION ZONE

If CTA is:

* inside random cards
* mid-screen
* duplicated

You MUST:

* move it to the action zone
* align with system rules

---

### 5. CARD CONTAINMENT

Wrap ALL primary content inside:

* primary-card
* secondary-card
* interactive-card

No raw task content allowed.

---

### 6. NORMALIZE SCREEN WIDTH

Apply:

* correct max widths
* correct gutters
* centered layout where required

---

## OUTPUT

1. Updated layout code (no styling perfection required)
2. docs/audit/LAYOUT_REWRITE_LOG.md

The log must include:

* Screens changed
* What structural violations existed
* What rules were applied to fix them

---

## VALIDATION

For each screen, confirm:

* [ ] Has header/content/action zones
* [ ] Only one primary focal surface
* [ ] No raw content outside cards
* [ ] CTA correctly placed

If any fails → screen is invalid
