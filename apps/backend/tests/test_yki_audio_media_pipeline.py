import sys
import unittest
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parents[1]))
sys.path.insert(0, str(Path(__file__).resolve().parent))

from yki.adapter import advance_governed_exam, get_governed_exam, play_governed_listening_prompt, start_governed_exam

from yki_test_support import install_fake_orchestrator, move_to_listening_prompt


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


if __name__ == "__main__":
    unittest.main()
