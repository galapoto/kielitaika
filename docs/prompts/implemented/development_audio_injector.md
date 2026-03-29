DEVELOPMENT AUDIO INJECTOR (STRICT, NON-PLACEHOLDER)
AGENT ROLE
You are an Audio Validation & Test Harness Agent.

Your task is to enable full speaking-flow validation without requiring a physical microphone, while preserving 100% production integrity.

CORE PRINCIPLE (NON-NEGOTIABLE)
This is NOT a mock system.

This is a:

development-only audio injection interface
It must:

use the real backend API

follow the exact same validation path

update real session state

behave identically to real audio submission

STRICT CONSTRAINTS
You are NOT allowed to:

simulate backend success

bypass API calls

inject state directly into frontend

modify backend contract

change evaluation logic

introduce fake scoring

alter session structure

OBJECTIVE
Enable this flow:

Inject Audio (Dev Only)
→ real POST /task/audio
→ backend validation
→ session update
→ UI reflects answered state
→ resume works
STEP 1 — ADD DEV-ONLY AUDIO INJECTOR UI
FILE
apps/client/features/yki/YkiFeature.tsx
ADD BUTTON
Inject Audio (Dev Only)
VISIBILITY RULE (MANDATORY)
if (process.env.NODE_ENV !== "development") {
  return null;
}
This button MUST NOT exist in production builds.

STEP 2 — GENERATE VALID AUDIO REFERENCE
IMPLEMENT
const audioRef = `dev-audio-${Date.now()}`;
This must behave like a real audio reference identifier.

STEP 3 — USE REAL SUBMISSION FLOW
CALL EXISTING SERVICE
await submitAudio(audioRef);
Where:

POST /api/v1/yki/{session_id}/task/audio
IMPORTANT
You must NOT:

create a new endpoint

bypass validation

alter request shape

STEP 4 — UI FEEDBACK (DEV MODE ONLY)
After successful submission:

Display:

Audio submitted (development injector)
RULE
This message must:

NOT appear in production

NOT replace real feedback

only augment dev clarity

STEP 5 — STATE MUST FLOW FROM BACKEND
After submission:

Frontend must NOT manually set:

task.status = "answered"  ❌ NOT ALLOWED
Instead:

re-fetch OR rely on response
→ hydrate from backend
STEP 6 — RESUME BEHAVIOR
After reload:

If backend state is:

status: "answered"
UI must show:

✔ Answer submitted
Audio received
AND MUST NOT show:

recording controls
STEP 7 — VALIDATION
TEST 1 — injector flow
start session

reach speaking

click Inject Audio

✔ backend receives request
✔ task becomes answered

TEST 2 — reload
✔ speaking task remains answered

TEST 3 — guardrails
Wrong section:

→ NOT_SPEAKING_SECTION
Duplicate submit:

→ TASK_ALREADY_ANSWERED
TEST 4 — resume integrity
✔ currentTaskId unchanged
✔ state consistent

STEP 8 — PRODUCTION SAFETY CHECK
Build production bundle.

Verify:

Inject Audio button DOES NOT EXIST
This is mandatory.

STEP 9 — DOCUMENTATION
FILE
docs/project_plans/monorepo_structure.md
ADD SECTION
Audio Validation Strategy
Real audio: production path (microphone required)

Development injector: test path (no hardware dependency)

Both use identical backend flow

No simulation or bypass exists

VALIDATION CHECKLIST
✔ injector uses real API
✔ backend unchanged
✔ session state updated correctly
✔ resume works
✔ guardrails enforced
✔ production build clean

FAILURE CONDITIONS
injector bypasses backend

frontend mutates state manually

production build exposes injector

session behavior differs from real flow

SUCCESS CONDITION
Speaking flow is fully testable without hardware,
while remaining identical to production behavior
END OF AGENT TASK
