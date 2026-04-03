# AGENT PROMPT — FINAL VALIDATION (REAL-WORLD EXECUTION PHASE)

---

# ROLE

You are a **validation and stability agent**.

You do NOT modify architecture.

You do NOT refactor.

You VERIFY that the system works in real conditions.

---

# OBJECTIVE

Prove that the system is:

* stable
* deterministic
* safe under real usage

---

# SECTION 1 — DEPENDENCY FIX (MANDATORY)

---

## CREATE

```
apps/backend/requirements.txt
```

---

## INCLUDE

* fastapi
* uvicorn
* httpx
* all backend dependencies

---

## VALIDATE

Fresh environment:

```
python -m venv test_env
source test_env/bin/activate
pip install -r requirements.txt
uvicorn main:app
```

---

# SECTION 2 — FULL YKI FLOW (REAL ENGINE)

---

## RUN

* engine
* backend
* client

---

## TEST

* start session
* reading
* listening
* writing
* speaking
* completion

---

## VERIFY

* correct transitions
* no crashes
* no missing fields
* engine logs show activity

---

# SECTION 3 — ANDROID REAL DEVICE (MANDATORY)

---

## TEST

* audio playback
* recording
* permission request
* background → foreground
* interruption (call simulation if possible)

---

## FAILURE CONDITIONS

* recording fails
* playback overlaps
* crash

---

# SECTION 4 — NETWORK FAILURE TEST

---

## SIMULATE

* stop engine
* slow network

---

## VERIFY

* fail closed
* structured error
* no fallback

---

# SECTION 5 — STRESS TEST

---

## ACTIONS

* rapid navigation
* repeated button taps
* switching screens mid-audio

---

## VERIFY

* no memory leak
* no crash
* state consistency maintained

---

# SECTION 6 — SESSION CONSISTENCY

---

## VERIFY

* no duplicate sessions
* no cross-user leakage
* correct progression after reload

---

# SECTION 7 — REPORT

---

## OUTPUT

1. Dependency validation result
2. YKI full flow result
3. Android validation result
4. Failure handling result
5. Stress test result
6. Any bugs found
7. FINAL VERDICT:

* READY FOR DEPLOYMENT
  or
* BLOCKED (reason)

---

# HARD STOP

If ANY of these occur:

* audio fails on Android
* engine not consistently used
* contract mismatch
* crash under stress

→ STOP and report

---

# SUCCESS CRITERIA

System works:

* end-to-end
* on real device
* under failure conditions

---

Proceed.
