from dataclasses import dataclass


@dataclass(frozen=True)
class VocabularyUnit:
    id: str
    level: str
    module_ids: list[str]
    finnish: str
    english: str
    part_of_speech: str
    example: str
    related_unit_ids: list[str]


@dataclass(frozen=True)
class GrammarUnit:
    id: str
    level: str
    module_ids: list[str]
    title: str
    rule: str
    example: str
    related_unit_ids: list[str]


@dataclass(frozen=True)
class PhraseUnit:
    id: str
    level: str
    module_ids: list[str]
    finnish: str
    english: str
    usage: str
    related_unit_ids: list[str]


@dataclass(frozen=True)
class LearningModule:
    id: str
    title: str
    description: str
    level: str
    focus_tags: list[str]
    unit_ids: list[str]
