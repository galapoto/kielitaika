# Updated Card System Integration Detailed Plan — integration_architect

Date: 2026-03-19  
Scope: exact material-production requirements for cards that validate against the **current** backend schema and behave correctly in the current card runtime/UI.

## 1. What is authoritative

This document is grounded in the current local files:

- [Learning_Card_Screen_UI_Specification.md](/home/vitus/Documents/puhis/ui_design/the_card_ui/Learning_Card_Screen_UI_Specification.md)
- [cards.py](/home/vitus/Documents/puhis/backend/app/cards/schemas/cards.py)
- [content.py](/home/vitus/Documents/puhis/backend/app/cards/schemas/content.py)
- [follow_ups.py](/home/vitus/Documents/puhis/backend/app/cards/schemas/follow_ups.py)
- [common.py](/home/vitus/Documents/puhis/backend/app/cards/schemas/common.py)
- [publication.py](/home/vitus/Documents/puhis/backend/app/cards/schemas/publication.py)
- [card_mapper.py](/home/vitus/Documents/puhis/backend/app/cards/runtime/mappers/card_mapper.py)
- [sample_payloads.py](/home/vitus/Documents/puhis/backend/app/cards/fixtures/sample_payloads.py)
- [card_builder.py](/home/vitus/Documents/puhis/backend/app/cards/ingestion/builders/card_builder.py)

If an agent follows this document exactly, the produced final card payloads will match the current backend schema.

## 2. Critical truth: your loose card object is not the current schema

Your conceptual card object is useful as a production model, but it is **not** the final validated runtime schema.

The current backend uses a strict `CardEnvelope` shape with `extra="forbid"`. That means:

- unknown top-level fields are rejected
- unknown nested fields are rejected
- `type`, `test_type`, `front_content`, `back_content`, `correct_answer`, `follow_up_questions`, `transformations`, and freeform top-level `metadata` are **not** valid final schema fields

### 2.1 Concept-to-schema mapping

| Concept in your spec | Current schema field | Notes |
|---|---|---|
| `id` | `id` | Required. Lowercase identifier pattern only. |
| `type` = vocab/grammar/sentence | `content_type` | Must be `vocabulary_card`, `grammar_card`, or `sentence_card`. |
| `test_type` | `content.follow_ups[*].variant_type` | A card can contain multiple follow-up variants. |
| `front_content` | `content.front.*` | Shape depends on content type. |
| `back_content` | `content.back.*` | Shape depends on content type. |
| `correct_answer` | `follow_ups[*].answer_key` | Some card types also mirror the answer in `content.back`. |
| `options` | `follow_ups[*].options` | Only for `recognition_mcq` and `context_mcq`. |
| `follow_up_questions[]` | sidecar only | Not allowed in final envelope. Keep in generator output sidecar. |
| `transformations[]` | sidecar only | Not allowed in final envelope. Keep in generator output sidecar. |
| `domain` | top-level `domain` | Must be enum-safe. |
| `profession` | top-level `profession` | Must be a full object, not a string. |
| `difficulty` | top-level `difficulty` | Must be `intro`, `core`, or `stretch`. |
| `metadata {}` | sidecar only, plus `source`/`quality`/`tags`/`publication` | Freeform metadata is forbidden in final schema. |

## 3. What the final validated card must look like

Every final card must be a valid `CardEnvelope`.

### 3.1 Required top-level fields

- `id`
- `version`
- `content_type`
- `path`
- `domain`
- `profession`
- `level_band`
- `difficulty`
- `language`
- `source`
- `quality`
- `tags`
- `publication`
- `content`

### 3.2 Allowed enums

#### `content_type`
- `vocabulary_card`
- `sentence_card`
- `grammar_card`

#### `path`
- `general`
- `professional`

#### `domain`
- `general_finnish`
- `yki_support`
- `workplace_communication`
- `healthcare`

#### `profession.track`
- `none`
- `general_workplace`
- `doctor`
- `nurse`
- `practical_nurse`
- `other`

#### `level_band`
- `A1`
- `A2`
- `A1_A2`
- `B1`
- `B2`
- `B1_B2`
- `C1`
- `C2`
- `C1_C2`

#### `difficulty`
- `intro`
- `core`
- `stretch`

#### `language`
- `fi`

### 3.3 Path/domain/profession rules you must not break

#### General cards
- `path` must be `general`
- `profession.track` must be `none`
- `profession.slug` must be `null`
- `profession.label` must be `null`
- `domain` must be `general_finnish` or `yki_support`

#### Professional cards
- `path` must be `professional`
- `profession.track` must not be `none`
- `profession.slug` and `profession.label` are both mandatory
- `domain` must be `workplace_communication` or `healthcare`

