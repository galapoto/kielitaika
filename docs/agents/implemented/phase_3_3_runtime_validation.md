# PHASE 3.3 — BACKEND RUNTIME VALIDATION (MANDATORY BEFORE FRONTEND)

## 1. PURPOSE

Validate that the backend:

- Starts successfully
- Registers all routes
- Executes without runtime errors
- Respects all contracts

This is NOT optional.

---

## 2. PRE-CONDITION

Step 3.2 restructuring must be complete.

---

## 3. ENVIRONMENT SETUP

Install required dependencies:

```bash
pip install fastapi uvicorn python-multipart
``` id="env1"

---

## 4. START SERVER

```bash
uvicorn backend.main:app --reload
``` id="run1"

---

## 5. REQUIRED VALIDATIONS

### 5.1 SERVER START

Must confirm:

- No import errors
- No circular dependency crash
- App boots cleanly

---

### 5.2 ROUTE REGISTRATION

Check:
http://127.0.0.1:8000/docs


Verify ALL endpoints exist:

- /auth/*
- /cards/*
- /roleplay/*
- /voice/*
- /yki/*
- /subscription/*

---

### 5.3 AUTH FLOW

Test:

- Register
- Login
- Get session

---

### 5.4 CARDS FLOW

Test:

- Start session
- Fetch next card
- Submit answer

---

### 5.5 ROLEPLAY FLOW

Test:

- Create session
- Submit turn
- Get transcript

---

### 5.6 VOICE FLOW

Test:

- Upload audio
- Confirm audio_ref created
- Confirm response structure

---

### 5.7 YKI FLOW (CRITICAL)

Test:

- Start exam session
- Fetch runtime
- Submit answer

---

### 5.8 ERROR HANDLING

Force errors:

- Missing auth → 401
- Invalid payload → 400

Must return:

- error.code
- error.retryable

---

## 6. VALIDATION OUTPUT

Agent must produce:

### 6.1 STARTUP RESULT

- SUCCESS / FAILURE
- Full error logs if failure

---

### 6.2 ROUTE COVERAGE

List all detected endpoints

---

### 6.3 FLOW RESULTS

For each system:

- auth
- cards
- roleplay
- voice
- yki

→ PASS / FAIL

---

### 6.4 CONTRACT CHECK

Confirm:

- success_payload shape preserved
- error_payload shape preserved

---

## 7. FAILURE CONDITIONS

If ANY fails:

- Server crash
- Missing route
- Broken flow
- Contract mismatch

→ STOP  
→ FIX BEFORE CONTINUING

---

## 8. STRICT RULE

Frontend MUST NOT start until:

> Backend runtime is fully validated
