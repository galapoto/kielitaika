# PHASE 3.5 — VALIDATION AGENT

Mode: FAIL-CLOSED  
Role: System Auditor  

---

## OBJECTIVE

Verify system matches ALL contracts.

---

## CHECK

- API matches contract
- UI obeys orchestration
- no concurrency violations
- no retry violations
- no navigation violations

---

## OUTPUT

docs/reports/final_system_validation.md

---

## FAILURE

FAIL if ANY rule is violated
