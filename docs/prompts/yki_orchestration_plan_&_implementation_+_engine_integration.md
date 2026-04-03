🔴 YKI ORCHESTRATION LAYER — FULL SYSTEM DESIGN (PART 1)
0. WHY THIS LAYER EXISTS (STRICT DEFINITION)
This layer exists because:

The engine produces exam data

The frontend requires governed UI state

These two are not compatible directly

So this layer is:

A deterministic, backend-controlled state machine that converts engine output into a governed runtime contract.

❗ HARD RULE
The orchestrator is the ONLY authority for runtime behavior.

NOT:

the engine

the frontend

not session_store (eventually)

1. SYSTEM RESPONSIBILITY SPLIT (FINAL FORM)
1.1 External YKI Engine (DO NOT MODIFY)
Responsible for:

generating exam structure

storing exam session

validating answers (if applicable)

returning raw exam state

It DOES NOT:

control UI

enforce navigation

manage "current_view"

enforce forward-only progression

1.2 Backend Orchestrator (NEW CORE)
Responsible for:

session lifecycle

navigation rules

UI state construction

timing enforcement

determinism

contract compliance

This is the brain of the system

1.3 Adapter (THIN LAYER)
Responsible for:

calling orchestrator

wrapping response into API contract

1.4 Frontend
Consumes ONLY:

{
  "ok": true,
  "data": { ... governed runtime ... },
  "error": null,
  "meta": { ... }
}
2. FILE STRUCTURE (NON-NEGOTIABLE)
Create:

apps/backend/yki/
├── orchestrator.py              # CORE LOGIC
├── state_machine.py             # navigation + progression rules
├── view_builder.py              # builds current_view
├── engine_client.py             # HTTP layer to engine
├── session_registry.py          # backend session tracking
├── contracts.py                 # runtime schemas (internal)
├── errors.py                    # strict error types
❗ IMPORTANT
DO NOT overload one file.

Each file has a single responsibility.

3. CORE DATA FLOW (END-TO-END)
3.1 Start Session
Frontend → POST /yki/sessions/start
         → adapter.py
         → orchestrator.start_session()
         → engine_client.start_exam()
         → orchestrator initializes session state
         → view_builder builds first current_view
         → return governed contract
3.2 Next Action
Frontend → POST /next
         → adapter
         → orchestrator.next()
         → state_machine determines next step
         → orchestrator updates state
         → view_builder builds next view
         → return contract
3.3 Answer Submission
Frontend → POST /answer
         → adapter
         → orchestrator.submit_answer()
         → engine_client.submit_answer()
         → state_machine updates progression
         → view_builder builds next view
         → return contract
4. SESSION MODEL (BACKEND AUTHORITY)
4.1 Backend Session Object (CRITICAL)
Create internal model:

class OrchestratedSession:
    session_id: str
    engine_session_id: str
    
    # progression
    current_section: str
    current_index: int
    current_view_type: str
    
    # navigation
    next_allowed_action: str
    is_locked: bool
    
    # timing
    started_at: datetime
    section_start_time: datetime
    timing_manifest: dict
    
    # state
    answers: dict
    visited_views: list
    
    # integrity
    session_hash: str
    task_sequence_hash: str
❗ IMPORTANT
This is NOT the engine session.

This is a controlled projection of it.

5. ENGINE CLIENT (STRICT HTTP LAYER)
File:
apps/backend/yki/engine_client.py
Responsibilities:
communicate with engine

no logic

no transformation

pure I/O

Example:
class EngineClient:

    async def start_exam(self, payload):
        return await self._post("/exam/start", payload)

    async def get_session(self, session_id):
        return await self._get(f"/exam/{session_id}")

    async def submit_answer(self, session_id, payload):
        return await self._post(f"/exam/{session_id}/answer", payload)
❗ HARD RULE
NO business logic here.

6. STATE MACHINE (CORE OF CONTROL)
File:
apps/backend/yki/state_machine.py
Purpose:
Defines:

what comes next

what is allowed

what is forbidden

Example transitions:
START → READING_PASSAGE
READING_PASSAGE → READING_QUESTION
READING_QUESTION → NEXT_QUESTION
LAST_QUESTION → SECTION_COMPLETE
SECTION_COMPLETE → NEXT_SECTION
Function:
def compute_next_state(session: OrchestratedSession, action: str):
    # enforce forward-only
    # enforce no skipping
    # enforce completion rules
    return updated_session