## 4. UI-driven production implications from the current learning-card screen

From [Learning_Card_Screen_UI_Specification.md](/home/vitus/Documents/puhis/ui_design/the_card_ui/Learning_Card_Screen_UI_Specification.md), the current UI wants:

- one focused card at a time
- front and back behavior
- audio button on the card
- skip action
- recall navigation
- concise, single-item display

From [card_mapper.py](/home/vitus/Documents/puhis/backend/app/cards/runtime/mappers/card_mapper.py), the runtime currently displays:

- vocabulary front text: `content.front.term`
- sentence front text: `content.front.sentence`
- grammar front text: `content.front.pattern`
- back prompt: `content.back.recall_prompt`

That means:

- vocabulary front must contain only the Finnish term
- sentence front must contain only the Finnish sentence
- grammar `pattern` is what the runtime exposes as the visible front text, not `rule_label`
- `back.recall_prompt` must be short and directly usable as the visible back-side prompt

## 5. Audio rule for “100% works with current schema”

The current schema allows `content.audio` to be either:

- `null`
- a valid `SingleAudioContent`
- a valid `DialogueAudioContent`

For strict compatibility today:

- `audio: null` is valid
- pre-generated audio is optional at production time
- if you include audio, it must follow the exact nested audio schema

### 5.1 Safe recommendation

For material generation:

- emit `audio: null` in final card payloads
- emit audio generation instructions in the sidecar package
- let publication/runtime audio generation attach or synthesize audio later

### 5.2 If you do include single-speaker audio, the shape is:

```json
{
  "type": "single",
  "asset_ids": ["audio_card_vocab_nurse_potilas_0001"],
  "duration_seconds": 1.42,
  "transcript_visible": false,
  "speakers": [
    {
      "speaker_id": "narrator",
      "speaker_label": "Narrator",
      "voice_profile": "yki_standard_female"
    }
  ],
  "segments": [
    {
      "asset_id": "audio_card_vocab_nurse_potilas_0001",
      "speaker_id": "narrator",
      "speaker_label": "Narrator",
      "voice_profile": "yki_standard_female",
      "sequence_index": 0,
      "transcript_visible": false,
      "duration_seconds": 1.42,
      "pause_after_ms": 0
    }
  ]
}
```

## 6. Production package rule: final cards plus sidecar

Because the final schema forbids freeform fields, the production pipeline should emit **two artifacts**.

### 6.1 Artifact A: final validated cards

This is the JSON list that must validate as `CardEnvelope[]`.

### 6.2 Artifact B: sidecar production package

This sidecar is where you keep the extra production information your design requires:

- `follow_up_questions`
- `transformations`
- freeform `metadata`
- distractor provenance
- difficulty rationale
- audio generation instructions
- CEFR notes
- source sentence pools

### 6.3 Recommended sidecar shape

```json
{
  "card_id": "card.vocab.nurse.potilas.0001",
  "pedagogical_type": "vocabulary",
  "requested_test_matrix": [
    "recognition",
    "recall",
    "reverse",
    "completion",
    "context_mcq"
  ],
  "schema_mapping": {
    "recognition": "recognition_mcq",
    "recall": "typed_recall",
    "reverse": "reverse_recall",
    "completion": "fill_in",
    "context_mcq": "context_mcq"
  },
  "follow_up_questions": [
    "Produce a full sentence with 'potilas'.",
    "Change the sentence into plural.",
    "Replace the subject with 'hoitaja'.",
    "Use the word in genitive."
  ],
  "transformations": [
    {"label": "plural", "value": "potilaat"},
    {"label": "genitive", "value": "potilaan"},
    {"label": "partitive", "value": "potilasta"}
  ],
  "metadata": {
    "source": "generated_v1",
    "cefr_level": "A2",
    "topic": "healthcare",
    "semantic_tags": ["patient", "clinic", "waiting"]
  },
  "audio_plan": {
    "mode": "generate_later",
    "speaker_id": "narrator",
    "voice_profile": "yki_standard_female"
  }
}
```

## 7. Follow-up variant compatibility matrix

### 7.1 Vocabulary cards

Allowed directly in current schema:

- `recognition_mcq`
- `typed_recall`
- `reverse_recall`
- `fill_in`
- `context_mcq`

### 7.2 Sentence cards

Allowed directly in current schema:

- `recognition_mcq`
- `typed_recall`
- `reverse_recall`
- `fill_in`
- `context_mcq`

### 7.3 Grammar cards

Allowed directly in current schema:

- `recognition_mcq`
- `typed_recall`
- `fill_in`
- `grammar_application`

Not allowed directly in current grammar schema:

- `reverse_recall`
- `context_mcq`

### 7.4 Required grammar compatibility mapping

