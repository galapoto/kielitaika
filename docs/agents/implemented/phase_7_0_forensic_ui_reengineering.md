# FORENSIC UI REENGINEERING AGENT PROMPT

## Mission: Reverse-engineer the original Puhis UI and produce a full implementation-spec document for the new KieliTaika app

You are not redesigning freely.

You are performing a forensic UI/UX reverse-engineering audit of the original app so that the new app can visually and behaviorally come as close as possible to the original app, while still keeping:

1. the **login screen** of the current new app,
2. the **welcome page** of the current new app,
3. the **current new-app color system / palette direction**.

Everything else should move toward the original app as closely as possible without directly copying source code, assets, or component implementations.

Your job is to study the original app deeply and produce a **clinical implementation document** that tells the new repo exactly how to recreate the old app’s UI/UX language inside the new architecture.

---

# 1. Primary Objective

Perform a deep forensic analysis of the UI and UX of the original app located at:

`/home/vitus/Documents/puhis/`

Then produce a **complete reverse-engineering document** that explains, in implementation-grade detail, how the new app should reproduce that original app’s look, layout behavior, interaction model, hierarchy, rhythm, spacing logic, component structure, and screen flow, while preserving the current new app’s:

* login screen,
* welcome page,
* color identity.

This is **not** a migration task.
This is **not** a code-copy task.
This is **not** a “take inspiration from it” task.

This is a **forensic UI reconstruction specification task**.

---

# 2. Core Rule Set

You must obey all of these rules strictly:

## A. No direct copying

Do **not** copy:

* old components,
* old JSX/TSX,
* CSS,
* assets,
* icons,
* animations,
* layout code,
* inline styles,
* class names,
* design tokens verbatim.

You may only:

* inspect,
* analyze,
* infer,
* document,
* abstract,
* specify,
* reconstruct.

The output must be a **re-engineered implementation guide**, not transferred source material.

## B. Preserve these parts from the current new app

These must remain as-is conceptually unless explicitly noted otherwise:

* current **login screen**
* current **welcome page**
* current **color direction / palette family**

You must therefore study the original app to extract its:

* layout system,
* component language,
* depth,
* motion,
* information hierarchy,
* navigation feel,
* spacing rhythm,
* content framing,
* interaction patterns,

and then describe how those should be rebuilt **using the new app’s color palette**.

## C. Do not modernize away the original identity

Your task is not to make it “better looking” in a generic way.
Your task is to recover the original app’s visual identity as faithfully as possible.

Only suggest deviations where:

* the old app had clear UI inconsistency,
* the old app had obvious usability issues,
* the old app had structural problems that would break the new architecture,
* accessibility or responsiveness would clearly fail without adjustment.

Any suggested improvement must be clearly marked as:

* **faithful reconstruction**
  or
* **necessary controlled deviation**

## D. Think like a forensic reconstruction specialist

Treat the old UI as evidence.
Your task is to reconstruct:

* what the design language actually was,
* what the interaction philosophy actually was,
* what the hierarchy actually intended,
* what visual patterns repeated across the app,
* what made it feel like that specific app.

---

# 3. Required Investigation Scope

You must inspect the original app exhaustively.

Do not stop at obvious screens.
Audit everything discoverable, including but not limited to:

## 3.1 Global shell and navigation

* app shell structure
* sidebar / bottom nav / header / subheader patterns
* page framing
* container widths
* safe area treatment
* responsive breakpoints
* desktop vs mobile layout strategy
* where the app uses fixed vs scrollable regions
* how content is visually anchored
* how deep pages differ from landing pages

## 3.2 Visual design language

* typography system
* font sizing rhythm
* font weights
* title vs body vs helper text hierarchy
* capitalization style
* button text style
* card corner radius style
* border philosophy
* stroke thickness tendencies
* shadows
* depth model
* glass / blur / matte / flat tendencies
* image treatment
* icon style family
* empty-state styling
* divider logic
* status color usage
* error / success / active / selected / disabled visual treatment

## 3.3 Layout grammar

* spacing rhythm
* grid logic
* card padding
* section spacing
* internal alignment rules
* repeated size relationships
* max width logic
* how actions are positioned
* how text aligns with icons
* how media aligns with text blocks
* how cards stack
* how long content is broken into sections
* whether the app prefers centered content or edge-anchored content
* whether vertical rhythm is loose or dense

## 3.4 Interaction behavior

* hover behavior
* press behavior
* focus behavior
* selected state behavior
* transitions
* screen entry behavior
* card expansion / collapse
* pagination behavior
* modal behavior
* drawer behavior
* tab switching behavior
* scroll behavior
* progression behavior
* onboarding sequence behavior
* audio / speaking / practice interaction states
* feedback timing patterns

## 3.5 Feature-area-specific UI patterns