❗ CRITICAL RULES
No backward navigation

No skipping

Deterministic progression

Fail closed if invalid action

7. VIEW BUILDER (UI CONTRACT GENERATOR)
File:
apps/backend/yki/view_builder.py
Purpose:
Convert session → frontend UI state

Output example:
{
  "current_view": {
    "type": "reading_passage",
    "content": "...",
    "audio": null
  },
  "navigation": {
    "next_allowed": true,
    "back_allowed": false
  },
  "section_progress": {
    "current": 2,
    "total": 10
  }
}
❗ THIS IS WHERE:
engine raw data becomes UI-ready

all frontend expectations are satisfied

8. ORCHESTRATOR (MAIN CONTROLLER)
File:
apps/backend/yki/orchestrator.py
This is the MOST IMPORTANT FILE
Responsibilities:
coordinates everything

owns session state

enforces rules

builds responses

Example:
class YKIOrchestrator:

    async def start_session(self, user_id):
        engine_data = await engine_client.start_exam(...)
        session = self._initialize_session(engine_data)
        view = view_builder.build(session, engine_data)
        return self._build_response(session, view)
❗ KEY RULE
Orchestrator is the ONLY place where decisions happen.

9. SESSION REGISTRY (STATE STORAGE)
File:
apps/backend/yki/session_registry.py
Purpose:
Store:

active sessions

session lookup

session lifecycle

Temporary:
in-memory dict (for now)

Later:

Redis / DB

10. ERROR SYSTEM
File:
apps/backend/yki/errors.py
Define strict errors:
class ContractViolation(Exception): pass
class InvalidTransition(Exception): pass
class EngineFailure(Exception): pass
class SessionNotFound(Exception): pass
❗ RULE
All errors must be:

explicit

typed

surfaced to client

11. INTEGRATION WITH EXISTING SYSTEM
adapter.py becomes:
adapter → orchestrator → engine_client
session_store.py
DO NOT DELETE

Instead:

gradually phase out

compare behavior

migrate logic

12. VALIDATION STRATEGY (VERY IMPORTANT)
You will validate in 3 layers:

Layer 1 — Engine only
works independently

Layer 2 — Orchestrator + Engine
correct state transitions

correct view building

Layer 3 — Full system
frontend works unchanged

⚠️ STOP POINT
This is Part 1 (architecture + structure).



🔴 YKI ORCHESTRATION LAYER — FULL SYSTEM DESIGN (PART 2)
Now we go deeper into the actual mechanics:

state machine (FULL, not abstract)

exact view types

progression rules

timing system

determinism + hashing

engine → orchestrator mapping

No skipping.

13. STATE MACHINE — FULL SPEC (NO SIMPLIFICATION)
13.1 CORE PRINCIPLE
The state machine is:

forward-only, deterministic, non-reversible, fully controlled

❗ HARD INVARIANTS
No backward navigation

No skipping

No re-answering unless explicitly allowed

Every transition must be:

valid

expected

deterministic

13.2 STATE TYPES
Define ALL possible view states:

VIEW_TYPES = [
    "intro",

    # reading
    "reading_passage",
    "reading_question",

    # listening
    "listening_instruction",
    "listening_audio",
    "listening_question",

    # writing
    "writing_instruction",
    "writing_task",

    # speaking
    "speaking_instruction",
    "speaking_recording",

    # section
    "section_transition",

    # final
    "exam_complete"
]
13.3 STATE STRUCTURE
Each state must be explicitly represented:

class State:
    view_type: str
    section: str
    index: int
    sub_index: int
13.4 FULL TRANSITION MAP
READING
intro
→ reading_passage
→ reading_question (q1)
→ reading_question (q2)
→ ...
→ section_transition
LISTENING
section_transition
→ listening_instruction
→ listening_audio
→ listening_question (q1)
→ listening_audio
→ listening_question (q2)
→ ...
→ section_transition
WRITING
section_transition
→ writing_instruction
→ writing_task
→ section_transition
SPEAKING
section_transition
→ speaking_instruction
→ speaking_recording
→ speaking_instruction
→ speaking_recording
→ ...
→ exam_complete
13.5 TRANSITION FUNCTION (STRICT)
def compute_next_state(session, action):
    
    if action not in ["next", "answer", "play_audio", "record"]:
        raise InvalidTransition()

    current = session.state

    # example:
    if current.view_type == "reading_passage":
        return State("reading_question", ...)

    if current.view_type == "reading_question":
        if not session.has_answer(current):
            raise InvalidTransition()
        return next_question_or_section()

    ...
