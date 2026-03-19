# Card Material Production Prompt — vocabulary

Replace only `{{TYPE_CONTEXT}}` before use.

Examples for `{{TYPE_CONTEXT}}`:

- `nursing`
- `doctor`
- `IT`
- `Electrical Engineer`

---

You are generating **vocabulary cards** for the KieliTaika card system.

Your output must match the **current backend schema**, not a loose custom schema.

## Objective

Generate vocabulary learning material for `{{TYPE_CONTEXT}}` that can be compiled directly into valid `CardEnvelope` objects and imported into the current runtime.

## Output format

Return exactly one JSON object with two keys:

- `cards`
- `sidecar`

### `cards`

A JSON array of final schema-valid `vocabulary_card` payloads.

### `sidecar`

A JSON array of generator-sidecar objects. Each sidecar item must include:

- `card_id`
- `follow_up_questions`
- `transformations`
- `metadata`
- `requested_test_matrix`
- `schema_mapping`

Do not return prose outside the JSON object.

## Hard schema rules

### Final card envelope

Every card in `cards` must include:

- `id`
- `version`
- `content_type` = `vocabulary_card`
- `path`
- `domain`
- `profession`
- `level_band`
- `difficulty`
- `language` = `fi`
- `source`
- `quality`
- `tags`
- `publication`
- `content`

### Vocabulary content shape

`content.front` must contain:

- `term`
- `lemma`
- `part_of_speech`

`content.back` must contain:

- `recall_prompt`
- `gloss`
- `example_sentence`

`content.prompt_family` must be:

- `vocabulary_memory`

`content.audio` must be:

- `null`

`content.validation` must contain:

- `case_sensitive`
- `normalize_whitespace`
- `allow_partial_credit`

## Required test matrix per vocabulary item

Each vocabulary card must include all five pedagogical test modes as follow-up variants:

1. recognition -> `recognition_mcq`
2. recall -> `typed_recall`
3. reverse -> `reverse_recall`
4. completion -> `fill_in`
5. context_mcq -> `context_mcq`

Put all five inside `content.follow_ups`.

## Important validator rules

- `recognition_mcq` and `context_mcq` must have `accepted_variants: []`
- `typed_recall`, `reverse_recall`, and `fill_in` must have at least one accepted variant distinct from `answer_key`
- `fill_in.blank_template` must include `___`
- MCQ option count must be between 2 and 6
- No extra keys are allowed anywhere in final cards

## Front/back content rules

- front-visible content must be Finnish only
- English belongs in `content.back.gloss`, in reverse targets, or in explanations
- `content.back.recall_prompt` must be short and directly usable as the visible back prompt in the current runtime

## Path/domain/profession mapping

Infer the correct scope from `{{TYPE_CONTEXT}}`:

- nursing -> `path=professional`, `domain=healthcare`, `profession.track=nurse`, `slug=nurse`, `label=Nurse`
- doctor -> `path=professional`, `domain=healthcare`, `profession.track=doctor`, `slug=doctor`, `label=Doctor`
- IT -> `path=professional`, `domain=workplace_communication`, `profession.track=other`, `slug=it`, `label=IT`
- Electrical Engineer -> `path=professional`, `domain=workplace_communication`, `profession.track=other`, `slug=electrical_engineer`, `label=Electrical Engineer`
- if the context is not profession-specific, use `path=general`, `domain=general_finnish`, `profession.track=none`

## Difficulty rule

Use only:

- `intro`
- `core`
- `stretch`

## Source/quality/publication defaults

Use:

- `source.kind = "generated_pipeline"`
- `quality.status = "reviewed"`
- `publication.state = "validated"`
- `publication.validation_passed = true`
- `publication.published_at = null`
- `publication.archived_at = null`

## Sidecar requirements

For every card, sidecar must include:

- `follow_up_questions`: at least 4
- `transformations`: at least 3
- `metadata.source`
- `metadata.cefr_level`
- `metadata.topic`
- `metadata.semantic_tags`

## Quality bar

- vocabulary must feel real for `{{TYPE_CONTEXT}}`
- example sentences must be natural
- distractors must be plausible but wrong
- context MCQ must feel like a real workplace or real-life sentence
- no artificial nonsense sentences

## Return shape

Return:

```json
{
  "cards": [],
  "sidecar": []
}
```
