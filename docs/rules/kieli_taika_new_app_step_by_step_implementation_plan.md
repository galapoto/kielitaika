# KieliTaika — Step-by-Step Implementation Plan for the New Clean Repo

---

# 0. Purpose

This document defines the actual implementation sequence for rebuilding the KieliTaika app inside:

```text
/home/vitus/kielitaika/
```

It assumes:
- the old app is frozen and used only as a reference
- the new repo must stay clean and non-contaminated
- the existing YKI engine remains authoritative at:

```text
/home/vitus/kielitaikka-yki-engine/
```

- the new app connects to the engine the same way the old app did, but with cleaner contracts and cleaner frontend structure
- the agent must read the microphone, roleplay, card, UI, assets, and rules documents before implementation begins

---

# 1. Mandatory Read Order Before Any Code Is Written

The agent must read these in this order:

## 1.1 UI / product shell
- `/home/vitus/kielitaika/docs/ui_design/`
- especially the full new repo UI/UX design and all validation/comparison docs

## 1.2 Production rules
- `/home/vitus/kielitaika/docs/rules/`

## 1.3 Microphone system
- `/home/vitus/kielitaika/docs/microphone_design/`

## 1.4 Roleplay system
- `/home/vitus/kielitaika/docs/role_play_files/`

## 1.5 Card system docs
- `/home/vitus/kielitaika/docs/card_system_docs/`
- `/home/vitus/kielitaika/frontend/card_design/`

## 1.6 Assets
- `/home/vitus/kielitaika/frontend/app/assets/`

## 1.7 Old app reference
- frozen old repo and its reverse engineering documents

## 1.8 Engine authority
- `/home/vitus/kielitaikka-yki-engine/`

No implementation starts until all of the above has been read and indexed.

---

# 2. What the Agent Work Already Did Correctly

The agent correctly identified several real blockers:
- the old repo is broader than the current simplified screen list
- background mapping in the new design is not yet lossless relative to the old app
- backend contract coverage is still incomplete if implementation follows only the reduced endpoint list
- many old flows were omitted from the first simplified implementation framing

These findings are materially useful and should not be ignored.

---

# 3. What Is Still Missing From the Agent Work

The agent report is strong, but it still leaves some practical gaps that must be closed before implementation.

## 3.1 It does not convert findings into a clean preserve / replace / remove matrix
For every old feature, the implementation needs one of three labels:
- preserve
- replace
- remove

Without this, developers will still improvise.

## 3.2 It does not define the engine connection layer explicitly
The new app must connect to the YKI engine as the old app did, but through a clean adapter boundary. That bridge needs to be named and implemented early.

## 3.3 It does not define the frontend contract freeze point
Before UI work begins, the team must freeze:
- auth contract
- payments contract
- roleplay contract
- cards contract
- YKI runtime contract
- voice / STT / TTS contract

## 3.4 It does not separate “Phase 0 blockers” from “can proceed in parallel” items strongly enough
Some items can move in parallel after contract freeze, but the current report keeps too many things in a broad pre-validation state.

## 3.5 It does not explicitly protect the new repo from legacy contamination
The new repo needs clear rules such as:
- do not copy old folders wholesale
- do not port unused legacy screens just because they exist
- only migrate preserved logic through clean interfaces

## 3.6 It does not define the first vertical slice
A clean rebuild should begin with one full working slice, not a broad partial skeleton of everything.

---

# 4. Implementation Philosophy

The best implementation strategy is not “build everything screen by screen in random order.”

The best strategy is:

1. freeze authority
2. freeze contracts
3. build shared foundations
4. build one complete vertical slice
5. validate
6. expand module by module

This reduces contamination risk and makes regressions visible early.

---

# 5. Final Preserve / Replace / Remove Decision Model

Before coding, every old-app area must be classified.

## 5.1 Preserve
Preserve the capability, but re-implement cleanly.

This includes:
- YKI engine connection
- auth and session handling
- payments and subscription gating
- TTS / STT / OpenAI service usage
- card runtime logic
- roleplay capability
- settings capability
- background asset usage

## 5.2 Replace
Replace the old UI or flow, but keep the business capability.

This includes:
- old navigation shell
- old screen composition
- old mixed microphone handling
- old roleplay single-screen UI
- old inconsistent component styling

## 5.3 Remove only if explicitly approved
No old flow should disappear silently.

