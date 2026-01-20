Your current plan already covers an unusually complete technical and pedagogical foundation: voice pipeline, conversation engine, grammar engine, YKI engine, curriculum, subscriptions, analytics, deployment, and even AI-agent workflows are all mapped from MVP to production. What is missing now is differentiation, depth of learning science, and ruthless focus on doing a few things far better than competitors.​

What’s strong in your current plan
End‑to‑end voice conversation stack: Real‑time STT (Whisper), VAD, interruptible TTS, WebSocket streaming, and a full talk–think–talk loop are specified with enough detail that an AI pair‑programmer can actually ship it. This directly supports your “live conversation with subtitles” vision and matches where conversation‑first apps like Pingo and TalkPal are winning.​​

Dedicated Grammar/YKI engines, not just generic chat: You defined separate services for grammar detection and explanation, and a YKI engine with rubrics, CEFR banding rules, and task templates (speaking, writing, reading, listening). This is exactly aligned with the official YKI structure (four subtests; basic = A1–A2, intermediate = B1–B2).​​

Serious architecture and dev workflow: Backend (FastAPI, microservices), frontend (React Native, Next.js), DB (Supabase/Postgres), caching, error handling, and a 12‑week roadmap with AI tooling orchestration (Cursor vs Codex) are unusually detailed for an early‑stage product. That is a major execution advantage if you keep scope disciplined.​

Curriculum and YKI alignment: You sketched A1–B1 content plus YKI‑style tasks (picture description, short emails, opinion pieces, etc.), which matches external descriptions of what B1 YKI expects: 80–120 word texts, everyday topics, and functional communication, not perfection.​​

Commercialization thinking: Tiered subscriptions, YKI premium, employer bundles, TE‑office/institutional sales, and compute‑aware limits on expensive tasks are all there. This is ahead of what many “side project” apps ever reach and comparable to existing Finnish YKI practice apps that monetise via subscriptions.​​

You are not missing core plumbing. The weakness is that you are currently designing “everything a serious Finnish app could have” rather than “the leanest thing that totally dominates a specific niche”.

What should be different (strategic focus)
1. Narrow the first win: “YKI Speaking Coach” before “Everything”
Right now you are trying to launch: full conversation tutor + general A1–B1 course + complete YKI simulator + analytics + gamification + certificates. Meanwhile, the strongest competitor niche in your market is clearly YKI‑focused apps that highlight ready‑to‑go opinion/reaction tasks with AI feedback.​​

What to change:

Phase 1 product = “YKI Speaking & Reaction Coach” only.

One core flow: timed YKI‑style speaking task → user speaks → instant CEFR‑ish score + targeted feedback + redo.​​

Include 2–3 task types that map cleanly to real YKI: short reaction (“Reagointi”), opinion monologue, picture/story.​

Defer full general curriculum and fancy gamification.

Keep A1/A2 material and streaks in your internal roadmap, not in v1. They dilute the story and slow you down.​

Messaging: “Fast path to B1 YKI speaking” instead of “all‑in‑one Finnish tutor” in the first 6–9 months. This is much easier to sell to stressed immigrants and integration programs, which care about passing more than about perfect pedagogy.​

Why: the market already has broad “AI Finnish” apps; the gap is highly focused, exam‑realistic, feedback‑dense YKI preparation that feels like a private coach rather than just another pack of sample tasks.​

2. Obsess over correction quality and transparency
Most AI language apps brag about “instant corrections and explanations”, but users regularly complain about feedback being vague, inconsistent, or wrong. Your plan does have a grammar engine and rubrics, but you are under‑leveraging them.​

Change and deepen:

Standardize feedback format ruthlessly.
Every correction should follow one consistent frame (you already sketched this, but it must be enforced by templates, not left to the model):​

What you said

Correct version

Micro‑reason in plain English + one Finnish example

One micro‑drill the user can repeat (e.g., “Say 3 sentences with ‘minun täytyy’ + [verb] + [noun]”).

Make “why this matters for YKI” explicit.
Tag every feedback item to a rubric dimension: fluency, grammar, vocabulary, coherence. In the UI, that becomes: “This mistake mainly affects grammar – that’s one of four YKI categories.”​​

Add reliability signals.

Show “confidence” ranges or label feedback as “soft suggestion” vs “hard error” to avoid over‑correction and user frustration.​

Log all corrections and allow the user to tap “incorrect feedback” so you can collect failure data later.

