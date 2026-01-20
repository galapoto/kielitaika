⭐ NEW REQUIREMENT:
PUHIS must not only serve YKI users. It must also include:

✔ General Finnish Learning Path
✔ Töihin (Workplace Finnish) Path — with field-specific modules:
Lääkäri (Doctor)

Sairaanhoitaja (Nurse)

Sähköinsinööri (Electrical Engineer)

ICT / Software

Rakennusala (Construction)

Siivous (Cleaning)

Logistiikka (Logistics / Transport)

Hoiva-avustaja (Care Assistant)
…and others later.

✔ YKI Path
And Töihin + YKI should share the same pricing tier.

This changes PUHIS from a “YKI tutor” into a three-lane Finnish language engine:

⭐ PUHIS v2 = 3 Learning Universes Inside One App
1. YLEINEN SUOMI (General Finnish)
For:

everyday visitors

A1 → B1 learners

immigrants pre-integration

Features:

conversation practice

progressive disclosure

grammar engine

pronunciation

everyday vocabulary themes

daily goals

2. TÖIHIN (Workplace Finnish)
This is a huge differentiator that NO existing Finnish app has done well.

Each career path becomes a “micro-universe” with:

✔ Specialized vocabulary
✔ Real workplace scenarios (handovers, instructions, reports, meetings)
✔ Job-specific grammar patterns
✔ Finnish cultural norms at work
✔ Audio roleplays
✔ Task simulations (giving advice, reporting incidents, calling colleagues, patient interactions, safety briefings)

Examples:
Lääkäri (Doctor)
patient interviews

symptoms & diagnosis vocabulary

giving advice

hospital communication

emergency protocols Finnish

Sairaanhoitaja (Nurse)
Huge demand.
Foreign nurses MUST learn:

hoitotyön sanasto

kirjaaminen (documentation vocabulary)

potilaan hoidon vaiheet

typical dialogues

Apotti/Lifecare vocabulary

shift reporting

Hospitals will pay for this.

Sähköinsinööri
technical terminology

safety instructions

component descriptions

installation tasks

customer communication

ICT / Software Developer
standup conversations

task reporting

emailing

agile Finnish

bug explanations

system documentation Finnish

Logistiikka / Varasto
movement verbs

directions

receiving goods

inventory tasks

Hoiva-avustaja
everyday patient interactions

assistance dialogue

hygiene tasks

documenting observations

Why this will be huge:
There is no authentic AI Finnish-for-work platform.

3. YKI (Exam Finnish)
You already built the strongest YKI plan:

speaking

writing

pronunciation

band scoring

feedback loop

readiness dashboard

⭐ HOW THE APP FLOWS WITH 3 PATHS
At onboarding the user selects:
“Choose your path”
General Finnish (Yleinen suomi)

Workplace Finnish (Töihin)

YKI Test Preparation

Later, they can switch paths anytime.

⭐ PRICING ALIGNMENT (As you requested)
Free tier
limited General Finnish

3 free Töihin lessons (any field)

1 free YKI speaking attempt

grammar/light correction only

General Premium (€12.99/mo)
all general Finnish content unlimited

Professional Premium (Töihin + YKI) (€29.99/mo)
Unlocks everything in:

Töihin

YKI speaking + writing

pronunciation v2

certificates

professional scripts & dialogues

roleplay simulations

employer module reports (if needed)

This makes pricing:

fair

simple

scalable

attractive for institutes

⭐ HOW TO INTEGRATE THIS WITH EVERYTHING YOU BUILT
Below is the improvement patch that updates your Phase 1–7 architecture.

I present it in a way that you can directly add it without rewriting your entire system.

────────────────────────────────────────

⭐ PUHIS v2 — IMPROVEMENT PATCH FOR “TÖIHIN” & MULTI-PATH SYSTEM
────────────────────────────────────────

1. Add a new module: WorkplaceEngine v1
✔ Cursor task (architecture)
Create:

backend/app/services/workplace_engine.py
Functions:

get_available_fields()  
get_field_lesson(field, level)  
generate_field_dialogue(field, scenario, level)  
evaluate_response(field, user_text)  
✔ Codex task (implementation)
Implement rule-based domain templates + OpenAI-powered expansion.

Content example for "Sairaanhoitaja":

Scenario: Hoidon aloittaminen
AI role: Kollegasi Anna
Task: Kerro minulle potilaan tämänhetkinen tila ja mitä tapahtui viime yönä.
All Töihin fields should have:
vocabulary lists

roleplay scenarios

comprehension tasks

speaking practice

writing tasks (short notes / reports)

correction feedback

2. Add a Path Engine to manage the three universes
✔ Cursor task
Create:

backend/app/services/path_engine.py
Contains:

determine_path(user_settings)

forward_task_to_engine()

merge_feedback_across_paths()

This becomes the central router.

3. Update Conversation Engine v3 → v3.5
It must now:

detect user’s selected path

adapt teaching style accordingly

switch “persona sets” (nurse instructor, engineering supervisor, YKI examiner, general tutor)

Example:
If user selects nurse path:
Tutor persona becomes “Anna, your senior RN”.

If user selects sähköinsinööri:
Tutor persona becomes “Teemu, sähkömestari”.

If user selects YKI path:
Tutor persona becomes “Silent Examiner”.

4. Create a Professional Vocabulary Engine
Feedback recommends strong contextual vocabulary.

Create:

backend/app/services/vocab_engine.py
Provides:

field-specific vocab units

everyday + workplace hybrid vocab

spaced repetition list personalized by path

auto-detected missing vocabulary during conversation

5. Update UI to show path modules
Your UI expands into:

Home screen:
“Continue General Finnish”

“Continue Töihin (Sairaanhoitaja)”

“Continue Töihin (Sähköinsinööri)”

“Continue YKI Speaking Practice”

Töihin screen:
A grid of professions:

Lääkäri

Sairaanhoitaja

Sähköinsinööri

ICT

Hoiva-avustaja

Rakennus

Logistiikka

Siivous

6. Add Professional Roleplay Mode
This is one of the biggest strengths you can add.

Roleplay includes:
receiving instructions

giving professional updates

reporting incidents

interacting with patients/customers/colleagues

writing simple notes

Each roleplay round produces:

grammar feedback

vocabulary gap list

pronunciation feedback

professional appropriateness score

7. Update your pricing and monetization model
As you requested:

General → lower tier
Töihin + YKI → premium tier
This aligns perfectly with market demand and B2B strategy.

⭐ NOW YOU HAVE A TRULY COMPETITIVE & UNIQUE PRODUCT
PUHIS v2 stands out because it is the only Finnish-learning system with:

✔ 3 complete learning paths
✔ AI-driven workplace modules
✔ adaptive disclosure teaching
✔ real-time speaking + pronunciation scoring
✔ automotive-style error tracking and dashboards
✔ full YKI simulation
Nothing in Finland comes close.

--------------------

⭐ A — FULL 12-WEEK BUILD PLAN (UPDATED FOR 3 PATHS + FULL PRODUCT)
────────────────────────────────────────

This plan takes PUHIS from initial scaffolding → full production app.

WEEKS 1–2: Core Engine Foundations
Backend

FastAPI project skeleton

ConversationEngine v1 (STT → LLM → TTS pipeline)

ProgressiveDisclosureEngine v1

GrammarEngine v1.5 (basic detection + explanations)

MemoryService v1

User auth (JWT)

DB models: User, Message, Settings

Frontend (Expo + React Native)

Navigation structure

Conversation UI skeleton

Basic microphone + WebSocket connection

Typing bubble

Deliverable:
User can speak → get Finnish reply → basic correction.

WEEKS 3–4: 3 LEARNING PATHS ARCHITECTURE
General Finnish Path
Everyday dialogue topics

Grammar modules (partitive, verb types, cases)

ProgressiveDisclosureEngine v2 (A1→A2→B1)

Töihin Path
WorkplaceEngine v1

Professional vocab engine

Roleplay architecture

Profession modules:

Sairaanhoitaja

Lääkäri

ICT developer

Sähköinsinööri

Hoiva-avustaja

YKI Path
YKI task bank (public-domain style)

Band prediction logic v1

60–90s timed prompts

Grammar feedback tuned to YKI rubric

Deliverable:
Users choose a learning path at onboarding → engine adapts.

WEEKS 5–6: Skill Engines & Scoring Systems
PronunciationEngine v1
vowel/consonant length error detection

segment-based scoring

whisper-based phoneme comparison

YKI WritingEngine v1
structure analysis

grammar scoring

vocabulary diversity

CEFR mapping

Workplace Roleplay Mode v1
scenario simulation

AI acts as colleague, patient, supervisor

scoring: clarity, appropriateness, vocabulary

Deliverable:
PUHIS becomes a “real Finnish coach.”

WEEKS 7–8: Advanced AI Teaching
ConversationEngine v3
persona system (teacher, colleague, examiner)

adaptive correction

repetition loops

practice follow-ups

difficulty leveling

GrammarEngine v2.5
hybrid Omorfi + rule engine + LLM explanation

severity classification

mini-practice generation

ProgressBrain v1
Tracks:

grammar error patterns

vocabulary depth

speaking fluency

pronunciation trajectory

path mastery

Deliverable:
Adaptive learning and real teacher-like behavior.

WEEKS 9–10: UI Polish & Subscriptions
UI Polish
Workplace dashboards

Roleplay interface

Pronunciation visualizer

YKI exam interface

Subscriptions
Free

General

Professional (Töihin + YKI)

Analytics
session count

improvement charts

pronunciation score graphs

Deliverable:
Professional-level app experience (market ready).

WEEKS 11–12: Full-Product Phase
GDPR compliance
delete/export

secure logging

on-device audio toggle

Deployment
Fly.io backend

Vercel web version

EAS builds for Android/iOS

Polish
error handling

latency tuning

caching

load testing

Deliverable:
Full commercial PUHIS (general + workplace + YKI paths).

────────────────────────────────────────

⭐ B — PUHIS SPECIFICATION v2 (INDUSTRY-GRADE)
────────────────────────────────────────

This is what you would submit to investors, engineers, or enterprise clients.

1. System Overview
PUHIS is an AI-powered Finnish language learning platform offering:

Three distinct learning paths:
General Finnish

Workplace Finnish (Töihin)

