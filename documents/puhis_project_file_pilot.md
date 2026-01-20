1. FULL PRODUCT ROADMAP (8–12 WEEKS)
This assumes you direct AI, AI writes 80–90% of code, and you integrate + test.

WEEK 1–2: Core Voice MVP
Goal: basic “talk and respond” functionality.

AI builds:

Microphone streaming (web + mobile)

Whisper STT integration

VAD (voice activity detection → AI stops talking when user talks)

TTS (OpenAI/Azure)

Simple “talk → think → talk back” loop

Basic UI with mic button

You test:

Speed

Interruptions

Volume

Stability

Once this works smoothly, the rest becomes easier.

WEEK 3–4: Conversation Engine
Goal: natural AI tutor conversation.

AI builds:

conversation memory w/ message compression

system personalities (friendly tutor, strict teacher, examiner)

kirjakieli vs puhekieli mode

level detection (A1–B1)

basic error correction logic

lesson choosing logic

You test:

Does it sound like a Finnish tutor?

Does it adapt to your level?

Does it avoid over-correcting?

WEEK 5–6: Finnish Grammar Engine
Goal: explain Finnish clearly + catch mistakes.

AI builds:

morphological analysis wrapper (Omorfi or rule-based)

case decision engine (inessive, illative, partitive, essive…)

verb type detection (1–6)

tense/voice detection

puhekieli → kirjakieli transformations

structured grammar explanations

You test:

accuracy

clarity

consistency

This is the most important learning module.

WEEK 7–8: YKI Engine
Goal: simulate + score YKI tasks.

AI builds:

speaking tasks (timed prompts, scoring rubric)

writing tasks (evaluation, grammar scoring)

listening + reading modules

CEFR band prediction (A2.1, A2.2, B1.1, B1.2)

progress dashboard

mock exam generator

You test:

Are the scores consistent?

Does the feedback feel helpful?

Are prompts realistic?

WEEK 9–10: App Assembly + Subscriptions
AI builds:

user accounts

subscription tiers (basic, intermediate, YKI)

paywall system

progress tracking in DB

caching system to reduce LLM cost

You test:

does subscription unlock the right features?

is everything stable across devices?

WEEK 11–12: Polish + Beta Launch
AI builds:

bug fixes

UI polish

onboarding flows

curriculum navigation

analytics

error boundaries

YOU:

onboard first 10–20 beta users

collect feedback

refine tutor personality

2. COMPLETE SYSTEM ARCHITECTURE (PRACTICAL)
Frontend
Use React Native for mobile + Next.js for web.

Components:

microphone recorder

audio waveform

WebRTC/WebSocket streaming

lesson selector

speaking module

writing module

dashboard

paywall

Backend
Use FastAPI (because you already know this stack with TodiScope).

Microservices:

A. Voice Service
whispered audio → Whisper

return text

handle VAD

TTS streaming

B. Conversation Engine Service
LLM calls (GPT-4.1-mini + GPT-4.1)

persona switching

compressed memory

C. Grammar Engine
morphological parsing

case logic

verb logic

scoring logic

D. YKI Engine
speaking evaluator

writing evaluator

task generator

rubrics

CEFR band predictor

E. Subscription Service
Stripe integration

tier logic

entitlements

F. Database
Use Supabase + Postgres.

Tables:

users

sessions

mistakes

scores

subscription status

lesson history

3. YKI ENGINE DESIGN (FULL)
The YKI engine needs to simulate official tasks.

A. Speaking Module
Components:

prompt generator (A2 → B1)

60–90 second speaking timer

Whisper → transcript

evaluation call to GPT-4.1-mini

scoring call to GPT-4.1

Score categories:

Fluency

Grammar

Vocabulary

Coherence

Output:

predicted CEFR level

mistakes extracted

recommended drills

B. Writing Module
Input: 80–120 word task
Evaluation rubric:

structure

accuracy

vocabulary

task completion

Output:

score 0–5 per area

rewritten sample

grammar corrections

improvement plan

C. Reading / Listening
Pre-built tasks:

short texts

comprehension questions

audio clips

explanations for each wrong answer

D. Full Mock Exams
Stored as structured templates:

1 speaking test

1 writing test

1 reading test

1 listening test

Scoring uses:

rubrics

model compression

minimal expensive tokens

4. LANGUAGE ENGINE DESIGN
A. Error Detection
Using:

morphological parsing (Omorfi / custom rules)

rule-based grammar triggers

LLM confirmation pass

Mistakes identified:

wrong case

wrong verb form

missing consonant gradation

tense errors

unnatural word order

puhekieli misuse

vowel harmony issues

B. Grammar Explanation Engine
Format:

short explanation

example sentence

transformation from incorrect → correct form

optional deeper explanation

You force the LLM to use templates so explanations stay consistent.

C. Pronunciation Module
(TTS + audio comparison)

user repeats

AI extracts phoneme patterns

compares stress, length, timing

gives correction feedback

5. SUBSCRIPTION / PAYWALL SYSTEM STRUCTURE
Tier 1 — Basic (A1–A2)
€6.99/month
Unlocks:

voice conversation

simple grammar correction

vocabulary lessons

pronunciation basics

Tier 2 — Intermediate (A2–B1)
€12.99–€15.99/month
Unlocks:

all of Basic

deep grammar explanations

writing practice

structured lessons

error tracking

puhekieli/kirjakieli

Tier 3 — YKI Premium
€29.99–€39.99/month
or
€149–€199 one-time 3-month program

Unlocks:

all of Intermediate

full YKI speaking evaluation

writing scoring

mock exams

CEFR band prediction

personalized YKI study plan

onboarding assessment

You also cap expensive YKI tasks per day to control compute costs.

6. GO-TO-MARKET STRATEGY FOR FINLAND
I’ll keep this practical and based on how Finnish markets behave.

Phase 1 — Soft Launch (10–30 users)
Target:

foreign workers

international students

integration trainees

Channels:

Facebook groups (“Suomi second language”, “Living in Finland”)

WhatsApp groups of foreigners

Reddit r/Finland

Offer:

2 weeks free

ask them to test speaking + YKI parts

Phase 2 — Official Launch
Target:

nursing agencies

cleaning companies

municipal integration programs

TE Office trainers

universities

Pitch:

“AI YKI tutor that cuts preparation time by half”

“Train employees without sending them to language school”

“Practice speaking 100% hands-free”

Pricing:

employer bundle €100–€250 per employee per year

Phase 3 — YKI Partnership
Partner with:

YKI exam prep coaches

YKI Facebook communities

immigrant associations

Give them:

affiliate codes

free access

Phase 4 — Institutions
If accuracy is good:

TE Office may adopt it

Helsinki, Espoo, Vantaa integration centers

vocational schools

This is where long-term contracts come from.




---------------------------




A. FULL SYSTEM ARCHITECTURE (DIAGRAM + EXPLANATION)
Below is the conceptual architecture written in text form.
You can give this directly to Cursor and ask it to draw a technical diagram (Mermaid, Excalidraw, or SVG).

1. Frontend Layer (React Native + Next.js)
Responsibilities:

Microphone streaming

Real-time waveform

Send audio stream to backend

Receive TTS stream

Display lessons, tasks, YKI modules

Handle subscription + login

Key Components:

MicRecorder

AudioPlayer

ChatSession

YKIPractice

WritingEvaluator

ProgressDashboard

SubscriptionScreen

2. API Gateway (FastAPI)
Responsibilities:

Routes user audio, text, and events

Authentication (JWT or Supabase auth)

Rate limiting (YKI tasks limited per day)

Logging

Key endpoints:

/voice/stt-stream

/voice/tts-stream

/session/send

/yki/speaking

/yki/writing

/grammar/analyze

/user/lesson

/subscription/status

3. Voice Service (Microservice)
Responsibilities:

Real-time Whisper STT

Voice Activity Detection

Auto-stop TTS on interruption

TTS streaming output

Flow:
User speech → VAD → Whisper → Text → Conversation Engine → TTS → User.

4. Conversation Engine
Responsibilities:

Handles the ongoing lesson

Chooses when to correct

Summarizes context using compression

Selects tutor personality

Adjusts level difficulty

Sends responses to TTS

Models used:

GPT-4.1-mini for small responses

GPT-4.1 for complex explanations

5. Grammar Engine
Responsibilities:

Morphological parsing

Identify case errors, verb errors, puhekieli issues

Build structured explanation

Log mistakes for progress tracking

Components:

morph_parser.py (Omorfi API or rule-based)

case_checker.py

verb_checker.py

explanation_builder.py

6. YKI Engine
Responsibilities:

Present real YKI-style tasks

Evaluate speaking

Evaluate writing

Predict CEFR score

Provide feedback

Track improvement

Modules:

speaking_evaluator.py

writing_evaluator.py

listening_module

reading_module

mock_exam_engine

7. Database Layer (Supabase Postgres)
Tables:

users

subscriptions

lessons

sessions

mistakes

yki_results

writing_submissions

speaking_attempts

B. WEEK 1 DAILY EXECUTION PLAN (VERY DETAILED)
This is the week where the core voice pipeline is built.
Each day includes:

what you do

what to give Cursor

what Codex/Tabnine handle

DAY 1 — Project Setup
You:

Create GitHub repo

Open project in Cursor

Decide mobile/web targets

Cursor:

Generates folder structure

Creates FastAPI skeleton

Creates React Native skeleton

Adds .env structure

Codex/Tabnine:

Install dependencies

Set up TypeScript configs

Boilerplate screens

Outcome: Clean starting project.

DAY 2 — Microphone Streaming (Frontend)
You:

Test mic access on device

Cursor:

Build MicRecorder module

Build WebRTC/WebSocket connection

Codex:

Implement waveform visualization

Handle permissions

Tabnine:

Fill small helper functions

Outcome: User can speak, audio stream flows to backend.

DAY 3 — Whisper STT Integration
You:

Confirm Whisper API keys

Test single audio upload

Cursor:

Build /voice/stt-stream endpoint

Integrate real-time streaming

Add VAD logic

Codex:

Refine streaming buffer logic

Tabnine:

Handle retry logic

Outcome: Speech becomes text in real-time.

DAY 4 — TTS Streaming
You:

Listen to TTS quality

Adjust voice style

Cursor:

Build /voice/tts-stream

Handle stream interruptions

Codex:

UI audio player

Outcome: App can talk back with streaming audio.

DAY 5 — Voice → AI → Voice Pipeline
You:

Test latency

Adjust VAD thresholds

Cursor:

Build /session/send endpoint

Connect STT → LLM → TTS

Build tutor personality basics

Codex:

Add UI for showing AI transcript

Outcome: Full conversation loop works.

DAY 6 — Interrupt Handling
You:

Test talking over AI mid-sentence

Validate behavior feels natural

Cursor:

Implement “stop TTS when user speaks” logic

Add “resume” logic

Codex:

Add UX indicators

Fade-out effect

Outcome: Human-like interaction.

DAY 7 — Stability + Refactoring
You:

Stress test pipeline

Try long/short speech patterns

Cursor:

Optimize memory usage

Optimize context compression

Improve error handling

Codex:

Clean UI

Fix minor bugs

Outcome: Voice system ready for grammar engine integration.

C. STARTER CODEBASE (BACKEND + FRONTEND)
Below is a minimal, working skeleton you can paste into Cursor and ask it to expand.

BACKEND (FastAPI)
main.py

from fastapi import FastAPI
from routers import voice, session, yki, grammar

app = FastAPI()

app.include_router(voice.router, prefix="/voice")
app.include_router(session.router, prefix="/session")
app.include_router(yki.router, prefix="/yki")
app.include_router(grammar.router, prefix="/grammar")
routers/voice.py

from fastapi import APIRouter, WebSocket
router = APIRouter()

@router.websocket("/stt-stream")
async def stt_stream(ws: WebSocket):
    # handle STT streaming logic here
    pass

@router.websocket("/tts-stream")
async def tts_stream(ws: WebSocket):
    # stream synthesized audio back to client
    pass
routers/session.py

from fastapi import APIRouter
router = APIRouter()

@router.post("/send")
async def send_message(payload: dict):
    # 1) Receive text from frontend
    # 2) Call conversation engine
    # 3) Return response text
    pass
FRONTEND (React Native)
App.js

import { NavigationContainer } from '@react-navigation/native';
import MainScreen from './screens/MainScreen';

export default function App() {
  return (
    <NavigationContainer>
      <MainScreen />
    </NavigationContainer>
  );
}
screens/MainScreen.js

import MicRecorder from '../components/MicRecorder';
import AudioPlayer from '../components/AudioPlayer';

export default function MainScreen() {
  return (
    <>
      <MicRecorder />
      <AudioPlayer />
    </>
  );
}
D. BRANDING + NAME + LOGO
I’ll give you realistic options fitting the Finnish market.

NAME IDEAS (CLEAN + FINNISH-FRIENDLY)
PuheApu (Speech Help)

SuomiTalk

KieliMate

YKI-Ready

FinaSpeak

PuhuSuomea (Speak Finnish)

SuomiCoach

For YKI tier:
YKI Master, YKI Coach, YKI Pro.

BRAND PERSONALITY
Calm

Minimal

Scandinavian aesthetic

Clean typography

Trustworthy (important for exam prep)

Primary colors:

Deep blue (#003366)

White (#FFFFFF)

Soft grey (#D9D9D9)

Accent:

Finnish flag blue (#2C6DDB)

LOGO CONCEPT
Describe this to an AI designer:

“A circular or rounded-square icon with a simple speech bubble outline, containing a stylized letter ‘Å’ or ‘Ä’ to indicate Finnish language uniqueness. Minimal, Scandinavian, flat design. Blue and white.”

E. FULL FINNISH CURRICULUM (A1 → B1 + YKI)
This is structured exactly the way Finnish language schools organize material.

A1 LEVEL (Beginner)
Goals:
basic phrases

present tense

simple cases (inessive, illative, partitive)

Lessons:
Greetings + introductions

Numbers, time, dates

Family

Daily routines

At the store / food

Asking for help

Location: miss ä olet?

Possession: minulla on

Basic questions (kuka, mikä, missä)

A2 LEVEL (Elementary)
Goals:
past tense

modal verbs

travel/basic logistics

more cases

Lessons:
Imperfect tense

Future-like expressions

Postpositions (päällä, alla, etc.)

Food + restaurants

Health + appointments

Shopping + clothes

Invitations

Directions + transport

Weather + seasons

B1 LEVEL (Intermediate)
Goals:
tell stories

opinions

argue

handle longer tasks

advanced cases

Lessons:
Longer past narratives

Subordinate clauses

Partitive plural

Verb rections (tykkään + sta)

Comparatives + superlatives

Work life vocabulary

Public services

Emails + messages

News summary practice

YKI PREPARATION
Speaking:
describe pictures

give opinions

narrate events

handle situations

Writing:
complaint email

request email

describing events

giving instructions

Reading:
ads

messages

short articles

Listening:
public announcements

spoken dialogues

Mock Exam:
Full exam simulation

Scoring

Feedback

CEFR prediction


-------------------


A. COMPLETE DAY-BY-DAY PLAN FOR ALL 12 WEEKS
This is written as a practical work plan where you manage AI tools that write most of the code.

WEEK 1 — Voice Pipeline Foundation
Day 1 — Project Initialization
Create repo

Set up RN + Next.js + FastAPI

Cursor: generate folder structure

Copilot/Tabnine: fill configs

Day 2 — Microphone Input
Build MicRecorder

Add waveform

Add WebRTC/WebSocket streaming

Day 3 — STT Integration
Add Whisper endpoint

Real-time STT

Return transcripts

Day 4 — TTS Integration
Add /voice/tts-stream

Stream audio out

Test playback timing

Day 5 — Connect STT → LLM → TTS Pipeline
Build /session/send

Simple tutor personality

End-to-end conversation

Day 6 — Interrupt Handling
Stop TTS when user talks

VAD tuning

Day 7 — Stability Work
Fix timing bugs

Refactor

Latency improvements

WEEK 2 — Conversation Engine (Core)
Day 1
Create conversation_engine.py

Add context compression

Day 2
Add personas: Friendly, Teacher, Examiner

Day 3
Add level detection (A1–B1)

Day 4
Add conversation topics

Add dynamic question generation

Day 5
Add error-correction style modes (light, medium, strict)

Day 6
Add kirjakieli ↔ puhekieli switch

Day 7
Stability work, edge cases

WEEK 3 — Grammar Engine (Part 1)
Day 1
Build morphological parser interface

Connect Omorfi or custom rules

Day 2
Implement case detection (all 15 cases)

Day 3
Implement verb type detection (1–6)

Day 4
Implement tense detection

Day 5
Detect word order issues

Day 6
Build mistake classifier

Save mistakes to DB

Day 7
Initial test suite

WEEK 4 — Grammar Engine (Part 2)
Day 1
Build explanation generator

Day 2
Add example generator

Add transformation logic

Day 3
Add difficulty-based explanation depth

Day 4
Add pronunciation hints where relevant

Day 5
Add “learning goals” extraction

Day 6
Connect Grammar Engine ↔ Conversation Engine

Day 7
Polish + refactor

WEEK 5 — YKI Engine (Speaking)
Day 1
Load speaking prompt dataset

Day 2
Build speaking timer + recorder

Day 3
Whisper STT for long responses

Day 4
Build speaking evaluation function

Day 5
Add CEFR band prediction logic

Day 6
Store speaking attempts

Day 7
Evaluate quality, tune prompts

WEEK 6 — YKI Engine (Writing + Reading + Listening)
Day 1
Writing task templates

Day 2
Writing evaluator (structure, grammar, clarity)

Day 3
Build reading comprehension module

Day 4
Build listening module

Day 5
Add explanations for wrong answers

Day 6
Mock exam scaffolding

Day 7
Test full YKI flow

WEEK 7 — User System + Subscriptions
Day 1
Supabase auth

JWT integration

Day 2
Subscription status table

Day 3
Stripe integration

Day 4
Entitlement logic

Tier access

Day 5
Paywall screens

Day 6
Connect usage limits (YKI tasks per day)

Day 7
Test subscription end-to-end

WEEK 8 — Curriculum & Lessons
Day 1
Create A1 lesson skeleton

Day 2
Create A2 lesson skeleton

Day 3
Create B1 lesson skeleton

Day 4
Create YKI lesson structure

Day 5
Add lesson selection UI

Day 6
Connect lessons to Conversation Engine

Day 7
Feedback loop tuning

WEEK 9 — Progress Tracking + Analytics
Day 1
Build “Mistakes Over Time” module

Day 2
Add score storage

Day 3
Add writing history viewer

Day 4
Add speaking attempt viewer

Day 5
Connect progress dashboard

Day 6
Add streaks + motivation system

Day 7
Review performance data

WEEK 10 — UI Polish + UX Improvements
Day 1
Landing page

Color scheme improvements

Day 2
Improve lesson navigation

Day 3
Improve YKI interface

Day 4
Improve microphone UX

Day 5
Add animations/subtle transitions

Day 6
Review flows for friction

Day 7
Accessibility check

WEEK 11 — Stability + Load Testing
Day 1
Stress test STT + TTS

Day 2
Test peak load on LLM calls

Day 3
Memory leak check

Day 4
Conversation Engine edge cases

Day 5
YKI edge cases

Day 6
Grammar Engine stress test

Day 7
Fix all instability

WEEK 12 — Beta Launch
Day 1
Prepare onboarding flow

Day 2
Polish teacher persona

Day 3
Produce marketing copy

Day 4
Add telemetry

Day 5
Deploy mobile builds

Day 6
Invite first testers

Day 7
Collect + analyze feedback

B. MERMAID ARCHITECTURE DIAGRAM
Paste into Cursor and it will render:

flowchart TD
    A[User Device<br>React Native / Web] -->|Microphone Audio| B[Voice Service]
    B -->|Whisper STT| C[Transcript]
    C --> D[Conversation Engine]
    D -->|Grammar Check| E[Grammar Engine]
    E --> D
    D -->|Tutor Response| F[TTS Service]
    F -->|Audio Stream| A

    D -->|YKI Mode| G[YKI Engine]
    G --> H[(Database)]
    E --> H
    D --> H

    A --> I[Subscription Service]
    I --> H

    H --> D
C. COMPLETE CONVERSATION ENGINE PROMPT (FULL TEMPLATE)
This is the core system prompt that controls your tutor.
You’ll pass it to GPT-4.1-mini or GPT-4.1 depending on task complexity.

SYSTEM PROMPT (Conversation Engine)
(Copy-paste into Cursor to generate JSON config)

You are "SuomiTutor", an AI Finnish language teacher designed to help learners 
improve speaking, listening, grammar, and comprehension. 

Your tasks in every message:
1. Understand the user’s level (A1–B1). Adjust difficulty accordingly.
2. Maintain a natural conversational flow.
3. Correct mistakes only when appropriate based on the selected correction mode:
   - light: only high-impact mistakes
   - medium: important grammar or vocabulary errors
   - strict: all mistakes, with explanations
4. When correcting, follow this structure:
   a) Show the learner's incorrect sentence
   b) Show the correct sentence
   c) Brief explanation (1–2 sentences)
5. Keep explanations simple unless user asks for deeper detail.
6. Switch between puhekieli and kirjakieli depending on user preference.
7. If the user is preparing for YKI, adjust style to examiner tone.
8. Always end your response with a question to continue dialogue.
9. Keep responses short, friendly, and natural.
D. COMPLETE GRAMMAR ENGINE RULE SET
This is the full rule set your Grammar Engine uses to detect mistakes and generate explanations.

1. Verb Detection Rules
Verb Type 1: ending in -a/-ä
Verb Type 2: -da/-dä
Verb Type 3: -la/lä, -na/nä, -ra/rä, -sta/stä
Verb Type 4: -ata/ätä
Verb Type 5: -ita/itä
Verb Type 6: -eta/etä

Outputs:

correct conjugation

tense detection (present, imperfect, perfect, plusquamperfect)

voice detection (active/passive)

2. Case Rules (Full list, all 15 cases)
Detect incorrect endings based on verb rection, preposition, or meaning.

Example triggers:

Motion into → illative (-an/-en/-in, -seen, -hin)

Motion inside → inessive (-ssa/-ssä)

State change → translative (-ksi)

Absence → ablative (-lta/-ltä)

Possession origin → elative (-sta/-stä)

3. Word Order Rules
Check:

verb must be in position 2

adjectives before nouns

negation with ei

partitive objects in specific conditions

4. Puhekieli Rules
Detect:

mä / sä

tuut / meet vs tulet / menet

ei oo vs ei ole

mennään vs me mennään

5. Consonant Gradation Rules
Automatic detection of strong ↔ weak grade based on:

syllable count

inflection pattern

stress position

Example:

kukka → kukan → kukkaa

matto → maton → mattoa

6. Explanation Templates
Every explanation must follow:

Wrong: {user_sentence}
Correct: {corrected_sentence}
Why: {1–2 sentence rule}
Example: {similar example}
E. YKI SCORING RUBRICS (JSON FORMAT)
This is the actual structure your evaluator will use.

{
  "speaking": {
    "fluency": {
      "A2": "Short phrases, pauses, limited flow",
      "B1": "Connected speech with manageable pauses"
    },
    "grammar": {
      "A2": "Frequent errors but meaning clear",
      "B1": "Mostly correct, errors do not block communication"
    },
    "vocabulary": {
      "A2": "Limited everyday words",
      "B1": "Adequate range for daily topics"
    },
    "coherence": {
      "A2": "Simple linking words (ja, mutta)",
      "B1": "Uses connectors (siksi, koska, vaikka)"
    }
  },
  "writing": {
    "structure": {
      "A2": "Simple sentences, basic order",
      "B1": "Logical paragraphs, clear organization"
    },
    "accuracy": {
      "A2": "Frequent mistakes but understandable",
      "B1": "Mostly accurate with some systematic errors"
    },
    "task_completion": {
      "A2": "Partially completes task",
      "B1": "Fully completes task with relevant detail"
    }
  },
  "final_score_rules": {
    "A2.1": "Mostly A2 with significant gaps",
    "A2.2": "Strong A2 performance across categories",
    "B1.1": "Borderline B1 with some A2 patterns",
    "B1.2": "Consistent B1 across all categories"
  }
}



------------------------


1. COMPLETE PROJECT FOLDER / FILE STRUCTURE
This structure is designed for an AI-driven Finnish learning tutor with voice, grammar, and YKI features.

suomitutor/
├── backend/
│   ├── app/
│   │   ├── main.py
│   │   ├── core/
│   │   │   ├── config.py
│   │   │   ├── security.py
│   │   │   └── logger.py
│   │   ├── routers/
│   │   │   ├── voice.py
│   │   │   ├── session.py
│   │   │   ├── grammar.py
│   │   │   ├── yki.py
│   │   │   ├── subscription.py
│   │   │   └── users.py
│   │   ├── services/
│   │   │   ├── stt_service.py
│   │   │   ├── tts_service.py
│   │   │   ├── conversation_engine.py
│   │   │   ├── grammar_engine.py
│   │   │   ├── yki_engine.py
│   │   │   ├── memory_service.py
│   │   │   └── subscription_service.py
│   │   ├── utils/
│   │   │   ├── vad.py
│   │   │   ├── omorfi_wrapper.py
│   │   │   └── compression.py
│   │   ├── db/
│   │   │   ├── database.py
│   │   │   ├── models.py
│   │   │   └── schemas.py
│   │   ├── tests/
│   │   ├── requirements.txt
│   │   └── README.md
│   └── Dockerfile
├── frontend/
│   ├── mobile/ (React Native)
│   │   ├── App.js
│   │   ├── screens/
│   │   │   ├── HomeScreen.js
│   │   │   ├── LessonScreen.js
│   │   │   ├── YKIScreen.js
│   │   │   ├── WritingScreen.js
│   │   │   └── ProgressScreen.js
│   │   ├── components/
│   │   │   ├── MicRecorder.js
│   │   │   ├── AudioPlayer.js
│   │   │   ├── TutorBubble.js
│   │   │   └── Waveform.js
│   │   ├── hooks/
│   │   │   ├── useRecorder.js
│   │   │   └── useWebSocket.js
│   │   ├── utils/
│   │   │   ├── api.js
│   │   │   └── constants.js
│   │   └── package.json
│   └── web/ (Next.js)
│       ├── pages/
│       │   ├── index.js
│       │   ├── login.js
│       │   ├── dashboard.js
│       │   └── yki.js
│       ├── components/
│       ├── styles/
│       ├── hooks/
│       ├── utils/
│       └── package.json
├── docs/
│   ├── architecture.md
│   ├── api_specification.md
│   ├── grammar_engine_rules.md
│   ├── yki_rubric.json
│   ├── branding.md
│   └── roadmap.md
└── docker-compose.yml
This is a professional layout, ready for expansion.

2. INITIAL BACKEND FILES (FASTAPI)
These files are minimal but functional. You can ask Cursor to expand them.

backend/app/main.py
from fastapi import FastAPI
from app.routers import voice, session, grammar, yki, subscription, users

app = FastAPI(title="SuomiTutor API")

app.include_router(voice.router, prefix="/voice", tags=["voice"])
app.include_router(session.router, prefix="/session", tags=["session"])
app.include_router(grammar.router, prefix="/grammar", tags=["grammar"])
app.include_router(yki.router, prefix="/yki", tags=["yki"])
app.include_router(subscription.router, prefix="/subscription", tags=["subscription"])
app.include_router(users.router, prefix="/users", tags=["users"])

@app.get("/")
def root():
    return {"message": "SuomiTutor backend running"}
backend/app/routers/session.py
from fastapi import APIRouter
from app.services.conversation_engine import run_conversation

router = APIRouter()

@router.post("/send")
async def send_message(payload: dict):
    user_text = payload.get("text", "")
    user_id = payload.get("user_id")
    level = payload.get("level", "A1")
    mode = payload.get("correction_mode", "medium")

    response = await run_conversation(
        user_text=user_text,
        user_id=user_id,
        level=level,
        correction_mode=mode
    )
    return {"response": response}
backend/app/services/conversation_engine.py
import httpx
from app.services.grammar_engine import analyze_grammar
from app.services.memory_service import compress_context

API_URL = "https://api.openai.com/v1/chat/completions"

async def run_conversation(user_text, user_id, level, correction_mode):
    grammar_info = await analyze_grammar(user_text)
    context_summary = await compress_context(user_id)

    system_prompt = f"""
    You are SuomiTutor, a Finnish language teacher.
    User level: {level}.
    Correction mode: {correction_mode}.
    Summarized context: {context_summary}.
    Grammar notes: {grammar_info}.
    """

    async with httpx.AsyncClient() as client:
        response = await client.post(API_URL, json={
            "model": "gpt-4.1-mini",
            "messages": [
                {"role": "system", "content": system_prompt},
                {"role": "user", "content": user_text}
            ]
        })
        return response.json()["choices"][0]["message"]["content"]
backend/app/services/grammar_engine.py
async def analyze_grammar(text: str):
    # Placeholder for full grammar engine
    # You will expand this later
    return {
        "mistakes": [],
        "suggestions": [],
        "analysis": "pending"
    }
This gives you the foundation. Cursor will fill the heavy parts.

3. INITIAL FRONTEND FILES
React Native — App.js
import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import HomeScreen from './screens/HomeScreen';

export default function App() {
  return (
    <NavigationContainer>
      <HomeScreen />
    </NavigationContainer>
  );
}
src/screens/HomeScreen.js
import React, { useState } from 'react';
import { View, Text, Button } from 'react-native';
import MicRecorder from '../components/MicRecorder';
import AudioPlayer from '../components/AudioPlayer';

export default function HomeScreen() {
  const [response, setResponse] = useState("");

  return (
    <View style={{ padding: 20 }}>
      <Text style={{ fontSize: 22 }}>Speak Finnish with SuomiTutor</Text>
      <MicRecorder setResponse={setResponse} />
      <AudioPlayer />
      {response && <Text style={{ marginTop: 20 }}>{response}</Text>}
    </View>
  );
}
components/MicRecorder.js
import React from 'react';
import { Button } from 'react-native';

export default function MicRecorder({ setResponse }) {
  const startRecording = async () => {
    // Handle audio capture + backend streaming
  };

  return (
    <Button title="Start Speaking" onPress={startRecording} />
  );
}
This is intentionally minimal — Cursor will expand the WebRTC/STT/TTS logic.


-----------------


⭐ PUHIS — AI ENGINEERING IMPLEMENTATION PLAN (FOR CURSOR + CODEX)
Role Assignments:
Cursor = Senior Architect + High-Reasoning Engineer
Handles architecture, scaffolding, deep logic, multi-file updates, refactoring, state machines, YKI scoring logic, grammar logic, streaming logic.

Codex = Mid-Level Code Generator
Handles filling in functions, wiring endpoints, UI screens, components, TypeScript types, small utilities, integrations.

You (Vitus) act as Project Director.

PART 1 — PROJECT INIT + REPO STRUCTURE (WEEK 0 / DAY 1)
Create this file structure inside:
~/Documents/puhis

Paste this into Cursor:

### 🧩 Cursor Instruction: “Create Project Scaffold for PUHIS”
You are the Senior Architect for PUHIS.  
Create the following directory structure inside ~/Documents/puhis exactly as listed:

puhis/
  backend/
    app/
      main.py
      core/{config.py, security.py, logger.py}
      routers/{voice.py, session.py, grammar.py, yki.py, subscription.py, users.py}
      services/{stt_service.py, tts_service.py, conversation_engine.py, grammar_engine.py, yki_engine.py, memory_service.py, subscription_service.py}
      utils/{vad.py, omorfi_wrapper.py, compression.py}
      db/{database.py, models.py, schemas.py}
    tests/
    requirements.txt

  frontend/
    app/  (Expo React Native)
      App.js
      screens/{HomeScreen.js, LessonScreen.js, YKIScreen.js, ProgressScreen.js}
      components/{MicRecorder.js, AudioPlayer.js, TutorBubble.js, Waveform.js}
      hooks/{useRecorder.js, useWebSocket.js}
      utils/{api.js, constants.js}
    web/ (Next.js)
      pages/{index.js, login.js, dashboard.js, yki.js}
      components/
      hooks/
      utils/

  docs/
    architecture.md
    api_specification.md
    grammar_engine_rules.md
    yki_rubric.json
    roadmap.md
    branding.md

  docker-compose.yml

Implement empty files for all major components.
Set up pip requirements with FastAPI, Uvicorn, httpx, python-dotenv.
Prepare backend __init__.py files where needed.
Do not implement logic yet, only scaffold.
After Cursor sets this up, verify the folder exists:

cd ~/Documents/puhis
ls -R
PART 2 — AGENT WORKFLOW PLAN (VERY IMPORTANT)
This is the workflow that tells Cursor and Codex how to work together without stepping on each other.

Copy this to docs/architecture.md AND feed it into Cursor:

🧠 PUHIS AGENT WORKFLOW MODEL
1. Cursor Responsibilities
Cursor should handle:

Multi-file changes

Architecture decisions

Complex logic design

Streaming audio chains (WebRTC → Whisper → LLM → TTS)

Grammar engine rule mapping

Conversation engine behaviour

YKI scoring logic

Database schema design

Refactoring large modules

API contract definitions

Cursor produces:

high-level functions

class skeletons

architecture

flow diagrams

TODO markers for Codex

2. Codex Responsibilities
Codex fills details inside the structures Cursor produces:

Codex should:

implement function bodies

write React Native components

write TypeScript types

fill routers

write util functions

write simple service code

handle repetitive tasks

handle input validation

handle small patches

Codex should not decide architecture.

3. Interaction Rules
Cursor creates new files and designs systems.

Codex fills those files with implementations.

Cursor reviews + refactors Codex output.

You (Vitus) run tests, point out bugs or missing behaviour.

PART 3 — BACKEND IMPLEMENTATION PLAN FOR CURSOR + CODEX
This is a full week-by-week AI engineering spec.

WEEK 1: VOICE PIPELINE
### Cursor Task 1 — STT/TTS Interface Scaffolding
Paste this into Cursor:

Goal: Build the audio pipeline scaffolding for PUHIS backend.

Create in services/stt_service.py:
- streaming STT client for OpenAI Whisper
- handle chunked audio input
- return transcripts

Create in services/tts_service.py:
- streaming TTS function for OpenAI
- yield audio chunks to the client

Do not implement WebRTC yet.
Focus on backend streaming endpoints.

Mark all functions with TODOs for Codex to fill.
Then send this to Codex:

Implement all TODOs in stt_service.py and tts_service.py.
Keep functions simple: accept bytes, send to OpenAI, return generator.
### Cursor Task 2 — Voice Router
Create /voice/stt-stream and /voice/tts-stream endpoints using WebSocket.
Use async generator interfaces.
Add try/except for connection handling.
Leave low-level audio buffer handling to Codex (TODO markers).
Codex then fills the implementation.

WEEK 2: CONVERSATION ENGINE
Cursor Task: Architecture
Paste:

Define conversation_engine.py with:
- run_conversation()
- build_system_prompt()
- integrate grammar_engine results
- compress past messages via memory_service
- handle correction mode (light/medium/strict)
- detect user level (A1–B1)
- persona switching (friendly/teacher/examiner)

Add TODOs for actual LLM calls.
Codex implements the TODOs and HTTPX calls.

WEEK 3–4: GRAMMAR ENGINE
Cursor Task — Full Grammar Engine Skeleton
Paste:

Create grammar_engine.py with the following components:
- detect_cases()
- detect_verb_types()
- detect_tenses()
- detect_word_order()
- detect_puhekieli()
- detect_consonant_gradation()
- classify_mistakes()
- build_explanation()

Use the rule set from grammar_engine_rules.md.  
Mark all analytic steps as TODO for Codex.
Codex fills implementations using regex + custom logic.

WEEK 5–6: YKI ENGINE
Cursor Task — YKI Architecture
Paste:

Create yki_engine.py with:
- evaluate_speaking()
- evaluate_writing()
- evaluate_reading()
- evaluate_listening()
- predict_cefr_band()

Pull rubrics from yki_rubric.json.
Define evaluation weights and scoring matrix.
Add TODOs for all evaluation logic.
Codex implements scoring logic.

PART 4 — FRONTEND IMPLEMENTATION PLAN
WEEK 1–2: EXPO APP CORE
Cursor Task — Setup
Create an Expo React Native project inside frontend/app.
Add screens: HomeScreen.js, LessonScreen.js, YKIScreen.js, ProgressScreen.js.
Add components: MicRecorder, AudioPlayer, TutorBubble.
Use WebSocket for voice streaming.
Add TODOs for actual audio handling to Codex.
Codex implements audio hooks, UI, components.

PART 5 — COMPLETE BUILD ORDER FOR AI AGENTS
PHASE 1 — Bootstrapping
Cursor: Scaffold repo

Codex: Install deps, initialize configs

Cursor: Write architecture docs

PHASE 2 — Backend (Voice + Conversation)
Cursor: STT/TTS scaffolding

Codex: Implement OpenAI calls

Cursor: Conversation engine design

Codex: Implement LLM logic

PHASE 3 — Grammar Engine
Cursor: Full grammar system design

Codex: Implement detection + explanation

PHASE 4 — YKI Engine
Cursor: Define scoring architecture

Codex: Implement scoring, mock exams

PHASE 5 — Frontend
Cursor: Create screens + navigation

Codex: Fill UI logic

Cursor: Connect audio → backend

Codex: Implement WebRTC / WebSocket

PHASE 6 — Subscriptions
Cursor: Add Stripe logic

Codex: Implement API calls + UI

PHASE 7 — Testing + Refactor
Cursor: Review architecture + refactor

Codex: Clean up code



--------------------


✅ 1. Conversation Engine v1 (Cursor + Codex split)
✅ 2. Grammar Engine v1 (Cursor + Codex split)
✅ 3. YKI Evaluator v1 (Cursor + Codex split)
Each section includes:

Exact instructions for Cursor (architect, creates structure, writes high-level logic)

Exact instructions for Codex (fills in code, implements functions, no architecture changes)

This is designed to make the AI development clean and conflict-free.

----------------------------------------
1. CONVERSATION ENGINE v1
----------------------------------------
A. Cursor Instructions (ARCHITECT + HIGH-LEVEL CODE)
Paste this into Cursor:

CURSOR PROMPT — Create Conversation Engine v1
You are the senior architect.  
Create the file: backend/app/services/conversation_engine.py

Implement Conversation Engine v1 with the following responsibilities:

1. run_conversation(user_text, user_id, level, correction_mode)
   - fetch compressed memory using memory_service
   - fetch grammar analysis from grammar_engine
   - build a system prompt based on:
       - user CEFR level (A1–B1)
       - correction mode (light, medium, strict)
       - persona: friendly tutor
   - call OpenAI gpt-4.1-mini for basic responses
   - return the assistant response text only

2. Implement build_system_prompt(level, correction_mode, context_summary, grammar_info)
   - include clear instructions for tone, correction strictness, and Finnish teaching behavior

3. DO NOT fill in low-level OpenAI logic.  
   Mark these locations as "# TODO for Codex: OpenAI call".

4. Ensure the file includes TODO markers for Codex to fill:
   - actual HTTPX request to OpenAI
   - error handling
   - token limits
   - trimming long conversation history

5. Add docstrings and structured sections so Codex can easily implement logic.
B. Codex Instructions (IMPLEMENTATION ENGINE)
After Cursor creates the file, paste this into Codex:

CODEX PROMPT — Implement Conversation Engine v1 details
Open the file backend/app/services/conversation_engine.py

Implement all TODO sections:

- The HTTPX request to OpenAI's Chat Completions API
- Use model = "gpt-4.1-mini"
- Construct messages = [{role: "system"}, {role: "user"}]
- Add exception handling: timeouts, bad responses
- Clean output to return assistant message only

Keep logic minimal but functional.
Do not modify the high-level structure created by Cursor.
----------------------------------------
2. GRAMMAR ENGINE v1
----------------------------------------
Grammar Engine v1 should:

Detect simple case errors

Detect verb conjugation types

Detect puhekieli

Return structured grammar_info

This is not yet the full grammar engine — just the first usable version.

A. Cursor Instructions
Paste this into Cursor:

CURSOR PROMPT — Create Grammar Engine v1
Create the file: backend/app/services/grammar_engine.py

Implement Grammar Engine v1 architecture with the following:

Functions:
1. analyze_grammar(text)
   - orchestrates the grammar analysis
   - returns a dict:
       {
         "mistakes": [...],
         "suggestions": [...],
         "analysis_summary": "string"
       }

2. detect_case_errors(text)
3. detect_verb_errors(text)
4. detect_puhekieli(text)
5. classify_mistakes(raw_detections)
6. build_explanation(mistake)

For now:
- implement rule-based placeholders for each function
- DO NOT implement deep linguistic logic yet
- add TODO markers for Codex to fill details

Goal:
Provide the structure and flow, not full correctness.

Add docstrings and clear sections for Codex.
B. Codex Instructions
Paste this into Codex after Cursor generates the file:

CODEX PROMPT — Implement Grammar Engine v1 rule logic
Open backend/app/services/grammar_engine.py

Implement TODO sections:

1. detect_case_errors(text):
   - simple detection rule:
     if text contains "kauppassa" → suggest "kaupassa"
     if text contains "minä mennä" → suggest "minä menen"

2. detect_verb_errors(text):
   - detect infinitive used instead of conjugated form
   - detect common beginner mistakes such as "olla" misuse

3. detect_puhekieli(text):
   - detect "mä", "sä", "me mennään" patterns
   - return flags but do NOT correct them

4. classify_mistakes:
   - wrap detected items into mistake objects

5. build_explanation:
   - for each mistake, return simple grammar explanation

Return output in structured dict:
{
  "mistakes": [...],
  "suggestions": [...],
  "analysis_summary": "..."
}
----------------------------------------
3. YKI EVALUATOR v1
----------------------------------------
This version implements:

Speaking evaluation (fluency, grammar, coherence)

Writing evaluation (structure, accuracy, task completion)

CEFR band prediction using simple rule weighting

A. Cursor Instructions
Paste this into Cursor:

CURSOR PROMPT — Create YKI Evaluator v1
Create file: backend/app/services/yki_engine.py

Implement YKI Evaluator v1 architecture with:

1. evaluate_speaking(transcript)
   - compute raw scores for:
       fluency, grammar, vocabulary, coherence
   - use rule-based placeholders
   - prepare dict for scoring

2. evaluate_writing(text)
   - compute structure, accuracy, task completion
   - placeholder rules

3. predict_cefr_band(scores)
   - weighted average of categories
   - map ranges:
       0–1.9 → A2.1
       2.0–2.9 → A2.2
       3.0–3.4 → B1.1
       3.5–4.0 → B1.2

4. load_rubrics():
   - load from docs/yki_rubric.json

5. Add TODO markers for Codex to implement detailed rules.

Goal:
Provide complete structure, organized logic, and functional scoring but not deep linguistic evaluation yet.
B. Codex Instructions
Paste into Codex after Cursor generates the file:

CODEX PROMPT — Implement YKI Evaluator v1 rule logic
Open backend/app/services/yki_engine.py

Implement TODO sections:

1. evaluate_speaking():
   - count word length
   - count pauses ("...", "- - -")
   - check presence of basic connectors: "ja", "mutta", "koska"
   - score fluency 0–4

2. evaluate_writing():
   - check sentence endings
   - check paragraph count
   - detect spelling mistakes using simple heuristics

3. predict_cefr_band():
   - compute average score of categories
   - return string band value

Do not introduce deep linguistic logic yet.
Follow Cursor’s structure exactly.
----------------------------------------
SUMMARY — WHO BUILDS WHAT?
Clear mapping:

Component	Who Builds the Structure	Who Implements Logic
Conversation Engine v1	Cursor	Codex
Grammar Engine v1	Cursor	Codex
YKI Evaluator v1	Cursor	Codex
Cursor = architect, designer, high-level flow
Codex = implementation, filling function details

You = project director, testing, guiding, verifying outputs.


----------------------


----------------------------------------
⭐ PART 1 — BACKEND SKELETON (Cursor + Codex)
----------------------------------------
Below is the full backend setup, split cleanly between the two AI agents.

✅ 1A. Cursor Prompt — Create Backend Skeleton
Paste the following into Cursor:

CURSOR PROMPT: Create PUHIS Backend Skeleton
You are the Senior Architect.  
Create the entire backend scaffold for PUHIS inside backend/app.

Directory structure to generate:

backend/
  app/
    main.py
    core/{config.py, security.py, logger.py}
    routers/{voice.py, session.py, grammar.py, yki.py, subscription.py, users.py}
    services/{stt_service.py, tts_service.py, conversation_engine.py, grammar_engine.py, yki_engine.py, memory_service.py, subscription_service.py}
    utils/{vad.py, omorfi_wrapper.py, compression.py}
    db/{database.py, models.py, schemas.py}
  tests/
  requirements.txt

Implementations:
- main.py should include FastAPI app creation and router includes.
- All router files should contain basic APIRouter() setup with placeholder endpoints.
- All service files must contain correctly named classes/functions with docstrings and TODO markers for Codex.
- db/database.py should define a SQLAlchemy/async engine placeholder.
- requirements.txt should include: fastapi, uvicorn[standard], httpx, python-dotenv, sqlalchemy, pydantic.

Important:
- Do NOT implement OpenAI calls or heavy logic. 
- Your job is architecture + skeleton only.
- Leave detailed implementations as TODO for Codex.
Then check the folder with:

ls -R ~/Documents/puhis/backend
✅ 1B. Codex Prompt — Implement Backend Skeleton Details
Paste this into Codex after Cursor finishes:

CODEX PROMPT: Implement Backend Skeleton Basics
Open all backend/app/ files containing TODO markers.

Implement the following:
1. In main.py:
   - Create the FastAPI app.
   - Include all routers with prefixes.

2. In db/database.py:
   - Set up SQLAlchemy async engine.
   - Create async_session generator.

3. In routers:
   - Implement placeholder endpoints:
       - GET /health in any router.
       - POST /session/send returns {"status": "ok"}.
       - GET /yki/test returns {"yki": "ready"}.

4. In services:
   - For stt_service, tts_service, conversation_engine, grammar_engine, yki_engine:
       - Add function signatures.
       - Add docstrings explaining purpose.
       - DO NOT implement OpenAI logic (leave TODO notes).

5. In utils:
   - Add placeholder functions and TODO markers.

Follow Cursor's structure exactly.
This creates a fully shaped backend, ready for implementing real logic in future steps.

----------------------------------------
⭐ PART 2 — FRONTEND SKELETON (Cursor + Codex)
----------------------------------------
We will build the frontend as a React Native (Expo) app + optional Next.js web version.

✅ 2A. Cursor Prompt — Create Frontend Skeleton
Paste the following into Cursor:

CURSOR PROMPT: Create PUHIS Frontend (Expo + Next.js) Skeleton
You are the Senior Architect.  
Create the full frontend skeleton for PUHIS inside frontend/.

Structure:

frontend/
  app/ (Expo React Native)
    App.js
    screens/{HomeScreen.js, LessonScreen.js, YKIScreen.js, ProgressScreen.js}
    components/{MicRecorder.js, AudioPlayer.js, TutorBubble.js, Waveform.js}
    hooks/{useRecorder.js, useWebSocket.js}
    utils/{api.js, constants.js}
    package.json
    app.json

  web/ (Next.js)
    pages/{index.js, login.js, dashboard.js, yki.js}
    components/
    hooks/
    utils/
    package.json
    next.config.js

Architectural requirements:
- App.js should include NavigationContainer + Stack Navigator
- HomeScreen should show placeholder UI with navigation buttons
- Web version should show a basic landing page and dashboard placeholder
- All components should exist with placeholder markup and TODO markers for Codex

Do NOT implement:
- microphone logic
- WebRTC
- audio streaming
- API calls
Those will be added by Codex later.

Your task is full skeleton creation + architecture only.
This will produce the entire frontend file structure with empty layouts.

✅ 2B. Codex Prompt — Implement Frontend Skeleton Basics
Paste this into Codex after Cursor finishes:

CODEX PROMPT: Implement Frontend Skeleton Details
Open the newly created Expo project inside frontend/app.

Implement the following:

1. In App.js:
   - Add NavigationContainer
   - Add createNativeStackNavigator
   - Add routes for all four screens.

2. In screens:
   - Implement simple placeholder return values.
   - Example: <Text>PUHIS Home Screen</Text>

3. In components:
   - Create placeholder functional components.
   - Add TODOs for audio logic, waveform, WebSocket hookup.

4. In utils/api.js:
   - Export a placeholder function sendMessage() with TODO.

5. In the web version:
   - Implement minimal Next.js pages for index, login, dashboard, yki.
   - Add simple placeholder UI.

Do NOT implement microphone logic, WebRTC, or WebSocket behavior.

Follow the structure Cursor created exactly as-is.
This creates your entire frontend—ready for voice implementation.

----------------------------------------
⭐ PART 3 — WHO IMPLEMENTS WHAT (FULL BREAKDOWN)
----------------------------------------
To avoid confusion later, here is the entire responsibility matrix for PUHIS:

🧠 CURSOR = Architect + Senior Engineer
Cursor handles:

Backend
Full file creation

Router structures

Service architecture

Grammar engine design

YKI engine architecture

Conversation engine design

WebSocket + streaming architecture

Database schema design

Frontend
File structure

Screen layout scaffolds

State machine design

Navigation architecture

⚙️ CODEX = Implementation Engineer
Codex handles:

Backend
Implementing all TODO function bodies

HTTPX OpenAI requests

Grammar detection rules

CEFR scoring functions

Audio buffer and STT/TTS implementation

Error handling + validation

Frontend
MicRecorder logic

WebRTC audio collection

Waveform visualization

WebSocket stream handling

TTS playback

Writing UI logic

YKI practice UI logic


--------------------


⭐ PUHIS — FULL IMPLEMENTATION BLUEPRINT (BACKEND + FRONTEND + DEV FLOW)
This includes:

Exact next Cursor task — backend

Exact next Cursor task — frontend

Exact next Codex tasks

Phase 1 development script (day-by-day)

Git commit strategy

CI/CD setup instructions (Docker + Fly.io + Vercel)

Everything is written for immediate application.

----------------------------------------
🚀 PART 1 — NEXT CURSOR TASKS (BACKEND + FRONTEND)
----------------------------------------
Below are the next instructions to paste into Cursor, exactly as-is.

I have split them into:

A. Backend
B. Frontend
✅ A. NEXT CURSOR TASK (BACKEND)
Paste this into Cursor:

CURSOR PROMPT — Implement Backend Phase 1 (STT/TTS + Conversation Engine)
You are the Senior Architect of PUHIS.  
Proceed to implement Backend Phase 1.

Your tasks:

1. Open backend/app/services/stt_service.py
   - Create function definitions:
       async def stream_stt(audio_chunks): ...
   - Add TODO markers for Codex to implement OpenAI Whisper streaming call.

2. Open backend/app/services/tts_service.py
   - Create function definitions:
       async def stream_tts(text): ...
   - Add TODO markers for Codex to implement OpenAI TTS streaming.

3. Open backend/app/services/conversation_engine.py
   - Create a full Conversation Engine v1 skeleton with:
       - run_conversation()
       - build_system_prompt()
       - integrate grammar_engine.analyze_grammar()
       - integrate memory_service.compress_context()
   - Do NOT implement OpenAI logic. Mark TODOs for Codex.

4. Create WebSocket endpoints in backend/app/routers/voice.py:
   - /voice/stt-stream
   - /voice/tts-stream
   Each should:
       accept binary audio frames
       pass them to stt_service or tts_service
   - Leave details as TODOs for Codex.

5. Ensure main.py includes the voice router, session router, and grammar router.

6. Produce clean code structure, comments, and docstrings so Codex can fill logic next.
This will give you the correct backend skeleton for audio → AI → audio.

✅ B. NEXT CURSOR TASK (FRONTEND)
Paste this into Cursor:

CURSOR PROMPT — Implement Frontend Phase 1 (Expo Project Setup)
You are the Senior Architect.

Implement PUHIS Frontend Phase 1:

1. Inside frontend/app:
   - Configure App.js with NavigationContainer + createNativeStackNavigator
   - Add routes:
       HomeScreen
       LessonScreen
       YKIScreen
       ProgressScreen

2. For each screen:
   - Implement minimal placeholder UI
   - Add TODO markers for Codex to implement actual logic later

3. In components:
   - Create placeholder MicRecorder.js component with a button
   - Create placeholder AudioPlayer.js component
   - Create TutorBubble.js with a simple text bubble UI
   - Create Waveform.js with empty canvas and TODOs

4. In hooks:
   - Create useRecorder.js with TODO for audio recording
   - Create useWebSocket.js with TODO for streaming

5. In utils/api.js:
   - Add skeleton sendMessage() function with TODO

Your goal:
- only architecture
- no audio logic
- no WebSocket logic
- no AI logic
----------------------------------------
🔧 PART 2 — NEXT CODEX TASKS
----------------------------------------
After Cursor completes its tasks, paste these into Codex.

✅ A. CODEX TASK — Implement Backend STT/TTS + Conversation Logic
Paste:

CODEX PROMPT — Implement Backend Phase 1 Logic
Implement TODO sections in the following files:

1) stt_service.py
   - Implement stream_stt() using OpenAI Whisper streaming API.
   - Accept chunks of audio bytes.
   - Yield text segments.