Why: exams like YKI grade explicitly across multiple dimensions; mirroring that structure and explaining each correction’s exam relevance is a big differentiator vs generic AI chatbots.​

3. Turn your “withheld text” idea into a deliberate memory ladder
Your vision of gradually hiding the script so students must speak from memory is excellent – exactly what conversation‑first apps try to do, but more structured. Right now it’s not concretely specified.​​

Make it explicit and data‑driven:

Conversation templates with difficulty knobs
For each dialogue, define 3–4 modes:

Level 1: Full Finnish text + audio + subtitles for both sides.

Level 2: Student’s line shown but with blanks on case endings or key verbs.

Level 3: Only English prompt / topic; student must produce Finnish line freely.

Level 4: Timed reaction task that mimics YKI “Reagointi” conditions.​

Adaptive withholding based on performance logs
Use your mistakes/YKI scores tables to decide when to move from Level 1 → 2 → 3 in a given topic.​

If the learner repeatedly produces the correct pattern for a given grammar point, stop showing that piece of text.

If they struggle, temporarily increase support (partially filled answers, hints).

Expose this ladder clearly in the UI (“Guided → Assisted → From memory → Exam speed”) so the product feels like a structured training program, not random chats.

Why: repeated retrieval and gradually reduced scaffolding are evidence‑based ways to deepen learning; most AI tutors do not implement this in a transparent, systematic way.​

4. Build a YKI‑specific “Exam Readiness” dashboard
You already log mistakes, scores, YKI results, and speaking attempts in the DB. If you surface these naively (“here are your errors”), you fail to differentiate. Users want one burning question answered: “Am I ready for the exam, and what should I do before the date?”​​

What to add:

Single readiness indicator per skill
For each of the four YKI skills, show:

Current band estimate (A2.1 → B1.2) from recent tasks.​​

Confidence bar (e.g., based on number/recency of attempts).

Time‑boxed prep plans

“You are 7–10 points below stable B1 in speaking. Focus: partitive objects + opinion structure. Recommended: do these 3 conversation drills and 2 timed opinion tasks, then retest.”

Offer 2‑, 4‑, and 8‑week plans matching typical YKI registration intervals.​

Red/amber/green gating for booking the test

Green = “Strong B1 median over last 2 weeks; low variance.”

Amber = “Borderline; you might pass but writing is weak.”

Red = “Below B1 in more than two components; postpone if possible.”

Why: competitors provide lots of practice but don’t always give a clear, trustworthy “go/no‑go” signal; that is a killer feature for anxious candidates.​

5. Make written assignments really useful, not an afterthought
Your document includes writing tasks, evaluators, and even a certificate generator, but the user value proposition around writing is fuzzy. YKI writing demands short, functional texts (80–120 words at B1) with clear task completion.​​

Strengthen writing by:

Task templates that mirror real prompts

Complaints, requests, explanations, opinions, instructions – exactly the functional types described in official and teacher guides.​​

Each comes with sample planning structure, not sample text: bullet points of what must be included to meet the task completion criteria.

Two‑pass feedback

Pass 1: micro‑edits and grammar corrections.

Pass 2: “exam feedback mode” that hides corrections, talks only in rubric language (structure, task completion, coherence), and assigns a band.​​

Revision loops, not one‑shot grading

The app should explicitly ask the student to rewrite once after feedback, then show improvement (“You improved from A2.2 → B1.1 in task completion”).

Why: most AI tools stop at a single correction; YKI rewards the ability to plan and revise short texts under time pressure, and teachers recommend practicing exactly that.​

6. Out‑compete on authenticity and ethics, especially in Finland
Finland is sensitive about privacy, exam fairness, and educational quality. The public YKI pages emphasize official rubrics and impartiality; Migri emphasises that B1 corresponds to grade 3 and is required for citizenship.​

You can turn this into an advantage:

Transparent alignment with official YKI / CEFR

Explicitly reference that your scoring categories and bands mirror public descriptions from OPH and typical YKI guides (without copying exact text).​

In the app, link to those public resources and say “this app is not official YKI, but uses the same categories to help you prepare.”

Strong privacy defaults and on‑device controls

Make it obvious that audio is processed for feedback and not used to “train models”, and offer “delete my data” and “export my data” functions, as you already sketched for GDPR.​​

Exam‑integrity constraints

Don’t promise “exact YKI questions” and avoid anything that looks like a leak of confidential material. Use public‑style tasks and state clearly these are original but similar to YKI.​

