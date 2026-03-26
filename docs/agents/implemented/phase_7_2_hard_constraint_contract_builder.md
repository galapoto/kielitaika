You are converting a forensic UI analysis into a STRICT, ENFORCEABLE UI SYSTEM.

Input:
docs/audit/UI_FORENSIC_ANALYSIS.md

Output:
docs/audit/UI_SYSTEM_SPEC.md

---

## CORE OBJECTIVE

Transform descriptive rules into:

* measurable constraints
* developer-enforceable rules
* non-negotiable system boundaries

This document must REMOVE ambiguity.

---

## HARD CONSTRAINTS (DO NOT VIOLATE)

1. DO NOT import or reference any code from the old app
2. DO NOT introduce new visual ideas
3. DO NOT change:

   * login screen
   * welcome screen
   * color palette
   * app functionality

You are defining structure, not redesigning behavior.

---

## REQUIRED STRUCTURE

---

### 1. DESIGN TOKENS (MANDATORY NUMERIC SYSTEM)

Convert all spacing and sizing into exact tokens.

Define:

#### Spacing Scale

Must be explicit:

* space-1 = 4px
* space-2 = 8px
* space-3 = 12px
* space-4 = 16px
* space-5 = 24px
* space-6 = 32px

NO vague sizes allowed.

---

#### Radius Scale

Define EXACT allowed values:

* radius-sm
* radius-md
* radius-lg

No free-form radii allowed.

---

#### Elevation System

Define:

* elevation-1
* elevation-2
* elevation-3

Each must describe:

* shadow intensity
* blur behavior
* when it is used

---

### 2. CARD SYSTEM (STRICT CONTRACT)

Define EXACT rules:

#### Card MUST:

* contain all primary content
* use defined radius token
* use defined padding token

#### Card MUST NOT:

* exist without padding
* mix padding sizes arbitrarily
* stretch edge-to-edge without outer margin

---

Define 4 card types:

* primary-card
* secondary-card
* interactive-card
* modal-card

Each must include:

* padding token
* elevation level
* allowed content types

---

### 3. LAYOUT RULES (NON-NEGOTIABLE)

Define:

#### Screen Structure MUST follow:

1. Header (optional but defined)
2. Content zone (card-contained)
3. Action zone (CTA anchored)

---

#### Prohibited Layouts:

* raw text outside card containers (for primary content)
* mixed section + card layouts
* multiple competing primary zones

---

#### Content Width Rules:

* define max width for cards (mobile + web)
* define horizontal padding rules

---

### 4. CTA SYSTEM (VERY IMPORTANT)

Define:

* Primary CTA positions:

  * mobile: bottom-center
  * desktop: bottom-right

* CTA MUST:

  * be visually dominant
  * not move position between similar screens

* CTA MUST NOT:

  * appear mid-screen as primary action
  * compete with secondary actions

---

### 5. NAVIGATION RULES

Define:

* top bar structure
* drawer behavior
* bottom navigation rules

Explicitly state:

* what is fixed
* what scrolls

---

### 6. INTERACTION RULES

Define for:

#### Quiz

* selection behavior
* state change rules

#### Cards

* focus behavior
* allowed controls

#### Dashboard

* routing priority rules

---

### 7. VISUAL HIERARCHY RULES

Define:

* maximum number of primary focal elements per screen (must be 1)
* how secondary elements behave
* how depth is created (strictly)

---

### 8. HARD “DO / DO NOT” SECTION

Examples:

DO:

* use card containers for all task content

DO NOT:

* place primary content directly on background
* mix layout paradigms in one screen
* introduce new spacing values

---

## FINAL REQUIREMENT

This document must function as:

A SYSTEM CONTRACT.

If a developer violates it, the UI becomes invalid.

No soft language.
No suggestions.
Only enforceable rules.

---

## VALIDATION TEST

At the end, include:

"UI VALIDATION CHECKLIST"

A developer must be able to check:

* spacing
* layout
* component usage

Without seeing the original app.
