# PHASE 5.2 — DATA FINALIZATION + LIVE VERIFICATION

---

## 1. PURPOSE

This phase completes the system by:

- aligning SOURCE materials with runtime authority
- ensuring reproducibility of the material pipeline
- performing real, live backend + YKI verification
- confirming full system correctness in execution, not theory

This phase converts system status from:

> PARTIAL → VALID

---

## 2. NON-NEGOTIABLE RULES

- NO new features
- NO UI redesign
- NO partial rewrites

Everything must be:

> consistent from source → normalized → runtime

---

## 3. EXECUTION ORDER (STRICT)

1. Source material normalization
2. Authority alignment validation
3. Runtime-material consistency check
4. Cleanup of artifacts
5. Live backend verification (FastAPI)
6. YKI end-to-end verification
7. Voice system real verification
8. Cards randomness verification (live)
9. Final certification report

---

# 4. SOURCE MATERIAL NORMALIZATION (CRITICAL)

---

## 4.1 TARGET

Source directory:

/home/vitus/Asiakirjat/Professional_Finnish_materials/

---

## 4.2 REQUIREMENT

All source files must:

- match normalized schema
- contain only valid Finnish content
- be free from duplicates
- be consistent with:

backend/runtime/materials/normalized/cards_authority.json

---

## 4.3 ACTION

For each source file:

- parse
- validate against schema
- compare with normalized authority

If:

### entry exists in normalized → KEEP

### entry malformed → FIX or DELETE

### entry not in normalized but valid → ADD (if not duplicate)

### duplicate → DELETE

---

## 4.4 OUTPUT

Rewrite source files IN PLACE

DO NOT:

- create parallel versions
- leave old malformed entries

---

# 5. AUTHORITY ALIGNMENT CHECK

---

Ensure:

source == normalized == runtime

No drift allowed.

---

## 5.1 VALIDATION SCRIPT

Agent must confirm:

- count(source) == count(normalized)
- IDs match
- content match (no silent variation)

---

# 6. RUNTIME CONSISTENCY CHECK

---

Check:

backend/runtime/materials/normalized/

Ensure:

- no orphan entries
- no unused content
- no duplicates reintroduced

---

# 7. CLEANUP (MANDATORY)

---

Remove:

backend/runtime/uploads/voice/spk_test
backend/runtime/uploads/voice/spk_test_phase51

Also remove:

- temporary logs
- probe artifacts
- debug dumps

Ensure runtime folders are clean.

---

# 8. LIVE BACKEND VERIFICATION (CRITICAL)

---

## 8.1 START SERVER

Run FastAPI backend.

---

## 8.2 TEST ENDPOINTS

### AUTH

- register
- login
- refresh
- logout

Verify:

- logout invalidates session
- expired token rejected

---

### PAYMENT / ENTITLEMENT

- check premium endpoint
- simulate expired entitlement

Verify:

- access denied correctly

---

### CARDS

- start session
- fetch cards multiple times

Verify:

- reshuffling works
- no repetition across sessions
- difficulty filtering correct

---

### ROLEPLAY

- create session
- multiple turns
- restore session

Verify:

- transcript consistency
- no state corruption

---

# 9. YKI END-TO-END VERIFICATION (CRITICAL)

---

## 9.1 START EXAM

Verify:

- new random exam generated

---

## 9.2 RUN FULL FLOW

- reading → questions
- listening → questions
- writing
- speaking
- submit

---

## 9.3 VALIDATE

- no duplicate tasks
- no reused exam before bank cycle
- no internal/debug fields exposed
- progression controlled by backend only

---

# 10. VOICE SYSTEM REAL TEST

---

## 10.1 NORMAL FLOW

- record → upload → STT → response

---

## 10.2 FAILURE TEST

Force failure:

- invalid audio
- simulate STT failure

Verify:

- system stops
- error returned
- no continuation

---

# 11. CARDS RANDOMNESS (LIVE)

---

Run multiple sessions:

- start → exit → restart

Verify:

- new content served
- no repetition
- difficulty maintained

---

# 12. FINAL CERTIFICATION REPORT

---

## SAVE TO:

/home/vitus/kielitaika/docs/audit/phase_5_2_final_verification.md

---

## MUST INCLUDE

### 12.1 SYSTEM STATUS

- VALID / FAIL

---

### 12.2 MATERIAL CONSISTENCY

- source vs normalized match
- total entries
- duplicates removed (final)

---

### 12.3 LIVE TEST RESULTS

| Component | Status | Notes |
|----------|--------|------|
| Auth |  |  |
| Payment |  |  |
| Cards |  |  |
| Roleplay |  |  |
| Voice |  |  |
| YKI |  |  |

---

### 12.4 RANDOMIZATION PROOF

- evidence of reshuffling
- no-repeat validation

---

### 12.5 CONTRACT VALIDATION

- confirm no violations

---

### 12.6 FINAL DECISION

Explicitly state:

- system is production ready OR
- list exact remaining blockers

---

# 13. FAILURE CONDITIONS

If ANY of the following occur:

- source ≠ normalized
- duplicates remain
- YKI leaks internal data
- voice continues after failure
- cards repeat incorrectly
- backend endpoints inconsistent

→ STATUS = FAIL

---

# 14. FINAL GOAL

At the end of this phase:

- source materials are clean and authoritative
- runtime matches source exactly
- backend is fully verified live
- YKI behaves correctly and safely
- randomness is proven
- system is certified

This is the final gate before UI/UX finalization and production release.
