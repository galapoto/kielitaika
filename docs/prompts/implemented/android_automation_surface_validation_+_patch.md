# ANDROID AUTOMATION SURFACE VALIDATION + PATCH PROMPT

You are NOT running the exam.

You are validating and fixing the UI so that automation can control it.

---

# OBJECTIVE

Ensure all YKI navigation controls are:

* discoverable in Android UI hierarchy
* uniquely identifiable
* tappable via automation

---

# 1. TARGET ELEMENTS

You MUST verify these exist in UI dump:

* yki-next-button
* yki-start-button
* yki-submit-button
* yki-play-audio
* yki-pause-audio
* yki-record-start
* yki-record-stop

---

# 2. UI TREE VALIDATION

For each screen:

Run:
adb shell uiautomator dump
adb pull /sdcard/window_dump.xml

Verify:

* element exists
* label present
* role = button
* clickable = true

---

# 3. PATCH REQUIREMENTS

If ANY control is missing:

You MUST:

* add accessibilityRole="button"
* add accessibilityLabel (stable, constant)
* add testID
* ensure it is rendered at top interaction layer

---

# 4. AUTOMATION PROBE TEST

Write a minimal automation script:

* launch app
* go to reading screen
* ONLY tap "yki-next-button"

If tap succeeds → PASS
If not → FAIL with reason

---

# 5. HARD FAILURE CONDITIONS

FAIL if:

* element not in UI dump
* multiple elements share same label
* element not clickable
* element blocked by parent container

---

# 6. OUTPUT

docs/audit/android_automation_surface_validation.md

Include:

* UI dump snippets
* element visibility proof
* tap success/failure
* patch summary

---

# COMPLETION CRITERIA

Task is complete ONLY when:

* "yki-next-button" is detectable AND tappable via automation
