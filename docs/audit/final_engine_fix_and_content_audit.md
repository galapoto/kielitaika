# Final Engine Fix And Content Audit

Date: 2026-04-03
Repository: `/home/vitus/kielitaika-app`
Prompt: `docs/prompts/engine_test_mode_correction_+_content_diversity_forensic.md`
Android device: `SM02E4060333233`

## 1. Engine Fix Summary

Old behavior:

- engine `test` mode kept the full exam task graph
- previous governed audit measured about `55` runtime steps
- a fresh production-shaped sample still measured `47` runtime steps
- engine `test` timing was `10 + 10 + 10 + 10 = 40` seconds total
- result: full completion was structurally impossible before `SECTION_EXPIRED`

New behavior:

- test mode now generates a reduced graph
- selected task counts in test mode are:
  - reading: `1`
  - listening: `1`
  - writing: `1`
  - speaking: `1`
- reading and listening are truncated to `1` question each in test mode
- effective governed runtime step count is now `8`
  - reading: `2`
  - listening: `2`
  - writing: `2`
  - speaking: `2`
- test mode timing is now:
  - reading: `20` seconds
  - listening: `20` seconds
  - writing: `15` seconds
  - speaking: `15` seconds
  - total: `70` seconds

Determinism fix:

- same explicit seed now produces the same reduced test exam
- different seeds now produce different reduced test exams
- before the fix, `exam_generator_v3_2.py` always selected the first sorted items and ignored seed variation entirely

Validated:

- `venv/bin/python -m unittest engine.tests.test_engine_test_mode`
- result: `7` tests passed

## 2. Content Bank Metrics

Certified engine bank:

| Section | Certified tasks | Unique passage/prompt fingerprints | Unique source fingerprints | Runtime-selectable B1_B2 tasks |
| --- | ---: | ---: | ---: | ---: |
| Reading | 2111 | 1655 | 144 | 965 |
| Listening | 618 | 615 | 3 | 227 |
| Writing | 5467 | 5183 | 5 | 2046 |
| Speaking | 1510 | 621 | 3 | 644 |

Learning/card-side content:

- modules: `3`
- total learning units: `25`
- vocabulary units: `12`
- phrase units: `7`
- grammar units: `6`

Daily-practice pre-fix effective pool:

- fixed hard-coded catalog of `3` exercises
- no session variation

Daily-practice post-fix effective pool:

- session now samples from the learning repository exercise bank
- session size remains `3`
- each session now rotates across vocabulary, phrase, and grammar-derived exercises

## 3. Rotation Evidence

10 consecutive reduced test-mode generations with seeds `run-1` through `run-10`:

| Run | Reading | Listening | Writing | Speaking |
| --- | --- | --- | --- | --- |
| 1 | `ea8716fe` | `833250b5` | `809c4c7e` | `bf189cb1` |
| 2 | `7e6bb71c` | `a3146a14` | `15636a03` | `fbe0598e` |
| 3 | `8840c3bb` | `6231a2bf` | `a4388b2e` | `bd4c4525` |
| 4 | `f57f3b96` | `f89a3663` | `33aa67c1` | `ffe0ef95` |
| 5 | `c791d0e5` | `82f50635` | `12a8b70b` | `a5e482c3` |
| 6 | `ecea4ba3` | `a5fd9e8e` | `04fac500` | `611e0418` |
| 7 | `dc86385a` | `f02b6dfc` | `0a7022d5` | `aaa37576` |
| 8 | `fdf82a86` | `ab5a0d35` | `d250a5b5` | `2ecbb0cb` |
| 9 | `d797ca30` | `028e112a` | `c0b905e5` | `82b5d350` |
| 10 | `68103a67` | `6fc9531d` | `32d9db6b` | `2034716f` |

Measured variation:

- unique reading tasks across 10 runs: `10/10`
- unique listening tasks across 10 runs: `10/10`
- unique writing tasks across 10 runs: `10/10`
- unique speaking tasks across 10 runs: `10/10`
- maximum dominance for any single item in any section: `1/10`

Determinism proof:

- same seed => same reading and listening selections
- different seed => different full section signature

## 4. Card System Audit

Root issue found:

- `apps/backend/practice/engine.py` previously returned the same `3` hard-coded exercises every session

Fix applied:

