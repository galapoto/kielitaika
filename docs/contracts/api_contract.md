# API Contract

Status: `frozen`  
Mode: `fail-closed`  
Scope: app-facing API plus YKI engine separation rules

## 4.1 System Overview

The API system defines the public HTTP and WebSocket surface the frontend may call, the success and error envelope format for app APIs, route versioning, and the adapter boundary between the app backend and the YKI engine.

The API system does:

- define the app API namespace
- define the app response envelope
- define error format
- define auth requirements per namespace
- define the adapter-only boundary to the YKI engine

The API system does not do:

- define internal database models
- redefine engine runtime payload schemas
- allow frontend direct calls to private backend services

System boundaries:

- frontend public base path: `/api/v1`
- frontend public websocket base path: `/api/v1/ws`
- YKI engine base path is separate and not frontend-public

## 4.2 Ownership

Frontend responsibility:

- call only `/api/v1/**` and `/api/v1/ws/**`
- treat all app JSON responses according to the envelope below
- never call the YKI engine directly

Backend responsibility:

- own `/api/v1/**`
- normalize auth, session, payment, roleplay, card, and voice responses into the app envelope
- bridge YKI requests from app routes to the engine

YKI engine responsibility:

- own raw engine exam routes and raw `ExamRuntimeContract`
- validate engine session tokens
- manage exam runtime and certification

External services:

- only backend may call external billing, identity, speech, or other providers

## 4.3 Data Structures

### App API Envelope

All app JSON endpoints under `/api/v1/**` must return this envelope.

Success envelope:

| Field | Type | Required | Validation |
| --- | --- | --- | --- |
| `ok` | `true` | yes | exact value |
| `data` | `object \| array \| string \| boolean \| number \| null` | yes | endpoint-specific payload |
| `error` | `null` | yes | exact value |
| `meta.request_id` | `string` | yes | opaque non-empty request id |
| `meta.timestamp` | `string` | yes | ISO 8601 UTC timestamp |
| `meta.api_version` | `"v1"` | yes | exact value |

Error envelope:

| Field | Type | Required | Validation |
| --- | --- | --- | --- |
| `ok` | `false` | yes | exact value |
| `data` | `null` | yes | exact value |
| `error.code` | `string` | yes | stable machine code, uppercase snake case |
| `error.message` | `string` | yes | human-readable summary |
| `error.retryable` | `boolean` | yes | exact retry guidance |
| `error.details` | `object \| array \| null` | yes | validation or domain detail |
| `meta.request_id` | `string` | yes | opaque non-empty request id |
| `meta.timestamp` | `string` | yes | ISO 8601 UTC timestamp |
| `meta.api_version` | `"v1"` | yes | exact value |

### Versioning Strategy

- breaking change: new path version such as `/api/v2`
- additive non-breaking field: allowed within `/api/v1`
- field removal or semantic change: forbidden inside `/api/v1`

### Public Route Namespaces

| Namespace | Auth Required | Purpose |
| --- | --- | --- |
| `/api/v1/auth/*` | mixed | authentication lifecycle |
| `/api/v1/subscription/*` | yes | entitlement status and feature checks |
| `/api/v1/payments/*` | yes except webhooks | checkout, portal, billing state |
| `/api/v1/session/*` | yes | session metadata when needed |
| `/api/v1/voice/*` | yes | STT, TTS, pronunciation |
| `/api/v1/roleplay/*` | yes | roleplay runtime |
| `/api/v1/cards/*` | yes | cards runtime |
| `/api/v1/yki/*` | yes | app-owned YKI adapter endpoints |

### YKI Adapter vs Engine Separation

Frontend-facing YKI adapter routes:

