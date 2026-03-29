from dataclasses import asdict

from learning.content import GRAMMAR_UNITS, LEARNING_MODULES, PHRASE_UNITS, VOCABULARY_UNITS
from learning.models import GrammarUnit, LearningModule, PhraseUnit, VocabularyUnit


class LearningRepository:
    def __init__(self):
        self.vocabulary_units = {unit.id: unit for unit in VOCABULARY_UNITS}
        self.grammar_units = {unit.id: unit for unit in GRAMMAR_UNITS}
        self.phrase_units = {unit.id: unit for unit in PHRASE_UNITS}
        self.modules = {module.id: module for module in LEARNING_MODULES}
        self.units = {
            **self.vocabulary_units,
            **self.grammar_units,
            **self.phrase_units,
        }
        self._validate_module_links()
        self._validate_relationships()

    def _validate_module_links(self):
        for module in self.modules.values():
            for unit_id in module.unit_ids:
                if unit_id not in self.units:
                    raise ValueError(f"Unknown unit in module: {module.id} -> {unit_id}")

        for unit in self.units.values():
            for module_id in unit.module_ids:
                if module_id not in self.modules:
                    raise ValueError(f"Unknown module in unit: {unit.id} -> {module_id}")

    def _validate_relationships(self):
        for unit in self.units.values():
            for related_id in unit.related_unit_ids:
                if related_id not in self.units:
                    raise ValueError(f"Unknown related unit: {unit.id} -> {related_id}")

    def list_modules(self):
        return [self.serialize_module(module) for module in self.modules.values()]

    def get_module(self, module_id: str):
        module = self.modules.get(module_id)
        if not module:
            return None
        return self.serialize_module(module)

    def get_module_units(self, module_id: str):
        module = self.modules.get(module_id)
        if not module:
            return []
        return [self.serialize_unit(self.units[unit_id]) for unit_id in module.unit_ids]

    def get_unit(self, unit_id: str):
        unit = self.units.get(unit_id)
        if not unit:
            return None
        return self.serialize_unit(unit)

    def get_related_units(self, unit_id: str):
        unit = self.units.get(unit_id)
        if not unit:
            return None
        return [self.serialize_unit(self.units[related_id]) for related_id in unit.related_unit_ids]

    def serialize_unit(self, unit: VocabularyUnit | GrammarUnit | PhraseUnit):
        if isinstance(unit, VocabularyUnit):
            return {
                "id": unit.id,
                "kind": "vocabulary",
                "level": unit.level,
                "title": unit.finnish,
                "summary": unit.english,
                "example": unit.example,
                "details": {
                    "partOfSpeech": unit.part_of_speech,
                },
                "moduleIds": unit.module_ids,
                "relatedUnitIds": unit.related_unit_ids,
            }

        if isinstance(unit, GrammarUnit):
            return {
                "id": unit.id,
                "kind": "grammar",
                "level": unit.level,
                "title": unit.title,
                "summary": unit.rule,
                "example": unit.example,
                "details": {
                    "rule": unit.rule,
                },
                "moduleIds": unit.module_ids,
                "relatedUnitIds": unit.related_unit_ids,
            }

        return {
            "id": unit.id,
            "kind": "phrase",
            "level": unit.level,
            "title": unit.finnish,
            "summary": unit.english,
            "example": unit.usage,
            "details": {
                "usage": unit.usage,
            },
            "moduleIds": unit.module_ids,
            "relatedUnitIds": unit.related_unit_ids,
        }

    def serialize_module(self, module: LearningModule):
        payload = asdict(module)
        payload["unitCount"] = len(module.unit_ids)
        payload["units"] = self.get_module_units(module.id)
        return {
            "id": payload["id"],
            "title": payload["title"],
            "description": payload["description"],
            "level": payload["level"],
            "focusTags": payload["focus_tags"],
            "unitIds": payload["unit_ids"],
            "unitCount": payload["unitCount"],
            "units": payload["units"],
        }


repository = LearningRepository()
