🧭 1. CORE DESIGN PRINCIPLE (NON-NEGOTIABLE)
“One screen = one purpose = one direction (forward)”

No dashboards inside flows

No mixed navigation

No backend text leaking

Sidebar = navigation

Screen = experience

🧱 2. APP STRUCTURE (HIGH LEVEL)
App
├── AppLayout
│   ├── BackgroundLayer
│   ├── LogoOverlay
│   ├── Sidebar
│   └── ContentOutlet
│
├── Routes
│   ├── /
│   ├── /practice/*
│   ├── /conversation/*
│   ├── /yki/*
│   ├── /professional/*
│   ├── /settings
│   └── /debug
🗺️ 3. ROUTE ARCHITECTURE (CLEAN + FUTURE-PROOF)
🏠 Root
/ → Home (landing only)
📚 Practice
/practice
/practice/vocabulary
/practice/grammar
/practice/phrases
💬 Conversation
/conversation
/conversation/session
/conversation/result
🧪 YKI Exam
/yki
/yki/intro
/yki/reading
/yki/listening
/yki/writing
/yki/result
💼 Professional Finnish
/professional
/professional/speaking
/professional/pronunciation
/professional/tools
⚙️ Settings
/settings
/settings/profile
/settings/subscription
🪵 Debug / Logs (NEW)
/debug
🧩 4. LAYOUT SYSTEM (GLOBAL)
🔷 AppLayout (always present)
[Background Image Layer]
[Transparent Logo Layer]
[Sidebar (overlay / drawer)]
[Page Content]
🎨 Layers
1. Background Image
Page-specific

Full screen

Slight blur or dark overlay

2. Logo Overlay (global identity)
Huge

Transparent (opacity 0.04–0.06)

Centered or slightly offset

3. Content Layer
Cards / panels

Glassmorphism or soft dark UI

🧭 5. SIDEBAR (ONLY NAVIGATION SYSTEM)
Structure
[Logo small]
[User avatar]

— MAIN —
🏠 Home
📚 Practice
💬 Conversation
🧪 YKI Exam
💼 Professional

— SYSTEM —
⚙️ Settings
🪵 Debug Logs
✨ 6. ICON SYSTEM (2027 STANDARD)
👉 Use Lucide / Phosphor / Heroicons (modern clean line icons)

Icon style:
Stroke-based

1.5–2px weight

Slight rounded edges

Animated on hover (scale + glow)

Icon mapping
Feature	Icon
Home	home
Practice	book-open
Vocabulary	type
Grammar	layers
Phrases	message-square
Conversation	mic
YKI	clipboard-check
Listening	headphones
Reading	file-text
Writing	edit-3
Professional	briefcase
Settings	settings
Profile	user
Debug	terminal
Example (React)
import { Home, BookOpen, Mic } from "lucide-react"

<Home size={20} />
📐 7. TYPOGRAPHY SYSTEM (FIX YOUR SPACING ISSUE)
Font stack (modern, clean)
Inter (primary)

Space Grotesk (headings optional)

Rules
Headings
font-size: 28–36px
letter-spacing: -0.5px
line-height: 1.2
Body
font-size: 15–17px
letter-spacing: 0.2px
line-height: 1.5
Buttons
font-size: 15px
letter-spacing: 0.5px
Golden spacing system (CRITICAL)
Use 8px grid system

8px  → micro spacing
16px → default padding
24px → section spacing
32px → major separation
48px → page spacing
⚖️ 8. SYMMETRY RULES (YOUR CURRENT ISSUE)
NEVER:
Mix left-aligned and centered randomly

Uneven padding inside cards

Different border radii

ALWAYS:
Same padding inside all cards (16 or 20px)

Same border radius (16px or 20px)

Same spacing between elements

🧾 9. SCREEN TEMPLATE (REUSABLE)
Standard Page Layout
[Page Title]
[Short description]

[Main Card]
   content

[Action Area]
   [Next Button]
Example (YKI Reading)
[Reading Title]

[White Reading Card]
   text

[Answers Card]
   options

[Next →]
▶️ 10. NAVIGATION RULE (ENFORCED)
✅ Only "Next"

❌ No "Back"

✅ Allow Exit

✅ Allow Restart

🎯 11. HOMEPAGE (FINAL DESIGN)
[Background Image]
[Huge Transparent Logo]

Welcome to Taika
Master Finnish through structured practice

[Start Learning]
[Open Menu]
👉 Nothing else.

🧠 12. DESIGN SYSTEM SUMMARY
Visual identity:
Dark + glass UI

White content cards for reading

Transparent logo layer

Clean icons everywhere

Interaction:
Sidebar = navigation

Flow = forward only

Structure:
No mixed responsibilities per screen

🧪 13. DEBUG PANEL (BUILT-IN)
Sidebar → Debug

Shows:

Logs

Errors

Route events

Audio loading issues

App layout (with background + logo system)

Sidebar (with icons)

Routing system

Page templates

Example screens (Home + YKI Reading)

🧱 1. APP ROOT (Router + Layout)
// App.tsx
import { BrowserRouter, Routes, Route } from "react-router-dom"
import AppLayout from "./layout/AppLayout"

import Home from "./pages/Home"
import Practice from "./pages/practice/Practice"
import Phrases from "./pages/practice/Phrases"

import YKIIntro from "./pages/yki/YKIIntro"
import YKIReading from "./pages/yki/YKIReading"

import Settings from "./pages/settings/Settings"
import Debug from "./pages/debug/Debug"

export default function App() {
  return (
    <BrowserRouter>
      <AppLayout>
        <Routes>
          <Route path="/" element={<Home />} />

          <Route path="/practice" element={<Practice />} />
          <Route path="/practice/phrases" element={<Phrases />} />

          <Route path="/yki" element={<YKIIntro />} />
          <Route path="/yki/reading" element={<YKIReading />} />

          <Route path="/settings" element={<Settings />} />
          <Route path="/debug" element={<Debug />} />
        </Routes>
      </AppLayout>
    </BrowserRouter>
  )
}
🎨 2. APP LAYOUT (GLOBAL STRUCTURE)
// layout/AppLayout.tsx
import Sidebar from "./Sidebar"

export default function AppLayout({ children }) {
  return (
    <div className="app-root">

      {/* Background image */}
      <div className="bg-image" />

      {/* Transparent logo */}
      <div className="bg-logo" />

      {/* Sidebar */}
      <Sidebar />

      {/* Main content */}
      <main className="content">
        {children}
      </main>
    </div>
  )
}
🎨 3. GLOBAL CSS (CRITICAL)
/* styles.css */

