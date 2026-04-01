import sys
import unittest
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parents[1]))

from yki.adapter import (
    advance_governed_exam,
    answer_governed_task,
    get_governed_exam,
    play_governed_listening_prompt,
    start_governed_exam,
)
import yki.session_store as session_store
from yki.storage import InMemorySessionStorage, _history, _sessions


class YkiExamRuntimeTests(unittest.TestCase):
    def setUp(self):
        session_store.storage = InMemorySessionStorage()
        _sessions.clear()
        _history.clear()

    def test_governed_exam_starts_on_reading_passage(self):
        started = start_governed_exam()

        session = get_governed_exam(started["session_id"])

        self.assertEqual(session["state_source"]["mode"], "engine_controlled")
        self.assertEqual(session["current_section"], "reading")
        self.assertEqual(session["current_view"]["kind"], "reading_passage")
        self.assertFalse(session["navigation"]["back_allowed"])
        self.assertTrue(session["navigation"]["forward_only"])
        self.assertIsNone(session["current_view"]["question"])

    def test_runtime_advances_prompt_then_questions_then_listening_prompt(self):
        session_id = start_governed_exam()["session_id"]

        advanced = advance_governed_exam(session_id)
        self.assertEqual(advanced["session_id"], session_id)
        reading_question = get_governed_exam(session_id)
        self.assertEqual(reading_question["current_view"]["kind"], "reading_question")

        answer_governed_task(session_id, "To collect practical Finnish-learning ideas for onboarding.")
        advance_governed_exam(session_id)
        answer_governed_task(session_id, "The supervisor")
        advance_governed_exam(session_id)

        section_complete = get_governed_exam(session_id)
        self.assertEqual(section_complete["current_view"]["kind"], "section_complete")

        advance_governed_exam(session_id)
        listening_prompt = get_governed_exam(session_id)

        self.assertEqual(listening_prompt["current_section"], "listening")
        self.assertEqual(listening_prompt["current_view"]["kind"], "listening_prompt")
        self.assertIsNone(listening_prompt["current_view"]["question"])
        self.assertEqual(listening_prompt["current_view"]["playback"]["remaining"], 1)

        play_governed_listening_prompt(session_id)
        playback_locked = get_governed_exam(session_id)
        self.assertEqual(playback_locked["current_view"]["playback"]["remaining"], 0)

    def test_exam_completes_in_read_only_mode_after_forward_only_runtime(self):
        session_id = start_governed_exam()["session_id"]

        for _ in range(20):
            current = get_governed_exam(session_id)
            if current["status"] == "read_only":
                break
            result = advance_governed_exam(session_id)
            self.assertNotIn("error", result)

        completed = get_governed_exam(session_id)

        self.assertEqual(completed["status"], "read_only")
        self.assertEqual(completed["current_view"]["kind"], "exam_complete")
        self.assertTrue(completed["navigation"]["read_only"])
        self.assertIsNotNone(completed["certificate"])

        rejected = answer_governed_task(session_id, "late answer")
        self.assertEqual(rejected["error"], "SESSION_READ_ONLY")


if __name__ == "__main__":
    unittest.main()