Why: this builds trust with both end‑users and institutions (TE‑offices, municipalities) and differentiates you from generic AI apps that barely mention data handling or exam ethics.​

7. How to make it truly competitive in the current app landscape
Looking at today’s AI Finnish and YKI apps, the patterns are:

They offer all four skills and AI corrections.​

They provide quite good YKI‑style materials, especially for opinion and reaction tasks.​

They rarely combine: deep, structured grammar engine + conversation‑first UX + hard YKI readiness analytics.

To stand out:

Lean feature set, deep implementation

Polish 3 pillars to “10/10” before adding more:

Live YKI‑style speaking with memory‑ladder prompts.

High‑precision, template‑driven feedback with explicit YKI rubrics.

Exam readiness dashboard and short, time‑boxed study plans.

Aggressive dogfooding with real YKI candidates and teachers

Bring in a handful of YKI instructors early to validate prompts, rubrics, wording of feedback, and B1 readiness thresholds.​

Let recent test takers compare the app’s simulated tasks with their real exam experience.

Instrument everything and iterate ruthlessly

Use the analytics module you designed to find where users drop: is it during long monologues, unclear instructions, or overwhelming corrections? Then simplify screens and explanations accordingly.​

If you do that, your app is no longer “just another AI Finnish tool”, but a specialized YKI speaking and writing coach that also happens to be a capable general‑purpose tutor.

If you want, the next step can be to cut your existing 12‑week roadmap down to a “YKI‑speaking‑only v1” plan and specify exactly what gets dropped or delayed, so you can ship something valuable with real differentiation in 6–8 weeks instead of trying to boil the ocean.




-------------------------


For general‑purpose Finnish speech recognition in an app like yours, OpenAI’s Whisper family and Finnish‑fine‑tuned wav2vec2 models are currently the most practical high‑quality options, with classic Kaldi models still strong if you want fully on‑prem, corpus‑specific systems.​

Leading options today
OpenAI Whisper (multilingual)

Trained on 680k+ hours, supports Finnish well and is robust to noise and accents compared to many previous multilingual models.​

Widely used in Finnish projects (e.g., interview transcription and grading setups), where users report good Finnish quality, especially with medium and larger model sizes.​

Finnish‑tuned wav2vec2 (e.g. Finnish‑NLP / wav2vec2‑xls‑r‑300m‑finnish‑lm)

Pretrained on 436k hours in many languages, then fine‑tuned on ~275 hours of Finnish speech for ASR, giving strong results on Finnish benchmarks.​

Research using Lahjoita puhetta and similar corpora shows that such Finnish‑adapted wav2vec2 models can outperform older baselines on colloquial Finnish.​

Kaldi‑based Finnish models (Lahjoita puhetta, Aalto‑ASR)

The Lahjoita puhetta baseline Kaldi model is trained on 1600+ hours of Finnish and provides downloadable ASR systems and recipes.​

Aalto’s Kaldi‑based Finnish ASR recipes (including parliament and Lahjoita puhetta corpora) remain strong, particularly if you need full control and domain‑specific adaptation.​

How to choose for your app
If you want easiest integration and good robustness: use Whisper API or a locally hosted Whisper medium/large model; it handles Finnish reliably and is straightforward to deploy.​

If you want maximum offline control and can invest in modeling: start from a Finnish‑tuned wav2vec2 or Lahjoita puhetta Kaldi model and fine‑tune on your own conversational/YKI‑style audio to reduce errors on colloquial exam speech.​


------

On pure Finnish colloquial speech, large wav2vec 2.0 models that are pre‑trained and then heavily fine‑tuned on Lahjoita puhetta–style data currently outperform generic Whisper, but Whisper remains more robust and convenient if you need many languages and noisy, mixed‑domain audio.​

Data they’re trained on
Whisper (multilingual)

Trained on ~680k hours of weakly supervised multilingual audio; Finnish is included but is only one of many languages and not specifically focused on colloquial LP‑style speech.​

Fine‑tuned Whisper variants for Finnish exist, but published research on colloquial Finnish still often treats Whisper as a strong general baseline rather than a corpus‑specialised model.​

wav2vec 2.0 (Finnish‑specialised)

Several monolingual or Finnish‑adapted wav2vec2 models have been continued‑pre‑trained and fine‑tuned on Lahjoita puhetta (≈3600 h of ordinary, colloquial Finnish) and related corpora, explicitly targeting spontaneous speech.​

