# AGENT PROMPT — FINAL SYSTEM FIX + FULL FORENSIC AUDIT (ANDROID INCLUDED)

---

# ROLE

You are a **senior backend + runtime validation agent** operating in **strict enforcement mode**.

You are responsible for:

1. Fixing all known runtime defects
2. Verifying real engine correctness
3. Validating Android behavior
4. Running a full forensic audit of the entire system
5. Producing and saving a final audit report

---

# NON-NEGOTIABLE RULES

DO NOT:

❌ modify frontend contract
❌ modify external engine
❌ introduce fallback logic
❌ ignore errors from engine
❌ delete files without proof

DO:

✅ fix orchestrator → engine contract mismatches
✅ validate on real Android device
✅ ensure fail-closed behavior
✅ log and verify real runtime behavior
✅ produce full audit report

---

# PRIMARY OBJECTIVE

Bring system to:

✔ fully working YKI flow (including listening)
✔ verified Android audio + recording
✔ zero hidden failures
✔ stable multi-engine runtime
✔ audit-complete state

---

# SECTION 1 — FIX ENGINE 400 (CRITICAL)

---

## PROBLEM

Listening answer causes:

* backend: ENGINE_ERROR
* engine: 400 Bad Request

---

## TASK

### 1. Instrument engine request

File:

```id="k1qj9c"
apps/backend/yki/engine_client.py
```

Inside `submit_answer()`:

* log FULL payload sent to engine
* log FULL engine response body on error

---

### 2. Capture real failing case

Run:

* start session
* reach listening task
* submit answer

Record:

* payload sent
* engine response

---

### 3. Identify schema mismatch

Compare:

* working reading answer payload
* failing listening payload

---

### 4. Fix orchestrator mapping

File:

```id="f4p8sj"
apps/backend/yki/orchestrator.py
```

Fix:

```id="1l6e8h"
submit_answer()
```

---

## REQUIREMENTS

Payload MUST include:

✔ correct field names
✔ correct task identifier (task_id/item_id)
✔ correct answer format (string/object depending on task)
✔ no missing required fields
✔ no extra fields

---

## VALIDATION

Listening answer must:

✔ return 200
✔ advance session
✔ match engine behavior

---

# SECTION 2 — FULL YKI FLOW VALIDATION

---

## RUN COMPLETE FLOW

* start
* reading
* listening
* writing
* speaking
* completion

---

## VERIFY

✔ no crashes
✔ correct transitions
✔ no missing fields
✔ engine logs show requests

---

# SECTION 3 — ANDROID REAL DEVICE VALIDATION

---

## SETUP

Verify:

```id="o0r2lm"
adb devices
```

Must show connected device.

---

## TEST ON DEVICE

### AUDIO

* play prompt
* stop playback
* replay

✔ no overlapping audio
✔ correct playback

---

### RECORDING

* start recording
* stop recording
* submit

✔ no crash
✔ correct lifecycle

---

### PERMISSIONS

* microphone permission prompt
  ✔ handled correctly

---

### BACKGROUND / FOREGROUND

* switch apps during recording/playback

✔ no crash
✔ correct cleanup

---

# SECTION 4 — FAILURE INJECTION

---

## ENGINE DOWN

* stop engine
* start session

✔ returns ENGINE_UNAVAILABLE
✔ no crash

---

## TIMEOUT

simulate slow engine

✔ fail closed
✔ structured error

---

## INVALID RESPONSE

mock bad engine payload

✔ CONTRACT VIOLATION raised

---

# SECTION 5 — MULTI-ENGINE AUDIT

---

## VERIFY ALL SYSTEMS

### YKI engine

### Speaking engine

### Daily practice

### Learning system

---

## FOR EACH

✔ start
✔ progress
✔ completion
✔ no crash

---

# SECTION 6 — AUDIO FORENSIC CHECK

---

## VERIFY

* single playback enforcement
* recording cleanup
* no memory leaks

---

## STRESS

* rapid play/stop
* rapid navigation

---

# SECTION 7 — STATE CONSISTENCY

---

## VERIFY

* no duplicate sessions
* no state leakage
* correct progression after reload

---

# SECTION 8 — CODEBASE FORENSIC SCAN

---

## SEARCH

```id="s5q7q3"
session_store
window
document
navigator
localStorage
setInterval
setTimeout
```

---

## CLASSIFY RESULTS

* runtime usage
* test usage
* safe usage

---

## REQUIREMENTS

✔ no legacy YKI execution path
✔ no browser API in runtime
✔ timers controlled

---

# SECTION 9 — SAFE LEGACY REVIEW

---

## TARGET

```id="2e7f7k"
apps/backend/yki/session_store.py
```

---

## CHECK

Is it used in:

* YKI runtime? → MUST NOT
* other modules? → allowed

---

## DO NOT DELETE unless:

✔ zero runtime references
✔ zero required dependencies

---

# SECTION 10 — TEST MATRIX

---

## RUN

```id="c4s8s9"
python3 -m unittest discover -s apps/backend/tests
npm run controlled_ui_contract_validation
tsc --noEmit
```

---

## ALSO VERIFY

✔ backend live run
✔ engine live run
✔ android device

---

# SECTION 11 — AUDIT REPORT (MANDATORY)

---

## CREATE FILE

```id="j2l9w0"
docs/audit/final_system_forensic_audit_<DATE>.md
```

---

## CONTENT STRUCTURE

---

### 1. Summary

* system state
* key fixes applied

---

### 2. Files modified

---

### 3. Engine fix details

* root cause
* payload mismatch
* fix applied

---

### 4. YKI flow validation

* reading
* listening
* writing
* speaking

---

### 5. Android validation

* audio
* recording
* permissions

---

### 6. Failure testing

* engine down
* timeout
* invalid response

---

### 7. Multi-engine validation

* speaking
* practice
* learning

---

### 8. State consistency

---

### 9. Audio forensic results

---

### 10. Codebase scan results

---

### 11. Remaining risks

---

### 12. FINAL VERDICT

ONE OF:

✔ READY FOR DEPLOYMENT
❌ BLOCKED (with exact reason)

---

# HARD STOP CONDITIONS

STOP if:

* listening still fails
* engine not fully used
* android audio fails
* crash occurs
* contract mismatch

---

# SUCCESS CRITERIA

You are done ONLY when:

✔ listening fixed
✔ full flow works
✔ android validated
✔ no hidden failures
✔ audit report generated

---

# FINAL INSTRUCTION

This is the **last enforcement pass**.

No assumptions.
No shortcuts.
Everything must be proven in real execution.

Proceed.
