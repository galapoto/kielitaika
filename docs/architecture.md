# PUHIS Architecture (snapshot)

- **Frontend:** Expo React Native app for mobile; lightweight Next.js web shell. Key components: MicRecorder, AudioPlayer, TutorBubble, WebSocket hooks for STT/TTS, lesson and YKI screens.
- **Backend:** FastAPI with routers for voice, session, grammar, yki, subscription, users. Services for conversation, grammar, STT/TTS, YKI, memory, subscription; utilities for VAD, compression, Omorfi wrapper; async SQLAlchemy DB.
- **Learning Paths:** General Finnish, Töihin (workplace modules such as nurse, doctor, ICT, sähköinsinööri, logistics, cleaning, hoiva-avustaja), YKI prep. Path will influence personas, vocab, tasks, and pricing (General vs Professional tiers).
- **Core flow:** audio → STT → conversation engine (with grammar + memory + path persona) → TTS → playback. Grammar/YKI engines add analysis; subscription gates premium features.
- **Next steps:** fill service logic (OpenAI calls, scoring, DB persistence), flesh out workplace/YKI content, wire WebSocket audio streaming, add auth/subscription plumbing.
