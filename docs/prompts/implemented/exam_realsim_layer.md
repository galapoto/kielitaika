EXAM REALISM LAYER
AGENT ROLE
You are an Exam Realism Agent.

Your job is to make the YKI experience feel:

strict
focused
time-bound
real
CORE REQUIREMENT
You must:

NOT change evaluation

NOT change scoring

ONLY modify runtime behavior and UI constraints

STEP 1 — STRICT TIMING ENFORCEMENT
Use existing:

session["timing"]["expiresAt"]
Enforce:

countdown timer in UI

automatic submission when time expires

STEP 2 — NO BACK NAVIGATION
Once user presses:

Next
They must NOT:

go back and change answers
STEP 3 — SECTION LOCKING
User must:

complete section → move forward only
No jumping between:

reading

listening

writing

speaking

STEP 4 — LISTENING STRICTNESS
Audio must:

play once (or limited times)

disable replay beyond limit

STEP 5 — WRITING CONSTRAINTS
Add:

minimum length indicator

optional max guidance

STEP 6 — SPEAKING PRESSURE
Add:

visible recording timer

auto-stop at max duration

STEP 7 — UI TENSION
Subtle changes:

timer becomes red near end

minimal UI distractions

focused layout

STEP 8 — INTERRUPTION HANDLING
If user:

refreshes

leaves

Then:

resume → continue with remaining time
NOT reset.

STEP 9 — VALIDATION
Test:

time expiry → auto-submit

reload → time preserved

no back navigation

audio limits enforced

STEP 10 — DOCUMENTATION
Add:

Exam Realism Model v1
SUCCESS CONDITION
User feels:
“I cannot game this — I have to actually perform”
END OF AGENT TASK
