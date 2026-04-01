POST-MIGRATION EXECUTION (CHAINED)
You are continuing the KieliTaika system.

Migration is complete.

The system is structurally correct, deterministic, and fully governed.

Your task is now to execute two sequential phases:

YKI Exam Runtime Completion

UX + Interaction Polish

EXECUTION RULES (CRITICAL)
You MUST complete Phase 1 fully before moving to Phase 2

You MUST STOP after Phase 1 and ask for permission

You MUST NOT proceed without explicit approval

After Phase 2, you MUST run a full audit

PHASE 1 — YKI EXAM RUNTIME COMPLETION
OBJECTIVE
Transform the YKI Exam from:

→ entry screen shell

into:

→ fully governed, exam-grade runtime flow

REQUIREMENTS
1. ENGINE-DRIVEN UI ONLY
UI must reflect backend state only

no local UI decision logic

no screen cursor independent of engine

All state comes from:

GET /api/v1/yki/sessions/{session_id}
2. STRICT EXAM FLOW STRUCTURE
Implement:

Reading
passage screen (no questions)

“Next” → next passage or questions

questions only appear after passage phase

Listening
audio prompt screen

“Next” → questions

no simultaneous prompt + questions

3. NAVIGATION RULES
forward-only navigation

no back button

skipping allowed (forward only)

state locked once progressed

4. TIMING ENFORCEMENT
integrate engine timing manifest

countdown must be:

engine-controlled

non-resettable

visible but not modifiable

5. ANSWER HANDLING
answers sent immediately or in controlled batch

no client-side scoring

no mutation after submission

6. SUBMISSION + COMPLETION
On completion:

trigger certification

transition to read-only mode

block all interactions

7. ERROR HANDLING
transport errors → controlled retry state

contract errors → fail-fast

no silent fallback

8. UI CONSTRAINTS
use tokens only

no inline styles

no layout deviations

scroll allowed ONLY inside exam content

PHASE 1 VALIDATION
Run:

tsc --noEmit
controlled_ui_contract_validation
ui_cutover_enforcement
ui_token_enforcement
backend unit tests
PHASE 1 OUTPUT
1. Files created
2. Files modified
3. Runtime behaviors implemented
4. Validation results
5. Errors encountered
6. Success / failure
STOP POINT (MANDATORY)
After completing Phase 1:

Output:

PHASE 1 COMPLETE — YKI EXAM RUNTIME IS NOW FULLY GOVERNED

Do you want to proceed to Phase 2: UX + Interaction Polish?
Wait for user input.

PHASE 2 — UX + INTERACTION POLISH
(Execute ONLY after approval)

OBJECTIVE
Improve how the system feels without breaking determinism.

RULE
You MUST NOT:

change logic

change contracts

change data flow

Only:

→ improve perception, clarity, and feedback

EXECUTION TASKS
1. TRANSITION SYSTEM
Standardize transitions:

screen enter/exit

modal appearance

state change animations

Use tokenized durations only.

2. BUTTON FEEDBACK
All buttons must:

have press feedback

visual + optional sound response

no dead clicks

3. MIC INTERACTION
For speaking:

clear start signal

recording indicator

stop confirmation

error fallback

4. LOADING STATES
Replace all silent waits with:

visible loading indicators

consistent style

non-blocking UI where possible

5. ERROR STATES
Standardize:

error message structure

retry actions

visual consistency

6. AUDIO FEEDBACK
Integrate:

success sounds

error sounds

mic start/stop sounds

Must use central audio system.

7. EXAM EXPERIENCE REFINEMENT
Ensure:

instructions are clear

transitions between sections feel natural

timing pressure is visible but not stressful

no abrupt jumps

8. VISUAL CONSISTENCY CHECK
Ensure:

spacing rhythm consistent

typography hierarchy clear

colors consistently used for meaning

PHASE 2 VALIDATION
Run:

tsc --noEmit
controlled_ui_contract_validation
ui_cutover_enforcement
ui_token_enforcement
PHASE 2 OUTPUT
1. Files modified
2. Interaction improvements implemented
3. Validation results
4. Errors encountered
5. Success / failure
FINAL AUDIT (AFTER PHASE 2)
AUDIT
A. YKI Runtime Integrity
engine-driven UI

strict flow enforcement

no client-side control

B. UX Consistency
transitions standardized

feedback consistent

no silent states

C. UI Determinism
tokens respected

no inline styles

no layout drift

D. Interaction Quality
responsiveness

clarity of actions

audio/visual feedback alignment

SYSTEM STATE
UI Governance: ✅ / ❌

Single UI System: ✅ / ❌

UI Determinism: ✅ / ❌

UX Quality: ✅ / ❌

YKI Runtime Completeness: ✅ / ❌

Contract Enforcement: ✅ / ❌

Audit Logging: ✅ / ❌

Replayability: ✅ / ❌

Certification Integrity: ✅ / ❌

Persistence Durability: ✅ / ❌

External Verifiability: ✅ / ❌

SUCCESS CRITERIA
The full execution is complete when:

YKI exam behaves like a real controlled exam

UI remains deterministic

interactions feel responsive and clear

no structural rules are broken

This setup ensures:

no uncontrolled continuation

no skipped phase

clean separation between system logic and experience

When this is done, you’ll have:

not just a correct system
but a system people can actually sit with and trust for an exam-like experience
