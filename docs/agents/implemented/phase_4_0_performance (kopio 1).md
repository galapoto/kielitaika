# PHASE 4.0 — PERFORMANCE, LOAD & STABILITY

## 1. PURPOSE

Ensure system performs under real usage conditions.

Not correctness.
Now we test:

- speed
- concurrency
- resource usage

---

## 2. TEST CATEGORIES

---

## 2.1 API LATENCY

Measure:

- auth
- cards
- roleplay
- YKI

Targets:

- < 300ms average
- < 1s worst case (local)

---

## 2.2 CONCURRENT USERS

Simulate:

- 10–50 parallel users

Test:

- session creation
- answering
- roleplay turns

Validate:

- no slowdown spikes
- no state corruption

---

## 2.3 WEBSOCKET LOAD

Test:

- multiple concurrent connections
- rapid message streams

Validate:

- no dropped connections
- stable close behavior

---

## 2.4 MEMORY STABILITY

Observe:

- backend memory growth
- frontend memory usage

Validate:

- no leaks
- no runaway allocation

---

## 2.5 FRONTEND PERFORMANCE

Measure:

- initial load time
- screen transitions
- rendering delays

---

## 3. BOTTLENECK IDENTIFICATION

Agent must identify:

- slow endpoints
- blocking operations
- unnecessary re-renders

---

## 4. OUTPUT REQUIREMENTS

### 4.1 METRICS

- latency table
- concurrency results

---

### 4.2 BOTTLENECKS

- exact location
- cause

---

### 4.3 FIX PLAN

- prioritized
- minimal disruption

---

## 5. FAILURE RULE

If system:

- slows significantly under load
- leaks memory
- breaks under concurrency

→ NOT PRODUCTION READY
