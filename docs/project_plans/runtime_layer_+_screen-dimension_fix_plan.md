This part defines:

what is authoritative

what must be deleted or ignored

the exact frontend runtime layer to create

the exact contract the frontend must obey

the first screen/dimension corrections that must happen before styling

This is the part that prevents another false start.

RUNTIME LAYER + SCREEN/DIMENSION FIX PLAN
Part 1 — Authority, boundaries, required file structure, and first correction slice
1. Mission of this phase
The current state is not “frontend bug fixing.”

The actual missing piece is:

the frontend runtime layer for the YKI exam does not exist as a proper authoritative subsystem.

At the same time, the visible rendering problems are not random styling errors. They come from a constrained shell and runtime screen structure that is still not distributing height correctly in a stable way.

So this phase has two parallel jobs:

Job A
Build the missing frontend runtime layer correctly.

Job B
Stabilize screen height, dimension flow, and content zoning so the runtime layer renders predictably on both mobile and web.

This phase does not redesign the whole app.
It creates the runtime foundation and the shell rules it depends on.

2. Authoritative sources that the agent MUST read first
Before changing any code, the agent must read these and treat them as authority in this order:

UI and layout authority
/home/vitus/kielitaika/docs/ui_design/core_design_principle.md

/home/vitus/kielitaika/docs/ui_design/updated_core_design_principle.md

/home/vitus/kielitaika/docs/ui_design/visual_direction/

/home/vitus/kielitaika/docs/ui_design/icons/

/home/vitus/kielitaika/docs/ui_design/

Frontend layout authority
AppShell.tsx 


global.css 


tokens.css 


backgrounds.ts 


ScreenScaffold.tsx 


Runtime contract authority
public_exam_runtime_models_v3_3.py 


exam_api_v3_3.py 


exam_session_engine_v3_2.py 


exam_generator_v3_2.py 


yki_routes.py 


Audio authority
media_registry.json 


audio_upload_api_v3_3.py 


tts_voice_manager.py 


Current YKI screen implementation to replace or split
YkiExamScreen.tsx 


3. Absolute rule about duplicates
This must become permanent:

Before implementing anything, the agent must identify authoritative files and delete or quarantine duplicate, shadow, obsolete, or non-authoritative alternatives.

For this phase that means:

3.1 Authoritative frontend exam screen source
Right now the only actual runtime-like screen present is:

YkiExamScreen.tsx 


It is temporary authority for current behavior, but it is not the final architecture.

So the rule is:

Use YkiExamScreen.tsx only as a behavior inventory

Do not continue growing it into a giant all-in-one screen

Split it into the new runtime layer files defined below

3.2 Duplicate rule for this phase
If the agent finds:

another YKI runtime renderer

another screen state hook

another audio playback abstraction

another route-level runtime wrapper

then the agent must:

classify it

compare against authoritative sources

keep one

delete or quarantine the rest

document what was removed

No parallel implementations are allowed.

4. Exact architectural diagnosis from the current files
This is the current factual state.

4.1 What already exists and is valid
The engine already provides:

deterministic exam generation 


runtime session state and screen serialization 


strict runtime contract models 


API endpoints for exam lifecycle 


app-layer YKI routes for session/writing/audio/conversation/submit/certificate 


deterministic audio registry and cached assets 


secure audio upload path for speaking submissions 


4.2 What does not exist yet
The frontend runtime layer does not exist as a proper subsystem.

There is no uploaded:

AudioPlayer.tsx

useExamSession.ts

ExamRuntimeScreen.tsx

QuestionScreen.tsx

ReviewScreen.tsx

runtime component folder

So the frontend is missing the entire formal execution layer between:

API contract

visible exam UI

4.3 Why the current YKI screen is not enough
YkiExamScreen.tsx currently does too much in one file:

session sync

answer submission

writing submission

speaking submission

conversation turn handling

completion submission

prompt rendering

question rendering

writing rendering

speaking rendering

audio tag rendering

error handling

All of that is in one screen component 


That file is useful as a behavior map, but it is too broad to remain authoritative.

5. Non-negotiable contract the frontend must obey
The frontend must not invent its own exam model.

The frontend must consume the runtime exactly as produced by the engine.

From the public runtime models, the relevant contract is:

Start/session response contains:
session_id

exam

screens

timing

runtime_schema_version 


Public screen model contains:
id

task_id

skill

screen_type

title

instruction

timing_minutes

materials

questions

response_items

audio_url 


Critical frontend rule
The frontend must render from:

screens

screen_type

materials

questions

response_items

audio_url

The frontend must not flatten sections into its own parallel task format.

The frontend must not infer structure beyond the runtime contract.

6. Exact runtime layer to create
Create this exact directory structure.

Do not improvise different names.

frontend/app/exam_runtime/
  components/
    AudioPlayer.tsx
    ExamHeader.tsx
    ExamActions.tsx
    PromptMaterial.tsx
    QuestionCard.tsx
    QuestionList.tsx
    WritingResponseCard.tsx
    SpeakingRecorderCard.tsx
    ConversationTranscript.tsx
    EmptyRuntimeState.tsx
  hooks/
    useExamSession.ts
    useExamScreenFlow.ts
  screens/
    ExamRuntimeScreen.tsx
No extra folders in this phase.

No alternative names.

7. Responsibility of each new file
This section is strict.
Each file has one job.

7.1 useExamSession.ts
This hook becomes the single frontend authority for exam runtime state.

It must handle only:

current runtime object

sync from backend

submit objective answer

submit writing

submit audio answer

start conversation

submit conversation turn

request reply

finish exam

derived current screen index

derived current screen object

derived prompt context

derived active section label

busy/error state

It must absorb and move out the session logic that currently sits inside YkiExamScreen.tsx 


It must not render UI.

7.2 useExamScreenFlow.ts
This hook handles only screen-level derivation:

current screen key

prompt screen before current question screen

whether screen is complete

whether exam is complete

current progress label

current stage number

total stage count

It must not call API directly.

7.3 ExamRuntimeScreen.tsx
This becomes the only route-level runtime renderer.

It must:

use ScreenScaffold

use ExamHeader

use ExamActions

use the derived current screen from hooks

switch by screen_type

render only one runtime content area at a time

It must not contain inline API orchestration logic.

7.4 AudioPlayer.tsx
This file must be created explicitly.

It must wrap the plain HTML audio behavior currently embedded in YkiExamScreen.tsx where audio tags are rendered directly 


Its responsibilities:

render a controlled <audio> element

display loading/error state

reset correctly when src changes

expose consistent layout height

avoid collapsing or overgrowing the parent

support prompt playback and listening playback

never introduce page-level overflow

It must not own business logic.

7.5 ExamHeader.tsx
This component renders only:

eyebrow

title

section/stage line

exit button

No extra metadata.
No session id.
No schema version.
No backend wording.

7.6 ExamActions.tsx
This component renders only the bottom action row.

It must:

render only valid actions for current screen type

never create a back button

keep button count visually controlled

remain fixed-height and non-scrolling

7.7 PromptMaterial.tsx
This component renders:

reading/listening prompt material

paragraph text

optional prompt audio

It must separate:

passage presentation

question presentation

This is important because your desired exam UX is:

prompt/passage first

then questions

7.8 QuestionCard.tsx
This renders one question only.

Responsibilities:

question prompt

options

selected state

click submit callback

It must not handle page-level layout.

7.9 QuestionList.tsx
This renders a stack of QuestionCard.

Used when the runtime screen contains multiple questions.

7.10 WritingResponseCard.tsx
This renders:

prompt/instruction

text area

submit action binding callback

No API logic inside.

7.11 SpeakingRecorderCard.tsx
This renders:

record/stop button

recorder state

captured duration

playback preview

submit button callback trigger passed in

It must not own upload logic.

7.12 ConversationTranscript.tsx
This renders:

speaker label

message text

correct role mapping

It must reuse the speaker formatting rule currently embedded in YkiExamScreen.tsx and move it out cleanly 


7.13 EmptyRuntimeState.tsx
This handles:

no runtime present

runtime complete

unrecoverable render fallback

This prevents half-rendered empty shells.

8. Screen and dimension repair rules that must be applied before runtime refactor
This is the first dimension slice only.

Do not style more than this yet.

8.1 AppShell.tsx problem to note
The shell centers the entire app frame using a grid with place-items: center in .app-shell-frame 

 and the component uses that frame directly 


That is acceptable for bounded desktop shell presentation, but dangerous when combined with route content that does not fully expand vertically.

8.2 Immediate dimension rule
The runtime route must fill the available main content height.

That means the following containers must all expand, in order:

.main-content

