UI REMODELING EXECUTION PLAN
Phase 0 — Ground Rule (do NOT skip)
Before touching anything:

The app must follow:

core_design_principle.md


updated_core_design_principle.md

These are not suggestions. They override any existing CSS.

Phase 1 — Fix the Layout System (Root Cause)
This is the most important phase.
If this is wrong, everything else will keep breaking.

1.1 The Real Problem (from audit)
The app is not broken because of styling.

It is broken because:

You created a fully sealed container chain

And removed all scroll escape paths

From your report:

.main-content { overflow: hidden; }

.route-stage { overflow: hidden; }

.screen-shell { overflow: hidden; }

→ This creates a triple clipping system 


1.2 Correct Architecture (Non-negotiable)
You only need ONE of these two systems:

Option A (recommended for your app)
NO scroll anywhere

Every page must fit exactly inside viewport

Option B (fallback)
Root locked

ONE internal scroll container per page

Your decision (based on your instruction):
“App should not scroll except exam”

So we implement:

✔ Final Layout Model
Layer	Behavior
root	locked (no scroll)
app-shell	fixed viewport
route-stage	flexible
screen-shell	flexible
content-zone	must shrink and adapt
exam pages	ONLY place with scroll
1.3 Required Fixes (surgical)
A — Remove triple clipping
.main-content {
  overflow: hidden; ❌ REMOVE
}

.route-stage {
  overflow: hidden; ❌ REMOVE
}

.screen-shell {
  overflow: hidden; ❌ REMOVE
}
B — Introduce flexible vertical system
.route-stage {
  display: flex;
  flex-direction: column;
  height: 100%;
  min-height: 0; /* IMPORTANT */
}

.screen-shell {
  display: flex;
  flex-direction: column;
  flex: 1;
  min-height: 0; /* THIS FIXES CLIPPING */
}
C — Make content actually shrink
.screen-content-zone {
  flex: 1;
  min-height: 0;
  overflow: hidden;
}
This is the missing piece your system never had.

D — Fix action zone behavior
Current:

margin-top: auto;
Problem:

pushes content upward → causes clipping

Replace with:

.screen-action-zone {
  flex-shrink: 0;
}
1.4 Home Page Critical Fix
Your home page fails first because:

it uses centering + auto margins inside fixed height

From audit:

place-content: center

margin: auto 


Fix:
.dashboard-screen {
  display: flex;
  flex-direction: column;
  justify-content: flex-start; /* NOT center */
}

.dashboard-surface {
  margin: 0; /* REMOVE auto centering */
}
Phase 1 Result
After this phase:

Nothing is clipped anymore

No scroll exists

Layout becomes stable

Phase 2 — Spacing System (This is why UI feels “off”)
Your audit already exposed this:

random spacing values: 10px, 14px, 22px… 


2.1 Enforce spacing tokens
Replace EVERYTHING with:

--space-1: 8px;
--space-2: 16px;
--space-3: 24px;
--space-4: 32px;
--space-5: 40px;
2.2 Global rules
No arbitrary padding

No mixed spacing inside same component

Vertical rhythm must be consistent

2.3 Fix padding overflow issue
Audit showed:

padding consumes viewport height 


So:

.main-content {
  padding: var(--space-3);
  box-sizing: border-box;
}
Phase 3 — Typography & Visual Balance
Current problems:

wrong font (Georgia)

inconsistent sizes

weak hierarchy

3.1 Typography system
Use:

Primary: Inter

Secondary: Space Grotesk

3.2 Scale
Type	Size
Title	28–32
Section	18–20
Body	14–16
Meta	12–13
3.3 Letter spacing
letter-spacing: -0.01em; /* headings */
letter-spacing: 0.01em;  /* labels */
Phase 4 — Icon System (Huge Missing Layer)
Right now your app feels bland because:

no visual anchors

everything is text blocks

Icon Direction (based on your references)

https://s3-alpha.figma.com/hub/file/4686205799/2d2498dc-4287-4388-99ec-72161c2e4900-cover.png

https://cdn.svgator.com/images/2022/05/neumorphism-design-example.svg

https://public-files.gumroad.com/z6jedx9t2qv5c2wo6m6x3bcjsryq
4
4.1 Rules for icons
Every UI element must include:

icon (left or top)

label (small text)

