# Auth Contract

Status: `frozen`  
Mode: `fail-closed`  
Scope: new-repo app auth only

## 4.1 System Overview

The auth system establishes user identity for the app, issues and refreshes tokens, restores the authenticated session on app launch, and terminates the session on logout.

The auth system does:

- register email/password users
- authenticate existing users
- support provider-based login only through backend-controlled provider exchange
- issue access and refresh tokens
- restore the last persisted authenticated session
- expose the current authenticated user snapshot

The auth system does not do:

- billing or subscription mutation
- route gating decisions beyond exposing the current entitlement snapshot
- profile editing outside the authenticated identity payload
- YKI engine session creation
- microphone, roleplay, or card session management

System boundaries:

- frontend talks only to app auth endpoints
- backend is the only token issuer and token verifier for app auth
- external identity providers, if enabled, are backend-only integrations

## 4.2 Ownership

Frontend responsibility:

- collect credentials or provider authorization result
- call auth endpoints
- persist exactly one auth snapshot under `kt.auth.session.v1`
- attach `Authorization: Bearer <access_token>` to authenticated app API requests
- clear persisted auth state immediately on logout, refresh rejection, or session corruption

Backend responsibility:

- validate credentials
- hash and verify passwords
- issue, rotate, and verify tokens
- return the canonical authenticated user snapshot
- advertise enabled auth methods
- enforce auth rate limits and reject malformed payloads

External services:

- optional identity provider exchange service, accessed only by backend
- no provider is assumed by this contract; provider identifiers are backend-advertised values

## 4.3 Data Structures

### Canonical Objects

`AuthUser`

| Field | Type | Required | Validation |
| --- | --- | --- | --- |
| `user_id` | `string` | yes | opaque non-empty identifier |
| `email` | `string` | yes | valid email, lowercase in canonical form |
| `name` | `string \| null` | yes | `null` or trimmed string, max 120 chars |
| `subscription_tier` | `"free" \| "general_premium" \| "professional_premium"` | yes | one of the payment contract tiers |

`AuthTokens`

| Field | Type | Required | Validation |
| --- | --- | --- | --- |
| `access_token` | `string` | yes | opaque JWT or opaque token; non-empty |
| `refresh_token` | `string` | yes | opaque JWT or opaque token; non-empty |
| `token_type` | `"Bearer"` | yes | exact value |
| `access_expires_at` | `string` | yes | ISO 8601 UTC timestamp |
| `refresh_expires_at` | `string` | yes | ISO 8601 UTC timestamp |
| `auth_session_id` | `string` | yes | opaque non-empty identifier |

`PersistedAuthSession`

| Field | Type | Required | Validation |
| --- | --- | --- | --- |
| `schema_version` | `"1"` | yes | exact value |
| `auth_user` | `AuthUser` | yes | current authenticated user snapshot |
| `tokens` | `AuthTokens` | yes | must be complete |
| `restored_at` | `string` | yes | ISO 8601 UTC timestamp |

### Endpoint Payloads

All JSON responses use the app API envelope defined in `api_contract.md`.

`GET /api/v1/auth/methods`

Response `data`:

| Field | Type | Required | Validation |
| --- | --- | --- | --- |
| `methods` | `array` | yes | each item must match `AuthMethod` |

`AuthMethod`

| Field | Type | Required | Validation |
| --- | --- | --- | --- |
| `method_id` | `string` | yes | unique stable identifier such as `password` or backend-enabled provider id |
| `kind` | `"password" \| "provider"` | yes | exact value |
| `enabled` | `boolean` | yes | must be `true` to render or submit |
| `display_name` | `string` | yes | non-empty UI label |

`POST /api/v1/auth/register/password`

Request:

| Field | Type | Required | Validation |
| --- | --- | --- | --- |
| `email` | `string` | yes | valid email |
| `password` | `string` | yes | 8-128 chars |
| `name` | `string \| null` | no | `null` or trimmed string, max 120 chars |

Response `data`:

| Field | Type | Required | Validation |
| --- | --- | --- | --- |
| `auth_user` | `AuthUser` | yes | canonical user snapshot |
| `tokens` | `AuthTokens` | yes | canonical token bundle |

`POST /api/v1/auth/login/password`

Request:

| Field | Type | Required | Validation |
| --- | --- | --- | --- |
| `email` | `string` | yes | valid email |
| `password` | `string` | yes | 8-128 chars |

Response `data`: same as register.

`POST /api/v1/auth/login/provider`

Request:

| Field | Type | Required | Validation |
| --- | --- | --- | --- |
| `provider_id` | `string` | yes | must match an enabled `method_id` from `/auth/methods` where `kind=provider` |
| `provider_token` | `string` | yes | opaque non-empty token/code from provider flow |
| `redirect_uri` | `string \| null` | no | absolute URI if provider flow uses redirect return |

Response `data`: same as register.

`POST /api/v1/auth/google`

Purpose:

- start the Google OAuth browser flow when `oauth_result_id` is omitted
- finalize a completed Google OAuth browser flow when `oauth_result_id` is present

Start request:

| Field | Type | Required | Validation |
| --- | --- | --- | --- |
| `redirect_origin` | `string` | yes | absolute frontend origin allowed by backend CORS policy |
| `oauth_result_id` | `string \| null` | no | omitted for start |

Start response `data`:

| Field | Type | Required | Validation |
| --- | --- | --- | --- |
| `provider` | `"google"` | yes | exact value |
| `authorization_url` | `string` | yes | absolute Google OAuth URL |
| `expires_at` | `string` | yes | ISO 8601 UTC timestamp |

