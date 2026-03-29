# AGENT ROLE

You are a deterministic infrastructure agent.

Your job is to create the **new project foundation only**.

You are NOT allowed to:

* implement features
* copy UI
* modify backend logic
* improvise structure

You MUST follow instructions exactly.

---

# CONTEXT

There are 4 directories:

OLD FRONTEND (reference only):
/home/vitus/kielitaika

ORIGINAL LEGACY SOURCE (for forensic reference only):
/home/vitus/Documents/puhis/

NEW PROJECT ROOT (TARGET):
/home/vitus/kielitaika-app

YKI ENGINE (DO NOT MODIFY):
/home/vitus/kielitaikka-yki-engine

---

# OBJECTIVE

Create a clean monorepo structure inside:

/home/vitus/kielitaika-app

This will become the ONLY active frontend system.

---

# HARD RULES

1. DO NOT copy entire folders from old projects
2. DO NOT implement business logic
3. DO NOT install unnecessary libraries
4. DO NOT create placeholder features
5. DO NOT rename anything outside instructions
6. DO NOT touch YKI engine
7. DO NOT modify backend yet

---

# TARGET STRUCTURE

You MUST produce EXACTLY this structure:

kielitaika-app/
apps/
client/
packages/
ui/
core/
docs/
project_plans/
backend/   (leave untouched if exists)

---

# STEP 1 — VERIFY ROOT

Ensure this exists:

/home/vitus/kielitaika-app

If not:

* create it
* DO NOT nest incorrectly

---

# STEP 2 — CREATE MONOREPO FOLDERS

Inside kielitaika-app create:

apps/
packages/

Inside apps/:

client/

Inside packages/:

ui/
core/

---

# STEP 3 — INITIALIZE REACT NATIVE APP (EXPO)

Navigate to:

/home/vitus/kielitaika-app/apps/

Run:

npx create-expo-app client

When prompted:

* choose blank (TypeScript)

---

# STEP 4 — CLEAN DEFAULT EXPO TEMPLATE

Inside:

apps/client/

REMOVE:

* example screens
* demo assets
* unused components

KEEP ONLY:

* App.tsx
* package.json
* app.json
* tsconfig.json

---

# STEP 5 — CREATE BASE APP ENTRY STRUCTURE

Inside:

apps/client/

CREATE:

app/
_layout.tsx
index.tsx

---

# IMPLEMENT:

app/index.tsx

Minimal safe entry:

export default function Home() {
return null;
}

---

app/_layout.tsx

export default function Layout({ children }) {
return children;
}

---

# STEP 6 — SETUP PATH ALIASES

Inside:

apps/client/tsconfig.json

ADD:

"paths": {
"@ui/*": ["../../packages/ui/*"],
"@core/*": ["../../packages/core/*"]
}

---

# STEP 7 — CREATE CORE PACKAGE BASE

Inside:

packages/core/

CREATE:

services/
models/
config/

DO NOT ADD LOGIC

---

# STEP 8 — CREATE UI PACKAGE BASE

Inside:

packages/ui/

CREATE:

components/
screens/
theme/

NO UI IMPLEMENTATION YET

---

# STEP 9 — VERIFY PROJECT RUNS

Navigate to:

/home/vitus/kielitaika-app/apps/client

Run:

npx expo start

Then:

* open web
* confirm app loads (blank screen is OK)
* confirm no errors

---

# STEP 10 — DOCUMENT STRUCTURE

Inside:

/home/vitus/kielitaika-app/docs/project_plans/

CREATE FILE:

monorepo_structure.md

CONTENT:

* list full folder structure
* confirm no legacy code copied
* confirm Expo initialized
* confirm app runs

---

# VALIDATION CHECKLIST (MANDATORY)

You MUST confirm:

✔ client app boots successfully
✔ no import errors
✔ packages/ui exists
✔ packages/core exists
✔ no legacy files copied
✔ directory structure exactly matches spec

---

# OUTPUT FORMAT

At the end, output ONLY:

1. Folder tree (clean)
2. Commands executed
3. Any errors encountered
4. Confirmation of success/failure

DO NOT explain anything else.

---

# FAILURE CONDITIONS

If ANY of these occur, STOP and report:

* Expo app fails to start
* incorrect folder nesting
* dependency errors
* accidental copying from old repo

---

# SUCCESS CONDITION

A clean, running Expo app inside a structured monorepo with ZERO business logic.

---

END OF AGENT TASK