❗ RULE
Every state transition must be:

explicitly defined

not inferred

not dynamic guesswork

14. VIEW SYSTEM — FULL DEFINITION
14.1 VIEW CONTRACT (STRICT)
Frontend expects:

{
  "current_view": {...},
  "navigation": {...},
  "section_progress": {...},
  "timing": {...}
}
14.2 VIEW TYPES (DETAILED)
1. READING PASSAGE
{
  "type": "reading_passage",
  "passage_id": "r1",
  "content": "...",
  "next_action": "next"
}
2. READING QUESTION
{
  "type": "reading_question",
  "question_id": "q1",
  "question": "...",
  "options": ["A", "B", "C"],
  "requires_answer": true
}
3. LISTENING AUDIO
{
  "type": "listening_audio",
  "audio_id": "a1",
  "play_once": true,
  "auto_advance": false
}
4. LISTENING QUESTION
{
  "type": "listening_question",
  "question_id": "lq1",
  "requires_answer": true
}
5. WRITING TASK
{
  "type": "writing_task",
  "task_id": "w1",
  "prompt": "...",
  "min_words": 80
}
6. SPEAKING RECORDING
{
  "type": "speaking_recording",
  "task_id": "s1",
  "max_duration": 60,
  "record_required": true
}
7. SECTION TRANSITION
{
  "type": "section_transition",
  "from": "reading",
  "to": "listening"
}
8. EXAM COMPLETE
{
  "type": "exam_complete",
  "summary": {...}
}
15. NAVIGATION MODEL (STRICT)
15.1 NAVIGATION OBJECT
{
  "navigation": {
    "next_allowed": true,
    "back_allowed": false,
    "action": "next"
  }
}
❗ RULES
back_allowed = ALWAYS false

next_allowed depends on:

answer submitted

audio played

recording done

Example:
if view.type == "reading_question":
    next_allowed = session.has_answer(current)
16. TIMING SYSTEM (EXAM CRITICAL)
16.1 TIMING MANIFEST
timing_manifest = {
    "reading": 60 * 60,
    "listening": 30 * 60,
    "writing": 60 * 60,
    "speaking": 20 * 60
}
16.2 SESSION TRACKING
session.section_start_time
session.global_start_time
16.3 ENFORCEMENT
if now - section_start_time > allowed_time:
    force_transition()
❗ HARD RULE
Timing must be:

backend enforced

not frontend dependent

17. ENGINE → ORCHESTRATOR MAPPING
Problem:
Engine returns:

{
  "sections": [...]
}
Orchestrator must:
Map this into:

session.structure = {
    "reading": [...],
    "listening": [...],
    "writing": [...],
    "speaking": [...]
}
Extract:
passages

questions

audio references

tasks

❗ RULE
Do NOT mutate engine data.

Only:

transform → controlled internal format

18. ANSWER TRACKING
Store:
session.answers = {
    "q1": "A",
    "q2": "B",
    "writing_1": "...",
    "speaking_1": "audio_id"
}
Validation:
must exist

must match expected format

19. DETERMINISM + HASHING
19.1 SESSION HASH
session_hash = hash(
    session_id +
    ordered_tasks +
    timestamps
)
19.2 TASK SEQUENCE HASH
task_sequence_hash = hash(
    list_of_tasks_in_order
)
❗ PURPOSE
prevent tampering

ensure reproducibility

enforce integrity

20. FAIL-CLOSED SYSTEM
If ANY of these happen:
invalid transition

missing answer

invalid engine response

timeout

THEN:
raise ContractViolation()
NEVER:
auto-fix

skip

fallback silently

⚠️ STOP POINT
Next part will include:

full orchestrator implementation structure (functions, flow)

adapter rewrite design (exact)

migration plan from session_store

safe deletion strategy

full agent prompt (strict)

🔴 YKI ORCHESTRATION LAYER — FULL SYSTEM DESIGN (PART 3)
Now we move from structure → execution-level design

This part defines:

exact orchestrator internals (functions + flow)

adapter rewrite (precise behavior)

migration from session_store

safe removal strategy

validation gates before deletion