.route-stage

.screen-shell

.screen-content-zone

.exam-shell-panel

.exam-content

8.3 Current blockers already visible in CSS
These are still suspicious and must be specifically reviewed in the next execution phase:

.main-content { align-items: center; } 


This can visually detach route content and encourage floating panels.

.screen-shell { width: min(100%, 1120px); ... overflow: hidden; } 


This may still be too restrictive for runtime content.

.main-content { overflow: hidden; } 


This is acceptable only if the screen-content chain is perfectly correct.

.app-shell-frame { height: 100vh; min-height: 100vh; } and .app-shell { height: 100%; min-height: min(900px, calc(100vh - 32px)); } 


These create a tightly bounded viewport shell; runtime children must be dimensionally precise.

8.4 First rule for the runtime layer
The runtime layer must never rely on:

margin: auto

place-content: center

justify-content: center
for main exam layout

Main exam layout must always be:

top-anchored

height-bounded

content-scrolling only inside .exam-content

8.5 Runtime scroll law
Only this area may scroll:

.exam-content 


No other runtime wrapper may gain page-level scrolling in this phase.

9. Exact migration strategy from current YkiExamScreen.tsx
The agent must not rewrite blindly.

It must migrate in this order:

Step 1
Copy logic out of YkiExamScreen.tsx into hooks and components.

Step 2
Keep the old screen file temporarily, but reduce it into an orchestration wrapper.

Step 3
Once ExamRuntimeScreen.tsx is working and verified, replace the route usage.

Step 4
Delete or archive any obsolete runtime rendering logic left in YkiExamScreen.tsx.

Step 5
Document what was removed and why.

10. Audio-specific plan for this phase
This is only the first audio slice.

10.1 What is already correct
The audio backend is already valid:

deterministic/cached audio exists in registry 


upload endpoint exists for speaking audio 


engine listening screens populate audio_url for listening prompt screens via resolved audio 


10.2 What frontend must do
The frontend must trust:

audio_url for prompt playback

uploaded file playback URL for local speaking preview

managed upload path for submission

10.3 What frontend must not do
It must not:

derive audio path manually

inspect registry directly

invent its own URL resolution

generate TTS live

11. Deliverables for this phase only
At the end of this first execution slice, the agent should have produced:

New files created
frontend/app/exam_runtime/hooks/useExamSession.ts

frontend/app/exam_runtime/hooks/useExamScreenFlow.ts

frontend/app/exam_runtime/components/AudioPlayer.tsx

frontend/app/exam_runtime/components/ExamHeader.tsx

frontend/app/exam_runtime/components/ExamActions.tsx

frontend/app/exam_runtime/components/PromptMaterial.tsx

frontend/app/exam_runtime/components/QuestionCard.tsx

frontend/app/exam_runtime/components/QuestionList.tsx

frontend/app/exam_runtime/components/WritingResponseCard.tsx

frontend/app/exam_runtime/components/SpeakingRecorderCard.tsx

frontend/app/exam_runtime/components/ConversationTranscript.tsx

frontend/app/exam_runtime/components/EmptyRuntimeState.tsx

frontend/app/exam_runtime/screens/ExamRuntimeScreen.tsx

Existing files touched minimally
route entry file that currently mounts YkiExamScreen

possibly YkiExamScreen.tsx only as temporary bridge

no engine files in this phase

no schema changes in this phase

12. What must NOT happen in this phase
The agent is not allowed to:

redesign icons globally yet

restyle the entire shell yet

touch backend scoring

change public runtime schema

rewrite API routes

alter media registry format

create alternative exam data shapes

add duplicate runtime screens

keep old and new runtime implementations active in parallel

13. Completion condition for Part 1
This phase is complete only when:

the frontend runtime layer exists as a real file structure

API/session logic has been moved out of the monolithic screen

audio playback has a dedicated component

runtime rendering follows the public screen contract

no duplicate runtime implementation is left active

the runtime content zone still obeys the exam-only scroll rule

Part 2 — Exact implementation sequence (file-by-file, no ambiguity)
1. Order of execution (STRICT)
The agent must follow this order exactly:

Create folders

Extract session logic → useExamSession.ts

Extract screen flow → useExamScreenFlow.ts

Build AudioPlayer.tsx

Build rendering components (small → large)

Build ExamRuntimeScreen.tsx

Connect route

Only then fix dimension chain

If this order is not followed, regressions will happen.

2. Create exact folders
Create:

frontend/app/exam_runtime/
frontend/app/exam_runtime/components/
frontend/app/exam_runtime/hooks/
frontend/app/exam_runtime/screens/
No nesting beyond this.

3. Extract session logic (CRITICAL STEP)
Source of truth
Everything comes from:

YkiExamScreen.tsx 


3.1 Create file
frontend/app/exam_runtime/hooks/useExamSession.ts
3.2 Move EXACT logic (no rewriting yet)
Move these responsibilities exactly:

A. State variables
runtime

busy

error

sessionId (from route)

selected answers

writing answers

speaking state

conversation state

B. API calls (copy behavior, do NOT redesign)
Move:

sync runtime (GET session)

submit objective answer

submit writing

submit speaking audio

start conversation

submit conversation turn

get conversation reply

finish exam

All of these already exist inside the screen logic.

C. Derived values
Must include:

currentScreenIndex

currentScreen

promptScreen (previous prompt screen)

isComplete

progress label

D. Return shape (FIXED)
The hook must return exactly:

{
  runtime,
  busy,
  error,

  currentScreen,
  currentScreenIndex,
  promptScreen,
  isComplete,

  submitAnswer,
  submitWriting,
  submitSpeaking,
  startConversation,
  submitTurn,
  requestReply,
  finishExam
}
No renaming.

3.3 What MUST NOT happen
No UI inside hook

No JSX

No styling

No new API endpoints

No schema transformation

4. Extract screen flow logic
Create file
useExamScreenFlow.ts
Responsibilities
This hook takes:

runtime
currentScreenIndex
And returns:

{
  totalScreens,
  currentStep,
  progressText,
  sectionLabel,
  isPromptScreen,
  isQuestionScreen,
  isWritingScreen,
  isSpeakingScreen,
  isConversationScreen
}
Source logic
Derived from:

screen_type

skill

screen index

From runtime contract 


Important rule
This hook must NOT:

call backend

mutate runtime

store state

It is pure computation only.

5. Build AudioPlayer.tsx (first UI component)
Create file
components/AudioPlayer.tsx
Required behavior
This must replace ALL <audio> tags currently used directly in:

prompt rendering

listening sections

speaking playback

(from YkiExamScreen) 


Props (STRICT)
{
  src: string
  autoPlay?: boolean
}
Internal rules
A. Must use controlled audio element
<audio controls src={src} />
B. Must reset when src changes
Use:

useEffect

audioRef.current.load()

C. Must NOT stretch layout
Wrapper must have:

width: 100%
max-height: 72px
flex-shrink: 0
D. Must NOT overflow parent
No margin pushing outside.

E. Must NOT create scrolling
No internal scroll.

6. Build smallest rendering components
We go bottom-up.

6.1 QuestionCard.tsx
Props
{
  question,
  selected,
  onSelect
}
Must render:
prompt

options

selected state

Must NOT:
call API

manage page state

6.2 QuestionList.tsx
Props
{
  questions,
  answers,
  onSelect
}
Behavior
Maps → QuestionCard

6.3 PromptMaterial.tsx
Props
{
  materials,
  audio_url
}
Must render:
text paragraphs

optional AudioPlayer

Important
This is where:

👉 prompt/passage lives
👉 not mixed with questions

6.4 WritingResponseCard.tsx
Props
{
  value,
  onChange,
  onSubmit
}
Must render:
textarea

submit button

6.5 SpeakingRecorderCard.tsx
Props
{
  onSubmit
}
Must render:
record button

stop button

playback preview

submit button

Must NOT:
upload directly

manage API

6.6 ConversationTranscript.tsx
Props
{
  messages
}
Must:
map speaker → label

display text cleanly

6.7 ExamHeader.tsx
Props
{
  title,
  sectionLabel,
  progressText,
  onExit
}
6.8 ExamActions.tsx
Props
{
  actions
}
Must:
render ONLY valid actions

no back button

6.9 EmptyRuntimeState.tsx
Must handle:
no runtime

error state

completed exam

7. Build main runtime screen
Create
screens/ExamRuntimeScreen.tsx
7.1 Layout structure (STRICT)
ScreenScaffold
  └── screen-shell
        └── exam-shell-panel
              ├── ExamHeader
              ├── exam-content
              │     └── (dynamic screen renderer)
              └── ExamActions