To stay at 100% compatibility with the current schema:

| Pedagogical intent | Current grammar-safe schema variant |
|---|---|
| recognition | `recognition_mcq` |
| recall | `typed_recall` |
| completion | `fill_in` |
| reverse (form -> function) | `grammar_application` |
| context MCQ | `recognition_mcq` with a contextual prompt and contextual options |

If you need literal `reverse_recall` or literal `context_mcq` on grammar cards, the schema must be extended first. Do **not** emit those variants today if you want validation to pass.

## 8. Validation constraints that agents usually miss

### 8.1 Distinct accepted variants are required

For these follow-up types:

- `typed_recall`
- `fill_in`
- `reverse_recall`
- `grammar_application`

`accepted_variants` must contain at least one value in addition to `answer_key`.

Safe pattern:

- `answer_key`: `"potilas"`
- `accepted_variants`: `["Potilas"]`

Unsafe pattern:

- `answer_key`: `"potilas"`
- `accepted_variants`: `["potilas"]`

### 8.2 MCQ option count

- minimum `2`
- maximum `6`

### 8.3 MCQ accepted variants

For:

- `recognition_mcq`
- `context_mcq`

`accepted_variants` must be an empty list.

### 8.4 Fill-in blank marker

`fill_in.blank_template` must contain `___`.

### 8.5 Identifier constraints

- `id`, `source.source_id`, `publication.version_tag`, `publication.manifest_ref`, and `profession.slug` must match backend identifier rules
- lowercase letters, digits, `.`, `_`, `:`, `-`
- no spaces

### 8.6 Tags

- lowercase only
- safe characters only
- recommended: topic, grammar focus, profession, CEFR hint

## 9. Exact full example: vocabulary card with all five required variants

This is a schema-valid `vocabulary_card` example for a professional healthcare nurse deck.

```json
{
  "id": "card.vocab.nurse.potilas.0001",
  "version": 1,
  "content_type": "vocabulary_card",
  "path": "professional",
  "domain": "healthcare",
  "profession": {
    "track": "nurse",
    "slug": "nurse",
    "label": "Nurse"
  },
  "level_band": "A2",
  "difficulty": "intro",
  "language": "fi",
  "source": {
    "source_id": "source.generated.nurse.vocabulary",
    "kind": "generated_pipeline",
    "origin_path": "backend/practice/generated/nurse/vocabulary/potilas.json",
    "authoring_note": "generated vocabulary card with full five-variant matrix"
  },
  "quality": {
    "status": "reviewed",
    "reviewer": "card-generator",
    "validation_checks": ["schema_validation", "domain_review"],
    "quality_score": 0.91
  },
  "tags": ["healthcare", "nurse", "patient", "a2"],
  "publication": {
    "state": "validated",
    "version_tag": "cards_generated_nurse_2026_03",
    "manifest_ref": "manifest.generated.nurse.vocabulary",
    "validation_passed": true,
    "published_at": null,
    "archived_at": null
  },
  "content": {
    "front": {
      "term": "potilas",
      "lemma": "potilas",
      "part_of_speech": "noun"
    },
    "back": {
      "recall_prompt": "Choose or produce the correct meaning for 'potilas'.",
      "gloss": "patient",
      "example_sentence": "Potilas odottaa lääkärin vastaanotolla."
    },
    "prompt_family": "vocabulary_memory",
    "follow_ups": [
      {
        "variant_type": "recognition_mcq",
        "prompt": "What does 'potilas' mean?",
        "options": [
          {"option_id": "o1", "text": "doctor", "explanation": null},
          {"option_id": "o2", "text": "patient", "explanation": null},
          {"option_id": "o3", "text": "nurse", "explanation": null},
          {"option_id": "o4", "text": "ward", "explanation": null}
        ],
        "answer_key": "o2",
        "accepted_variants": [],
        "evaluation_mode": "option_id"
      },
      {
        "variant_type": "typed_recall",
        "prompt": "patient -> ? (Finnish)",
        "answer_key": "potilas",
        "accepted_variants": ["Potilas"],
        "evaluation_mode": "normalized_text"
      },
      {
        "variant_type": "reverse_recall",
        "prompt": "potilas -> ?",
        "reverse_target": {
          "target_kind": "translation",
          "value": "patient"
        },
        "answer_key": "patient",
        "accepted_variants": ["the patient"],
        "evaluation_mode": "normalized_text"
      },
      {
        "variant_type": "fill_in",
        "prompt": "Complete the Finnish word.",
        "blank_template": "poti___",
        "answer_key": "potilas",
        "accepted_variants": ["Potilas"],
        "evaluation_mode": "normalized_text"
      },
      {
        "variant_type": "context_mcq",
        "prompt": "Choose the correct word for the gap.",
        "context_text": "___ odottaa lääkärin vastaanotolla.",
        "options": [
          {"option_id": "o1", "text": "Potilas", "explanation": null},
          {"option_id": "o2", "text": "Pöytä", "explanation": null},
          {"option_id": "o3", "text": "Auto", "explanation": null},
          {"option_id": "o4", "text": "Kirja", "explanation": null}
        ],
        "answer_key": "o1",
        "accepted_variants": [],
        "evaluation_mode": "option_id"
      }
    ],
    "explanation": {
      "summary": "Healthcare vocabulary item for a person receiving care.",
      "example": "Potilas kertoo oireistaan hoitajalle."
    },
    "audio": null,
    "validation": {
      "case_sensitive": false,
      "normalize_whitespace": true,
      "allow_partial_credit": false
    }
  }
}
```