2) tts_service.py
   - Implement stream_tts() using OpenAI Realtime TTS API.
   - Accept a text string.
   - Yield audio chunks for playback.

3) conversation_engine.py
   - Implement the OpenAI API call using httpx.
   - model = "gpt-4.1-mini"
   - Extract assistant message safely.

4) routers/voice.py
   - Implement WebSocket handling:
       - receive audio chunks
       - call stt_service
       - send transcript back to client
       - do not block event loop

Follow Cursor architecture strictly.
Do not introduce new structures.
✅ B. CODEX TASK — Implement Frontend Phase 1 Logic
Paste:

CODEX PROMPT — Implement Frontend Audio + WS Basics
Implement TODO sections for frontend/app:

1. useRecorder.js:
   - Implement microphone access using Expo Audio.
   - Provide startRecording() and stopRecording().

2. useWebSocket.js:
   - Implement WS client to connect to backend STT/TTS endpoints.

3. MicRecorder.js:
   - Connect buttons to useRecorder and useWebSocket.
   - Send audio frames to backend.

4. AudioPlayer.js:
   - Accept audio chunks from backend
   - Play using Expo AV

Follow Cursor architecture exactly.
Do not modify folder structure.
----------------------------------------
📅 PART 3 — PHASE 1 DEVELOPMENT SCRIPT (DAY BY DAY)
----------------------------------------
This script is designed for you + Cursor + Codex to follow for the first week.