7.2 Screen rendering switch
Must switch on:

screen_type
Cases
prompt screen
→ render PromptMaterial

objective screen
→ render QuestionList

writing screen
→ render WritingResponseCard

speaking screen
→ render SpeakingRecorderCard

conversation screen
→ render ConversationTranscript + input

7.3 Must NOT:
contain API logic

duplicate hook logic

flatten runtime

8. Route connection
Find current route that renders:

YkiExamScreen.tsx
Replace with:

ExamRuntimeScreen.tsx
Keep old file temporarily.

Do NOT delete yet.

9. FIRST dimension fixes (targeted only)
Now we fix the distortion.

9.1 Fix vertical chain
The following must ALL have:

height: 100%
min-height: 0
Apply to:

.route-stage 


.screen-shell 


.screen-content-zone 


.exam-shell-panel 


.exam-content 


9.2 Remove vertical centering issue
In .main-content:

Current:

align-items: center;
Change to:

align-items: stretch;
This is one of the causes of floating UI.

9.3 Ensure only one scroll container
.exam-content must be:

overflow-y: auto;
flex: 1;
min-height: 0;
Everything else:

overflow: hidden;
9.4 Header and actions must not stretch
Both:

flex-shrink: 0;
9.5 No margin-based spacing for layout
All spacing must be:

padding

gap

No vertical margin stacking.

10. Listening engine (first check, NOT full fix yet)
Before fixing anything, agent must VERIFY:

From runtime:

does currentScreen.audio_url exist? 


If yes:
→ AudioPlayer should play it directly

If no:
→ problem is backend or data

11. Completion condition for Part 2
This part is complete only if:

runtime layer exists

YkiExamScreen is no longer the main renderer

audio plays through AudioPlayer

screens render based on screen_type

UI fills vertical space properly

no double scrolling exists

This section is not about building anymore — it is about:

fixing the listening engine properly

locking dimensions so UI cannot distort again

eliminating hidden causes of layout drift

enforcing pixel-level consistency

removing legacy safely

This is where your app becomes stable instead of “almost working.”

RUNTIME + DIMENSION FIX PLAN
Part 3 — Listening engine fix + dimension lock system (no ambiguity)
1. Listening engine — exact diagnostic path
Do NOT fix blindly.

You must determine which layer is broken.

There are only 3 possible failure points:

1.1 Layer A — backend did not supply audio
Check:

currentScreen.audio_url
Source: runtime contract 


If audio_url is:
null

undefined

empty string

Then:

👉 The problem is NOT frontend

Backend cause (must be checked, not guessed)
From session engine:

listening screen must include:

audio_asset_id

resolved into audio_url

From engine flow 


Required agent action
Agent must:

inspect runtime payload (console log full runtime)

locate listening screen object

confirm:

audio_url exists

value is valid string

If missing:
→ STOP frontend work
→ report backend failure

1.2 Layer B — audio URL exists but is invalid
If audio_url exists but:

does not load

gives 404

gives CORS error

gives network error

Then:

👉 problem is API/static serving

Required checks
Agent must:

open audio_url in browser directly

confirm:

file loads

correct MIME type

not blocked

Expected path
From registry 


Audio files exist at:

engine/media/audio_cache/<uuid>.mp3
Required rule
Backend must expose:

/media/audio_cache/<file>.mp3
If not:

→ listening engine will NEVER work

1.3 Layer C — audio exists but UI is broken
If:

audio_url exists

URL works in browser

but no playback in app

Then:

👉 problem is frontend

Causes (from your current state)
raw <audio> used inconsistently 


audio element not resetting on screen change

layout collapse hides player

component re-mount issues

overflow clipping

Required fix (strict)
Audio must ONLY be rendered via:

AudioPlayer.tsx
No inline <audio> anywhere.

2. AudioPlayer — final behavior requirements
This is now strict.

2.1 Component must:
always reinitialize when src changes

not persist previous playback

not auto-play unless explicitly allowed

not collapse container height

not overflow parent

2.2 Required implementation logic
Inside component:

use useRef<HTMLAudioElement>

on src change:

pause

reset currentTime

load()

2.3 Visual constraints
Audio player must occupy:

height: 56px–72px range
width: 100%
No dynamic expansion.

2.4 Forbidden behaviors
autoplay by default

hidden controls

inline styles breaking layout

nested inside scroll containers incorrectly

3. Dimension distortion — root cause analysis
Your distortion is NOT random.

It comes from conflicting vertical systems.

3.1 Your current system
From CSS 

:

outer shell: fixed viewport

middle: flex + centering

inner: constrained panels

content: scroll zone

3.2 The real issue
This combination creates:

"floating content with broken height inheritance"

Main causes:

Cause 1
align-items: center;
This detaches children from full height.

Cause 2
missing:

min-height: 0;
This prevents flex children from shrinking properly.

Cause 3
multiple containers trying to scroll

Cause 4
overflow hidden applied too early

4. Dimension lock system (MANDATORY)
This is the part that prevents future regressions.

4.1 Vertical chain rule
Every layer MUST follow:

height: 100%;
min-height: 0;
display: flex;
flex-direction: column;
4.2 Apply to ALL of these
From your system 

:

.route-stage

.screen-shell

.screen-content-zone

.exam-shell-panel

.exam-content

4.3 Scroll rule (ABSOLUTE)
ONLY:

.exam-content
may scroll.

4.4 All others must have:
overflow: hidden;
4.5 Header + Actions
Must be:

flex-shrink: 0;
This prevents compression.

5. Pixel & spacing lock (no guessing allowed)
This is where your earlier “missing design layer” is fixed.

5.1 Base spacing unit
Everything must follow:

8px grid system
5.2 Allowed spacing values ONLY
4, 8, 12, 16, 24, 32
Nothing else.

5.3 Component constraints
QuestionCard
padding: 16px

gap: 12px

ExamHeader
height: fixed range 72–88px

ExamActions
height: fixed range 64–80px

AudioPlayer container
fixed height range 56–72px

5.4 Forbidden layout behavior
random margin stacking

percentage heights for internal components

auto-expanding containers without max bounds

6. Typography lock (minimal for now)
Use only:

From tokens 


base font sizes

no inline font overrides

7. Safe removal of legacy screen
Now we clean up safely.

7.1 Condition before removal
All must be true:

ExamRuntimeScreen renders correctly

audio works

all screen types render

no dimension break

no console errors

7.2 Then:
Delete or archive:

YkiExamScreen.tsx
7.3 Also remove:
any inline audio usage

duplicate state handling

duplicate API calls

8. Final verification checklist (must be run exactly)
Runtime
 session loads

 screens render in order

 prompt → question separation works

 writing submits

 speaking uploads

 conversation flows

Audio
 listening audio plays

 no reload glitch

 no overlap between tracks

 no broken URLs

Layout
 no vertical centering artifacts

 no double scroll

 no clipped content

 no floating panel

 header + actions fixed

 content scrolls cleanly

Structure
 no duplicate runtime logic

 hooks contain logic only

 components are pure UI

 API logic centralized


CODE GENERATION
Part 1 — Hooks (core runtime brain)
These must be written exactly as below.
Do not rename anything.

1. useExamSession.ts
// frontend/app/exam_runtime/hooks/useExamSession.ts

import { useEffect, useMemo, useState } from "react"

type Runtime = any
type Screen = any

