# KieliTaika — Unified UI/UX System (Final)

## 0. Design Direction (Locked)

- Mode: **Hybrid (Immersive B + Structured A)**
- Core principle: *Experience first, structure supports it*
- Visual tone: Dark, controlled glow, low-noise UI
- Interaction tone: Responsive, intelligent, subtle feedback

---

# 1. COLOR SYSTEM (Claude-level precision)

## 1.1 Base
- Background: #05070D
- Surface: #0B1220
- Elevated: #0F172A

## 1.2 Accent System
- Primary Blue: #3ABEFF
- Cyan Glow: #22D3EE
- Deep Blue: #1E3A8A

## 1.3 Feedback Colors (CRITICAL)

Correct:
- Background: #0E2F24
- Border: #10B981
- Text: #34D399

Wrong:
- Background: #2A0E12
- Border: #EF4444
- Text: #F87171

Neutral:
- Background: #111827
- Border: #374151

## 1.4 Progress Ring
- Track: #1F2937
- Progress: Gradient (Blue → Cyan)
- Glow intensity increases with %

---

# 2. TYPOGRAPHY

- Primary: Inter / SF Pro equivalent
- Secondary (branding): Light serif for headings

Sizes:
- Title: 28–34
- Section: 20–24
- Body: 15–17
- Micro: 12–13

Weight usage:
- Avoid heavy bold stacking
- Use contrast via color + spacing instead

---

# 3. ICON SYSTEM (FIXED)

Claude issue: inconsistent + weak icons → FIXED

Use:
- Lucide / Phosphor (thin, geometric)

Rules:
- Stroke: 1.5px
- No filled icons unless active
- Icons always aligned to 8px grid

States:
- Default: #9CA3AF
- Active: #3ABEFF
- Success: #10B981
- Error: #EF4444

---

# 4. SOUND SYSTEM (NEW — REQUIRED)

## 4.1 App Startup
Sound: **soft rising chime (light synth + air tone)**
- Duration: 600–900ms
- Purpose: signals "system ready"

## 4.2 Navigation
Sound: tap_soft.wav
- Low volume
- Used for transitions only

## 4.3 Success
Sound: success_chime.wav
- Trigger:
  - correct answer
  - completed task

## 4.4 Error
Sound: error.wav
- Subtle, not harsh

## 4.5 Microphone
- Start: mic_on.wav
- Stop: mic_off.wav
- Send: send1.wav

## 4.6 Session Completion
- Layered success tone (longer, emotional but controlled)

---

# 5. MOBILE APP DESIGN

## 5.1 Splash Screen
- Centered logo
- Subtle star glow animation
- Startup sound triggered

## 5.2 Home (Taika Hub)

Top:
- Greeting
- Progress ring (daily)

Main grid:
- Cards:
  - Vocabulary
  - Speaking
  - YKI Exam
  - Professional Finnish

Cards behavior:
- Slight hover lift
- Glow on press

---

## 5.3 Card Practice (CRITICAL)

Front:
- Word centered
- Minimal distractions

Back:
- Translation
- Example

Answers:
- Correct → green glow + soft expand
- Wrong → red + shake micro animation

---

## 5.4 Roleplay Screen (MIC CORE)

Layout:
- Chat bubbles center
- AI responses left
- User right

Bottom:
- **Floating microphone (primary interaction)**

Mic behavior:
- Tap → start recording
- Tap again → stop

While recording:
- Pulsing ring
- Live waveform

---

## 5.5 YKI Exam Flow

Reading:
- Passage first (full screen)
- Then questions

Listening:
- Audio first
- Then questions

Writing:
- Clean text editor

Speaking:
- Prompt + mic

---

## 5.6 Results Screen

- Big progress ring
- Stats grid
- CTA: Continue learning

---

# 6. WEB APP DESIGN (HYBRID)

## 6.1 Layout Structure

LEFT: Sidebar (collapsible)
CENTER: Main workspace (immersive)
RIGHT: AI / Mic panel (contextual)

---

## 6.2 Sidebar

- Minimal width
- Icons + labels
- Sections:
  - Home
  - Practice
  - Roleplay
  - YKI
  - Profile

Collapsed state:
- Icons only

---

## 6.3 Main Workspace

Mode dependent:

Practice:
- Card center

Roleplay:
- Chat interface

Exam:
- Fullscreen content

---

## 6.4 AI + Microphone Panel

