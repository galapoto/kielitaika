import sys
import unittest
from datetime import UTC, datetime
from pathlib import Path
from unittest.mock import patch

sys.path.insert(0, str(Path(__file__).resolve().parents[1]))

from learning.decision_version import DECISION_POLICY_VERSION, DECISION_VERSION, POLICY_VERSION
from learning.graph_service import get_user_learning_debug_state, list_modules_for_user
from learning.policy_engine import clamp_adaptive_weights
from learning.practice_service import generate_practice, generate_practice_from_weakness
from learning.progress_service import (
    get_due_review_units,
    get_learning_signal_logs,
    get_module_progress,
    get_recommendation_effectiveness_summary,
    get_recommendation_outcomes,
    get_stagnated_units,
    get_stagnation_config,
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
        self.assertEqual(
            modules["suggestedModules"][0]["whyThisWasSelected"]["decision_version"],
            DECISION_VERSION,
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
        self.assertIn("scoreBreakdown", traced_module)
        self.assertIn("adaptive_weight_modifier", traced_module["whyThisWasSelected"])
        self.assertEqual(traced_module["whyThisWasSelected"]["policy_version"], POLICY_VERSION)
        self.assertEqual(debug_state["decisionVersion"], DECISION_VERSION)

    def test_same_inputs_keep_recommendation_scores_stable(self):
        user_id = "progress-test-stable"
        modules_first = list_modules_for_user(user_id)
        modules_second = list_modules_for_user(user_id)

        first_scores = [
            (module["id"], module["suggestionScore"])
            for module in modules_first["modules"]
        ]
        second_scores = [
            (module["id"], module["suggestionScore"])
            for module in modules_second["modules"]
        ]

        self.assertEqual(first_scores, second_scores)

    def test_weight_overrides_change_recommendation_priority(self):
        user_id = "progress-test-weights"
        _history[user_id] = [
            {
                "session_id": "history-weight-focus",
                "date": "2026-01-01T00:00:00",
                "overall_score": 2,
                "level": "A2",
                "section_scores": {
                    "reading": 3,
                    "listening": 3,
                    "writing": 2,
                    "speaking": 2,
                },
                "weak_areas": ["language_accuracy"],
                "passed": False,
            }
        ]
        practice = generate_practice("module-moving-around-services")
        exercise = next(
            item for item in practice["exercises"] if item["unit_id"] == "vocab-asema"
        )

        with patch(
            "learning.progress_service._current_time",
            return_value=datetime(2026, 1, 1, tzinfo=UTC),
        ):
            record_practice_result(user_id, exercise, False)

        default_modules = list_modules_for_user(user_id)
        review_heavy_modules = list_modules_for_user(
            user_id,
            {
                "weak_pattern": 0.0,
                "low_mastery": 0.4,
                "due_review": 0.5,
                "regression": 0.05,
                "difficulty_alignment": 0.05,
            },
        )

        self.assertEqual(default_modules["suggestedModules"][0]["id"], "module-work-and-study-communication")
        self.assertEqual(
            review_heavy_modules["suggestedModules"][0]["id"],
            "module-moving-around-services",
        )

    def test_trace_matches_weighted_score_calculation(self):
        user_id = "progress-test-trace-score"
        modules = list_modules_for_user(user_id)
        traced_module = modules["modules"][0]
        score_breakdown = traced_module["scoreBreakdown"]
        summed_weighted_scores = round(
            score_breakdown["weak_pattern"]["weighted_score"]
            + score_breakdown["low_mastery"]["weighted_score"]
            + score_breakdown["due_review"]["weighted_score"]
            + score_breakdown["regression"]["weighted_score"]
            + score_breakdown["difficulty_alignment"]["weighted_score"],
            4,
        )

        self.assertEqual(score_breakdown["final_score"], summed_weighted_scores)
        self.assertEqual(traced_module["suggestionScore"], score_breakdown["final_score"])

    def test_recommendation_outcomes_track_post_recommendation_improvement(self):
        user_id = "progress-test-effectiveness"

        modules = list_modules_for_user(user_id)
        suggested_module = modules["suggestedModules"][0]
        unit_id = suggested_module["unitIds"][0]
        practice = generate_practice(suggested_module["id"])
        exercise = next(item for item in practice["exercises"] if item["unit_id"] == unit_id)

        record_practice_result(user_id, exercise, True)

        outcomes = get_recommendation_outcomes(user_id)
        tracked_outcome = next(item for item in outcomes if item["unit_id"] == unit_id)

        self.assertEqual(tracked_outcome["decision_version"], DECISION_VERSION)
        self.assertEqual(tracked_outcome["subsequent_attempts"], 1)
        self.assertGreaterEqual(tracked_outcome["improvement_delta"], 0.0)
        self.assertEqual(
            get_unit_progress(unit_id, user_id)["post_recommendation_performance"][0]["unit_id"],
            unit_id,
        )

    def test_effectiveness_summary_identifies_ineffective_patterns(self):
        user_id = "progress-test-ineffective"
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
            return_value=datetime(2026, 1, 3, tzinfo=UTC),
        ):
            list_modules_for_user(user_id)

        with patch(
            "learning.progress_service._current_time",
            return_value=datetime(2026, 1, 3, tzinfo=UTC),
        ):
            record_practice_result(user_id, exercise, False)

        summary = get_recommendation_effectiveness_summary(user_id)

        self.assertGreater(summary["measuredOutcomeCount"], 0)
        self.assertIn("due_review", summary["factorAverages"])
        self.assertEqual(
            summary["factorAverages"]["due_review"]["impact_label"],
            "ineffective",
        )

    def test_stagnation_detection_marks_units_and_exposes_debug_config(self):
        user_id = "progress-test-stagnation"
        practice = generate_practice("module-daily-life-routines")
        exercise = next(
            item for item in practice["exercises"] if item["unit_id"] == "vocab-aamu"
        )

        list_modules_for_user(user_id)
        record_practice_result(user_id, exercise, False)
        record_practice_result(user_id, exercise, False)
        third = record_practice_result(user_id, exercise, False)

        unit_progress = get_unit_progress("vocab-aamu", user_id)
        debug_state = get_user_learning_debug_state(user_id)
        stagnated_units = get_stagnated_units(user_id)
        config = get_stagnation_config()

        self.assertTrue(unit_progress["stagnated"])
        self.assertEqual(third["unitProgress"]["stagnated"], True)
        self.assertEqual(stagnated_units[0]["unitId"], "vocab-aamu")
        self.assertEqual(debug_state["stagnationConfig"]["attemptThreshold"], config["attemptThreshold"])
        self.assertTrue(debug_state["stagnatedUnits"])

    def test_adaptive_feedback_changes_recommendation_weights_after_effective_results(self):
        user_id = "progress-test-adaptive-feedback"
        list_modules_for_user(user_id)
        practice = generate_practice("module-daily-life-routines")
        exercise = next(
            item for item in practice["exercises"] if item["unit_id"] == "vocab-aamu"
        )

        record_practice_result(user_id, exercise, True)

        modules = list_modules_for_user(user_id)
        traced_module = next(
            item for item in modules["modules"] if item["id"] == "module-daily-life-routines"
        )
        adaptive_modifier = traced_module["whyThisWasSelected"]["adaptive_weight_modifier"]

        self.assertGreater(
            adaptive_modifier["weights"]["low_mastery"],
            traced_module["whyThisWasSelected"]["base_weights"]["low_mastery"],
        )
        self.assertGreater(adaptive_modifier["averageEffectiveness"], 0.0)
        self.assertTrue(adaptive_modifier["reasoning"])

    def test_yki_signals_are_logged_for_learning_debug(self):
        user_id = "progress-test-yki-signal"
        practice = generate_practice("module-work-and-study-communication")
        exercise = next(
            item
            for item in practice["exercises"]
            if item["unit_id"] == "grammar-object-cases"
        )

        record_practice_result(
            user_id,
            exercise,
            False,
            signal_source="yki_practice",
            signal_metadata={
                "taskType": "guided_text",
                "taskSection": "writing",
                "difficultyLevel": "medium",
            },
        )

        unit_progress = get_unit_progress("grammar-object-cases", user_id)
        yki_logs = get_learning_signal_logs(user_id)
        debug_state = get_user_learning_debug_state(user_id)

        self.assertEqual(unit_progress["yki_influence_count"], 1)
        self.assertEqual(yki_logs[0]["signal_source"], "yki_practice")
        self.assertTrue(debug_state["ykiInfluenceLogs"])

    def test_policy_clamps_extreme_adaptive_weight_changes(self):
        base_weights = {
            "weak_pattern": 0.3,
            "low_mastery": 0.25,
            "due_review": 0.2,
            "regression": 0.15,
            "difficulty_alignment": 0.1,
        }
        extreme_adjustments = {
            "weak_pattern": 0.4,
            "low_mastery": -0.4,
            "due_review": 0.3,
            "regression": 0.0,
            "difficulty_alignment": 0.0,
        }

        constrained = clamp_adaptive_weights(
            base_weights,
            extreme_adjustments,
            yki_influence_bonus=0.4,
        )

        self.assertEqual(constrained["policy_version"], POLICY_VERSION)
        self.assertTrue(constrained["clamped_values"])
        self.assertTrue(constrained["rejected_changes"])
        self.assertLessEqual(constrained["yki_influence_bonus"], 0.03)

    def test_recommendation_order_is_deterministic_with_policy_signature(self):
        user_id = "progress-test-deterministic-order"

        first = list_modules_for_user(user_id)
        second = list_modules_for_user(user_id)

        first_order = [
            (
                module["id"],
                module["suggestionScore"],
                module["whyThisWasSelected"]["decision_policy_version"],
            )
            for module in first["modules"]
        ]
        second_order = [
            (
                module["id"],
                module["suggestionScore"],
                module["whyThisWasSelected"]["decision_policy_version"],
            )
            for module in second["modules"]
        ]

        self.assertEqual(first_order, second_order)
        self.assertEqual(first["decisionPolicyVersion"], DECISION_POLICY_VERSION)


if __name__ == "__main__":
    unittest.main()
