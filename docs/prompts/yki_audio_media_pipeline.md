
# KIELITAIKA — PHASE 3 EXECUTION (YKI AUDIO PIPELINE)

You are implementing the YKI listening media system.

This is NOT a general TTS feature.

This is an **exam-grade deterministic media pipeline**.

---

# NON-NEGOTIABLE RULES

1. Same input text → MUST produce the SAME audio file
2. Audio MUST be cached and reused
3. NO runtime generation during exam playback
4. Playback MUST NEVER depend on external API latency
5. Client MUST NOT generate audio

---

# TARGET AREAS

Backend:
- apps/backend/yki/*
- apps/backend/tts/*
- apps/backend/api/*

Frontend:
- packages/ui/screens/YkiExamScreen.tsx
- apps/client/features/yki-exam/*

Existing:
- /api/audio proxy
- ElevenLabs integration
- deterministic cache logic (already partially implemented)

---

# IMPLEMENTATION SCOPE

## 1. DETERMINISTIC AUDIO KEY

For every listening item:

Generate:

- hash(text + voiceId + settings)

This MUST be:
- stable
- repeatable
- collision-safe

---

## 2. AUDIO REGISTRY (BACKEND)

Create or extend:

- audio registry store

Each entry:

- id (hash)
- text
- voiceId
- file path / URL
- created_at

---

## 3. PRE-RENDER PIPELINE

When exam session is created:

- ALL listening audio MUST be generated ahead of time

NOT during playback.

---

## 4. AUDIO STORAGE

Store audio:

- locally or managed storage
- accessible via /api/audio/{id}

Must support:

- fast retrieval
- no regeneration

---

## 5. PLAYBACK GUARANTEE

Frontend must:

- ONLY request pre-generated audio
- NEVER trigger generation
- handle:
  - loading state
  - playback ready state

---

## 6. VALIDATION LAYER

Before playback:

- ensure audio exists
- if missing:
  → fail fast (do NOT fallback to generation silently)

---

## 7. ENGINE INTEGRATION

Ensure:

- YKI session payload includes audio references
- NOT raw text for playback

---

# HARD RULES

- NO inline generation in UI
- NO direct ElevenLabs calls from frontend
- NO "if missing then generate" during exam
- MUST use deterministic cache

---

# VALIDATION

Run:

- backend tests
- tsc --noEmit
- npm run controlled_ui_contract_validation

---

# OUTPUT FORMAT

1. Files created
2. Files modified
3. Pipeline behavior implemented
4. Validation results
5. Errors encountered
6. Success / failure

---

# AUDIT

AUDIT

A. Determinism
- Same input → same audio: ✅/❌
- No runtime generation: ✅/❌

B. Media Integrity
- Audio always available before playback: ✅/❌
- No missing assets: ✅/❌

C. Backend Authority
- Audio generated only server-side: ✅/❌

D. Playback Stability
- No playback delay due to generation: ✅/❌

E. Violations
- List or "None"

SYSTEM STATE
- Media Reliability: Low / Medium / High / Exam-grade