Right side floating panel:

Contains:
- Mic button (primary)
- AI hints
- Feedback

Mic states:
- Idle → soft glow
- Recording → pulse + waveform

---

## 6.5 Interaction Priority

1. Content
2. Microphone
3. Navigation

---

# 7. MICROPHONE INTELLIGENCE (INTEGRATED)

Core behavior:

- Single tap start/stop
- Auto silence detection (optional future)

Feedback layers:

Visual:
- Pulse
- Waveform

Audio:
- Start/stop sounds

State:
- Idle
- Listening
- Processing
- Responding

---

# 8. ANIMATION SYSTEM

- Duration: 150–250ms
- Easing: ease-out

Avoid:
- Over animation
- Bouncy effects

Use:
- Subtle scale
- Opacity transitions

---

# 9. COMPONENT SYSTEM

Buttons:
- Primary: blue glow
- Secondary: outline
- Danger: red

Cards:
- Radius: 16–20px
- Shadow: very soft

Inputs:
- Dark background
- Blue focus ring

---

# 10. FINAL PRINCIPLES

- No visual noise
- No random colors
- Feedback must be immediate
- Microphone is a first-class feature
- Experience must feel intentional

---

# 11. MISSING CRITICAL DETAILS (NOW COMPLETED)

## 11.1 Spacing System (GLOBAL)

Base unit: 8px

- XS: 4px
- SM: 8px
- MD: 16px
- LG: 24px
- XL: 32px

Rules:
- All padding/margins must follow 8px grid
- Cards internal padding: 16–20px

---

## 11.2 Border Radius System

- Small elements: 8px
- Inputs / buttons: 12px
- Cards: 16–20px
- Floating mic: fully rounded (circle)

---

## 11.3 Shadows & Depth

- Level 1 (cards): very soft
- Level 2 (hover): slight lift + glow
- Level 3 (active): glow increase, no heavy shadow

No hard shadows anywhere.

---

## 11.4 Time / Progress UI (IMPORTANT)

Timers:
- Shape: pill or circular badge
- Background: #111827
- Active countdown:
  - turns red gradually

Progress bars:
- Height: 6–8px
- Rounded edges
- Gradient fill

---

## 11.5 Input Fields