Audit all major feature domains separately. At minimum include:

* home/dashboard
* cards/practice
* roleplay/conversation
* speaking
* listening
* reading
* writing
* YKI mock exam flow
* daily practice
* professional Finnish
* profile/account areas
* settings/preferences
* subscription/payment related surfaces if present
* result/review/feedback pages
* progress or streak surfaces if present
* any hidden route or unfinished route that still reveals design intent

## 3.6 State variants

Capture how the UI behaves in:

* loading states
* empty states
* success states
* failure states
* partially completed states
* locked/premium states
* first-use states
* returning-user states
* active session states
* completed session states

## 3.7 Responsive behavior

You must determine:

* what the original app intended on mobile
* what the original app intended on web
* whether layouts were shared or diverged
* where element stacking changed
* how cards resized
* how navigation changed
* what should be preserved in the new implementation

---

# 4. Required Comparison Framework

You are auditing **two things**:

1. the original app UI in `/home/vitus/Documents/puhis/`
2. the current new app UI state

Your task is to compare them and answer:

* What exactly made the old app visually coherent?
* What exactly is making the current new app feel scattered?
* Which old app patterns must be restored?
* Which current new app choices should remain?
* How should the old app structure be translated into the new app without copying code?

You must be precise.

Do not write vague statements like:

* “the old app feels cleaner”
* “the new app feels more modern”
* “some alignment improvements are needed”

Instead write things like:

* “The old app consistently framed primary interactive content inside medium-width cards with fixed internal padding, while the new app allows full-width content sprawl, causing visual fragmentation.”
* “The original app used a stable shell with predictable anchor points for navigation and content start positions; the new app shifts entry points screen-to-screen.”
* “The previous UI repeated a specific radius-shadow-border combination that made cards read as one system, while the current app mixes unrelated container treatments.”

---

# 5. Deliverable You Must Produce

You must create a document named exactly:

`FORENSIC_UI_REENGINEERING_SPEC.md`

Save it in an appropriate documentation location inside the new repo.

The document must be detailed enough that a separate implementation agent can rebuild the UI from the document alone.

---

# 6. Mandatory Output Structure of the Document

Your document must contain these sections in this exact order:

## Section 1 — Executive Finding

A direct summary of:

* what the original app’s UI identity was,
* what the new app is currently missing,
* what must be restored,
* what must remain from the new app.

## Section 2 — Audit Method

Explain exactly how you inspected the original app, including:

* routes examined
* components examined
* styling sources examined
* screen captures or render validations performed
* responsive checks performed
* runtime checks performed if any

## Section 3 — Original App UI Identity Profile

A deep profile of the old app’s visual DNA:

* shell
* hierarchy
* navigation model
* spacing model
* typography
* card model
* surfaces
* motion
* interaction style
* information density
* emotional tone
* educational/product tone

## Section 4 — Current New App Scatter Diagnosis

A clinical explanation of why the new app feels scattered.
Identify specific causes, such as:

* shell inconsistency
* token non-application
* inconsistent component primitives
* mixed spacing systems
* page-specific one-off styling
* navigation anchor drift
* broken content framing
* incomplete state design
* uncontrolled width usage
* animation inconsistency
* contrast imbalance
* placeholder leakage

## Section 5 — Screen-by-Screen Reverse-Engineering Map

For every important screen or screen family:

* identify original purpose
* identify original layout structure
* identify original visual treatment
* identify interaction expectations
* identify what must be kept
* identify what must change
* identify how to rebuild in the new system

This section must be exhaustive.

## Section 6 — Component Reconstruction Matrix

For every major reusable component family, include:

* name
* role
* where used
* old app behavior
* old app visual characteristics
* new-app reconstruction rules
* required states
* responsive behavior
* accessibility considerations
* what must not be altered

Examples:

* primary button
* secondary button
* icon button
* top nav
* bottom nav
* section header
* card shell
* modal
* prompt container
* practice card
* exam question frame
* audio control surface
* mic button surface
* result panel
* premium lock surface
* progress strip
* tabs
* chips
* toggles
* list item rows

## Section 7 — Visual Token Translation Layer

Since the color system must remain from the new app, explain how to translate the original app’s UI language into the current palette.

This section must define:

* primary surfaces
* secondary surfaces
* background layers
* contrast strategy
* border strategy
* action emphasis
* info/warning/error/success mapping
* selected and hover states
* disabled states
* dark/light implications if relevant

Important:
Do not simply list colors.
Explain how the **old structure** should be preserved using the **new colors**.

## Section 8 — Layout and Spacing Reconstruction Rules

Define:

* spacing scale
* page gutters
* section spacing
* card padding
* inter-component spacing
* max widths
* mobile stacking rules
* desktop panel rules
* height behavior
* sticky/fixed region usage
* scroll containment rules

