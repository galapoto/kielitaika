You are continuing the KieliTaika project.

Migration is complete.

Your task is now:

Lock the UI into a deterministic, non-deviating system

OBJECTIVE
Ensure that:

spacing is fixed and enforced

component sizes are fixed

animations are standardized

color states are controlled

typography is consistent

No visual drift must be possible.

CORE PRINCIPLE
If two screens can render the same component differently → the system is not locked.

EXECUTION TASKS
1. DEFINE SPACING SYSTEM
Create:

packages/ui/tokens/spacing.ts
Allowed values only:

4, 8, 16, 24, 32, 40, 48
2. DEFINE SIZE LOCKS
For each component type:

buttons

cards

inputs

mic button

headers

Define fixed:

width

height

padding

No free-form sizing allowed.

3. DEFINE COLOR STATES
Create:

packages/ui/tokens/colors.ts
Include:

correct

wrong

neutral

hover

disabled

Ensure:

no inline colors in screens

4. DEFINE TYPOGRAPHY SYSTEM
Create:

packages/ui/tokens/typography.ts
Lock:

font sizes

weights

line heights

Map usage:

titles

body text

labels

buttons

5. DEFINE ANIMATION SYSTEM
Create:

packages/ui/tokens/animation.ts
Lock durations:

fast (100–150ms)

normal (200–250ms)

slow (300–400ms)

No custom animation timing allowed.

6. REMOVE INLINE STYLING
Scan:

all screens in packages/ui/screens

Remove:

inline spacing

inline colors

inline sizing

Replace with tokens.

7. ENFORCE THROUGH VALIDATION
Add test:

ui_token_enforcement.test.cjs
Fail if:

inline styles detected

non-token values used

invalid spacing used

8. LOCK LAYOUT STRUCTURE
Ensure all screens follow:

header zone

content zone

action zone

No deviations.

STRICT PROHIBITIONS
You MUST NOT:

allow arbitrary spacing

allow custom colors

allow component resizing

allow screen-level styling overrides

introduce new tokens without definition

VALIDATION
Run:

tsc --noEmit
controlled_ui_contract_validation
ui_cutover_enforcement
ui_token_enforcement
OUTPUT FORMAT
1. Files created
2. Files modified
3. Tokens defined
4. Validation results
5. Errors encountered
6. Success / failure
POST-RUN AUDIT (MANDATORY)
AUDIT
A. Spacing Consistency
B. Token Coverage
C. Inline Style Removal
D. Visual Drift Risk
SYSTEM STATE
UI Governance: ✅ / ❌

Single UI System: ✅ / ❌

UI Determinism: ✅ / ❌

Contract Enforcement: ✅ / ❌

YKI Integrity: ✅ / ❌

Audit Logging: ✅ / ❌

Replayability: ✅ / ❌

Certification Integrity: ✅ / ❌

Persistence Durability: ✅ / ❌

External Verifiability: ✅ / ❌

SUCCESS CRITERIA
This phase is complete when:

no inline styles exist

all UI uses tokens

spacing is consistent everywhere

components render identically across screens

