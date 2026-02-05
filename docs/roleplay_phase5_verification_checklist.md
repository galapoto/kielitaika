# Roleplay Phase 5 Verification Checklist

## Gate 1 — Safety
- [ ] No diffs in locked frontend files.
- [ ] Locked files explicitly unchanged:
  - frontend/app/components/AudioPlayer.js
  - frontend/app/services/tts.ts
  - frontend/app/hooks/useVoiceStreaming.js
  - frontend/app/services/stt.js
  - frontend/app/components/MicButton.js
  - frontend/app/context/SpeakingSessionContext.js
  - frontend/app/utils/speakingAttempts.js
  - frontend/app/screens/RoleplayScreen.js

## Gate 2 — Correctness
- [ ] `/roleplay/complete` rejects incomplete sessions.
- [ ] `/roleplay/score` rejects incomplete attempts.
- [ ] `/roleplay/{attempt_id}` enforces ownership.

## Gate 3 — Privacy
- [ ] Threat model doc present.
- [ ] No audio storage verified in schema.
- [ ] Logs contain IDs only (no transcript content).

## Gate 4 — Idempotency
- [ ] Duplicate `/roleplay/complete` with same `client_session_id` is safe.
- [ ] Duplicate `/roleplay/score` returns existing score.

## Artifacts
- [ ] Database tables created: `roleplay_attempts`, `roleplay_turns`, `roleplay_scores`.
- [ ] Router endpoints present under `/roleplay`.
