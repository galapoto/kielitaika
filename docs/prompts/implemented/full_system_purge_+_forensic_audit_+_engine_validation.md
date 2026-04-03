# AGENT PROMPT — FULL SYSTEM FORENSIC AUDIT + LEGACY PURGE + ENGINE VERIFICATION (STRICT MODE)

---

# ROLE

You are a **forensic system audit and enforcement agent**.

You are not building features.

You are not improving UX.

You are not refactoring for elegance.

You are performing a **clinical, system-wide audit and surgical correction** of:

* backend execution paths
* engine integrations
* runtime safety
* architectural integrity

---

# PRIMARY OBJECTIVE

Bring the system to a state where:

✔ ONLY the orchestrator-backed engine is used for YKI
✔ ALL legacy runtime paths are removed or isolated
✔ ALL engines (YKI, speaking, practice, learning) are verified operational
✔ NO hidden failure paths exist
✔ SYSTEM IS FAIL-CLOSED, NOT FAIL-OPEN

---

# HARD CONSTRAINTS (NON-NEGOTIABLE)

DO NOT:

❌ modify frontend behavior
❌ modify external engine
❌ change API contract shape
❌ introduce fallback logic
❌ delete anything without proof of non-usage

DO:

✅ enforce single execution path
✅ remove dead code safely
✅ validate all engines
✅ surface ALL risks

---

# SECTION 1 — CRITICAL FIX (ADAPTER PURGE)

---

## TARGET FILE

```
apps/backend/yki/adapter.py
```

---

## REQUIRED STATE

Adapter MUST:

* call ONLY orchestrator
* contain ZERO legacy logic
* contain ZERO session_store usage

---

## REQUIRED ACTIONS

### 1. REMOVE ALL LEGACY IMPORTS

Delete:

```
from yki.session_store import *
from yki.session_store import create_session
from yki.session_store import get_governed_exam_session
```

---

### 2. REMOVE ALL LEGACY CALLS

Search and REMOVE:

```
legacy_create_session
get_governed_exam_session
advance_session
submit_answer (legacy)
```

---

### 3. ENFORCE CLEAN ENTRYPOINT

Adapter must look like:

```
orchestrator = YKIOrchestrator()

start → orchestrator.start_session
next → orchestrator.next
answer → orchestrator.submit_answer
audio → orchestrator.play_audio
recording → orchestrator.submit_recording
```

---

## VALIDATION

Run:

```
grep -r "session_store" apps/backend/yki
```

EXPECTED:

→ NO runtime usage inside adapter

---

# SECTION 2 — EXECUTION PATH VERIFICATION

---

## OBJECTIVE

Ensure NO legacy runtime executes anywhere in YKI flow.

---

## ACTIONS

Run:

```
grep -r "create_session(" apps/backend
grep -r "get_governed_exam_session" apps/backend
grep -r "advance_session" apps/backend
```

---

## CLASSIFY EACH RESULT

For EACH occurrence:

* USED IN YKI FLOW → ❌ MUST REMOVE
* USED IN OTHER SYSTEM → isolate
* USED IN TEST → allowed

---

## RULE

YKI flow MUST NOT call:

```
apps/backend/yki/session_store.py
```

---

# SECTION 3 — ENGINE PATH VERIFICATION

---

## OBJECTIVE

Ensure ALL YKI requests hit external engine.

---

## ACTIONS

### Start engine

```
./run_engine.sh
```

### Start backend

```
uvicorn main:app --reload
```

---

## TEST FLOW

```
POST /api/v1/yki/sessions/start
GET session
POST answer
POST next
```

---

## REQUIRED OBSERVATION

In engine logs:

✔ requests visible
✔ endpoints hit

---

## FAILURE CONDITION

If NO engine activity:

→ integration is broken → STOP

---

# SECTION 4 — MULTI-ENGINE AUDIT

---

## ENGINES TO VERIFY

1. YKI (external engine)
2. Speaking engine (internal deterministic)
3. Daily practice engine
4. Learning system

---

## FOR EACH ENGINE

You MUST verify:

### 1. Start session

### 2. Progress flow

### 3. Completion

### 4. Error handling

---

## CHECK:

* no crash
* correct response structure
* no silent fallback
* deterministic output

---

# SECTION 5 — AUDIO + RECORDING FORENSIC CHECK

---

## VERIFY

* playback stops previous audio
* recording lifecycle correct
* no memory leaks
* no parallel playback

---

## SIMULATE

* rapid play
* rapid stop
* navigation during playback

---

## FAILURE CONDITIONS

* overlapping audio
* recording stuck
* crash

---

# SECTION 6 — FAILURE INJECTION

---

## SIMULATE:

### ENGINE DOWN

Stop engine → run YKI start

EXPECTED:

✔ fail closed
✔ structured error

---

### NETWORK FAILURE

Simulate timeout

EXPECTED:

✔ no fallback
✔ explicit failure

---

### INVALID RESPONSE

Mock bad engine response

EXPECTED:

✔ contract violation raised

---

# SECTION 7 — STORAGE + STATE CONSISTENCY

---

## VERIFY

* session registry consistency
* no stale sessions
* no duplicate session IDs
* no cross-session leakage

---

# SECTION 8 — TIMER + LIFECYCLE AUDIT

---

Search:

```
setInterval
setTimeout
```

---

## REQUIREMENTS

✔ all cleaned up
✔ no orphan timers
✔ no background leaks

---

# SECTION 9 — PLATFORM SAFETY

---

Search:

```
window
document
navigator
localStorage
```

---

## RESULT

✔ ZERO usage in runtime code

---

# SECTION 10 — LEGACY PURGE (STRICT)

---

## TARGET

ONLY after verification:

```
apps/backend/yki/session_store.py
```

---

## DELETE ONLY IF:

✔ no runtime references
✔ not used in adapter
✔ not used in production path

---

## BEFORE DELETE

Produce:

```
file
why safe
proof
```

---

# SECTION 11 — TEST MATRIX

---

## MUST RUN

```
python3 -m unittest discover -s apps/backend/tests
tsc --noEmit
npm run controlled_ui_contract_validation
```

---

## MUST ALSO RUN

✔ real backend
✔ real engine
✔ real client

---

# SECTION 12 — FORENSIC REPORT

---

You MUST produce:

---

## 1. Files modified

## 2. Files deleted (with proof)

## 3. Execution path verification

* confirmed orchestrator-only path
* confirmed no legacy runtime

## 4. Engine verification

* YKI engine used
* logs evidence

## 5. Multi-engine validation results

* speaking
* practice
* learning

## 6. Failure testing results

* engine down
* timeout
* invalid response

## 7. Audio + recording audit

## 8. State consistency audit

## 9. Platform safety audit

## 10. Remaining risks

## 11. FINAL VERDICT

ONE OF:

✔ READY FOR FULL VALIDATION
❌ BLOCKED (with exact reason)

---

# HARD STOP CONDITIONS

STOP immediately if:

* adapter still uses session_store
* engine not in execution path
* contract mismatch
* runtime crash
* unsafe deletion risk

---

# SUCCESS CRITERIA

You are done ONLY when:

✔ YKI fully engine-driven
✔ no legacy execution path
✔ all engines working
✔ no hidden failures
✔ system stable under stress

---

# FINAL INSTRUCTION

This is NOT a cleanup.

This is a **forensic enforcement pass**.

Assume the system is guilty until proven correct.

Proceed with precision.
