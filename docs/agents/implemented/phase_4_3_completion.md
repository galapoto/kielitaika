# PHASE 4.3 COMPLETION — TARGETED UX FIXES

## 1. PURPOSE

Complete missing UX elements identified in audit.

NO redesign.
ONLY targeted fixes.

---

## 2. FIX A — CARD FLIP INTERACTION

### Problem

Cards are static.

---

### Required Behavior

Card must have:

- front (prompt)
- back (answer/explanation)

---

### Implementation

Modify:

frontend/app/screens/CardsScreen.tsx

---

### Add:

- flip state (boolean)
- reveal button OR tap-to-flip
- CSS flip animation

---

### Requirements

- smooth 3D flip (or equivalent)
- no layout jump
- answer hidden until flip

---

## 3. FIX B — YKI MICROPHONE ERROR CONSISTENCY

### Problem

YKI does not display recorder.error properly.

---

### Required Fix

Modify:

frontend/app/screens/YkiExamScreen.tsx

---

### Add:

- StatusBanner (same as Voice Studio)
- display recorder.error.message

---

### Result

Mic behavior becomes consistent across:

- Voice Studio
- YKI

---

## 4. FIX C — YKI SCREEN TRANSITIONS

### Problem

Panel not keyed → transitions not replayed

---

### Required Fix

Wrap main YKI panel with:

key={screen.id}

---

### Result

- each backend-driven screen change triggers animation
- transitions become visible and meaningful

---

## 5. VALIDATION

After fixes:

- card flips smoothly
- mic error visible in YKI
- YKI transitions animate per screen

---

## 6. FAILURE RULE

If:

- card reveals without flip
- mic errors hidden
- transitions still static

→ PHASE INCOMPLETE
