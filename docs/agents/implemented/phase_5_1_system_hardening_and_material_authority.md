# PHASE 5.1 — SYSTEM HARDENING + MATERIAL AUTHORITY + RUNTIME CORRECTION

---

## 1. PURPOSE

This phase fixes ALL critical blockers identified in Phase 5.0 and establishes:

- strict backend authority
- clean, validated, deduplicated material banks
- controlled randomness with user-aware progression
- contract integrity across the entire system

---

## 2. NON-NEGOTIABLE RULES

- NO new features
- NO UI redesign
- NO temporary fixes
- NO silent fallbacks

Everything must be:

> deterministic, validated, and enforced at backend level

---

## 3. EXECUTION ORDER (STRICT)

1. Material discovery + classification
2. Material cleaning + deduplication
3. Material authority integration
4. Backend contract hardening
5. Auth + session fixes
6. Payment + entitlement enforcement
7. Randomization engine
8. YKI strict validation + isolation
9. Voice fail-closed enforcement
10. Final verification pass

DO NOT change this order.

---

# 4. MATERIAL SYSTEM (CRITICAL)

---

## 4.1 DISCOVER ALL MATERIAL SOURCES

Scan:

- /home/vitus/Asiakirjat/Professional_Finnish_materials/
- /home/vitus/kielitaika/backend/
- /home/vitus/kielitaika-yki-engine/

Identify ALL:

- vocabulary datasets
- grammar datasets
- phrase/sentence datasets
- YKI task banks

Produce internal map:
material_inventory.json


---

## 4.2 CLASSIFY MATERIAL

For each dataset:

- VALID
- NEEDS_CLEANING
- INVALID

Criteria:

### INVALID (DELETE IMMEDIATELY)
- contains English (outside translations explicitly required)
- broken Finnish
- synthetic garbage / LLM noise
- malformed structure

### NEEDS CLEANING
- inconsistent formatting
- duplicate-heavy
- partial corruption

### VALID
- clean Finnish
- structured
- usable

---

## 4.3 HARD CLEANING

For ALL non-primary datasets:

- remove English leakage
- normalize Finnish forms
- standardize structure

---

## 4.4 GLOBAL DEDUPLICATION (MANDATORY)

Across ALL datasets:

Duplicate types:

- exact duplicates
- lemma duplicates
- semantic duplicates
- near duplicates

RULE:

> KEEP ONE → DELETE ALL OTHERS

NO archive  
NO quarantine  
NO backups inside runtime system  

Duplicates must be permanently removed.

---

## 4.5 PRIMARY MATERIAL AUTHORITY

Set:
/home/vitus/Asiakirjat/Professional_Finnish_materials/


as:

> SINGLE SOURCE OF TRUTH (CARDS SYSTEM)

All other datasets become:

- either cleaned support data
- or deleted

---

## 4.6 NORMALIZATION

Convert primary materials into:

- consistent schema
- difficulty-tagged entries (A1–C2)
- unique IDs

Store as:
backend/runtime/materials/normalized/


---

# 5. RANDOMIZATION ENGINE (CRITICAL)

---

## 5.1 CORE PRINCIPLE

Random ≠ uncontrolled

System must use:

> controlled randomness + user memory

---

## 5.2 USER CONTENT HISTORY

Implement:
user_content_history:
user_id
content_id
content_type
timestamp


Used for:

- preventing repetition
- tracking progression

---

## 5.3 CARD SYSTEM SELECTION

Selection rules:

1. filter by difficulty
2. exclude seen content
3. randomize remaining pool
4. serve batch

If exhausted:

- reset cycle OR expand difficulty band

---

## 5.4 SESSION EXIT BEHAVIOR

If user exits:

- next session MUST NOT repeat same items
- reshuffle required

---

## 5.5 YKI RANDOMIZATION

For EACH exam:

- random task selection
- no duplicates within exam
- no reuse until bank cycle completed

---

# 6. BACKEND CONTRACT HARDENING

---

## 6.1 RESPONSE FORMAT

ALL endpoints must return:
{
ok: boolean,
data: ...,
error: ...,
meta: ...
}


---

## 6.2 REMOVE FRONTEND LOGIC

- no reshaping in frontend
- backend is sole authority

---

## 6.3 CONTRACT GUARD

Ensure:

- all responses validated before use
- invalid → rejected immediately

---

# 7. AUTH + SESSION FIXES

---

## 7.1 LOGOUT (MISSING — FIX)

Implement:

- token invalidation
- session termination

---

## 7.2 SESSION CONSISTENCY

Ensure:

- no drift between frontend/backend
- restore works correctly
- expired sessions rejected

---

# 8. PAYMENT + ENTITLEMENT (CRITICAL)

---

## 8.1 BACKEND AUTHORITY

- premium features MUST be backend-gated
- frontend hiding is irrelevant

---

## 8.2 EXPIRY ENFORCEMENT

- expired entitlement → immediate block
- no grace unless explicitly defined

---

## 8.3 ROUTES (MISSING — FIX)

Implement:

- entitlement check endpoint
- payment status endpoint

---

# 9. YKI SYSTEM HARDENING

---

## 9.1 STRICT VALIDATION

All tasks must be:

- schema valid
- linguistically correct Finnish
- aligned with YKI structure

Invalid → DELETE

---

## 9.2 REMOVE INTERNAL EXPOSURE

Frontend must NEVER receive:

- debug data
- internal runtime state
- canonical structures

Only:

> public runtime contract

---

## 9.3 EXAM FLOW AUTHORITY

- backend controls progression
- frontend cannot skip sections

---

# 10. VOICE SYSTEM (FAIL-CLOSED)

---

## 10.1 CURRENT ISSUE

System continues on failure → NOT allowed

---

## 10.2 REQUIRED BEHAVIOR

If:

- STT fails
- upload fails
- response invalid

THEN:

- STOP flow
- return structured error
- require retry

---

## 10.3 NO SILENT FAILURES

All failures must be:

- visible
- logged
- handled explicitly

---

# 11. FINAL VERIFICATION PASS

---

## 11.1 RE-RUN FLOWS

- auth
- cards
- roleplay
- voice
- YKI

---

## 11.2 VERIFY

- no duplicates
- randomness works
- no repetition bugs
- contracts hold

---

# 12. OUTPUT REQUIREMENTS

---

## 12.1 SAVE REPORT
/home/vitus/kielitaika/docs/audit/phase_5_1_hardening_report.md


---

## 12.2 INCLUDE

### Summary
- status (VALID / PARTIAL / FAIL)

### Fixes applied
- per component

### Material report
- sources found
- cleaned
- deleted
- final counts

### Deduplication report
- duplicates removed count

### Randomization validation
- proof of reshuffling

### Contract validation
- violations fixed

### Remaining issues (if any)

---

# 13. FAILURE CONDITIONS

If agent:

- leaves duplicates
- skips material cleaning
- allows frontend control
- keeps invalid YKI content
- allows repetition bugs

→ FAIL

---

# 14. FINAL GOAL

At the end of this phase:

- system is deterministic
- content is clean and authoritative
- randomness is real and controlled
- contracts are enforced
- backend is the single source of truth

This is the last phase before production-level UI refinement.
