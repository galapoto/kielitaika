AGENT PROMPT — DUPLICATE PURGE + IMPLEMENTATION VERIFICATION + UI ENFORCEMENT
CONTEXT (DO NOT SKIP)
You are working on the KieliTaika application.

The project already contains:

Multiple partially implemented UI systems

Rewritten layout architecture

Updated design principles

Critical design documents:

/home/vitus/kielitaika/docs/ui_design/core_design_principle.md

/home/vitus/kielitaika/docs/ui_design/updated_core_design_principle.md

These are the source of truth for UI decisions.

You are NOT allowed to ignore or override them.

PRIMARY OBJECTIVE
You must answer these two questions with full certainty:

Are all designed systems actually implemented in the repo?

Are there duplicates, conflicting components, or shadow implementations?

Then:

→ Perform a deep duplicate removal and structural cleanup
→ Prepare the system for clean UI rebuild (next phase)

HARD RULES
DO NOT generate new UI yet

DO NOT refactor blindly

DO NOT delete anything without classification

DO NOT merge components without proving equivalence

Everything must go through:
→ Discovery → Classification → Validation → Action

STEP 1 — FULL UI INVENTORY (MANDATORY)
Scan the entire frontend codebase.

Identify ALL:

Layout Systems
AppShell

Layout wrappers

Page containers

Navigation systems

Screens / Routes
Every page (mobile + web)

Any duplicate versions of same screen

Components
Buttons

Cards

Modals

Audio player

Mic components

Exam UI components

Practice UI components

Styling Systems
CSS / Tailwind / inline styles

Theme files

Token files (if any)

OUTPUT FORMAT
Produce:

UI_INVENTORY_REPORT.md
Structure:

SECTION 1 — Layout Systems
SECTION 2 — Screens
SECTION 3 — Shared Components
SECTION 4 — Styling Systems
Each item must include:

File path

Purpose

Where it is used

Suspected duplicates (if any)

STEP 2 — DUPLICATE DETECTION (DEEP)
You must detect duplicates using MULTI-SIGNAL analysis:

Signals to use:
Name similarity

JSX structure similarity

Prop similarity

Visual intent

File location

Usage overlap

Classify duplicates into:
1. TRUE DUPLICATES
Same purpose + same structure

2. SHADOW DUPLICATES
Same purpose but different implementations

3. FRAGMENTED COMPONENTS
Split logic across multiple files

4. DEAD COMPONENTS
Unused

OUTPUT
DUPLICATE_ANALYSIS_REPORT.md
For EACH duplicate group:

Component Name:
Files:
Type: (TRUE / SHADOW / FRAGMENTED / DEAD)

Why duplicate exists:
Which one is closest to design system:
Which one should survive:
Risk level:
STEP 3 — DESIGN COMPLIANCE CHECK
Compare EVERYTHING against:

core_design_principle.md

updated_core_design_principle.md

Check for violations:

Layout
Missing 3-panel structure?

Broken hierarchy?

Spacing
No consistent spacing system?

Misaligned elements?

Typography
Inconsistent font sizes?

Bad letter spacing?

Icons
Missing icons?

Inconsistent icon styles?

Symmetry
Misaligned containers?

Uneven padding?

OUTPUT
DESIGN_VIOLATION_REPORT.md
STEP 4 — IMPLEMENTATION STATUS
Now answer clearly:

Question 1:
Are all designed systems implemented?

→ List:

Fully implemented

Partially implemented

Not implemented

Question 2:
Are duplicates already present?

→ YES / NO (with evidence)

OUTPUT
IMPLEMENTATION_STATUS.md
STEP 5 — SAFE CLEANUP PLAN (NO DELETION YET)
Create a surgical cleanup plan

DO NOT execute.

For each duplicate:
What to keep

What to delete

What to merge

What to rewrite

Include:
Exact file paths

Order of operations

Rollback safety

OUTPUT
CLEANUP_EXECUTION_PLAN.md
STEP 6 — ICON SYSTEM DESIGN (PREPARATION ONLY)
You must define a global icon system (do not implement yet)

Requirements:
Modern 2027-level icon style

Consistent across:

Navigation

Buttons

Cards

Inputs

Audio / mic

Exam UI

Practice UI

Define:
Icon library (e.g. Lucide / Phosphor / custom SVG)

Size scale (xs, sm, md, lg)

Stroke width

Placement rules

Color rules

Interaction states

OUTPUT
ICON_SYSTEM_SPEC.md
STEP 7 — SPACING & TYPOGRAPHY SYSTEM
Define:

Spacing System
4px or 8px grid

Padding rules

Margin rules

Container widths

Typography
Font families

Font sizes (scale)

Letter spacing rules

Line height rules

OUTPUT
DESIGN_TOKEN_SPEC.md
FINAL OUTPUT REQUIRED
You must produce ALL of these:

UI_INVENTORY_REPORT.md

DUPLICATE_ANALYSIS_REPORT.md

DESIGN_VIOLATION_REPORT.md

IMPLEMENTATION_STATUS.md

CLEANUP_EXECUTION_PLAN.md

ICON_SYSTEM_SPEC.md

DESIGN_TOKEN_SPEC.md

FINAL NOTE
If duplicates are not removed now:

UI inconsistency will multiply

Bugs will compound

Design system will collapse

This step is non-negotiable foundation work

