# PHASE 4.0 — PERFORMANCE, LOAD & STABILITY

## Verdict

Status: `NOT PRODUCTION READY`

Single-user local latency is good.
Concurrent load at 50 users is not acceptable yet.
No state corruption was observed.

## Environment

- Backend: `http://127.0.0.1:8000`
- Frontend preview: `http://127.0.0.1:4173`
- YKI engine: `http://127.0.0.1:8181`
- Backend PID during run: `51696`

## API Latency

Target:
- average `< 300ms`
- worst case `< 1000ms`

| Flow | Samples | Avg ms | P95 ms | Max ms | Result |
|---|---:|---:|---:|---:|---|
| Auth login | 20 | 68.10 | 69.42 | 69.60 | PASS |
| Auth session | 20 | 3.84 | 5.03 | 5.05 | PASS |
| Cards start | 20 | 18.89 | 21.10 | 21.28 | PASS |
| Cards answer | 20 | 19.06 | 22.04 | 30.01 | PASS |
| Roleplay create | 20 | 20.67 | 22.60 | 24.07 | PASS |
| Roleplay turn | 20 | 21.54 | 22.45 | 37.74 | PASS |
| YKI start | 8 | 49.36 | 53.01 | 53.01 | PASS |
| YKI fetch | 8 | 27.59 | 30.67 | 30.67 | PASS |
| YKI answer | 8 | 11.37 | 12.87 | 12.87 | PASS |

## Concurrent Users

### 10 Parallel Users

- Total elapsed: `1624.75ms`
- Success: `10/10`
- Errors: `0`
- Unique cards sessions: `10/10`
- Unique roleplay sessions: `10/10`

| Flow | Avg ms | P95 ms | Max ms |
|---|---:|---:|---:|
| Cards start | 356.85 | 677.00 | 677.00 |
| Cards answer | 231.19 | 240.77 | 240.77 |
| Roleplay start | 225.90 | 236.84 | 236.84 |
| Roleplay turn | 222.79 | 224.54 | 224.54 |

Result: `DEGRADED`

### 50 Parallel Users

- Total elapsed: `9049.39ms`
- Success: `50/50`
- Errors: `0`
- Unique cards sessions: `50/50`
- Unique roleplay sessions: `50/50`

| Flow | Avg ms | P95 ms | Max ms |
|---|---:|---:|---:|
| Cards start | 1432.64 | 3421.39 | 3499.32 |
| Cards answer | 1328.84 | 1335.21 | 1336.90 |
| Roleplay start | 1361.04 | 1371.23 | 1372.42 |
| Roleplay turn | 1460.40 | 1474.39 | 1475.66 |

Result: `FAIL`

Interpretation:
- concurrency correctness is intact
- throughput is not
- 50-user load breaches the local `< 1s` target materially

## Websocket Load

Measured on the authenticated success path using the backend’s actual websocket auth contract: `?token=<access_token>`.

- Total connections: `40`
- Success: `40/40`
- Errors: `0`
- Close codes: `1013 x 40`
- Average connection lifetime: `213.06ms`
- Max connection lifetime: `222.02ms`

Observed behavior:
- `/api/v1/ws/voice/stt-stream` returns structured `VOICE_STT_UNAVAILABLE`
- `/api/v1/ws/voice/tts-stream` returns structured `VOICE_TTS_UNAVAILABLE`
- close behavior stayed stable under concurrent connection burst

## Memory Stability

### Backend RSS

- Before load: `59744 KB`
- After load: `64064 KB`
- After 5s idle: `64064 KB`
- Retained delta after idle: `+4320 KB`

Result: `STABLE BUT RETAINING`

Interpretation:
- no runaway growth was observed during this run
- memory did not return to baseline after load
- retained growth matches the current unbounded in-process/session state model

### Frontend Heap

- Unauthenticated load heap: `2233387 bytes`
- Authenticated restore heap: `2962072 bytes`
- After route cycling + forced GC: `2299520 bytes`

Result: `PASS`

Interpretation:
- no obvious frontend heap leak was observed in the measured route cycle

## Frontend Performance

### Static Shell

