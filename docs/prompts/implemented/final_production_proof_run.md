FINAL PRODUCTION PROOF RUN (NO REFACTOR, NO SPECULATION)

You are operating inside:

/home/vitus/kielitaika-app

This is NOT a refactor task.

This is NOT a cleanup task.

This is a STRICT PROOF EXECUTION TASK.

0. RULES

You MUST NOT:

refactor working systems
redesign anything
introduce abstractions
remove code unless it directly blocks execution

You MUST:

execute real flows
prove behavior
fix ONLY what blocks execution
1. PRIMARY OBJECTIVE

Produce a PASS verdict by proving:

Full YKI exam flow works with real engine timing
Android app completes exam without failure
Media lifecycle works end-to-end
2. FULL REAL ENGINE EXECUTION (MANDATORY)

You must:

Start governed exam
Complete reading section
WAIT for listening window (REAL TIME — no skipping)
Submit listening answer
Confirm engine accepts answer
Confirm progression to next section
REQUIREMENTS
You MUST wait for the real timing window
You MUST NOT simulate or skip
You MUST capture proof (logs or responses)
3. ANDROID FULL FLOW (MANDATORY)

You must execute on REAL DEVICE:

Flow:
launch app
start exam
complete reading
complete listening
VERIFY:
no crash
no redbox
no navigation loop
no transport error
4. MEDIA LIFECYCLE (MANDATORY)

You must explicitly verify:

4.1 Playback
listening audio plays
audio stops on navigation
no overlapping audio
4.2 Recording
permission prompt appears
recording starts
recording stops
file is created
file is sent successfully
4.3 Background behavior
no orphan audio
no stuck playback
deterministic cleanup
5. TRANSPORT CONFIRMATION (ANDROID)

You must prove:

device calls backend successfully
not just TCP — actual HTTP success

Verify:

/health
/engine/health
/api/v1/yki/sessions/start
6. TYPESCRIPT (LIMITED SCOPE)

You are NOT fixing the whole UI.

You must:

identify errors that block runtime behavior
fix ONLY critical ones

Ignore:

cosmetic typing issues
unused types
UI warnings
7. OUTPUT REPORT

Create:

docs/audit/final_production_proof_run.md

MUST INCLUDE:
1. Engine proof
timestamps
listening submission success
section progression
2. Android proof
device execution summary
no crash confirmation
3. Media proof
playback result
recording result
permission result
4. Transport proof
actual HTTP responses
5. Remaining issues (if any)

ONLY real blockers allowed

8. FINAL VERDICT

Must be one of:

PASS → system is production-ready
BLOCKED → must list exact failure with reproduction steps
SUCCESS CONDITION

The system is PASS only if:

listening completed under real engine timing
Android completes exam end-to-end
media lifecycle works fully
no transport errors
END
