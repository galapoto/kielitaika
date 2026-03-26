# PHASE 3.1 — API AGENT

Mode: FAIL-CLOSED  
Role: Backend Contract Implementer  

---

## 1. INPUT

Read:

- docs/contracts/system_orchestration_contract.md
- docs/contracts/api_contract.md
- docs/contracts/session_contract.md

---

## 2. OBJECTIVE

Implement ALL backend endpoints exactly as defined.

You are NOT designing APIs.
You are implementing a frozen contract.

---

## 3. REQUIRED IMPLEMENTATION

You must implement:

### Auth
- POST /api/v1/auth/register/password
- POST /api/v1/auth/login/password
- POST /api/v1/auth/login/provider
- GET /api/v1/auth/session
- POST /api/v1/auth/token/refresh

### Subscription
- GET /api/v1/subscription/status

### Cards
- POST /api/v1/cards/session/start
- GET /api/v1/cards/session/adaptive/start
- GET /api/v1/cards/session/{session_id}/next
- POST /api/v1/cards/session/{session_id}/answer

### Roleplay
- POST /api/v1/roleplay/sessions
- POST /api/v1/roleplay/sessions/{session_id}/turns
- GET /api/v1/roleplay/sessions/{session_id}
- GET /api/v1/roleplay/sessions/{session_id}/transcript
- GET /api/v1/roleplay/sessions/{session_id}/review

### Voice
- POST /api/v1/voice/stt/transcriptions
- WS /api/v1/ws/voice/stt-stream
- POST /api/v1/voice/tts/requests
- WS /api/v1/ws/voice/tts-stream
- POST /api/v1/voice/pronunciation/analyze

### YKI Adapter
- POST /api/v1/yki/sessions
- GET /api/v1/yki/sessions/{session_id}
- POST /api/v1/yki/sessions/{session_id}/answers
- POST /api/v1/yki/sessions/{session_id}/writing
- POST /api/v1/yki/sessions/{session_id}/audio
- POST /api/v1/yki/sessions/{session_id}/speaking/conversation
- POST /api/v1/yki/sessions/{session_id}/speaking/turns
- POST /api/v1/yki/sessions/{session_id}/speaking/reply
- POST /api/v1/yki/sessions/{session_id}/submit
- GET /api/v1/yki/sessions/{session_id}/certificate

---

## 4. RULES

- Do NOT change request/response shapes
- Do NOT rename endpoints
- Do NOT add fields
- Do NOT remove fields
- Do NOT invent fallback behavior

---

## 5. ERROR HANDLING

Must follow:

- retryable / non-retryable / terminal classification
- include retry metadata in responses
- enforce session reuse rules

---

## 6. FAILURE CONDITIONS

FAIL if:

- any endpoint deviates from contract
- any response shape is inconsistent
- retry logic is not enforced
- session rules are violated