4.2 Icon placement system
Component	Icon placement
Navigation	top + label
Buttons	left
Cards	top-left
Inputs	inside field
Settings	left + arrow right
4.3 Icon style rules
Rounded (8–12 radius)

Slight gradient or soft shadow

Consistent stroke weight

No flat monochrome icons

Phase 5 — Symmetry & Alignment
From audit:

mixed alignment strategies

centered + left + right mixed 


5.1 One rule only
Everything aligns to:

align-items: flex-start;
5.2 Card system
All cards must:

same padding

same radius

same internal spacing

5.3 Grid consistency
gap: var(--space-3);
No random gaps.

Phase 6 — Page-by-Page Refactor Order
Do NOT fix everything at once.

Order:
Layout system (Phase 1)

Home screen (most broken)

Settings

Cards / Practice

Debug

Exam (only scroll-enabled area)

Phase 7 — Color + Depth (Make UI feel alive)
Your base color is fine.

You just need layering:

soft gradients

elevation

contrast separation

Add:
background gradient (subtle)

card elevation (shadow + blur)

hover states


1. Fix global.css (CRITICAL FILE)
File:

frontend/app/theme/global.css
1.1 REMOVE the clipping chain
Search and REMOVE these:

.main-content {
  overflow: hidden;
}

.route-stage {
  overflow: hidden;
}

.screen-shell {
  overflow: hidden;
}
These three together are the reason your app is cutting content
(you already confirmed this in the audit 

)

1.2 Fix the height chain
Replace .route-stage
.route-stage {
  display: flex;
  flex-direction: column;
  height: 100%;
  min-height: 0; /* IMPORTANT FIX */
}
Replace .screen-shell
.screen-shell {
  display: flex;
  flex-direction: column;
  flex: 1;
  min-height: 0; /* THIS ENABLES SHRINK */
  gap: var(--space-3); /* replace 24px */
}
This removes the “fixed-height box” problem your audit described 


1.3 Fix content zone (MOST IMPORTANT FIX)
Your system currently has no place where overflow can be absorbed.

Replace:

.screen-content-zone {
  display: grid;
  gap: 24px;
  align-content: start;
}
With:

.screen-content-zone {
  display: flex;
  flex-direction: column;
  flex: 1;
  min-height: 0;
  gap: var(--space-3);
  overflow: hidden; /* keeps no-scroll policy */
}
1.4 Fix action zone (hidden bug)
Current behavior:

margin-top: auto pushes content up → causes clipping

Replace:

.screen-action-zone {
  margin-top: auto;
}
With:

.screen-action-zone {
  flex-shrink: 0;
}
1.5 Fix .main-content
Find:

.main-content {
  overflow: hidden;
}
Replace with:

.main-content {
  display: flex;
  flex-direction: column;
  min-height: 0;
}
2. Fix ROOT height system (clean it up)
From audit, you have too many nested viewport boxes 


2.1 Keep ONLY one viewport container
Keep this:
html, body, #root {
  height: 100%;
  overflow: hidden;
}
MODIFY this:
.app-frame,
.app-shell-frame {
  height: 100%;
  overflow: hidden;
}
❌ REMOVE any 100vh duplication

3. Fix HOME PAGE (the first broken screen)
File:

frontend/app/screens/DashboardScreen.tsx
3.1 Remove vertical centering
Find CSS:

.dashboard-screen {
  place-content: center;
}
Replace:

.dashboard-screen {
  display: flex;
  flex-direction: column;
  justify-content: flex-start;
}
3.2 Remove auto-centering
Find:

.dashboard-surface {
  margin: auto;
}
Replace:

.dashboard-surface {
  margin: 0;
  width: 100%;
}
3.3 Fix layout structure
Inside JSX, ensure structure is:

<ScreenScaffold>
  <Header />
  
  <div className="screen-content-zone">
    <MainPanel />
    <MetaCards />
  </div>

  <div className="screen-action-zone">
    <Actions />
  </div>
</ScreenScaffold>
4. Fix EXAM exception (only scrollable area)
File:

.yki-flow-screen
Keep this:

.yki-flow-screen {
  overflow-y: auto;
}
This is correct and must remain.

5. Fix SPACING SYSTEM (start enforcing order)
5.1 Add tokens (if not already enforced)
In tokens.css or root:

:root {
  --space-1: 8px;
  --space-2: 16px;
  --space-3: 24px;
  --space-4: 32px;
}
5.2 Replace hardcoded spacing
Search and replace:

Old	New
24px	var(--space-3)
16px	var(--space-2)
32px	var(--space-4)
This directly fixes inconsistency noted in audit 


6. QUICK VISUAL CHECK (after changes)
After implementing:

Expected behavior:
Home page fully visible

No scroll

No clipping

Content fits vertically

Action buttons visible

If something still clips:
Check ONLY these:

missing min-height: 0

leftover overflow: hidden

any margin-top: auto

7. DO NOT TOUCH YET
Do NOT modify yet:

icons

colors

typography

components

Those come next.


1. Spacing System (fix the inconsistency)
Your audit already showed the issue:

random values everywhere (10px, 14px, 22px...) 


This is why the UI feels uneven.

1.1 Define strict spacing tokens
Add or enforce in your tokens file:

:root {
  --space-1: 8px;
  --space-2: 16px;
  --space-3: 24px;
  --space-4: 32px;
  --space-5: 40px;
}
1.2 Apply spacing rules (very important)
Use this everywhere:

Usage	Value
between small elements	space-1
between inputs/cards	space-2
between sections	space-3
page padding	space-3 or space-4
1.3 Fix vertical rhythm
Bad pattern now:

random spacing inside components

Correct pattern:

.screen-content-zone > * {
  margin-bottom: var(--space-3);
}
No component should define its own random margins anymore.

2. Typography System (fix visual hierarchy)
Right now:

weak hierarchy

inconsistent font usage

spacing between text feels off

2.1 Font system
Use:

Primary: Inter

Secondary: Space Grotesk (for titles only)

Remove:

font-family: Georgia;
2.2 Typography scale
Apply globally:

h1 {
  font-size: 32px;
  font-weight: 600;
  letter-spacing: -0.01em;
}

h2 {
  font-size: 20px;
  font-weight: 500;
}

p {
  font-size: 14px;
}

.small {
  font-size: 12px;
  opacity: 0.7;
}
2.3 Letter spacing (this is subtle but important)
.label {
  letter-spacing: 0.02em;
}

.title {
  letter-spacing: -0.01em;
}
This alone improves perceived polish.

3. Icon System (this changes everything visually)
Right now your app feels bland because:

no visual anchors

everything is text + rectangles

Icon direction (based on your references)

https://s3-alpha.figma.com/hub/file/4686205799/2d2498dc-4287-4388-99ec-72161c2e4900-cover.png

https://cdn.dribbble.com/userupload/29799394/file/original-02b8b571bb49f7c7ee680fb87d4fdf61.jpg?format=webp&resize=400x300&vertical=center

https://docs-assets.developer.apple.com/published/298204fa29c2dc771deb8651963ce75a/app-icons-platform-appearance-overview%402x.png
4
3.1 Core rule
Every interactive or informational element must have:

an icon

a label (small text)

3.2 Install icon system
Use:

npm install lucide-react
Then enhance styling manually.

