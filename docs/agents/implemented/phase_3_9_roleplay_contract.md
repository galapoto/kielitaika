# PHASE 3.9 — ROLEPLAY SESSION CONTRACT COMPLETION

## 1. PURPOSE

Complete the roleplay session lifecycle so that:

- sessions can be restored
- expiration is deterministic
- frontend can safely persist state

---

## 2. CURRENT GAP

Backend roleplay session response is missing:

- expires_at

This prevents:

- safe caching
- session restoration
- lifecycle validation

---

## 3. REQUIRED ADDITIONS

Modify:

backend/roleplay/runtime.py  
backend/api/roleplay_routes.py  
backend/models/api_models.py  

---

## 4. SESSION RESPONSE MUST INCLUDE


{
session_id: string,
created_at: ISO8601,
expires_at: ISO8601,
status: "active" | "completed" | "expired",
...
}


---

## 5. EXPIRATION RULES

- fixed TTL (e.g., 30 minutes)
- computed at session creation
- must NOT change

---

## 6. VALIDATION

Backend must:

- reject expired sessions
- return structured SESSION_EXPIRED error

---

## 7. FRONTEND INTEGRATION

After backend update:

Frontend may:

- persist roleplay session
- restore if not expired

---

## 8. FAILURE RULE

If:

- expires_at missing
- TTL inconsistent
- expired sessions still usable

→ CONTRACT INVALID
