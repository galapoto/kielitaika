🔧 PART 1 — FIX PLAN (SCROLLING + DISTORTION)
🔴 ROOT CAUSE
Your background/logo layer is affecting layout flow instead of being purely visual.

That means one of these is happening:

Logo/background is inside normal DOM flow

Not using position: fixed

Parent container height is expanding

Missing overflow control

Content not bounded

✅ TARGET BEHAVIOR
Background + logo = visual only (zero layout impact)

🧱 FIX STRATEGY (STRICT)
1. FORCE APP ROOT TO LOCK VIEWPORT
html, body, #root {
  height: 100%;
  overflow: hidden;
}
2. APP ROOT MUST NOT GROW
.app-root {
  height: 100vh;
  overflow: hidden;
  position: relative;
}
3. BACKGROUND + LOGO MUST BE FIXED (NOT ABSOLUTE)
.bg-image,
.bg-logo {
  position: fixed;  /* NOT absolute */
  inset: 0;
  z-index: 0;
  pointer-events: none;
}
4. CONTENT IS THE ONLY SCROLLABLE AREA
.content {
  position: relative;
  z-index: 2;

  height: 100%;
  overflow-y: auto;

  padding: 24px;
}
5. REMOVE ANY HEIGHT FROM LOGO
❌ WRONG:

.bg-logo {
  height: 200vh;
}
✅ CORRECT:

.bg-logo {
  background-size: 60%;
}
6. PREVENT DOUBLE SCROLL BUG
body {
  overflow: hidden;
}
🧪 QUICK TEST
After fix:

Page should NOT scroll unless content overflows

Logo should NOT move when scrolling

No vertical stretch

⚠️ EXTRA ISSUE I SEE IN YOUR SCREEN
❌ Duplicate header block
You have:

YKI Exam
Listening Questions
appearing twice (stacked)

👉 That means:

Component rendered twice

OR layout nested incorrectly

Fix:
Check:

<AppLayout>
  <Page>
    <Page> ❌ WRONG
🎯 RESULT AFTER FIX
No distortion

No unwanted scroll

Clean layered UI

Background behaves correctly

🚀 NEXT PHASE STRUCTURE
We now proceed exactly as you requested:

📦 PHASE 1 — DESIGN TOKENS SYSTEM (THEME ENGINE)
This is the foundation of visual consistency.

We do this first so:

spacing becomes automatic

colors consistent

typography controlled

agent can enforce rules programmatically

🎨 DESIGN TOKENS (CREATE THIS FILE)
// theme/tokens.ts

export const tokens = {
  colors: {
    bg: "#0b1220",
    card: "#111827",
    cardLight: "#ffffff",

    textPrimary: "#ffffff",
    textSecondary: "#cbd5e1",
    textDark: "#111827",

    accent: "#22c55e",
    border: "rgba(255,255,255,0.08)"
  },

  spacing: {
    xs: "8px",
    sm: "16px",
    md: "24px",
    lg: "32px",
    xl: "48px"
  },

  radius: {
    sm: "12px",
    md: "16px",
    lg: "20px"
  },

  typography: {
    heading: {
      fontSize: "32px",
      letterSpacing: "-0.5px",
      lineHeight: "1.2"
    },
    body: {
      fontSize: "16px",
      letterSpacing: "0.2px",
      lineHeight: "1.5"
    }
  },

  shadow: {
    card: "0 10px 30px rgba(0,0,0,0.3)"
  }
}
🎯 APPLY TOKENS TO CSS
:root {
  --color-bg: #0b1220;
  --color-card: #111827;
  --color-text: #ffffff;

  --space-sm: 16px;
  --space-md: 24px;

  --radius-md: 16px;
}
🧠 WHY THIS MATTERS
Without tokens:

spacing becomes random

UI drifts again

agent cannot enforce consistency

With tokens:

everything becomes predictable

symmetry is automatic

🧩 PHASE 2 — COMPONENT LIBRARY
We will define:

Button (primary interaction)

Card (layout foundation)

Input (forms)

AnswerOption (your exam UI — very important)

PageContainer (structure enforcement)

All tied to your design tokens.

🔘 1. BUTTON SYSTEM (CRITICAL)
Types:
Primary (main action → Next)

Secondary (less important)

Ghost (minimal / inline)

