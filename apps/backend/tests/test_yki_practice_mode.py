import sys
import unittest
from datetime import UTC, datetime
from pathlib import Path
from unittest.mock import patch

sys.path.insert(0, str(Path(__file__).resolve().parents[1]))

from learning.decision_version import DECISION_VERSION
from learning.practice_service import generate_practice
from learning.progress_service import get_unit_progress, record_practice_result, reset_progress_store
from yki.storage import _history
from yki_practice.adapter import get_yki_practice, start_yki_practice, submit_yki_practice
from yki_practice.service import reset_practice_sessions


def build_history_summary(level: str, weak_areas: list[str]):
    return {
        "session_id": f"history-{level}-{'-'.join(weak_areas) or 'balanced'}",
        "date": "2026-01-01T00:00:00",
        "overall_score": 4 if not weak_areas else 2,
        "level": level,
        "section_scores": {
            "reading": 4,
            "listening": 4,
            "writing": 4,
            "speaking": 4,
        },
        "weak_areas": weak_areas,
        "passed": not weak_areas,
    }


class YkiPracticeModeTests(unittest.TestCase):
    def setUp(self):
        reset_progress_store()
        reset_practice_sessions()
        _history.clear()

    def test_weak_learner_gets_easier_focused_tasks(self):
        user_id = "practice-weak"
        _history[user_id] = [build_history_summary("B1", ["language_accuracy", "clarity"])]
        weak_exercise = next(
            item
            for item in generate_practice("module-work-and-study-communication")["exercises"]
            if item["unit_id"] == "grammar-object-cases"
        )

        with patch(
            "learning.progress_service._current_time",
            return_value=datetime(2026, 1, 1, tzinfo=UTC),
        ):
            record_practice_result(user_id, weak_exercise, False)

        with patch(
            "learning.progress_service._current_time",
            return_value=datetime(2026, 1, 2, tzinfo=UTC),
        ):
            session = start_yki_practice(user_id)

        self.assertEqual(session["level"], "A2")
        self.assertIn("language_accuracy", session["focus_areas"])
        self.assertIn("grammar-object-cases", session["focus_areas"])
        self.assertEqual(session["tasks"][0]["relatedLearningUnitId"], "grammar-object-cases")

    def test_strong_learner_gets_varied_tasks(self):
        user_id = "practice-strong"
        _history[user_id] = [build_history_summary("B1", [])]

        session = start_yki_practice(user_id)
        sections = [task["section"] for task in session["tasks"]]
        related_units = {task["relatedLearningUnitId"] for task in session["tasks"]}

        self.assertEqual(session["level"], "B1")
        self.assertEqual(session["focus_areas"], ["balanced_practice"])
        self.assertEqual(sections, ["reading", "listening", "writing", "speaking"])
        self.assertGreater(len(related_units), 1)

    def test_repeated_sessions_show_improvement(self):
        user_id = "practice-repeat"

        first_session = start_yki_practice(user_id)
        first_task = first_session["currentTask"]
        submit_yki_practice(first_session["session_id"], "wrong answer", "submit_only")

        second_session = start_yki_practice(user_id)
        second_task = second_session["currentTask"]
        submit_yki_practice(second_session["session_id"], second_task["correctAnswer"], "submit_only")

        progress = get_unit_progress(first_task["relatedLearningUnitId"], user_id)

        self.assertEqual(first_task["relatedLearningUnitId"], second_task["relatedLearningUnitId"])
        self.assertEqual(progress["attempts"], 2)
        self.assertEqual(progress["correct_attempts"], 1)
        self.assertGreater(progress["mastery_score"], 0.0)

    def test_feedback_and_session_summary_explain_performance(self):
        user_id = "practice-summary"
        session = start_yki_practice(user_id)

        submitted = submit_yki_practice(session["session_id"], "wrong answer", "submit_only")
        evaluation = submitted["currentTask"]["evaluation"]

        self.assertIn("whyWrong", evaluation)
        self.assertIsNotNone(evaluation["ruleApplies"])
        self.assertEqual(
            evaluation["linkedLearningUnit"]["id"],
            submitted["currentTask"]["relatedLearningUnitId"],
        )

        active_session = submitted
        while not active_session["isComplete"]:
            current_task = active_session["currentTask"]
            if current_task is None:
                break

            if current_task["section"] in {"reading", "listening"}:
                answer = current_task["correctAnswer"]
            else:
                answer = f"{current_task['prompt']} {current_task['relatedLearningUnitId']}"

            active_session = submit_yki_practice(
                session["session_id"],
                answer,
                "submit_and_next",
            )

        self.assertTrue(active_session["sessionSummary"]["strengths"])
        self.assertTrue(active_session["sessionSummary"]["weaknesses"])
        self.assertTrue(active_session["sessionSummary"]["recommended_focus"])
        self.assertTrue(active_session["sessionTrace"]["tasks"])

    def test_session_trace_records_selection_and_feedback(self):
        user_id = "practice-trace"
        session = start_yki_practice(user_id)
        first_trace = session["sessionTrace"]["tasks"][0]

        self.assertEqual(session["sessionTrace"]["decision_version"], DECISION_VERSION)
        self.assertTrue(first_trace["task_selection_reason"])
        self.assertIsNotNone(first_trace["difficulty_level"])
        self.assertIsNone(first_trace["user_performance"])

        updated = submit_yki_practice(session["session_id"], "wrong answer", "submit_only")
        updated_trace = updated["sessionTrace"]["tasks"][0]

        self.assertEqual(updated_trace["user_performance"]["score"], 2)
        self.assertIn("whyWrong", updated_trace["feedback_generated"])

    def test_retry_section_resets_progress_without_exam_locking(self):
        user_id = "practice-retry"

        session = start_yki_practice(user_id)
        first_task = session["currentTask"]
        updated = submit_yki_practice(session["session_id"], first_task["correctAnswer"], "submit_only")
        reset_session = submit_yki_practice(session["session_id"], None, "retry_section")

        self.assertEqual(updated["results"][0]["taskId"], first_task["id"])
        self.assertEqual(reset_session["currentTask"]["id"], first_task["id"])
        self.assertEqual(reset_session["results"], [])
        self.assertFalse(reset_session["isComplete"])
        self.assertEqual(get_yki_practice(session["session_id"])["currentTask"]["id"], first_task["id"])


if __name__ == "__main__":
    unittest.main()
