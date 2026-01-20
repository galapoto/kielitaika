
The document you provided, "puhis_project_file_pilot.md," is an exceptionally detailed and complete plan for building the Finnish language teaching application you described. It covers the full product roadmap, system architecture, core engine designs, and a go-to-market strategy.

Here is an analysis based on your four points:

1. What Has Been Done (Based on the Document's Detailed Plan)
The plan outlines every major component you requested, confirming that a clear path exists for all core features:

User Request	Planned Component in Document	Key Implementation Details
Live Conversation (AI speaks, student speaks)	Core Voice MVP (Weeks 1-2)	Microphone streaming, Whisper STT (Speech-to-Text), TTS (Text-to-Speech), and VAD (Voice Activity Detection) for seamless interruption.
Smart Withholding (forcing speech from memory)	Conversation Engine (Weeks 3-4)	Level detection (A1–B1) and lesson choosing logic allow the AI to dynamically adjust prompt difficulty and withhold text as the student progresses.
Correction & Grammar (commendation, correction, grammar analysis)	Finnish Grammar Engine (Weeks 5-6)	Deep error detection using morphological analysis (Omorfi/rules), case decision engine (all 15 cases), verb type detection, and structured Wrong: {user_sentence} Correct: {corrected_sentence} Why: {rule} explanations. Correction modes (light, medium, strict) are planned.
Written Assignment/Essay Marking	YKI Writing Module	The module includes evaluation rubrics for structure, accuracy, vocabulary, and task completion, and outputs a rewritten sample, grammar corrections, and an improvement plan.
YKI Test Preparation (intensive, time-sensitive, all parts)	YKI Engine (Weeks 7-8)	Simulates and scores speaking, writing, listening, and reading tasks, provides a mock exam generator, and predicts the CEFR band (A2.1, B1.2, etc.).
2. What I Would Do Differently and Why
The plan is technically robust, but focusing on user experience and competitive differentiation requires minor adjustments to the sequence and emphasis:

Area	Planned Approach	Recommended Difference & Why
A. Pronunciation	Add a Pronunciation Module later (Phase 3) focusing on phoneme patterns.	Elevate to Week 3: For Finnish, where vowel and consonant length (e.g., tuli vs. tuuli vs. tulli) is phonemic, core pronunciation feedback should be integrated immediately after the voice MVP. This prevents bad habits from forming early, especially in A1/A2 learners.
B. Grammar Correction	Rely on a combined approach of LLM (GPT-4.1) and Omorfi/Rule-Based parsing.	Shift LLM Weight: While the rule-based system is vital for the 15 cases and conjugation, the LLM should be weighted more heavily to judge contextual naturalness and handle the subtleties of puhekieli (spoken Finnish) corrections. Rule-based systems are often too strict for real human conversation.
C. Market Focus	Broad target: foreign workers, students, integration trainees, then companies.	Hyper-Focus on a High-Stakes Niche: Initially focus only on healthcare/nursing professionals in Finland. Passing YKI is often a mandatory, high-stakes requirement for them, justifying the higher price of the YKI Premium tier (€29.99–€39.99/month) and creating a highly relevant, specialized product for this segment.
3. The Things I Would Add
The plan is comprehensive, but the following additions would boost engagement and learning efficacy:

Feature to Add	Description	Connects to Plan
A. Dynamic Role-Play Module	Add scenario templates (e.g., "Complaining to a customer service agent," "Discussing politics with a friend") that force the student to consciously switch between kirjakieli (written/formal) and puhekieli (spoken/colloquial) on demand.	Enhances the planned kirjakieli vs puhekieli mode by making it a directed, practical task.
B. Contextual Cloze Tests	After a conversation where the student makes a mistake (e.g., mixing up the illative and inessive cases), the app should automatically generate a follow-up fill-in-the-blank test using that specific conversation's text, with the missed word/ending omitted.	Directly improves the planned mistake tracking and personalized study plan by immediately reinforcing actual errors.
C. Voice "Shadowing" Practice	A feature where the student hears a native speaker's audio clip and attempts to "shadow" (repeat simultaneously). The Pronunciation Module then scores not just the phonemes but also pitch, rhythm, and intonation contour.	Adds a key competitive feature to the planned Pronunciation Module by focusing on fluency and natural speech patterns, not just discrete sounds.
4. How to Make it Deep and Competitive
The competitive edge lies in the quality of the AI's adaptation and feedback loops.

Strategy	How to Deepen the Plan	Competitive Advantage
A. Hyper-Personalized Remediation	Use the planned Progress Tracking and Analytics to identify specific, recurrent error pairs (e.g., Inessive vs. Elative). The conversation engine should then temporarily restrict topics to those that force the student to use those specific structures repeatedly until mastery is detected.	Static apps offer generic lessons. This provides a hyper-focused, dynamic curriculum that acts like an elite personal tutor, optimizing the student's study time by targeting their precise weak points.
B. Tiered Grammar Explanations	Implement an "Explain Deeper" or "Give Me the Rule" button after any correction. This triggers a second, more complex LLM call to deliver a comprehensive rule explanation with a set of five new, distinct example sentences showing the correct usage, and five examples of common errors.	The Grammar Explanation Engine must support this tiered depth, ensuring that explanations remain simple for basic learners but can scale up to academic-level detail for advanced students.
C. Institutional/B2B Integration	Beyond selling bundles (as planned in Phase 2), create an admin dashboard for institutional clients (nursing agencies, TE Office, vocational schools) that provides aggregated, anonymized data on their students' CEFR band progression and common grammar weaknesses.	Moving from a consumer product to an enterprise training solution with measurable, data-driven outcomes creates a long-term contract model that is far more competitive and stable than pure subscription revenue.

