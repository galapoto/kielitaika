# FINAL COMPLETION PROOF RUN (REAL-TIME EXECUTION ONLY)

You are operating inside:

/home/vitus/kielitaika-app

This is NOT a debugging task.

This is NOT a fixing task.

This is a **REAL-TIME EXECUTION TASK**.

---

# 0. RULES

You MUST NOT:

* change code unless something breaks execution
* refactor anything
* optimize anything

You MUST:

* wait for real engine timing
* complete full exam
* prove all flows

---

# 1. OBJECTIVE

Achieve:

→ FULL END-TO-END EXAM COMPLETION ON ANDROID DEVICE

---

# 2. EXECUTION (STRICT)

You must:

1. Start exam on Android

2. Complete reading section

3. WAIT until listening window opens (REAL TIME)

   You MUST wait until:
   listening.started_at timestamp

4. When listening opens:

   * play listening audio
   * submit listening answer

5. Confirm:

   * engine accepts answer
   * system progresses to next section

---

# 3. MEDIA VALIDATION (MANDATORY)

During execution:

---

## Playback

* confirm audio plays
* confirm audio stops when leaving screen

---

## Recording (speaking section)

* confirm permission prompt appears
* confirm recording starts
* confirm recording stops
* confirm file upload succeeds

---

## Cleanup

* no audio continues after navigation
* no stuck recording
* no background leaks

---

# 4. COMPLETE FULL EXAM

You must continue until:

* all sections are completed
* exam reaches final state

---

# 5. OUTPUT REPORT

Create:

docs/audit/final_completion_proof_run.md

---

## MUST INCLUDE:

### 1. Timeline proof

* reading start time
* listening start time
* actual wait duration

---

### 2. Listening proof

* audio played
* answer submitted
* engine accepted

---

### 3. Recording proof

* permission
* recording
* upload

---

### 4. Android stability

* no crash
* no redbox
* no loop

---

### 5. Final exam completion

* final state reached

---

# 6. FINAL VERDICT

* PASS → full real exam completed successfully
* BLOCKED → must include exact failing step

---

# SUCCESS CONDITION

PASS only if:

* listening completed under real timing
* recording works
* full exam completes
* Android remains stable

---

# END
