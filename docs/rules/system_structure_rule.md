# SYSTEM STRUCTURE RULE (HARD ENFORCEMENT)

## 1. PURPOSE

This rule enforces a **strict, predictable, and non-negotiable file and folder structure**
for all backend, frontend, and documentation artifacts.

NO file may exist outside a logical structure.
NO agent may create files arbitrarily.
NO feature is considered implemented if it is not placed correctly.

This rule is GLOBAL and must be referenced in EVERY agent run.

---

## 2. CORE PRINCIPLE

Every file MUST satisfy:

> "If I look at the folder name, I can immediately understand what this file is responsible for."

If not → INVALID → MUST BE RELOCATED OR REJECTED

---

## 3. BACKEND STRUCTURE (MANDATORY)

All backend code MUST exist under:
backend/


### 3.1 Required Structure
backend/
api/ # Route definitions ONLY (no business logic)
services/ # Business logic and orchestration
core/ # Core systems (config, state, security, utils)
models/ # Data models and schemas
adapters/ # External integrations (YKI engine, payments, etc.)
voice/ # Voice/STT/TTS handling
yki/ # YKI-specific logic and session handling
roleplay/ # Roleplay engine logic
cards/ # Card system logic
middleware/ # Request/response middleware
runtime/ # Runtime state storage (NOT logic)
main.py # App entry point ONLY


---

### 3.2 HARD RULES

- `api/` MUST NOT contain logic → only routing
- `services/` MUST contain all orchestration logic
- `core/` MUST contain shared utilities ONLY
- NO cross-import chaos (e.g. api → api, services → api is FORBIDDEN)

---

### 3.3 CURRENT VIOLATION (MUST BE FIXED)

Current structure:

- api.py
- services.py
- core.py
- http.py

This is **FLAT and INVALID**

Example:

- API routes are inside `api.py` :contentReference[oaicite:0]{index=0}  
- App is created in `main.py` :contentReference[oaicite:1]{index=1}  

This MUST be split into structured modules.

---

## 4. FRONTEND STRUCTURE (MANDATORY)

All frontend code MUST exist under:
frontend/


### Required Structure
frontend/
app/
screens/ # Full pages/screens
components/ # Reusable UI components
hooks/ # State + logic hooks
services/ # API clients ONLY
state/ # Global state (if any)
theme/ # Colors, fonts, tokens
assets/
images/
audio/
icons/


---

### HARD RULES

- Screens MUST NOT contain business logic
- API calls ONLY in services/
- UI components MUST be reusable, not page-specific hacks

---

## 5. DOCUMENTATION STRUCTURE (MANDATORY)

All documentation MUST exist under:
docs/


### Required Structure
docs/
rules/ # Global system rules (THIS FILE LIVES HERE)
contracts/ # All contract definitions
prompts/ # Agent prompts
validation/ # Validation reports
design/ # UI/UX specs
architecture/ # System design docs


---

### HARD RULES

- NO `.md` file directly in root
- Every document MUST belong to a category
- If category does not exist → CREATE IT FIRST

---

## 6. AGENT EXECUTION RULE (CRITICAL)

Every agent MUST:

### Step 1 — Load Structure Rule
Read:
docs/rules/system_structure_rule.md


### Step 2 — Validate Target Location

Before writing ANY file:

- Does the folder exist?
- Is this the correct domain?

If NOT → STOP → create proper structure

---

### Step 3 — Reject Invalid Writes

Agent MUST REFUSE if:

- File is placed in wrong folder
- Folder is ambiguous
- Structure is flat

---

## 7. ENFORCEMENT RULES

### 7.1 No Silent Acceptance

If structure is wrong:

- MUST be flagged
- MUST be corrected BEFORE proceeding

---

### 7.2 No “Temporary Placement”

This is FORBIDDEN.

There is no:
- "we fix later"
- "just for now"

---

### 7.3 Refactor is Mandatory

If structure is wrong:

- STOP feature work
- FIX structure FIRST

---

## 8. VALIDATION CHECKLIST (MUST PASS)

Before any step is marked complete:

- [ ] Files are inside correct domain folders
- [ ] No flat structure remains
- [ ] No mixed responsibilities
- [ ] Imports follow clean boundaries
- [ ] Backend, frontend, docs all structured

---

## 9. FAILURE CONDITION

If this rule is violated:

→ Entire step is INVALID  
→ Must be redone  
→ No progression allowed

---

## 10. RELATION TO CONTRACTS

This rule sits ABOVE:

- API contracts
- Session contracts
- Orchestration contracts

Because:

> Structure defines where truth lives.

Without structure → contracts become meaningless.

---

## FINAL NOTE

This is not a guideline.

This is a SYSTEM LAW.