- daily practice now builds candidates from the learning repository exercise bank
- session selection is seeded per session
- same session seed => stable result
- different session seed => different result
- the previous session selection is avoided when possible

10 consecutive daily-practice session seeds:

1. `daily-grammar-question-forms-fill-blank`, `daily-vocab-tyo-word-to-translation`, `daily-phrase-voinko-siirtaa-kokousta-choose-correct-phrase`
2. `daily-grammar-conjunctions-sentence-correction`, `daily-phrase-minulla-on-iltavuoro-choose-correct-phrase`, `daily-vocab-ilta-word-to-translation`
3. `daily-phrase-asun-helsingissa-choose-correct-phrase`, `daily-vocab-aamu-word-to-translation`, `daily-grammar-verb-present-fill-blank`
4. `daily-grammar-verb-present-fill-blank`, `daily-phrase-minulla-on-iltavuoro-complete-sentence`, `daily-vocab-ilta-translation-to-word`
5. `daily-phrase-minulla-on-iltavuoro-choose-correct-phrase`, `daily-vocab-asua-word-to-translation`, `daily-grammar-question-forms-sentence-correction`
6. `daily-grammar-question-forms-sentence-correction`, `daily-phrase-missa-asema-on-choose-correct-phrase`, `daily-vocab-aamu-translation-to-word`
7. `daily-vocab-asua-word-to-translation`, `daily-phrase-lahetin-sahkopostin-choose-correct-phrase`, `daily-grammar-time-adverbs-fill-blank`
8. `daily-phrase-missa-asema-on-complete-sentence`, `daily-vocab-oikea-translation-to-word`, `daily-grammar-time-adverbs-sentence-correction`
9. `daily-grammar-conjunctions-fill-blank`, `daily-vocab-asema-translation-to-word`, `daily-phrase-missa-asema-on-complete-sentence`
10. `daily-vocab-vasen-word-to-translation`, `daily-phrase-missa-asema-on-choose-correct-phrase`, `daily-grammar-object-cases-fill-blank`

## 5. Identified Issues

1. Engine test mode reduced only time, not graph size.
2. Engine exam selection ignored per-session variation and defaulted to first sorted items.
3. Engine start API had no explicit seed channel for reproducibility proofs.
4. Daily practice was degenerate: fixed `3`-exercise catalog, zero rotation.

## 6. Fixes Applied

Engine:

- added seeded task selection instead of first-item deterministic bias
- added reduced test-mode blueprint `1/1/1/1`
- trimmed reading/listening test tasks to one question each
- aligned test-mode timing to `20/20/15/15`
- persisted and reused session seed in the engine runtime
- exposed explicit optional `seed` on `/exam/start`

App daily practice:

- replaced fixed 3-item catalog with learning-repository-derived exercise candidates
- added session-seeded selection
- added intra-session diversity by unit and content kind
- added previous-session avoidance when possible

## 7. Android Full Execution Proof

Post-fix live proof completed:

- corrected engine live status returned:
  - `timing_profiles.test.reading = 20`
  - `timing_profiles.test.listening = 20`
  - `timing_profiles.test.writing = 15`
  - `timing_profiles.test.speaking = 15`
- backend `/engine/health` returned `OK`
- Android device started a fresh governed test-mode session after the fix
- backend captured:
  - `POST /api/v1/yki/sessions/start` from `192.168.100.36` -> `200 OK`
  - forwarded engine payload: `{"level_band": "B1_B2", "mode": "test"}`
- Android-started post-fix governed session id:
  - `2562c8cf-8b69-434e-9840-7bc6ac7a69f7`

Not completed in this pass:

- full on-device reading/listening/writing/speaking completion
- certification generation from an Android-completed session
- end-to-end Android media lifecycle proof

Observed terminal state on device after the fresh post-fix run:

- `Runtime Blocked`
- backend later returned `SECTION_EXPIRED` for the started device session

## 8. FINAL VERDICT

FAIL

Exact blocking cause:

- the engine test-mode contract failure is fixed
- the engine content-selection bias is fixed
- the daily-practice/card diversity bug is fixed
- but the prompt requires a full Android exam completion with certification proof, and that was not completed in this pass
- because the final Android end-to-end completion proof is missing, a `PASS` verdict is not defensible
