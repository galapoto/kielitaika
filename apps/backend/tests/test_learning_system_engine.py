import sys
import unittest
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parents[1]))

from learning.system_content import LEARNING_LEVELS
from learning.system_service import (
    complete_learning_lesson,
    get_learning_system,
    reset_learning_system_progress_store,
    submit_learning_lesson_answer,
)


class LearningSystemEngineTests(unittest.TestCase):
    def setUp(self):
        reset_learning_system_progress_store()

    def test_catalog_is_hierarchical_and_deterministic(self):
        first = get_learning_system("learning-user")
        second = get_learning_system("learning-user")

        self.assertEqual(first, second)
        self.assertEqual([level["cefr"] for level in first["levels"]], ["A1", "A2", "B1"])
        self.assertEqual(first["levels"][0]["modules"][0]["lessons"][0]["id"], "lesson-a1-present-routines")
        self.assertTrue(first["levels"][0]["modules"][0]["lessons"][0]["items"])

    def test_exercise_submission_is_deterministic(self):
        module_id = LEARNING_LEVELS[0].modules[0].id
        lesson_id = LEARNING_LEVELS[0].modules[0].lessons[0].id
        exercise_id = LEARNING_LEVELS[0].modules[0].lessons[0].exercises[0].id

        first = submit_learning_lesson_answer(
            module_id,
            lesson_id,
            exercise_id,
            "opiskelen",
            user_id="answer-user",
        )
        second = submit_learning_lesson_answer(
            module_id,
            lesson_id,
            exercise_id,
            "opiskelen",
            user_id="fresh-user",
        )

        self.assertTrue(first["latestEvaluation"]["correct"])
        self.assertEqual(first["latestEvaluation"], second["latestEvaluation"])

    def test_progress_tracks_current_lesson_and_module_completion(self):
        first_module = LEARNING_LEVELS[0].modules[0]
        first_lesson_id = first_module.lessons[0].id
        second_lesson_id = first_module.lessons[1].id

        started = get_learning_system("progress-user")
        self.assertEqual(started["currentLessonId"], first_lesson_id)
        self.assertEqual(started["moduleProgress"][0]["completedLessonCount"], 0)

        updated = complete_learning_lesson(first_module.id, first_lesson_id, user_id="progress-user")

        self.assertIn(first_lesson_id, updated["completedLessonIds"])
        self.assertEqual(updated["currentLessonId"], second_lesson_id)
        self.assertEqual(updated["moduleProgress"][0]["completedLessonCount"], 1)
        self.assertEqual(updated["moduleProgress"][0]["currentLessonId"], second_lesson_id)


if __name__ == "__main__":
    unittest.main()
