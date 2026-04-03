# AGENT PROMPT — ANDROID CRASH FIX + ENGINE-ALIGNED VALIDATION (STRICT)

---

# ROLE

You are a **runtime stability and validation agent**.

You are NOT redesigning the system.

You are:

1. fixing Android crash
2. aligning validation with engine constraints
3. enabling real completion testing

---

# SECTION 1 — FIX ANDROID CRASH (CRITICAL)

---

## ERROR

```text
Maximum update depth exceeded
```

---

## TARGET FILES

```text
apps/client/app/_layout.tsx
apps/client/state/AppShell.tsx
packages/ui/*
packages/core/*
```

---

## TASK

### 1. FIND INFINITE LOOP

Search:

```bash
grep -r "useEffect" apps/client
```

---

## IDENTIFY:

* useEffect calling setState
* missing dependency arrays
* navigation redirects inside render cycle

---

## COMMON PATTERN TO FIX

---

### WRONG

```javascript
useEffect(() => {
  setState(...)
})
```

---

### CORRECT

```javascript
useEffect(() => {
  setState(...)
}, [])
```

---

### OR

```javascript
useEffect(() => {
  if (!initialized) {
    setInitialized(true)
  }
}, [initialized])
```

---

## NAVIGATION LOOP FIX

If using router.replace:

✔ ensure path comparison before navigation

```javascript
if (currentPath !== targetPath) {
  router.replace(targetPath)
}
```

---

## VALIDATION

App must:

✔ launch without redbox
✔ remain stable
✔ no repeated logs

---

# SECTION 2 — ENGINE-ALIGNED VALIDATION

---

## REMOVE INVALID ASSUMPTION

Backend cannot bypass engine timing.

---

## IMPLEMENT VALIDATION STRATEGY

---

### OPTION 1 — WAIT MODE

Log clearly:

```text
Waiting for engine section window
```

---

### OPTION 2 — ENGINE TEST DETECTION

If engine exposes:

```text
/health
/engine/status
```

Check for:

```text
test_mode
fast_mode
```

---

## IF AVAILABLE

Enable:

```text
YKI_ENGINE_TEST_MODE=true
```

---

## IF NOT AVAILABLE

You MUST:

* allow real-time wait
* or simulate partial flow only

---

# SECTION 3 — LISTENING VALIDATION

---

## AFTER FIX

Run:

* start session
* complete reading
* WAIT until engine allows listening

---

## VERIFY

✔ listening answer returns 200
✔ session advances

---

# SECTION 4 — ANDROID MEDIA VALIDATION

---

## TEST

### Playback

✔ play / stop / replay

---

### Recording

✔ start / stop / submit

---

### Permissions

✔ microphone prompt

---

### Background

✔ no crash on app switch

---

# SECTION 5 — FINAL REPORT

---

## CREATE

```text
docs/audit/final_android_engine_validation_<DATE>.md
```

---

## INCLUDE

1. Android crash root cause
2. fix applied
3. validation results
4. engine timing limitation explanation
5. listening completion proof
6. media validation
7. FINAL VERDICT

---

# HARD STOP

STOP if:

* crash persists
* infinite loop remains
* listening still fails after engine window

---

# SUCCESS CRITERIA

✔ Android app stable
✔ listening works under real engine timing
✔ media fully validated
✔ no infinite loops

---

Proceed.
