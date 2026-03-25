# KieliTaika Microphone Intelligence System (KAIL) — v2 FINAL

---

# 0. PURPOSE

This document defines the complete, implementation-ready microphone system for KieliTaika.

The microphone is treated as a controlled, intelligent system — not a simple recorder.

Primary goals:
- Deterministic exam recording (YKI)
- Natural tap-to-speak interaction
- Intelligent but predictable behavior
- Zero hidden logic
- Full recoverability and reliability

Core interaction rule:

> User taps microphone → speaks → taps again to stop

No automatic stopping. No guessing user intent.

---

# 1. CORE DESIGN PRINCIPLE

The microphone system is built around **explicit user control + assisted intelligence**.

- User controls start/stop
- System observes and assists
- System never overrides user intent

---

# 2. SYSTEM ARCHITECTURE

## 2.1 Layers

### Layer 1 — Capture Layer (Frontend)
- microphone input
- device routing
- audio buffering
- chunk creation

### Layer 2 — Real-Time Intelligence (Frontend)
- silence detection
- speech detection
- level monitoring
- noise estimation

### Layer 3 — Orchestration Layer (Frontend)
- state machine control
- event coordination
- UI synchronization

### Layer 4 — Processing Layer (Backend)
- transcription
- pronunciation scoring
- fluency analysis
- confidence scoring

---

# 2.2 ROLEPLAY INTEGRATION LAYER (ADDITIVE — NON-BREAKING)

This layer integrates the microphone system with the Roleplay Engine without modifying core behavior.

### Principles
- No change to tap-to-start/stop
- No auto-stop introduced
- No AI inside recording layer
- All additions are contextual and post-recording

### New Concept: Recording Context

```
recording_context = {
  mode: "exam" | "roleplay",
  conversation_id?: string,
  turn_number?: number,
  speaker_role?: "user"
}
```

This context is injected into the orchestrator at session start.

---

# 3. CORE COMPONENT — AUDIO SESSION ORCHESTRATOR

## File:
`frontend/audio/orchestrator/audio_session_orchestrator.ts`

This is the **single controller of the microphone system**.

It owns:
- state transitions
- recording lifecycle
- chunk handling
- UI events

### State Machine

```
idle → ready → recording → processing → done
```

### Extended State Machine (Roleplay Only)

```
idle → ready → recording → processing → awaiting_ai → ready
```

Error path:
```
any → error → idle
```

### Responsibilities

- startRecording()
- stopRecording()
- handleChunkCreation()
- emitUIEvents()
- triggerUpload()

### Additional Responsibilities (Roleplay Mode Only)

- attach recording_context
- trigger roleplay turn submission
- lock/unlock microphone during AI phase

No UI component is allowed to control recording directly.

---

# 4. MICROPHONE INTERACTION MODEL

## 4.1 User Flow

1. User taps microphone
2. Start sound plays (preloaded asset)
3. System enters recording state
4. User speaks
5. User taps microphone again
6. Stop sound plays
7. System processes audio

---

## 4.2 Sound Feedback

### Required Sounds

- `mic_start.wav`
- `mic_stop.wav`

### Rules

- must play instantly (<50ms delay)
- must not block recording start
- must be preloaded in memory

---

# 5. AUDIO CAPTURE DESIGN

## 5.1 Chunking

Audio is split into chunks:

- duration: 1–2 seconds
- written immediately to storage

### Chunk Schema

```
chunk = {
  session_id,
  task_id,
  attempt_id,
  chunk_index,
  start_time_ms,
  end_time_ms,
  duration_ms,
  audio_path,
  checksum,
  uploaded,

  // Roleplay additions (non-breaking)
  conversation_id?: string,
  turn_number?: number
}
```

### Rules

- append-only
- no overwriting
- deterministic ordering

---

## 5.2 Device Handling

Detect and support:
- built-in mic
- wired headset
- bluetooth headset

### Behavior

- auto-switch allowed
- show UI indicator
- never silently fail

---

# 6. REAL-TIME INTELLIGENCE (FRONTEND ONLY)

