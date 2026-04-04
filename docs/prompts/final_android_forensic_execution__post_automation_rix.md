# FINAL ANDROID FORENSIC EXECUTION (POST-AUTOMATION FIX)

You are executing the same full automated exam run.

The automation surface has been validated.

---

# ADDITIONAL RULE

For all UI interactions:

You MUST attempt element selection in this order:

1. accessibilityLabel
2. resource-id
3. visible text (only as last fallback)

---

# ADDITIONAL VALIDATION

At EACH step:

* confirm element exists in UI tree BEFORE tap
* log which selector succeeded

---

# FAILURE CONDITION EXTENSION

If element exists but tap fails:

* log bounds
* log clickable state
* log parent hierarchy

---

# EVERYTHING ELSE

Remain identical to the original execution prompt.

---

# COMPLETION CRITERIA

UNCHANGED:

* full exam completion
* certification generated
* verdict = PASS
