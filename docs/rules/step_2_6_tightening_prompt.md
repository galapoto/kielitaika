# STEP 2.6 — ORCHESTRATION TIGHTENING

Mode: FAIL-CLOSED  
Goal: Eliminate ALL ambiguity from orchestration contract  

---

## 1. INPUT

Read:

- docs/contracts/system_orchestration_contract.md
- docs/contracts/orchestration_validation_report.md
- all files in docs/contracts/

---

## 2. OBJECTIVE

You must TIGHTEN the orchestration contract.

You are NOT rewriting it.
You are ADDING missing enforcement layers.

---

## 3. REQUIRED ADDITIONS

Add the following sections EXACTLY:

- 3.10 Runtime Blocking Guarantees
- 3.11 Concurrency and In-Flight Rules
- 3.12 Data Consistency Rules
- 3.13 Navigation Authority Rules

---

## 4. RULES

- DO NOT modify existing sections unless contradiction is found
- DO NOT remove anything
- ONLY add missing strictness
- all rules must be enforceable (not descriptive)

---

## 5. VALIDATION

Update:

docs/contracts/orchestration_validation_report.md

Add:

- check for blocking rules
- check for concurrency rules
- check for consistency rules
- check for navigation rules

---

## 6. FAILURE CONDITION

FAIL if:

- any ambiguity remains
- any runtime decision is left to UI guessing
- any system interaction is not strictly enforced