### 9.1 Vocabulary sidecar for the same item

```json
{
  "card_id": "card.vocab.nurse.potilas.0001",
  "follow_up_questions": [
    "Produce a sentence with 'potilas'.",
    "Change the sentence into plural.",
    "Use the word in genitive.",
    "Replace 'potilas' with 'hoitaja' and say the new sentence."
  ],
  "transformations": [
    {"label": "plural", "value": "potilaat"},
    {"label": "genitive", "value": "potilaan"},
    {"label": "partitive", "value": "potilasta"}
  ],
  "metadata": {
    "source": "generated_v1",
    "cefr_level": "A2",
    "topic": "healthcare",
    "semantic_tags": ["patient", "waiting", "clinic"]
  }
}
```

## 10. Exact full example: sentence card with all five required variants

```json
{
  "id": "card.sentence.nurse.potilas_odottaa.0001",
  "version": 1,
  "content_type": "sentence_card",
  "path": "professional",
  "domain": "healthcare",
  "profession": {
    "track": "nurse",
    "slug": "nurse",
    "label": "Nurse"
  },
  "level_band": "A2",
  "difficulty": "core",
  "language": "fi",
  "source": {
    "source_id": "source.generated.nurse.sentences",
    "kind": "generated_pipeline",
    "origin_path": "backend/practice/generated/nurse/sentences/potilas_odottaa.json",
    "authoring_note": "generated sentence card with full five-variant matrix"
  },
  "quality": {
    "status": "reviewed",
    "reviewer": "card-generator",
    "validation_checks": ["schema_validation", "domain_review"],
    "quality_score": 0.9
  },
  "tags": ["healthcare", "nurse", "waiting", "a2"],
  "publication": {
    "state": "validated",
    "version_tag": "cards_generated_nurse_2026_03",
    "manifest_ref": "manifest.generated.nurse.sentences",
    "validation_passed": true,
    "published_at": null,
    "archived_at": null
  },
  "content": {
    "front": {
      "sentence": "Potilas odottaa lääkärin vastaanotolla.",
      "translation_hint": null
    },
    "back": {
      "recall_prompt": "Choose, reconstruct, or complete the sentence.",
      "expected_sentence": "Potilas odottaa lääkärin vastaanotolla.",
      "grammar_focus": ["present_tense", "healthcare_location", "subject_verb_order"]
    },
    "prompt_family": "sentence_memory",
    "follow_ups": [
      {
        "variant_type": "recognition_mcq",
        "prompt": "Which translation matches the sentence?",
        "options": [
          {"option_id": "o1", "text": "The doctor is waiting outside.", "explanation": null},
          {"option_id": "o2", "text": "The patient is waiting at the doctor's appointment.", "explanation": null},
          {"option_id": "o3", "text": "The nurse closes the clinic.", "explanation": null},
          {"option_id": "o4", "text": "The ward is empty.", "explanation": null}
        ],
        "answer_key": "o2",
        "accepted_variants": [],
        "evaluation_mode": "option_id"
      },
      {
        "variant_type": "typed_recall",
        "prompt": "The patient is waiting at the doctor's appointment. -> ?",
        "answer_key": "Potilas odottaa lääkärin vastaanotolla.",
        "accepted_variants": [
          "Potilas odottaa laakarin vastaanotolla.",
          "potilas odottaa lääkärin vastaanotolla."
        ],
        "evaluation_mode": "normalized_text"
      },
      {
        "variant_type": "reverse_recall",
        "prompt": "Translate the Finnish sentence into English.",
        "reverse_target": {
          "target_kind": "translation",
          "value": "The patient is waiting at the doctor's appointment."
        },
        "answer_key": "The patient is waiting at the doctor's appointment.",
        "accepted_variants": ["The patient is waiting at the appointment."],
        "evaluation_mode": "normalized_text"
      },
      {
        "variant_type": "fill_in",
        "prompt": "Complete the missing verb.",
        "blank_template": "Potilas ___ lääkärin vastaanotolla.",
        "answer_key": "odottaa",
        "accepted_variants": ["Odottaa"],
        "evaluation_mode": "normalized_text"
      },
      {
        "variant_type": "context_mcq",
        "prompt": "What is the patient doing?",
        "context_text": "Potilas odottaa lääkärin vastaanotolla.",
        "options": [
          {"option_id": "o1", "text": "Syö", "explanation": null},
          {"option_id": "o2", "text": "Odottaa", "explanation": null},
          {"option_id": "o3", "text": "Juoksee", "explanation": null},
          {"option_id": "o4", "text": "Nukkuu", "explanation": null}
        ],
        "answer_key": "o2",
        "accepted_variants": [],
        "evaluation_mode": "option_id"
      }
    ],
    "explanation": {
      "summary": "A basic healthcare waiting-room sentence with present tense and location marking.",
      "example": "Potilas istuu rauhallisesti vastaanotolla."
    },
    "audio": null,
    "validation": {
      "case_sensitive": false,
      "normalize_whitespace": true,
      "allow_partial_credit": false
    }
  }
}
```

