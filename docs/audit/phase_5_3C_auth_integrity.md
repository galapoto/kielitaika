# Phase 5.3C Auth Integrity

Date: `2026-03-26`

## Summary

Phase 5.3C hardened auth integrity around three areas:

- password verification now rejects invalid hash states explicitly
- runtime auth now raises `AUTH_DATA_CORRUPTION` for broken auth records instead of masking them as bad credentials
- legacy migration now contains deterministic duplicate-resolution logic and validation hooks

## Implementation

Updated files:

- `backend/core/utils.py`
- `backend/services/auth_service.py`
- `backend/scripts/migrate_legacy_users.py`

### Password Compatibility

`verify_password` now:

- detects hash format before verification
- supports bcrypt-style hashes by prefix (`$2a$`, `$2b$`, `$2y$`)
- supports the current PBKDF-style hash format
- raises `PasswordHashError` for empty, malformed, or unsupported hashes

Observed verification behavior:

- valid bcrypt hash + wrong password -> returns `False`
- valid PBKDF hash + wrong password -> returns `False`
- empty hash -> explicit error
- malformed hash -> explicit error

### Runtime Safeguards

`login_user()` now:

- loads users through an integrity check that verifies `email_index` and the `users` bucket agree
- raises `AUTH_DATA_CORRUPTION` when:
  - multiple user records exist for one email
  - `email_index` points to the wrong or missing user
  - password hash data is invalid or unverifiable
- still returns `AUTH_INVALID_CREDENTIALS` for a normal wrong password

### Migration Hardening

`backend/scripts/migrate_legacy_users.py` now:

- treats legacy user data as authoritative for migrated auth fields
- preserves the existing canonical `user_id` when the email already exists in the new system
- overwrites:
  - `password_hash`
  - `subscription_tier`
  - `subscription_expires_at`
  - `trial_ends_at`
- merges `provider_links`
- updates `updated_at` when the canonical record changes
- rewires auth/provider references to the canonical `user_id`
- removes duplicate user entries from the store
- validates each processed user for:
  - non-empty password hash
  - normalized email
  - correct `email_index`
  - hash verifiability

## Duplicate Resolution Summary

Live store migration run:

- total users processed: `21`
- migrated users: `0`
- duplicates resolved: `0`
- invalid hashes: `0`
- failed validations: `0`
- errors: `0`

The live store was already clean when this phase ran, so no duplicate records remained to rewrite in-place.

Controlled duplicate-resolution proof on a temporary state snapshot:

- injected a duplicate `testi@testi.com` record with:
  - bad password hash
  - conflicting subscription tier
  - separate Google provider link
- migration result:
  - duplicates resolved: `1`
  - canonical `user_id` preserved: `7221ab62-82c8-47fb-a102-65a7c1668f1f`
  - duplicate user removed
  - `provider_index` rewired to the canonical user
- second run on the resolved snapshot:
  - duplicates resolved: `0`
  - invalid hashes: `0`
  - failed validations: `0`
  - errors: `0`

## Login Verification Results

Verified on the live runtime store:

- `ruka@ruka.com` password login succeeded
- `testi@testi.com` password login succeeded
- incorrect password for `ruka@ruka.com` returned `AUTH_INVALID_CREDENTIALS`
- Google login for `ruka@ruka.com` reused canonical user `2731b648-0764-4aab-a406-7a0138ce1618`
- `ruka@ruka.com` kept:
  - `subscription_tier = professional_premium`
  - `subscription_expires_at = 2026-01-27T01:11:26.209568`

Negative-path runtime checks:

- invalid password hash now raises `AUTH_DATA_CORRUPTION`
- duplicate user records for one email now raise `AUTH_DATA_CORRUPTION`

## Store Consistency

Confirmed on `backend/runtime/state.json`:

- duplicate emails remaining: `0`
- broken `email_index` mappings: `0`

No legacy adapter usage remains in runtime auth, and the live store now enforces a single authoritative identity per email.
