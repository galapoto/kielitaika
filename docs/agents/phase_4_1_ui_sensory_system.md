# PHASE 4.1 — UI/UX SENSORY SYSTEM

## 1. PURPOSE

Add controlled sensory feedback to the system:

- audio
- visual backgrounds
- interaction feedback

WITHOUT breaking architecture or contracts.

---

## 2. RULES

- NO direct asset usage inside components
- ALL media goes through services
- NO logic duplication
- NO async side-effects inside UI rendering

---

## 3. AUDIO SYSTEM

Create:

frontend/app/services/audioService.ts

---

### Must support:

- playTap()
- playError()
- playSuccess()
- playMicStart()
- playMicStop()
- playWelcome()

---

### Behavior:

- preload sounds
- prevent overlapping spam
- fail silently if unavailable

---

## 4. MICROPHONE INTEGRATION

Hook into:

voice runtime

---

### Required:

- onStart → playMicStart()
- onStop → playMicStop()

---

## 5. INTERACTION SOUNDS

Apply:

- button press → tap sound
- correct answer → success sound
- wrong answer → error sound

---

## 6. BACKGROUND SYSTEM

Create:

frontend/app/theme/backgrounds.ts

---

### Map:

- screen → background image
- dark mode support

---

### Apply:

- Auth
- Dashboard
- Cards
- Roleplay
- YKI

---

## 7. LOGO SYSTEM

Create:

frontend/app/components/Logo.tsx

---

### Use in:

- Auth screen
- Header
- Splash

---

## 8. WELCOME SOUND

Trigger:

AppStateProvider

---

### Rules:

- play once per app load
- not on every navigation

---

## 9. ERROR SOUND

Global:

- any visible error → playError()

---

## 10. PERFORMANCE RULE

- audio must not block UI
- images must not slow rendering

---

## 11. VALIDATION

- no console errors
- no UI lag
- sounds play correctly
- backgrounds load correctly

---

## 12. FAILURE RULE

If:

- sounds trigger incorrectly
- UI slows down
- assets are used directly

→ INVALID
