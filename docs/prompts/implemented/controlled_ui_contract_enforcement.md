# controlled_ui_contract_enforcement

Implemented strict governed response validation for learning and YKI practice on the client.

## What changed

- Added shared runtime schema enforcement in `packages/core/api/governedResponseValidation.ts`
- Wired learning and YKI services to reject invalid or ungoverned payloads before state/UI usage
- Standardized client-side failure categorization around `CONTRACT_VIOLATION`, `GOVERNANCE_MISSING`, and `TRANSPORT_ERROR`
- Removed route-level fallback recommendation logic and UI-side learning mutations
- Locked YKI playback UI to governed backend flow without client retry/reorder controls
- Surfaced governance metadata directly in learning and YKI screens
- Added a focused contract test proving that missing governance metadata fails validation

## Validation

- `node apps/client/tests/controlled_ui_contract_validation.test.cjs`
- `./apps/client/node_modules/.bin/tsc --noEmit -p apps/client/tsconfig.json`
