import sys
import unittest
from datetime import UTC, datetime
from pathlib import Path
from unittest.mock import patch

sys.path.insert(0, str(Path(__file__).resolve().parents[1]))

from learning.graph_service import get_user_learning_debug_state, list_modules_for_user
from learning.practice_service import generate_practice, generate_practice_from_weakness
from learning.progress_service import (
    get_due_review_units,
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

    def test_correct_answers_increase_review_interval(self):
        user_id = "progress-test-interval-up"
        practice = generate_practice("module-daily-life-routines")
        exercise = next(
            item for item in practice["exercises"] if item["unit_id"] == "vocab-aamu"
        )

        with patch(
            "learning.progress_service._current_time",
            return_value=datetime(2026, 1, 1, tzinfo=UTC),
        ):
            first = record_practice_result(user_id, exercise, True)

        with patch(
            "learning.progress_service._current_time",
            return_value=datetime(2026, 1, 2, tzinfo=UTC),
        ):
            second = record_practice_result(user_id, exercise, True)

        self.assertEqual(first["unitProgress"]["review_interval_days"], 2)
        self.assertEqual(first["unitProgress"]["streak_correct"], 1)
        self.assertEqual(second["unitProgress"]["review_interval_days"], 4)
        self.assertEqual(second["unitProgress"]["streak_correct"], 2)

    def test_wrong_answers_reset_review_interval(self):
        user_id = "progress-test-interval-reset"
        practice = generate_practice("module-daily-life-routines")
        exercise = next(
            item for item in practice["exercises"] if item["unit_id"] == "vocab-aamu"
        )

        with patch(
            "learning.progress_service._current_time",
            return_value=datetime(2026, 1, 1, tzinfo=UTC),
        ):
            record_practice_result(user_id, exercise, True)

        with patch(
            "learning.progress_service._current_time",
            return_value=datetime(2026, 1, 2, tzinfo=UTC),
        ):
            result = record_practice_result(user_id, exercise, False)

        self.assertEqual(result["unitProgress"]["review_interval_days"], 1)
        self.assertEqual(result["unitProgress"]["streak_correct"], 0)
        self.assertTrue(result["unitProgress"]["recent_mistake"])

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
        self.assertEqual(third["unitProgress"]["mastery_level"], "mastered")

    def test_regression_is_detected_when_mastery_drops_sharply(self):
        user_id = "progress-test-regression"
        practice = generate_practice("module-daily-life-routines")
        exercise = next(
            item for item in practice["exercises"] if item["unit_id"] == "vocab-aamu"
        )

        record_practice_result(user_id, exercise, True)
        record_practice_result(user_id, exercise, True)
        record_practice_result(user_id, exercise, True)
        result = record_practice_result(user_id, exercise, False)

        self.assertGreater(result["unitProgress"]["previous_mastery_score"], 0.7)
        self.assertLess(result["unitProgress"]["mastery_score"], 0.5)
        self.assertTrue(result["unitProgress"]["regression_detected"])

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

    def test_due_units_appear_consistently(self):
        user_id = "progress-test-due"
        practice = generate_practice("module-work-and-study-communication")
        exercise = next(
            item
            for item in practice["exercises"]
            if item["unit_id"] == "grammar-object-cases"
        )

        with patch(
            "learning.progress_service._current_time",
            return_value=datetime(2026, 1, 1, tzinfo=UTC),
        ):
            record_practice_result(user_id, exercise, True)

        with patch(
            "learning.progress_service._current_time",
            return_value=datetime(2026, 1, 2, tzinfo=UTC),
        ):
            not_due_yet = get_due_review_units(user_id)

        with patch(
            "learning.progress_service._current_time",
            return_value=datetime(2026, 1, 3, tzinfo=UTC),
        ):
            due_units = get_due_review_units(user_id)

        self.assertEqual(not_due_yet, [])
        self.assertEqual(due_units[0]["unit"]["id"], "grammar-object-cases")
        self.assertEqual(due_units[0]["urgency"], "due_now")

    def test_due_units_shift_recommendations_and_practice_order(self):
        user_id = "progress-test-priority"
        practice = generate_practice("module-work-and-study-communication")
        exercise = next(
            item
            for item in practice["exercises"]
            if item["unit_id"] == "grammar-object-cases"
        )

        with patch(
            "learning.progress_service._current_time",
            return_value=datetime(2026, 1, 1, tzinfo=UTC),
        ):
            record_practice_result(user_id, exercise, False)

        with patch(
            "learning.progress_service._current_time",
            return_value=datetime(2026, 1, 2, tzinfo=UTC),
        ):
            modules = list_modules_for_user(user_id)

        with patch(
            "learning.progress_service._current_time",
            return_value=datetime(2026, 1, 2, tzinfo=UTC),
        ):
            recommended_practice = generate_practice_from_weakness(user_id)

        self.assertEqual(
            modules["suggestedModules"][0]["id"],
            "module-work-and-study-communication",
        )
        self.assertIn(
            "grammar-object-cases",
            modules["suggestedModules"][0]["dueReviewUnitIds"],
        )
        self.assertEqual(
            modules["suggestedModules"][0]["whyThisWasSelected"]["due_review_used"]["unit_ids"],
            ["grammar-object-cases"],
        )
        self.assertEqual(recommended_practice["exercises"][0]["unit_id"], "grammar-object-cases")

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

    def test_debug_state_exposes_mastery_regression_and_reasoning(self):
        user_id = "progress-test-debug"
        practice = generate_practice("module-daily-life-routines")
        exercise = next(
            item for item in practice["exercises"] if item["unit_id"] == "vocab-aamu"
        )

        record_practice_result(user_id, exercise, True)
        record_practice_result(user_id, exercise, True)
        record_practice_result(user_id, exercise, True)
        record_practice_result(user_id, exercise, False)

        debug_state = get_user_learning_debug_state(user_id)
        traced_module = next(
            item
            for item in debug_state["recommendationReasoning"]
            if item["moduleId"] == "module-daily-life-routines"
        )
        traced_unit = next(
            item
            for item in debug_state["unitMastery"]
            if item["unit"]["id"] == "vocab-aamu"
        )

        self.assertEqual(traced_unit["progress"]["unit_id"], "vocab-aamu")
        self.assertTrue(debug_state["regressionFlags"])
        self.assertIn("difficulty_adjustment", traced_module["whyThisWasSelected"])
        self.assertIn("mastery_score_used", traced_module["whyThisWasSelected"])
        self.assertIn("suggestionScoreBreakdown", traced_module)


if __name__ == "__main__":
    unittest.main()