Candidate flows needing explicit keep/remove decision:
- onboarding sequence
- free conversation mode
- fluency screen
- guided turn screen
- shadowing screen
- micro output screen
- notes screen
- old quiz / lesson detail structure
- notification settings
- privacy settings
- YKI review / export / history flows

---

# 6. Recommended Implementation Sequence

The cleanest implementation is 12 steps.

---

# STEP 1 — Freeze the Authority Layer

## Goal
Create one internal implementation index so nobody guesses which document wins.

## Do
Create a small docs index inside the new repo that states:
- which UI doc is authoritative for layout
- which microphone doc is authoritative for mic behavior
- which roleplay doc is authoritative for roleplay behavior
- which card docs are authoritative for card runtime and card UI
- which old-repo behaviors are preserved
- which are replaced
- which are removed

## Output
- `docs/implementation_authority_index.md`
- `docs/old_to_new_feature_matrix.md`

## Validation
No coding starts until this exists.

---

# STEP 2 — Freeze the Contract Layer

## Goal
Lock all backend/frontend contracts before UI implementation.

## Do
Define and confirm:
- auth API contract
- subscription / payments contract
- voice contract
- roleplay contract
- card runtime contract
- YKI runtime contract
- engine bridge contract

## Output
- `docs/contracts/auth_contract.md`
- `docs/contracts/payments_contract.md`
- `docs/contracts/voice_contract.md`
- `docs/contracts/roleplay_contract.md`
- `docs/contracts/cards_contract.md`
- `docs/contracts/yki_runtime_contract.md`
- `docs/contracts/yki_engine_bridge_contract.md`

## Validation
No screen may call backend logic until its contract is frozen.

---

# STEP 3 — Build the Clean Repo Skeleton

## Goal
Create the final folder structure without importing contaminated legacy trees.

## Do
Create only the approved directories for:
- frontend app
- backend adapters
- shared theme
- mic module
- roleplay module
- exam module
- cards module
- services
- state

## Rule
Do not copy old `frontend/app` or `backend/app` trees wholesale.

## Validation
Structure exists, but contains only intentional files.

---

# STEP 4 — Build the Shared Design Foundation

## Goal
Create the global UI system once.

## Do
Implement:
- color tokens
- spacing tokens
- typography tokens
- radius tokens
- shadows
- surface styles
- answer-state tokens
- animation durations
- sound mapping constants

## Also Do
Implement:
- base page scaffold
- desktop shell
- mobile shell
- sidebar
- bottom nav
- app header

## Validation
No feature screen is built until it uses shared tokens only.

---

# STEP 5 — Build the Background and Asset Registry

## Goal
Preserve old background usage exactly where required, but via a clean registry.

## Do
Inventory all assets in:
- `/home/vitus/kielitaika/frontend/app/assets/`

Create:
- logo registry
- sound registry
- background registry
- UI image registry

Then map each retained screen to:
- background asset
- overlay rule
- blur rule
- solid content zone rule

## Output
- `frontend/app/theme/backgroundRegistry.ts`
- `frontend/app/theme/soundRegistry.ts`
- `frontend/app/theme/assetRegistry.ts`
- `docs/ui_design/background_screen_matrix.md`

## Validation
No screen is valid without an approved background assignment.

---

# STEP 6 — Build the Engine Bridge First

## Goal
Reconnect the new app to the existing YKI engine cleanly.

## Do
Study how the old app connected to:
- `/home/vitus/kielitaikka-yki-engine/`

Then implement a new adapter layer in the new repo that:
- hides engine internals from UI
- exposes only clean app-facing contracts
- preserves old capabilities without old contamination

## This Layer Must Cover
- start exam session
- fetch runtime exam structure
- fetch or proxy listening audio
- submit answers
- submit writing
- submit speaking audio
- retrieve results / review / certificate / history if preserved

## Validation
The engine bridge must be testable independently of the UI.

---

# STEP 7 — Build Auth + Session + Subscription Core

## Goal
Make the app enterable before feature modules are added.

## Do
Implement:
- splash / opening page
- sign in page
- Google sign-in
- session persistence
- auth restore on app launch
- subscription status fetch
- feature gating

## Preserve
If email/password remains required, implement it here too.

## Validation
A user must be able to sign in, restore session, and see gated/un-gated app areas correctly.

---

# STEP 8 — Build the Card Vertical Slice First

## Goal
Create the first full working feature slice.

## Why Cards First
Because cards are smaller than YKI, but still exercise:
- UI tokens
- screen shell
- API connection
- feedback states
- sound system
- background system
- state handling