full system execution lifecycle

No abstraction.

21. ORCHESTRATOR — FULL IMPLEMENTATION DESIGN
File
apps/backend/yki/orchestrator.py
21.1 CLASS STRUCTURE
class YKIOrchestrator:

    def __init__(self):
        self.engine = EngineClient()
        self.registry = SessionRegistry()
21.2 PUBLIC METHODS (ONLY ENTRY POINTS)
These are the ONLY methods adapter is allowed to call:

async def start_session(self, user_id, payload): ...
async def get_session(self, session_id): ...
async def next(self, session_id): ...
async def submit_answer(self, session_id, payload): ...
async def play_audio(self, session_id, payload): ...
async def submit_recording(self, session_id, payload): ...
❗ RULE
No other module may mutate session state.

21.3 START SESSION — FULL FLOW
async def start_session(self, user_id, payload):

    # 1. call engine
    engine_response = await self.engine.start_exam(payload)

    # 2. validate engine response
    self._validate_engine_response(engine_response)

    # 3. build internal session
    session = self._initialize_session(engine_response)

    # 4. register session
    self.registry.save(session)

    # 5. build first view
    view = build_view(session, engine_response)

    # 6. return governed response
    return self._build_response(session, view)
21.4 INITIALIZE SESSION
def _initialize_session(self, engine_data):

    return OrchestratedSession(
        session_id=uuid4(),
        engine_session_id=engine_data["session_id"],

        current_section="reading",
        current_index=0,
        current_view_type="intro",

        answers={},
        visited_views=[],

        started_at=now(),
        section_start_time=now(),

        timing_manifest=DEFAULT_TIMING,

        session_hash=compute_session_hash(...),
        task_sequence_hash=compute_sequence_hash(...)
    )
❗ CRITICAL
Engine session ID must ALWAYS be stored.

21.5 NEXT ACTION — FULL FLOW
async def next(self, session_id):

    session = self.registry.get(session_id)

    if not session:
        raise SessionNotFound()

    # 1. enforce timing
    self._enforce_timing(session)

    # 2. compute next state
    new_state = compute_next_state(session, "next")

    # 3. update session
    session.state = new_state

    # 4. fetch latest engine state if needed
    engine_data = await self.engine.get_session(session.engine_session_id)

    # 5. build view
    view = build_view(session, engine_data)

    # 6. persist
    self.registry.save(session)

    return self._build_response(session, view)
21.6 SUBMIT ANSWER — FULL FLOW
async def submit_answer(self, session_id, payload):

    session = self.registry.get(session_id)

    if not session:
        raise SessionNotFound()

    # 1. validate answer
    self._validate_answer(session, payload)

    # 2. send to engine
    await self.engine.submit_answer(
        session.engine_session_id,
        payload
    )

    # 3. store locally
    session.answers[payload["question_id"]] = payload["answer"]

    # 4. compute next state
    new_state = compute_next_state(session, "answer")

    session.state = new_state

    # 5. fetch engine
    engine_data = await self.engine.get_session(session.engine_session_id)

    # 6. build view
    view = build_view(session, engine_data)

    self.registry.save(session)

    return self._build_response(session, view)
21.7 AUDIO FLOW
async def play_audio(self, session_id, payload):

    session = self.registry.get(session_id)

    if session.state.view_type != "listening_audio":
        raise InvalidTransition()

    # mark played
    session.audio_played = True

    return {"ok": True}
❗ RULE
Audio enforcement is backend-controlled.

21.8 RECORDING FLOW
async def submit_recording(self, session_id, payload):

    session = self.registry.get(session_id)

    if session.state.view_type != "speaking_recording":
        raise InvalidTransition()

    session.answers[payload["task_id"]] = payload["audio_id"]

    return self._build_response(...)
22. RESPONSE BUILDER (STRICT)
Function
def _build_response(self, session, view):
    return {
        "ok": True,
        "data": {
            "current_view": view,
            "navigation": build_navigation(session),
            "section_progress": build_progress(session),
            "timing": build_timing(session)
        },
        "error": None,
        "meta": {
            "session_hash": session.session_hash
        }
    }
23. ADAPTER REWRITE (EXACT BEHAVIOR)
File
apps/backend/yki/adapter.py
FINAL STRUCTURE
orchestrator = YKIOrchestrator()

async def start_session(...):
    return await orchestrator.start_session(...)