### 10.1 Sentence sidecar for the same item

```json
{
  "card_id": "card.sentence.nurse.potilas_odottaa.0001",
  "follow_up_questions": [
    "Change the subject to 'hoitaja'.",
    "Change the verb into past tense.",
    "Replace the location phrase with 'odotushuoneessa'.",
    "Say the sentence in plural."
  ],
  "transformations": [
    {"label": "past_tense", "value": "Potilas odotti lääkärin vastaanotolla."},
    {"label": "plural", "value": "Potilaat odottavat lääkärin vastaanotolla."},
    {"label": "location_variant", "value": "Potilas odottaa odotushuoneessa."}
  ],
  "metadata": {
    "source": "generated_v1",
    "cefr_level": "A2",
    "topic": "healthcare",
    "semantic_tags": ["waiting", "appointment", "patient"]
  }
}
```

## 11. Exact full example: grammar card with all current-schema-safe variants

This example delivers the five pedagogical intents while staying inside the **current grammar schema**:

- recognition -> `recognition_mcq`
- recall -> `typed_recall`
- completion -> `fill_in`
- reverse -> `grammar_application`
- context MCQ -> `recognition_mcq` with a contextual grammar prompt

```json
{
  "id": "card.grammar.nurse.adessive_location.0001",
  "version": 1,
  "content_type": "grammar_card",
  "path": "professional",
  "domain": "healthcare",
  "profession": {
    "track": "nurse",
    "slug": "nurse",
    "label": "Nurse"
  },
  "level_band": "B1",
  "difficulty": "core",
  "language": "fi",
  "source": {
    "source_id": "source.generated.nurse.grammar",
    "kind": "generated_pipeline",
    "origin_path": "backend/practice/generated/nurse/grammar/adessive_location.json",
    "authoring_note": "generated grammar card with schema-safe five-intent mapping"
  },
  "quality": {
    "status": "reviewed",
    "reviewer": "card-generator",
    "validation_checks": ["schema_validation", "grammar_review", "domain_review"],
    "quality_score": 0.92
  },
  "tags": ["healthcare", "nurse", "adessive", "location", "b1"],
  "publication": {
    "state": "validated",
    "version_tag": "cards_generated_nurse_2026_03",
    "manifest_ref": "manifest.generated.nurse.grammar",
    "validation_passed": true,
    "published_at": null,
    "archived_at": null
  },
  "content": {
    "front": {
      "rule_label": "Adessive for location at a place",
      "pattern": "vastaanotolla, osastolla, klinikalla",
      "example": "Hoitaja on vastaanotolla."
    },
    "back": {
      "recall_prompt": "Identify, apply, or complete the correct location form.",
      "rule_summary": "Use the adessive case to express being at a place or on a site in many healthcare contexts.",
      "target_form": "vastaanotolla"
    },
    "prompt_family": "grammar_memory",
    "follow_ups": [
      {
        "variant_type": "recognition_mcq",
        "prompt": "Which form shows being at the clinic desk?",
        "options": [
          {"option_id": "o1", "text": "vastaanotolla", "explanation": null},
          {"option_id": "o2", "text": "vastaanottoon", "explanation": null},
          {"option_id": "o3", "text": "vastaanotosta", "explanation": null},
          {"option_id": "o4", "text": "vastaanottoa", "explanation": null}
        ],
        "answer_key": "o1",
        "accepted_variants": [],
        "evaluation_mode": "option_id"
      },
      {
        "variant_type": "typed_recall",
        "prompt": "What case ending is typical for this location pattern?",
        "answer_key": "-lla/-llä",
        "accepted_variants": ["lla/llä"],
        "evaluation_mode": "normalized_text"
      },
      {
        "variant_type": "fill_in",
        "prompt": "Complete the correct form.",
        "blank_template": "Hoitaja on ___ (vastaanotto).",
        "answer_key": "vastaanotolla",
        "accepted_variants": ["Vastaanotolla"],
        "evaluation_mode": "normalized_text"
      },
      {
        "variant_type": "grammar_application",
        "prompt": "Which grammatical function does 'vastaanotolla' show here?",
        "stimulus_text": "Selitä muodon tehtävä: vastaanotolla",
        "evaluation_basis": {
          "rule_id": "rule.adessive.location",
          "expected_feature": "adessive_case_location",
          "evaluation_notes": "Accept the case name or an equivalent description of being at a place."
        },
        "answer_key": "adessiivi",
        "accepted_variants": ["Adessiivi"],
        "evaluation_mode": "normalized_text"
      },
      {
        "variant_type": "recognition_mcq",
        "prompt": "Choose the correct contextual form: Hoitaja on ___ .",
        "options": [
          {"option_id": "o1", "text": "vastaanotolla", "explanation": null},
          {"option_id": "o2", "text": "vastaanottoon", "explanation": null},
          {"option_id": "o3", "text": "vastaanotosta", "explanation": null},
          {"option_id": "o4", "text": "vastaanotto", "explanation": null}
        ],
        "answer_key": "o1",
        "accepted_variants": [],
        "evaluation_mode": "option_id"
      }
    ],
    "explanation": {
      "summary": "The card practices location-at-place meaning in healthcare Finnish with the adessive case.",
      "example": "Potilas odottaa vastaanotolla."
    },
    "audio": null,
    "validation": {
      "case_sensitive": false,
      "normalize_whitespace": true,
      "allow_partial_credit": false
    }
  }
}
```

