import sys
import unittest
from datetime import datetime, UTC, timedelta
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parents[1]))
sys.path.insert(0, str(Path(__file__).resolve().parent))

from yki.adapter import (
    advance_governed_exam,
    answer_governed_audio,
    answer_governed_task,
    get_governed_exam,
    play_governed_listening_prompt,
    start_governed_exam,
    upload_governed_audio,
)

from yki_test_support import install_fake_orchestrator, move_to_listening_prompt, move_to_speaking_response


class YkiAudioMediaPipelineTests(unittest.TestCase):
    def setUp(self):
        install_fake_orchestrator()

    def test_session_creation_exposes_listening_audio_reference(self):
        session_id = start_governed_exam()["session_id"]

        move_to_listening_prompt(session_id)
        session = get_governed_exam(session_id)

        playback = session["current_view"]["playback"]
        self.assertEqual(session["current_view"]["kind"], "listening_prompt")
        self.assertTrue(playback["ready"])
        self.assertIsNotNone(playback["audio"])
        self.assertTrue(playback["audio"]["url"].startswith("/api/audio/"))

    def test_playback_is_limited_to_one_backend_controlled_play(self):
        session_id = start_governed_exam()["session_id"]

        move_to_listening_prompt(session_id)
        first_play = play_governed_listening_prompt(session_id)
        second_play = play_governed_listening_prompt(session_id)

        self.assertIn("session_id", first_play)
        self.assertEqual(second_play["error"], "PLAYBACK_LIMIT_REACHED")

    def test_playback_fails_fast_when_audio_reference_is_missing(self):
        install_fake_orchestrator(missing_audio=True)
        session_id = start_governed_exam()["session_id"]

        move_to_listening_prompt(session_id)
        result = play_governed_listening_prompt(session_id)

        self.assertEqual(result["error"], "AUDIO_ASSET_MISSING")

    def test_listening_prompt_does_not_expire_before_first_play(self):
        current_time = {"value": datetime(2026, 4, 3, 12, 0, tzinfo=UTC)}
        install_fake_orchestrator(
            engine_timing_enforced=True,
            now_provider=lambda: current_time["value"],
        )
        session_id = start_governed_exam({"mode": "test"})["session_id"]

        advance_governed_exam(session_id)
        answer_governed_task(session_id, "To collect practical Finnish-learning ideas for onboarding.")
        advance_governed_exam(session_id)
        answer_governed_task(session_id, "The supervisor")
        advance_governed_exam(session_id)
        blocked_view = get_governed_exam(session_id)
        listening_started_at = datetime.fromisoformat(
            blocked_view["timing_manifest"]["sections"]["listening"]["started_at"]
        )
        current_time["value"] = listening_started_at
        advance_governed_exam(session_id)
        current_time["value"] = listening_started_at + timedelta(seconds=25)

        still_prompt = get_governed_exam(session_id)
        self.assertEqual(still_prompt["current_view"]["kind"], "listening_prompt")
        self.assertEqual(still_prompt["error"] if "error" in still_prompt else None, None)

    def test_first_play_restarts_listening_answer_window(self):
        current_time = {"value": datetime(2026, 4, 3, 12, 0, tzinfo=UTC)}
        install_fake_orchestrator(
            engine_timing_enforced=True,
            now_provider=lambda: current_time["value"],
        )
        session_id = start_governed_exam({"mode": "test"})["session_id"]

        advance_governed_exam(session_id)
        answer_governed_task(session_id, "To collect practical Finnish-learning ideas for onboarding.")
        advance_governed_exam(session_id)
        answer_governed_task(session_id, "The supervisor")
        advance_governed_exam(session_id)
        blocked_view = get_governed_exam(session_id)
        listening_started_at = datetime.fromisoformat(
            blocked_view["timing_manifest"]["sections"]["listening"]["started_at"]
        )
        current_time["value"] = listening_started_at
        advance_governed_exam(session_id)
        current_time["value"] = listening_started_at + timedelta(seconds=25)

        play_governed_listening_prompt(session_id)
        unlocked_view = get_governed_exam(session_id)

        self.assertEqual(unlocked_view["current_view"]["kind"], "listening_prompt")
        self.assertTrue(unlocked_view["current_view"]["actions"]["next"]["enabled"])
        self.assertGreaterEqual(
            unlocked_view["timing_manifest"]["current_section_remaining_seconds"],
            34,
        )

    def test_speaking_upload_returns_managed_engine_audio_path(self):
        session_id = start_governed_exam({"mode": "test"})["session_id"]
        move_to_speaking_response(session_id)

        upload = upload_governed_audio(
            session_id,
            filename="response.m4a",
            content_type="audio/mp4",
            content=b"speaking-bytes",
        )
        self.assertIn("file_path", upload)
        self.assertTrue(upload["file_path"].startswith("uploads/audio/exam/"))

        submitted = answer_governed_audio(session_id, upload["file_path"], 10_000)
        self.assertIn("session_id", submitted)

        speaking_view = get_governed_exam(session_id)
        self.assertEqual(speaking_view["current_view"]["submitted_audio"], upload["file_path"])


if __name__ == "__main__":
    unittest.main()
