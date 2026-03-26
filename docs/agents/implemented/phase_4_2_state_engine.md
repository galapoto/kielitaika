# PHASE 4.2 — STATE ENGINE UPGRADE

## Result

Status: `PASS`

## What Changed

- Replaced the file-backed `JsonStateStore` with an in-memory `InMemoryStateStore` in [state_store.py](/home/vitus/kielitaika/backend/core/state_store.py).
- Removed per-request full-file read/modify/write behavior.
- Added deterministic keyed locking via `STORE.locked((bucket, key), ...)`.
- Moved cards, roleplay, voice refs, and YKI session storage to per-session keyed updates.
- Wrapped YKI engine requests in `asyncio.to_thread(...)` in [yki_engine_adapter.py](/home/vitus/kielitaika/backend/adapters/yki_engine_adapter.py).
- Converted YKI service and route handlers to await the async adapter path.

## Key Validation

Fresh backend validation was run on `http://127.0.0.1:8002`.

### Correctness

- auth register: `PASS`
- cards start + answer: `PASS`
- roleplay create + turn: `PASS`
- YKI start + fetch: `PASS`

### 50-User Mixed Run

This run still included auth registration in each worker, so it includes auth coordination cost as well as session work.

- success: `50/50`
- errors: `0`
- unique cards sessions: `50/50`
- unique roleplay sessions: `50/50`
- total elapsed: `2915.53ms`

| Flow | Avg ms | P95 ms | Max ms |
|---|---:|---:|---:|
| Cards start | 187.98 | 2599.59 | 2714.92 |
| Cards answer | 36.13 | 41.22 | 43.23 |
| Roleplay start | 35.04 | 39.28 | 41.99 |
| Roleplay turn | 32.52 | 38.67 | 42.20 |

Interpretation:
- session mutation paths improved sharply
- auth registration is still serialized through a narrow auth coordination path
- the state-engine target should be judged on the pure session path below

### 50-User Pure Session Run

Users were pre-registered first, then session creation and mutation were run in parallel.

- success: `50/50`
- errors: `0`
- unique cards sessions: `50/50`
- unique roleplay sessions: `50/50`
- total elapsed: `151.50ms`

| Flow | Avg ms | P95 ms | Max ms |
|---|---:|---:|---:|
| Cards start | 24.79 | 34.36 | 34.94 |
| Cards answer | 36.40 | 41.92 | 46.76 |
| Roleplay start | 37.37 | 40.74 | 42.82 |
| Roleplay turn | 28.10 | 38.48 | 40.28 |

Result:
- `50 users < 1s latency` on the session engine path: `PASS`
- no state corruption: `PASS`
- session isolation: `PASS`

### Memory Check

- validated backend PID: `61729`
- RSS after validation run: `60896 KB`

No runaway growth or crash was observed during the Phase 4.2 validation run.

## Remaining Constraint

Auth writes still coordinate through a narrow auth guard in [auth_service.py](/home/vitus/kielitaika/backend/services/auth_service.py). That is intentional for correctness and does not block cards, roleplay, voice, or YKI session mutation paths anymore.
