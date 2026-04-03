# AGENT PROMPT — VALIDATION MODE + FINAL UNBLOCK (STRICT SAFE MODE)

---

# ROLE

You are a **controlled validation systems agent**.

You are NOT modifying production behavior.

You are adding a **strictly isolated validation mode** to unblock full-system verification.

---

# OBJECTIVE

Allow full end-to-end validation of YKI flow WITHOUT:

* waiting real-time section windows
* breaking engine correctness
* modifying production runtime behavior

---

# HARD CONSTRAINTS

DO NOT:

❌ modify engine
❌ change production timing logic
❌ bypass orchestrator
❌ alter API contract

DO:

✅ add validation-only override
✅ isolate it behind explicit flag
✅ keep production behavior unchanged

---

# SECTION 1 — VALIDATION MODE FLAG

---

## ADD ENV FLAG

```id="v1"
YKI_VALIDATION_MODE=true
```

---

## LOCATION

```id="v2"
packages/core/config/env.ts
apps/backend/yki/orchestrator.py
```

---

# SECTION 2 — CONTROLLED TIMING OVERRIDE

---

## FILE

```id="v3"
apps/backend/yki/orchestrator.py
```

---

## MODIFY SECTION GATING

Current:

```id="v4"
if not section_window_open:
    raise NEXT_SECTION_NOT_AVAILABLE
```

---

## CHANGE TO:

```id="v5"
if not section_window_open:
    if not VALIDATION_MODE:
        raise NEXT_SECTION_NOT_AVAILABLE
    # validation mode allows progression without waiting
```

---

## IMPORTANT

✔ engine must STILL be called
✔ no fake data
✔ only gating removed

---

# SECTION 3 — LOG VALIDATION MODE USAGE

---

Every time override triggers:

```id="v6"
log("VALIDATION_MODE_OVERRIDE", section, timestamp)
```

---

# SECTION 4 — FULL FLOW EXECUTION

---

Run complete flow:

* start
* reading
* listening
* writing
* speaking

---

## VERIFY

✔ engine accepts all stages
✔ no 400 errors
✔ full completion possible

---

# SECTION 5 — ANDROID FULL MEDIA VALIDATION

---

## MUST TEST

### Playback

* play → stop → replay
  ✔ no overlap

---

### Recording

* start → stop → submit
  ✔ correct lifecycle

---

### Permissions

✔ prompt shown
✔ accepted

---

### Background

* minimize app during playback/recording
  ✔ no crash
  ✔ cleanup works

---

# SECTION 6 — REMOVE VALIDATION MODE EFFECT

---

After validation:

* set flag OFF
* verify system returns to strict gating

---

# SECTION 7 — FINAL AUDIT REPORT

---

## CREATE

```id="v7"
docs/audit/final_validation_unblocked_<DATE>.md
```

---

## INCLUDE

### 1. Validation mode design

### 2. Engine full flow result

### 3. Listening completion proof

### 4. Android media validation

### 5. Differences vs production behavior

### 6. Risks (if any)

### 7. FINAL VERDICT:

* READY FOR DEPLOYMENT
  or
* BLOCKED

---

# HARD STOP

If:

* validation mode leaks into production
* engine calls bypassed
* contract changes
* Android audio fails

→ STOP

---

# SUCCESS CRITERIA

✔ full YKI flow completed
✔ Android media verified
✔ production logic unchanged
✔ system fully validated

---

Proceed.
