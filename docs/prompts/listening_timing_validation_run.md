# LISTENING TIMING VALIDATION RUN

You are validating listening section timing behavior.

---

# OBJECTIVE

Ensure listening section allows:

* full prompt playback
* UI transition
* answer selection
* next action

WITHOUT expiry

---

# REQUIRED LOGGING

For listening:

* prompt_start_time
* audio_play_start
* audio_play_end
* next_enabled_time
* question_render_time
* answer_time
* expiry_time

---

# VALIDATION RULE

PASS if:

* answer is submitted before expiry
* next transition succeeds

FAIL if:

* expiry occurs before answer submit

---

# TEST MODE

Run with:

* fixed seed
* no artificial delays
* real device

---

# OUTPUT

docs/audit/listening_timing_validation.md

Include:

* full timeline
* total time spent
* remaining time at each step
* verdict
