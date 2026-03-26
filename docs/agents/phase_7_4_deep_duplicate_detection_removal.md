You are performing a full-system duplicate detection and elimination pass on the frontend codebase.

This is a post-Phase 7.3A structural stabilization audit.

CONTEXT
The system now enforces:

ScreenScaffold-based layout (header / content / action zones)

One dominant card per screen

CTA actions must live only in the action zone

Global layout rules defined in global.css

Your job is to ensure no duplicate structures, styles, or behaviors remain.

SCOPE
Scan ALL frontend files:

/frontend/app/screens/

/frontend/app/components/

/frontend/app/theme/

/frontend/app/hooks/

STEP 1 — DETECT DUPLICATES
Identify and list ALL instances of:

A. Structural duplication
Multiple layout wrappers inside a single screen

Nested structures replicating header/content/action behavior

Any screen not fully controlled by ScreenScaffold

B. Action duplication
Buttons inside content cards that replicate action zone behavior

Same function triggered from multiple UI locations

Hidden or legacy CTAs

C. Style duplication
Inline styles duplicating global.css rules

Multiple spacing systems (e.g., 12px, 18px, random values)

Duplicate card styling patterns

D. Component duplication
Multiple components representing the same concept:

cards

panels

containers

Slight variations that should be unified

E. Logic duplication
Repeated conditional rendering patterns

Duplicate state handling for:

sessions

submissions

navigation

STEP 2 — CLASSIFY EACH DUPLICATE
For each duplication:

Location (file + line)

Type (A–E)

Severity:

critical (breaks system rules)

high (causes drift)

medium (redundant)

low (cosmetic)

STEP 3 — DEFINE SOURCE OF TRUTH
For each duplicated group:

Identify the correct implementation

Justify why it is correct (based on system rules)

Mark all others as:

remove

refactor

merge

STEP 4 — APPLY CLEANUP
Perform:

Removal of redundant components

Refactor duplicated logic into single sources

Replace inline styles with global tokens

Enforce ScreenScaffold as the ONLY layout authority

HARD RULES (NON-NEGOTIABLE)
No screen may define its own layout system

No CTA may exist outside the action zone

No duplicate card structures allowed

No inline layout styling if global.css defines it

No competing primary surfaces

OUTPUT
Produce:

Duplicate Audit Report

full list of all duplicates

classification + severity

Cleanup Actions

what was removed

what was merged

what was refactored

Final Verification

confirm system obeys all Phase 7.2 + 7.3 rules

6. One thing to keep in mind
Do NOT rush removal blindly.

Some duplicates exist because:

system evolved

features overlap

flows are slightly different

So the key is not deletion.

It is:

convergence to a single authority per concept

7. Where you are now (honest state)
You are at:

✔ structural system introduced

⚠ duplicate risk HIGH

❌ system not yet clean

❌ visual not yet validated
