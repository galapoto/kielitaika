# RUNNER SETTLEMENT PROTOCOL (MANDATORY)

After EVERY user action:

1. Record current state:

   * view_key
   * step_id
   * session_hash (if available)

2. Perform action (tap)

3. Enter wait loop (max 5–8 seconds):

   Repeat:

   * fetch latest session (backend)
   * dump UI tree

   Exit when ANY of:

   A. view_key changed
   B. step_id changed
   C. UI reflects next state
   D. action result visible (e.g. answer selected + locked)

4. If no change after timeout:

   FAIL with:

   * last known state
   * backend response (if any)
   * UI snapshot

---

# IMPORTANT RULE

NEVER proceed to next step unless state change is confirmed.