async def next(...):
    return await orchestrator.next(...)

async def answer(...):
    return await orchestrator.submit_answer(...)
❗ RULE
Adapter contains:

ZERO logic

ZERO state

ZERO transformation

24. MIGRATION FROM session_store (CRITICAL)
Current situation
adapter → session_store → local logic
Target
adapter → orchestrator → engine
STRATEGY (SAFE MIGRATION)
STEP 1 — INTRODUCE ORCHESTRATOR (NO REMOVAL)
keep session_store intact

add orchestrator alongside

STEP 2 — ROUTE TRAFFIC
Switch:

adapter → orchestrator
STEP 3 — VERIFY
run full flows

confirm frontend works

STEP 4 — DETECT UNUSED CODE
Search:

grep -r "session_store" apps/backend
STEP 5 — MARK UNUSED
List:

unused functions

unused modules

STEP 6 — REMOVE GRADUALLY
Delete only:

confirmed unused

no imports

no test dependency

❗ NEVER:
delete in bulk

assume unused

25. SAFE DELETION PROTOCOL
For EACH file:

Step 1
Search usage:

grep -r "filename" .
Step 2
Check:

imports

runtime references

tests

Step 3
If zero references:

→ safe to delete

Step 4
Commit deletion separately

26. VALIDATION BEFORE DELETION
MUST PASS:
Backend tests
pytest
API tests
start session

next

answer

Frontend
full YKI exam flow

❗ IF ANY FAILS:
→ STOP deletion

27. FINAL SYSTEM STATE (TARGET)
Frontend
   ↓
Adapter
   ↓
Orchestrator
   ↓
Engine Client
   ↓
External Engine
session_store:
removed OR

reduced to minimal utilities

28. SYSTEM GUARANTEES AFTER COMPLETION
✔ deterministic
✔ backend-controlled
✔ engine-integrated
✔ contract-safe
✔ no duplicate logic
✔ no legacy confusion

⚠️ STOP POINT
Next (final part):

full strict agent prompt (production-grade)

no ambiguity

includes enforcement rules, rollback, validation gates


---------------------------------------------------------------------------------------------


# AGENT PROMPT — YKI ORCHESTRATOR IMPLEMENTATION + ENGINE INTEGRATION (STRICT MODE)

---

# ROLE

You are a **senior backend systems engineer agent**.

You are implementing a **deterministic orchestration layer** that:

* connects the app backend to the external YKI engine
* preserves frontend contract exactly
* replaces local runtime logic safely
* removes legacy code only when proven unused

You MUST follow instructions exactly.

---

# GLOBAL RULES (NON-NEGOTIABLE)

### Architecture

1. Backend becomes:
   → orchestrator (state machine + contract builder)
2. Engine becomes:
   → data provider only
3. Frontend:
   → MUST NOT CHANGE

---

### Safety

4. ❌ DO NOT modify frontend
5. ❌ DO NOT modify engine
6. ❌ DO NOT change API response shape
7. ❌ DO NOT delete anything unless proven unused
8. ❌ DO NOT partially integrate

---

### Behavior

9. ✅ FAIL CLOSED on all errors
10. ✅ ALL transitions must be deterministic
11. ✅ NO silent fallback
12. ✅ NO duplicate runtime logic after migration

---

# OBJECTIVE

Transform system from:

adapter → session_store → local runtime

TO:

adapter → orchestrator → engine_client → external engine

---

# STEP 1 — CREATE NEW MODULES

Create EXACTLY these files:

```
apps/backend/yki/orchestrator.py
apps/backend/yki/state_machine.py
apps/backend/yki/view_builder.py
apps/backend/yki/engine_client.py
apps/backend/yki/session_registry.py
apps/backend/yki/contracts.py
apps/backend/yki/errors.py
```

---

# STEP 2 — ENGINE CLIENT (NO LOGIC)

File: engine_client.py

Implement:

* Async HTTP client using httpx
* Base URL from env: YKI_ENGINE_BASE_URL
* Methods:

```
start_exam()
get_session()
submit_answer()
```

Rules:

* NO transformation
* NO business logic
* raise EngineFailure on error

---

# STEP 3 — SESSION REGISTRY

File: session_registry.py

Implement:

```
class SessionRegistry:
    def save(session)
    def get(session_id)
    def delete(session_id)
```

Use:

* in-memory dict

Rules:

* no side effects
* no logic

---

# STEP 4 — ERROR SYSTEM

File: errors.py

Define:

```
ContractViolation
InvalidTransition
EngineFailure
SessionNotFound
```

Rules:

* MUST be used everywhere
* NO generic Exception

---

# STEP 5 — STATE MACHINE (STRICT)

File: state_machine.py

Implement:

```
compute_next_state(session, action)
```

Rules:

* forward-only
* no skipping
* must validate:

  * answer required
  * audio played
  * recording completed

Transitions must cover:

* reading
* listening
* writing
* speaking
* section transitions
* exam complete

INVALID transition → raise InvalidTransition

---

# STEP 6 — VIEW BUILDER

File: view_builder.py

Implement:

```
build_view(session, engine_data)
build_navigation(session)
build_progress(session)
build_timing(session)
```

Rules:

* MUST match frontend expectations
* MUST include:

  * current_view
  * navigation
  * section_progress
  * timing

NO missing fields allowed

---

# STEP 7 — ORCHESTRATOR (CORE)

File: orchestrator.py

Implement class:

```
class YKIOrchestrator
```

---

## REQUIRED METHODS

```
start_session()
get_session()
next()
submit_answer()
play_audio()
submit_recording()
```

---

## RESPONSIBILITIES

* call engine via engine_client
* build and store session
* enforce state transitions
* enforce timing
* build views
* return governed response

---

## RULES

* ALL logic here
* adapter must remain thin
* must store:

  * engine_session_id
  * answers
  * state
  * timing
  * hashes

---

# STEP 8 — RESPONSE CONTRACT

ALL responses MUST be:

```
{
  "ok": true | false,
  "data": {...},
  "error": {...} | null,
  "meta": {...}
}
```

Violation → raise ContractViolation

---

# STEP 9 — ADAPTER REWRITE

File: apps/backend/yki/adapter.py

Replace ALL logic with:

```
orchestrator = YKIOrchestrator()

start → orchestrator.start_session
next → orchestrator.next
answer → orchestrator.submit_answer
```

Rules:

* ZERO logic in adapter
* ZERO transformation

---

# STEP 10 — KEEP session_store (TEMPORARY)

DO NOT DELETE yet.

Reason:

* may still be used by tests or other modules

---

# STEP 11 — VALIDATION (MANDATORY)

Run:

### Backend

* start session
* next
* answer
* audio
* recording

### Frontend

* full YKI exam flow

### Engine

* verify calls are actually made

---

## VERIFY

* NO local runtime execution path remains
* ALL flows go through engine_client

---

# STEP 12 — LEGACY DETECTION

Search:

```
grep -r "session_store" apps/backend
```

For EACH usage:

* classify:

  * used
  * unused

---

# STEP 13 — SAFE DELETION

For EACH file:

ONLY delete if:

* no imports
* no runtime references
* no test dependency

---

## BEFORE deletion

Produce list:

```
file
reason safe
proof (no references)
```

---

## THEN delete

Commit separately

---

# STEP 14 — FAILURE TESTING

Simulate:

* engine down
* timeout
* invalid response

System MUST:

* fail closed
* return structured error
* NOT fallback to local logic

---

# STEP 15 — FINAL VALIDATION

System must satisfy:

* frontend unchanged
* deterministic behavior
* no legacy execution path
* engine fully integrated
* no unused code remains (safe)

---

# OUTPUT REPORT (REQUIRED)

You MUST produce:

---

## 1. Files created

## 2. Files modified

## 3. Files deleted (with proof)

## 4. Orchestrator implementation summary

## 5. Validation results

## 6. Remaining risks (if any)

## 7. FINAL VERDICT:

* READY FOR VALIDATION
  or
* BLOCKED (reason)

---

# HARD STOP CONDITIONS

If ANY of these occur:

* frontend breaks
* contract mismatch
* partial integration
* unsafe deletion risk
* engine not fully used

→ STOP and report BLOCKED

---

# SUCCESS CRITERIA

You are done ONLY when:

* backend uses orchestrator ONLY
* engine is fully in request path
* frontend unchanged
* session_store not in execution path
* system ready for real-device validation phase

---

# FINAL INSTRUCTION

This is a **surgical system transformation**.

Do not rush.
Do not assume.
Do not delete prematurely.

Every change must be:

* verified
* justified
* reversible

Proceed.

























