export function useExamSession(sessionId: string | null) {
  const [runtime, setRuntime] = useState<Runtime | null>(null)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const [currentScreenIndex, setCurrentScreenIndex] = useState(0)

  // ---------------------------
  // LOAD SESSION
  // ---------------------------
  async function loadSession() {
    if (!sessionId) return

    setBusy(true)
    setError(null)

    try {
      const res = await fetch(`/api/yki/session/${sessionId}`)
      if (!res.ok) throw new Error("Failed to load session")

      const data = await res.json()
      setRuntime(data)
      setCurrentScreenIndex(0)
    } catch (e: any) {
      setError(e.message || "Unknown error")
    } finally {
      setBusy(false)
    }
  }

  useEffect(() => {
    loadSession()
  }, [sessionId])

  // ---------------------------
  // DERIVED
  // ---------------------------
  const screens: Screen[] = runtime?.screens || []

  const currentScreen: Screen | null =
    screens.length > 0 ? screens[currentScreenIndex] : null

  const promptScreen: Screen | null =
    currentScreenIndex > 0 ? screens[currentScreenIndex - 1] : null

  const isComplete = currentScreenIndex >= screens.length

  const progressText = useMemo(() => {
    if (!screens.length) return ""
    return `${currentScreenIndex + 1} / ${screens.length}`
  }, [currentScreenIndex, screens.length])

  // ---------------------------
  // NAVIGATION
  // ---------------------------
  function goNext() {
    setCurrentScreenIndex((prev) => prev + 1)
  }

  // ---------------------------
  // SUBMIT OBJECTIVE
  // ---------------------------
  async function submitAnswer(payload: any) {
    if (!sessionId) return

    setBusy(true)
    try {
      await fetch(`/api/yki/answer`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          session_id: sessionId,
          ...payload,
        }),
      })
      goNext()
    } catch (e) {
      console.error(e)
    } finally {
      setBusy(false)
    }
  }

  // ---------------------------
  // SUBMIT WRITING
  // ---------------------------
  async function submitWriting(text: string) {
    if (!sessionId) return

    setBusy(true)
    try {
      await fetch(`/api/yki/writing`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          session_id: sessionId,
          text,
        }),
      })
      goNext()
    } catch (e) {
      console.error(e)
    } finally {
      setBusy(false)
    }
  }

  // ---------------------------
  // SUBMIT SPEAKING
  // ---------------------------
  async function submitSpeaking(file: File) {
    if (!sessionId) return

    setBusy(true)

    const form = new FormData()
    form.append("session_id", sessionId)
    form.append("file", file)

    try {
      await fetch(`/api/yki/upload/audio`, {
        method: "POST",
        body: form,
      })
      goNext()
    } catch (e) {
      console.error(e)
    } finally {
      setBusy(false)
    }
  }

  // ---------------------------
  // CONVERSATION
  // ---------------------------
  async function startConversation() {
    if (!sessionId) return

    setBusy(true)
    try {
      await fetch(`/api/yki/conversation/start`, {
        method: "POST",
        body: JSON.stringify({ session_id: sessionId }),
      })
    } finally {
      setBusy(false)
    }
  }

  async function submitTurn(text: string) {
    if (!sessionId) return

    setBusy(true)
    try {
      await fetch(`/api/yki/conversation/turn`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ session_id: sessionId, text }),
      })
    } finally {
      setBusy(false)
    }
  }

  async function requestReply() {
    if (!sessionId) return

    setBusy(true)
    try {
      await fetch(`/api/yki/conversation/reply`, {
        method: "POST",
        body: JSON.stringify({ session_id: sessionId }),
      })
    } finally {
      setBusy(false)
    }
  }

  // ---------------------------
  // FINISH
  // ---------------------------
  async function finishExam() {
    if (!sessionId) return

    setBusy(true)
    try {
      await fetch(`/api/yki/submit`, {
        method: "POST",
        body: JSON.stringify({ session_id: sessionId }),
      })
    } finally {
      setBusy(false)
    }
  }

  // ---------------------------
  // RETURN
  // ---------------------------
  return {
    runtime,
    busy,
    error,

    currentScreen,
    currentScreenIndex,
    promptScreen,
    isComplete,
    progressText,

    submitAnswer,
    submitWriting,
    submitSpeaking,
    startConversation,
    submitTurn,
    requestReply,
    finishExam,
  }
}
2. useExamScreenFlow.ts
// frontend/app/exam_runtime/hooks/useExamScreenFlow.ts

type Screen = any

export function useExamScreenFlow(
  screens: Screen[],
  currentIndex: number
) {
  const totalScreens = screens.length
  const currentStep = currentIndex + 1

  const current = screens[currentIndex]

  const screenType = current?.screen_type || ""
  const skill = current?.skill || ""

  const sectionLabel = skill ? skill.toUpperCase() : ""

  const isPromptScreen = screenType === "prompt"
  const isQuestionScreen = screenType === "objective"
  const isWritingScreen = screenType === "writing"
  const isSpeakingScreen = screenType === "speaking"
  const isConversationScreen = screenType === "conversation"

  const progressText =
    totalScreens > 0 ? `${currentStep} / ${totalScreens}` : ""

  return {
    totalScreens,
    currentStep,
    progressText,
    sectionLabel,

    isPromptScreen,
    isQuestionScreen,
    isWritingScreen,
    isSpeakingScreen,
    isConversationScreen,
  }
}
3. STOP CONDITIONS (before next part)
Before you move to next, ensure:

Both files compile

No TypeScript errors

No API path typos

Hooks are not importing UI components

No JSX inside hooks





CODE GENERATION
Part 2 — Core UI Components (dimension-safe, no layout break)
These components must NOT introduce layout drift.
Follow sizes exactly.

1. AudioPlayer.tsx
// frontend/app/exam_runtime/components/AudioPlayer.tsx

import { useEffect, useRef } from "react"

type Props = {
  src: string
  autoPlay?: boolean
}

export default function AudioPlayer({ src, autoPlay = false }: Props) {
  const ref = useRef<HTMLAudioElement | null>(null)

  useEffect(() => {
    if (!ref.current) return

    // Reset audio completely when source changes
    ref.current.pause()
    ref.current.currentTime = 0
    ref.current.load()

    if (autoPlay) {
      ref.current.play().catch(() => {})
    }
  }, [src, autoPlay])

  return (
    <div
      style={{
        width: "100%",
        height: "64px",
        flexShrink: 0,
        display: "flex",
        alignItems: "center",
      }}
    >
      <audio
        ref={ref}
        controls
        src={src}
        style={{
          width: "100%",
        }}
      />
    </div>
  )
}
2. ExamHeader.tsx
// frontend/app/exam_runtime/components/ExamHeader.tsx

type Props = {
  title: string
  sectionLabel: string
  progressText: string
  onExit: () => void
}

export default function ExamHeader({
  title,
  sectionLabel,
  progressText,
  onExit,
}: Props) {
  return (
    <div
      style={{
        height: "80px",
        flexShrink: 0,
        padding: "16px",
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        borderBottom: "1px solid rgba(255,255,255,0.08)",
      }}
    >
      <div>
        <div style={{ fontSize: "12px", opacity: 0.6 }}>
          {sectionLabel}
        </div>
        <div style={{ fontSize: "18px", fontWeight: 600 }}>
          {title}
        </div>
      </div>

      <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
        <div style={{ fontSize: "14px", opacity: 0.7 }}>
          {progressText}
        </div>
        <button onClick={onExit}>Exit</button>
      </div>
    </div>
  )
}
3. ExamActions.tsx
// frontend/app/exam_runtime/components/ExamActions.tsx

type Action = {
  label: string
  onClick: () => void
  disabled?: boolean
}

type Props = {
  actions: Action[]
}

export default function ExamActions({ actions }: Props) {
  return (
    <div
      style={{
        height: "72px",
        flexShrink: 0,
        padding: "16px",
        display: "flex",
        justifyContent: "flex-end",
        gap: "12px",
        borderTop: "1px solid rgba(255,255,255,0.08)",
      }}
    >
      {actions.map((a, i) => (
        <button key={i} onClick={a.onClick} disabled={a.disabled}>
          {a.label}
        </button>
      ))}
    </div>
  )
}
4. PromptMaterial.tsx
// frontend/app/exam_runtime/components/PromptMaterial.tsx

import AudioPlayer from "./AudioPlayer"

type Props = {
  materials?: any[]
  audio_url?: string
}

export default function PromptMaterial({ materials, audio_url }: Props) {
  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        gap: "16px",
      }}
    >
      {audio_url && <AudioPlayer src={audio_url} />}

      {materials?.map((m, i) => (
        <div key={i}>
          <p style={{ lineHeight: 1.6 }}>{m.content}</p>
        </div>
      ))}
    </div>
  )
}
5. QuestionCard.tsx
// frontend/app/exam_runtime/components/QuestionCard.tsx

type Props = {
  question: any
  selected?: string
  onSelect: (value: string) => void
}

export default function QuestionCard({
  question,
  selected,
  onSelect,
}: Props) {
  return (
    <div
      style={{
        padding: "16px",
        border: "1px solid rgba(255,255,255,0.08)",
        borderRadius: "12px",
        display: "flex",
        flexDirection: "column",
        gap: "12px",
      }}
    >
      <div>{question.prompt}</div>

      {question.options?.map((opt: any, i: number) => {
        const isSelected = selected === opt.value

        return (
          <button
            key={i}
            onClick={() => onSelect(opt.value)}
            style={{
              textAlign: "left",
              padding: "12px",
              borderRadius: "8px",
              border: isSelected
                ? "1px solid #4f8cff"
                : "1px solid rgba(255,255,255,0.08)",
            }}
          >
            {opt.label}
          </button>
        )
      })}
    </div>
  )
}
6. QuestionList.tsx
// frontend/app/exam_runtime/components/QuestionList.tsx

