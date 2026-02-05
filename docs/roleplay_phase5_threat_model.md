# Roleplay Phase 5 Threat Model

Date: 2026-02-05
Scope: Backend persistence, scoring, and privacy controls for Roleplay attempts.

## Data Sensitivity
Roleplay transcripts can include workplace context and potential PII. Audio, microphone buffers, and interim transcripts are explicitly out of scope for storage.

## Identified Risks
- **Speech content sensitivity**: user transcripts may contain PII or sensitive workplace details.
- **Workplace context exposure**: profession fields could reveal sensitive context if misused.
- **PII leakage**: transcripts or identifiers could leak to logs or other users.
- **Accidental logging**: transcript content appearing in logs could violate privacy.

## Mitigations
- **Minimal data retention**: store only completed sessions with required fields.
- **No audio storage**: raw audio, buffers, and metadata are never persisted.
- **Auth/content separation**: every read/write requires authenticated user.
- **Strict access control**: ownership check on every read and score action.
- **Retention boundaries**: only completed attempts stored; no partial or interim data.
- **No cross-user access**: attempt lookup is user-scoped.
- **Logging limits**: only IDs and error codes are logged; no transcript content.

## Residual Risk
Transcripts are inherently sensitive. Limiting storage to completed attempts and preventing cross-user access significantly reduces risk.