- Background: #0F172A
- Border: subtle (#1F2937)
- Focus: blue glow ring

States:
- Error → red border
- Success → green border

---

## 11.6 Dropdowns / Selects

- Dark surface
- Highlight active option (blue glow)
- Hover: subtle background change

---

## 11.7 Navigation States

Sidebar:
- Active item:
  - Blue highlight
  - Slight background fill

Hover:
- Soft glow

---

## 11.8 Card Variants (FULL SET)

1. Vocabulary card
2. Grammar card
3. Sentence card
4. Exam question card
5. Roleplay message card

All share:
- Same radius
- Same padding logic

---

## 11.9 Microphone Exact Specs

Size:
- Mobile: 72–88px
- Web: 64–72px

States:
- Idle: soft blue glow
- Recording: pulsing cyan
- Processing: subtle rotation pulse

---

## 11.10 Waveform

- Minimal bars
- Cyan color
- Smooth animation

---

## 11.11 Notification System

Types:
- Success (green)
- Error (red)
- Warning (yellow)
- Info (blue)

Position:
- Top center (mobile)
- Top right (web)

---

## 11.12 Loading States

- Skeleton loaders (no spinners preferred)
- Soft shimmer animation

---

## 11.13 Empty States

- Icon + short text
- No large illustrations

---

## 11.14 Accessibility (IMPORTANT)

- Contrast ratio minimum 4.5:1
- Tap targets minimum 44px
- Audio optional toggle

---

## 11.15 Do Not Do

- No random gradients
- No inconsistent spacing
- No icon style mixing
- No loud animations

---

# 12. BEHAVIORAL SPECIFICATIONS (EXACT REPLICATION RULES)

## 12.1 ANSWER COLOR LOGIC (PRACTICE + YKI)

### States

- **Unselected**
  - bg: #0F172A
  - border: #1F2937
  - text: #D1D5DB

- **Selected (before submit)**
  - border: #3ABEFF
  - subtle blue glow (8–12% opacity)

- **Correct (after submit)**
  - bg: #0E2F24
  - border: #10B981
  - text: #34D399
  - right icon (check) appears at right end
  - **animation**: 120ms scale (1.00 → 1.02) + glow ramp
  - **sound**: success_chime.wav

- **Wrong (after submit)**
  - bg: #2A0E12
  - border: #EF4444
  - text: #F87171
  - wrong icon (x) at right end
  - **animation**: 2–3px horizontal shake (150ms)
  - **sound**: error.wav

- **Reveal mode (YKI review)**
  - correct answer stays green
  - user wrong choice stays red
  - others dimmed (opacity 60%)

### Selection Rules
- Only one selection allowed
- Lock input immediately after submit
- Next CTA enabled only after feedback shown (min 400ms)

---

## 12.2 YKI READING FLOW (PAGINATION — STRICT)

### Rule: **Text first, questions later (never mixed)**

**Page 1: Passage**
- Container: card with max-width (mobile: 92%, web: 720–840px)
- Typography:
  - line-height: 1.6–1.7
  - font-size: 15–17
- If content exceeds viewport:
  - **vertical scroll enabled inside card**
  - page footer shows "Lue teksti loppuun" hint

**Completion Gate**
- "Seuraava" (Next) disabled until:
  - user scrolls to bottom **or**
  - taps "Valmis"

**Page 2: Questions**
- New screen (no passage visible)
- Question cards stacked
- Timer visible (top right pill)

**Why**: prevents cognitive split; matches exam behavior

---

## 12.3 TIMER BEHAVIOR

- Format: mm:ss
- Container: pill (radius 999px)
- Color progression:
  - >50% time: neutral (#111827)
  - 50–20%: amber tint (#F59E0B, low opacity)
  - <20%: red (#EF4444) + subtle pulse

---

## 12.4 ROLEPLAY / CONVERSATION TRANSCRIPTS

### Message Types

- **AI message (left)**
  - bg: #111827
  - text: #E5E7EB
  - label (small): speaker name (e.g., "Sairaanhoitaja Minna")

- **User message (right)**
  - bg: #22D3EE (reduced opacity to 85–90%)
  - text: #022C22 (dark for contrast)

### Structure
- Max width bubble: 75%
- Spacing between messages: 12–16px

### Streaming Behavior (AI)
- Typing indicator: 3 dots pulse
- Then text appears linearly (not word-by-word jitter)

### Transcript Persistence
- Entire conversation stored
- Scroll position sticks to bottom unless user scrolls up

---

## 12.5 MICROPHONE (ROLEPLAY + SPEAKING)

### Interaction
- Tap → start (play mic_on.wav)
- Tap → stop (play mic_off.wav)

### Visual States
- Idle: soft cyan halo (2–4px blur)
- Recording:
  - expanding pulse every 800ms
  - waveform active above button
- Processing:
  - pulse slows
  - color shifts slightly toward blue

### Accessibility
- Long-press alternative for shaky input

---

## 12.6 CARD SIZING RULES (TEXT FIT)

- Cards must **expand vertically to fit content**
- No truncation for learning content
- Min height: 160px
- Max width:
  - mobile: 92%
  - web: 680px

---

## 12.7 SETTINGS SCREEN (COMPLETE)

Sections:

1. **Profile**
2. **Account**
3. **Appearance**
4. **Language Assistant**
5. **Audio & Speech (NEW — REQUIRED)**

### Audio & Speech
- Speech speed (slider)
  - range: 0.75x → 1.25x
  - default: 1.0x
- Voice selection (if multiple)
- Mic sensitivity (optional later)

### Toggle Behavior
- Immediate feedback (no save button)
- subtle click sound (tap_soft.wav)

---

## 12.8 NAVIGATION RULES

- Mobile:
  - Back always top-left
  - No hidden gestures required

- Web:
  - Sidebar persistent
  - Context panel optional collapse

---

## 12.9 TRANSITION RULES

- Page → page: fade + slight slide (y: 8px)
- Card flip: 180° Y-axis, 200ms

---

## 12.10 DATA FEEDBACK TIMING

- Answer feedback: immediate (0–100ms)
- AI response: 300–800ms delay (feels natural)

---

## 12.11 STRICT IMPLEMENTATION GUARANTEE

A screen is considered "correctly implemented" only if:

- Color states match exactly
- Spacing follows 8px grid
- All sounds mapped to actions
- Mic states visually distinguishable
- YKI flow strictly separated (text → questions)

---

# END (FULLY COMPLETE SYSTEM — IMPLEMENTATION READY)

