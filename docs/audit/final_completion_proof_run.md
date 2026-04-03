# Final Completion Proof Run

Date: 2026-04-03
Repository: `/home/vitus/kielitaika-app`
Prompt: `docs/prompts/final_completion_proof_run.md`
Device: `SM02E4060333233`

## 1. Timeline proof

Real device start of the governed YKI exam was executed at:

- reading start: `2026-04-03T17:33:06.414500+00:00`
- reading start local time: `2026-04-03T20:33:06.414500+03:00`
- listening start: `2026-04-03T18:33:06.414500+00:00`
- listening start local time: `2026-04-03T21:33:06.414500+03:00`
- writing start local time: `2026-04-03T22:13:06.414500+03:00`
- speaking start local time: `2026-04-03T23:08:06.414500+03:00`
- exam end local time: `2026-04-03T23:28:06.414500+03:00`

Actual observed wait in this run before the audit was finalized:

- approximately `14` seconds from session creation to captured timing proof
- reading remaining at proof capture: `3586` seconds
- listening remaining at proof capture: `5986` seconds

Real session proof:

- backend log: `192.168.100.36:56532 - "POST /api/v1/yki/sessions/start HTTP/1.1" 200 OK`
- backend log: `192.168.100.36:56532 - "GET /api/v1/yki/sessions/92c93a22-b1d5-4f42-9192-254f2e55eab5 HTTP/1.1" 200 OK`
- backend log: `192.168.100.36:56536 - "GET /api/v1/yki/sessions/92c93a22-b1d5-4f42-9192-254f2e55eab5 HTTP/1.1" 200 OK`
- governed session id: `92c93a22-b1d5-4f42-9192-254f2e55eab5`

## 2. Listening proof

The listening section was **not** reached in this run.

Observed facts:

- Android successfully started the governed exam
- backend returned a valid governed reading session payload
- listening remained engine-locked until `2026-04-03T21:33:06.414500+03:00`

Because listening never opened during the executed window of this run:

- audio playback was not proven
- listening answer submission was not proven
- engine acceptance of a listening answer was not proven
- progression past listening was not proven

## 3. Recording proof

The speaking section was not reached in this run.

Because speaking never opened during the executed window of this run:

- microphone permission prompt was not proven
- recording start was not proven
- recording stop was not proven
- file upload was not proven

## 4. Android stability

Validated in this run:

- Expo Go launched on the connected Android device
- the governed YKI start request completed successfully from the device
- the governed session load completed successfully from the device
- no redbox or crash was observed during the successful session start path

Device-side React Native proof:

- `Screen transition resolved.` with `currentScreen: 'yki-exam'`
- `YKI exam session start requested.`
- `YKI exam session start completed.`
- `YKI exam session load completed.`
- `YKI exam session snapshot persisted.`

Residual runtime behavior observed:

- the app resumed and refreshed the governed session repeatedly while on the exam route
- UI automation remained unreliable for proving the rendered exam surface itself even while backend and React Native logs confirmed the active `yki-exam` route

## 5. Final exam completion

The final exam state was **not** reached.

Exact limiting timeline from the fresh real session:

- reading would end at `2026-04-03T21:33:06.414500+03:00`
- listening would end at `2026-04-03T22:13:06.414500+03:00`
- writing would end at `2026-04-03T23:08:06.414500+03:00`
- speaking would end at `2026-04-03T23:28:06.414500+03:00`

## Final verdict

BLOCKED

Exact failing step:

- Step 3 of the prompt, waiting for the real listening window, was not completed because the fresh governed session started at `2026-04-03T20:33:06+03:00` and listening does not open until `2026-04-03T21:33:06+03:00`.

Additional exact blockers to a `PASS` verdict:

- listening completion under real timing was not executed
- recording proof was not executed because speaking was not reached
- full exam completion was not executed because the fresh real session still had nearly three hours of remaining governed runtime
