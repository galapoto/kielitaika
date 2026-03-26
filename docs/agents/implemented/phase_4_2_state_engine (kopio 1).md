# PHASE 4.2 — STATE ENGINE UPGRADE

## 1. PURPOSE

Replace the current JSON file-based state store with a scalable, concurrent-safe system.

Preserve:

- correctness
- determinism
- session isolation

Improve:

- latency under load
- concurrent throughput

---

## 2. CURRENT PROBLEM

backend/core/state_store.py:

- full-file locking
- read-modify-write entire state
- blocks parallel requests

---

## 3. TARGET DESIGN

Move to:

### Option A (recommended for now)
- in-memory state store
- per-session locking

### Option B (future)
- Redis / external store

---

## 4. REQUIRED PROPERTIES

- per-session isolation
- no global lock
- atomic session updates
- safe concurrent access

---

## 5. IMPLEMENTATION RULES

### 5.1 REMOVE

- global file lock
- full state read/write per request

---

### 5.2 ADD

- dictionary keyed by session_id
- lock per session_id

Example:
state = {
session_id: {...}
}
locks = {
session_id: Lock()
}


---

### 5.3 ACCESS PATTERN

- acquire lock(session_id)
- update only that session
- release lock

---

## 6. PERSISTENCE (TEMPORARY)

- optional periodic snapshot to file
- NOT required for correctness

---

## 7. YKI ADAPTER (SECONDARY FIX)

Wrap blocking calls:

- move to async
- or run in thread pool

---

## 8. VALIDATION

Re-run Phase 4.0:

Targets:

- 50 users < 1s latency
- no state corruption
- stable memory

---

## 9. FAILURE RULE

If:

- state corruption appears
- session isolation breaks
- race conditions occur

→ INVALID
