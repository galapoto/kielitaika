
# PHASE 3.4 — STRESS, CONCURRENCY, AND EDGE CASE VALIDATION

## 1. PURPOSE

Validate backend behavior under:

- concurrency
- session reuse
- websocket flows
- partial failures

This phase removes hidden instability.

---

## 2. WEBSOCKET VALIDATION

### 2.1 CONNECT

Test:

/api/v1/ws/voice/stt-stream  
/api/v1/ws/voice/tts-stream

---

### 2.2 AUTH FAILURE

- connect without token → must close with error

---

### 2.3 EXPECTED FAILURE BEHAVIOR

Since STT/TTS not configured:

- must return structured error
- must NOT crash
- must close cleanly

---

## 3. CONCURRENCY TESTS

### 3.1 CARDS

- Start 3 sessions in parallel
- Answer simultaneously

Must verify:

- sessions isolated
- no overwrite

---

### 3.2 ROLEPLAY

- parallel sessions
- multiple turns rapidly

---

### 3.3 YKI

- 2 exam sessions concurrently

Must verify:

- no session collision
- correct engine routing

---

## 4. SESSION RECOVERY

### 4.1 REFRESH TOKEN

- login → expire access → refresh
- session must remain valid

---

### 4.2 SESSION REUSE

- reuse session_id after delay
- must still resolve correctly

---

## 5. FAILURE INJECTION

### 5.1 ENGINE DOWN

Stop YKI engine:

→ call /yki/sessions

Must:

- return controlled error
- not crash API

---

### 5.2 INVALID AUDIO REF

- send wrong audio_ref

Must:

- return validation error
- not break session

---

## 6. STATE INTEGRITY

Inspect:

backend/runtime/state.json

Verify:

- no corruption
- no duplicate keys
- sessions properly scoped

---

## 7. VALIDATION OUTPUT

Agent must provide:

### 7.1 WEBSOCKET RESULT

PASS / FAIL

---

### 7.2 CONCURRENCY RESULT

Per system:

- cards
- roleplay
- yki

---

### 7.3 SESSION RESULT

- refresh
- reuse

---

### 7.4 FAILURE HANDLING

- engine down
- invalid input

---

## 8. FAILURE RULE

ANY inconsistency:

→ STOP  
→ FIX BEFORE FRONTEND
