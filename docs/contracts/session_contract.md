# Session Contract

Status: `frozen`  
Mode: `fail-closed`  
Scope: user auth session, speaking session, roleplay session, and YKI exam session

## 4.1 System Overview

The session system defines how active user context is created, identified, stored, resumed, expired, and cleared across the app.

The session system does:

- unify session identity rules across auth, speaking, roleplay, and YKI
- define which sessions are frontend-owned, backend-owned, or engine-owned
- define persistence scope and restoration rules
- define session expiry handling

The session system does not do:

- credential validation
- payment processing
- microphone capture
- roleplay conversation logic
- YKI exam scoring logic

System boundaries:

- auth session is app-backend-authored and frontend-persisted
- speaking session is frontend-authored and in-memory only
- roleplay session is app-backend-authored, with frontend resume cache
- YKI exam session is engine-authored, with frontend runtime snapshot cache

## 4.2 Ownership

Frontend responsibility:

- create frontend-only `speaking_session_id` values
- persist and clear the allowed session snapshots
- attach the correct session ids to voice, roleplay, and YKI calls
- refuse to restore sessions that have already expired or are structurally invalid

Backend responsibility:

- issue `auth_session_id`
- issue `roleplay_session_id`
- validate session ownership for authenticated users
- reject stale or mismatched session ids

YKI engine responsibility:

- issue `exam_session_id`
- issue and validate `engine_session_token`
- define exam session expiration and completion

External services:

- none directly; all external integrations are hidden behind backend or engine ownership

## 4.3 Data Structures

### Canonical Session Descriptor

`SessionDescriptor`

| Field | Type | Required | Validation |
| --- | --- | --- | --- |
| `session_kind` | `"auth" \| "speaking" \| "roleplay" \| "yki_exam"` | yes | exact enum |
| `session_id` | `string` | yes | opaque non-empty identifier |
| `owner_system` | `"frontend" \| "app_backend" \| "yki_engine"` | yes | exact enum |
| `state` | `string` | yes | must be a valid state for that session kind |
| `created_at` | `string` | yes | ISO 8601 UTC timestamp |
| `last_activity_at` | `string` | yes | ISO 8601 UTC timestamp |
| `expires_at` | `string \| null` | yes | ISO 8601 UTC timestamp or `null` only when contract explicitly permits no fixed expiry |
| `resume_allowed` | `boolean` | yes | explicit restore eligibility |

### Persisted Storage Keys

| Storage Key | Payload | Persistence Rule |
| --- | --- | --- |
| `kt.auth.session.v1` | `PersistedAuthSession` from `auth_contract.md` | persistent until logout, refresh expiry, or corruption |
| `kt.session.roleplay.v1::<roleplay_session_id>` | `RoleplaySessionCache` | persistent until roleplay completion review is dismissed or `expires_at` passes |
| `kt.session.yki_runtime.v1::<exam_session_id>` | `YkiRuntimeCache` | persistent until engine marks session submitted/completed/expired |

The speaking session has no persistent storage key. It is in-memory only.

### Session-Kind Payloads

`SpeakingSessionContext`

| Field | Type | Required | Validation |
| --- | --- | --- | --- |
| `speaking_session_id` | `string` | yes | UUIDv4 or equivalent opaque frontend-generated id |
| `mode` | `"conversation" \| "fluency" \| "guided_turn" \| "shadowing" \| "micro_output" \| "roleplay"` | yes | exact enum |
| `path` | `"general" \| "professional" \| "yki_practice"` | yes | exact enum |
| `field_id` | `string \| null` | no | required when `path=professional` |
| `created_at` | `string` | yes | ISO 8601 UTC timestamp |

`RoleplaySessionCache`

| Field | Type | Required | Validation |
| --- | --- | --- | --- |
| `schema_version` | `"1"` | yes | exact value |
| `roleplay_session_id` | `string` | yes | backend-issued opaque id |
| `speaking_session_id` | `string` | yes | must match the active speaking session |
| `state` | `"created" \| "active" \| "awaiting_ai" \| "completed" \| "expired" \| "abandoned"` | yes | exact enum |
| `turn_count` | `integer` | yes | 0-5 |
| `expires_at` | `string` | yes | ISO 8601 UTC timestamp from backend |
| `last_synced_at` | `string` | yes | ISO 8601 UTC timestamp |

`YkiRuntimeCache`

