✅ WHAT HAS BEEN DONE ALREADY
(From your description + the pilot file) 

1. A strong core vision
You already defined the central idea clearly:

an AI tutor that talks, listens, evaluates, corrects grammar, and guides the learner into fluent Finnish speech.

a YKI exam mode that simulates the real test.

a “memory hiding” feature where the tutor shows less and less text as the learner progresses.
This is solid and matches the needs of Finnish learners.

2. A four-module structure
The pilot file already outlines four main engines:

Voice/Conversation engine

Grammar engine

Lesson engine

YKI engine

This is exactly what a competitive learning app needs.

3. A good technical direction
You planned:

FastAPI backend

React Native mobile app

Whisper for STT

TTS with subtitles

Personality switching (tutor, examiner)

Context memory + compression
This is modern and realistic.

4. Clear progressive learning concept
Your idea of gradually hiding text to force the learner to recall sentences is strong. It mimics how real teachers remove scaffolding.

5. A fair understanding of what YKI exam prep requires
You already note:

the exam is time-sensitive

tasks need to be simulated

each part (reading, writing, speaking, listening) has to be practiced
This aligns with real YKI expectations.

❗ WHAT I WOULD DO DIFFERENTLY (AND WHY)
Here I’m being objective, based on how language-learning engines succeed in Finland.

1. You are building too many features at once
The scope is huge. In a real product, this slows development and makes everything feel half-finished.
I would prioritize one cornerstone first:

The cornerstone should be:
→ The live AI conversation tutor with grammar correction and subtitles.

Reason:
This alone will make the app attractive, viral, and memorable.
YKI prep, writing correction, pronunciation scoring etc. should be built after the conversation engine is stable.

2. Your current design underestimates how hard Finnish grammar automation is
The pilot file suggests simple rule-checks, but Finnish morphology is extremely complex.

A competitive grammar engine must do more than detect typos. It must:

detect case rections (e.g., pitää + sta, auttaa + partitive)

identify consonant gradation patterns

detect nominal and verbal inflection patterns

recognize register differences (puhekieli vs kirjakieli)

handle multi-clause sentences

show transformations in a consistent style

This requires either:

A. a proper morphological parser (Omorfi) or
B. an LLM-infused rule engine that normalizes structures first

Right now, the file has only a basic outline.
To compete with Duolingo, WordDive, Chatterbug, etc., you must go deeper into rule-level grammar.

3. The system does not yet include error gravity
Not all grammar mistakes are equal.
A competitive engine should classify mistakes as:

global comprehension errors

structural grammar errors

small stylistic issues

register mistakes

vocabulary choice problems

If you treat all errors the same, the student feels overwhelmed.
Real teachers always adjust based on "severity vs communication success".

4. YKI practice needs authentic rubrics + timing logic
Most apps fail here.
To match official YKI standards, you must implement:

time pressure

task instructions that resemble the exam exactly

CEFR-aligned scoring

band prediction (A2.1, A2.2, B1.1, B1.2)

a “silent examiner” personality mode

authentic textual difficulty (short announcements, real ads, everyday bureaucracy messages)

The pilot file lists YKI tasks, but it doesn’t show:

timing logic

audio playback for listening tasks

engagement with official YKI styles

scoring thresholds

These must be added.

5. You need a proper progression model
Right now the app jumps from free conversation to YKI prep.
Something is missing between them: a progression engine.

A strong app needs:

“I know these grammar points, I struggle with these ones”

“Your current estimated level is X”

“Lessons recommended for you today”

“Mistakes you make most often”

vocabulary buckets (A1, A2, B1)

recycling difficulty (spaced repetition)

Without this, the app feels like a collection of tools instead of one coherent learning experience.

6. The “text hiding” scaffold needs smart tuning
The idea is excellent, but you need control rules:

hide only phrases the student has already mastered

reveal text again if the student hesitates

gradually remove longer chunks

increase reliance on memory over time

Right now your description is too simple: “hide texts more as the student progresses”.
This can frustrate learners unless it adapts based on performance.

7. No mention of pronunciation evaluation
Finnish pronunciation matters a lot:

vowel length (tuli vs tuuli)

consonant length (muta vs mutta)

rhythm

stress placement

Even a simple Whisper-based comparison system would give:

“vowel is too short”

“double consonant is missing”

“sound is unclear here”

This is a competitive differentiator.

8. The writing correction system needs structure
Right now you say: “Students can submit essays and the app will mark them.”

But real writing correction must include:

task completion (did they follow instructions?)

organization (coherence)

sentence complexity

grammar accuracy

vocabulary range

register

example rewritten text

suggestions for improvement

This is doable, but the app must offer consistent structured feedback, not just “Here is a correction.”

9. User experience needs more behavioural flow
A strong teacher app needs:

conversational onboarding

initial placement test

dynamic difficulty adjustment

gentle feedback

challenges / goals

gamification

progress dashboard

Otherwise the user feels lost.

🟦 WHAT I WOULD ADD (TO MAKE IT DEEP + COMPETITIVE)
1. A proper placement test at the start
A short speaking + reading + writing test that estimates:

CEFR level

grammar weaknesses

vocabulary level

pronunciation issues

This allows the app to build a personalized study path.

2. Progress analytics
Show the learner:

grammar mistakes decreasing over time

new vocabulary learned

speaking fluency time

YKI readiness indicator (“You are 62% ready for B1”)

This increases motivation.

3. Finnish morphology visualizer
Many learners struggle with:

cases

stem changes

consonant gradation

suffix stacking

A simple visualizer that breaks down:
“talossani” → talo + ssa + ni
will make your app unique.

4. A proper interactive YKI mock exam mode
Timed. Authentic. Stressful enough to prepare the student.
This makes your app immediately valuable for immigrants.

5. A “Teacher Review Mode”
The AI can switch to a strict, exam-like personality.
This will train students to handle Finnish official communication tone.

6. Contextual vocabulary extraction
After each conversation, the app should produce:

5 words the student struggled with

5 new words they should learn

a flashcard deck

This is missing and necessary.

7. Pronunciation heatmap
After each speaking task, highlight problem areas:

long vowels

short vowels

double consonants

endings

rhythm

This is a powerful differentiator.

8. Local cultural scenarios
Finnish learners struggle with:

terveysasema visits

TE-toimisto situations

Kela calls

apartment issues

workplace conversations

The app should have modules for real Finnish life.

9. Offline mode (at least partial)
This will make the app usable during travel or commuting.

🟩 HOW TO MAKE THE APP TRULY COMPETITIVE (REALISTICALLY)
Here are the things that will make PUHIS a strong competitor against Duolingo, WordDive, SuperMemo, Chatterbug, LingQ, etc:

✔ A tutor that behaves like a real Finnish teacher
Not just correcting, but explaining and guiding.

✔ A grammar engine that goes deeper than any existing app
Finnish grammar is unique; no major app handles it well.

✔ YKI exam authenticity
People in Finland desperately need this for work/residence.
No mainstream app offers proper YKI prep.

✔ Adaptive scaffolding (your text-hiding idea)
This is teaching-science inspired and powerful.

✔ Pronunciation accuracy scoring
Finnish pronunciation is clean and predictable, so this is possible.

✔ Real-life scenario training
The strongest emotional hook for learners.

✔ Clear progression stats
People want to see their improvement.

✔ Fast, stable, low-latency voice conversation
If the AI stutters, the product fails emotionally.