### 11.1 Grammar sidecar for the same item

```json
{
  "card_id": "card.grammar.nurse.adessive_location.0001",
  "follow_up_questions": [
    "Use the same pattern with 'osasto'.",
    "Rewrite the sentence with 'klinikka'.",
    "Contrast adessive with illative in one pair of sentences.",
    "Explain when the form expresses location rather than movement."
  ],
  "transformations": [
    {"label": "base", "value": "vastaanotto"},
    {"label": "adessive", "value": "vastaanotolla"},
    {"label": "illative", "value": "vastaanottoon"},
    {"label": "elative", "value": "vastaanotosta"}
  ],
  "metadata": {
    "source": "generated_v1",
    "cefr_level": "B1",
    "topic": "healthcare",
    "semantic_tags": ["clinic", "location", "case", "adessive"]
  }
}
```

## 12. Exact per-test-type guidance by content family

### 12.1 Vocabulary

- recognition -> use `recognition_mcq`
- recall -> use `typed_recall`
- reverse -> use `reverse_recall`
- completion -> use `fill_in`
- context MCQ -> use `context_mcq`

### 12.2 Sentence

- recognition -> use `recognition_mcq`
- recall -> use `typed_recall`
- reverse -> use `reverse_recall`
- completion -> use `fill_in`
- context MCQ -> use `context_mcq`

### 12.3 Grammar

- recognition -> use `recognition_mcq`
- recall -> use `typed_recall`
- reverse -> use `grammar_application`
- completion -> use `fill_in`
- context MCQ -> use `recognition_mcq` with contextual prompt

## 13. Exact per-test-type example matrix the generator can copy

This section exists so an agent does not need to infer how each pedagogical intent is represented. Each example below shows the exact follow-up variant shape that should be embedded inside the final `content.follow_ups` array for a schema-valid card.

### 13.1 Vocabulary per-test-type examples

#### Vocabulary recognition

```json
{
  "variant_type": "recognition_mcq",
  "prompt": "What does 'potilas' mean?",
  "options": [
    {"option_id": "o1", "text": "doctor", "explanation": null},
    {"option_id": "o2", "text": "patient", "explanation": null},
    {"option_id": "o3", "text": "nurse", "explanation": null},
    {"option_id": "o4", "text": "ward", "explanation": null}
  ],
  "answer_key": "o2",
  "accepted_variants": [],
  "evaluation_mode": "option_id"
}
```

#### Vocabulary recall

```json
{
  "variant_type": "typed_recall",
  "prompt": "patient -> ? (Finnish)",
  "answer_key": "potilas",
  "accepted_variants": ["Potilas"],
  "evaluation_mode": "normalized_text"
}
```

#### Vocabulary reverse