| Field | Type | Required | Validation |
| --- | --- | --- | --- |
| `schema_version` | `"1"` | yes | exact value |
| `exam_session_id` | `string` | yes | engine-issued opaque id |
| `engine_session_token` | `string` | yes | opaque non-empty token |
| `level_band` | `"A1_A2" \| "B1_B2" \| "C1_C2"` | yes | exact enum |
| `current_screen_key` | `string` | yes | non-empty |
| `runtime_contract_version` | `string` | yes | must match engine runtime schema version |
| `answers` | `object` | yes | task-keyed answer map |
| `saved_at` | `string` | yes | ISO 8601 UTC timestamp |

### Expiration Rules

- auth session expires when either logout succeeds locally or refresh token expiry is reached
- speaking session expires on screen exit, completion, explicit abandon, or app cold restart
- roleplay session expires at backend-provided `expires_at`
- YKI exam session expires when engine returns `410`, submission completes, or the engine runtime contract marks it closed

## 4.4 State Model

Auth session states:

- `unauthenticated`
- `restoring`
- `active`
- `refreshing`
- `expired`
- `logged_out`

Speaking session states:

- `idle`
- `active`
- `closed`

Roleplay session states:

- `created`
- `active`
- `awaiting_ai`
- `completed`
- `expired`
- `abandoned`

YKI exam session states:

- `not_started`
- `active`
- `submitted`
- `completed`
- `expired`
- `abandoned`

Transitions:

- auth: `unauthenticated -> restoring -> active`, `active -> refreshing -> active`, `active -> logged_out`, `refreshing -> expired`
- speaking: `idle -> active -> closed`
- roleplay: `created -> active -> awaiting_ai -> active`, `active -> completed`, `active -> abandoned`, `created/active/awaiting_ai -> expired`
- yki_exam: `not_started -> active -> submitted -> completed`, `active -> expired`, `active -> abandoned`

Invalid states:

- roleplay `completed` with `turn_count < 5`
- YKI `completed` without a prior `submitted`
- speaking `active` without a `speaking_session_id`
- auth `active` without `kt.auth.session.v1`

## 4.5 Failure Modes

What can fail:

- corrupted persisted session data
- stale roleplay cache
- expired engine session
- missing session token for YKI speaking endpoints
- mismatched speaking and roleplay session ids

System response:

- corrupted local session payloads are deleted immediately
- stale roleplay cache triggers a backend refetch; if backend rejects it, cache is removed
- YKI `410` clears the runtime cache and forces exit from the exam flow
- speaking session mismatch blocks the action and forces local session recreation

UI should do:

- resume only when the owning system still accepts the session
- show explicit “session expired” or “session cannot be restored” states
- never show stale transcript or exam state as current authoritative state

## 4.6 Edge Cases

- Network failure: keep local cache but mark it non-authoritative until backend or engine confirms.
- Partial data: reject any cached session missing `session_id`, `state`, or required timestamps.
- Repeated actions: repeated resume attempts on the same expired session must always produce the same clear-and-exit result.
- Invalid input: malformed ids, mismatched session kinds, or foreign-user session ids are rejected by backend or engine and cleared locally.
- App restart during speaking session: do not restore; speaking session ends on cold restart.
- App restart during roleplay or YKI: restore only if cache is structurally valid and remote owner confirms the session is still active.

## 4.7 Forbidden Behavior

- frontend must never fabricate backend-owned or engine-owned session completion
- frontend must never restore speaking audio capture state after cold restart
- backend must never accept a roleplay session from a different authenticated user
- app must never persist multiple active auth sessions under different keys
- YKI engine session token must never be exposed outside the YKI runtime adapter and local YKI cache

## 4.8 Integration Points

UI:

- auth screens consume auth session
- speaking flows consume speaking session
- roleplay screens consume roleplay cache plus backend session state
- YKI screens consume engine session plus local runtime cache

YKI engine:

- `exam_session_id` and `engine_session_token` are engine-owned and stored in `YkiRuntimeCache`

Other systems:

- auth contract defines auth token issuance and restore order
- voice contract requires `session_id`, `turn_id`, and optional `task_id` linkage
- roleplay contract owns five-turn roleplay lifecycle
- api contract owns envelope, versioning, and route namespace

## 4.9 Future Extension Rules

Safe extensions:

- add new session kinds only by extending `SessionDescriptor`
- add optional cache metadata fields
- add backend session invalidation endpoints

Must not change:

- speaking session remains in-memory only
- roleplay and YKI restore must be owner-confirmed, not local-only
- auth session remains single-snapshot persistence
- engine-issued YKI identifiers remain opaque and unparsed by frontend
