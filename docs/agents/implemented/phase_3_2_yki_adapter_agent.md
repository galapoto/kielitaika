# PHASE 3.2 — YKI ADAPTER AGENT

Mode: FAIL-CLOSED  
Role: Engine Integration Layer  

---

## 1. INPUT

Read:

- docs/contracts/system_orchestration_contract.md
- docs/contracts/api_contract.md
- YKI engine runtime contract

---

## 2. OBJECTIVE

Map API calls to engine calls WITHOUT modifying semantics.

---

## 3. RULES

- frontend NEVER talks to engine
- adapter translates exactly
- engine runtime is authoritative

---

## 4. CRITICAL

- audio must be converted to engine-managed references
- runtime screens must be passed exactly
- submission states must match engine exactly

---

## 5. FAILURE CONDITIONS

FAIL if:

- engine state is modified
- runtime structure is altered
- adapter invents data
