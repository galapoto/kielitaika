import unittest
from pathlib import Path
import sys

sys.path.insert(0, str(Path(__file__).resolve().parents[1]))

from learning.graph_service import list_modules_for_user
from learning.practice_service import generate_practice
from learning.progress_service import (
    get_module_progress,
    get_unit_progress,
    record_practice_result,
    reset_progress_store,
)
from learning.repository import repository
from yki.storage import _history


class ProgressServiceTests(unittest.TestCase):
    def setUp(self):
        reset_progress_store()
        _history.clear()

    def test_repeated_practice_improves_mastery(self):
        user_id = "progress-test-repeat"
        practice = generate_practice("module-daily-life-routines")
        exercise = next(
            item for item in practice["exercises"] if item["unit_id"] == "vocab-aamu"
        )

        first = record_practice_result(user_id, exercise, False)
        second = record_practice_result(user_id, exercise, True)
        third = record_practice_result(user_id, exercise, True)

        self.assertEqual(first["unitProgress"]["mastery_level"], "weak")
        self.assertEqual(second["unitProgress"]["mastery_level"], "improving")
        self.assertGreater(
            third["unitProgress"]["mastery_score"],
            second["unitProgress"]["mastery_score"],
        )
        self.assertEqual(third["unitProgress"]["mastery_level"], "improving")

    def test_module_completion_tracks_mastered_units(self):
        user_id = "progress-test-module"
        practice = generate_practice("module-moving-around-services")
        exercise = next(
            item for item in practice["exercises"] if item["unit_id"] == "vocab-asema"
        )

        record_practice_result(user_id, exercise, True)
        module_progress = get_module_progress("module-moving-around-services", user_id)

        total_units = len(repository.modules["module-moving-around-services"].unit_ids)

        self.assertEqual(module_progress["mastered_unit_count"], 1)
        self.assertEqual(module_progress["total_unit_count"], total_units)
        self.assertAlmostEqual(module_progress["completion_percentage"], 100 / total_units)

    def test_low_mastery_units_are_prioritized_in_recommendations(self):
        user_id = "progress-test-priority"
        practice = generate_practice("module-work-and-study-communication")
        exercise = next(
            item
            for item in practice["exercises"]
            if item["unit_id"] == "grammar-object-cases"
        )

        record_practice_result(user_id, exercise, False)
        modules = list_modules_for_user(user_id)

        self.assertEqual(
            modules["suggestedModules"][0]["id"],
            "module-work-and-study-communication",
        )
        self.assertIn(
            "grammar-object-cases",
            modules["suggestedModules"][0]["lowMasteryUnitIds"],
        )

    def test_mastered_units_appear_less_in_recommendations(self):
        user_id = "progress-test-mastered"
        practice = generate_practice("module-work-and-study-communication")
        exercise = next(
            item
            for item in practice["exercises"]
            if item["unit_id"] == "grammar-object-cases"
        )

        record_practice_result(user_id, exercise, True)
        unit_progress = get_unit_progress("grammar-object-cases", user_id)
        modules = list_modules_for_user(user_id)
        suggested_ids = [module["id"] for module in modules["suggestedModules"]]

        self.assertEqual(unit_progress["mastery_level"], "mastered")
        self.assertNotIn("module-work-and-study-communication", suggested_ids)


if __name__ == "__main__":
    unittest.main()
