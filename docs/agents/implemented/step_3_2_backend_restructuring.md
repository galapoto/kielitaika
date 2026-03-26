# STEP 3.2 — BACKEND RESTRUCTURING (STRICT, NON-DESTRUCTIVE)

## 1. OBJECTIVE

Restructure the backend into the **mandatory system structure** defined in:
docs/rules/system_structure_rule.md


WITHOUT:

- Changing logic
- Changing contracts
- Changing API behavior
- Adding features
- Removing features

This is a **pure structural refactor**.

---

## 2. CURRENT STATE (SOURCE OF TRUTH)

The backend currently contains flat files:

- api.py
- services.py
- core.py
- http.py
- main.py
- __init__.py

These files are VALID in behavior but INVALID in structure.

---

## 3. TARGET STRUCTURE (MANDATORY)

All backend code must be reorganized into:
backend/
api/
services/
core/
models/
adapters/
voice/
yki/
roleplay/
cards/
middleware/
runtime/
main.py
init.py


---

## 4. RESTRUCTURING RULES (HARD)

### 4.1 ZERO LOGIC CHANGE

- No function modification
- No renaming of functions unless required for import resolution
- No behavioral changes

---

### 4.2 SPLIT BY RESPONSIBILITY

#### api.py → backend/api/

Split into domain routers:
backend/api/
auth_routes.py
cards_routes.py
roleplay_routes.py
voice_routes.py
yki_routes.py
subscription_routes.py
websocket_routes.py


Each file must contain ONLY route definitions.

---

#### services.py → backend/services/

Split into:
backend/services/
auth_service.py
cards_service.py
roleplay_service.py
voice_service.py
yki_service.py
subscription_service.py


Each must contain ONLY business logic.

---

#### core.py + http.py → backend/core/
backend/core/
config.py # SETTINGS
errors.py # AppError, error_payload
responses.py # success_payload
utils.py # hashing, timestamps, ids
state_store.py # JsonStateStore


---

#### voice-related logic → backend/voice/

- save_voice_file
- resolve_voice_ref
- pronunciation_feedback

---

#### YKI logic → backend/yki/

- engine_request
- map_engine_error
- store_yki_session
- get_yki_session_record

---

#### roleplay → backend/roleplay/

- create_roleplay_session
- submit_roleplay_turn
- get_roleplay_session
- transcript + review

---

#### cards → backend/cards/

- start_cards_session
- next_card
- answer_card

---

#### adapters/

- external integrations ONLY
- YKI engine adapter must live here

---

#### runtime/

- ONLY data storage (JSON state file)
- NO logic

---

## 5. IMPORT RULES (CRITICAL)

### 5.1 ALLOWED

- api → services
- services → core
- services → domain modules (cards, yki, etc.)
- services → adapters

---

### 5.2 FORBIDDEN

- api → api
- services → api
- core → services
- circular imports

---

## 6. MAIN ENTRYPOINT (STRICT)

`backend/main.py` must:

- ONLY create app
- ONLY register routers

NO logic allowed.

---

## 7. VALIDATION REQUIREMENTS

After restructuring:

### 7.1 IMPORT VALIDATION

- All imports resolve
- No circular dependencies

---

### 7.2 ROUTE VALIDATION

- Every route from original api.py still exists
- Endpoints unchanged:
  - paths
  - methods
  - payload structure

---

### 7.3 CONTRACT VALIDATION

Must match:

- auth_contract.md
- api_contract.md
- session_contract.md
- voice_contract.md
- payment_contract.md

NO deviations allowed.

---

### 7.4 STATE PRESERVATION

- JsonStateStore must behave IDENTICALLY
- No data loss
- No schema changes

---

## 8. OUTPUT REQUIREMENTS

Agent must produce:

### 8.1 FILE TREE

Full new backend structure

---

### 8.2 FULL FILE CONTENTS

For ALL created files:

- Complete code
- No placeholders
- No partial snippets

---

### 8.3 MAPPING TABLE

Old → New mapping:

| Old File | New File(s) |
|----------|------------|

---

### 8.4 VALIDATION REPORT

Must include:

- Import success
- Route parity
- Contract compliance
- Runtime safety

---

## 9. FAILURE CONDITIONS (STRICT)

If ANY of the following occur:

- Missing route
- Changed payload
- Broken import
- Logic modification
- Contract mismatch

→ STEP IS INVALID  
→ MUST BE REDONE

---

## 10. EXECUTION MODE

This is a:

> CONTROLLED SURGICAL REFACTOR

NOT:

- redesign
- optimization
- cleanup
- improvement

---

## FINAL RULE

If unsure:

→ DO NOT GUESS  
→ FOLLOW ORIGINAL STRUCTURE  
→ PRESERVE BEHAVIOR EXACTLY