import QuestionCard from "./QuestionCard"

type Props = {
  questions: any[]
  answers: Record<string, string>
  onSelect: (id: string, value: string) => void
}

export default function QuestionList({
  questions,
  answers,
  onSelect,
}: Props) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
      {questions.map((q) => (
        <QuestionCard
          key={q.id}
          question={q}
          selected={answers[q.id]}
          onSelect={(v) => onSelect(q.id, v)}
        />
      ))}
    </div>
  )
}
7. WritingResponseCard.tsx
// frontend/app/exam_runtime/components/WritingResponseCard.tsx

import { useState } from "react"

type Props = {
  onSubmit: (text: string) => void
}

export default function WritingResponseCard({ onSubmit }: Props) {
  const [value, setValue] = useState("")

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
      <textarea
        value={value}
        onChange={(e) => setValue(e.target.value)}
        style={{
          minHeight: "160px",
          padding: "12px",
          borderRadius: "8px",
        }}
      />

      <button onClick={() => onSubmit(value)}>Submit</button>
    </div>
  )
}
8. SpeakingRecorderCard.tsx
// frontend/app/exam_runtime/components/SpeakingRecorderCard.tsx

import { useRef, useState } from "react"

type Props = {
  onSubmit: (file: File) => void
}

export default function SpeakingRecorderCard({ onSubmit }: Props) {
  const [recording, setRecording] = useState(false)
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null)

  const mediaRecorder = useRef<MediaRecorder | null>(null)
  const chunks = useRef<Blob[]>([])

  async function start() {
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
    const recorder = new MediaRecorder(stream)

    recorder.ondataavailable = (e) => {
      chunks.current.push(e.data)
    }

    recorder.onstop = () => {
      const blob = new Blob(chunks.current, { type: "audio/webm" })
      setAudioBlob(blob)
      chunks.current = []
    }

    recorder.start()
    mediaRecorder.current = recorder
    setRecording(true)
  }

  function stop() {
    mediaRecorder.current?.stop()
    setRecording(false)
  }

  function submit() {
    if (!audioBlob) return
    const file = new File([audioBlob], "speech.webm")
    onSubmit(file)
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
      {!recording ? (
        <button onClick={start}>Start Recording</button>
      ) : (
        <button onClick={stop}>Stop Recording</button>
      )}

      {audioBlob && (
        <>
          <audio controls src={URL.createObjectURL(audioBlob)} />
          <button onClick={submit}>Submit</button>
        </>
      )}
    </div>
  )
}
9. ConversationTranscript.tsx
// frontend/app/exam_runtime/components/ConversationTranscript.tsx

type Props = {
  messages: { speaker: string; text: string }[]
}

export default function ConversationTranscript({ messages }: Props) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
      {messages.map((m, i) => (
        <div key={i}>
          <strong>{m.speaker}:</strong> {m.text}
        </div>
      ))}
    </div>
  )
}
10. EmptyRuntimeState.tsx
// frontend/app/exam_runtime/components/EmptyRuntimeState.tsx

type Props = {
  message?: string
}

export default function EmptyRuntimeState({ message }: Props) {
  return (
    <div
      style={{
        padding: "24px",
        textAlign: "center",
        opacity: 0.7,
      }}
    >
      {message || "No runtime available"}
    </div>
  )
}
STOP CONDITIONS
Before typing next, verify:

No component imports hooks incorrectly

AudioPlayer is used only via props

No layout uses margin for vertical stacking

All components are pure UI (no API calls)


CODE GENERATION
Part 3 — ExamRuntimeScreen.tsx (full orchestration, zero ambiguity)
1. File
// frontend/app/exam_runtime/screens/ExamRuntimeScreen.tsx
2. Full implementation
import { useMemo, useState } from "react"
import { useParams, useNavigate } from "react-router-dom"

import ScreenScaffold from "@/components/ScreenScaffold"
import EmptyRuntimeState from "../components/EmptyRuntimeState"
import ExamHeader from "../components/ExamHeader"
import ExamActions from "../components/ExamActions"
import PromptMaterial from "../components/PromptMaterial"
import QuestionList from "../components/QuestionList"
import WritingResponseCard from "../components/WritingResponseCard"
import SpeakingRecorderCard from "../components/SpeakingRecorderCard"
import ConversationTranscript from "../components/ConversationTranscript"

import { useExamSession } from "../hooks/useExamSession"
import { useExamScreenFlow } from "../hooks/useExamScreenFlow"

export default function ExamRuntimeScreen() {
  const { sessionId } = useParams()
  const navigate = useNavigate()

  const {
    runtime,
    busy,
    error,
    currentScreen,
    currentScreenIndex,
    promptScreen,
    isComplete,
    progressText,

    submitAnswer,
    submitWriting,
    submitSpeaking,
    startConversation,
    submitTurn,
    requestReply,
    finishExam,
  } = useExamSession(sessionId || null)

  const screens = runtime?.screens || []

  const flow = useExamScreenFlow(screens, currentScreenIndex)

  const [answers, setAnswers] = useState<Record<string, string>>({})
  const [conversationInput, setConversationInput] = useState("")

  // -----------------------------
  // EXIT HANDLER
  // -----------------------------
  function handleExit() {
    navigate("/")
  }

  // -----------------------------
  // ACTIONS BUILDER
  // -----------------------------
  const actions = useMemo(() => {
    if (!currentScreen) return []

    const list: any[] = []

    if (flow.isQuestionScreen) {
      list.push({
        label: "Next",
        onClick: () => submitAnswer({ answers }),
        disabled: busy,
      })
    }

    if (flow.isWritingScreen) {
      // handled inside component
    }

    if (flow.isSpeakingScreen) {
      // handled inside component
    }

    if (flow.isConversationScreen) {
      list.push({
        label: "Send",
        onClick: () => {
          submitTurn(conversationInput)
          setConversationInput("")
        },
      })
      list.push({
        label: "Get Reply",
        onClick: () => requestReply(),
      })
    }

    if (isComplete) {
      list.push({
        label: "Finish",
        onClick: finishExam,
      })
    }

    return list
  }, [
    currentScreen,
    flow,
    answers,
    busy,
    conversationInput,
    isComplete,
  ])

  // -----------------------------
  // CONTENT RENDERER
  // -----------------------------
  function renderContent() {
    if (!currentScreen) {
      return <EmptyRuntimeState />
    }

    const { screen_type, materials, questions, audio_url } = currentScreen

    if (flow.isPromptScreen) {
      return <PromptMaterial materials={materials} audio_url={audio_url} />
    }

    if (flow.isQuestionScreen) {
      return (
        <QuestionList
          questions={questions || []}
          answers={answers}
          onSelect={(id, value) =>
            setAnswers((prev) => ({ ...prev, [id]: value }))
          }
        />
      )
    }

    if (flow.isWritingScreen) {
      return <WritingResponseCard onSubmit={submitWriting} />
    }

    if (flow.isSpeakingScreen) {
      return <SpeakingRecorderCard onSubmit={submitSpeaking} />
    }

    if (flow.isConversationScreen) {
      return (
        <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
          <ConversationTranscript
            messages={currentScreen.messages || []}
          />

          <input
            value={conversationInput}
            onChange={(e) => setConversationInput(e.target.value)}
            placeholder="Type your response"
          />
        </div>
      )
    }

    return <EmptyRuntimeState message="Unsupported screen type" />
  }

  // -----------------------------
  // ERROR / LOADING / COMPLETE
  // -----------------------------
  if (error) {
    return <EmptyRuntimeState message={error} />
  }

  if (!runtime) {
    return <EmptyRuntimeState message="Loading..." />
  }

  if (isComplete) {
    return (
      <ScreenScaffold>
        <div className="screen-shell">
          <div className="exam-shell-panel">
            <div className="exam-content">
              <EmptyRuntimeState message="Exam complete" />
            </div>

            <ExamActions actions={actions} />
          </div>
        </div>
      </ScreenScaffold>
    )
  }

  // -----------------------------
  // MAIN RENDER
  // -----------------------------
  return (
    <ScreenScaffold>
      <div className="screen-shell">
        <div className="exam-shell-panel">
          <ExamHeader
            title={currentScreen?.title || "Exam"}
            sectionLabel={flow.sectionLabel}
            progressText={progressText}
            onExit={handleExit}
          />

          <div className="exam-content">
            {renderContent()}
          </div>

          <ExamActions actions={actions} />
        </div>
      </div>
    </ScreenScaffold>
  )
}
3. NON-NEGOTIABLE STRUCTURE CHECK
Before moving forward, verify ALL:

Layout chain
Must exist exactly:

