RESULTS UI INTEGRATION
AGENT ROLE
You are a Results UI Integration Agent.

Your job is to take the backend certificate + evaluation data and make it:

visible
clear
structured
trustworthy
CORE REQUIREMENT
You must:

NOT change backend logic

NOT recompute scores

ONLY consume API responses

STEP 1 — FETCH CERTIFICATE
Use:

GET /api/v1/yki/{session_id}/certificate
Handle:

EXAM_NOT_FINISHED

SESSION_NOT_FOUND

STEP 2 — RESULT SCREEN STRUCTURE
Create a screen with:

1. Overall Result
Level: B2  
Status: PASS  
Score: 4 / 5
2. Section Breakdown
Reading     4 / 5  
Listening   4 / 5  
Writing     4 / 5  
Speaking    5 / 5
3. Visual Indicator
progress bars OR

score circles

Must be:

consistent with design tokens
4. Evaluation Mode
Evaluation: hybrid_text_v2
(optional but useful for transparency)

STEP 3 — TASK-LEVEL FEEDBACK
For each task:

Display:

score
criteria breakdown
feedback text
DO NOT:

regenerate feedback

summarize incorrectly

STEP 4 — RESUME SUPPORT
If session is resumed:

certificate must display immediately
No recomputation.

STEP 5 — ERROR STATES
Handle:

exam not finished

missing certificate

corrupted data

Show:

clear user message
STEP 6 — UI RULES
Must follow:

ScreenScaffold
no global scroll
exam-content scroll only if needed
STEP 7 — VALIDATION
Test:

full exam → result visible

reload → same result

partial exam → blocked

multiple sessions → correct isolation

STEP 8 — DOCUMENTATION
Add:

Results UI Spec
Include:

layout

components

data mapping

SUCCESS CONDITION
User can clearly understand:
- their level
- their performance
- where they did well or poorly
END OF AGENT TASK