YKI Exam Preparation

Each path includes speaking practice, grammar explanations, pronunciation analysis, and adaptive exercises tailored to the learner’s profile.

2. Core Components
2.1 Voice Interaction Pipeline
WebRTC or WS audio stream

Whisper STT

ConversationEngine (GPT-4.1 / 4.2)

TTS audio generation

Voice playback

2.2 Grammar Engine v2.5
rule-based + Omorfi morphological analysis

error classification: case, verb, word order

severity model

adaptive explanation depending on learner level

2.3 ProgressiveDisclosureEngine v2
hides/shows text depending on:

difficulty

learner progress

hesitation time

error rate

Unique differentiator for PUHIS.

2.4 Töihin Workplace Engine
Per-profession simulation environment:

vocabulary engine

scenario generator

roleplay dialogues

task simulations

scoring engine

2.5 YKI Engine
speaking evaluation (fluency, accuracy, vocabulary, coherence)

writing evaluation

CEFR-level band prediction

readiness dashboard

3. Data Layer
Models:

User

Settings

Subscription

Messages

GrammarLog

YKIResults

WorkplaceResults

PronunciationAnalysis

4. Frontend
Built with React Native (Expo) + Next.js:

conversation UI

workspace roleplay UI

YKI exam UI

settings system

analytics dashboard

5. Pricing
Free Tier

General Premium

Professional Premium (Töihin + YKI)

6. B2B Offering
Healthcare training

Technical fields

Logistics

Cleaning industry

Integration programs

────────────────────────────────────────

⭐ C — CURSOR + CODEX TASK BREAKDOWN
────────────────────────────────────────

Here is the complete delegation system for your two AI agents.

CURSOR = Architect
Creates:

full directory structure

all modules

function signatures

docstrings

architecture diagrams

TODO blocks for Codex

CURSOR Tasks:

Backend skeleton

ConversationEngine v1–v3.5

GrammarEngine v1.5 → v2.5 structure

ProgressiveDisclosureEngine structure

WorkplaceEngine structure

YKIEngine structure

PronunciationEngine structure

Data models

Routes skeleton

Frontend screens + components

Context providers

Deployment configurations

CODEX = Implementor
Implements:

OpenAI API calls

STT and TTS logic

grammar rules

scenario logic

roleplay scoring

UI actions

animations

writing evaluation

pronunciation detection

subscription enforcement

caching

error handling

database queries

A clean example task split:

ConversationEngine upgrade v3.5
Cursor:

define functions: build_teaching_prompt(), integrate_path_persona()

add docstrings and TODO markers

Codex:

implement tone logic

implement OpenAI call

implement memory saving

implement persona prompts

This clear division prevents architecture drift.

────────────────────────────────────────

⭐ D — COMPETITIVE ANALYSIS
────────────────────────────────────────

Competitors in Finland:
WordDive

Duolingo (Finnish)

Supisuomea / Selkosuomi content

YKI practice books

FinnishCourses.fi ecosystem

⭐ PUHIS vs Competitors
Feature	Duolingo	WordDive	Books	PUHIS
Real conversation	✖	✖	✖	✔
Speech practice	weak	weak	✖	✔ real-time
Pronunciation scoring	✖	average	✖	✔ phoneme-level
Grammar explanation	basic	medium	static	✔ dynamic & contextual
YKI simulation	✖	✖	limited	✔ full exam engine
Workplace Finnish	✖	partial	✖	✔ dedicated modules
Adaptive learning	weak	medium	✖	✔ multi-engine adaptation
Progressive disclosure	✖	✖	✖	✔ YOUR UNIQUE FEATURE
Suitable for B2B	no	no	no	✔ designed for workplaces
Your advantage is enormous.

PUHIS is not “another Finnish app.”
It is a full AI-powered language system.

────────────────────────────────────────

⭐ E — REALISTIC APP STORE SCREENSHOT CONCEPTS
────────────────────────────────────────

These are the screens you will show to users on Play Store / App Store.

Screenshot 1
"Speak Finnish Like You Live Here"
Image: phone showing PUHIS conversation with live transcript + AI bubble.

Screenshot 2
"Prepare for YKI Speaking With Real Exam Tasks"
Image: countdown timer + exam prompt.

Screenshot 3
"Learn Finnish For Your Job — Töihin Mode"
Image: choose profession (doctor, nurse, electrician, ICT).

Screenshot 4
"Get Grammar Explanations That Make Sense"
Image: correction bubble with explanation.

Screenshot 5
"Pronunciation Feedback That Actually Helps"
Image: waveform graph + vowel length feedback.

Screenshot 6
"Your Personalized Learning Path"
Image: dashboard with readiness indicators.

Screenshot 7
"Master Finnish Faster With Smart AI Scaffolding"
Image: ProgressiveDisclosureEngine hiding/showing words.

────────────────────────────────────────

⭐ F — BRANDING, TAGLINE, COLORS, UI FEEL
────────────────────────────────────────

Brand Name:
PUHIS (short, friendly, Finnish-inspired)

Taglines (choose one):
“Speak Finnish. For Life, Work, and YKI.”

“Your Finnish Coach — Anytime, Anywhere.”

“Finnish for Real Life. Powered by AI.”

“YKI. Töihin. Elämään. PUHIS auttaa.”

