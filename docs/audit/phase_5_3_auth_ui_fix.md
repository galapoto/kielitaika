# Phase 5.3 Auth UI Fix

Date: `2026-03-26`

## Scope

Phase 5.3 corrected the auth entry flow in the new repo by:

- restoring a Google OAuth browser flow in the backend and frontend
- restructuring the login screen around product-facing copy and hierarchy
- reusing legacy users and entitlements from the previous app database instead of creating a separate auth universe
- keeping the current app session model, API envelope, and persisted auth cache key `kt.auth.session.v1`

## Google Auth Implementation

Backend changes:

- Added `POST /api/v1/auth/google` in [`backend/api/auth_routes.py`](/home/vitus/kielitaika/backend/api/auth_routes.py).
- Added `GET /api/v1/auth/google/callback` in [`backend/api/auth_routes.py`](/home/vitus/kielitaika/backend/api/auth_routes.py).
- Added Google OAuth state/result handoff service in [`backend/services/google_oauth_service.py`](/home/vitus/kielitaika/backend/services/google_oauth_service.py).
- Added browser-flow support with:
  - backend-owned Google authorization URL creation
  - PKCE verifier/challenge generation
  - callback code exchange against Google
  - identity token validation for issuer, audience, expiry, and verified email
  - one-time backend result handoff back to the frontend
- Successful Google auth ends in the same auth payload shape as password login: `auth_user` + `tokens`.

Frontend changes:

- Added Google auth start/finalize client functions in [`frontend/app/services/authService.ts`](/home/vitus/kielitaika/frontend/app/services/authService.ts).
- Added Google auth completion path in [`frontend/app/state/AppStateProvider.tsx`](/home/vitus/kielitaika/frontend/app/state/AppStateProvider.tsx).
- Added Google button and popup flow handling in [`frontend/app/screens/AuthScreen.tsx`](/home/vitus/kielitaika/frontend/app/screens/AuthScreen.tsx).
- The frontend still uses the existing API client and persists the returned auth bundle under `kt.auth.session.v1`.

## Legacy Database Reuse

Legacy reuse is implemented through [`backend/services/legacy_auth_adapter.py`](/home/vitus/kielitaika/backend/services/legacy_auth_adapter.py).

Current behavior:

- Legacy source: `/home/vitus/Documents/puhis/backend/local_data.db`
- Reused tables:
  - `users`
  - `user_entitlements`
- Matching is email-first and canonicalized to lowercase.
- If a matching legacy user exists:
  - password login reuses that user instead of creating a duplicate
  - Google login reuses that user instead of creating a duplicate
  - `subscription_tier`, `subscription_expires_at`, and `trial_ends_at` are carried into the current auth user record
- Legacy bcrypt password hashes are accepted by the new verifier through the compatibility path added in [`backend/core/utils.py`](/home/vitus/kielitaika/backend/core/utils.py).

Verified reuse result:

- Legacy paid user `ruka@ruka.com` resolved to legacy id `2731b648-0764-4aab-a406-7a0138ce1618`
- Google-linked login reused that same id
- `professional_premium` remained intact

## Login UI Restructure

Auth screen changes were made in [`frontend/app/screens/AuthScreen.tsx`](/home/vitus/kielitaika/frontend/app/screens/AuthScreen.tsx) and [`frontend/app/theme/global.css`](/home/vitus/kielitaika/frontend/app/theme/global.css).

Before:

- system-facing heading: `Enter The Language Field`
- system/internal subtitle about protected route rendering
- tabbed auth mode UI prioritized over product hierarchy

After:

- top copy: `Welcome to`
- centered logo and `KieliTaika` brand lockup
- product copy under logo
- email/password form directly below
- primary sign-in button
- Google button
- secondary links: `Forgot password`, `Sign up`

User-facing copy removed:

- `Auth state must settle before any protected route renders`
- `Enter The Language Field`

## Contract Alignment

Updated authority docs:

- [`docs/contracts/auth_contract.md`](/home/vitus/kielitaika/docs/contracts/auth_contract.md)
- [`docs/contracts/system_orchestration_contract.md`](/home/vitus/kielitaika/docs/contracts/system_orchestration_contract.md)

The contract now reflects:

- legacy-user reuse by email
- Google-specific start/finalize/callback flow

## Verification

Completed:

- `python3 -m py_compile` on the touched backend auth files: `PASS`
- `npm run build` in [`frontend/`](/home/vitus/kielitaika/frontend): `PASS`
- direct runtime check for legacy reuse: `PASS`
  - duplicate register on legacy email returned `AUTH_EMAIL_EXISTS`
  - Google-linked login reused legacy paid user id and preserved `professional_premium`
  - token-backed `get_current_user()` returned the preserved tier

Not fully verified in this run:

- live browser Google round-trip against Google servers
- manual visual review of the auth page in a browser viewport
- real email/password login with a known legacy credential

Reason:

- this run validated compile/build and local auth-service behavior, but not a full live backend + browser + Google console configuration round-trip.

## Risk Notes

- A fully live Google sign-in still depends on correct Google OAuth client registration for the backend callback URL used by this repo.
- The `Forgot password` link is present for layout parity, but password reset itself is still not implemented.