```json
{
  "variant_type": "reverse_recall",
  "prompt": "potilas -> ?",
  "reverse_target": {
    "target_kind": "translation",
    "value": "patient"
  },
  "answer_key": "patient",
  "accepted_variants": ["the patient"],
  "evaluation_mode": "normalized_text"
}
```

#### Vocabulary completion

```json
{
  "variant_type": "fill_in",
  "prompt": "Complete the Finnish word.",
  "blank_template": "poti___",
  "answer_key": "potilas",
  "accepted_variants": ["Potilas"],
  "evaluation_mode": "normalized_text"
}
```

#### Vocabulary context MCQ

```json
{
  "variant_type": "context_mcq",
  "prompt": "Choose the correct word for the gap.",
  "context_text": "___ odottaa lääkärin vastaanotolla.",
  "options": [
    {"option_id": "o1", "text": "Potilas", "explanation": null},
    {"option_id": "o2", "text": "Pöytä", "explanation": null},
    {"option_id": "o3", "text": "Auto", "explanation": null},
    {"option_id": "o4", "text": "Kirja", "explanation": null}
  ],
  "answer_key": "o1",
  "accepted_variants": [],
  "evaluation_mode": "option_id"
}
```

### 13.2 Sentence per-test-type examples

#### Sentence recognition

```json
{
  "variant_type": "recognition_mcq",
  "prompt": "Which translation matches the sentence?",
  "options": [
    {"option_id": "o1", "text": "The doctor is waiting outside.", "explanation": null},
    {"option_id": "o2", "text": "The patient is waiting at the doctor's appointment.", "explanation": null},
    {"option_id": "o3", "text": "The nurse closes the clinic.", "explanation": null},
    {"option_id": "o4", "text": "The ward is empty.", "explanation": null}
  ],
  "answer_key": "o2",
  "accepted_variants": [],
  "evaluation_mode": "option_id"
}
```

#### Sentence recall

```json
{
  "variant_type": "typed_recall",
  "prompt": "The patient is waiting at the doctor's appointment. -> ?",
  "answer_key": "Potilas odottaa lääkärin vastaanotolla.",
  "accepted_variants": [
    "Potilas odottaa laakarin vastaanotolla.",
    "potilas odottaa lääkärin vastaanotolla."
  ],
  "evaluation_mode": "normalized_text"
}
```

#### Sentence reverse

```json
{
  "variant_type": "reverse_recall",
  "prompt": "Translate the Finnish sentence into English.",
  "reverse_target": {
    "target_kind": "translation",
    "value": "The patient is waiting at the doctor's appointment."
  },
  "answer_key": "The patient is waiting at the doctor's appointment.",
  "accepted_variants": ["The patient is waiting at the appointment."],
  "evaluation_mode": "normalized_text"
}
```

#### Sentence completion

```json
{
  "variant_type": "fill_in",
  "prompt": "Complete the missing verb.",
  "blank_template": "Potilas ___ lääkärin vastaanotolla.",
  "answer_key": "odottaa",
  "accepted_variants": ["Odottaa"],
  "evaluation_mode": "normalized_text"
}
```

#### Sentence context MCQ

```json
{
  "variant_type": "context_mcq",
  "prompt": "What is the patient doing?",
  "context_text": "Potilas odottaa lääkärin vastaanotolla.",
  "options": [
    {"option_id": "o1", "text": "Syö", "explanation": null},
    {"option_id": "o2", "text": "Odottaa", "explanation": null},
    {"option_id": "o3", "text": "Juoksee", "explanation": null},
    {"option_id": "o4", "text": "Nukkuu", "explanation": null}
  ],
  "answer_key": "o2",
  "accepted_variants": [],
  "evaluation_mode": "option_id"
}
```

### 13.3 Grammar per-test-type examples

#### Grammar recognition

```json
{
  "variant_type": "recognition_mcq",
  "prompt": "Which form shows being at the clinic desk?",
  "options": [
    {"option_id": "o1", "text": "vastaanotolla", "explanation": null},
    {"option_id": "o2", "text": "vastaanottoon", "explanation": null},
    {"option_id": "o3", "text": "vastaanotosta", "explanation": null},
    {"option_id": "o4", "text": "vastaanottoa", "explanation": null}
  ],
  "answer_key": "o1",
  "accepted_variants": [],
  "evaluation_mode": "option_id"
}
```

#### Grammar recall

```json
{
  "variant_type": "typed_recall",
  "prompt": "What case ending is typical for this location pattern?",
  "answer_key": "-lla/-llä",
  "accepted_variants": ["lla/llä"],
  "evaluation_mode": "normalized_text"
}
```

#### Grammar reverse

This is the schema-safe substitute for the pedagogical idea "form -> function". Do not use `reverse_recall` on grammar cards.