- HTML TTFB: `0.001252s`
- Total HTML fetch: `0.001287s`
- Built JS bundle: `182353 bytes`
- Built CSS bundle: `7215 bytes`

### Browser Navigation

| Measurement | DOMContentLoaded ms | Load ms |
|---|---:|---:|
| Unauthenticated load | 16 | 16 |
| Authenticated restore load | 9 | 10 |

### Route Transition Timing

| Route | Samples | Avg ms | P95 ms | Max ms |
|---|---:|---:|---:|---:|
| Cards | 5 | 32.42 | 35.70 | 35.70 |
| Roleplay | 5 | 30.08 | 31.50 | 31.50 |
| Voice | 5 | 32.78 | 34.90 | 34.90 |
| YKI Exam | 5 | 31.00 | 35.30 | 35.30 |
| Dashboard | 20 | 32.46 | 35.10 | 36.60 |

Result: `PASS`

## Bottlenecks

### 1. Serialized full-file state store

Location:
- [state_store.py](/home/vitus/kielitaika/backend/core/state_store.py#L9)
- [state_store.py](/home/vitus/kielitaika/backend/core/state_store.py#L42)

Cause:
- every mutation acquires one process-wide lock
- every mutation reads the full JSON state file
- every mutation rewrites the full JSON state file

Measured impact:
- single-user latency stays low
- 10-user load already pushes cards start above the 300ms average target
- 50-user load produces 1.3s to 3.5s request times without corruption

### 2. Blocking network call inside request path

Location:
- [yki_engine_adapter.py](/home/vitus/kielitaika/backend/adapters/yki_engine_adapter.py#L19)

Cause:
- YKI adapter uses synchronous `urllib.request.urlopen(...)`
- request timeout is `30s`
- this runs inside the API request path

Measured impact:
- current local engine is fast, so single-user YKI numbers pass
- this remains a scaling and tail-latency risk once engine response time varies

### 3. Unbounded retained runtime state

Location:
- [state_store.py](/home/vitus/kielitaika/backend/core/state_store.py#L17)
- [yki/runtime.py](/home/vitus/kielitaika/backend/yki/runtime.py#L29)

Cause:
- auth tokens, cards sessions, roleplay sessions, voice refs, and YKI sessions are retained in the same state document
- no pruning or compaction runs after load activity

Measured impact:
- backend RSS retained `+4320 KB` after idle
- this did not explode during the run, but it does not self-recover

### 4. Sequential bootstrap restore path

Location:
- [AppStateProvider.tsx](/home/vitus/kielitaika/frontend/app/state/AppStateProvider.tsx#L50)

Cause:
- auth restore, subscription fetch, roleplay cache checks, and YKI cache checks are executed in sequence
- the route is decided only after the chain completes

Measured impact:
- current browser numbers are still good
- this is not a current failure
- it is a latent boot-time bottleneck if persisted cache volume grows

## Fix Plan

### Priority 1

- Replace the full-file JSON store with a storage layer that does not rewrite the whole state on every mutation.
- Minimal disruption path: move auth/session/runtime tables into SQLite with indexed lookups and transactional writes.

### Priority 2

- Remove blocking I/O from async request handlers.
- Minimal disruption path: move YKI engine calls to an async HTTP client or explicitly isolate them in a worker/thread boundary.

### Priority 3

- Add lifecycle cleanup for `access_tokens`, `refresh_tokens`, `cards_sessions`, `roleplay_sessions`, `voice_refs`, and `yki_sessions`.
- Minimal disruption path: prune expired or completed records on write and on startup.

### Priority 4

- Freeze websocket client auth usage to the actual query-param contract and add a committed load test for it.
- Current load is stable, but the auth transport is easy to call incorrectly.

### Priority 5

- Parallelize or cap restore checks in frontend bootstrap only after backend storage is fixed.
- This is optimization work, not the main blocker.

## Final Assessment

- Correctness under load: `PASS`
- Stability under load: `PARTIAL PASS`
- Performance under load: `FAIL`

Reason:
- the system stays correct under concurrency
- it does not stay fast enough under 50 parallel users
- retained backend state growth needs cleanup before production use
