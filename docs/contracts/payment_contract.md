# Payment Contract

Status: `frozen`  
Mode: `fail-closed`  
Scope: subscription tiers, entitlement checks, checkout, portal, and billing lifecycle

## 4.1 System Overview

The payment system controls subscription tier state and billing flows for the app.

The payment system does:

- expose the user’s current tier and entitlement map
- create checkout sessions for paid tier upgrades
- create customer portal sessions for active subscribers
- reconcile billing events into subscription state
- define upgrade, downgrade, and expiration behavior

The payment system does not do:

- authenticate users
- decide UI layout
- gate YKI engine internals directly
- assume a specific provider SDK in frontend code

System boundaries:

- frontend calls app payment and subscription endpoints only
- backend owns billing-provider communication and entitlement reconciliation
- billing provider is abstracted as `billing_provider`

## 4.2 Ownership

Frontend responsibility:

- fetch subscription status
- request checkout or portal sessions from the app backend
- react to entitlement changes returned by backend
- never call the billing provider directly

Backend responsibility:

- define canonical tier and feature map
- create checkout and portal sessions
- receive and verify billing webhooks
- activate, renew, expire, upgrade, or downgrade subscription state
- enforce server-side feature access

External services:

- one billing provider may exist behind backend as `billing_provider`
- provider identity is intentionally not part of the frontend contract

## 4.3 Data Structures

### Canonical Tiers

Allowed tier values:

- `free`
- `general_premium`
- `professional_premium`

### Feature Entitlement Map

`FeatureAccess`

| Field | Type | Required | Validation |
| --- | --- | --- | --- |
| `available` | `boolean` | yes | exact value |
| `limit` | `integer` | yes | `-1` means unlimited, `0` means not available, positive means capped |
| `unit` | `string` | yes | stable usage unit |
| `message` | `string` | yes | non-empty user-facing explanation |

Canonical tier rules:

| Tier | `general_finnish` | `workplace` | `yki` |
| --- | --- | --- | --- |
| `free` | available, `limit=10`, `unit=conversations_per_week` | available, `limit=3`, `unit=lessons_total` | available, `limit=1`, `unit=speaking_attempts_per_month` |
| `general_premium` | available, `limit=-1`, `unit=unlimited` | unavailable, `limit=0`, `unit=not_available` | unavailable, `limit=0`, `unit=not_available` |
| `professional_premium` | available, `limit=-1`, `unit=unlimited` | available, `limit=-1`, `unit=unlimited` | available, `limit=-1`, `unit=unlimited` |

This table is authoritative and resolves the legacy frontend conflict where one old path falsely treated free-tier workplace and YKI access as fully unavailable.

### Subscription Status

`GET /api/v1/subscription/status`

Response `data`:

| Field | Type | Required | Validation |
| --- | --- | --- | --- |
| `user_id` | `string` | yes | authenticated user id |
| `tier` | tier enum | yes | exact enum |
| `features` | `object` | yes | keyed by feature id with `FeatureAccess` values |
| `expires_at` | `string \| null` | yes | ISO 8601 UTC timestamp or `null` for non-expiring free tier |
| `trial_ends_at` | `string \| null` | yes | ISO 8601 UTC timestamp or `null` |
| `is_trial` | `boolean` | yes | exact value |
| `is_active` | `boolean` | yes | exact value |

`POST /api/v1/subscription/check-feature`

Request:

| Field | Type | Required | Validation |
| --- | --- | --- | --- |
| `feature` | `"general_finnish" \| "workplace" \| "yki"` | yes | exact enum |

Response `data`:

| Field | Type | Required | Validation |
| --- | --- | --- | --- |
| `feature` | `string` | yes | requested feature id |
| `allowed` | `boolean` | yes | exact value |
| `reason` | `string \| null` | yes | null when allowed |
| `tier` | tier enum | yes | current tier |

### Checkout

`POST /api/v1/payments/checkout-sessions`

Request:

| Field | Type | Required | Validation |
| --- | --- | --- | --- |
| `target_tier` | `"general_premium" \| "professional_premium"` | yes | paid tiers only |
| `trial_days` | `integer` | no | `0-30` |
| `success_url` | `string` | yes | absolute deep link or HTTPS URL |
| `cancel_url` | `string` | yes | absolute deep link or HTTPS URL |

Response `data`:

| Field | Type | Required | Validation |
| --- | --- | --- | --- |
| `checkout_session_id` | `string` | yes | opaque provider session id |
| `checkout_url` | `string` | yes | absolute URL |
| `target_tier` | tier enum | yes | requested target tier |
| `expires_at` | `string` | yes | ISO 8601 UTC timestamp |

### Customer Portal

`POST /api/v1/payments/customer-portal-sessions`

Request:

| Field | Type | Required | Validation |
| --- | --- | --- | --- |
| `return_url` | `string` | yes | absolute deep link or HTTPS URL |

Response `data`:

| Field | Type | Required | Validation |
| --- | --- | --- | --- |
| `portal_session_id` | `string` | yes | opaque provider session id |
| `portal_url` | `string` | yes | absolute URL |
| `expires_at` | `string` | yes | ISO 8601 UTC timestamp |

### Billing Webhook Ingest

`POST /api/v1/payments/webhooks`

Headers:

- provider signature header required

Response `data`:

| Field | Type | Required | Validation |
| --- | --- | --- | --- |
| `received` | `boolean` | yes | exact value `true` |
| `event_type` | `string` | yes | provider event type |
| `reconciled` | `boolean` | yes | exact value |

### Subscription Lifecycle Rules

- free tier is always active
- paid checkout creates a pending billing state until verified provider confirmation
- upgrade becomes effective only after verified provider success
- downgrade to free is effective at the next billing boundary unless access must end immediately because billing has already lapsed
- expired paid tier falls back to `free`

## 4.4 State Model

States:

- `free_active`
- `checkout_pending`
- `paid_trial`
- `paid_active`
- `renewal_pending`
- `downgrade_scheduled`
- `expired`
- `payment_failed`

Transitions:

- `free_active -> checkout_pending -> paid_trial`
- `free_active -> checkout_pending -> paid_active`
- `paid_trial -> paid_active`
- `paid_active -> renewal_pending -> paid_active`
- `paid_active -> downgrade_scheduled -> free_active`
- `paid_active -> payment_failed -> expired -> free_active`

Invalid states:

- paid tier without verified backend reconciliation
- `general_premium` with workplace or YKI entitlement enabled
- `free` with unlimited workplace or YKI entitlement

## 4.5 Failure Modes

What can fail:

- checkout creation
- portal creation
- webhook verification
- renewal payment
- subscription status fetch

System response:

- checkout or portal failure returns app error envelope
- webhook verification failure rejects the event and does not mutate subscription state
- failed renewal moves the user to `payment_failed`, then to `expired` when grace handling ends

UI should do:

- show current tier from backend only
- refresh status after checkout success or portal return
- remove premium access immediately when backend status falls back to `free`

## 4.6 Edge Cases

- Network failure: do not change local entitlement assumptions; keep last confirmed backend state until next successful fetch.
- Partial data: reject subscription payloads missing `tier` or `features`.
- Repeated actions: repeated checkout requests create new checkout sessions; frontend must ignore stale ones after a newer session exists.
- Invalid input: requesting checkout for `free` or an unknown tier is rejected.
- Expired checkout URL: user must request a new checkout session.
- Upgrade from `general_premium` to `professional_premium`: effective only after verified billing success.
- Downgrade during trial: transition to `free` at trial end unless the provider reports immediate cancellation.

## 4.7 Forbidden Behavior

- frontend must never infer entitlements from old hardcoded booleans
- frontend must never call the billing provider directly
- backend must never grant paid access before verified provider confirmation
- provider-specific names, ids, or SDK semantics must never become required frontend logic
- route gating must never rely on stale local entitlement state when a fresh backend status is available

## 4.8 Integration Points

UI:

- onboarding, upgrade modals, and settings subscription screens consume `/subscription/status` and payment session endpoints

YKI engine:

- none directly; entitlement gating happens in app backend before engine access is granted

Other systems:

- auth contract carries `subscription_tier` in the auth user snapshot
- api contract provides response envelope and route versioning
- feature matrix preserved gating rules are implemented from this contract, not from legacy frontend conditionals

## 4.9 Future Extension Rules

Safe extensions:

- add new paid tiers in a contract revision
- add more feature ids to the entitlement map
- add grace-period metadata or invoice-state metadata

Must not change:

- tier ids `free`, `general_premium`, `professional_premium` without explicit migration contract
- backend-only billing provider integration rule
- canonical feature access table in this document without explicit contract revision
