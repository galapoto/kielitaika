# AGENT PROMPT — YKI ENGINE INTEGRATION + LEGACY REMOVAL (STRICT MODE)

## ROLE

You are a **senior systems integration agent** operating under **strict non-destructive, audit-safe rules**.

Your task is to:

1. Replace the **internal YKI runtime** with the **external YKI engine (v3.3)**
2. Remove ALL legacy/local YKI logic that is no longer used
3. Preserve system stability, contracts, and frontend compatibility
4. Ensure the system becomes **single-source-of-truth: external engine only**

You MUST NOT improvise.

---

# GLOBAL CONSTRAINTS (NON-NEGOTIABLE)

1. ❌ DO NOT modify frontend (apps/client, packages/ui, packages/core UI logic)

2. ❌ DO NOT modify API response contract shape (ok/data/error/meta)

3. ❌ DO NOT break existing endpoints

4. ❌ DO NOT delete anything unless verified unused

5. ❌ DO NOT silently change behavior

6. ❌ DO NOT partially integrate (must be complete switch)

7. ✅ Backend becomes a **proxy + contract enforcer only**

8. ✅ External engine becomes the ONLY YKI runtime

9. ✅ All legacy YKI logic must be removed AFTER verification

---

# TARGET ARCHITECTURE (FINAL STATE)

Frontend (unchanged)
→ App Backend (FastAPI)
→ External YKI Engine (HTTP via httpx)
→ Response mapped to governed contract

NO local YKI session logic must remain in execution path.

---

# STEP 1 — DISCOVER CURRENT STATE (MANDATORY)

Audit ALL YKI-related backend files:

Search in:

* apps/backend/yki/
* apps/backend/api/
* apps/backend/services/
* apps/backend/

Identify:

1. Adapter file:

   * apps/backend/yki/adapter.py

2. Local runtime logic:

   * session_store.py
   * any create_session / submit_answer / play_listening_prompt
   * any in-memory session handling

3. API routes:

   * /api/v1/yki/...

4. Any hidden dependencies:

   * imports referencing local YKI logic

Produce:

* FULL dependency map of YKI execution path
* List of ALL functions that must be replaced

---

# STEP 2 — ADD ENGINE CONFIGURATION

Add environment variable:

YKI_ENGINE_BASE_URL=http://127.0.0.1:8181

Inject into backend config system.

Create safe accessor:

get_engine_base_url()

NO hardcoded URLs allowed.

---

# STEP 3 — REWRITE ADAPTER (CORE TASK)

File:
apps/backend/yki/adapter.py

---

## REQUIREMENTS

Replace ALL local calls with HTTP calls to engine.

Use:

* httpx.AsyncClient
* timeout handling
* structured error handling

---

## REQUIRED ENDPOINT MAPPINGS (VERIFY FROM ENGINE)

Map these flows:

1. Start session
   POST /exam/start

2. Get session
   GET /exam/{session_id}

3. Next
   POST /exam/{session_id}/next

4. Answer
   POST /exam/{session_id}/answer

5. Audio / playback (if applicable)
   → map to engine endpoints OR keep backend proxy if required

---

## RESPONSE HANDLING

You MUST:

1. Validate engine response
2. Transform into:

{
ok: boolean,
data: ...,
error: ...,
meta: ...
}

3. If invalid:
   → THROW CONTRACT_VIOLATION
   → FAIL CLOSED

---

## ERROR HANDLING

Handle:

* network failure
* timeout
* invalid JSON
* engine error response

Return structured error:

{
ok: false,
data: null,
error: {
code,
message,
retryable
},
meta
}

---

# STEP 4 — PRESERVE API ROUTES

DO NOT change:

apps/backend/main.py routes

Ensure:

* endpoints remain identical
* frontend continues working without modification

---

# STEP 5 — REMOVE LEGACY YKI LOGIC (CAREFULLY)

ONLY AFTER adapter rewrite is COMPLETE and VERIFIED:

---

## Identify removable files:

Likely candidates:

* apps/backend/yki/session_store.py
* any local session management modules
* helper functions tied to local runtime

---

## SAFE REMOVAL RULE

For EACH file:

1. Search entire repo for references
2. If referenced → DO NOT DELETE
3. If not referenced → mark for deletion

---

## BEFORE deletion:

Produce list:

* files to delete
* why they are safe to delete
* proof (no imports / no usage)

---

## THEN delete

NO bulk deletion allowed.

---

# STEP 6 — CLEAN IMPORT GRAPH

After removal:

* Remove unused imports
* Ensure no broken references
* Ensure backend starts cleanly

---

# STEP 7 — VALIDATION (MANDATORY)

You MUST verify:

---

## Backend ↔ Engine

Test:

* POST /api/v1/yki/sessions/start
* GET /api/v1/yki/sessions/{id}
* POST /next
* POST /answer

Ensure:

* responses valid
* no local logic executed

---

## Contract validation

Ensure ALL responses:

* match governedResponseValidation.ts expectations
* no shape drift

---

## Failure scenarios

Simulate:

* engine down
* timeout
* invalid response

Ensure:

* system fails closed
* no silent fallback

---

# STEP 8 — OUTPUT REPORT (REQUIRED)

Produce structured report:

---

## 1. Files modified

## 2. Files deleted (with justification)

## 3. New files added (if any)

## 4. Adapter transformation summary

## 5. Validation results

## 6. Known risks (if any)

## 7. FINAL VERDICT:

* READY FOR VALIDATION
  or
* BLOCKED (with reason)

---

# HARD FAILURE CONDITIONS

If ANY of these occur, STOP and report:

* frontend contract broken
* backend fails to start
* partial integration detected
* legacy logic still in execution path
* engine responses not mapped correctly

---

# SUCCESS CRITERIA

You are done ONLY when:

* backend no longer uses ANY local YKI runtime
* ALL YKI flows go through external engine
* frontend works unchanged
* unused legacy code is removed safely
* system is ready for full validation phase

---

# FINAL INSTRUCTION

This is a **surgical integration**, not a refactor.

Move carefully.
Verify everything.
Remove only what is proven safe.

NO SHORTCUTS.
