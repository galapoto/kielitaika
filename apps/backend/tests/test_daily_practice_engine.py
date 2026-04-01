import sys
import unittest
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parents[1]))

from practice.engine import build_exercise_catalog, evaluate_exercise_answer
import practice.session_store as session_store


class DailyPracticeEngineTests(unittest.TestCase):
    def setUp(self):
        session_store._sessions.clear()

    def test_exercises_are_defined_deterministically(self):
        first = build_exercise_catalog()
        second = build_exercise_catalog()

        self.assertEqual(first, second)
        self.assertEqual([exercise["type"] for exercise in first], [
            "vocabulary_selection",
            "sentence_completion",
            "grammar_selection",
        ])

    def test_evaluation_is_deterministic(self):
        exercise = build_exercise_catalog()[1]

        first = evaluate_exercise_answer(exercise, "menen")
        second = evaluate_exercise_answer(exercise, "menen")
        wrong = evaluate_exercise_answer(exercise, "menet")

        self.assertEqual(first, second)
        self.assertTrue(first["correct"])
        self.assertFalse(wrong["correct"])
        self.assertEqual(wrong["expected_answer"], "menen")

    def test_session_tracks_progress_and_forward_only_flow(self):
        started = session_store.create_session()
        session_id = started["session_id"]

        self.assertEqual(started["current_exercise"]["type"], "vocabulary_selection")
        self.assertFalse(started["completion_state"]["session_complete"])

        answered = session_store.submit_answer(session_id, "book")
        self.assertTrue(answered["latest_result"]["correct"])
        self.assertEqual(answered["completion_state"]["completed_count"], 1)
        self.assertTrue(answered["actions"]["next"])
        self.assertFalse(answered["actions"]["submit"])

        advanced = session_store.advance_session(session_id)
        self.assertEqual(advanced["current_exercise"]["type"], "sentence_completion")

        finished = session_store.submit_answer(session_id, "menen")
        finished = session_store.advance_session(session_id)
        finished = session_store.submit_answer(session_id, "juomme")
        finished = session_store.advance_session(session_id)

        self.assertEqual(finished["status"], "completed")
        self.assertTrue(finished["completion_state"]["session_complete"])
        self.assertEqual(finished["completion_state"]["accuracy"], 1)


if __name__ == "__main__":
    unittest.main()
