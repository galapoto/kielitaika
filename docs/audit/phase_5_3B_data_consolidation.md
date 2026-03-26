# Phase 5.3B Data Consolidation

Date: `2026-03-26`

## Summary

Phase 5.3B removed the runtime dependency on the legacy SQLite auth database and consolidated legacy users into the current auth state store.

- Runtime legacy adapter removed: `backend/services/legacy_auth_adapter.py`
- Runtime auth path now reads only from: `backend/runtime/state.json`
- One-time migration script added: `backend/scripts/migrate_legacy_users.py`

## Migration Implementation

The migration script:

- connects directly to `/home/vitus/Documents/puhis/backend/local_data.db`
- reads `users` and the latest matching `user_entitlements` row per user
- maps legacy plan types into current `subscription_tier`
- preserves `password_hash`, `subscription_expires_at`, and `trial_ends_at`
- uses canonical lowercase email as the duplicate key
- prefers the current-system record when an email already exists
- logs each migrated user, skipped duplicate, and error

## Migration Result

First execution result:

- migrated users: `20`
- skipped duplicates: `1`
- errors: `0`

Skipped duplicate:

- `ruka@ruka.com` remained on the current-system record `2731b648-0764-4aab-a406-7a0138ce1618`

Idempotency check on a second execution:

- migrated users: `0`
- skipped duplicates: `21`
- errors: `0`

Current consolidated auth store size after migration:

- total users in `backend/runtime/state.json`: `175`

## Entitlement Preservation

Verified preserved records:

- `ruka@ruka.com`
  - `subscription_tier = professional_premium`
  - `subscription_expires_at = 2026-01-27T01:11:26.209568`
- `admin@ruka.app`
  - `subscription_tier = professional_premium`
- `testi@testi.com`
  - password hash preserved
- `vitus@ruka.com`
  - password hash preserved

Google login still reuses the canonical current user for `ruka@ruka.com` and does not create a duplicate record.

## Runtime Dependency Removal

Confirmed:

- `backend/services/auth_service.py` no longer imports or calls the legacy adapter
- `backend/core/config.py` no longer exposes `legacy_auth_db_path`
- backend search for `legacy_auth_adapter`, `load_legacy_user`, `legacy_auth_db_path`, and `local_data.db` returned no runtime matches outside the migration script

## Verification

Commands executed:

- `python3 -m py_compile backend/services/auth_service.py backend/core/config.py backend/scripts/migrate_legacy_users.py`
- `python3 backend/scripts/migrate_legacy_users.py`
- `python3 backend/scripts/migrate_legacy_users.py` (second run for duplicate/idempotency verification)

Functional checks executed in-process:

- password login succeeded for migrated user `testi@testi.com`
- password login succeeded for canonical user `ruka@ruka.com`
- Google login reused existing user `2731b648-0764-4aab-a406-7a0138ce1618`
- subscription data for `ruka@ruka.com` remained intact

## Outcome

The new system is now the sole auth source of truth at runtime. Legacy auth data has been merged into the current store, duplicate creation is blocked by canonical email, and no runtime read path to the old database remains.