This must be concrete, not vague.

## Section 9 — Motion and Transition Reconstruction Rules

Define:

* which movements existed in the old app
* which were subtle vs strong
* where transitions should happen
* timing ranges
* easing style
* when motion should be suppressed
* what to avoid so the new app does not feel flashy or unrelated

## Section 10 — Controlled Deviations Register

List only the deviations that are truly necessary.

For each deviation include:

* what differs from the original
* why it must differ
* whether the reason is technical, accessibility, responsiveness, or architecture
* how to minimize the visual difference

## Section 11 — Implementation Blueprint for the New Repo

Translate the findings into implementation instructions for the new app.

Include:

* which layout primitives should exist
* which component primitives should exist
* which pages should be normalized first
* which styling source should become authoritative
* how to prevent scatter from returning
* where guardrails should be added
* what should be centralized vs local
* what should be removed

## Section 12 — Priority Order

Provide exact execution order:

1. shell normalization
2. shared primitives
3. screen family reconstruction
4. state cleanup
5. responsive pass
6. motion pass
7. regression pass

Or another order if your audit justifies it.

## Section 13 — Acceptance Criteria

Define how we know the re-engineering succeeded.

This must include:

* visual similarity criteria
* layout consistency criteria
* interaction consistency criteria
* responsiveness criteria
* absence of scatter criteria
* preservation of login/welcome/current color identity criteria

## Section 14 — Non-Negotiables

A short hard list of things implementation agents must not violate.

---

# 7. Required Working Process

You must work in this order:

## Step 1: Discover

Map the original app structure fully.

## Step 2: Render and inspect

Where possible, run and inspect the old app visually instead of relying only on source reading.

## Step 3: Extract patterns

Identify repeated UI laws, not one-off accidents.

## Step 4: Compare with the new app

Explain exactly where scatter is coming from.

## Step 5: Reconstruct

Write a new implementation specification based on the old app’s design language and the new app’s palette/login/welcome constraints.

## Step 6: Produce the final document

The result must be implementation-grade.

---

# 8. Evidence Standard

Your findings must be evidence-based.

Every major claim in the document must come from one or more of:

* source inspection,
* rendered UI inspection,
* route inspection,
* style inspection,
* repeated pattern detection,
* component usage repetition,
* runtime behavior observation.

Do not invent design intent without evidence.
If something is uncertain, mark it as:

* confirmed,
* highly likely,
* probable,
* uncertain.

---

# 9. What You Must Specifically Look For

Pay special attention to the following because these are likely sources of scatter or fidelity loss:

* shell inconsistency
* header inconsistency
* card inconsistency
* screen framing inconsistency
* spacing drift
* mixed border radius families
* mixed shadow families
* inconsistent button hierarchy
* uncontrolled full-width sections
* typography drift
* placeholder leakage
* weak empty states
* inconsistent tab and chip behavior
* inconsistent screen-start positions
* lack of stable visual anchors
* inconsistent audio/mic control styling
* exam screen framing differences
* roleplay surface mismatch
* mismatch between practice surfaces and exam surfaces
* premium/paywall interruptions that break visual language
* state styling that does not belong to the original visual family

---

# 10. Specific Preservation Instruction

The new app should end up feeling like:

* the **original app’s structure, rhythm, and visual grammar**
* expressed through the **new app’s color palette**
* while preserving the **current new login and welcome screens**

That means your analysis must distinguish between:

* **identity-bearing design traits from the original app**
* **replaceable color values**
* **current-app features that must remain untouched**
* **current-app traits that are causing scatter and must be removed**

---

# 11. Required Final Appendix

At the end of the document, include 4 appendices:

## Appendix A — Screen Inventory

Full list of all screens or screen families discovered.

## Appendix B — Component Inventory

Full list of reusable components and patterns discovered.

## Appendix C — Visual Similarity Checklist

A checklist an implementation agent can use while rebuilding.

## Appendix D — Scatter Prevention Rules

Concrete rules that will stop the new app from drifting away again after reconstruction.

---

# 12. Strict Output Quality Requirements

Your document must be:

* exhaustive
* structured
* implementation-grade
* clinically precise
* non-generic
* free of filler
* free of motivational text
* free of design clichés
* free of vague statements

Assume the next agent will implement directly from your document.
If your document is shallow, the implementation will fail.

---

# 13. Final Instruction

Do not produce code.
Do not produce mockups.
Do not produce a redesign.
Do not produce a light summary.

Produce a **forensic reverse-engineering implementation specification** that allows the new app to mimic the original app’s UI/UX almost 100%, except for:

* the preserved current login screen,
* the preserved current welcome page,
* the preserved current color system.

Your output file is the authoritative reconstruction spec.

Begin.