✅ Button Component
// components/ui/Button.tsx
import { ReactNode } from "react"
import "./button.css"

type Props = {
  children: ReactNode
  variant?: "primary" | "secondary" | "ghost"
  icon?: ReactNode
  onClick?: () => void
}

export default function Button({
  children,
  variant = "primary",
  icon,
  onClick
}: Props) {
  return (
    <button className={`btn btn-${variant}`} onClick={onClick}>
      {icon && <span className="btn-icon">{icon}</span>}
      {children}
    </button>
  )
}
🎨 Button Styles
/* button.css */

.btn {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;

  padding: 14px 16px;
  border-radius: var(--radius-md);

  font-size: 15px;
  letter-spacing: 0.5px;

  transition: all 0.2s ease;
}

/* Primary */
.btn-primary {
  background: #22c55e;
  color: #000;
}

.btn-primary:hover {
  transform: scale(1.02);
}

/* Secondary */
.btn-secondary {
  background: rgba(255,255,255,0.08);
  color: white;
}

/* Ghost */
.btn-ghost {
  background: transparent;
  color: #cbd5e1;
}
🧱 2. CARD SYSTEM (MOST IMPORTANT)
👉 EVERYTHING in your app should sit inside cards.

Card Component
// components/ui/Card.tsx
export default function Card({ children, light = false }) {
  return (
    <div className={light ? "card card-light" : "card"}>
      {children}
    </div>
  )
}
Card Styles
.card {
  background: rgba(17, 24, 39, 0.8);
  backdrop-filter: blur(12px);

  padding: var(--space-sm);
  border-radius: var(--radius-md);

  border: 1px solid var(--color-border);
}

/* Light card (reading mode) */
.card-light {
  background: #ffffff;
  color: #111;
}
✍️ 3. INPUT SYSTEM
// components/ui/Input.tsx
export default function Input({ placeholder }) {
  return (
    <input className="input" placeholder={placeholder} />
  )
}
.input {
  width: 100%;
  padding: 14px;

  border-radius: var(--radius-md);
  border: 1px solid var(--color-border);

  background: rgba(255,255,255,0.05);
  color: white;
}
🧠 4. ANSWER OPTION (YOUR CORE UX)
👉 This replaces your current messy answer buttons.

Component
// components/ui/AnswerOption.tsx
export default function AnswerOption({
  text,
  selected,
  onClick
}) {
  return (
    <button
      className={`answer ${selected ? "selected" : ""}`}
      onClick={onClick}
    >
      {text}
    </button>
  )
}
Styles
.answer {
  width: 100%;
  padding: 16px;

  border-radius: var(--radius-md);
  border: 1px solid var(--color-border);

  background: rgba(255,255,255,0.05);
  color: white;

  text-align: left;
  margin-bottom: 10px;

  transition: all 0.2s ease;
}

.answer:hover {
  background: rgba(255,255,255,0.1);
}

.answer.selected {
  border: 2px solid #22c55e;
  background: rgba(34,197,94,0.2);
}
📐 5. PAGE CONTAINER (ENFORCES STRUCTURE)
This is how you stop layout chaos forever.

Component
// components/ui/PageContainer.tsx
import Button from "./Button"

export default function PageContainer({
  title,
  description,
  children,
  onNext
}) {
  return (
    <div className="page">

      <div className="page-header">
        <h1>{title}</h1>
        {description && <p>{description}</p>}
      </div>

      <div className="page-body">
        {children}
      </div>

      <div className="page-actions">
        <Button onClick={onNext}>Next →</Button>
      </div>

    </div>
  )
}
Styles
.page {
  display: flex;
  flex-direction: column;
  gap: var(--space-md);
}

.page-header h1 {
  font-size: 32px;
  letter-spacing: -0.5px;
}