Color Palette (modern Finnish tech aesthetic)
Primary
Deep Blue (#0A3D62) → Finnish reliability

Snow White (#F8FAFC)

Accent
Aurora Green (#24CBA4)

Warm Yellow (#F6C400)

Error/Warning
Salmon Red (#FF6B6B)

Dark Mode
Slate (#1E293B)

Typography
Header: Inter Bold

Body: Inter Regular

Dialogues: Noto Sans (supports Finnish accents)

UI Vibe
Clean. Finnish. Professional.
Not cartoonish. Not playful like Duolingo.
More like:

Calm

Trustworthy

Scandinavian minimalism


----------------------------



⭐ 5. FULL “TÖIHIN” CONTENT OUTLINE FOR EACH PROFESSION
✔ Structured
✔ Expandable
✔ Immediately usable in PUHIS
✔ Written in a way Cursor can convert into modules & Codex into lessons
This is the definitive content blueprint for the Workplace (Töihin) path.

I’ll give you:

Core structure

Per-profession content categories

Roleplay scenarios

Vocabulary groups

Grammar focus

Assessments

Mini YKI-aligned tasks

Voice tasks

This structure is ready for automatic generation by AI, meaning you don’t have to manually create thousands of lessons — the engine will produce them.

────────────────────────────────────────

⭐ 5A — Töihin: Global Structure Used for All Professions
────────────────────────────────────────

Every profession module must have six core engines:

1. Vocabulary Engine for Work (VocabWork v1)
Categories:

Core workplace verbs

Tools & equipment

Common instructions

Safety vocabulary

Reporting vocabulary

Customer / patient communication

AI will generate these lists based on the profession.

2. Roleplay Engine (WorkplaceRoleplay v1)
Roleplay types:

Colleague-colleague interaction

Supervisor instructions

Client/patient/customer interaction

Emergency/exception situation

Daily routine communication

Documentation task

Each scenario includes:

prompts

sample expected responses

scoring rubric

3. Task Simulation Engine
Simulate real workplace tasks:

“Give report about…”

“Explain what happened…”

“Ask for clarification…”

“Describe a technical issue…”

“Give instructions safely…”

4. Grammar Focus by Profession
Different professions need different grammar:

Nurses → imperative, passive, partitive, object rules

Engineers → noun compounds, passive voice, spatial cases

ICT → conditional, modal verbs, technical nouns

Doctors → modal + aspect (joudut ottamaan), agent construction (potilaan sydän tutkitaan)

5. Assessment Engine
Includes:

Pronunciation scoring

Grammar detection

Appropriateness scoring

Workplace vocabulary coverage

Clarity and brevity scoring

6. Documents / Writing Tasks
Examples:

short notes

handing over information

writing a small report

────────────────────────────────────────

⭐ 5B — Profession-Specific Outlines
────────────────────────────────────────

Below is the ready-to-implement content tree for each profession.

You will give these structures to Cursor → Cursor generates architecture → Codex fills content → app runs dynamically.

⭐ 1. SAIRAANHOITAJA (Nurse)
A. Vocabulary Packs
kehonosat (body parts)

oireet (symptoms)

lääkkeet (medications)

mittaukset (measurements: RR, saturaatio…)

hoitovälineet (equipment)

kirjaaminen (documentation vocabulary)

B. Roleplay Scenarios
Potilaan vastaanotto

Hoidon ohjaaminen

Lääkehoidon jakaminen

Kivun arviointi

Hoitosuunnitelma

Raportin anto (vuoronvaihto)

C. Grammar Focus
passive (“annetaan”, “otetaan”)

partitive object

modal verbs (“täytyy”, “pitää”)

imperatives (“istu”, “hengitä”)

D. Assessment Tasks
Describe patient situation in 20 seconds

Give a shift handover summary

⭐ 2. LÄÄKÄRI (Doctor)
A. Vocabulary Packs
diagnoosit

hoitotoimenpiteet

laboratoriotulokset

erikoisalat

B. Roleplay
anamneesi

diagnoosin kertominen

jatkohoidon ohjeet

C. Grammar
complex sentence structures

verb rections

conditional (“jos oletetaan, että…”)

⭐ 3. SÄHKÖINSINÖÖRI
A. Vocabulary
johdot, kaapelit

jännitealueet

työkalut

turvaohjeet

B. Scenarios
installing a component

diagnosing a malfunction

reporting safety hazard

C. Grammar
noun compounds (“sähkökeskus”, “jännitemittari”)

locative cases (missä, mistä, mihin)

passive for instructions

⭐ 4. ICT / SOFTWARE DEVELOPER
A. Vocabulary
commit, merge, deploy

bugi, virhe, korjaus

vaatimukset

B. Scenarios
standup meeting

code review Finnish

explaining a bug

C. Grammar
modal verbs

passive (“järjestelmä päivitetään…”)

⭐ 5. HOIVA-AVUSTAJA
A. Vocabulary
hygiene tasks

elderly care words

communication phrases

B. Scenarios
helping with daily tasks

reporting incidents

⭐ 6. LOGISTIIKKA / VARASTO
Vocabulary
receiving goods

warehouse directions

safety vocabulary

Scenarios
inventory check

reporting shortage

giving instructions

⭐ 7. SIIVOUSALA
Vocabulary
cleaning tools

detergents

spaces and surfaces

Scenarios
cleaning routine

reporting damage

workplace safety

────────────────────────────────────────

⭐ 6 — CURSOR-READY IMPLEMENTATION COMMANDS TO START THE REPO
────────────────────────────────────────

These are copy–paste ready commands to run inside Cursor so it generates the full PUHIS repository.

I will split it into BACKEND, FRONTEND, and SHARED ENGINE MODULES.

You can paste each block into Cursor directly.

⭐ 6A — Cursor Command: Initialize Full Repo Structure
Paste into Cursor:

You are the Senior Architect. Initialize the full PUHIS repository structure as follows:

puhis/
  backend/
    app/
      main.py
      core/{config.py, security.py, logger.py, error_handler.py, cache.py}
      db/{database.py, models.py}
      routes/{auth.py, conversation.py, yki.py, workplace.py, lessons.py, pronunciation.py, subscription.py}
      services/{
        stt_service.py,
        tts_service.py,
        conversation_engine.py,
        grammar_engine.py,
        progressive_disclosure_engine.py,
        yki_engine.py,
        yki_exam_service.py,
        workplace_engine.py,
        vocab_engine.py,
        pronunciation_engine.py,
        personalization_service.py,
        analytics_service.py,
        subscription_service.py,
        sync_service.py,
        memory_service.py
      }
      utils/{sanitize.py, retry.py}
    requirements.txt

  frontend/
    app/
      App.js
      screens/{ConversationScreen.js, LessonScreen.js, LessonDetailScreen.js, YKISpeakingExamScreen.js, YKIWritingExamScreen.js, WorkplaceScreen.js, SettingsScreen.js, PronunciationScreen.js, PaywallScreen.js, PersonalizedPlanScreen.js}
      components/{MicRecorder.js, TutorBubble.js, UserBubble.js, Waveform.js, TypingIndicator.js}
      hooks/{useRecorder.js, useWebSocket.js}
      context/{AuthContext.js, SettingsContext.js, SubscriptionContext.js, ThemeContext.js}
      i18n/{en.json, fi.json, i18n.js}
      utils/{api.js, constants.js}

  docs/
    architecture.md
    api_specification.md
    grammar_rules.md
    workplace_scenarios.md
    yki_rubric.json
    progressive_disclosure_rules.md
    roadmap.md
⭐ 6B — Cursor Command: Generate Töihin Engine Architecture
Paste:

Create backend/app/services/workplace_engine.py with:

- get_available_fields()
- generate_profession_profile(field)
- get_dialogue_scenarios(field, level)
- generate_speaking_task(field, scenario, level)
- evaluate_professional_response(field, user_text)
- get_vocab_pack(field)

Add detailed docstrings. Include TODO markers for Codex to implement logic for each profession.
⭐ 6C — Cursor Command: Add PathEngine (General vs Töihin vs YKI)
Paste:

Create backend/app/services/path_engine.py with:

- determine_path(user_settings)
- route_to_engine(path, input_data)
- merge_feedback(results)
- enforce_path_rules(path, feature)

This engine decides whether the session should use:
- General Finnish engine
- Workplace Finnish engine
- YKI engine
⭐ 6D — Cursor Command: LessonArchitecture (General + Töihin)
Paste:

Create backend/app/services/lesson_engine.py with:

- get_lessons_for_path(path, level)
- get_lesson_details(lesson_id)
- evaluate_lesson_answer(lesson_id, user_input)
- generate_practice_questions(path, topic, level)
⭐ 6E — Cursor Command: Pronunciation Engine Structure
Paste:

Create backend/app/services/pronunciation_engine.py with:

- analyze_pronunciation(audio_bytes, expected_text)
- detect_vowel_length_errors()
- detect_consonant_length_errors()
- detect_stress_rhythm()
- generate_feedback_report()
⭐ 6F — Cursor Command: Progressive Disclosure Engine
Paste:

Create backend/app/services/progressive_disclosure_engine.py with:

- compute_support_level(history, hesitation, accuracy)
- hide_words(text, level)
- hide_case_endings(text, level)
- hide_verbs(text, level)
- memory_mode(text)

This engine handles the magic of scaffolding.
⭐ 6G — Cursor Command: YKI Engine Upgrade
Paste:

Update backend/app/services/yki_engine.py with:

- evaluate_speaking_v2(transcript)
- evaluate_writing_v1(text)
- map_scores_to_cefr()
- generate_ready_or_not_feedback()
⭐ 6H — Cursor Command: Frontend Workplace UI
Paste:

Create WorkplaceScreen.js:

- grid of professions
- when user selects profession:
    navigate to ProfessionDetailScreen.js
Create ProfessionDetailScreen.js:
- show vocab packs
- show scenarios
- start roleplay
⭐ NOW YOU HAVE EXACTLY WHAT YOU NEED
This gives you:

full Töihin content outline (profession-by-profession)

full Cursor commands to scaffold your repo

clean structure for Codex to implement logic

professional-grade planning


-----------------


Cursor gets the architecture + TODO blocks + module skeletons.

Codex gets the implementation-ready logic, patterns, and LLM prompt templates.

Everything is crafted to drop straight into your repo structure with minimal friction.

I’m keeping the tone factual, practical, and close to what a senior engineer would pass to a team for execution.

────────────────────────────────────────

⭐ 1 — FULL CONTENT TEMPLATES FOR EACH PROFESSION (USED BY CURSOR TO AUTO-GENERATE LESSONS)
These are profession modules in JSON-like structures.
Cursor will turn these into lesson files, and Codex will fill logic to dynamically generate tasks.

Each profession has 6 core components:

vocab_packs

grammar_focus

scenarios

tasks_speaking

tasks_writing

assessments

Below is the template format ALL professions must follow, plus complete versions for:

Nurse (Sairaanhoitaja)

Doctor (Lääkäri)

ICT Developer

Electrical Engineer

Hoiva-avustaja

Logistics

Cleaning (Siivous)

⭐ GLOBAL TEMPLATE (for Cursor)
{
  "profession": "<name>",
  "vocab_packs": {
      "core_verbs": [...],
      "tools_equipment": [...],
      "common_phrases": [...],
      "safety_terms": [...],
      "reporting_vocabulary": [...],
      "client_communication": [...]
  },
  "grammar_focus": [
      {"topic": "...", "examples": [...]},
      {"topic": "...", "examples": [...]}
  ],
  "scenarios": [
      {
        "id": "scenario_01",
        "title": "...",
        "roleplay_setup": "...",
        "ai_role": "...",
        "student_goal": "...",
        "expected_phrases": [...],
        "difficulty": "A2/B1",
        "followup_prompts": [...]
      }
  ],
  "tasks_speaking": [
      {"prompt": "...", "expected_range": "...", "scoring_model": {...}}
  ],
  "tasks_writing": [
      {"prompt": "...", "format": "...", "length": "...", "examples": [...]}
  ],
  "assessments": {
      "pronunciation_targets": [...],
      "grammar_targets": [...],
      "vocabulary_targets": [...],
      "workplace_behaviour_targets": [...]
  }
}
⭐ PROFESSION MODULES
These are ready to drop into docs/workplace_scenarios.md or into workplace_engine.py as structured templates.

────────────────────────────────────────

1. SAIRAANHOITAJA (NURSE)
{
  "profession": "sairaanhoitaja",
  "vocab_packs": {
      "core_verbs": ["mitata", "hoitaa", "tarkistaa", "arvioida", "raportoida"],
      "tools_equipment": ["verenpainemittari", "saturaatio", "neula", "kanyyli", "sidetarpeet"],
      "common_phrases": ["Miltä nyt tuntuu?", "Missä kohtaa sattuu?", "Kirjaan tämän ylös."],
      "safety_terms": ["ergonomia", "potilasturvallisuus", "aseptiikka"],
      "reporting_vocabulary": ["tilanne", "muutos", "havainto", "epäselvä", "raportointi"],
      "client_communication": ["rauhoittava", "yhteistyöhaluinen", "selkeä viestintä"]
  },
  "grammar_focus": [
    {"topic": "passiivi", "examples": ["lääkkeet annetaan", "haava puhdistetaan"]},
    {"topic": "partitiivi objektina", "examples": ["mittaan verenpainetta", "tarvitsen apua"]},
    {"topic": "imperatiivi", "examples": ["istu alas", "hengitä rauhassa"]}
  ],
  "scenarios": [
      {
        "id": "hoidon_aloitus_01",
        "title": "Potilaan vastaanotto",
        "roleplay_setup": "Uusi potilas tulee osastolle.",
        "ai_role": "Potilas, joka kuvaa oireitaan.",
        "student_goal": "Selvitä oireet ja kerro seuraavat vaiheet.",
        "expected_phrases": [
            "Kauan tämä on jatkunut?",
            "Voisitko kuvailla kipua?"
        ],
        "difficulty": "A2",
        "followup_prompts": [
            "Kysy tarkentavia kysymyksiä.",
            "Selitä mitä seuraavaksi tapahtuu."
        ]
      }
  ],
  "tasks_speaking": [
    {"prompt": "Kerro 30 sekunnissa potilaan tämänhetkinen tila.", "expected_range": "A2-B1"}
  ],
  "tasks_writing": [
    {"prompt": "Kirjoita lyhyt raportti potilaan tilanteesta.", "format": "3–4 lausetta"}
  ],
  "assessments": {
      "pronunciation_targets": ["pitkä vs lyhyt vokaali", "rytmi"],
      "grammar_targets": ["passiivi", "partitiivi"],
      "vocabulary_targets": ["oireet", "toimenpiteet"],
      "workplace_behaviour_targets": ["selkeys", "ammatillinen sävy"]
  }
}
────────────────────────────────────────

2. LÄÄKÄRI (DOCTOR) — condensed template
(Same format but only highlighting differences.)

{
 "profession": "laakari",
 "vocab_packs": {
    "core_verbs": ["diagnoida", "kuunnella", "määrätä", "suositella"],
    "tools_equipment": ["stetoskooppi", "ultraääni", "näyteastia"],
    "common_phrases": ["Tutkin vielä tämän.", "Tarvitsemme lisää tietoa."]
 },
 "grammar_focus": [
    {"topic": "konditionaali", "examples": ["suosittelisin, että..."]},
    {"topic": "monimutkaiset lauseet", "examples": ["Koska oireet jatkuvat, meidän täytyy..."]}
 ],
 "scenarios": [
    {"id": "anamneesi_01", "title": "Anamneesin teko", ...}
 ]
}
────────────────────────────────────────

3. ICT / SOFTWARE DEVELOPER
{
 "profession": "ict",
 "vocab_packs": {
    "core_verbs": ["debugata", "selvittää", "selittää", "arvioida"],
    "tools_equipment": ["versiohallinta", "palvelin", "API"],
    "common_phrases": ["Tässä on virhelogi.", "Voisitko selventää vaatimuksia?"]
 },
 "grammar_focus": [
    {"topic": "passiivi tuotannossa", "examples": ["sovellus päivitetään", "koodi testataan"]},
    {"topic": "modaaliverbit", "examples": ["voimme toteuttaa", "meidän täytyy muuttaa"]}
 ],
 "scenarios": [
   {"id": "standup_01", "title": "Standup-kokous", ...}
 ]
}
────────────────────────────────────────

4. SÄHKÖINSINÖÖRI
{
 "profession": "sahkoinsinoori",
 "vocab_packs": {
    "tools_equipment": ["jännitemittari", "kytkentäkaavio", "johtosarja"],
    "safety_terms": ["suojaetäisyys", "maadoitus"]
 },
 "grammar_focus": [
    {"topic": "paikallissijat", "examples": ["johdin kulkee kaapin sisällä"]},
    {"topic": "yhdyssanat", "examples": ["jännitemittari", "pääkytkin"]}
 ]
}
────────────────────────────────────────

5. HOIVA-AVUSTAJA
{
 "profession": "hoiva-avustaja",
 "scenarios": [
    {"id": "arki_01", "title": "Auttaminen arjessa", ...}
 ]
}
────────────────────────────────────────

6. LOGISTIIKKA / VARASTO
{
 "profession": "logistiikka",
 "vocab_packs": { "tools": ["trukki", "lavansiirtäjä"] },
 "scenarios": [ {"id": "vastaanotto_01", ...} ]
}
────────────────────────────────────────

7. SIIVOUS
{
 "profession": "siivous",
 "scenarios": [
    {"id": "rutiini_01", "title": "Päivittäinen siivouskierros", ...}
 ]
}
These templates allow Codex to generate dynamic lessons instantly.

────────────────────────────────────────

⭐ 2 — FULL AI PROMPT TEMPLATES FOR PUHIS ENGINES (Codex-Ready)
These are the core prompts your engines will use.
They are written in a stable, consistent, LLM-friendly format.

────────────────────────────────────────

2.1 Conversation Engine Prompt
You are PUHIS, an AI Finnish teacher. 
Role: Give natural spoken Finnish responses (1–3 sentences), speak in CEFR-appropriate level, 
correct the user's Finnish AFTER they finish speaking, and adapt to the selected path (general / workplace / YKI).

Rules:
1. Never switch languages unless asked.
2. Respond first in Finnish as a natural dialogue line.
3. After that, provide:
   (a) Correction if needed
   (b) Grammar explanation (simple)
   (c) Mini-practice prompt

If path = 'workplace', adopt professional tone and field vocabulary.
If path = 'yki', behave like a silent examiner: neutral, short prompts.
If path = 'general', behave friendly and supportive.
────────────────────────────────────────

2.2 Grammar Engine Prompt
Task: Identify errors in the user's Finnish sentence. 
Return:
{
 "corrected": "...",
 "errors": [
    {"type": "case", "details": "..."},
    {"type": "verb", "details": "..."}
 ],
 "explanation": "Short A2-level explanation.",
 "practice": "1 sentence transformation exercise."
}

Focus on: cases, verb types, object rules, adjective agreement, word order.
────────────────────────────────────────

2.3 Workplace Roleplay Prompt
You are now simulating a workplace roleplay in <profession>. 
Stay fully in character.

Respond as:
- Patient (nurse module)
- Colleague (ICT/engineering)
- Supervisor (cleaning/logistics)
- Customer (general service roles)

Important:
- Keep messages short.
- Use domain vocabulary.
- Do NOT give corrections unless the user stops speaking.
- After the user's turn, give performance feedback:
  vocabulary, clarity, grammar, professionalism.
────────────────────────────────────────

2.4 YKI Speaking Prompt
You are the YKI speaking examiner. 
Give a task EXACTLY as in YKI (short, neutral, no chit-chat). 
After the user's response, provide:
- CEFR score A2.1–B1.2 per category: fluency, accuracy, vocabulary, coherence
- One improvement sentence
────────────────────────────────────────

2.5 Pronunciation Prompt (LLM side)
Given user's transcript and phoneme deviations, produce:
- 1-sentence summary of pronunciation quality
- up to 2 specific vowel/consonant length issues
- 1 minimalist practice phrase
⭐ 3 — IMPROVED DATABASE SCHEMA (CURSOR-READY)
Place this into db/models.py via Cursor.
It is clean, scalable, and supports analytics + personalization.

User:
  id (UUID)
  email
  password_hash
  created_at
  path (general / toihin / yki)
  profession (nullable)
  level (A1/A2/B1)
  subscription_tier
  settings_json

Message:
  id
  user_id (FK)
  role (user/ai)
  text
  audio_path
  path_used
  profession_used
  created_at

GrammarLog:
  id
  user_id
  input_text
  corrected_text
  error_json
  severity
  created_at

PronunciationLog:
  id
  user_id
  phoneme_json
  score
  created_at

WorkplaceResult:
  id
  user_id
  profession
  scenario_id
  score_json
  created_at

YKIResult:
  id
  user_id
  speaking_score_json
  writing_score_json
  band_estimate
  created_at

LessonProgress:
  id
  user_id
  lesson_id
  path
  status (not_started / in_progress / completed)
  score_json
  created_at

AnalyticsDaily:
  id
  user_id
  date
  speaking_minutes
  mistakes_count
  vocab_growth_index
⭐ 4 — ENVIRONMENT INITIALIZATION SCRIPT (Linux, Cursor-Compatible)
This script sets up everything cleanly for development.

Save as: scripts/init_env.sh

#!/bin/bash

echo "Updating system..."
sudo apt update -y

echo "Installing system dependencies..."
sudo apt install -y python3 python3-venv python3-dev ffmpeg libsndfile1

echo "Creating virtual environment..."
python3 -m venv .venv
source .venv/bin/activate

echo "Installing pip upgrades..."
pip install --upgrade pip wheel setuptools

echo "Installing backend requirements..."
pip install fastapi uvicorn[standard] sqlalchemy psycopg2-binary pydantic python-multipart \
            aiofiles openai tiktoken redis python-jose passlib[bcrypt] \
            librosa soundfile

echo "Installing frontend tools..."
npm install -g expo-cli

echo "Creating folders..."
mkdir -p backend/app/{routes,services,core,db,utils}
mkdir -p frontend/app/screens
mkdir -p frontend/app/components
mkdir -p frontend/app/context
mkdir -p frontend/app/hooks
mkdir -p docs

echo "PUHIS environment initialized."


-----------------------


Cursor Prompt Blocks → paste into Cursor

Codex Implementation Blocks → paste into Codex

Everything is carefully written with stable, predictable structure so your AI agents will execute without hallucination or architectural drift.

────────────────────────────────────────

⭐ 5 — CURSOR-READY PROMPTS TO CREATE ALL ENGINES AT ONCE
────────────────────────────────────────

Paste the entire block below into Cursor.
It will generate the directory structure + function skeletons + TODOs for:

ConversationEngine

GrammarEngine

ProgressiveDisclosureEngine

WorkplaceEngine

YKIEngine

PronunciationEngine

LessonEngine

PersonalizationEngine

AnalyticsEngine

MemoryEngine

SubscriptionEngine

SyncEngine

⭐ CURSOR PROMPT — PUHIS ENGINE INITIALIZATION
You are the Senior Architect.  
Create the following engine modules under backend/app/services/, each with full class structures, docstrings, and TODO markers for Codex to implement logic.

1. conversation_engine.py  
   - class ConversationEngine  
       def handle_user_message(user_id, text, audio_path, path, profession):  
       def build_prompt(context, path, profession):  
       def postprocess_response(ai_output):  

2. grammar_engine.py  
   - class GrammarEngine  
       def analyze(text):  
       def classify_errors(errors):  
       def generate_explanation(errors):  

3. progressive_disclosure_engine.py  
   - class ProgressiveDisclosureEngine  
       def compute_support_level(history, hesitation, accuracy):  
       def mask_text(text, level):  
       def enable_memory_mode(text):  

4. yki_engine.py  
   - class YKIEngine  
       def evaluate_speaking(transcript):  
       def evaluate_writing(text):  
       def map_scores_to_cefr(scores):  
       def generate_band_feedback(scores):  

5. workplace_engine.py  
   - class WorkplaceEngine  
       def get_fields():  
       def load_profession_module(field):  
       def generate_scenario(field, scenario_id, level):  
       def evaluate_response(field, transcript):  

6. pronunciation_engine.py  
   - class PronunciationEngine  
       def analyze_audio(audio_bytes, expected_text):  
       def detect_vowel_length(errors):  
       def detect_consonant_length(errors):  
       def generate_report():  

7. lesson_engine.py  
   - class LessonEngine  
       def get_lessons(path, level):  
       def get_lesson_content(lesson_id):  
       def evaluate_answer(lesson_id, input_text):  

8. personalization_service.py  
   - class PersonalizationService  
       def generate_learning_plan(user_id):  
       def track_progress(user_id, event):  

9. analytics_service.py  
   - class AnalyticsService  
       def log_event(user_id, event_type, data):  
       def get_user_summary(user_id):  
       def get_trends(user_id):  

10. memory_service.py  
   - class MemoryService  
       def load_context(user_id):  
       def save_interaction(user_id, text):  

11. subscription_service.py  
   - class SubscriptionService  
       def get_user_tier(user_id):  
       def enforce(feature, user_tier):  
       def upgrade(user_id, tier):  

12. sync_service.py  
   - class SyncService  
       def export_user_data(user_id):  
       def import_user_data(user_id, data):  

Each file should include imports, class structure, method signatures, docstrings, and TODO markers describing expected Codex implementation.
Now Cursor has created the skeleton for ALL engines.

Next:

────────────────────────────────────────

⭐ Codex Implementation Prompts for Engines
────────────────────────────────────────

Paste the following into Codex when implementing each engine module.

⭐ CODEX PROMPT — Implement ConversationEngine Logic
Open conversation_engine.py.

Implement:
1. handle_user_message():
   - load memory using MemoryService
   - build prompt using build_prompt()
   - call OpenAI chat completion
   - save AI output to memory
   - return structured response

2. build_prompt():
   - include path-specific behavior:
        if path == "general": friendly tutor
        if path == "workplace": professional persona
        if path == "yki": silent examiner
   - include progressive disclosure rules

3. postprocess_response():
   - separate main reply
   - extract corrections
   - format mini-practice

Use deterministic formatting. Do not invent new fields.
⭐ CODEX PROMPT — Implement GrammarEngine Logic
Implement:
- detect Omorfi-style morphological errors (pseudo-detection)
- classify errors into {case, verb, conjugation, order, spelling}
- produce correction suggestions
- generate short explanations at A2/B1 level
⭐ CODEX PROMPT — Implement ProgressiveDisclosureEngine Logic
Implement:
- support levels (0=full text, 1=hide endings, 2=hide verbs, 3=memory mode)
- basic heuristics:
    if error rate high → lower difficulty
    if user fluent → reduce support
- masking rules for endings: replace noun inflection with "___"
⭐ CODEX PROMPT — Implement WorkplaceEngine Logic
Implement:
- load profession templates from JSON/dict
- generate scenario prompts
- evaluate user’s response by:
     measuring vocabulary coverage
     detecting missing required phrases
     scoring clarity and correctness
⭐ CODEX PROMPT — Implement YKIEngine Logic
Implement:
- speaking evaluation using:
      fluency: based on sentence length + pause markers
      accuracy: grammar_engine.classify_errors()
      vocabulary: count unique tokens
      coherence: simple scoring
- writing evaluation similarly
- map scores to CEFR bands
⭐ CODEX PROMPT — Implement PronunciationEngine Logic
Implement:
- mock phoneme alignment using text comparison
- detect long vs short vowels by comparing repeated letters
- produce 0–4 score
- generate feedback summary
────────────────────────────────────────

⭐ 6 — FULL TÖIHIN CURRICULUM (10+ LESSONS PER PROFESSION)
────────────────────────────────────────

Each profession now gets a 10-lesson curriculum, each lesson containing:

Speaking task

Workplace vocabulary

Roleplay scenario

Mini grammar point

Short writing task

Assessment criteria

You can feed these structures directly into Cursor → LessonEngine.

⭐ SAIRAANHOITAJA — 10 LESSONS
Lesson 1 — Potilaan vastaanotto
Vocabulary: symptoms, pain scale

Speaking: ask about symptoms

Roleplay: first contact

Grammar: question forms

Writing: 2-sentence note

Lesson 2 — Hoidon ohjaaminen
Lesson 3 — Lääkehoito
Lesson 4 — Mittaukset (RR, lämpö)
Lesson 5 — Raportointi kollegalle
Lesson 6 — Kivun arviointi
Lesson 7 — Ajo-ohjeet potilaalle
Lesson 8 — Hätätilanne
Lesson 9 — Dokumentointi
Lesson 10 — Koko hoitoprosessin selitys
⭐ LÄÄKÄRI — 10 LESSONS
Perusanamneesi

Diagnoosin esitteleminen

Laboratoriotulosten selitys

Hoitosuunnitelma

Potilaan huolien käsittely

Erikoislähete

Leikkauksen jälkihoito

Hätätilanteen ohjeet

Kollegiaalinen konsultaatio

Yhteenveto potilastapauksesta

⭐ ICT DEVELOPER — 10 LESSONS
Standup meeting

Bug explanation

Feature planning

Giving estimation

Code review

Version control terms

API explanation

Deployment incident

Writing commit messages in Finnish

Explaining architecture to colleague

⭐ SÄHKÖINSINÖÖRI — 10 LESSONS
Safety briefing

Wiring instructions

Diagnosing a fault

Reporting measurements

Explaining diagrams

Installing components

Maintenance procedures

Customer communication

Troubleshooting guide

Project summary

⭐ HOIVA-AVUSTAJA — 10 LESSONS
Auttaminen arjessa

Hygienia

Ruokailu

Liikkumisen tukeminen

Lääkityksen tarkistus

Raportointi

Päiväohjelma

Vaikea tilanne

Asiakasviestintä

Vuoronvaihto

⭐ LOGISTIIKKA — 10 LESSONS
Tavaroiden vastaanotto

Inventointi

Trukin käyttö

Lähetyksen tarkistus

Hyllytys

Tilanneongelmat

Kuljetusohjeet

Vaaratilanteet

Asiakasviestintä

Päivän raportti

⭐ SIIVOUS — 10 LESSONS
Päivärutiini

Välineet

Turvallisuus

Asiakastilanteet

Lika-asteet

Puhtauslaatu

Raportointi

Erikoistilanne

Tarkistuslista

Kuukausisiivous

Everything above is immediately implementable by Codex.

────────────────────────────────────────

⭐ 7 — FULL CONVERSATIONAL DATASETS FOR ALL PATHS
────────────────────────────────────────

These datasets help the ConversationEngine produce stable, natural, structured dialogues.

Use them as prompts to feed Codex.

⭐ General Path — 20 Conversation Starters
1. Kerro minulle päivästäsi.
2. Mitä teit viime viikonloppuna?
3. Kerro lempiruokasi.
4. Kuvaile kotikaupunkiasi.
5. Mitä suomalaisia tapoja olet huomannut?
...
⭐ Workplace Path — 20 Prompts Per Profession
Example (Nursing):

1. Selitä potilaan tämänhetkinen tila.
2. Kysy potilaalta kivun taso.
3. Kerro kollegalle, mitä tapahtui viime yössä.
4. Anna ohjeet kotihoitoa varten.
...
(Repeat for each profession.)

⭐ YKI Path — Full 18-task set
Tasks include:

everyday monologue

giving advice

comparing things

expressing opinion

short storytelling

Codex will turn these into exam tasks.

────────────────────────────────────────

⭐ 8 — DEPLOYMENT PLAYBOOK (Fly.io + Vercel + Expo EAS)
────────────────────────────────────────

This is the official production deployment plan.

⭐ Backend (Fly.io)
1. Install flyctl
curl -L https://fly.io/install.sh | sh
2. Create app
fly launch --name=puhis-backend --region=ams
3. Environment variables
fly secrets set OPENAI_API_KEY=xxxxx
fly secrets set DATABASE_URL=postgresql://...
4. Deploy
fly deploy
5. Auto-scaling
In fly.toml:

[autoscale]
min = 1
max = 3
⭐ Frontend Web (Vercel)
vercel init

Set env vars

Deploy

vercel --prod
⭐ Mobile App (Expo EAS)
Install:

npm install -g eas-cli
Configure:

eas build:configure
Build Android:

eas build -p android --profile production
Build iOS (requires Mac):

eas build -p ios --profile production
⭐ 9 — AUTOMATED EVALUATION PIPELINE FOR SPEAKING & WRITING
────────────────────────────────────────

This is crucial for YKI and Töihin modules.

Your evaluation pipeline consists of:

✔ STT → Grammar → Scoring → Feedback
Below is the Codex-ready prompt to implement the evaluation:

⭐ Speaking Evaluation Pipeline (Codex)
Given transcript, compute:

- fluency_score: based on pause markers, sentence count
- accuracy_score: using grammar_engine.classify_errors()
- vocabulary_score: count of unique meaningful words
- coherence_score: does the answer match task intent?

Return:
{
 "fluency": X,
 "accuracy": X,
 "vocabulary": X,
 "coherence": X,
 "band_estimate": "A2.2"/"B1.1",
 "feedback": "1–2 short suggestions"
}
⭐ Writing Evaluation Pipeline
Evaluate:
- grammar (case, conjugation errors)
- structure (sentence flow)
- vocabulary variety
- task completion

Return JSON with scores 0–4 and CEFR mapping.



------------------


The roadmap covers:

v1.0 — The MVP (usable, sellable, essential features only)

v1.1 — Stability + teaching quality upgrades

v1.2 — Töihin expansion + employer value

v1.3 — YKI Premium upgrade

v1.4 — Deep analytics + AI teacher v2

v1.5 — Global polish + payments + retention systems

v2.0 — Full enterprise-grade PUHIS platform

Everything below is ordered so Cursor + Codex can actually build each step.

────────────────────────────────────────

⭐ PUHIS VERSIONING ROADMAP
────────────────────────────────────────

🚀 v1.0 — Core MVP Release (6–8 weeks)
Goal: Make PUHIS usable by early adopters and testers.
Focus: Speaking → Correction → Explanation → Practice.

📌 INCLUDED:
Conversation Engine v1
Voice input

Whisper STT

AI response (general Finnish only)

Basic correction

Mini grammar explanation

Grammar Engine v1
Case mistakes

Verb forms

Word order

Pronunciation Engine v1 (simple)
detects long/short vowels

basic score (0–4)

User Path Selection (limited)
General Finnish only

YKI / Töihin disabled but visible as “Coming Soon”

Progressive Disclosure v1
show full text

hide endings

Frontend:
Conversation screen

Settings screen

Basic analytics (words spoken, minutes practiced)

Backend Stability:
FastAPI + PostgreSQL

File storage for audio outputs

Basic logging

💰 Monetization:
No subscription yet

Free users only

🎯 Purpose:
Collect real user feedback, fix stability issues, prove app works.

────────────────────────────────────────

⭐ v1.1 — Reliability + Teaching Quality Upgrade
Goal: Make PUHIS feel like a real Finnish tutor, not a prototype.
This is where you fix the rough edges.

📌 INCLUDED:
Conversation Engine v2
persona improvements

better Finnish naturalness

detects when user is struggling

fallback explanations

Grammar Engine v1.5
severity scoring

consistent output format

mini quizzes automatically created

Progressive Disclosure v2
memory mode

hesitation detection

Pronunciation v1.2
consonant length

rhythm scoring

UI Polish
clean message bubbles

waveform visualizer

loading states

Basic Lesson Engine
10 everyday lessons

dialogues with comprehension checks

💰 Monetization:
Add subscription infrastructure (disabled by default)

🎯 Purpose:
Convert testers into early believers. Build trust.

────────────────────────────────────────

⭐ v1.2 — Töihin Mode (Workplace Finnish) — Phase 1
Goal: Introduce PUHIS’s unique differentiator.

📌 INCLUDED:
WorkplaceEngine v1
Sairaanhoitaja (nurse) module complete

ICT Developer module complete

Logistics/warehouse module complete

Each includes:

5 roleplay scenarios

vocabulary packs

grammar focus points

simple scoring

UI: Töihin Screen
profession selection grid

intro lesson for each field

LessonEngine v1.2
10 lessons per field

Conversation Engine Integration
AI role switches to patient, colleague, supervisor depending on scenario

💰 Monetization:
Introduce Professional Premium tier (Töihin + YKI)

General Finnish stays basic tier

🎯 Purpose:
Start B2B partnerships. This is where you become different from Duolingo & WordDive.

────────────────────────────────────────

⭐ v1.3 — YKI Preparation Mode — Phase 1
Goal: Capture the MOST profitable customer segment in Finland.

📌 INCLUDED:
YKI Engine v1
speaking tasks

90-second timers

CEFR scoring (basic)

simple coherence scoring

readiness indicator

YKI UI
exam-style interface

progress bar

task categories

Correction Engine v2
deeper grammar explanation

highlight repeated mistakes

💰 Monetization:
YKI included in Professional Premium tier

🎯 Purpose:
You can now market PUHIS to thousands of YKI test-takers.

────────────────────────────────────────

⭐ v1.4 — Deep Learning Analytics & Teacher Mode
Goal: Make PUHIS feel like a real coach, not just an AI chat.

📌 INCLUDED:
ProgressBrain v1
Tracks:

speaking fluency trend

grammar error frequency

vocabulary coverage

path mastery

Personalized Learning Plan v1
strengths & weaknesses

recommended lessons

predicted CEFR

Pronunciation Engine v1.5
segment heat maps

stress pattern analysis

WorkplaceEngine v1.5
add Doctor, Hoiva-avustaja, Cleaning modules

total professions: 6–7

UI Enhancements
improvement score cards

weekly reports

🎯 Purpose:
Retention. Users stay because they FEEL progress.

────────────────────────────────────────

⭐ v1.5 — Global Polish + Payments + Retention
Goal: Prepare PUHIS for app stores + B2B pilot programs.

📌 INCLUDED:
Payments Live
Stripe integration

Free → Upsell → Premium

Trial periods

Gamification v1
daily streak

XP system

badges for YKI tasks / workplace mastery

Localization
English UI

Finnish UI

Swedish (optional)

SEO / Web App Polish
marketing pages

landing pages

Stability Pass
auto bug reporter

network fallback

🎯 Purpose:
Start scaling marketing + onboarding paid users.

────────────────────────────────────────

⭐ v1.6 — Töihin Mode (Workplace) — Phase 2
Goal: Make PUHIS the #1 workplace Finnish app in Finland.

📌 INCLUDED:
Advanced Roleplay
Multi-turn scenarios

Interruptions

Random events (e.g., emergency)

Assessment v2
workplace appropriateness check

clarity score

required vocabulary detection

Profession Expansion
Add:

Sähköinsinööri

Construction worker

Restaurant/hospitality

Total: 10 professions.

Enterprise Reporting v1
supervisor dashboard

group progress indicators

🎯 Purpose:
Sell PUHIS to employers and training institutions.

────────────────────────────────────────

⭐ v1.7 — YKI Mode — Phase 2 (Near-official Simulation)
Goal: Become the standard for YKI preparation in Finland.

📌 INCLUDED:
YKI Speaking v2
multi-task exam simulation

full scoring rubric

explain mistakes per category

YKI Writing v1
short writing tasks

grammar-level scoring

readability scoring

YKI Readiness Dashboard v2
band stability

strong/weak areas

booking recommendation

🎯 Purpose:
Secure dominance in the exam-prep market.

────────────────────────────────────────

⭐ v2.0 — FULL PUHIS PLATFORM (ENTERPRISE-READY)
This is the "big release" for public marketing, investors, and enterprise partners.

⭐ What’s included at v2.0:
1. Complete 3 Learning Paths
General Finnish A1–B1

Töihin (10–12 professions)

YKI Speaking + Writing + Exam Simulation

2. Advanced Teaching Engines
Conversation Engine v4

Grammar Engine v3 (hybrid Omorfi + AI)

Pronunciation Engine v2 (phoneme alignment)

ProgressiveDisclosureEngine v3

Personalization Engine v2

3. B2B Platform
Admin + teacher dashboard

Cohort analytics

Report export

License management

4. Full Subscription Model
Free tier

General Premium

Professional Premium

5. Deployment-Grade Stability
Load-tested

Monitoring + logging + Sentry

GDPR tools

Performance tuning

6. Marketing & Growth
SEO

affiliate program

onboarding funnels

🎯 Purpose:
PUHIS becomes the leading AI Finnish-learning ecosystem in Finland.

────────────────────────────────────────

⭐ Optional Future Versions (Beyond v2.0)
v2.1 — Finnish A2 → B2 Path (Intermediate/Advanced Finnish)
v2.2 — Reading + Listening comprehension engine
v2.3 — Teacher console for human instructors
v2.4 — Offline mode with on-device Finnish STT
v3.0 — PUHIS for Other Languages (Swedish, Norwegian)
────────────────────────────────────────

⭐ SUMMARY VIEW (Quick Roadmap)
Version	Focus	Main Value
v1.0	MVP	basic conversation + correction
v1.1	Quality	better teaching, pronunciation
v1.2	Töihin P1	workplace modules (3 fields)
v1.3	YKI P1	speaking exam mode
v1.4	Analytics	progress engine + plan
v1.5	Payments + retention	subscriptions + gamification
v1.6	Töihin P2	10 professions + B2B dashboard
v1.7	YKI P2	full speaking + writing exam
v2.0	Full platform	enterprise-ready PUHIS


----------------------


⭐ PUHIS MASTER DEVELOPMENT PLAN: v1.0 → v2.0
With full Cursor and Codex instructions for EVERY version
This can be copied, pasted, and executed step-by-step.
Nothing is abstract. No missing modules.
You will be able to build PUHIS entirely from this document.

🔷 PART 1 — GLOBAL DEVELOPMENT RULES (VERY IMPORTANT)
Before the roadmap, here are the global habits you must follow:

Cursor = Architect
Always gets:

file creation

module structure

docstrings

TODO blocks

interface definitions

data models

folder layouts

engine scaffolds

Codex = Implementor
Always gets:

business logic

OpenAI calls

grammar handling

scoring systems

content generation

scenario logic

evaluation pipelines

user progress calculations

Cursor never implements logic.
Codex never creates files or folder layouts.

🔷 PART 2 — VERSIONING ROADMAP + EXECUTION PROMPTS
Each version below contains:

WHAT you build

CURSOR prompt block (create structures)

CODEX prompt block (implement logic)

This goes from v1.0 → v2.0, exactly as you asked.

────────────────────────────────────────

⭐ v1.0 — MVP Core
Goal: speech → AI response → correction → explanation
Build ONLY the core of PUHIS.

🟦 CURSOR BLOCK — v1.0 FILE STRUCTURE + SKELETONS
Paste into Cursor:

You are the Senior Architect.

Create the following:

backend/app/
  main.py
  core/{config.py, security.py, logger.py}
  db/{database.py, models.py}
  routes/{auth.py, conversation.py}
  services/{conversation_engine.py, grammar_engine.py, memory_service.py}
  utils/{sanitize.py}

frontend/app/
  App.js
  screens/{ConversationScreen.js, SettingsScreen.js}
  components/{MicRecorder.js, TutorBubble.js, UserBubble.js}
  context/{AuthContext.js}
  hooks/{useRecorder.js, useWebSocket.js}

Add docstrings + TODO markers for Codex.
🟩 CODEX BLOCK — v1.0 IMPLEMENTATION LOGIC
Paste into Codex:

Implement:

ConversationEngine:
- whisper STT call
- OpenAI chat completion
- return structured output:
   { "reply": "...", "correction": "...", "explanation": "...", "practice": "..." }

GrammarEngine:
- detect case endings via simple heuristics
- detect missing verb suffixes
- output corrected version + brief explanation

MemoryService:
- store last 5 messages in DB

ConversationScreen:
- microphone start/stop
- display AI messages and corrections

TutorBubble:
- render reply + correction + explanation
────────────────────────────────────────

⭐ v1.1 — Teaching Quality Upgrade
Goal: improve naturalness, stability, progressive disclosure v1
🟦 CURSOR BLOCK — v1.1 ENGINE EXPANSION
Add to backend/services:

progressive_disclosure_engine.py
lesson_engine.py
pronunciation_engine.py

Modify conversation_engine.py:
- add build_prompt() method
- add integrate_progressive_disclosure()

Modify grammar_engine.py:
- add classify_errors()

Add frontend components:
  components/{Waveform.js, TypingIndicator.js}
  context/SettingsContext.js
🟩 CODEX BLOCK — v1.1 LOGIC IMPLEMENTATION
ProgressiveDisclosureEngine:
- levels 0–2: full → hide endings → memory mode

PronunciationEngine v1:
- detect long vowels by comparing repeated letters
- basic score 0–4
- feedback string

ConversationEngine:
- integrate progressive disclosure based on settings + error rate

LessonEngine:
- generate A1–A2 lessons using AI content
────────────────────────────────────────

⭐ v1.2 — Töihin Mode (Workplace Finnish) v1
Professions included: Nurse, ICT, Logistics
🟦 CURSOR BLOCK — v1.2 WORKPLACE STRUCTURE
Create: backend/app/services/workplace_engine.py

Add functions:
- get_available_fields()
- load_profession_module(field)
- generate_scenario(field, scenario_id, level)
- evaluate_response(field, transcript)

Create docs/workplace_scenarios.json (placeholder)
🟩 CODEX BLOCK — v1.2 WORKPLACE LOGIC
Implement WorkplaceEngine:

- load profession modules from in-file dict
- generate 5 scenarios each for:
     sairaanhoitaja, ict, logistiikka
- evaluation:
     vocabulary coverage
     clarity
     correctness
     workplace appropriateness

ConversationEngine:
- if path='workplace' → adopt profession persona
────────────────────────────────────────

⭐ v1.3 — YKI Speaking Mode v1
Introduce exam-style tasks & CEFR scoring.
🟦 CURSOR BLOCK — v1.3 YKI STRUCTURE
Create backend/services/yki_engine.py

Methods:
- evaluate_speaking(transcript)
- map_scores_to_cefr()
- generate_band_feedback()

Modify routes:
- yki.py with:
    POST /yki/speaking
🟩 CODEX BLOCK — v1.3 YKI IMPLEMENTATION
YKIEngine:
- fluency_score: avg sentence length
- accuracy_score: grammar errors count
- vocabulary_score: unique tokens
- coherence_score: relevance to prompt
- map scores 0–4 to CEFR band
────────────────────────────────────────

⭐ v1.4 — Analytics + Personalized Learning v1
🟦 CURSOR BLOCK — v1.4 STRUCTURE
Create backend/services/personalization_service.py
Create backend/services/analytics_service.py

Add DB models:
- GrammarLog
- PronunciationLog
- LessonProgress
- AnalyticsDaily

Add frontend:
- PersonalizedPlanScreen.js
- ProgressScreen.js
🟩 CODEX BLOCK — v1.4 LOGIC
AnalyticsService:
- log grammar errors
- log speaking duration
- compute trends

PersonalizationService:
- analyze logs
- identify weak cases & verbs
- generate plan:
    weaknesses, strengths, recommended lessons
────────────────────────────────────────

⭐ v1.5 — Payments + Retention
Introduce subscriptions & gamification.
🟦 CURSOR BLOCK — v1.5 STRUCTURE
Add backend/services/subscription_service.py
Add frontend/screens/PaywallScreen.js
Add context/SubscriptionContext.js

Add backend/services/gamification_service.py
Add Achievement model

Modify frontend:
- add XP banners
- streak tracking in UI
🟩 CODEX BLOCK — v1.5 LOGIC
SubscriptionService:
- enforce(feature) returns allow/deny
- upgrade/downgrade actions

Gamification:
- daily streak logic
- XP gain rules
- award achievements when:
    - first YKI attempt
    - 100 lines spoken
    - 10 workplace tasks
────────────────────────────────────────

⭐ v1.6 — Töihin Mode v2 (10 professions)
Add:

Doctors

Hoiva-avustaja

Cleaning

Electrical engineer

Construction

Restaurant/hospitality

🟦 CURSOR BLOCK — v1.6 EXPANSION
Extend docs/workplace_scenarios.json with 10 professions

Modify workplace_engine.py:
- load scenarios dynamically
- add evaluation rubrics
- add multi-turn roleplay support

Add frontend:
  WorkplaceScreen.js (profession grid)
  ProfessionDetailScreen.js (lesson list + scenarios)
🟩 CODEX BLOCK — v1.6 IMPLEMENTATION
WorkplaceEngine:
- scenario generator uses structured templates
- evaluation:
    - required vocabulary present
    - politeness markers
    - context-specific phrasing
────────────────────────────────────────

⭐ v1.7 — YKI Mode v2 (Full Speaking + Writing Exam)
🟦 CURSOR BLOCK — v1.7 STRUCTURE
Extend yki_engine.py:

- evaluate_writing(text)
- assess_structure()
- assess_vocabulary()
- assess_grammar()
- assess_task_completion()

Create YKIWritingExamScreen.js
🟩 CODEX BLOCK — v1.7 IMPLEMENTATION
YKI Writing Evaluation:
- grammar: grammar_engine.analyze()
- structure: detect sentence variety
- vocabulary: CEFR-graded list comparison
- task completion: keyword matching

Return CEFR band
────────────────────────────────────────

⭐ v2.0 — FULL PUHIS PLATFORM
Enterprise-ready, all paths complete, highly stable.
🟦 CURSOR BLOCK — v2.0 STRUCTURE
Add:
backend/services/professional_reporting_service.py
backend/services/deployment_optimizations.py

Add frontend:
- EmployerDashboardScreen.js
- AdminScreen.js

Optimize:
- Dockerfile.production
- fly.toml autoscaling
- CI/CD pipeline
🟩 CODEX BLOCK — v2.0 IMPLEMENTATION
Employer Dashboard:
- query progress by group
- compute CEFR distributions
- scenario performance summaries

Deployment optimizations:
- caching common prompt templates
- STT batching
- async DB operations
🔷 PART 3 — HOW TO EXECUTE THIS ROADMAP IN PRACTICE
A developer workflow using Cursor + Codex:

⭐ Step 1 — For each version:
Paste the Cursor block → it generates structure.

⭐ Step 2 — Immediately after:
Paste the Codex block → it implements logic.

⭐ Step 3 — Test, commit, move to next version.
This ensures:

No architectural drift

Code stays clean

Engines evolve predictably

You maintain control



---------------------------


MEGA CURSOR SCRIPT → architecture + file/folder creation + module skeletons

MEGA CODEX SCRIPT → implementation logic + AI behavior + scoring pipelines

GANTT CHART TIMELINE (v1.0 → v2.0)

FULL TESTING STRATEGY (unit, integration, AI evaluation)

This is the complete PUHIS build bible.

────────────────────────────────────────
────────────────────────────────────────

⭐ MEGA CURSOR SCRIPT (ARCHITECTURE + FILES + SKELETONS)
COPY + PASTE DIRECTLY INTO CURSOR
(Cursor will generate all folders, modules, docstrings, and TODO stubs from v1 → v2.)

You are the Senior System Architect.

Create the FULL PUHIS repository structure for versions v1.0 → v2.0.

Include ALL folders, modules, classes, method signatures, docstrings, and TODO markers for Codex to implement.

======================================================================
ROOT STRUCTURE
======================================================================
puhis/
  backend/
    app/
      main.py
      core/
        config.py
        security.py
        logger.py
        error_handler.py
        cache.py
      db/
        database.py
        models.py
      routes/
        auth.py
        conversation.py
        yki.py
        workplace.py
        lessons.py
        pronunciation.py
        subscription.py
        sync.py
      services/
        conversation_engine.py
        grammar_engine.py
        progressive_disclosure_engine.py
        pronunciation_engine.py
        workplace_engine.py
        yki_engine.py
        yki_exam_service.py
        lesson_engine.py
        personalization_service.py
        analytics_service.py
        subscription_service.py
        memory_service.py
        sync_service.py
        gamification_service.py
        professional_reporting_service.py
      utils/
        sanitize.py
        retry.py

  frontend/
    app/
      App.js
      screens/
        ConversationScreen.js
        SettingsScreen.js
        YKISpeakingExamScreen.js
        YKIWritingExamScreen.js
        WorkplaceScreen.js
        ProfessionDetailScreen.js
        LessonScreen.js
        LessonDetailScreen.js
        PronunciationScreen.js
        PaywallScreen.js
        ProgressScreen.js
        PersonalizedPlanScreen.js
        EmployerDashboardScreen.js
      components/
        MicRecorder.js
        TutorBubble.js
        UserBubble.js
        Waveform.js
        TypingIndicator.js
      hooks/
        useRecorder.js
        useWebSocket.js
      context/
        AuthContext.js
        SettingsContext.js
        SubscriptionContext.js
        ThemeContext.js
      i18n/
        en.json
        fi.json
        se.json
        i18n.js
      utils/
        api.js
        constants.js

  docs/
    versioning_roadmap.md
    gantt_chart.png (placeholder)
    api_specification.md
    workplace_scenarios.json
    yki_rubric.json
    grammar_rules.md
    progressive_disclosure_rules.md
    testing_strategy.md

======================================================================
MODULE SKELETONS + CLASS SIGNATURES
======================================================================

backend/app/services/conversation_engine.py
---------------------------------------------------
class ConversationEngine:
    """Handles user → AI conversation flow."""
    def handle_user_message(self, user_id, text, audio_path, path, profession):
        """Return AI reply, corrections, pronunciation, metadata."""
        # TODO Codex implementation

    def build_prompt(self, context, path, profession):
        """Construct meta-prompt based on path + persona."""
        # TODO Codex

    def postprocess_response(self, ai_output):
        """Parse AI response into reply/correction/explanation."""
        # TODO Codex


backend/app/services/grammar_engine.py
---------------------------------------------------
class GrammarEngine:
    """Analyze grammar mistakes in Finnish."""
    def analyze(self, text):
        # TODO Codex
    
    def classify_errors(self, errors):
        # TODO Codex
    
    def generate_explanation(self, errors):
        # TODO Codex


backend/app/services/progressive_disclosure_engine.py
---------------------------------------------------
class ProgressiveDisclosureEngine:
    """Controls how much support text user sees."""
    def compute_support_level(self, history, hesitation, accuracy):
        # TODO Codex

    def mask_text(self, text, level):
        # TODO Codex

    def enable_memory_mode(self, text):
        # TODO Codex


backend/app/services/pronunciation_engine.py
---------------------------------------------------
class PronunciationEngine:
    """Analyze Finnish pronunciation (vowel length, rhythm, clarity)."""
    def analyze_audio(self, audio_bytes, expected_text):
        # TODO Codex

    def detect_vowel_length(self, transcript):
        # TODO Codex

    def detect_consonant_length(self, transcript):
        # TODO Codex

    def generate_report(self):
        # TODO Codex


backend/app/services/workplace_engine.py
---------------------------------------------------
class WorkplaceEngine:
    """Roleplay + vocabulary engine for professions."""
    def get_fields(self):
        # TODO Codex

    def load_profession_module(self, field):
        # TODO Codex

    def generate_scenario(self, field, scenario_id, level):
        # TODO Codex

    def evaluate_response(self, field, transcript):
        # TODO Codex


backend/app/services/yki_engine.py
---------------------------------------------------
class YKIEngine:
    """Evaluate YKI speaking & writing."""
    def evaluate_speaking(self, transcript):
        # TODO Codex

    def evaluate_writing(self, text):
        # TODO Codex

    def map_scores_to_cefr(self, scores):
        # TODO Codex

    def generate_band_feedback(self, scores):
        # TODO Codex


backend/app/services/lesson_engine.py
---------------------------------------------------
class LessonEngine:
    def get_lessons(self, path, level):
        # TODO Codex

    def get_lesson_content(self, lesson_id):
        # TODO Codex

    def evaluate_answer(self, lesson_id, input_text):
        # TODO Codex


backend/app/services/personalization_service.py
---------------------------------------------------
class PersonalizationService:
    def generate_learning_plan(self, user_id):
        # TODO Codex
    
    def track_progress(self, user_id, event):
        # TODO Codex


backend/app/services/analytics_service.py
---------------------------------------------------
class AnalyticsService:
    def log_event(self, user_id, event_type, data):
        # TODO Codex

    def get_user_summary(self, user_id):
        # TODO Codex

    def get_trends(self, user_id):
        # TODO Codex


backend/app/services/subscription_service.py
---------------------------------------------------
class SubscriptionService:
    def get_user_tier(self, user_id):
        # TODO Codex

    def enforce(self, feature, user_tier):
        # TODO Codex

    def upgrade(self, user_id, tier):
        # TODO Codex


backend/app/services/memory_service.py
---------------------------------------------------
class MemoryService:
    def load_context(self, user_id):
        # TODO Codex

    def save_interaction(self, user_id, text):
        # TODO Codex


backend/app/services/sync_service.py
---------------------------------------------------
class SyncService:
    def export_user_data(self, user_id):
        # TODO Codex

    def import_user_data(self, user_id, data):
        # TODO Codex

======================================================================

This completes full v1 → v2 architecture.
────────────────────────────────────────
────────────────────────────────────────

⭐ MEGA CODEX SCRIPT (FULL LOGIC IMPLEMENTATION FOR ALL ENGINES)
COPY + PASTE DIRECTLY INTO CODEX
(Codex will implement all logic modules created by Cursor.)

You are the Senior Implementation Engineer.

Implement COMPLETE logic for all PUHIS engines described below.
Use clean, maintainable, modular Python.
Follow method signatures exactly as given by Cursor.

======================================================================
CONVERSATION ENGINE IMPLEMENTATION
======================================================================
ConversationEngine.handle_user_message:
- load last 10 messages from MemoryService
- call build_prompt()
- call OpenAI chat completion (deterministic structure)
- parse reply, correction, grammar explanation, practice task
- save interaction in MemoryService
- return dict:
    {
      "reply": str,
      "correction": str,
      "explanation": str,
      "practice": str,
      "metadata": {...}
    }

ConversationEngine.build_prompt:
- If path="general": friendly tutor
- If path="workplace": adopt persona based on profession
- If path="yki": neutral examiner style
- Inject:
    - user past errors (optional)
    - profession vocabulary if workplace
    - YKI format rules if yki

ConversationEngine.postprocess_response:
- split AI reply into structured fields using markers like:
  <reply>, <correction>, <explanation>, <practice>


======================================================================
GRAMMAR ENGINE IMPLEMENTATION
======================================================================
GrammarEngine.analyze:
- detect:
    missing case endings (e.g., -n, -a/-ä, -ssa/-ssä)
    incorrect verb type conjugation
    object case confusion
    partitive vs genitive errors
- return list of errors with:
    { "token": "...", "error_type": "...", "details": "..." }

GrammarEngine.classify_errors:
- group errors into:
    "case"
    "verb"
    "agreement"
    "word_order"
    "spelling"

GrammarEngine.generate_explanation:
- provide simple CEFR-A2/B1 level reasoning
- include 1–2 example corrections


======================================================================
PROGRESSIVE DISCLOSURE ENGINE IMPLEMENTATION
======================================================================
ProgressiveDisclosureEngine.compute_support_level:
- if accuracy < 50% or hesitation high: return 0
- if accuracy 50–75%: return 1
- if accuracy > 75%: return 2
- if ideal conditions: return 3 (memory mode)

ProgressiveDisclosureEngine.mask_text:
- level 1: hide endings → e.g. "talo___"
- level 2: hide verbs → replace with ____ markers

ProgressiveDisclosureEngine.enable_memory_mode:
- return only topic + conversation goal, no text


======================================================================
PRONUNCIATION ENGINE IMPLEMENTATION
======================================================================
PronunciationEngine.analyze_audio:
- accept transcript and expected text
- detect vowel length mismatches ("tuli" vs "tuuli")
- detect consonant length mismatches ("muta" vs "mutta")
- detect stress rhythm issues
- compute score 0–4

PronunciationEngine.generate_report:
- return dict:
    {
      "score": int,
      "vowel_issues": [...],
      "consonant_issues": [...],
      "rhythm": "..."
    }


======================================================================
WORKPLACE ENGINE IMPLEMENTATION
======================================================================
WorkplaceEngine.load_profession_module:
- load from workplace_scenarios.json

WorkplaceEngine.generate_scenario:
- retrieve scenario template
- fill placeholders with AI
- produce:
   { "ai_role": "...", "setup": "...", "expected_phrases": [...] }

WorkplaceEngine.evaluate_response:
- compute vocabulary coverage
- check for politeness markers
- check correctness
- produce score 0–4 with improvement suggestions


======================================================================
YKI ENGINE IMPLEMENTATION
======================================================================
YKIEngine.evaluate_speaking:
- fluency: count words + sentence length
- accuracy: grammar_engine.analyze
- vocab: count unique tokens
- coherence: simple task-matching score

YKIEngine.map_scores_to_cefr:
- if avg < 1.5 → A2.1
- if avg < 2.3 → A2.2
- if avg < 3.0 → B1.1
- else → B1.2

YKIEngine.evaluate_writing:
- detect grammar issues
- evaluate structure
- measure vocabulary diversity
- evaluate task completion

Return CEFR band + explanations.


======================================================================
LESSON ENGINE IMPLEMENTATION
======================================================================
LessonEngine.get_lessons:
- load lesson metadata based on path + level

LessonEngine.get_lesson_content:
- return vocab + dialogue + exercises

LessonEngine.evaluate_answer:
- compare user text to expected patterns
- give correction + score


======================================================================
PERSONALIZATION + ANALYTICS
======================================================================
PersonalizationService.generate_learning_plan:
- use grammar logs to detect weakest areas
- use pronunciation logs for phoneme issues
- recommend:
    next lessons
    vocabulary packs
    YKI practice tasks

AnalyticsService.log_event:
- store JSON blob per event

AnalyticsService.get_user_summary:
- compile weekly usage stats


======================================================================
SUBSCRIPTIONS + MEMORY
======================================================================
SubscriptionService.get_user_tier:
- return tier from DB

SubscriptionService.enforce:
- raise exception if feature not allowed

MemoryService:
- load last 10 message pairs
- save new message
────────────────────────────────────────
────────────────────────────────────────

⭐ GANTT CHART TIMELINE (v1.0 → v2.0)
(Text-based so you can paste into docs or project managers easily)

WEEKS →    1 2 3 4 5 6 7 8 9 10 11 12 | 13 14 15 16 | 17 18 19 20 | 21 22 23 24
VERSION
---------------------------------------------------------------------------------
v1.0  MVP Core               █████████████
v1.1  Quality Upgrade                     █████████
v1.2  Töihin v1 (3 fields)                            ██████████
v1.3  YKI Speaking v1                                        ███████
v1.4  Analytics + Plan v1                                         ███████
v1.5  Payments + Retention                                             ███████
v1.6  Töihin v2 (10 fields)                                                   ███████████
v1.7  YKI Writing + Full YKI                                                          ███████
v2.0  Full Platform                                                                           █████████████
Simplified milestones:

Month 1–2: MVP, quality foundation

Month 3–4: Töihin + YKI features

Month 5–6: Analytics, subscriptions, B2B foundations

Month 7–8: Full YKI + Workplace mastery

Month 9: v2.0 enterprise version

────────────────────────────────────────
────────────────────────────────────────

⭐ FULL TESTING STRATEGY FOR PUHIS (Unit, Integration, AI Evaluation)
This strategy ensures your app behaves consistently while using AI.

⭐ 1. UNIT TESTS (Python + Jest)
Backend Unit Tests
Test each engine in isolation:

GrammarEngine tests:
case detection

verb forms

explanations produce text

PronunciationEngine tests:
vowel detection

consonant detection

ProgressiveDisclosure tests:
masking rules

level decision logic

WorkplaceEngine tests:
scenario loading

scenario evaluation scoring

YKIEngine tests:
fluency scoring

CEFR mapping logic

Frontend Unit Tests (Jest)
API utils

Conversation UI rendering

Microphone button behavior

Settings state management

⭐ 2. INTEGRATION TESTS
Backend Integration:
/conversation

/workplace/scenario

/yki/speaking

/lessons

/subscription

Test:

JSON format

Error handling

Latency under 500ms

Frontend Integration:
microphone → STT → conversation → TTS

workplace roleplay flow

YKI speaking exam timer

⭐ 3. AI EVALUATION TESTS (VERY IMPORTANT)
Define a gold dataset of 20 sample user responses with expected:

grammar errors

pronunciation issues

YKI bands

Run:

pytest ai_eval/
Check that:

GrammarEngine explanation is consistent

YKI band prediction is within ±1 sub-band

Pronunciation score consistency is stable

⭐ 4. LOAD TESTING (K6)
500 concurrent speaking sessions

200 workplace scenario sessions

200 YKI tests simultaneously

Target throughput:

≥ 50 req/s

Target latency:

P95 < 800ms

⭐ 5. MANUAL QA FOR VOICE FEATURES
10 accents tested

background noise test

speed talking test

long pause test

⭐ 6. SECURITY TESTING
JWT expiry

rate limiting

prompt injection attempts

policy bypass attempts

────────────────────────────────────────
────────────────────────────────────────

⭐ COMPLETE — You now have:
✔ Full MEGA Cursor Script
✔ Full MEGA Codex Script
✔ Full Gantt Chart Timeline
✔ Complete Testing Strategy
This is the entire PUHIS build system from v1.0 → v2.0, architected and implementable by Cursor and Codex with no ambiguity.