| App Route | Method | Engine Mapping |
| --- | --- | --- |
| `/api/v1/yki/sessions` | `POST` | `POST /exam/start` |
| `/api/v1/yki/sessions/{session_id}` | `GET` | `GET /exam/{session_id}` |
| `/api/v1/yki/sessions/{session_id}/answers` | `POST` | `POST /exam/{session_id}/answer` |
| `/api/v1/yki/sessions/{session_id}/writing` | `POST` | `POST /exam/{session_id}/writing` |
| `/api/v1/yki/sessions/{session_id}/audio` | `POST` | `POST /exam/{session_id}/audio` |
| `/api/v1/yki/sessions/{session_id}/speaking/conversation` | `POST` | `POST /exam/speaking/start_conversation` |
| `/api/v1/yki/sessions/{session_id}/speaking/turns` | `POST` | `POST /exam/speaking/submit_turn` |
| `/api/v1/yki/sessions/{session_id}/speaking/reply` | `POST` | `POST /exam/speaking/generate_reply` |
| `/api/v1/yki/sessions/{session_id}/submit` | `POST` | `POST /exam/{session_id}/submit` |
| `/api/v1/yki/sessions/{session_id}/certificate` | `GET` | `GET /exam/{session_id}/certificate` |

Adapter validation rules:

- frontend never receives or submits raw engine route paths
- adapter stores and forwards `engine_session_token`
- engine `ExamRuntimeContract` is returned inside the app envelope as `data.runtime`

### Binary and Stream Exceptions

These routes do not use the JSON envelope:

- cached audio file `GET` requests that return raw audio bytes
- websocket routes under `/api/v1/ws/**`

Those routes must still emit structured JSON errors before close when the protocol allows it.

## 4.4 State Model

States:

- `idle`
- `requesting`
- `success`
- `client_error`
- `server_error`
- `network_error`
- `unauthorized`
- `rate_limited`

Transitions:

- `idle -> requesting`
- `requesting -> success`
- `requesting -> client_error`
- `requesting -> server_error`
- `requesting -> network_error`
- `requesting -> unauthorized`
- `requesting -> rate_limited`
- any error state -> `idle` on explicit retry

Invalid states:

- treating a non-envelope app JSON response as success
- treating engine raw response as app public API
- retrying a non-retryable error automatically

## 4.5 Failure Modes

What can fail:

- malformed request payload
- authentication failure
- authorization failure
- backend internal error
- upstream engine error
- upstream provider error
- rate limiting

System response:

- app backend always returns the error envelope for `/api/v1/**`
- engine errors are translated into stable app error codes on adapter routes
- backend preserves raw engine payload only in server logs, not in frontend contract

UI should do:

- inspect `ok`
- show `error.message`
- branch on `error.retryable`
- clear auth state on repeated `AUTH_SESSION_EXPIRED`

## 4.6 Edge Cases

- Network failure: no synthetic success payload may be created; frontend gets transport failure only.
- Partial data: missing `meta.request_id`, `ok`, or `error/data` pairing invalidates the response.
- Repeated actions: idempotency is required for logout and safe for repeated `GET`s; non-idempotent `POST`s must be explicitly guarded by frontend in-flight state.
- Invalid input: backend returns `VALIDATION_ERROR` with field details.
- Engine timeout: adapter returns `YKI_ENGINE_TIMEOUT`, `retryable=true`.
- Engine unavailable: adapter returns `YKI_ENGINE_UNAVAILABLE`, `retryable=true`.

## 4.7 Forbidden Behavior

- frontend must never call engine `/exam/*` routes directly
- app backend must never expose raw internal exception text in public error messages
- app JSON endpoints must never return mixed success and error fields
- versionless app routes are forbidden
- UI logic must never determine authorization instead of backend checks

## 4.8 Integration Points

UI:

- all frontend services consume `/api/v1/**`

YKI engine:

- app backend adapter is the only integration point
- engine runtime contract remains authoritative inside adapter translation

Other systems:

- auth contract defines auth payloads
- payment contract defines subscription and payment payloads
- voice contract defines transport payloads
- roleplay and cards consume the same envelope and versioning rules

## 4.9 Future Extension Rules

Safe extensions:

- new namespaces under `/api/v1/*`
- additive fields in `data`
- new stable error codes

Must not change:

- `/api/v1` as the app public namespace
- app envelope field names
- frontend prohibition on direct engine access
- separation between app adapter API and raw YKI engine API