.page-body {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.page-actions {
  margin-top: 16px;
}
🧪 6. APPLY TO YOUR YKI SCREEN (REAL FIX)
import PageContainer from "@/components/ui/PageContainer"
import Card from "@/components/ui/Card"
import AnswerOption from "@/components/ui/AnswerOption"

export default function YKIListening() {
  return (
    <PageContainer
      title="Listening"
      description="Answer the question"
      onNext={() => {}}
    >

      <Card>
        <audio controls src="/audio.mp3" />
      </Card>

      <Card light>
        <p>Mitä unen aikana tapahtuu asiantuntijan mukaan?</p>
      </Card>

      <Card>
        <AnswerOption text="Keho lepää..." />
        <AnswerOption text="Aivot käsittelevät..." />
        <AnswerOption text="Vain keho lepää" />
        <AnswerOption text="Ihminen ei näe unia" />
      </Card>

    </PageContainer>
  )
}

🎨 PHASE 3 — PIXEL-PERFECT FIGMA SPEC (TEXT VERSION)
You can later recreate this in Figma, but this spec is precise enough to implement directly.

📱 1. GLOBAL FRAME
Base canvas (mobile-first)
Width: 390px (mobile)
Max width: 900px (desktop centered)
Layout grid
Outer padding: 16px
Content max width: 720px
Center aligned
🧱 2. GLOBAL LAYER STACK
[Background Image]        (z: 0)
[Logo Overlay]            (z: 0)
[Sidebar / Drawer]        (z: 10)
[Content Layer]           (z: 20)
🎯 3. PAGE STRUCTURE (STRICT TEMPLATE)
Every page MUST follow this:

Top spacing: 32px

[Header Block]
   Title
   Description

[Main Content Block]
   Cards stacked

[Action Block]
   Next button

Bottom spacing: 32px
🔤 4. TYPOGRAPHY SCALE (EXACT)
Heading (H1)
Font: Inter
Size: 32px
Weight: 600
Letter spacing: -0.5px
Line height: 1.2
Section Title
Size: 20px
Weight: 500
Letter spacing: -0.2px
Body
Size: 16px
Weight: 400
Letter spacing: 0.2px
Line height: 1.5
Button Text
Size: 15px
Weight: 500
Letter spacing: 0.5px
📐 5. SPACING SYSTEM (STRICT)
Between sections: 24px
Between cards: 16px
Inside cards: 16px
Between text lines: 8px
🧱 6. CARD SYSTEM (PIXEL PERFECT)
Default Card
Padding: 16px
Radius: 16px
Border: 1px solid rgba(255,255,255,0.08)
Background: rgba(17,24,39,0.8)
Light Card (reading)
Background: #ffffff
Text: #111
Padding: 16px
Radius: 16px
🔘 7. BUTTON SYSTEM (EXACT)
Primary Button
Height: 48px
Padding: 0 16px
Radius: 16px

Background: #22c55e
Text: #000

Full width
Secondary Button
Background: rgba(255,255,255,0.08)
Text: white
🧠 8. ANSWER OPTION DESIGN (CRITICAL UX)
Default
Padding: 16px
Radius: 16px
Border: 1px solid rgba(255,255,255,0.08)

Background: rgba(255,255,255,0.05)
Text align: left
Hover
Background: rgba(255,255,255,0.1)
Selected
Border: 2px solid #22c55e
Background: rgba(34,197,94,0.2)
🔊 9. AUDIO PLAYER CONTAINER
Padding: 16px
Radius: 16px
Background: rgba(255,255,255,0.08)
🧭 10. SIDEBAR SPEC
Width
220px
Item
Height: 44px
Padding: 10px
Gap: 10px

Icon size: 20px
Text size: 15px
Active item
Background: rgba(255,255,255,0.08)
🎨 11. BACKGROUND + LOGO RULE
Background
Opacity: 0.2–0.3
Blur: optional
Logo overlay
Size: 50–70% of screen
Opacity: 0.04–0.06
Position: center
⚖️ 12. ALIGNMENT RULES
ALWAYS:
Left align content inside cards

Center page container

Equal spacing everywhere

NEVER:
Mixed alignment (center + left randomly)

Uneven margins

Different card widths

🧪 13. VISUAL TEST CHECKLIST (VERY IMPORTANT)
Every screen must pass:

 Equal spacing between all elements

 All cards same padding

 All radii identical

 Icons present

 No backend text visible

 Only one main action (Next)

 No layout shift

 No overflow bugs

📸 14. WHAT’S WRONG IN YOUR CURRENT SCREEN (FROM IMAGE)
Issues I see:
❌ Audio player broken (0:00)
❌ Header duplicated / too heavy
❌ Content slightly cramped
❌ No visual separation between question blocks
❌ Logo placement slightly interfering with readability
❌ No icon usage
❌ “Exit exam” too dominant vs primary flow
