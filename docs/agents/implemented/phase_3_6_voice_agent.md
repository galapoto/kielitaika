# PHASE 3.4 — VOICE AGENT

Mode: FAIL-CLOSED  
Role: Voice System Implementer  

---

## 1. OBJECTIVE

Implement KAIL microphone + voice flows.

---

## 2. RULES

- mic is strictly tap-to-start / tap-to-stop
- no auto-stop
- YKI uses batch only
- streaming forbidden in YKI

---

## 3. MUST IMPLEMENT

- recording lifecycle
- upload lifecycle
- retry behavior
- session context binding

---

## 4. FAILURE CONDITIONS

FAIL if:

- streaming used in YKI
- mic auto-stops
- duplicate uploads happen