ScreenScaffold
  └── screen-shell
        └── exam-shell-panel
              ├── ExamHeader
              ├── exam-content
              └── ExamActions
No violations
❌ No API calls inside components

❌ No <audio> tag outside AudioPlayer

❌ No direct mutation of runtime

❌ No extra wrapper divs around layout chain

Runtime contract usage
Must ONLY use:

currentScreen.screen_type

materials

questions

audio_url

From runtime 


Scroll rule
ONLY .exam-content scrolls

Actions rule
No back button

Only valid actions per screen

4. STOP CONDITIONS
Do NOT proceed until:

Page renders without crash

Switching screens works

Prompt → Question separation visible

AudioPlayer renders when audio_url exists

Layout fills full height (even if not perfect yet)


CODE GENERATION
Part 4 — Dimension Lock + CSS Corrections (authoritative fixes)
1. FILE TO EDIT
frontend/app/global.css
This is where the distortion originates 


2. CORE PROBLEM SUMMARY (do not skip)
Your layout currently has:

vertical centering (align-items: center)

missing min-height: 0

multiple competing containers

overflow applied too early

This creates:

floating UI + compressed content + broken scroll

3. EXACT REQUIRED MODIFICATIONS
Apply these changes directly.

3.1 FIX .main-content
FIND:
.main-content {
  align-items: center;
}
REPLACE WITH:
.main-content {
  align-items: stretch;
}
3.2 FIX FLEX SHRINK CHAIN
Add this block (if not present):

.route-stage,
.screen-shell,
.screen-content-zone,
.exam-shell-panel,
.exam-content {
  min-height: 0;
}
This is critical.
Without this, flex children cannot shrink → layout breaks.

3.3 ENFORCE FULL HEIGHT CHAIN
Modify/add:

.route-stage {
  height: 100%;
  display: flex;
  flex-direction: column;
}

.screen-shell {
  height: 100%;
  display: flex;
  flex-direction: column;
}

.screen-content-zone {
  height: 100%;
  display: flex;
  flex-direction: column;
}

.exam-shell-panel {
  height: 100%;
  display: flex;
  flex-direction: column;
}
3.4 LOCK SCROLL CONTAINER
Modify .exam-content:

.exam-content {
  flex: 1;
  min-height: 0;
  overflow-y: auto;
}
3.5 PREVENT MULTIPLE SCROLL AREAS
Ensure these are set:

.route-stage,
.screen-shell,
.screen-content-zone,
.exam-shell-panel {
  overflow: hidden;
}
3.6 LOCK HEADER AND ACTIONS
Add:

.exam-shell-panel > *:first-child,
.exam-shell-panel > *:last-child {
  flex-shrink: 0;
}
3.7 REMOVE HIDDEN BREAKERS
Search and REMOVE if found:

height: auto;
max-height: auto;
inside runtime-related containers.

4. OPTIONAL BUT SAFE (RECOMMENDED)
Add this to prevent subtle overflow bugs:

* {
  box-sizing: border-box;
}
5. VERIFY AGAINST EXISTING STRUCTURE
From your file 


You already have:

.app-shell

.main-content

.screen-shell

.exam-shell-panel

We are NOT changing structure — only fixing behavior.

6. DIMENSION VALIDATION CHECKLIST
After applying CSS, verify visually:

6.1 Full height usage
screen fills entire viewport

no floating panel in middle

no vertical centering gap

6.2 Scroll behavior
only middle content scrolls

header stays fixed

actions stay fixed

6.3 No clipping
audio player fully visible

question cards not cut

textarea visible fully

6.4 No double scroll
no scroll inside scroll

no page scroll + inner scroll conflict

7. CRITICAL FAILURE CASES (must not happen)
If any of these occur, stop:

Case 1
Content does not scroll
→ .exam-content missing flex: 1 or min-height: 0

Case 2
Header scrolls away
→ flex-shrink: 0 missing

Case 3
Content appears centered
→ .main-content align-items not updated

Case 4
Two scrollbars
→ overflow not properly locked

8. DO NOT TOUCH (yet)
Do NOT modify:

colors

typography

spacing tokens

animations

icons

This phase is ONLY structural.

9. FINAL STATE AFTER PART 4
At this point:

runtime layer exists

audio system is connected

layout is stable

no distortion

no floating UI

scroll is correct

components render predictably



PART 5 — LISTENING ENGINE (END-TO-END FIX)
1. GOAL (STRICT)
At the end of this part:

Every listening screen MUST:

have valid audio_url

render AudioPlayer

play correctly

not reload incorrectly

not overlap audio

not break layout

2. SYSTEM TRUTH (NO INTERPRETATION)
From runtime contract:

audio_url: Optional[str]
Source 


From session engine:

audio is resolved before runtime is sent 


From registry:

audio files exist at:

engine/media/audio_cache/<uuid>.mp3
Source 


3. FAILURE TYPES (MUST CLASSIFY FIRST)
Agent MUST classify which case applies:

CASE A — audio_url missing
if (!currentScreen.audio_url)
→ backend issue

CASE B — audio_url exists but broken
→ API/static serving issue

CASE C — audio_url works but no playback
→ frontend issue

4. STEP 1 — RUNTIME INSPECTION (MANDATORY)
Inside ExamRuntimeScreen.tsx, TEMPORARILY add:

console.log("CURRENT SCREEN:", currentScreen)
Agent must verify:
For a listening screen:

{
  "screen_type": "...",
  "audio_url": "..."
}
STOP CONDITION
If audio_url is missing:

→ DO NOT CONTINUE
→ jump to Section 8 (backend fix)

5. STEP 2 — DIRECT AUDIO TEST
Copy audio_url from console.

Open in browser:

http://localhost:xxxx/media/audio_cache/<file>.mp3
Must confirm:
audio plays

no 404

no CORS

correct MIME type

STOP CONDITIONS
If:

404 → path broken

CORS → server misconfigured

download instead of play → MIME wrong

→ go to Section 9

6. STEP 3 — FRONTEND ENFORCEMENT
Now enforce AudioPlayer usage.

6.1 Search entire repo
Find:

<audio
REMOVE ALL occurrences
Replace ALL with:

<AudioPlayer src={audio_url} />
This is NON-NEGOTIABLE
No inline audio allowed.

7. STEP 4 — AUDIO PLAYER HARDENING
Replace AudioPlayer with this exact version:

import { useEffect, useRef } from "react"

type Props = {
  src: string
  autoPlay?: boolean
}

export default function AudioPlayer({ src, autoPlay = false }: Props) {
  const ref = useRef<HTMLAudioElement | null>(null)

  useEffect(() => {
    const audio = ref.current
    if (!audio) return

    audio.pause()
    audio.currentTime = 0

    audio.src = src
    audio.load()

    if (autoPlay) {
      audio.play().catch(() => {})
    }

    return () => {
      audio.pause()
    }
  }, [src, autoPlay])

  return (
    <div
      style={{
        width: "100%",
        height: "64px",
        flexShrink: 0,
      }}
    >
      <audio
        ref={ref}
        controls
        style={{ width: "100%" }}
      />
    </div>
  )
}
Critical differences vs earlier
explicitly sets audio.src

cleanup pauses audio

avoids stale references

8. BACKEND FIX — MISSING audio_url
Only apply if CASE A.

8.1 File
engine/exam/exam_session_engine_v3_2.py
8.2 Find listening screen creation
Look for where:

screen = {
  ...
}
8.3 REQUIRED ADDITION
You MUST ensure:

from engine.media.media_registry import resolve_audio_url

screen["audio_url"] = resolve_audio_url(task["audio_asset_id"])
8.4 RULE
DO NOT:

generate audio

fake UUID

fallback silently

8.5 VALIDATION
After fix:

restart backend

reload session

confirm audio_url appears

9. BACKEND FIX — STATIC SERVING
Only apply if CASE B.

9.1 File
engine/api/exam_api_v3_3.py
9.2 ADD STATIC ROUTE
from fastapi.staticfiles import StaticFiles

app.mount(
    "/media/audio_cache",
    StaticFiles(directory="engine/media/audio_cache"),
    name="audio_cache",
)
9.3 VALIDATION
Open:

http://localhost:8000/media/audio_cache/<file>.mp3
Must play.

10. AUDIO SYNCHRONIZATION RULE
When screen changes:

previous audio MUST stop

new audio MUST not overlap

Already enforced via:
useEffect cleanup
11. MULTI-AUDIO PREVENTION
Ensure:

only ONE AudioPlayer per screen

In PromptMaterial:
{audio_url && <AudioPlayer src={audio_url} />}
DO NOT:

