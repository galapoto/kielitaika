You are continuing the KieliTaika migration.

The backend, audit system, certification system, and durability layer are complete.

Your task is now:

Complete the UI migration and enforce a single UI system

OBJECTIVE
Ensure that:

only one UI system exists

React Native is the single source of truth

all screens are migrated

no legacy frontend survives

NON-NEGOTIABLE RULE
If two UI systems exist → migration is NOT complete.

EXECUTION TASKS
1. AUDIT CURRENT UI STRUCTURE
Identify:

all UI entry points

all screen implementations

all styling systems

Check for:

React DOM usage

CSS files

legacy components

duplicate screens

2. VERIFY RN COVERAGE (CRITICAL)
Confirm React Native equivalents exist for:

YKI Practice

YKI Exam

Daily Practice

Speaking Practice

Professional Finnish

Authentication flow

If any are missing:
→ create RN implementation
→ use packages/ui only
→ no custom styling outside system

3. REMOVE LEGACY FRONTEND
Delete completely:

old frontend/ directory (if exists)

any duplicate UI layer

any React DOM-based screens

No archiving. No fallback.

4. ENFORCE UI THROUGH packages/ui
All screens must:

use shared components

follow spacing system

follow token system

not override layout rules

5. REMOVE CSS DEPENDENCIES
no .css files

no DOM styling

no browser-specific layout logic

Everything must be RN-compatible.

6. ENABLE RN WEB AS SINGLE WEB LAYER
no separate web app

RN Web handles browser rendering

7. CLEAN ROUTING SYSTEM
Ensure:

single routing logic

no dual routing stacks

no legacy navigation

8. VALIDATE SCREEN BEHAVIOR
Confirm:

no layout drift

no scroll violations (except exam)

consistent header/content/action zones

STRICT PROHIBITIONS
You MUST NOT:

keep legacy UI “temporarily”

keep duplicate screens

allow CSS styling to survive

allow screen-level layout overrides

introduce new UI patterns

VALIDATION
Run:

tsc --noEmit
controlled_ui_contract_validation
Add:

UI duplication detection

RN-only enforcement checks

OUTPUT FORMAT
1. Files deleted
2. Files modified
3. Screens migrated
4. Validation results
5. Errors encountered
6. Success / failure
POST-RUN AUDIT (MANDATORY)
AUDIT
A. UI System Uniqueness
B. Removed Legacy Components
C. RN Coverage Status
D. Remaining UI Risks
SYSTEM STATE
UI Governance: ✅ / ❌

Single UI System: ✅ / ❌

Contract Enforcement: ✅ / ❌

YKI Integrity: ✅ / ❌

Audit Logging: ✅ / ❌

Replayability: ✅ / ❌

Certification Integrity: ✅ / ❌

Persistence Durability: ✅ / ❌

External Verifiability: ✅ / ❌

SUCCESS CRITERIA
This phase is complete when:

no legacy frontend exists

all screens are RN-based

only one UI system remains

UI is fully governed by packages/ui

FINAL NOTE (IMPORTANT)
You already built something that behaves like a regulated system.

But the migration plan doesn’t care about that yet.

It only cares about one thing now:

There must not be two UIs