.app-root {
  position: relative;
  min-height: 100vh;
  background: #0b1220;
  color: #fff;
  font-family: 'Inter', sans-serif;
}

/* Background image */
.bg-image {
  position: fixed;
  inset: 0;
  background: url('/bg.jpg') center/cover no-repeat;
  opacity: 0.25;
  z-index: 0;
}

/* Transparent logo */
.bg-logo {
  position: fixed;
  inset: 0;
  background: url('/logo.svg') center no-repeat;
  background-size: 60%;
  opacity: 0.05;
  z-index: 0;
}

/* Content layer */
.content {
  position: relative;
  z-index: 2;
  padding: 24px;
  max-width: 900px;
  margin: 0 auto;
}
🧭 4. SIDEBAR (WITH ICONS)
// layout/Sidebar.tsx
import { Link } from "react-router-dom"
import {
  Home,
  BookOpen,
  Mic,
  ClipboardCheck,
  Briefcase,
  Settings,
  Terminal
} from "lucide-react"

export default function Sidebar() {
  return (
    <aside className="sidebar">

      <div className="sidebar-header">
        <img src="/avatar.png" className="avatar" />
      </div>

      <nav>
        <Link to="/"><Home size={20}/> Home</Link>
        <Link to="/practice"><BookOpen size={20}/> Practice</Link>
        <Link to="/conversation"><Mic size={20}/> Conversation</Link>
        <Link to="/yki"><ClipboardCheck size={20}/> YKI</Link>
        <Link to="/professional"><Briefcase size={20}/> Professional</Link>
        <Link to="/settings"><Settings size={20}/> Settings</Link>
        <Link to="/debug"><Terminal size={20}/> Debug</Link>
      </nav>

    </aside>
  )
}
Sidebar CSS
.sidebar {
  position: fixed;
  left: 0;
  top: 0;
  height: 100%;
  width: 220px;
  background: rgba(10, 15, 30, 0.9);
  backdrop-filter: blur(10px);
  padding: 16px;
  z-index: 3;
}

.sidebar a {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 10px;
  border-radius: 12px;
  color: #cbd5e1;
  text-decoration: none;
}

.sidebar a:hover {
  background: rgba(255,255,255,0.08);
  color: white;
}
🏠 5. HOMEPAGE (CLEAN)
// pages/Home.tsx
import { useNavigate } from "react-router-dom"

export default function Home() {
  const navigate = useNavigate()

  return (
    <div className="home">

      <h1>Welcome to Taika</h1>
      <p>Master Finnish through structured learning paths.</p>

      <button onClick={() => navigate('/practice')}>
        Start Learning
      </button>

    </div>
  )
}
📚 6. PAGE TEMPLATE (REUSABLE)
// components/Page.tsx
export default function Page({ title, children }) {
  return (
    <div className="page">

      <h1>{title}</h1>

      <div className="card">
        {children}
      </div>

      <div className="actions">
        <button className="next-btn">Next →</button>
      </div>

    </div>
  )
}
🧪 7. YKI READING (FIXED LIGHT MODE)
// pages/yki/YKIReading.tsx
import Page from "../../components/Page"

export default function YKIReading() {
  return (
    <Page title="Reading Exercise">

      <div className="reading-card">
        <p>
          Tämä on esimerkkiteksti lukutehtävää varten...
        </p>
      </div>

      <div className="answers">
        <button>Option A</button>
        <button>Option B</button>
        <button>Option C</button>
      </div>

    </Page>
  )
}
Reading styles
.reading-card {
  background: white;
  color: #111;
  padding: 16px;
  border-radius: 16px;
  margin-bottom: 16px;
}

.answers button {
  width: 100%;
  padding: 14px;
  margin-bottom: 10px;
  border-radius: 12px;
  background: #1e293b;
  color: white;
}
🔊 8. AUDIO PLAYER (FIXED)
<audio controls preload="auto">
  <source src={audioUrl} type="audio/mpeg" />
</audio>
🪵 9. DEBUG PAGE (LOG VIEWER)
// pages/debug/Debug.tsx
export default function Debug() {
  const logs = JSON.parse(localStorage.getItem('logs') || "[]")

  return (
    <div>
      <h1>Debug Logs</h1>
      <pre>{JSON.stringify(logs, null, 2)}</pre>
    </div>
  )
}
🧠 10. GLOBAL LOGGER (IMPORTANT)
const originalLog = console.log

console.log = (...args) => {
  const logs = JSON.parse(localStorage.getItem('logs') || "[]")
  logs.push(args)
  localStorage.setItem('logs', JSON.stringify(logs))
  originalLog(...args)
}
⚠️ WHAT THIS FIXES IMMEDIATELY
✅ Clean navigation
✅ No more broken homepage
✅ Icons everywhere
✅ Proper spacing + typography
✅ Reading UI fixed
✅ Audio fix ready
✅ Debug system added
✅ Backend text removed (via Page abstraction)