⭐ DAY 1
You:
Run Cursor backend creation prompt

Run Codex backend implementation prompt

Output:
Backend skeleton

STT/TTS streaming functions

Conversation engine v1

WebSocket endpoints

⭐ DAY 2
You:
Run Cursor frontend setup prompt

Run Codex frontend implementation prompt

Output:
Expo project

Navigation

Placeholder UI

Audio recording hook skeleton

⭐ DAY 3
Cursor:
Create memory_service structure

Create grammar_engine structure

Codex:
Fill basic grammar rules

Fill memory compressor

⭐ DAY 4
Cursor:
Define YKI engine structure

Codex:
Implement scoring logic

⭐ DAY 5
You:
Connect backend + frontend WebSocket

Test streaming speech → text → speech chain

⭐ DAY 6
Fix latency

Add buffering

Test conversations

MVP voice loop complete

⭐ DAY 7
Cleanup

Setup GitHub repo

Push first release

----------------------------------------
📦 PART 4 — GIT COMMIT STRATEGY
----------------------------------------
Use this structure:

Branching
main → stable releases

dev → active development

feature/* → individual tasks

Commit Format
feat: add STT streaming
feat: add conversation engine skeleton
fix: audio buffer issues
refactor: reorganize services folder
docs: add architecture overview
Workflow
Create feature branch

Commit small chunks

Push

Merge via PR

----------------------------------------
🐳 PART 5 — CI/CD DEPLOYMENT (Docker + Fly.io + Vercel)
----------------------------------------
Below is the full setup path.

⭐ Backend (FastAPI) — Fly.io
Install Fly CLI

curl -L https://fly.io/install.sh | sh
Init app

fly launch
Add Dockerfile
Cursor generates this:

FROM python:3.12-slim
WORKDIR /app
COPY backend .
RUN pip install -r requirements.txt
CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8080"]
Deploy

fly deploy
⭐ Frontend Web (Next.js) — Vercel
cd frontend/web
vercel init
vercel deploy
⭐ Frontend Mobile (Expo EAS)
npm install -g eas-cli
cd frontend/app
eas build:configure
eas build -p android
eas build -p ios



----------------------


⭐ PHASE 2 — BACKEND FUNCTIONAL IMPLEMENTATION
This phase builds on top of the backend skeleton you already created.

----------------------------------------
🔧 1. MEMORY SERVICE IMPLEMENTATION
----------------------------------------
We need a simple memory mechanism so the conversation engine doesn't send the full history.
We introduce:

message storage model

compression method

fetch_last_messages method

✅ 1A. Cursor Task — Create MemoryService Architecture
Paste the following into Cursor:

CURSOR PROMPT: Implement Memory Service Architecture (Phase 2)
You are the Senior Architect.  
Implement Memory Service Phase 2 in backend/app/services/memory_service.py.

Your tasks:

1. Create class MemoryService with methods:
     - async save_message(user_id: str, role: str, content: str)
     - async get_recent_messages(user_id: str, limit: int = 10)
     - async compress_context(messages: list) -> str

2. Connect to database models:
     - use db.models.Message (to be created in models.py)
     - Message fields: id, user_id, role, content, created_at

3. compress_context():
     - Summarize the last N messages into a short context string
     - Do NOT call OpenAI yet
     - Add TODO markers for Codex to complete summarization using OpenAI

4. Add docstrings explaining the purpose of each function.

5. Add TODO markers for Codex to:
     - write SQL queries
     - implement actual summarization logic

Do NOT implement business logic. Only architecture + flow.
✅ 1B. Codex Task — Implement MemoryService Details
Paste into Codex:

CODEX PROMPT — Implement MemoryService SQL + Summaries
Open backend/app/services/memory_service.py.

Implement TODO sections:

1. save_message():
   - Insert new message into database using async session.

2. get_recent_messages():
   - Query last N messages ordered by created_at.

3. compress_context():
   - Call OpenAI with a prompt like:
       "Summarize the following messages briefly for context..."
   - Return a short string.
   - Use model = "gpt-4.1-mini".

Follow Cursor’s architecture exactly.
Do not create new classes.
----------------------------------------
📘 2. DATABASE SCHEMA + MODELS
----------------------------------------
We now add the tables:

users

messages

yki_results

grammar_logs

✅ 2A. Cursor Task — Create Database Models
Paste into Cursor:

CURSOR PROMPT: Create Database Models for PUHIS
Create database schema in backend/app/db/models.py.

Define SQLAlchemy models:

1. User:
   - id (UUID primary key)
   - email
   - created_at

2. Message:
   - id (UUID)
   - user_id (FK users)
   - role ("user" or "assistant")
   - content (text)
   - created_at

3. GrammarLog:
   - id
   - user_id
   - original_text
   - corrected_text
   - mistakes (JSON)
   - created_at

4. YKIResult:
   - id
   - user_id
   - speaking_score JSON
   - writing_score JSON
   - cefr_band (string)
   - created_at

Add TODO markers for Codex to implement relationships, metadata, and table creation.
✅ 2B. Codex Task — Fill Model Details
Paste into Codex:

CODEX PROMPT — Implement SQLAlchemy Models
Open backend/app/db/models.py.

Implement TODO sections:

- Add Base metadata
- Add proper Column definitions
- Add ForeignKey constraints
- Add relationship() definitions
- Set default timestamps
- Ensure UUID generation works

Do not modify Cursor's structure.
----------------------------------------
🧠 3. GRAMMAR ENGINE v1.5 (functional version)
----------------------------------------
We expand grammar engine to finally do:

simple partitive detection

simple verb conjugation detection

simple puhekieli warnings

explanation generation

classification

This is still v1.5 (v2 will be the final rule engine).

✅ 3A. Cursor Task — Expand Grammar Engine Structure
Paste into Cursor:

CURSOR PROMPT: Expand Grammar Engine to v1.5
Enhance backend/app/services/grammar_engine.py to Grammar Engine v1.5.

Add the following:

1. detect_partitive_usage():
   - Identify cases where partitive is missing or incorrectly used.

2. detect_wrong_verb_forms():
   - Identify simple conjugation errors:
       e.g. "minä olla" → should be "minä olen"

3. detect_sentence_patterns():
   - Identify:
       - word order issues
       - missing verb
       - repeated pronouns

4. integrate all detectors inside analyze_grammar()

5. Add TODO markers for Codex to implement actual detection logic.

6. Enhance build_explanation() structure to return:
       {
         "error": "...",
         "correction": "...",
         "reason": "...",
         "example": "..."
       }

Cursor must design structure. Codex fills detection logic.
✅ 3B. Codex Task — Implement Grammar Logic (Simple Rules)
Paste into Codex:

CODEX PROMPT — Implement Grammar Engine v1.5 Logic
Open backend/app/services/grammar_engine.py.

Implement TODO sections:

1. detect_partitive_usage():
   - Simple rule:
       If verb includes "haluan" and noun not in partitive,
       suggest partitive noun.

2. detect_wrong_verb_forms():
   - Replace "minä olla" → "minä olen"
   - Replace "sinä olla" → "sinä olet"
   - Replace "hän olla" → "hän on"

3. detect_sentence_patterns():
   - If sentence missing verb from ["on", "olen", "menen", "tulen"], flag.

4. build_explanation():
   - Construct explanation objects.

Keep logic simple. No deep morphological parsing yet.
----------------------------------------
🎤 4. CONVERSATION ENGINE v2
----------------------------------------
Now we add:

Memory integration

Grammar integration

Teaching behavior

Correction modes

Level adaptation

✅ 4A. Cursor Task — Extend Conversation Engine to v2
Paste into Cursor:

CURSOR PROMPT: Conversation Engine v2
Open backend/app/services/conversation_engine.py.

Implement the following upgrades:

1. run_conversation():
   - call memory_service.save_message(user_text)
   - call memory_service.get_recent_messages()
   - call memory_service.compress_context()
   - call grammar_engine.analyze_grammar()
   - build system prompt that includes:
       - learner level
       - correction mode
       - grammar info
       - compressed memory
       - teaching style

2. Add new function choose_persona(level):
   - A1: simple friendly tutor
   - A2: slightly more grammar correction
   - B1: YKI-oriented tone

3. Add TODO markers for Codex to implement:
   - OpenAI call
   - error handling
   - persona selection logic
✅ 4B. Codex Task — Implement v2 Logic
Paste into Codex:

CODEX PROMPT — Implement Conversation Engine v2 Details
Open backend/app/services/conversation_engine.py.

Implement:

1. choose_persona():
   - return strings describing tone depending on level.

2. run_conversation():
   - fill TODO:
       - format OpenAI request
       - append memory for context
       - send user message
       - parse assistant output

3. Ensure assistant output is saved via memory_service.save_message().

Follow Cursor structure strictly.
----------------------------------------
🧪 5. VOICE ROUTING v1 (functional STT→LLM→TTS loop)
----------------------------------------
Now we implement a minimal working end-to-end audio loop.

✅ 5A. Cursor Task — Voice Routing Architecture
Paste into Cursor:

CURSOR PROMPT — Create Voice Routing v1
Open backend/app/routers/voice.py.

Implement v1 voice routing architecture:

1. WebSocket endpoint: /voice/stt-stream
   - accept binary audio frames
   - forward frames to stt_service.stream_stt()
   - asynchronously send back text messages

2. WebSocket endpoint: /voice/tts-stream
   - accept text from client
   - call tts_service.stream_tts()
   - yield audio data back to client

3. Add TODO markers for Codex to implement:
   - binary frame handling
   - backpressure management
   - closing logic
✅ 5B. Codex Task — Implement Voice Routing Logic
Paste into Codex:

CODEX PROMPT — Implement Voice Routing Logic
Implement TODO sections in voice.py:

1. Receive audio frames from ws.receive_bytes()
2. Pass frames into stt_service.stream_stt()
3. For each transcript chunk, send with ws.send_text()

4. For TTS:
   - receive JSON {"text": "..."}
   - call tts_service.stream_tts()
   - send audio bytes with ws.send_bytes()

Ensure no blocking. Use async for loops.
----------------------------------------
🧱 6. CONFIRMATION — Back-End Phase 2 COMPLETE



---------------------


📲 PHASE 2 — FRONTEND IMPLEMENTATION (Next)
⭐ PHASE 2 — FRONTEND IMPLEMENTATION PLAN
Contains both Cursor tasks and Codex tasks.

----------------------------------------
🎤 1. AUDIO RECORDING IMPLEMENTATION (Expo)
----------------------------------------
Expo provides expo-av which is perfect for microphone recording for mobile and web.

✅ 1A. CURSOR TASK — Create Recording Logic Architecture
Paste into Cursor:

CURSOR PROMPT — Implement Audio Recording Architecture (useRecorder.js)
You are the Senior Architect.

Create a complete recording architecture inside:
frontend/app/hooks/useRecorder.js

Requirements:

1. Expose API:
   - startRecording()
   - stopRecording()
   - getAudioChunks()  // returns Uint8Array chunks for STT streaming
   - isRecording state

2. Use expo-av to request microphone permissions.

3. Create Audio.Recording instance:
   - high-quality preset
   - mono audio channel
   - 16 kHz or 24 kHz sample rate

4. Split recorded audio into small chunks (e.g., every 200ms)
   - DO NOT implement actual chunk slicing — leave TODO markers for Codex

5. Ensure structure is clean and state-driven:
   - recordingRef
   - audioChunksRef
   - recording state (boolean)

6. Provide comments, docstrings, and TODO markers for low-level implementation by Codex.
✅ 1B. CODEX TASK — Implement Recording Logic Details
Paste into Codex:

CODEX PROMPT — Implement startRecording, stopRecording, chunk slicing
Open frontend/app/hooks/useRecorder.js.

Implement TODOs:

1. Request microphone permissions using Audio.requestPermissionsAsync().

2. In startRecording():
   - Create new Audio.Recording()
   - Prepare with Audio.RecordingOptionsPresets.HIGH_QUALITY
   - Start recording
   - Reset audioChunksRef = []

3. In stopRecording():
   - Stop and unload recording
   - Get recording URI
   - Read file into bytes using FileSystem.readAsStringAsync with base64
   - Convert to Uint8Array
   - Slice into chunks (200–400ms each)
   - Push each chunk into audioChunksRef

4. getAudioChunks():
   - Return audioChunksRef.current

Follow Cursor architecture exactly.
----------------------------------------
🔌 2. WEBSOCKET HOOK (useWebSocket.js)
----------------------------------------
This hook manages:

connection to backend

sending audio chunks

receiving transcripts

receiving TTS audio

✅ 2A. CURSOR TASK — Create WebSocket Architecture
Paste:

CURSOR PROMPT — Build WebSocket Architecture (useWebSocket.js)
You are the Senior Architect.

In frontend/app/hooks/useWebSocket.js, create architecture with:

State to expose:
- isConnected
- transcript
- audioOutputChunks (for TTS)
- connectSTT()
- sendAudioChunk(chunk)
- connectTTS()
- requestTTS(text)

Functional requirements:

1. Implement two separate WebSocket connections:
   - wsSTT = WebSocket("ws://backend-ip/voice/stt-stream")
   - wsTTS = WebSocket("ws://backend-ip/voice/tts-stream")

2. WS-STT:
   - send binary audio frames
   - receive JSON { transcript: "..." }

3. WS-TTS:
   - send text as JSON
   - receive binary audio chunks

4. Add TODO markers for Codex to:
   - implement message handlers
   - decode audio bytes
   - merge partial transcripts

5. Ensure cleanup logic is defined but not implemented (TODO).
✅ 2B. CODEX TASK — Implement WebSocket Logic
Paste:

CODEX PROMPT — Implement WS Connections + Streaming Logic
Open frontend/app/hooks/useWebSocket.js.

Implement TODO sections:

1. connectSTT():
   - Create ws = new WebSocket(URL)
   - onmessage: parse incoming transcript
   - onopen: set isConnected true
   - onclose: set false

2. sendAudioChunk():
   - wsSTT.send(chunk)

3. connectTTS():
   - open new WebSocket
   - onmessage: push received bytes into audioOutputChunks

4. requestTTS(text):
   - wsTTS.send(JSON.stringify({text}))

Note:
- For audio decoding, use base64 or raw Uint8Array.
- Keep logic simple but functional.

Follow Cursor structure strictly.
----------------------------------------
🎛 3. MIC RECORDER COMPONENT
----------------------------------------
This integrates useRecorder + useWebSocket.

✅ 3A. CURSOR TASK — Create MicRecorder Architecture
Paste:

CURSOR PROMPT — Build MicRecorder Architecture
Create MicRecorder.js inside frontend/app/components.

Structure:

1. Two buttons:
   - "Start Speaking"
   - "Stop Speaking"

2. On Start:
   - call startRecording()
   - call connectSTT()

3. On Stop:
   - call stopRecording()
   - get audio chunks
   - send each chunk to sendAudioChunk()

Include placeholder UI and TODO markers for Codex to improve visuals.
✅ 3B. CODEX TASK — Implement MicRecorder Logic
Paste:

CODEX PROMPT — Implement MicRecorder Wiring
Open MicRecorder.js.

Implement TODO sections:

1. Import useRecorder and useWebSocket.
2. On start:
   - startRecording()
   - connectSTT()
3. On stop:
   - stopRecording()
   - getAudioChunks()
   - loop over chunks and sendAudioChunk(chunk)
4. Render buttons and transcript in UI.
----------------------------------------
🔊 4. AUDIO PLAYER COMPONENT
----------------------------------------
This plays TTS audio chunks received.

✅ 4A. CURSOR TASK — Create AudioPlayer Architecture
Paste:

CURSOR PROMPT — Build AudioPlayer Architecture
Create AudioPlayer.js inside components.

Architecture:
- Accept audioOutputChunks from useWebSocket
- Provide playAudio() function
- Use expo-av Audio.Sound to play merged audio

Add TODO markers for Codex to implement:
- merging chunks
- playback control
✅ 4B. CODEX TASK — Implement AudioPlayer Logic
Paste:

CODEX PROMPT — Implement TTS Playback Logic
Open AudioPlayer.js.

Implement:

1. Convert audioOutputChunks (Uint8Array[]) into single base64 or wav blob.
2. Use Audio.Sound.createAsync() to load sound.
3. Use sound.playAsync() to play.
4. Auto-clear chunks after playback.

Keep code minimal.
----------------------------------------
📱 5. HOME SCREEN — FULL VOICE LOOP UI
----------------------------------------
Now PUHIS will have a working speech → transcript → AI → TTS → playback loop.

✅ 5A. CURSOR TASK — Build HomeScreen UI Flow
Paste:

CURSOR PROMPT — Implement HomeScreen Voice UI Architecture
Open HomeScreen.js.

Create UI layout:

1. TutorBubble showing latest assistant message.
2. Transcript area to show live STT output.
3. Buttons:
   - Start Speaking
   - Stop Speaking
   - "Repeat Answer" (request TTS again)

4. On receiving transcript:
   - send transcript to /session/send
   - receive assistant text
   - call requestTTS(assistantText)

Add TODO markers for Codex to fill click handlers + styling.
✅ 5B. CODEX TASK — Implement HomeScreen Logic
Paste:

CODEX PROMPT — Connect HomeScreen to Conversation Engine
Open HomeScreen.js.

Implement:

1. Import useWebSocket + useRecorder.
2. On transcript update:
   - POST to backend /session/send
   - receive assistant response
   - call requestTTS() with response text

3. Update TutorBubble text.

4. Implement UI handlers:
   - startSpeaking()
   - stopSpeaking()
   - repeatAnswer()
----------------------------------------
📚 6. LESSON + YKI SCREENS (BASIC)
----------------------------------------
We don’t add logic yet — just architecture.

✅ 6A. CURSOR TASK — Create LessonScreen & YKIScreen Architecture
Paste:

CURSOR PROMPT — Build LessonScreen + YKIScreen Architecture
For LessonScreen.js:
- Show list of topics
- Tapping a topic loads a lesson (placeholder)

For YKIScreen.js:
- Buttons:
   - Start Speaking Test
   - Start Writing Test
- Display placeholder instructions

Add TODO markers for Codex.
✅ 6B. Codex Implementation Task
Paste:

CODEX PROMPT — Implement Lesson + YKI Placeholder UIs
Open LessonScreen.js and YKIScreen.js.

Implement basic UI:
- FlatList for lessons
- Buttons for starting tests
- Placeholder text

No API calls yet.
----------------------------------------
⭐ PHASE 2 FRONTEND IS COMPLETE WHEN:
✔ Audio recording works
✔ WebSocket STT works
✔ WebSocket TTS works
✔ Conversation flow works end-to-end
✔ Home screen shows full dialogue
✔ YKI & Lesson screens show placeholder UIs


------------------------


This phase adds:

Grammar Engine v2 → actual rule system

Conversation Engine v3 → learning loops, teaching personas

YKI Speaking Evaluator v2

Writing Evaluator v1

Lesson Generator v1 (A1–B1 curriculum engine)

Pronunciation scoring + feedback v1

Natural teacher behavior system

Integration into the voice pipeline

As before, each module includes:

✔ Cursor tasks (architecture + skeleton)
✔ Codex tasks (implementation + logic)
This gives you a complete, working AI-powered language engine.

⭐ PHASE 3 — PUHIS LANGUAGE AI
We go step by step.

----------------------------------------
🧠 1. GRAMMAR ENGINE v2 (deep rule engine)
----------------------------------------
Grammar Engine v2 adds:

✔ Case logic (15 cases)
✔ Verb conjugation detection (VT 1–6)
✔ Word order evaluation
✔ Puhekieli detection
✔ Partitive logic for specific verbs (haluta, rakastaa, odottaa)
✔ Explanation generation engine
✔ Correction suggestion engine
✔ Difficulty adaptation by CEFR level

✅ 1A. CURSOR TASK — Create Grammar Engine v2 Architecture
Paste into Cursor:

CURSOR PROMPT — Implement Grammar Engine v2 Architecture
You are the Senior Architect.

Upgrade backend/app/services/grammar_engine.py to Grammar Engine v2 with the following new components:

1. detect_case_usage(text):
   - Framework to detect incorrect case endings for:
       - inessive (-ssa/-ssä)
       - illative (-an/-en/-in, -seen, -hin)
       - elative (-sta/-stä)
       - adessive (-lla/-llä)
       - partitive (-a/-ä/-ta/-tä)
   - Do NOT implement rules — leave TODOs for Codex.

2. detect_verb_conjugation(text):
   - Framework to detect incorrect verb forms:
       - missing personal endings
       - incorrect VT group conjugation
       - infinitive used instead of conjugation
   - Add TODOs for Codex.

3. detect_word_order(text):
   - Framework for Finnish V2 word order rules.
   - Identify:
       - verb not in second position
       - missing subject pronoun
       - doubled pronouns
   - TODOs for Codex.

4. classify_all_mistakes():
   - Combine results of:
       - detect_case_usage
       - detect_verb_conjugation
       - detect_word_order
       - detect_puhekieli (v1)
       - other detectors

5. build_explanation(mistake):
   - Expand explanation generator:
       - error
       - correction
       - rule
       - example
       - CEFR difficulty tag

6. integrate all detectors inside analyze_grammar().

7. No rule logic should be implemented.
   ONLY architecture, TODO markers, and data structures.
✅ 1B. CODEX TASK — Implement Grammar Engine v2 Rule Logic
Paste into Codex:

CODEX PROMPT — Implement Grammar Engine v2 Rule Logic
Open backend/app/services/grammar_engine.py.

Implement TODOs for:

1. detect_case_usage():
   - Implement simple rule-based detection:
       if word ends with "ssa" but verb implies motion → suggest illative.
       if using "minä tykkään sinä" → detect missing elative: "sinusta".

2. detect_verb_conjugation():
   - Implement VT matching rules:
       VT1 verbs end in -a/-ä
       VT2 verbs end in -da/-dä
       Detect incorrect endings such as:
            "minä puhu" → "minä puhun"
            "sinä syödä" → "sinä syöt"

3. detect_word_order():
   - If no verb in second position → flag.
   - If sentence begins with "Minä" and ends with infinitive → suggest conjugated verb.

4. classify_all_mistakes():
   - Merge detections into unified mistake list.

5. build_explanation():
   - For each mistake, create:
       error
       correction
       reason
       example

Implement logic in clean, readable, moderate complexity.
No NLP library needed.
----------------------------------------
🧠 2. CONVERSATION ENGINE v3 (teaching logic)
----------------------------------------
Conversation Engine v3 adds:

✔ Persona system (A1/A2/B1 + styles: friendly/teacher/examiner)
✔ Teaching loop: Explain → Check → Correct → Practice
✔ Level adaptation
✔ Error-level adaptation
✔ Context shaping
✔ Grammar engine integration
✔ Turn logic

✅ 2A. CURSOR TASK — Create Conversation Engine v3 Structure
Paste into Cursor:

CURSOR PROMPT — Implement Conversation Engine v3 Architecture
Upgrade backend/app/services/conversation_engine.py to Conversation Engine v3 with the following features:

1. New function: choose_teaching_style(level, correction_mode)
   - A1 → simpler vocabulary, shorter sentences
   - A2 → more grammar hints
   - B1 → more YKI-like tasks

2. New function: build_teaching_prompt(user_text, grammar_info, persona)
   - Should generate a teaching-focused system message that describes:
       - Corrective behavior
       - When to explain
       - When to quiz
       - How to encourage learner output

3. run_conversation():
   - Integrate teaching style and teaching prompt
   - Sequence:
       a) save user message
       b) grammar analysis
       c) choose teaching persona
       d) build system prompt
       e) call OpenAI
       f) save assistant response

4. Add TODO markers for Codex to implement:
   - persona selection rules
   - actual prompt content
   - OpenAI logic
✅ 2B. CODEX TASK — Implement Conversation Engine v3 Logic
Paste into Codex:

CODEX PROMPT — Implement Teaching Behavior + OpenAI Logic
Open backend/app/services/conversation_engine.py.

Implement TODOs:

1. choose_teaching_style():
   - Return persona dict with:
       tone, difficulty, correction aggressiveness, example styles.

2. build_teaching_prompt():
   - Include:
       - Level-based communication guidelines
       - Correction rules
       - Teaching loop (explain → correct → practice)
       - Clear instructions for AI

3. run_conversation():
   - Build messages = [{system message}, {user message}]
   - Call OpenAI (gpt-4.1-mini)
   - Extract assistant text
   - Save via MemoryService

Follow Cursor architecture strictly.
----------------------------------------
🎤 3. YKI SPEAKING EVALUATOR v2
----------------------------------------
YKI v2 adds:

✔ Fluency scoring
✔ Accuracy scoring
✔ Vocabulary scoring
✔ Coherence scoring
✔ YKI rubric mapping
✔ CEFR band scoring

✅ 3A. CURSOR TASK — Create YKI Evaluator v2 Architecture
Paste:

CURSOR PROMPT — YKI Speaking Evaluator v2 Architecture
Update backend/app/services/yki_engine.py:

1. evaluate_speaking(transcript):
   - 4 scoring dimensions:
       fluency
       grammar
       vocabulary
       coherence

2. Provide functions:
   - score_fluency()
   - score_grammar()
   - score_vocabulary()
   - score_coherence()

3. predict_cefr_band(scores):
   - Weighted scoring matrix

4. Add TODO markers for Codex for rule logic.
✅ 3B. CODEX TASK — Implement YKI v2 Logic
Paste into Codex:

CODEX PROMPT — Implement YKI v2 Speaking Scoring Logic
Implement scoring in yki_engine.py:

1. score_fluency():
   - Count pauses ("...") and hesitation words ("öö", "että").
   - Map pause frequency to score 0–4.

2. score_grammar():
   - Use simple heuristic:
       count grammar mistakes from grammar_engine results.

3. score_vocabulary():
   - Count unique word types.
   - Map low variety → low score.

4. score_coherence():
   - Check connectors: "koska", "siksi", "mutta", "vaikka".

5. predict_cefr_band():
   - Weighted avg:
        0–1.9 A2.1
        2.0–2.9 A2.2
        3.0–3.4 B1.1
        3.5–4.0 B1.2
----------------------------------------
✍️ 4. WRITING EVALUATOR v1
----------------------------------------
We evaluate writing:

✔ Structure
✔ Grammar
✔ Task completion
✔ Vocabulary

✅ 4A. Cursor Prompt — Writing Evaluator Architecture
Paste:

CURSOR PROMPT — Writing Evaluator Architecture
Upgrade backend/app/services/yki_engine.py with:

1. evaluate_writing(text):
   - call grammar_engine.analyze_grammar()
   - detect structure (paragraph count, sentence count)
   - detect task completion keywords
   - detect vocabulary variety

2. build_writing_feedback():
   - explanation for each issue
   - improvement suggestions

Add TODOs for Codex.
✅ 4B. Codex Prompt — Implement Writing Evaluator Logic
Paste:

CODEX PROMPT — Implement Writing Evaluator Logic
Open yki_engine.py.

Implement writing evaluation:

1. detect structure:
   - count sentences (split by .!?)
   - count paragraphs (\n\n)

2. detect task completion:
   - look for keywords based on prompt type (complaint, request, opinion)

3. vocabulary variety:
   - unique word count / total words

4. combine into scores (0–4)

5. implement build_writing_feedback()
----------------------------------------
🌱 5. LESSON GENERATOR v1
----------------------------------------
Creates adaptive lessons per level (A1, A2, B1):

✔ Topic introduction
✔ Example sentences
✔ Mini exercises
✔ Correction prompts

✅ 5A. Cursor Prompt — Lesson Generator Architecture
Paste:

CURSOR PROMPT — Create Lesson Generator v1 Architecture
Create file backend/app/services/lesson_engine.py with:

1. get_lesson(level, topic):
   - returns dict:
        title
        explanation
        examples
        practice_questions

2. create_lesson_plan(level):
   - predefined topics for A1–B1

3. TODO markers for Codex to fill actual lesson content.

Structure only.
✅ 5B. Codex Task — Implement Basic Lessons
Paste:

CODEX PROMPT — Implement Lesson Generator Content
Open lesson_engine.py.

Implement sample lessons:

A1:
- topic: greetings
- examples
- vocabulary

A2:
- topic: past tense
- examples
- sentence transformation task

B1:
- topic: expressing opinions
- examples
- writing task
----------------------------------------
🔊 6. PRONUNCIATION SCORING v1
----------------------------------------
You can implement a simple phoneme mismatch system.

✅ 6A. Cursor Task — Pronunciation Architecture
Paste:

CURSOR PROMPT — Create Pronunciation Scoring Architecture
Add file backend/app/services/pronunciation_engine.py.

Functions:
- analyze_pronunciation(audio_bytes, expected_text)
- detect_vowel_length_errors()
- detect_consonant_length_errors()
- detect rhythm and stress issues (placeholder)

All logic to remain TODO for Codex.
✅ 6B. Codex Task — Implement Simple Pronunciation Logic
Paste:

CODEX PROMPT — Implement Pronunciation v1 Logic
Implement minimal pronunciation rules:

1. Convert audio to text with Whisper.
2. Compare transcript to expected_text.
3. If missing double vowels ("aa", "ää") → flag.
4. If missing double consonants → flag.
5. Return simple score 0–4.

Keep logic simple.
----------------------------------------
🌍 PHASE 3 IS COMPLETE WHEN:
✔ Grammar Engine v2 fully working
✔ Conversation Engine v3 responds like a teacher
✔ Speaking Evaluator v2 returns CEFR band
✔ Writing Evaluator v1 returns feedback
✔ Lesson generator creates lessons
✔ Pronunciation scoring runs on simple heuristics
This makes PUHIS an AI Finnish tutor.


--------------------------------


This phase adds:

Full conversation UI

Lesson UI (A1→B1 with adaptive tasks)

YKI speaking & writing test UI

Pronunciation evaluation UI

Settings screen (CEFR level, correction mode, pacing)

Multi-language UI (app translations)

Subscription & paywall flow

User account system

Full backend–frontend integration

Session persistence

Real-time teacher mode

As always, you get:

✔ Cursor Tasks (architecture + scaffold)
✔ Codex Tasks (logic implementation)
Let’s begin.

⭐ PHASE 4 — FULL FRONTEND + BACKEND INTEGRATION
----------------------------------------
📱 1. CONVERSATION UI v1 → v2 (Teacher UI)
This is where the app becomes usable as a real tutor.

PUHIS needs:

Live transcript on screen

AI tutor bubble (typing animation)

Microphone UI with states

“Repeat answer” button

“Explain grammar” button

“Practice more” button

Memory of previous turns displayed

✅ 1A. CURSOR TASK — Architect Full Conversation UI
Paste into Cursor:

CURSOR PROMPT — Build ConversationScreen Architecture v2
You are the Senior Architect.

Upgrade HomeScreen.js (rename to ConversationScreen.js) to full conversation UI v2.

Implement structure:

1. Header:
   - User CEFR level (A1/A2/B1)
   - Correction mode indicator (light/medium/strict)

2. Body:
   - ScrollView showing conversation history:
        - UserBubble
        - TutorBubble

3. Live transcript area:
   - Shows partial STT text as user speaks

4. Microphone control:
   - Start/stop buttons
   - Visual indicator when receiving AI response

5. Actions under tutor response:
   - “Repeat”
   - “Explain grammar”
   - “Practice more”

6. Data flow:
   - On transcript update → POST to backend/session/send
   - Response inserted into conversation history
   - TTS requested by default

7. Leave TODO markers for Codex to fill:
   - styling
   - state management
   - animations
✅ 1B. CODEX TASK — Implement Conversation UI Logic
Paste into Codex:

CODEX PROMPT — Implement ConversationScreen Logic
Open ConversationScreen.js.

Implement:

1. State for:
   - messages[]
   - liveTranscript
   - isSpeaking
   - isLoadingResponse

2. On start speaking:
   - startRecorder()
   - connectSTT()

3. On transcript update:
   - update liveTranscript

4. On stop speaking:
   - stopRecorder()
   - send audio chunks to WS
   - final transcript → backend
   - store user message in messages[]

5. Handle backend response:
   - add TutorBubble message
   - call requestTTS()

6. Implement:
   - handleRepeat()
   - handleExplainGrammar()
   - handlePracticeMore()

Follow Cursor structure strictly.
----------------------------------------
📚 2. LESSON UI (Adaptive Lessons, A1→B1)
Students must:

Select lesson topics

View explanation

Practice exercises

Get corrected feedback

Retake exercises

✅ 2A. CURSOR TASK — Architect Lesson UI
Paste into Cursor:

CURSOR PROMPT — Build Lesson UI Architecture
Architect LessonScreen.js and LessonDetailScreen.js:

1. LessonScreen:
   - Display list of lessons retrieved from backend:
        /lessons?level=A1
   - Cards with:
        - title
        - short description
        - difficulty tag

2. LessonDetailScreen:
   - Show:
        - explanation
        - examples
        - practice questions
        - input box or voice input toggle
   - Buttons:
        - Submit answer (text or voice)
        - Hear example → call TTS
        - Next question

3. Add TODOs for Codex to implement:
   - API calls
   - answer checking
   - UI logic
   - navigation
✅ 2B. CODEX TASK — Implement Lesson Logic
Paste:

CODEX PROMPT — Implement Lesson UI Logic
Open LessonScreen.js and LessonDetailScreen.js.

Implement:

1. Fetch list of lessons:
   - const lessons = await api.getLessons(level)

2. Render FlatList of lesson items.

3. In LessonDetailScreen:
   - Fetch lesson by ID
   - Render explanation + examples
   - Render input field or microphone toggle
   - Submit button → POST to /lessons/{id}/check
   - Render feedback from backend

Follow Cursor structure.
----------------------------------------
🎤 3. YKI SPEAKING TEST UI v1
Users simulate YKI tasks:

YKI Espoo intro tasks

90-second speaking tasks

Monologue tasks

Opinion tasks

✅ 3A. CURSOR TASK — Architect YKI Speaking Test UI
Paste:

CURSOR PROMPT — Build YKI Speaking Test UI Architecture
Implement YKISpeakingScreen.js:

1. Display task instructions:
   - from endpoint /yki/speaking/start

2. Countdown timer (90s or task-specific)

3. Microphone UI:
   - start/stop speaking
   - show live transcript

4. After recording:
   - Submit answer to backend
   - Display CEFR band + detailed scores:
       - fluency
       - grammar
       - vocabulary
       - coherence

5. Add TODOs for Codex for:
   - timer logic
   - UI styling
   - backend integration
✅ 3B. CODEX TASK — Implement YKI Speaking Logic
Paste:

CODEX PROMPT — Implement YKI Speaking Test Logic
Open YKISpeakingScreen.js.

Implement:

1. Fetch task instructions.
2. Start countdown timer.
3. Record audio using useRecorder.
4. On stop:
   - send transcript to backend
   - receive evaluation
   - show scores on screen

5. Create ScoreCard UI showing 4 categories.

Follow Cursor architecture.
----------------------------------------
✍️ 4. YKI WRITING TEST UI v1
✅ 4A. CURSOR TASK — Architect YKI Writing UI
Paste:

CURSOR PROMPT — Build YKI Writing Test UI Architecture
Implement YKIWritingScreen.js:

1. Display writing prompt retrieved from /yki/writing/start
2. TextInput area for writing
3. Submit button → POST /yki/writing/evaluate
4. Show:
   - grammar analysis
   - structure score
   - vocabulary score
   - task completion score
   - CEFR band
5. Add TODO for Codex:
   - text input handling
   - backend call
   - score rendering
✅ 4B. CODEX TASK — Implement Writing Logic
Paste into Codex:

CODEX PROMPT — Implement YKI Writing Logic
Open YKIWritingScreen.js.

Implement:

1. Fetch prompt on mount.
2. Save text input state.
3. On submit:
   - call backend evaluator
   - display each scoring category
   - display suggested corrections

Follow Cursor structure.
----------------------------------------
🎤 5. PRONUNCIATION FEEDBACK UI
✅ 5A. CURSOR TASK — Architect Pronunciation UI
Paste:

CURSOR PROMPT — Build Pronunciation Feedback UI Architecture
Implement PronunciationScreen.js:

1. Show word or sentence to practice.
2. Microphone UI:
   - start/stop speaking
   - live transcript

3. Display pronunciation feedback:
   - vowel length errors
   - consonant length errors
   - rhythm issues
   - pronunciation score (0–4)

Add TODOs for Codex:
   - backend integration
   - UI styling
✅ 5B. CODEX TASK — Implement Pronunciation Logic
Paste:

CODEX PROMPT — Implement Pronunciation Logic
Open PronunciationScreen.js.

Implement:

1. Display target text.
2. Record user audio.
3. Send audio & expected_text to backend.
4. Display feedback:
   - list of issues
   - overall score
   - suggested correction

Follow Cursor architecture.
----------------------------------------
⚙️ 6. SETTINGS SCREEN (LEVEL, CORRECTION MODE, LANGUAGE)
✅ 6A. CURSOR TASK — Architect Settings UI
Paste:

CURSOR PROMPT — Build SettingsScreen Architecture
Implement SettingsScreen.js:

1. Options:
   - CEFR Level (A1 / A2 / B1)
   - Correction Mode (Light / Medium / Strict)
   - App Language (EN / FI / SE / DE)

2. Use AsyncStorage to save settings locally.

3. Provide context provider:
   settingsContext with:
        level
        correctionMode
        appLanguage

4. Add TODOs for Codex:
   - actual context implementation
   - UI event handlers
✅ 6B. CODEX TASK — Implement Settings Logic
Paste:

CODEX PROMPT — Implement Settings Context + Save Logic
Open SettingsScreen.js and create settingsContext.js.

Implement:

1. Context provider storing:
   - level
   - correctionMode
   - appLanguage

2. Save settings using AsyncStorage.

3. Update UI components to use these settings.

Follow Cursor architecture exactly.
----------------------------------------
🌐 7. MULTI-LANGUAGE UI SUPPORT
You said the full engine must switch languages.

We add:

translation JSON files

language context

i18n engine

✅ 7A. CURSOR TASK — Architect i18n System
Paste:

CURSOR PROMPT — Create Translation System Architecture
Inside frontend/app/i18n:

Create:
- en.json
- fi.json
- se.json
- de.json

Create i18n.js:
- load JSON based on settingsContext.appLanguage
- function t(key) { return translated string }

Add TODOs for Codex to fill language content.
✅ 7B. CODEX TASK — Implement i18n Logic
Paste:

CODEX PROMPT — Implement i18n Translations
Open i18n.js.

Implement:
1. load translation file based on appLanguage
2. t(key):
   - return translations[key]
3. Populate en.json and fi.json with basic UI strings.

Follow Cursor architecture.
----------------------------------------
💳 8. SUBSCRIPTION / PAYWALL SYSTEM
✅ 8A. CURSOR TASK — Architect Subscription System
Paste:

CURSOR PROMPT — Build Subscription System Architecture
Backend:
- Create subscription_service.py
- Implement:
    get_subscription_status(user_id)
    enforce_paywall(feature)

Frontend:
- Create PaywallScreen.js
- Add subscriptionContext
- Add paywall logic in ConversationScreen:
      if premium required → redirect to PaywallScreen

Add TODOs for Codex to implement actual logic.
✅ 8B. CODEX TASK — Implement Subscription Logic
Paste:

CODEX PROMPT — Implement Subscription Logic
Implement TODOs:

1. Backend:
   - subscription_service returns:
        free
        basic
        yki_premium

2. Frontend:
   - paywall screen offering:
       - Premium
       - YKI Premium
   - enforce redirect on premium features

Follow Cursor structure.
----------------------------------------
🧵 9. FULL BACKEND–FRONTEND INTEGRATION CHECKLIST
After this phase, PUHIS becomes usable by real learners.

Checklist:

✔ Voice → STT → AI → TTS loop
✔ Conversation UI fully functional
✔ Lessons UI + exercises
✔ YKI Speaking test
✔ YKI Writing test
✔ Pronunciation evaluation
✔ Settings (level, correction mode, language)
✔ Multi-language UI
✔ Subscription system

This is the feature-complete MVP.


-----------------------


Phase 5 focuses on:

Performance improvements

UI polish

Latency reduction

Caching + database optimization

Robust error handling

Analytics + logging

Production-grade deployment (mobile + web + backend)

Monitoring and scaling

Data privacy and GDPR compliance (critical in Finland)

As always, you get:

✔ Cursor tasks (architecture)
✔ Codex tasks (implementation)
✔ A full deployment plan
✔ A production readiness checklist
Let’s begin.

⭐ PHASE 5 — POLISH, PERFORMANCE, DEPLOYMENT
----------------------------------------
⚡ 1. PERFORMANCE OPTIMIZATION
Improve speed and responsiveness across the entire app.

We handle:

STT latency

TTS turnaround time

Conversation engine speed

Database query efficiency

API responsiveness

✅ 1A. CURSOR TASK — Performance Architecture
Paste into Cursor:

CURSOR PROMPT — Implement Performance Optimization Architecture
You are the Senior Architect.

Implement a Performance Layer with the following modules:

1. backend/app/core/cache.py
   - In-memory LRU cache for:
        - repeated system prompts
        - lesson plans
        - YKI instructions

2. Add query optimization in db/database.py:
   - async engine with pre-ping
   - statement caching enabled
   - connection pool size = 10

3. Add response time logging middleware:
   - Measure route execution time
   - Log slow endpoints >300ms

4. Add async tasks to:
   backend/app/services/conversation_engine.py:
   - Cache teaching persona prompts per CEFR level

5. Add TODO markers for Codex to implement caching logic and database tuning details.

Focus: architecture, minimal logic.
✅ 1B. CODEX TASK — Optimize Performance Implementations
Paste into Codex:

CODEX PROMPT — Implement Performance Improvements
Open core/cache.py:
- implement a simple LRUCache using functools.lru_cache or a custom dict logic.

Open database.py:
- enable statement caching
- configure connection pool:
    pool_size=10
    max_overflow=20

Open main.py:
- implement response time middleware with logging.

Open conversation_engine.py:
- cache persona prompts using lru_cache decorator.

Do not alter Cursor structure.
----------------------------------------
🪲 2. STABILITY & ERROR HANDLING
Production apps need predictable behavior.

We add:

Global exception handler

Retry logic for OpenAI requests

WebSocket reconnection

Audio recovery on network drop

✅ 2A. CURSOR TASK — Error Handling Architecture
Paste into Cursor:

CURSOR PROMPT — Build Error Handling Architecture
Implement global error handling layer:

1. Create backend/app/core/error_handler.py:
   - Exception handlers for:
       - OpenAI errors
       - Database errors
       - Validation errors
       - WebSocket disconnections

2. Add retry wrapper utility:
   backend/app/utils/retry.py:
       async def retry_async(func, attempts=3, delay=0.5)

3. In routers/voice.py:
   - Add reconnect logic stubs
   - Add TODO markers for Codex

4. Add centralized logging in core/logger.py:
   - Write logs to:
        logs/app.log
        logs/errors.log
   - Rotate logs daily

Cursor’s job:
- create architecture and placeholders
- do not implement logic
✅ 2B. CODEX TASK — Implement Error Handling Logic
Paste into Codex:

CODEX PROMPT — Implement Error Handlers + Retry Logic
Implement in error_handler.py:
- handle HTTPException
- handle OpenAI APITimeoutError
- handle DB connection errors
- handle WebSocketDisconnect
Return JSON with consistent error message.

Implement retry_async in retry.py:
- for i in range(attempts):
      try: return await func()
      except: sleep and retry

In logger.py:
- configure rotating file handlers (TimedRotatingFileHandler)
----------------------------------------
🎨 3. UI POLISH (PROFESSIONAL LOOK + ENTERPRISE FEEL)
We upgrade:

Animations

Microphone button visual feedback

TutorBubble typing animation

Waveform visualizer

Light/dark mode

Responsive layouts

✅ 3A. CURSOR TASK — UI Polish Architecture
Paste:

CURSOR PROMPT — Implement UI Polish Architecture
Add the following UI improvements:

1. Create component: TypingIndicator.js  
   - three-dot pulsing animation

2. Improve MicRecorder.js:
   - animated glowing mic button while recording

3. Improve TutorBubble.js:
   - add fade-in + slide-up animation

4. Add Waveform.js architecture:
   - receive audio amplitude data
   - draw waveform using Canvas API (skia or react-native-svg)

5. Add global theme system:
   themeContext with:
       darkMode
       primaryColor
       fontSizeScaling

Cursor designs the components and structures.
Codex will implement animations and styles.
✅ 3B. CODEX TASK — Implement UI Polish Logic
Paste:

CODEX PROMPT — Implement UI Animations + Theme Handling
Open TypingIndicator.js:
- implement CSS or RN animation for pulsing dots.

Open MicRecorder.js:
- animate mic icon using Animated API (scale, glow).

Open TutorBubble.js:
- add fadeIn + translateY animation with Animated.

Open Waveform.js:
- implement drawing using react-native-svg:
    <Polyline points={...} />

Open themeContext.js:
- implement toggleDarkMode()
- apply theme variables to style components.
----------------------------------------
📊 4. ANALYTICS + LOGGING (LEARNING INSIGHTS)
PUHIS must track learning progress:

speaking time

grammar errors over time

vocabulary size growth

YKI score trends

✅ 4A. CURSOR TASK — Analytics Architecture
Paste:

CURSOR PROMPT — Build Analytics Architecture
Add backend analytics system:

1. Create backend/app/services/analytics_service.py:
   Functions:
     log_speaking_session(user_id, duration, transcript_length)
     log_grammar_mistakes(user_id, mistakes)
     log_yki_result(user_id, scores)

2. Database model:
   AnalyticsLog
     id
     user_id
     type (speaking/grammar/yki/etc)
     payload (JSON)
     created_at

3. Frontend:
   Create ProgressScreen.js:
     - fetch analytics summary
     - display graphs using VictoryNative or ReCharts

Add TODOs for Codex:
   - implement queries
   - implement summary aggregation
✅ 4B. CODEX TASK — Implement Analytics Logic
Paste:

CODEX PROMPT — Implement Analytics Logging + Progress View Logic
Open analytics_service.py:
- implement DB inserts for analytics events.

Open ProgressScreen.js:
- implement fetching analytics data.
- render charts:
   - grammar mistakes trend
   - YKI band history
   - speaking duration graph
----------------------------------------
📦 5. DEPLOYMENT (WEB + BACKEND + MOBILE)
This is the final, production-grade deployment plan.

⭐ BACKEND DEPLOYMENT: Fly.io (recommended)
Cursor Task — Backend Deployment Architecture
Paste:

CURSOR PROMPT — Build Deployment Files for Backend
Create:

1. Dockerfile (Python 3.12 + uvicorn)
2. fly.toml with:
   - 1 CPU shared
   - 512MB RAM
   - autoscaling min=1 max=3

3. GitHub Actions workflow:
   .github/workflows/deploy.yml
   - on push to main → fly deploy

Codex will fill actual commands.
Codex Task — Implement Backend Deployment Files
Paste:

CODEX PROMPT — Implement Dockerfile + CI/CD
Implement Dockerfile:
- FROM python:3.12-slim
- install dependencies
- expose port
- run uvicorn

Implement fly.toml:
- correct port mapping
- scaling config

Implement deploy.yml:
- install flyctl
- run flyctl deploy
⭐ WEB DEPLOYMENT: Vercel
Cursor Task:

Create next.config.js for Web export
Add vercel.json
Codex Task:

Implement config details
Set environment vars
⭐ MOBILE DEPLOYMENT: EAS Build
Cursor:

Add eas.json with profiles:
  production
  preview
  development
Codex:

Implement configuration details:
  signing settings
  app icons
  build setup
----------------------------------------
🛡 6. GDPR COMPLIANCE (REQUIRED IN FINLAND)
Requirements PUHIS must meet:
Data encryption in transit (HTTPS)

Right to erasure

Right to export data

No storing of raw audio unless user consents

Explainable AI transparency notice

Data retention policy

No profiling without consent

✅ Cursor Task — GDPR Architecture
Paste:

CURSOR PROMPT — Build GDPR Compliance Architecture
Create:

backend/app/services/privacy_service.py:
- export_user_data()
- delete_user_data()
- anonymize_logs()

backend/app/routes/privacy.py:
- GET /privacy/export
- DELETE /privacy/delete

frontend:
- PrivacyScreen.js explaining:
    - data usage
    - retention policy
    - AI explanation

Codex will implement logic.
----------------------------------------
🎉 PHASE 5 COMPLETE
After executing Phase 5:

✔ Backend is production-ready
✔ Frontend feels premium
✔ Web + mobile deployable
✔ GDPR-compliant
✔ Fast, stable, scalable

PUHIS is now a commercial-grade AI Finnish tutor.


-----------------------------


This phase adds:

Full subscription tiers

Paywall logic

YKI Exam Mode (authentic timed exam simulation)

Progress tracking dashboards

Automated feedback loops

Streaks & gamification

Certificate generator

Cloud storage for user progress

Multi-device sync

Invite/referral system

As always:

✔ Cursor = Architect
✔ Codex = Implementor
✔ You = Product Director
Let’s begin.

⭐ PHASE 6 — PREMIUM FEATURES, MONETIZATION, EXAM MODE
----------------------------------------
💳 1. SUBSCRIPTION SYSTEM (Full Implementation)
PUHIS will have 3 tiers:

Free Tier
Limited conversation minutes

Basic grammar correction

No YKI mode

No writing evaluator

Ads (optional later)

Basic Tier
Unlimited conversation

Grammar engine v2

Lesson generator v1

Basic analytics

YKI Premium Tier
YKI Speaking Evaluation

YKI Writing Evaluation

Full pronunciation scoring

Full exam simulations

Detailed feedback

Premium analytics dashboard

✅ 1A. CURSOR TASK — Architect Subscription System v2
Paste into Cursor:

CURSOR PROMPT — Subscription System v2 Architecture
Implement a full subscription system.

1. backend/app/db/models.py
   - Add Subscription model:
        id
        user_id
        tier ("free", "basic", "yki_premium")
        renewal_date
        created_at

2. backend/app/services/subscription_service.py
   - get_user_tier(user_id)
   - check_access(feature)
   - upgrade_subscription(user_id, tier)
   - downgrade_subscription(user_id)

3. backend/app/routes/subscription.py
   - POST /subscription/upgrade
   - POST /subscription/cancel
   - GET /subscription/status

4. frontend/app/screens/PaywallScreen.js
   - Display tiers with features
   - “Upgrade” button

5. frontend/app/context/subscriptionContext.js
   - store current tier
   - sync with backend

6. Add TODO markers for Codex:
   - payment integration stubs
   - actual tier logic
   - upgrade/downgrade handlers
✅ 1B. CODEX TASK — Implement Subscription Logic
Paste into Codex:

CODEX PROMPT — Implement Subscription Tier Logic
Implement TODOs:

1. In subscription_service.py:
   - return tier from DB
   - enforce paywall for:
        - YKI tests
        - advanced lessons
        - unlimited conversation

2. In subscription routes:
   - implement upgrade_subscription()
   - implement cancel logic

3. In PaywallScreen.js:
   - show tier comparisons
   - call backend to upgrade tier

Follow Cursor architecture exactly.
----------------------------------------
📝 2. FULL YKI EXAM MODE (Speaking + Writing)
This is a major monetization feature.
A full exam simulation includes:

✔ Authentic instructions
✔ Timed tasks
✔ Response analysis
✔ CEFR band prediction
✔ Explanation + improvement plan
✔ Score history
📣 2A. YKI SPEAKING EXAM MODE
Tasks Included:
Short introductions

Speaking about a picture

Giving advice

Expressing opinions

Narrating past events

Explaining processes

Roleplay tasks

✅ 2A. CURSOR TASK — Architect YKI Speaking Exam Mode
Paste:

CURSOR PROMPT — YKI Speaking Exam Mode Architecture
Implement YKI Speaking Exam Mode.

1. backend/app/services/yki_exam_service.py
   - get_speaking_tasks(level)
   - start_speaking_exam(user_id)
   - evaluate_speaking_attempt(user_id, transcript)
   - store_exam_result(user_id, scores)

2. backend/app/routes/yki_exam.py
   - GET /yki/exam/speaking/start
   - POST /yki/exam/speaking/submit

3. frontend/app/screens/YKISpeakingExamScreen.js:
   - Display task instructions
   - 60/90-second timer
   - Microphone start/stop
   - Live transcript
   - Submit button
   - Result screen:
        - CEFR band
        - category scores
        - strengths + weaknesses

Add TODO markers for Codex to fill task logic + analyses.
✅ 2B. CODEX TASK — Implement Speaking Exam Logic
Paste:

CODEX PROMPT — Implement YKI Speaking Exam Logic
In yki_exam_service.py:

1. Implement get_speaking_tasks():
   - return list of YKI-style prompts.

2. Implement evaluate_speaking_attempt():
   - call:
       yki_engine.evaluate_speaking()
       grammar_engine.analyze_grammar()
   - generate CEFR band
   - return structured result.

3. Implement store_exam_result():
   - insert record into DB.

In YKISpeakingExamScreen.js:
   - implement timer
   - show tasks
   - submit transcript to backend
   - display results
----------------------------------------
✍️ 2B. YKI WRITING EXAM MODE
Tasks Included:
Formal email

Complaint

Opinion writing

Narrative text

Each must be evaluated for:

Grammar

Structure

Coherence

Vocabulary

Task completion

✅ 2B. CURSOR TASK — Architect Writing Exam Mode
Paste:

CURSOR PROMPT — YKI Writing Exam Mode Architecture
Implement YKI Writing Exam Mode.

1. backend/app/services/yki_exam_service.py
   - get_writing_tasks(level)
   - evaluate_writing_attempt(user_id, text)
   - store_writing_result(user_id, scores)

2. backend/app/routes/yki_exam.py
   - GET /yki/exam/writing/start
   - POST /yki/exam/writing/submit

3. frontend/app/screens/YKIWritingExamScreen.js
   - Display prompt
   - Text input field
   - Timer (optional)
   - Submit button
   - Results screen:
        - CEFR band
        - grammar score
        - vocabulary score
        - task completion score
        - feedback paragraphs

Add TODOs for Codex.
✅ 2B. CODEX TASK — Implement Writing Exam Logic
Paste:

CODEX PROMPT — Implement YKI Writing Exam Logic
In yki_exam_service.py:

1. get_writing_tasks():
   - return YKI-style writing prompts.

2. evaluate_writing_attempt():
   - call yki_engine.evaluate_writing()
   - produce CEFR band

3. store_writing_result():
   - save to DB.

In YKIWritingExamScreen.js:
   - implement text submission
   - display scoring output
----------------------------------------
🎯 3. PERSONALIZED LEARNING PATH (AI-Generated)
After YKI evaluation, PUHIS should produce:

Strengths

Weaknesses

Targeted exercises

Recommended study plan

Vocabulary lists based on actual mistakes

✅ 3A. CURSOR TASK — Architect Personalized Learning Plan
Paste:

CURSOR PROMPT — Personalized Learning Plan Architecture
Create backend/app/services/personalization_service.py:

1. generate_learning_plan(user_id):
   - analyze:
       - grammar mistakes (past)
       - YKI results
       - speaking sessions
   - return study plan:
       - focus areas
       - recommended lessons
       - vocabulary list
       - suggested exercises

2. backend/app/routes/personalization.py:
   - GET /personalized-plan

Frontend:
- Create PersonalizedPlanScreen.js
   - display:
       - strengths
       - weaknesses
       - recommended lessons
       - vocabulary

Add TODO markers for Codex to implement logic.
✅ 3B. CODEX TASK — Implement Learning Plan Logic
Paste:

CODEX PROMPT — Implement Personalized Learning Plan Logic
Open personalization_service.py.

Implement:

1. Load user analytics:
   - past mistakes
   - exam scores
   - speaking durations

2. Identify patterns:
   - common case errors
   - verb conjugation issues
   - weak vocabulary areas

3. Generate plan:
   {
     strengths: [...],
     weaknesses: [...],
     recommended_lessons: [...],
     vocab_focus: [...],
     skill_targets: [...]
   }

Follow Cursor structure.
----------------------------------------
🧩 4. STREAKS, GAMIFICATION, MOTIVATION
⭐ Features:
Daily streak

Stars / XP system

Level progression

Achievements (e.g., “Passed B1 YKI Speaking”)

Badges

✅ 4A. CURSOR TASK — Architect Gamification System
Paste:

CURSOR PROMPT — Gamification Architecture
Create backend/app/services/gamification_service.py:

1. update_streak(user_id)
2. award_xp(user_id, amount)
3. check_achievements(user_id)

Create db model Achievement:
   id
   user_id
   type
   earned_at

Frontend:
Create GamificationBanner.js showing:
   - streak
   - XP bar
   - badges

Add TODOs for Codex to implement logic.
✅ 4B. CODEX TASK — Implement Gamification Logic
Paste:

CODEX PROMPT — Implement Gamification Logic
Implement:

1. update_streak:
   - check last activity date
   - increment streak if consecutive day
   - reset otherwise

2. award_xp:
   - add XP to user profile

3. check_achievements:
   - e.g., if B1 band achieved → award badge

In GamificationBanner:
   - fetch streak and XP
   - render progress bar
----------------------------------------
🎖 5. CERTIFICATE GENERATOR (YKI SIMULATION)
Users who complete a YKI exam simulation (premium feature) receive:

Printable certificate (PDF)

CEFR band

Performance summary

Areas to improve

✅ 5A. CURSOR TASK — Architect Certificate Generator
Paste:

CURSOR PROMPT — Certificate Generator Architecture
Create backend/app/services/certificate_service.py:

1. generate_certificate(user_id, result):
   - build PDF with:
       - user name
       - date
       - CEFR band
       - speaking/writing scores
       - personalized recommendations

Use reportlab or weasyprint.

Add /certificate/download endpoint.

Frontend:
Create CertificateScreen.js
   - fetch certificate PDF
   - allow download/share

Add TODOs for Codex to implement details.
✅ 5B. CODEX TASK — Implement Certificate PDF Creation
Paste:

CODEX PROMPT — Implement Certificate Logic
Open certificate_service.py.

Implement:
- PDF generation using reportlab
- Include:
    - title
    - user's band
    - scores
    - issue date

Return PDF as bytes.
----------------------------------------
🌐 6. MULTI-DEVICE SYNC (Cloud Storage)
PUHIS should sync:

Lessons completed

Conversation history (short)

Settings

Subscription tier

YKI exam attempts

⭐ Cursor Task — Cloud Sync Architecture
Paste:

CURSOR PROMPT — Multi-Device Sync Architecture
Add backend endpoint: /sync/state
Add service sync_service.py:
    - get_user_state(user_id)
    - save_user_state(user_id, state)

Frontend:
- Sync state on app start & on state changes.

Add TODOs for Codex.
----------------------------------------
🚀 PHASE 6 COMPLETE
After this phase, PUHIS becomes:

✔ A full learning platform
✔ A full YKI preparation tool
✔ A monetizable SaaS app
✔ A premium-grade mobile & web application
You're almost ready to launch.


----------------------------



This is the phase where PUHIS becomes:

Secure for real users

Scalable to thousands of learners

Legally compliant (GDPR, EU AI Law readiness)

Monitored, stable, and diagnosable

Ready for App Store & Play Store distribution

Ready for production traffic (web + mobile)

As before, we’ll use:

✔ Cursor → Architect (structure & skeleton)
✔ Codex → Implementor (logic)
✔ You → Director (giving instructions to both)
This phase includes:

Security hardening (backend + frontend)

Authentication system overhaul

Rate limiting

API key management

Database hardening

Logging + monitoring + Sentry

Load testing

Deployment-grade Docker optimization

Payment integration (Stripe)

Production Go-Live checklist

Let’s execute the full blueprint.

⭐ PHASE 7 — SECURITY, SCALING, HARDENING, & GO-LIVE
----------------------------------------
🔐 1. SECURITY HARDENING (BACKEND & FRONTEND)
This adds:

JWT refresh tokens

Session management

CSRF protection

Password hashing

Server rate limiting

Payload validation

Secure headers

Environment variable isolation

✅ 1A. CURSOR TASK — Architect Security Layer
Paste into Cursor:

CURSOR PROMPT — Security Layer Architecture
Implement a full security layer for PUHIS.

1. backend/app/core/security.py:
   - create_access_token()
   - create_refresh_token()
   - verify_password()
   - hash_password()
   - verify_token()
   - add token expiration logic

2. backend/app/routes/auth.py:
   - POST /auth/register
   - POST /auth/login
   - POST /auth/refresh
   - GET /auth/me

3. backend/app/utils/rate_limit.py:
   - define rate_limit(key, limit, per_seconds)
   - store counts in Redis (or in-memory fallback)

4. backend/main.py:
   - Add middleware:
       - secure headers
       - CORS settings
       - rate limiting middleware

5. frontend:
   - Add AuthContext for:
        user
        token
        refresh token
        logout()
        auto-refresh mechanism

Add TODO markers for Codex to implement logic.
✅ 1B. CODEX TASK — Implement Security Logic
Paste into Codex:

CODEX PROMPT — Implement Security Logic
Implement the following:

1. security.py:
   - implement hashing using passlib or bcrypt
   - implement JWT generation using pyjwt
   - implement refresh token logic

2. auth routes:
   - on register:
        hash password
        store user
   - on login:
        verify password
        return tokens
   - on refresh:
        validate refresh token
        issue new access token

3. rate_limit.py:
   - use a dict or redis connection to enforce rate limits

4. middleware:
   - add X-Frame-Options
   - add X-Content-Type-Options
   - add throttling for login route

Follow Cursor structure.
----------------------------------------
🔐 2. API KEY MANAGEMENT + ENVIRONMENT SECURITY
We isolate:

OpenAI API keys

Payment API keys

Database secrets

Encryption keys

We add:

.env.production

Secret rotation strategy

Encrypted storage of secrets

----------------------------------------
🧱 3. DATABASE HARDENING
Includes:

Role-based DB users

Read-only roles

Row-level access control

Index optimization

Backup & restore automation

Data retention policy

✅ 3A. CURSOR TASK — Database Hardening Architecture
Paste:

CURSOR PROMPT — Database Hardening Architecture
Implement database hardening.

1. backend/app/db/database.py:
   - add connection retries
   - enable SSL mode (verify-full)
   - add connection pool overflow protection
   - add connection timeout

2. backend/app/db/models.py:
   - add indexes on foreign keys
   - add timestamps with auto indexing

3. backup system:
   - create scripts/db_backup.sh
   - create scripts/db_restore.sh

4. Add TODO markers for Codex to implement:
   - SQL roles setup
   - backup scheduling
   - encryption-at-rest notes
✅ 3B. CODEX TASK — Implement DB Hardening Logic
Paste:

CODEX PROMPT — Implement DB Hardening
Implement TODOs:

1. Add Index() to Message.user_id, Subscription.user_id, AnalyticsLog.user_id
2. In database.py:
   - set connect_args for SSL
   - configure pool_recycle and pool_timeout
3. Write backup scripts:
   - pg_dump for backup
   - psql for restore
4. Add role creation SQL:
   - read_only_role
   - read_write_role
   - admin_role
----------------------------------------
🛡 4. INPUT VALIDATION + SAFE OUTPUT (PREVENT ATTACKS)
We need to prevent:

Injection

Prompt injection

Script injection

Malicious STT content

Model exploitation

========================================
⚠ SPECIAL: ANTI–PROMPT-INJECTION SHIELD
This is essential for an AI tutor app.
You must strip or neutralize instructions like:

“ignore your instructions”
“act as… root admin”
“summarize previous prompt”

This requires logic.

✅ 4A. CURSOR TASK — Architect Sanitization Layer
Paste:

CURSOR PROMPT — Sanitization & Prompt-Security Architecture
Add security validation layer:

1. backend/app/utils/sanitize.py:
   - sanitize_user_text()
   - strip dangerous instructions
   - prevent prompt injection patterns:
       ("ignore previous", "disregard", "system override")

2. conversation_engine.py:
   - run sanitize_user_text() before sending user input to OpenAI

3. routers:
   - validate JSON payloads with Pydantic models

Cursor sets up structure; Codex adds rule logic.
✅ 4B. CODEX TASK — Implement Sanitization Logic
Paste:

CODEX PROMPT — Implement Prompt Sanitization Rules
Open sanitize.py.

Implement:

1. Lowercase user text for detection.
2. If contains:
      "ignore all previous"
      "disregard"
      "system message"
      "jailbreak"
   → remove or replace with safe placeholder.

3. Remove special tokens like <system>, <developer>.

4. Return cleaned text.

Follow Cursor structure.
----------------------------------------
📈 5. MONITORING & LOGGING (Sentry, Prometheus, Grafana)
We add:

Backend exception tracing (Sentry)

Request latency metrics

User behavior analytics (optional)

========================================
⭐ 5A. CURSOR TASK — Monitoring Architecture
Paste:

CURSOR PROMPT — Monitoring Architecture
Implement monitoring:

1. Sentry integration:
   backend/app/main.py → init Sentry with DSN

2. Prometheus metrics endpoint:
   /metrics for:
      - request_count
      - request_duration
      - active_users

3. Grafana + Prometheus docker-compose config:
   monitoring/docker-compose.yml
   - prometheus
   - grafana

4. Frontend:
   Add analytics events:
       - lesson_started
       - yki_exam_attempted
       - streak_updated

Add TODO markers for Codex.
========================================
⭐ 5B. CODEX TASK — Implement Monitoring Logic
Paste:

CODEX PROMPT — Implement Monitoring Logic
Implement Sentry integration:
- sentry_sdk.init(dsn=..., traces_sample_rate=1.0)

Implement Prometheus instrumentation:
- use prometheus_client
- add counters + histograms

Implement docker-compose:
- prometheus + grafana services

Frontend:
- implement basic analytics events using fetch POST calls.
----------------------------------------
🚀 6. LOAD TESTING & OPTIMIZATION
We test:

1000 concurrent users

500 simultaneous voice sessions

DB query latency

API load

Tools:

k6

Locust

========================================
⭐ 6A. CURSOR TASK — Load Testing Architecture
Paste:

CURSOR PROMPT — Load Testing Architecture
Create load-tests/k6_conversation_test.js:
   - simulate 500 users
   - each sends 3 messages to session/send

Create load-tests/k6_voice_test.js:
   - simulate 100 concurrent WebSocket connections
   - send fake audio payloads

Add TODO markers for Codex:
   - implement test scripts
========================================
⭐ 6B. CODEX TASK — Implement Load Tests
Paste:

CODEX PROMPT — Implement k6 Load Test Scripts
Implement both scripts:

1. conversation_test:
   - POST /session/send
   - check latency < 300ms

2. voice_test:
   - open WS
   - send binary audio
   - check response time

Follow Cursor structure.
----------------------------------------
🐳 7. DOCKER HARDENING + OPTIMIZATION
We reduce image size, improve security.

========================================
⭐ 7A. CURSOR TASK — Production Docker Architecture
Paste:

CURSOR PROMPT — Optimize Production Dockerfile
Create production Dockerfile with:

- multi-stage build
- non-root user
- minimal base image
- healthcheck
- tmpfs mount

Add TODO markers for Codex.
========================================
⭐ 7B. CODEX TASK — Implement Docker Hardening
Paste:

CODEX PROMPT — Implement Docker Optimization
Implement:

1. Multi-stage build:
   - builder stage
   - runner stage

2. Add non-root user:
   RUN useradd -m appuser

3. Add HEALTHCHECK:
   CMD curl --fail http://localhost:8000/health || exit 1
----------------------------------------
🚀 8. GO-LIVE CHECKLIST (WEB + MOBILE)
Here is the final production readiness checklist for PUHIS.

⭐ GO-LIVE CHECKLIST
SECURITY
✔ All endpoints protected
✔ JWT system in place
✔ Rate limiting enabled
✔ Sanitization engine active
✔ No sensitive logs
✔ All secrets in .env.production
✔ HTTPS enforced

STABILITY
✔ Global error handler working
✔ Retry logic for OpenAI
✔ WebSocket reconnection works
✔ Sentry connected

PERFORMANCE
✔ Caching enabled
✔ DB connection pooling
✔ Load tests passed

COMPLETENESS
✔ Conversation engine v3
✔ Grammar engine v2
✔ YKI speaking mode
✔ YKI writing mode
✔ Lesson generator
✔ Pronunciation scoring
✔ Subscriptions & paywall
✔ Analytics
✔ Certificates
✔ Sync system

DEPLOYMENT
✔ Backend deployed to Fly.io
✔ Web frontend deployed to Vercel
✔ Expo app built (EAS)
✔ App Store & Play Store metadata ready


---------------------