```json
{
  "variant_type": "grammar_application",
  "prompt": "Which grammatical function does 'vastaanotolla' show here?",
  "stimulus_text": "Selitä muodon tehtävä: vastaanotolla",
  "evaluation_basis": {
    "rule_id": "rule.adessive.location",
    "expected_feature": "adessive_case_location",
    "evaluation_notes": "Accept the case name or an equivalent description of being at a place."
  },
  "answer_key": "adessiivi",
  "accepted_variants": ["Adessiivi"],
  "evaluation_mode": "normalized_text"
}
```

#### Grammar completion

```json
{
  "variant_type": "fill_in",
  "prompt": "Complete the correct form.",
  "blank_template": "Hoitaja on ___ (vastaanotto).",
  "answer_key": "vastaanotolla",
  "accepted_variants": ["Vastaanotolla"],
  "evaluation_mode": "normalized_text"
}
```

#### Grammar context MCQ

This is the schema-safe substitute for pedagogical `context_mcq`. Use contextual `recognition_mcq`, not literal `context_mcq`.

```json
{
  "variant_type": "recognition_mcq",
  "prompt": "Choose the correct contextual form: Hoitaja on ___ .",
  "options": [
    {"option_id": "o1", "text": "vastaanotolla", "explanation": null},
    {"option_id": "o2", "text": "vastaanottoon", "explanation": null},
    {"option_id": "o3", "text": "vastaanotosta", "explanation": null},
    {"option_id": "o4", "text": "vastaanotto", "explanation": null}
  ],
  "answer_key": "o1",
  "accepted_variants": [],
  "evaluation_mode": "option_id"
}
```

## 14. Generator requirements for follow-up questions, transformations, profession/domain tagging, difficulty, and metadata

### 14.1 Follow-up questions

These are mandatory in your production process, but not valid final envelope fields.

Rule:

- always generate them
- store them in the sidecar
- use them to derive additional `follow_ups`, `tags`, `grammar_focus`, and `explanation`

### 14.2 Transformations

These are mandatory in your production process, but not valid final envelope fields.

Rule:

- always generate them
- store them in the sidecar
- copy the most important transformation target into:
  - `content.back.target_form` for grammar
  - `content.back.expected_sentence` for sentence
  - `content.explanation.example` or `content.back.example_sentence` for vocabulary

### 14.3 Profession and domain tagging

Always determine all of these together:

- `path`
- `domain`
- `profession.track`
- `profession.slug`
- `profession.label`

Example mappings:

- nursing -> `path=professional`, `domain=healthcare`, `track=nurse`, `slug=nurse`, `label=Nurse`
- doctor -> `path=professional`, `domain=healthcare`, `track=doctor`, `slug=doctor`, `label=Doctor`
- IT -> `path=professional`, `domain=workplace_communication`, `track=other`, `slug=it`, `label=IT`
- electrical engineer -> `path=professional`, `domain=workplace_communication`, `track=other`, `slug=electrical_engineer`, `label=Electrical Engineer`

### 14.4 Coarse difficulty tagging

Use only:

- `intro`
- `core`
- `stretch`

Suggested mapping:

- simple isolated word / transparent meaning / high-frequency sentence / one-step grammar -> `intro`
- ordinary workplace sentence / common case use / common tense recall -> `core`
- low-frequency form / dense sentence / contrastive grammar / ambiguous distractors -> `stretch`

### 14.5 Metadata in some generators

Current schema-safe storage:

- `source.source_id`
- `source.kind`
- `source.origin_path`
- `source.authoring_note`
- `quality.*`
- `tags`
- sidecar `metadata`

Do not emit a freeform top-level `metadata` object inside the final card envelope.

## 15. Hard production checklist

Before accepting a generated card, verify all of this:

- top-level object validates against `CardEnvelope`
- no extra keys exist anywhere
- `path`, `domain`, and `profession` combination is legal
- vocabulary and sentence cards use only allowed follow-up variants
- grammar cards do not use `reverse_recall` or `context_mcq`
- every `typed_recall`, `fill_in`, `reverse_recall`, and `grammar_application` has a distinct accepted variant
- every MCQ has 2 to 6 options
- every `fill_in` contains `___`
- every final card has `publication.state` of `validated` or `published` and `validation_passed=true`
- front-facing visible content is Finnish
- back prompt is concise and usable by the current runtime
- sidecar includes `follow_up_questions`, `transformations`, and freeform metadata

## 16. Final implementation rule

If the goal is “100% works with the current schema”, then the agent must do this:

1. Generate pedagogical content in a richer internal format.
2. Store extra planning fields in a sidecar package.
3. Compile the final runtime card into the exact `CardEnvelope` shape described above.
4. For grammar, use the compatibility mapping instead of emitting unsupported follow-up types.

That is the correct production model for the current system.
