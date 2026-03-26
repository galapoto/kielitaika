You are performing a forensic UI reverse engineering analysis.

Context:

* Old app path: /home/vitus/Documents/puhis/
* New app path: /home/vitus/kielitaika/
* DO NOT copy any code, assets, or styles from the old app.
* This is a structural and behavioral extraction only.

Goal:
Produce a document titled:
UI_FORENSIC_ANALYSIS.md

This document must describe HOW the original UI works, not reproduce it.

---

## RULES (STRICT)

1. No copying of:

   * CSS
   * Components
   * Layout code
   * Assets

2. Only extract:

   * Patterns
   * Layout logic
   * Spacing systems
   * Interaction behavior

3. Treat the old app as a black box system.

---

## ANALYSIS STRUCTURE

### 1. SCREEN TAXONOMY

List ALL screen types and group them:

* Auth
* Dashboard
* Learning
* Exam
* Results
* Review
* Cards

For each:

* Purpose
* Layout pattern
* Dominant components

---

### 2. LAYOUT GRAMMAR

Define:

* Are screens card-based or section-based?
* Margin system (outer padding)
* Internal spacing rhythm
* Vertical vs horizontal balance

You must describe layout using rules like:

* “All primary content is contained within centered cards”
* “No raw text exists outside card containers”

---

### 3. CARD SYSTEM

Reverse engineer:

* Border radius scale
* Shadow behavior
* Elevation hierarchy (low / medium / high)
* Padding rules

Define card types:

* Primary card
* Secondary card
* Interactive card
* Modal card

---

### 4. NAVIGATION STRUCTURE

Analyze:

* Top bar behavior
* Bottom navigation
* CTA placement
* Progress indicators

Answer:

* Where does interaction always happen?
* What is fixed vs scrollable?

---

### 5. INTERACTION PATTERNS

For:

* Quiz
* Cards
* Dashboard

Define:

* Focus area
* Secondary actions
* Disabled states
* Feedback (selection, progress, completion)

---

### 6. VISUAL HIERARCHY

Define:

* What draws attention first?
* How many visual layers exist?
* How depth is created

---

### 7. CONSISTENCY RULES

Extract invariant rules like:

* “Every interactive element lives inside a card”
* “Primary CTA always bottom-right or bottom-centered”
* “No screen mixes layout paradigms”

---

## OUTPUT REQUIREMENT

The document must read like:
A system blueprint, not a description.

No vague language.
No design opinions.
Only observable rules.

---

## FINAL CHECK

If someone reads your document, they must be able to rebuild the UI system WITHOUT ever seeing the original app again.
