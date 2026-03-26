# KieliTaika — FULL EXECUTION-GRADE TRANSITION & UI/UX SPEC (NEW REPO)

---

# 0. PURPOSE (NON-NEGOTIABLE)

This document is the **single source of truth** for rebuilding KieliTaika in the new repo:

```
/home/vitus/kielitaika/
```

It is written so that:
- NO agent can improvise
- NO behavior is undefined
- NO layout is ambiguous
- ALL flows are deterministic

Any implementation that deviates from this document is invalid.

---

# 1. GLOBAL NON-NEGOTIABLE RULES

## 1.1 Architecture
- Backend owns ALL logic
- Frontend renders ONLY
- No duplicate logic across layers
- No direct LLM calls outside orchestrators

## 1.2 UI
- Must match new design system exactly
- No additional UI elements
- No missing elements

## 1.3 Background System
- Backgrounds must match OLD app placement
- Overlay must ALWAYS be applied
- Text must NEVER sit directly on raw image

## 1.4 Microphone
- NEVER auto-stop
- ALWAYS user-controlled
- MUST follow microphone system spec fileciteturn0file4

## 1.5 Roleplay
- MUST follow roleplay engine exactly fileciteturn0file4
- Fixed 5-turn system
- No free chat

---

# 2. REPO STRUCTURE (FINAL)

```
kielitaika/

  frontend/
    app/
      screens/
      components/
      roleplay/
      exam/
      cards/
      mic/
      auth/
      payments/
      state/
      services/
      theme/
      assets/
        backgrounds/

  backend/
    api/
    roleplay/
    cards/
    ai/
    audio/
    payments/

  engine/
    card_pipeline/
    exam_engine/
    roleplay_engine/
```

---

# 3. GLOBAL DESIGN SYSTEM

## 3.1 Layout Grid
- Desktop: 12-column grid
- Mobile: single column
- Max width: 1280px
- Padding: 24px desktop / 16px mobile

## 3.2 Card System
- Border radius: 24px
- Padding: 16–20px
- Glow border: subtle blue/purple gradient
- Background: rgba(20,20,40,0.6) + blur(20px)

## 3.3 Typography
- Title: 24–32px
- Section: 18–22px
- Body: 14–16px

## 3.4 Colors
- Primary: #4FD1FF
- Accent: #9F7AEA
- Error: #FF4D6D
- Success: #4ADE80

---

# 4. NAVIGATION SYSTEM

## 4.1 Desktop
- Left sidebar (fixed)
- Width: 260px
- Sections:
  - Dashboard
  - Practice
  - YKI Exam
  - Roleplay
  - Workplace
  - Settings

## 4.2 Mobile
- Bottom navigation bar
- 4 icons max

---

# 5. AUTH FLOW

## Screen: LOGIN

### Layout
- Full screen background
- Center card (400px width)

### Components
- Logo
- App name
- Google login button

### Behavior
- Click → OAuth
- Success → Dashboard

---

# 6. DASHBOARD

## Layout
- Sidebar (left)
- Content (center)

## Sections
- Practice Hub
- YKI Exam
- Roleplay

---

# 7. PRACTICE HUB SCREEN

## Layout
- 3 main cards in grid

### Cards
1. Vocabulary
2. Grammar
3. Sentence

## Behavior
- Click → respective module

---

# 8. CARD SYSTEM (STRICT)

Reference: fileciteturn0file5

## 8.1 Layout
- Single card centered
- Max width: 500px

## 8.2 States
- FRONT
- BACK

## 8.3 Front
- Main text only

## 8.4 Back
- Answer
- Explanation

## 8.5 Interactions
- Tap → flip
- Swipe → next

## 8.6 Input Modes
- MCQ
- Typing
- Fill-in

---

# 9. YKI EXAM SYSTEM (STRICT FLOW)

## 9.1 Flow

1. Intro
2. Instructions
3. Rules
4. Sections

---

## 9.2 READING (CRITICAL)

### Page 1: Passage
- FULL SCREEN text
- NO questions visible

### Page 2: Questions
- Only after next click

---

## 9.3 LISTENING

### Page 1: Prompt
- Audio player
- Instructions

### Page 2: Questions

---

## 9.4 WRITING

- Prompt at top
- Large input area

---

## 9.5 SPEAKING

- Mic centered
- Prompt above

---

# 10. MICROPHONE SYSTEM (FULL)

Reference: fileciteturn0file4

## 10.1 States
- idle
- recording
- processing
- ai_response

## 10.2 Behavior
- Tap → start
- Tap → stop
- No auto-stop

## 10.3 UI
- Circular mic button
- Glow animation

## 10.4 Locking Rules
- Disabled during AI response
- Disabled during processing

---

# 11. ROLEPLAY SYSTEM (FULL)

Reference: fileciteturn0file4

## 11.1 Screens

### Setup Screen
- Scenario selection
- Level selection

### Session Screen

#### Layout
- Header
- Chat area
- Mic input

#### Chat
- AI bubble (left)
- User bubble (right)

#### Turn System
- EXACTLY 5 user turns

#### Flow
1. AI starts
2. User responds
3. Repeat
4. Close after 5th

### Review Screen
- Transcript
- Feedback

---

# 12. BACKGROUND SYSTEM (STRICT IMPLEMENTATION)

## 12.1 Mapping

- login → login_bg.png
- dashboard → home_bg.png
- practice → practice_bg.png
- roleplay → roleplay_bg.png
- exam → exam_bg.png

## 12.2 Overlay Rules
- dark gradient overlay REQUIRED
- blur layer REQUIRED

---

# 13. PAYMENTS

## Behavior
- Subscription only
- Locked features until paid

## UI
- Pricing screen
- Upgrade modal

---

# 14. SETTINGS

## Sections
- Account
- Audio
- Language
- Theme

---

# 15. STATE MANAGEMENT

## Global State
- auth
- session
- subscription

## Local State
- screen-level UI

## Rule
- No business logic in frontend

---

# 16. API CONTRACT USAGE

Frontend must ONLY use:

- /roleplay/*
- /cards/*
- /exam/*

No custom endpoints

---

# 17. SCREEN LIST (COMPLETE)

## Entry
- Splash
- Login

## Core
- Dashboard
- Practice Hub
- Vocabulary
- Grammar
- Sentence

## Exam
- Intro
- Instructions
- Rules
- Reading Passage
- Reading Questions
- Listening Prompt
- Listening Questions
- Writing
- Speaking
- Results

## Roleplay
- Setup
- Session
- Review

## Other
- Settings
- Payments

---

# 18. TRANSITION PLAN (STRICT)

## Step 1
Create repo structure

## Step 2
Move backend unchanged

## Step 3
Rebuild frontend from scratch

## Step 4
Integrate APIs

## Step 5
Test all flows

---

# 19. AGENT ENFORCEMENT RULES

Agent MUST NOT:
- invent UI
- change flows
- merge screens
- skip steps

Agent MUST:
- follow screen specs exactly
- use defined components only

---

# 20. FINAL RULE

If something is not defined here → DO NOT implement it.

This document is complete and executable.

