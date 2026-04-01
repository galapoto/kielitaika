import sys
import tempfile
import unittest
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parents[1]))

import speaking.session_store as session_store
import tts.audio_registry as audio_registry_module
from speaking.engine import (
    DEFAULT_SPEAKING_TTS_SETTINGS,
    DEFAULT_SPEAKING_VOICE_ID,
    build_prompt_catalog,
    evaluate_spoken_response,
)
from speaking.session_store import advance_session, create_session, submit_response
from tts.audio_registry import AudioRegistry, FileBackedAudioRegistryStore, build_audio_key


class SpeakingPracticeEngineTests(unittest.TestCase):
    def setUp(self):
        self.temp_dir = tempfile.TemporaryDirectory()
        audio_registry_module.audio_registry = AudioRegistry(
            FileBackedAudioRegistryStore(self.temp_dir.name),
        )
        session_store._sessions.clear()

    def tearDown(self):
        self.temp_dir.cleanup()

    def test_prompt_catalog_and_evaluation_are_deterministic(self):
        first = build_prompt_catalog()
        second = build_prompt_catalog()

        self.assertEqual(first, second)
        self.assertEqual(first[0]["id"], "speaking-intro-1")

        prompt = first[0]
        correct = evaluate_spoken_response(prompt, "Olen Anna ja asun Helsingissa.")
        wrong = evaluate_spoken_response(prompt, "Olen Pekka ja asun Turussa.")

        self.assertTrue(correct["correct"])
        self.assertFalse(wrong["correct"])
        self.assertEqual(correct, evaluate_spoken_response(prompt, "Olen Anna ja asun Helsingissa."))

    def test_session_prerenders_prompt_audio_and_tracks_forward_only_state(self):
        session = create_session()
        current_prompt = session["current_prompt"]

        self.assertTrue(current_prompt["prompt_audio"]["ready"])
        self.assertTrue(current_prompt["prompt_audio"]["url"].startswith("/api/audio/"))
        self.assertTrue(session["actions"]["play_prompt"])
        self.assertTrue(session["actions"]["submit"])
        self.assertFalse(session["actions"]["next"])

        answered = submit_response(
            session["session_id"],
            "Olen Anna ja asun Helsingissa.",
            True,
        )

        self.assertTrue(answered["latest_result"]["correct"])
        self.assertTrue(answered["latest_result"]["recording_captured"])
        self.assertEqual(answered["latest_result"]["capture_mode"], "recording_with_transcript")
        self.assertFalse(answered["actions"]["submit"])
        self.assertTrue(answered["actions"]["next"])

        advanced = advance_session(session["session_id"])
        self.assertEqual(advanced["current_prompt_index"], 1)

    def test_audio_key_matches_speaking_prompt_inputs(self):
        prompt = build_prompt_catalog()[0]
        first = build_audio_key(
            prompt["prompt_text"],
            DEFAULT_SPEAKING_VOICE_ID,
            DEFAULT_SPEAKING_TTS_SETTINGS,
        )
        second = build_audio_key(
            prompt["prompt_text"],
            DEFAULT_SPEAKING_VOICE_ID,
            DEFAULT_SPEAKING_TTS_SETTINGS,
        )

        self.assertEqual(first, second)


if __name__ == "__main__":
    unittest.main()