Finalize request:

| Field | Type | Required | Validation |
| --- | --- | --- | --- |
| `oauth_result_id` | `string` | yes | one-time backend-issued completion identifier |
| `redirect_origin` | `string \| null` | no | ignored on finalize |

Finalize response `data`: same as register.

`GET /api/v1/auth/google/callback`

Purpose:

- Google OAuth redirect target owned by backend
- exchanges authorization code for tokens
- validates Google identity token issuer, audience, and expiry
- resolves existing user by canonical email before creating a new account
- redirects back to frontend with a one-time `oauth_result_id`

`POST /api/v1/auth/token/refresh`

Request:

| Field | Type | Required | Validation |
| --- | --- | --- | --- |
| `refresh_token` | `string` | yes | non-empty; must be unexpired and valid |

Response `data`: same as register.

`GET /api/v1/auth/session`

Headers:

- `Authorization: Bearer <access_token>` required

Response `data`:

| Field | Type | Required | Validation |
| --- | --- | --- | --- |
| `auth_user` | `AuthUser` | yes | canonical user snapshot |
| `auth_session_id` | `string` | yes | current backend auth session id |
| `available_auth_methods` | `array` | yes | current enabled method list |

`POST /api/v1/auth/logout`

Headers:

- `Authorization: Bearer <access_token>` required

Request:

| Field | Type | Required | Validation |
| --- | --- | --- | --- |
| `refresh_token` | `string` | yes | token to revoke for this device session |
| `auth_session_id` | `string` | yes | must match the active persisted session |

Response `data`:

| Field | Type | Required | Validation |
| --- | --- | --- | --- |
| `logged_out` | `boolean` | yes | exact value `true` |

### Token Rules

- access token lifetime: 30 minutes
- refresh token lifetime: 7 days
- refresh rotates both access and refresh tokens
- frontend stores only the latest rotated token pair
- backend is source of truth for token validity

## 4.4 State Model

States:

- `unauthenticated`
- `discovering_methods`
- `submitting_credentials`
- `authenticated`
- `refreshing`
- `restoring`
- `logging_out`
- `expired`
- `error`

Transitions:

- `unauthenticated -> discovering_methods`
- `discovering_methods -> unauthenticated`
- `unauthenticated -> submitting_credentials`
- `submitting_credentials -> authenticated`
- `submitting_credentials -> error`
- `authenticated -> refreshing`
- `refreshing -> authenticated`
- `refreshing -> expired`
- `unauthenticated -> restoring`
- `restoring -> authenticated`
- `restoring -> expired`
- `authenticated -> logging_out`
- `logging_out -> unauthenticated`
- `error -> unauthenticated`
- `expired -> unauthenticated`

Invalid states:

- authenticated with missing `refresh_token`
- authenticated with missing `auth_user`
- restoring while another login request is in flight
- logging out while using a different `auth_session_id` than the persisted one

## 4.5 Failure Modes

What can fail:

- invalid credentials
- duplicate registration email
- provider exchange rejection
- expired or invalid refresh token
- session lookup failure
- backend unavailable
- corrupted persisted auth snapshot

System response:

- backend returns structured error envelope with stable error code
- frontend clears corrupted persisted auth state before retry
- frontend attempts exactly one refresh during session restoration
- logout clears local auth state even if backend logout fails

UI should do:

- show credential or provider-specific error message
- return user to unauthenticated state on refresh failure
- never keep the user on an authenticated route after `expired`

## 4.6 Edge Cases

- Network failure: keep current screen, do not mutate auth state to authenticated, allow retry.
- Partial data: reject any response missing `auth_user` or required token fields; clear local state.
- Repeated actions: duplicate login/register submissions are client-blocked while a request is in flight; backend still treats each request independently.
- Invalid input: invalid email, empty password, short password, and disabled provider ids are rejected before state transition to `authenticated`.
- App launch with expired access token and valid refresh token: perform one refresh, then re-run `GET /auth/session`.
- App launch with expired refresh token: clear storage and enter `unauthenticated`.

## 4.7 Forbidden Behavior

- frontend must never mint, decode-for-authority, or extend tokens locally
- frontend must never guess enabled provider ids
- backend must never return a partial authenticated payload
- logout must never leave stale tokens in local storage
- session restoration must never reuse a refresh token after refresh rejection
- auth state must never be stored under multiple competing storage keys

## 4.8 Integration Points

UI:

- login, register, and settings/logout screens call only the endpoints above
- route protection consumes authenticated state from the restored `PersistedAuthSession`

YKI engine:

- none directly; auth applies only through the app backend adapter layer

Other systems:

- session contract owns storage shape and restoration ordering
- payment contract owns tier semantics; auth only carries the current `subscription_tier`
- api contract owns response envelope and error envelope

## 4.9 Future Extension Rules

Safe extensions:

- add new provider methods through `/api/v1/auth/methods`
- provider-specific OAuth browser handshakes may use backend-owned `/api/v1/auth/<provider>` start/finalize routes plus a backend callback route
- add password reset or email verification endpoints under `/api/v1/auth/*`
- add optional fields to `AuthUser` only if they are nullable or backward-compatible

Must not change:

- token pair rotation semantics
- single persisted auth snapshot key `kt.auth.session.v1`
- 30-minute access token and 7-day refresh token lifetimes without explicit contract revision
- requirement that backend, not frontend, is the only auth authority
