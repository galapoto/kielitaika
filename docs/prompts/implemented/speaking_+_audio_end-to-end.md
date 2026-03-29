SPEAKING + AUDIO END-TO-END
AGENT ROLE
You are an Audio Interaction Agent.

Your job is to connect:

microphone → recording → upload → backend → session state → UI
OBJECTIVE
Enable full speaking task flow:

user records → submits → backend stores → UI reflects answered state
CONSTRAINTS
You are NOT allowed to:

change backend contract

change session structure

simulate audio (must use real recording flow)

bypass session/task validation

STEP 1 — MICROPHONE UI
FILE
YkiExamScreen.tsx
ADD
A microphone button:

Start Recording
Stop Recording
Submit Audio
STEP 2 — RECORD AUDIO
USE
For Expo / React Native:

expo-av
IMPLEMENT
import { Audio } from 'expo-av';
FLOW
const recording = new Audio.Recording();

await recording.prepareToRecordAsync(Audio.RECORDING_OPTIONS_PRESET_HIGH_QUALITY);
await recording.startAsync();
Stop:

await recording.stopAndUnloadAsync();
const uri = recording.getURI();
STEP 3 — UPLOAD AUDIO
SERVICE
POST /api/v1/yki/{session_id}/task/audio
PAYLOAD
{
  "audio": "<audio-file-ref>"
}
NOTE
You may first:

upload file → get reference → send reference
OR:

send base64 (temporary)
STEP 4 — UI STATE UPDATE
After success:

setTaskStatus("answered");
setFeedback("Audio received");
STEP 5 — RESUME SUPPORT
On resume:

If:

task.status === "answered"
UI must show:

✔ Answer submitted
NOT:

show microphone again
STEP 6 — VALIDATION
TEST 1 — record + submit
✔ backend receives audio
✔ task marked answered

TEST 2 — reload
✔ speaking task remains answered

TEST 3 — wrong section
✔ NOT_SPEAKING_SECTION enforced

TEST 4 — duplicate submit
✔ TASK_ALREADY_ANSWERED

STEP 7 — DOCUMENTATION
Update:

docs/project_plans/monorepo_structure.md
Add:

Speaking Flow
recording

upload

persistence

resume behavior

VALIDATION CHECKLIST
✔ audio recorded
✔ audio uploaded
✔ backend updated
✔ UI reflects state
✔ resume works

FAILURE CONDITIONS
audio not persisted

UI resets after reload

duplicate submissions allowed

SUCCESS CONDITION
Speaking tasks work end-to-end with persistence and recovery
END OF AGENT TASK