render audio in QuestionCard

render audio in multiple places

12. FINAL AUDIO CHECKLIST
Backend
 audio_url exists

 valid path

 static route works

Frontend
 AudioPlayer used everywhere

 no inline audio

 audio resets correctly

 no overlapping playback

UX
 audio visible

 controls usable

 no layout shift

STOP CONDITION FOR PART 5
You do NOT proceed to Part 6 until:

at least one listening task plays correctly

no console errors

no duplicate audio playback

no missing audio_url

PART 6 — PIXEL LOCK SYSTEM (B)
This is where we stop “approximate UI” completely.

Everything becomes fixed, measurable, and repeatable.

1. GOAL (STRICT)
After this part:

Every screen uses the same spacing system

Every component has fixed dimensions

No element stretches unpredictably

No overflow on any screen size

No “guessing” margins or paddings anywhere

2. ROOT PROBLEM (WHAT IS CURRENTLY WRONG)
From what you described earlier:

UI elements are stretching based on content

No consistent spacing scale

Different components use random paddings

Cards are not aligned across screens

Layout breaks on smaller screens

This means:

❌ No design tokens
❌ No layout constraints
❌ No container system

3. NON-NEGOTIABLE RULE
From this point forward:

NO raw pixel values are allowed inside components

Everything must come from a central system.

4. CREATE DESIGN TOKENS (FOUNDATION)
FILE
frontend/app/theme/tokens.ts
FULL CODE
export const spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
}

export const radius = {
  sm: 6,
  md: 10,
  lg: 16,
  xl: 24,
}

export const layout = {
  maxContentWidth: 860,
  readingWidth: 720,
  questionWidth: 640,
}

export const heights = {
  header: 64,
  footer: 72,
  audioPlayer: 64,
  button: 48,
}

export const zIndex = {
  base: 1,
  overlay: 10,
  modal: 100,
}
5. GLOBAL CONTAINER SYSTEM
FILE
frontend/app/components/layout/ScreenContainer.tsx
FULL CODE
type Props = {
  children: React.ReactNode
}

export default function ScreenContainer({ children }: Props) {
  return (
    <div
      style={{
        width: "100%",
        height: "100vh",
        display: "flex",
        justifyContent: "center",
        overflow: "hidden",
      }}
    >
      <div
        style={{
          width: "100%",
          maxWidth: "860px",
          height: "100%",
          display: "flex",
          flexDirection: "column",
        }}
      >
        {children}
      </div>
    </div>
  )
}
6. CONTENT WRAPPER (CRITICAL)
FILE
frontend/app/components/layout/ContentWrapper.tsx
FULL CODE
import { spacing } from "../../theme/tokens"

type Props = {
  children: React.ReactNode
}

export default function ContentWrapper({ children }: Props) {
  return (
    <div
      style={{
        flex: 1,
        overflowY: "auto",
        padding: spacing.lg,
        display: "flex",
        flexDirection: "column",
        gap: spacing.lg,
      }}
    >
      {children}
    </div>
  )
}
7. CARD SYSTEM (STRICT SIZE LOCK)
FILE
frontend/app/components/ui/Card.tsx
FULL CODE
import { radius, spacing } from "../../theme/tokens"

type Props = {
  children: React.ReactNode
}

export default function Card({ children }: Props) {
  return (
    <div
      style={{
        width: "100%",
        padding: spacing.lg,
        borderRadius: radius.lg,
        background: "#ffffff",
        boxShadow: "0 4px 16px rgba(0,0,0,0.08)",
      }}
    >
      {children}
    </div>
  )
}
8. TEXT BLOCK STANDARDIZATION
FILE
frontend/app/components/ui/TextBlock.tsx
FULL CODE
type Props = {
  children: React.ReactNode
}

export default function TextBlock({ children }: Props) {
  return (
    <div
      style={{
        lineHeight: 1.6,
        fontSize: "16px",
        color: "#111",
        wordBreak: "break-word",
      }}
    >
      {children}
    </div>
  )
}
9. BUTTON STANDARDIZATION (REPLACE YOUR CURRENT ONE)
FILE
frontend/app/components/ui/Button.tsx
FULL CODE
import { heights, radius } from "../../theme/tokens"

type Props = {
  label: string
  onClick: () => void
}

export default function Button({ label, onClick }: Props) {
  return (
    <button
      onClick={onClick}
      style={{
        height: heights.button,
        borderRadius: radius.md,
        border: "none",
        background: "#0b5fff",
        color: "#fff",
        fontSize: "16px",
        cursor: "pointer",
        width: "100%",
      }}
    >
      {label}
    </button>
  )
}
10. EXAM SCREEN LAYOUT (LOCKED STRUCTURE)
UPDATE FILE
ExamRuntimeScreen.tsx
REPLACE RETURN BLOCK WITH:
return (
  <ScreenContainer>
    <ContentWrapper>

      {currentScreen?.prompt && (
        <PromptMaterial
          text={currentScreen.prompt}
          audio_url={currentScreen.audio_url}
        />
      )}

      {currentScreen?.questions?.map((q) => (
        <QuestionCard
          key={q.id}
          question={q}
        />
      ))}

      <Button
        label="Next"
        onClick={handleNext}
      />

    </ContentWrapper>
  </ScreenContainer>
)
11. CRITICAL RULES ENFORCED
RULE 1 — WIDTH LOCK
Everything must stay within:

maxWidth: 860px
RULE 2 — NO FULL WIDTH TEXT
Text must always be inside:

Card

TextBlock

RULE 3 — SCROLL ONLY IN CONTENT WRAPPER
Only:

overflowY: "auto"
inside ContentWrapper

RULE 4 — NO POSITION: ABSOLUTE FOR CORE UI
Unless:

overlays

modals

RULE 5 — GAP SYSTEM ONLY
Spacing ONLY via:

gap: spacing.*
NO:

marginTop: 17
marginBottom: 13
12. SCREEN DIMENSION FIX (IMPORTANT)
ISSUE
Mobile screens previously:

overflow horizontally

cut off buttons

inconsistent heights

FIX (ALREADY INCLUDED)
height: "100vh"
overflow: "hidden"
internal scroll via wrapper

13. RESPONSIVENESS (CONTROLLED)
ADD THIS TO ScreenContainer
padding: "0 12px"
So mobile does not touch edges.

14. FINAL CHECKLIST
Layout
 centered content

 max width respected

 no horizontal scroll

Components
 cards consistent

 spacing consistent

 buttons same height everywhere

Behavior
 scroll only in content

 no layout jump

STOP CONDITION FOR PART 6
You do NOT proceed until:

layout identical across screens

no overflow

spacing visually consistent

no random margins exist



PART 7 — COMPONENT CONTRACT HARDENING (A)
This is the most important layer so far.

If this is wrong, everything else collapses again later.

1. GOAL (STRICT)
After this part:

Frontend NEVER guesses data shape

Backend NEVER leaks internal schema

Runtime contract is the ONLY truth

Web + Mobile both consume the SAME contract safely

No undefined/null crashes

No mismatched fields

2. ROOT PROBLEM (CURRENT STATE)
From your system:

frontend expects flattened tasks ❌

backend returns grouped sections ✅

frontend assumes fields exist ❌

backend uses optional fields ✅

naming inconsistencies exist ❌

This causes:

empty screens

broken navigation

missing audio

undefined crashes

3. NON-NEGOTIABLE RULE
Frontend MUST ONLY use public_exam_runtime_models_v3_3.py

Never:

infer fields

reuse internal schema

reshape backend data manually

4. DEFINE STRICT TYPES (FRONTEND)
FILE
frontend/app/types/exam.ts
FULL CODE
export type Exam = {
  exam_id: string
  sections: Section[]
}

export type Section = {
  section_id: string
  section_type: "reading" | "listening" | "writing" | "speaking"
  screens: Screen[]
}

export type Screen = {
  screen_id: string
  screen_type: string

  prompt?: string
  audio_url?: string

  questions?: Question[]
}

export type Question = {
  id: string
  question: string

  options?: string[]
  correct_answer?: string
}
5. API CLIENT (STRICT NORMALIZATION LAYER)
FILE
frontend/app/services/exam_api_client.ts
FULL CODE
import { Exam } from "../types/exam"

const BASE_URL = "http://localhost:8000"

