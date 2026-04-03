# FINAL SYSTEM FIX + FORENSIC AUDIT (ANDROID + ENGINE VERIFIED)

You are operating inside:

/home/vitus/kielitaika-app

This is a **strict execution task**.

You are NOT allowed to:

* speculate
* skip validation
* leave partial fixes
* rely on assumptions
* introduce new abstractions

You MUST:

* fix all known blockers
* remove all legacy ambiguity
* execute full system audit
* produce a final report

---

# 0. SYSTEM STATE (MANDATORY CONTEXT)

From previous audit:

* Android crash → FIXED (memoized useFocusEffect)
* Engine validation → STRICT (no bypass allowed)
* System is now deterministic

Remaining blockers:

1. Listening cannot be completed (engine timing not exercised)
2. Android exam start → transport errors
3. Media lifecycle not validated (playback, recording, permissions)
4. Possible legacy paths still exist (must be eliminated)

The system is currently:

→ **STRUCTURALLY CORRECT BUT NOT FULLY VERIFIED**

---

# 1. HARD RULES (NON-NEGOTIABLE)

## 1.1 NO LEGACY SYSTEMS

You must:

* scan entire repo for:

  * old session_store usage
  * validation-mode bypass logic
  * duplicate engine logic
  * any fallback exam flow

If ANY of the above exists:

→ REMOVE IT COMPLETELY

Then verify:

* only ONE YKI execution path exists:
  frontend → backend → external engine

Fail if multiple paths exist.

---

## 1.2 ENGINE IS SOURCE OF TRUTH

You must NOT:

* simulate timing
* fake section transitions
* override engine rules

You MUST:

* align fully with engine timing
* wait for real section windows

---

## 1.3 FAIL-CLOSED ENFORCEMENT

Every endpoint must:

* reject invalid state
* reject early transitions
* reject missing engine state

NO silent success allowed.

---

# 2. FIX ALL KNOWN ISSUES

---

## 2.1 ANDROID → BACKEND TRANSPORT FIX

Problem observed:

* device could not reliably start exam
* transport errors occurred

You must:

* ensure backend is accessible from device

### Enforce:

* backend runs on:
  0.0.0.0:8002

* client API base URL uses:
  http://<LOCAL_IP>:8002

NOT:

* 127.0.0.1
* localhost

---

### Validate:

* device can call:
  /health
  /engine/health
  /api/v1/yki/start

If not:

→ FIX NETWORK CONFIG

---

## 2.2 ANDROID MEDIA SYSTEM (CRITICAL)

You must validate and fix:

### Playback:

* listening audio plays
* no overlapping audio
* audio stops on navigation

### Recording:

* microphone permission requested
* recording starts and stops correctly
* file is produced and sent

### Background:

* playback continues correctly OR stops deterministically
* no orphan audio processes

---

### Enforce:

* single audio controller (NO duplicates)
* cleanup ALWAYS runs

---

## 2.3 ENGINE FLOW COMPLETION

You must COMPLETE a full real exam flow:

STRICT REQUIREMENT:

1. Start exam
2. Complete reading
3. WAIT for listening window (REAL TIME)
4. Submit listening answer
5. Confirm engine accepts it
6. Progress to next section

---

If waiting is required:

→ YOU MUST WAIT

No shortcuts allowed.

---

## 2.4 REMOVE ALL VALIDATION SHORTCUTS

Verify removal of:

* validation mode overrides
* fast-mode assumptions
* test-mode logic

System must behave exactly as production.

---

# 3. FULL SYSTEM AUDIT (FORENSIC)

After fixes, execute:

---

## 3.1 BACKEND AUDIT

Verify:

* contract envelope integrity
* deterministic responses
* correct fail-closed behavior
* engine alignment

---

## 3.2 ENGINE AUDIT

Verify:

* section timing enforced
* no early transitions allowed
* responses accepted only in valid windows

---

## 3.3 ANDROID DEVICE AUDIT

You MUST test on real device:

### Flow:

* launch app
* navigate to exam
* start exam
* complete reading
* complete listening
* test playback + recording

---

Verify:

* no crashes
* no redboxes
* no infinite loops
* no transport failures

---

## 3.4 MEDIA AUDIT

Verify:

* playback lifecycle
* recording lifecycle
* permission handling
* cleanup correctness

---

## 3.5 LEGACY SYSTEM CHECK

You must prove:

* no duplicate engine paths
* no fallback logic
* no hidden bypasses

---

# 4. TEST EXECUTION (MANDATORY)

Run:

python3 -m unittest 
apps/backend/tests/test_yki_exam_runtime.py 
apps/backend/tests/test_yki_audio_media_pipeline.py 
apps/backend/tests/test_api_contract_envelope.py

./node_modules/.bin/tsc --noEmit -p tsconfig.json

npm run controlled_ui_contract_validation

---

# 5. OUTPUT (MANDATORY)

Create:

docs/audit/final_system_full_forensic_android_verified.md

---

## REPORT MUST INCLUDE:

### 1. System topology (final confirmed)

### 2. All fixes applied (explicit file references)

### 3. Engine interaction proof

* real listening submission
* real progression

### 4. Android proof

* logs
* UI confirmation
* media validation

### 5. Media lifecycle verification

### 6. Legacy removal proof

### 7. Failure surface analysis

* ALL remaining risks (if any)

---

## FINAL VERDICT (STRICT)

One of:

* PASS → system fully production-ready
* BLOCKED → must list exact blockers

---

# 6. SUCCESS CONDITION

The system is ONLY considered successful if:

* Android device completes real exam flow
* Listening is completed under real engine timing
* No crashes, no transport errors
* No legacy paths exist
* All tests pass
* Audit report is complete

---

# END OF PROMPT
