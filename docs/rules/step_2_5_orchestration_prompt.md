# STEP 2.5 — SYSTEM ORCHESTRATION CONTRACT

Mode: FAIL-CLOSED  
Goal: Define how ALL systems interact at runtime  

---

## 0. PRE-RUN

Read:

- all files in docs/contracts/
- docs/implementation_authority_index.md
- docs/old_to_new_feature_matrix.md
- docs/rules/document_structure_enforcement.md

---

## 1. OBJECTIVE

You must define:

- how systems interact
- in what order they execute
- who triggers what
- what depends on what

This is NOT a system contract  
This is a SYSTEM COORDINATION CONTRACT  

---

## 2. OUTPUT

Create:

docs/contracts/system_orchestration_contract.md

---

## 3. REQUIRED SECTIONS

---

### 3.1 APP LIFECYCLE FLOW

Define step-by-step:

- app launch
- auth restore
- session restore
- UI hydration

NO gaps allowed

---

### 3.2 AUTH + SESSION INTERACTION

Define:

- how auth creates session
- how session restores auth
- who is source of truth

---

### 3.3 UI → API → SYSTEM FLOW

For each:

- cards
- roleplay
- YKI
- voice

Define:

1. UI trigger
2. API call
3. session usage
4. response handling

---

### 3.4 YKI FULL FLOW

Must include:

- start exam
- section transitions
- listening
- reading
- writing
- speaking
- submission

Must align with engine

---

### 3.5 VOICE FLOW

Define:

- mic start (KAIL)
- recording
- upload
- transcription
- UI update

Separate:

- YKI vs non-YKI

---

### 3.6 PAYMENT FLOW

Define:

- fetch subscription
- upgrade
- entitlement update
- UI gating

---

### 3.7 FAILURE PROPAGATION

Define:

- how failures move across systems

Example:
- API fails → UI state → session impact

---

### 3.8 STATE OWNERSHIP

Define clearly:

- what state lives where:
  - UI
  - session
  - backend
  - engine

---

### 3.9 FORBIDDEN ORCHESTRATION

Define:

- what flows must NEVER happen
- invalid sequences

---

## 4. HARD RULES

- NO system duplication
- NO circular dependency
- NO undefined transitions
- NO UI guessing system state

---

## 5. VALIDATION

Create:

docs/contracts/orchestration_validation_report.md

Must confirm:

- all systems are connected
- no flow is undefined
- no contradictions with existing contracts

---

## 6. FAILURE CONDITION

FAIL if:

- any system interaction is unclear
- any step is missing
- any flow contradicts contracts