## Do
Implement fully:
- Practice Hub
- Vocabulary module
- Grammar module
- Sentence module
- card front/back
- answer variants
- feedback panel
- next / completion flow

## Validation
One user can complete a full card session with correct sounds, visuals, and feedback.

---

# STEP 9 — Build the Microphone System as a Shared Core

## Goal
Implement microphone once, then reuse it.

## Do
Implement according to the microphone docs:
- idle
- recording
- processing
- response lock

Create a shared mic controller and UI component.

## Important
Do not build roleplay mic and exam mic separately.
Build one core microphone system with mode-aware wrappers.

## Validation
Mic starts on tap, stops on tap, plays correct sounds, locks correctly, and never auto-stops unless an explicitly preserved old flow requires a mode-specific exception.

---

# STEP 10 — Build Roleplay on Top of the Shared Mic Core

## Goal
Implement the roleplay system cleanly and independently.

## Do
Implement:
- setup screen
- session screen
- review screen
- transcript rendering
- 5-turn progress model
- roleplay API adapter
- AI wait state
- mic lock during AI response

## Validation
A full 5-turn session must complete end-to-end with transcript, review, and correct state locking.

---

# STEP 11 — Build the YKI Runtime Module

## Goal
Rebuild YKI as a dedicated controlled runtime, not scattered screens.

## Do
Implement in order:
1. YKI entry screen
2. YKI info / instructions / rules if retained
3. Reading passage screen
4. Reading questions screen
5. Listening prompt screen
6. Listening questions screen
7. Writing screen
8. Speaking screen
9. Review / submit / processing / results stack if preserved
10. detailed feedback / CEFR / certificate / history / export if preserved

## Critical Rule
Do not simplify YKI because it looks large.
Use the preserved old behavior matrix.

## Validation
The new YKI runtime must respect both:
- the new UI rules
- the old engine-linked functional behavior

---

# STEP 12 — Build Settings, Accessibility, and Final Release Gates

## Goal
Close the app properly and prevent hidden regressions.

## Do
Implement:
- settings screen
- audio settings
- speech speed
- theme settings
- language settings
- accessibility toggles
- notification/privacy/subscription screens if preserved

Then create final validation matrices for:
- screen parity
- background fidelity
- contract usage
- microphone fidelity
- roleplay fidelity
- YKI fidelity

## Validation
Nothing is release-ready until all retained screens pass parity checks.

---

# 7. What Should Be Implemented Per Step

## Step 1–3
Documentation, contracts, structure, zero UI feature work.

## Step 4–5
Global foundation and assets only.

## Step 6
Engine and backend connection layer only.

## Step 7
Entry, auth, session, subscription.

## Step 8
Cards as first complete vertical slice.

## Step 9
Shared microphone system.

## Step 10
Roleplay module.

## Step 11
YKI runtime.

## Step 12
Settings, accessibility, final gates.

---

# 8. Parallel Work That Is Safe

After Step 2 is complete, some work can run in parallel.

## Safe Parallel Track A
- design tokens
- shells
- nav
- background registry

## Safe Parallel Track B
- contracts
- engine bridge
- auth adapter
- payments adapter

## Safe Parallel Track C
- card UI primitives
- mic UI primitive
- transcript bubbles

## Unsafe Parallel Work
Do NOT build these in parallel before contract freeze:
- roleplay business flow
- YKI runtime integration
- voice upload flow
- subscription-gated behavior

---

# 9. Hard Anti-Contamination Rules

The new repo must NOT:
- copy old frontend directory wholesale
- copy old backend directory wholesale
- merge old duplicate systems into one folder blindly
- import old unused experiments as “just in case”
- preserve broken routing because it once existed

The new repo MAY:
- reuse stable assets
- reuse stable service logic through clean adapters
- reuse validated schemas and contracts
- reuse proven engine integration patterns

---

# 10. Immediate Next Actions

Before implementation starts, the team should do exactly these next actions:

1. create preserve / replace / remove matrix
2. create implementation authority index
3. freeze contracts
4. inventory assets and backgrounds
5. define YKI engine bridge contract
6. create clean repo skeleton
7. begin shared design foundation

---

# 11. Final Implementation Rule

The correct goal is NOT:
- “move the old app into a new repo”

The correct goal IS:
- “rebuild the app cleanly in a new repo, while preserving required product capabilities, required assets, and required engine integrations, without carrying over legacy contamination”

Any implementation sequence that ignores this rule is invalid.

