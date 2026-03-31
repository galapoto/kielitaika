CONTINUE EXECUTION (POST AUTH + UI FOUNDATION + EFFECTIVENESS LAYER)
You are continuing execution of the KieliTaika system.

You are NOT starting fresh.
You are NOT redesigning anything.
You are continuing from a validated, partially integrated system state.

CURRENT SYSTEM STATE (DO NOT VIOLATE)
Backend
Learning effectiveness layer implemented:

apps/backend/learning/decision_version.py

progress_models.py

progress_service.py

graph_service.py

Outcome tracking exists:

recommended_at

subsequent_attempts

improvement_delta

effectiveness_score

factor provenance

status

Tests passing:

test_progress_service.py

test_yki_practice_mode.py

Frontend (React Native / Expo)
Expo Router is ACTIVE

Entry:

apps/client/app/_layout.tsx

apps/client/app/index.tsx

apps/client/app/auth.tsx

Auth state:

Zustand store (apps/client/state/authStore.ts)

App shell (apps/client/state/AppShell.tsx)

UI system:

packages/ui fully active (tokens, primitives, layouts, screens)

Core services:

packages/core/services/authService.ts

packages/core/api/apiClient.ts

Auth flow:

Token persistence implemented

setAuthToken() implemented

BUT backend login endpoint DOES NOT EXIST

Constraints
❗ NO backend modification allowed in this phase

❗ NO regression to old UI system

❗ NO direct fetch() usage

❗ MUST use:

@core

@ui

centralized state

❗ Android runtime currently unavailable → DO NOT block progress on it

PRIMARY OBJECTIVE OF THIS PHASE
Move from:

“Auth + UI foundation exists but is isolated”

TO:

“Fully functional learning + YKI runtime flows using the new architecture”

WITHOUT requiring backend login.

STRATEGY
Because backend login is missing:

→ You MUST implement a controlled mock-auth runtime bridge

This is NOT a hack.
This is a temporary execution layer to unlock system progress.

PHASE TASKS (STRICT ORDER)
1. CREATE AUTH FALLBACK MODE (NON-NEGOTIABLE)
Goal:
Allow the app to function as authenticated WITHOUT backend login.

Implementation:
File:
packages/core/services/authService.ts

Add:

mockLogin()

mockUser

mockToken

Behavior:
If /auth/login fails or unavailable:
→ fallback to mock session

Store token in Zustand like real flow

Rules:
Must NOT break real login when backend is ready

Must be clearly isolated (feature flag or environment-based)

2. UNBLOCK APP SHELL TRANSITIONS
Ensure:
/ route:
→ redirects based on auth state

/auth:
→ writes to authStore

After login:
→ user lands in HomeScreen

3. BUILD REAL HOME SCREEN ENTRY POINT
File:
packages/ui/screens/HomeScreen.tsx

Must include:
User identity (from store)

Navigation entry points:

Learning

YKI Practice

Debug panel (already exists partially)

Constraint:
Use ONLY:

Box, Text, Button, Section, Screen

NO custom styling outside tokens.

4. CONNECT LEARNING PIPELINE TO UI
You already have:
Backend:

recommendation system

effectiveness tracking

Frontend:

learningService.ts (already extended)

Now implement:
File:
packages/ui/screens/LearningScreen.tsx

Must:
Fetch recommendations via learningService

Display:

recommended units

effectiveness metadata

decision_version

Allow:

selecting a unit

marking completion (simulate if needed)

5. CONNECT YKI PRACTICE FLOW
Use:
apps/client/features/yki-practice/services/ykiPracticeService.ts

Create:
File:
packages/ui/screens/YkiPracticeScreen.tsx

Must:
Start session

Display:

current task

session trace (versioned)

Handle:

next step progression

6. DEBUG VISIBILITY (CRITICAL FOR THIS PROJECT)
Extend debug panel in:
LearningHome.tsx OR new debug component

Must expose:
decision_version

effectiveness_score

factor contributions

improvement trends

raw recommendation outcomes

7. ENFORCE SYSTEM RULES (MANDATORY)
Validate:
No direct fetch usage

All API calls go through:

apiClient

@core/services

No UI outside packages/ui

No business logic inside UI components

8. TYPE SAFETY RECOVERY (IMPORTANT)
The previous run failed:

tsc exited with 124

You MUST:
Run typecheck WITHOUT timeout

Identify blocking files

Fix ALL type errors

DO NOT ignore this.

9. DO NOT TOUCH THESE
Backend routes

Existing learning logic

Decision system

Effectiveness model

Core API structure

VALIDATION CHECKLIST (YOU MUST REPORT)
Runtime
 Expo web runs

 Auth fallback works

 Navigation works

 No crashes

Learning
 Recommendations visible

 Effectiveness visible

 Decision version visible

YKI
 Session starts

 Tasks render

 State progresses

Architecture
 No direct fetch

 UI uses only @ui

 Services use only @core

Types
 tsc passes fully

OUTPUT FORMAT (STRICT)
You must report:

1. Files created
2. Files modified
3. New architecture flows introduced
4. Any blockers
5. Verification results
6. Whether system is now:
❌ partially functional

⚠️ functionally bridged

✅ operational (frontend-complete, backend-independent)

FINAL RULE
Do NOT stop at partial wiring.

You continue until:

The app can be opened → login (mock) → navigate → learn → run YKI → observe effectiveness

Even if backend is incomplete.

If anything is ambiguous, you resolve it using existing system patterns — not invention.

Proceed.
