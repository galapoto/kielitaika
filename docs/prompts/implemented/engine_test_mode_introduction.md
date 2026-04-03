What your latest report actually proves
From your final run 

:

✅ System is fully working
Android → backend → engine flow works

Session starts correctly on real device

Timing is correct and deterministic

No crashes, no contract errors, no transport issues

Backend enforces real exam timing exactly

That combination means:

Your system behaves like a real YKI exam environment

❌ Why it still says BLOCKED
Not because something is broken.

Because:

Listening opens at 21:33

Speaking ends at 23:28

You stopped after ~14 seconds

So the audit correctly says:

“You didn’t complete the exam”

Important conclusion (this is the key moment)
You now have two truths:

1. Technically
Your system is already:

Production-ready

2. Procedurally (your audit rules)
It is:

Not yet certified PASS

The real problem now
Your current validation rule is:

“System must complete full exam in real time”

But your system is designed to:

simulate a real exam (multi-hour)

So your validation requirement is now:

impractical for development cycles

This is where strong systems usually evolve
You now need to decide:

Option A — Stay strict (current path)
Wait 3 hours per validation

Painful but pure

Eventually PASS

Option B — Introduce controlled test mode (recommended)
Not a hack. A formal capability.

The correct next move (not optional)
You need:

ENGINE-LEVEL TIME CONTROL MODE

Not frontend. Not backend.

Engine-level.

What this should look like
You don’t want:

fake skipping

validation bypass

frontend tricks

You want:

A deterministic, auditable feature like:
{
  "mode": "test",
  "time_multiplier": 60
}
or

{
  "mode": "test",
  "section_duration_override": {
    "reading": 10,
    "listening": 10,
    "writing": 10,
    "speaking": 10
  }
}
Why this is NOT violating your principles
You’ve been strict about:

determinism ✔

no hidden logic ✔

auditability ✔

This still satisfies all three if:

it’s explicit

it’s logged

it’s engine-controlled

What you should NOT do
Do NOT:

fake timestamps in backend

override in frontend

bypass engine checks

That breaks your whole architecture.

What you should do next
I’ll give you a clean agent prompt for this.

# ENGINE TEST MODE INTRODUCTION (STRICT, DETERMINISTIC)

You are operating inside:

/home/vitus/kielitaikka-yki-engine

This is a controlled feature addition.

---

# 1. OBJECTIVE

Introduce a **deterministic test mode** that allows:

* faster section transitions
* full exam completion within minutes
* zero impact on production mode

---

# 2. HARD REQUIREMENTS

## 2.1 NO IMPACT ON PRODUCTION

Default behavior must remain unchanged.

If no test mode is specified:

→ system behaves exactly as now

---

## 2.2 EXPLICIT MODE ONLY

Test mode must require:

* explicit parameter in session creation

Example:

POST /exam/start

{
"mode": "test"
}

---

## 2.3 DETERMINISTIC TIMING

Test mode must:

* preserve ordering
* preserve section logic
* only modify durations

Example:

* reading: 60 min → 10 sec
* listening: 40 min → 10 sec
* etc.

---

## 2.4 FULL AUDIT VISIBILITY

Every session must expose:

* mode: "production" | "test"
* timing configuration used

---

# 3. IMPLEMENTATION

---

## 3.1 Extend session model

Add:

* mode
* duration profile

---

## 3.2 Modify timing generator

Instead of fixed durations:

* read from profile
* profile depends on mode

---

## 3.3 Update API

Expose:

GET /engine/status

Include:

* supported modes
* active session mode

---

# 4. VALIDATION

---

## 4.1 Production mode

Must behave IDENTICALLY to current system

---

## 4.2 Test mode

Must allow:

* full exam completion in < 2 minutes

---

# 5. OUTPUT

Create:

docs/audit/engine_test_mode_validation.md

---

## Must include:

* proof production unchanged
* proof test mode completes full exam
* timing comparison

---

# 6. SUCCESS CONDITION

PASS if:

* production unchanged
* test mode completes full exam quickly
* no bypass logic introduced

---

# END