## 6.1 Strict Constraints

Allowed:
- signal processing
- threshold detection

Not allowed:
- AI models
- speech-to-text
- grammar analysis

---

## 6.2 Silence Detection

### Logic

```
speech_start: RMS > threshold for 120ms
speech_end: RMS < threshold for 800–1200ms
```

### Use

- visual hints only
- never stops recording

---

## 6.3 Level Meter

Tracks:
- input amplitude
- clipping

UI feedback:
- smooth animation
- no jitter

---

## 6.4 Noise Detection

- baseline noise captured at start
- dynamic threshold adjustment

---

# 7. RECORDING BEHAVIOR RULES

## MUST

- recording starts immediately after tap
- recording stops only on user tap
- no auto-stop

## MUST NOT

- interrupt user speech
- modify audio
- delay start

---

# 8. UPLOAD SYSTEM

## Component

`AudioUploadQueue`

### States

```
pending → uploading → uploaded → failed → retry
```

### Features

- persistent storage
- retry with backoff
- background processing

---

# 9. BACKEND PROCESSING PIPELINE

## Steps

1. reconstruct audio
2. validate chunk sequence
3. run analysis
4. store results

---

## Analysis Modules

- transcription
- pronunciation
- fluency
- confidence

---

## Confidence Formula (v1)

```
confidence =
  w1 * continuity +
  w2 * stability +
  w3 * pause_penalty_inverse
```

Normalized to 0–100

---

# 9.1 ROLEPLAY PROCESSING PIPELINE (ADDITIVE)

This pipeline is triggered only when:

```
recording_context.mode == "roleplay"
```

## Steps

1. finalize chunk set
2. trigger fast transcription
3. send to Roleplay Engine
4. wait for AI response
5. return AI message + optional audio
6. unlock microphone

---

## Fast Transcription Mode

```
fast_transcription = true
```

Characteristics:
- lower latency
- acceptable minor inaccuracies
- optimized for response speed

---

# 10. UI/UX SPECIFICATION

## 10.1 Microphone Button

States:

- idle → soft glow
- recording → red pulse
- processing → spinner
- done → checkmark

### Additional State (Roleplay)

- awaiting_ai → dim + disabled

---

## 10.2 Waveform

- 48 bars
- reacts to real audio
- noise = dim color

---

## 10.3 Timer

- visible during recording
- turns red at 80%

---

## 10.4 Feedback Display

After recording:

- Fluency score
- Pronunciation score
- Confidence score

---

## 10.5 Roleplay UX Additions

- turn indicator (1–5)
- AI speaking indicator
- microphone locked during AI response

---

# 11. EVENT SYSTEM (FRONTEND)

```
onRecordingStart()
onRecordingStop()
onChunkSaved()
onSilenceDetected()
onUploadProgress()
onProcessingComplete()

// Roleplay additions
onTurnRecordingComplete()
onAwaitingAI()
onAIResponseReceived()
```

---

# 12. RELIABILITY

## Crash Handling

- restore from chunks

## Network Failure

- retry queue

## Guarantees

- no data loss
- consistent state

---

# 13. PERFORMANCE TARGETS

| Metric | Target |
|------|--------|
| Mic start latency | <150ms |
| UI response | <50ms |
| Chunk processing | <40ms |

---

# 14. SECURITY

- encrypted uploads
- session validation
- no background recording

---

# 15. STRICT RULES

1. No AI during recording
2. No auto-stop
3. No audio modification
4. Backend handles all scoring
5. Frontend only displays signals

---

# 16. ROLEPLAY-SPECIFIC RULES (ADDITIVE)

1. Each recording = one turn
2. Recording must attach turn_number
3. Microphone must lock during AI response
4. No overlapping turns
5. System must wait for AI before next recording

---

# 17. FINAL BEHAVIOR SUMMARY

The microphone must feel:

- instant
- predictable
- controlled
- intelligent but not intrusive

User always knows:
- when recording starts
- when it stops
- what the system is doing

No surprises.

---

# END OF DOCUMENT

