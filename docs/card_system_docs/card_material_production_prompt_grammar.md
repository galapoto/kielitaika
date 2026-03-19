# Card Material Production Prompt — grammar

Replace only `{{TYPE_CONTEXT}}` before use.

Examples for `{{TYPE_CONTEXT}}`:

- `nursing`
- `doctor`
- `IT`
- `Electrical Engineer`

---

You are generating **grammar cards** for the KieliTaika card system.

Your output must match the **current backend schema**, not a loose custom schema.

## Objective

Generate grammar learning material for `{{TYPE_CONTEXT}}` that compiles into valid `CardEnvelope` objects for the current runtime.

## Output format

Return exactly one JSON object with two keys:

- `cards`
- `sidecar`

### `cards`

A JSON array of final schema-valid `grammar_card` payloads.

### `sidecar`

A JSON array of sidecar production objects. Each must include:

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
- `content_type` = `grammar_card`
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

### Grammar content shape

`content.front` must contain:

- `rule_label`
- `pattern`
- `example`

`content.back` must contain:

- `recall_prompt`
- `rule_summary`
- `target_form`

`content.prompt_family` must be:

- `grammar_memory`

`content.audio` must be:

- `null`

## Current schema limitation you must respect

The current grammar schema does **not** allow:

- `reverse_recall`
- `context_mcq`

Do not emit those literal variant types on grammar cards.

## Required pedagogical test matrix per grammar item

Each grammar card must still cover these five pedagogical intents:

1. recognition
2. recall
3. reverse
4. completion
5. context_mcq

### Required schema mapping

Map them like this:

- recognition -> `recognition_mcq`
- recall -> `typed_recall`
- reverse -> `grammar_application`
- completion -> `fill_in`
- context_mcq -> `recognition_mcq` with a contextual grammar prompt

Put all five pedagogical intents into `content.follow_ups` using schema-safe variants.

## Important validator rules

- `recognition_mcq` must have `accepted_variants: []`
- `typed_recall`, `fill_in`, and `grammar_application` must have at least one accepted variant distinct from `answer_key`
- `fill_in.blank_template` must include `___`
- MCQ option count must be between 2 and 6
- `grammar_application` must include:
  - `stimulus_text`
  - `evaluation_basis.rule_id`
  - `evaluation_basis.expected_feature`
  - optional `evaluation_basis.evaluation_notes`
- No extra keys are allowed anywhere in final cards

## Front/back content rules

- `front.pattern` is what the current runtime exposes as the visible front text
- keep `front.pattern` short, Finnish, and directly useful
- `front.rule_label` may be more descriptive, but do not rely on it as the primary visible front
- `content.back.recall_prompt` must be concise and usable as the visible back prompt

## Path/domain/profession mapping

Infer the correct scope from `{{TYPE_CONTEXT}}`:

- nursing -> `path=professional`, `domain=healthcare`, `profession.track=nurse`, `slug=nurse`, `label=Nurse`
- doctor -> `path=professional`, `domain=healthcare`, `profession.track=doctor`, `slug=doctor`, `label=Doctor`
- IT -> `path=professional`, `domain=workplace_communication`, `profession.track=other`, `slug=it`, `label=IT`
- Electrical Engineer -> `path=professional`, `domain=workplace_communication`, `profession.track=other`, `slug=electrical_engineer`, `label=Electrical Engineer`
- if the grammar is general/YKI support, use `path=general`, `domain=yki_support`, `profession.track=none`

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

- grammar point must be clearly teachable and contextualized
- examples must feel real for `{{TYPE_CONTEXT}}`
- recognition options must contrast plausible forms
- reverse intent must be expressed through `grammar_application`
- context MCQ intent must be expressed through a contextual `recognition_mcq`

## Return shape

Return:

```json
{
  "cards": [],
  "sidecar": []
}
```