Studies show that continued pre‑training on LP plus fine‑tuning yields clear gains in Finnish colloquial ASR compared with generic multilingual baselines.​

Accuracy on colloquial Finnish
wav2vec 2.0 advantage on LP‑style speech

Aalto and collaborators report that Finnish wav2vec2 models continued‑pre‑trained on thousands of hours of LP audio and then fine‑tuned on transcribed LP achieve substantially lower WER/CER on colloquial benchmarks than earlier hybrid HMM/DNN baselines, and they also beat multilingual wav2vec2 without Finnish adaptation.​

A recent comparative study evaluated several foundation models (including Whisper fine‑tuned on 34 h of spontaneous Finnish) and found that LP‑adapted wav2vec2 models reached the best ASR scores on colloquial Finnish test sets.​

Whisper performance

Whisper large/medium performs reasonably well on Finnish and is often “good enough” for transcription and grading, but in Finnish TTS/ASR dataset work it has been paired with a second Finnish wav2vec2 model to validate or correct its transcripts, implying that Whisper alone is not optimal on Finnish compared with a strong monolingual model.​

Documentation from Finnish HPC environments notes Whisper as robust and easy to use on Finnish, but it is not reported as state‑of‑the‑art on LP‑style colloquial benchmarks.​

High-level comparison
Aspect	Whisper (multilingual)	wav2vec 2.0 (Finnish‑specialised, LP‑trained)
Training focus	Broad multilingual, mixed domains ​	Finnish, heavily adapted to Lahjoita puhetta colloquial speech ​
Colloquial Finnish WER trend	Good, but behind best monolingual models on LP‑style tests ​	Best reported results on LP‑style colloquial corpora ​
Robustness (noise, domains)	Very robust across many domains/languages ​	Strong on LP‑like colloquial Finnish; less general outside that domain ​
Deployment & tooling	Simple APIs, many bindings, off‑the‑shelf models ​	More DIY: Hugging Face checkpoints, need your own inference stack ​
Best use case for your app	Multi‑language support, quick integration, good general Finnish	Highest accuracy on YKI‑style colloquial Finnish if you can host it
What this means for your Finnish app
If your priority is maximum recognition accuracy on everyday, colloquial Finnish (Lahjoita puhetta‑style speech, YKI candidates, dialectal variants), then a continued‑pre‑trained and LP‑fine‑tuned wav2vec 2.0 model (e.g. wav2vec2-large-fi-lp-cont-pt family) is likely to give you lower WER than Whisper, at the cost of more engineering.​

If you need fast integration, cross‑language support, and solid “works out of the box” performance, Whisper (medium/large) remains a very strong and pragmatic choice, even though it is not the top performer on specialised colloquial Finnish benchmarks.​



---------------------------


For colloquial Finnish with lots of hesitations, repetitions and repairs, Finnish‑adapted wav2vec 2.0 models have the edge, especially when they are explicitly trained on disfluency‑rich corpora, while Whisper tends to smooth or drop many disfluencies by default.​

Evidence for wav2vec 2.0
Lahjoita puhetta–based work shows wav2vec2 models fine‑tuned on spontaneous Finnish (with natural hesitations and repairs) achieve strong ASR performance on colloquial test sets, indicating good robustness to those phenomena.​

Aalto’s disfluency‑detection thesis for L2 Finnish built directly on wav2vec2 and successfully tagged multiple disfluency types (pauses, repetitions, etc.) while keeping ASR quality reasonable, which suggests the architecture copes well with disfluent learner speech.​

Whisper’s behaviour with disfluencies
Whisper is trained on massive, noisy web audio and can recognise disfluent speech, but its decoding is biased toward “cleaned‑up” transcripts; practitioners note it often omits filler sounds (“öö”, “ööö”, “niinku”) and repairs unless explicitly constrained.​

There is little Finnish‑specific research showing Whisper preserving detailed disfluency patterns; in Finnish projects it is used more for overall transcription than for careful modelling of fluencemes.​

Practical takeaway
If your goal is high‑fidelity transcripts that keep hesitations, repetitions and learner disfluencies (e.g., for fluency scoring), a Finnish wav2vec2 model continued‑pre‑trained on Lahjoita puhetta and/or L2 learner data is currently the better foundation.​

If you mainly need clean transcripts for downstream NLP and are less interested in preserving every “öö” and false start, Whisper is simpler to deploy and accurate enough, but it will often under‑represent disfluencies unless you tune decoding or post‑processing.​


------------