export async function startExam(): Promise<Exam> {
  const res = await fetch(`${BASE_URL}/start_exam`)

  if (!res.ok) {
    throw new Error("Failed to start exam")
  }

  const data = await res.json()

  validateExam(data)

  return data
}
6. VALIDATION LAYER (CRITICAL)
ADD IN SAME FILE
function validateExam(data: any) {
  if (!data.exam_id) {
    throw new Error("Invalid exam: missing exam_id")
  }

  if (!Array.isArray(data.sections)) {
    throw new Error("Invalid exam: sections missing")
  }

  data.sections.forEach((section: any) => {
    if (!section.section_type) {
      throw new Error("Invalid section: missing type")
    }

    if (!Array.isArray(section.screens)) {
      throw new Error("Invalid section: missing screens")
    }

    section.screens.forEach((screen: any) => {
      if (!screen.screen_id) {
        throw new Error("Invalid screen: missing id")
      }
    })
  })
}
7. FLATTENING ENGINE (FRONTEND SIDE ONLY)
We do NOT change backend.

We adapt frontend safely.

FILE
frontend/app/hooks/useExamSession.ts
FULL CODE
import { useState } from "react"
import { Exam, Screen } from "../types/exam"

export function useExamSession(exam: Exam) {
  const [index, setIndex] = useState(0)

  const screens: Screen[] = exam.sections.flatMap(
    (section) => section.screens
  )

  const currentScreen = screens[index]

  function next() {
    if (index < screens.length - 1) {
      setIndex(index + 1)
    }
  }

  return {
    currentScreen,
    next,
    index,
    total: screens.length,
  }
}
8. UPDATE ExamRuntimeScreen
CRITICAL CHANGE
const { currentScreen, next } = useExamSession(exam)
REMOVE any previous logic like:
exam.tasks
❌ MUST NOT EXIST ANYWHERE

9. NULL SAFETY (MANDATORY)
ALWAYS GUARD
if (!currentScreen) return null
SAFE RENDERING
{currentScreen.prompt && ...}
{currentScreen.audio_url && ...}
{currentScreen.questions?.map(...)}
10. RESULT CONTRACT FIX
PROBLEM
Backend returns:

{
  "score": ...,
  "feedback": ...
}
Frontend assumes something else ❌

FIX
FILE
frontend/app/services/result_api.ts
CODE
export async function submitExam(data: any) {
  const res = await fetch("http://localhost:8000/submit_exam", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  })

  const result = await res.json()

  if (!("score" in result)) {
    throw new Error("Invalid result format")
  }

  return result
}
11. GLOBAL ERROR BOUNDARY (USE YOUR EXISTING FILE)
You already have:

GlobalErrorBoundary.tsx
ENSURE IT WRAPS ROOT
<GlobalErrorBoundary>
  <App />
</GlobalErrorBoundary>
12. WEB + MOBILE UNIFICATION (IMPORTANT)
RULE
Same codebase must work for:

Web (browser)

Mobile (React Native / Expo)

DO NOT:
create separate logic paths

duplicate components

DO:
Use adaptive styling ONLY

ADD
const isWeb = typeof window !== "undefined"
EXAMPLE
style={{
  padding: isWeb ? 24 : 16
}}
13. API URL CONTROL (ENV)
FILE
frontend/app/config/env.ts
CODE
export const API_URL =
  typeof window !== "undefined"
    ? "http://localhost:8000"
    : "http://10.0.2.2:8000"
14. FINAL CHECKLIST
Contract
 frontend uses ONLY public schema

 no internal fields referenced

Runtime
 screens flattened correctly

 navigation works

Safety
 no undefined crashes

 validation blocks bad data

Cross-platform
 works in browser

 works in mobile

STOP CONDITION FOR PART 7
You do NOT proceed until:

exam loads from API

screens render correctly

navigation works end-to-end

no crashes occur


PART 8 — FINAL INTEGRATION + REGRESSION LOCK SYSTEM
This is where we make sure:

nothing silently breaks again

every change is forced through validation

both repos stay aligned

frontend + backend cannot drift apart

1. GOAL (STRICT)
After this part:

every runtime response is validated automatically

every UI render is guarded

regressions are detected early

no broken release can pass unnoticed

2. TWO-REPO SYNCHRONIZATION (CRITICAL)
You explicitly have:

/home/vitus/kielitaika/
/home/vitus/kielitaikka-yki-engine/
RULE
Backend = single source of truth
Frontend = strict consumer

NEVER ALLOW:
frontend defining schema independently ❌

backend changing contract without validation ❌

3. BACKEND CONTRACT LOCK (ENGINE SIDE)
FILE
engine/api/exam_api_v3_3.py
ADD RESPONSE VALIDATION BEFORE RETURN
CODE
from engine.schema.public_exam_runtime_models_v3_3 import ExamRuntime

def validate_runtime_output(data: dict):
    try:
        ExamRuntime(**data)
    except Exception as e:
        raise ValueError(f"RUNTIME CONTRACT VIOLATION: {e}")
APPLY IN ROUTE
@app.get("/start_exam")
def start_exam():
    data = generate_exam_runtime()

    validate_runtime_output(data)

    return data
EFFECT
backend CANNOT return invalid structure

schema drift is stopped immediately

4. FRONTEND RUNTIME GUARD (UI SIDE)
FILE
frontend/app/components/runtime/RuntimeGuard.tsx
FULL CODE
type Props = {
  children: React.ReactNode
  condition: boolean
  fallback?: React.ReactNode
}

export default function RuntimeGuard({
  children,
  condition,
  fallback = null,
}: Props) {
  if (!condition) return fallback
  return <>{children}</>
}
USAGE (MANDATORY)
<RuntimeGuard condition={!!currentScreen}>
  <ExamScreen />
</RuntimeGuard>
5. SCREEN VALIDATOR (FRONTEND)
FILE
frontend/app/utils/validateScreen.ts
FULL CODE
import { Screen } from "../types/exam"

export function validateScreen(screen: Screen) {
  if (!screen.screen_id) {
    throw new Error("Screen missing ID")
  }

  if (!screen.screen_type) {
    throw new Error("Screen missing type")
  }

  if (screen.screen_type.includes("listening")) {
    if (!screen.audio_url) {
      throw new Error("Listening screen missing audio_url")
    }
  }
}
APPLY IN HOOK
validateScreen(currentScreen)
6. DEV DEBUG PANEL (VERY IMPORTANT)
FILE
frontend/app/components/debug/DebugPanel.tsx
FULL CODE
export default function DebugPanel({ data }: { data: any }) {
  return (
    <pre
      style={{
        position: "fixed",
        bottom: 0,
        right: 0,
        width: "320px",
        height: "200px",
        overflow: "auto",
        background: "#000",
        color: "#0f0",
        fontSize: "10px",
        zIndex: 9999,
      }}
    >
      {JSON.stringify(data, null, 2)}
    </pre>
  )
}
USAGE (DEV ONLY)
{process.env.NODE_ENV === "development" && (
  <DebugPanel data={currentScreen} />
)}
7. REGRESSION TEST — FRONTEND
FILE
frontend/app/tests/runtime.test.ts
CODE
import { validateScreen } from "../utils/validateScreen"

test("screen must be valid", () => {
  const screen = {
    screen_id: "1",
    screen_type: "reading",
  }

  expect(() => validateScreen(screen)).not.toThrow()
})
8. REGRESSION TEST — BACKEND
FILE
engine/tests/test_runtime_contract.py
CODE
from engine.api.exam_api_v3_3 import start_exam

def test_runtime_contract():
    data = start_exam()

    assert "exam_id" in data
    assert "sections" in data
    assert isinstance(data["sections"], list)
9. AUDIO VALIDATION TEST
ADD
def test_audio_presence():
    data = start_exam()

    for section in data["sections"]:
        if section["section_type"] == "listening":
            for screen in section["screens"]:
                assert "audio_url" in screen
10. BUILD PIPELINE RULE (MANDATORY)
Before ANY deployment:

Backend
pytest engine/tests/
Frontend
npm run test
BOTH MUST PASS
11. MANUAL QA CHECKLIST (FINAL LOCK)
FLOW
 start exam

 navigate all sections

 listening plays

 reading renders

 writing input works

 speaking does not crash

UI
 no overflow

 spacing consistent

 buttons visible

DATA
 no undefined fields

 no console errors

12. HARD FAILURE POLICY
If ANY of these happen:

missing audio_url

undefined screen

invalid schema

UI overflow

→ deployment is BLOCKED

13. FINAL ARCHITECTURE STATE
Backend (engine repo)
generates exam

validates schema

serves media

exposes clean API

Frontend (kielitaika repo)
consumes ONLY runtime contract

validates screens

renders safely

handles navigation

Shared guarantee
deterministic

auditable

stable

FINAL STOP CONDITION
You are done ONLY when:

backend passes all tests

frontend passes all tests

manual QA passes

web + mobile both work

no visual or runtime errors exist
