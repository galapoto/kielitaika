import sys
import unittest
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parents[1]))

from practice.engine import build_exercise_catalog, evaluate_exercise_answer
import practice.session_store as session_store


class DailyPracticeEngineTests(unittest.TestCase):
    def setUp(self):
        session_store._sessions.clear()
        session_store._last_exercise_ids.clear()

    def test_exercises_are_defined_deterministically(self):
        first = build_exercise_catalog("seed-one")
        second = build_exercise_catalog("seed-one")
        third = build_exercise_catalog("seed-two")

        self.assertEqual(first, second)
        self.assertNotEqual([exercise["id"] for exercise in first], [exercise["id"] for exercise in third])
        self.assertEqual(len(first), 3)
        self.assertEqual(len({exercise["id"] for exercise in first}), 3)
        self.assertGreaterEqual(len({exercise["unit_kind"] for exercise in first}), 2)

    def test_evaluation_is_deterministic(self):
        exercise = next(
            exercise for exercise in build_exercise_catalog("seed-eval")
            if exercise["input_mode"] == "text"
        )

        first = evaluate_exercise_answer(exercise, exercise["expected_answer"])
        second = evaluate_exercise_answer(exercise, exercise["expected_answer"])
        wrong = evaluate_exercise_answer(exercise, "definitely-wrong")

        self.assertEqual(first, second)
        self.assertTrue(first["correct"])
        self.assertFalse(wrong["correct"])
        self.assertEqual(wrong["expected_answer"], exercise["expected_answer"])

    def test_session_tracks_progress_and_forward_only_flow(self):
        started = session_store.create_session()
        session_id = started["session_id"]

        self.assertIsNotNone(started["current_exercise"])
        self.assertFalse(started["completion_state"]["session_complete"])

        first_exercise = session_store.get_session(session_id)["exercises"][0]
        answered = session_store.submit_answer(session_id, first_exercise["expected_answer"])
        self.assertTrue(answered["latest_result"]["correct"])
        self.assertEqual(answered["completion_state"]["completed_count"], 1)
        self.assertTrue(answered["actions"]["next"])
        self.assertFalse(answered["actions"]["submit"])

        advanced = session_store.advance_session(session_id)
        self.assertIsNotNone(advanced["current_exercise"])

        second_exercise = session_store.get_session(session_id)["exercises"][1]
        finished = session_store.submit_answer(session_id, second_exercise["expected_answer"])
        finished = session_store.advance_session(session_id)
        third_exercise = session_store.get_session(session_id)["exercises"][2]
        finished = session_store.submit_answer(session_id, third_exercise["expected_answer"])
        finished = session_store.advance_session(session_id)

        self.assertEqual(finished["status"], "completed")
        self.assertTrue(finished["completion_state"]["session_complete"])
        self.assertEqual(finished["completion_state"]["accuracy"], 1)

    def test_second_session_avoids_previous_selection_when_possible(self):
        first = session_store.create_session()
        first_ids = [exercise["id"] for exercise in session_store.get_session(first["session_id"])["exercises"]]

        second = session_store.create_session()
        second_ids = [exercise["id"] for exercise in session_store.get_session(second["session_id"])["exercises"]]

        self.assertNotEqual(first_ids, second_ids)


if __name__ == "__main__":
    unittest.main()
