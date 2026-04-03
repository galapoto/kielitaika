import sys
import unittest
from datetime import datetime, UTC
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parents[1]))
sys.path.insert(0, str(Path(__file__).resolve().parent))

from yki.adapter import (
    advance_governed_exam,
    answer_governed_task,
    get_governed_exam,
    play_governed_listening_prompt,
    start_governed_exam,
)
from yki.errors import EngineFailure
from yki.orchestrator import YKIOrchestrator
from yki.session_registry import SessionRegistry
from yki_test_support import complete_exam, install_fake_orchestrator


class YkiExamRuntimeTests(unittest.TestCase):
    def setUp(self):
        install_fake_orchestrator()

    def test_governed_exam_starts_on_reading_passage(self):
        started = start_governed_exam()

        session = get_governed_exam(started["session_id"])

        self.assertEqual(session["state_source"]["mode"], "engine_controlled")
        self.assertEqual(session["current_section"], "reading")
        self.assertEqual(session["current_view"]["kind"], "reading_passage")
        self.assertFalse(session["navigation"]["back_allowed"])
        self.assertTrue(session["navigation"]["forward_only"])
        self.assertIsNone(session["current_view"]["question"])

    def test_runtime_requires_answers_and_playback_before_progressing(self):
        session_id = start_governed_exam()["session_id"]

        advanced = advance_governed_exam(session_id)
        self.assertEqual(advanced["session_id"], session_id)
        reading_question = get_governed_exam(session_id)
        self.assertEqual(reading_question["current_view"]["kind"], "reading_question")
        self.assertFalse(reading_question["current_view"]["actions"]["next"]["enabled"])

        rejected = advance_governed_exam(session_id)
        self.assertEqual(rejected["error"], "TASK_NOT_ANSWERED")

        answer_governed_task(session_id, "To collect practical Finnish-learning ideas for onboarding.")
        submitted = get_governed_exam(session_id)
        self.assertTrue(submitted["current_view"]["response_locked"])
        self.assertTrue(submitted["current_view"]["actions"]["next"]["enabled"])

        advance_governed_exam(session_id)
        answer_governed_task(session_id, "The supervisor")
        advance_governed_exam(session_id)

        section_complete = get_governed_exam(session_id)
        self.assertEqual(section_complete["current_view"]["kind"], "section_complete")

        advance_governed_exam(session_id)
        listening_prompt = get_governed_exam(session_id)
        self.assertEqual(listening_prompt["current_section"], "listening")
        self.assertEqual(listening_prompt["current_view"]["kind"], "listening_prompt")
        self.assertFalse(listening_prompt["current_view"]["actions"]["next"]["enabled"])

        play_governed_listening_prompt(session_id)
        playback_unlocked = get_governed_exam(session_id)
        self.assertEqual(playback_unlocked["current_view"]["playback"]["remaining"], 0)
        self.assertTrue(playback_unlocked["current_view"]["actions"]["next"]["enabled"])

    def test_next_section_is_blocked_until_engine_window_opens(self):
        now = datetime(2026, 4, 3, 12, 0, tzinfo=UTC)
        install_fake_orchestrator(
            engine_timing_enforced=True,
            now_provider=lambda: now,
        )
        session_id = start_governed_exam()["session_id"]

        advance_governed_exam(session_id)
        answer_governed_task(session_id, "To collect practical Finnish-learning ideas for onboarding.")
        advance_governed_exam(session_id)
        answer_governed_task(session_id, "The supervisor")
        advance_governed_exam(session_id)

        section_complete = get_governed_exam(session_id)

        self.assertEqual(section_complete["current_view"]["kind"], "section_complete")
        self.assertFalse(section_complete["current_view"]["actions"]["next"]["enabled"])

        rejected = advance_governed_exam(session_id)

        self.assertEqual(rejected["error"], "NEXT_SECTION_NOT_AVAILABLE")

    def test_exam_completes_in_read_only_mode_after_explicit_submissions(self):
        session_id = start_governed_exam()["session_id"]

        complete_exam(session_id)

        completed = get_governed_exam(session_id)

        self.assertEqual(completed["status"], "read_only")
        self.assertEqual(completed["current_view"]["kind"], "exam_complete")
        self.assertTrue(completed["navigation"]["read_only"])
        self.assertIsNotNone(completed["certificate"])

        rejected = answer_governed_task(session_id, "late answer")
        self.assertEqual(rejected["error"], "SESSION_READ_ONLY")

    def test_engine_failures_fail_closed(self):
        install_fake_orchestrator(raise_on_get=True)
        session_id = start_governed_exam()["session_id"]

        failed = get_governed_exam(session_id)

        self.assertEqual(failed["error"], "ENGINE_UNAVAILABLE")

    def test_start_fails_closed_on_invalid_engine_response(self):
        class InvalidStartEngine:
            async def start_exam(self, payload=None):
                return {"invalid": True}

        from yki import adapter as yki_adapter

        yki_adapter.orchestrator = YKIOrchestrator(
            engine=InvalidStartEngine(),
            registry=SessionRegistry(),
        )

        failed = start_governed_exam()

        self.assertEqual(failed["error"], "ENGINE_INVALID_RESPONSE")

    def test_start_fails_closed_on_engine_timeout(self):
        class TimeoutStartEngine:
            async def start_exam(self, payload=None):
                raise EngineFailure("ENGINE_TIMEOUT")

        from yki import adapter as yki_adapter

        yki_adapter.orchestrator = YKIOrchestrator(
            engine=TimeoutStartEngine(),
            registry=SessionRegistry(),
        )

        failed = start_governed_exam()

        self.assertEqual(failed["error"], "ENGINE_TIMEOUT")


if __name__ == "__main__":
    unittest.main()