3.3 Create Icon Wrapper (IMPORTANT)
const AppIcon = ({ icon: Icon, size = 20 }) => {
  return (
    <div className="app-icon">
      <Icon size={size} />
    </div>
  );
};
3.4 Icon styling (this is where quality comes from)
.app-icon {
  width: 36px;
  height: 36px;
  border-radius: 12px;

  display: flex;
  align-items: center;
  justify-content: center;

  background: linear-gradient(135deg, #4f46e5, #7c3aed);
  color: white;

  box-shadow: 0 4px 12px rgba(0,0,0,0.15);
}
3.5 Apply icons everywhere
Navigation
<HomeIcon />
<span className="small">Home</span>
Buttons
<button>
  <AppIcon icon={Play} />
  <span>Start</span>
</button>
Cards
<div className="card-header">
  <AppIcon icon={Book} />
  <span>Lessons</span>
</div>
Inputs
<div className="input">
  <SearchIcon />
  <input />
</div>
Settings rows
<AppIcon icon={Settings} />
<span>Preferences</span>
<ChevronRight />
4. Symmetry System (this fixes “it feels off”)
Your audit showed:

mixed alignment strategies 


4.1 One alignment rule
Everything uses:

align-items: flex-start;
4.2 Card consistency
All cards must share:

.card {
  padding: var(--space-3);
  border-radius: 16px;
  display: flex;
  flex-direction: column;
  gap: var(--space-2);
}
4.3 Grid consistency
.grid {
  display: grid;
  gap: var(--space-3);
}
No random gaps.

5. Improve Visual Depth (without changing base color)
Your colors are fine.

They just lack depth.

5.1 Add subtle gradients
.card {
  background: linear-gradient(
    145deg,
    rgba(255,255,255,0.04),
    rgba(255,255,255,0.01)
  );
}
5.2 Add elevation
.card {
  box-shadow:
    0 10px 30px rgba(0,0,0,0.2),
    inset 0 1px 0 rgba(255,255,255,0.05);
}
6. Immediate Changes You Should See
After applying Phase 2:

UI looks structured

spacing feels consistent

elements align properly

icons give visual meaning

text hierarchy becomes clear



1. HOME SCREEN REBUILD (Dashboard)
What’s wrong right now (from your audit)
too many stacked blocks

centered layout fighting fixed height

no visual anchors (icons missing)

inconsistent spacing

weak hierarchy 


What we are building instead
A structure like this:

Header
↓
Balance Card (Hero)
↓
Quick Actions (icon grid)
↓
Progress / Stats
↓
Primary Action
Visual direction

https://cdn.dribbble.com/userupload/46847715/file/0e9ddc884d22aa99d2f69763d377d0de.png?resize=752x&vertical=center

https://cdn.dribbble.com/userupload/3502949/file/original-fa788982fc3fe7fb14fb6ab6848e5ce3.jpg?resize=752x&vertical=center

https://cdn.dribbble.com/userupload/43363936/file/original-ef866c954602f48c232297f17f54f3ba.png?format=webp&resize=400x300&vertical=center
4
1.1 New Dashboard Structure
Update:

frontend/app/screens/DashboardScreen.tsx
Replace content with this structure
import { Wallet, Play, Book, Settings } from "lucide-react";

export default function DashboardScreen() {
  return (
    <div className="dashboard-screen">
      
      {/* Header */}
      <div className="dashboard-header">
        <h1 className="title">Welcome back</h1>
        <p className="small">Continue your learning</p>
      </div>

      {/* Hero Card */}
      <div className="card dashboard-hero">
        <div className="card-header">
          <AppIcon icon={Wallet} />
          <span className="small">Progress</span>
        </div>

        <h2>Level A2</h2>
        <p className="small">12 lessons completed</p>
      </div>

      {/* Quick Actions */}
      <div className="dashboard-actions grid-2">
        <ActionCard icon={Play} label="Start Practice" />
        <ActionCard icon={Book} label="Lessons" />
        <ActionCard icon={Settings} label="Settings" />
      </div>

      {/* Bottom Action */}
      <div className="screen-action-zone">
        <button className="primary-btn">
          Continue
        </button>
      </div>
    </div>
  );
}
1.2 Create ActionCard (reusable)
const ActionCard = ({ icon: Icon, label }) => {
  return (
    <div className="card action-card">
      <AppIcon icon={Icon} />
      <span>{label}</span>
    </div>
  );
};
1.3 Add layout styles
.dashboard-screen {
  display: flex;
  flex-direction: column;
  gap: var(--space-3);
}

.dashboard-header {
  display: flex;
  flex-direction: column;
  gap: var(--space-1);
}

.dashboard-hero {
  min-height: 120px;
}

.dashboard-actions {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: var(--space-2);
}
2. SETTINGS SCREEN REFACTOR
Goal
Make settings feel structured and clean.

Replace layout with:
import { User, Lock, Bell, ChevronRight } from "lucide-react";

export default function SettingsScreen() {
  return (
    <div className="settings-screen">

      <h1 className="title">Settings</h1>

      <div className="card">
        <SettingsItem icon={User} label="Profile" />
        <SettingsItem icon={Lock} label="Security" />
        <SettingsItem icon={Bell} label="Notifications" />
      </div>

    </div>
  );
}
SettingsItem component
const SettingsItem = ({ icon: Icon, label }) => {
  return (
    <div className="settings-item">
      <div className="left">
        <AppIcon icon={Icon} />
        <span>{label}</span>
      </div>
      <ChevronRight size={16} />
    </div>
  );
};
Styles
.settings-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: var(--space-2) 0;
}
3. BUTTON SYSTEM (important polish)
Replace all buttons with:
.primary-btn {
  height: 48px;
  border-radius: 12px;

  background: linear-gradient(135deg, #4f46e5, #7c3aed);
  color: white;

  font-weight: 500;
}
4. INPUT SYSTEM (clean look)
.input {
  display: flex;
  align-items: center;
  gap: var(--space-2);

  padding: var(--space-2);
  border-radius: 12px;

  background: rgba(255,255,255,0.05);
}
5. NAVIGATION (must include icons)
Bottom nav example:
<Home />
<Book />
<Play />
<Settings />
Each must include:

icon

small label

6. WHAT THIS FIXES
Now your app:

has structure

has hierarchy

has visual anchors (icons)

has consistent spacing

no longer feels “flat”



PHASE 4 — PRACTICE + EXAM UI (SYMMETRY + CONTROL)
What’s actually wrong (from your audit)
components grow unpredictably

mixed layout patterns (grid + flex + absolute)

inconsistent spacing inside panels

no clear visual hierarchy

only exam has scroll, but layout is still chaotic

Also:

card aspect ratio fighting layout

text blocks not aligned

actions floating without structure 


1. TARGET STRUCTURE (THIS IS THE FIX)
Every exam/practice screen must follow ONE strict structure:

Header (fixed height)
↓
Content (scrollable ONLY here)
↓
Action Bar (fixed height)
Visual direction

https://cdn.dribbble.com/userupload/17595303/file/original-6cf9841354ebe0bca8aa03bcd2d749b7.png

https://s3-alpha.figma.com/hub/file/6105970081/365be960-928c-487d-b399-6845d83532e8-cover.png

https://cdn.dribbble.com/userupload/43293555/file/original-2d8936e8fb6c483b9972875c85a4130e.png?resize=400x0
4
2. CORE LAYOUT (NON-NEGOTIABLE)
Update .yki-flow-screen
.yki-flow-screen {
  display: flex;
  flex-direction: column;
  height: 100%;
}
Add 3 zones
.exam-header {
  flex-shrink: 0;
}

.exam-content {
  flex: 1;
  min-height: 0;
  overflow-y: auto; /* ONLY SCROLL AREA */
}

.exam-actions {
  flex-shrink: 0;
}
3. HEADER (make it structured)
<div className="exam-header">
  <div className="header-row">
    <AppIcon icon={ArrowLeft} />
    <span>Listening Test</span>
    <span className="small">2 / 10</span>
  </div>
</div>
Style
.exam-header {
  padding: var(--space-3);
  display: flex;
  flex-direction: column;
  gap: var(--space-2);
}
4. CONTENT AREA (THIS IS WHERE YOU FIX CHAOS)
Structure inside .exam-content
<div className="exam-content">

  <div className="card question-card">
    <p className="question-text">
      What does the speaker mean?
    </p>
  </div>

  <div className="answers-list">
    <AnswerOption label="Option A" />
    <AnswerOption label="Option B" />
    <AnswerOption label="Option C" />
  </div>

</div>
AnswerOption component
const AnswerOption = ({ label }) => {
  return (
    <div className="answer-option">
      <AppIcon icon={CheckCircle} />
      <span>{label}</span>
    </div>
  );
};
Styles
.answers-list {
  display: flex;
  flex-direction: column;
  gap: var(--space-2);
}

.answer-option {
  display: flex;
  align-items: center;
  gap: var(--space-2);

  padding: var(--space-2);
  border-radius: 12px;

  background: rgba(255,255,255,0.05);
}
5. ACTION BAR (REMOVE FLOATING BUTTON CHAOS)
<div className="exam-actions">
  <button className="primary-btn">Next</button>
</div>
Style
.exam-actions {
  padding: var(--space-3);
}
6. FIX PRACTICE CARD (BIG ISSUE)
Your current:

.practice-card-wrapper {
  aspect-ratio: 2 / 3;
}
Problem:

forces layout distortion

Fix
.practice-card-wrapper {
  width: 100%;
  max-width: 320px;
  margin: 0 auto;
}
Center card properly
.practice-runtime-root {
  display: flex;
  justify-content: center;
  align-items: center;
}
7. FIX TEXT ALIGNMENT (hidden issue)
Right now:

text blocks feel “off” because alignment shifts

Rule
.question-text {
  text-align: left;
  line-height: 1.5;
}
Never center long text.

8. ICON INTEGRATION (important here)
Every element must include icons:

Element	Icon
Back	ArrowLeft
Audio	Volume
Question	HelpCircle
Correct	CheckCircle
Wrong	XCircle

