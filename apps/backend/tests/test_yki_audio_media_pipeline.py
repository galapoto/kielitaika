import sys
import tempfile
import unittest
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parents[1]))

import tts.audio_registry as audio_registry_module
import yki.session_store as session_store
from tts.audio_registry import (
    DEFAULT_YKI_LISTENING_SETTINGS,
    AudioRegistry,
    FileBackedAudioRegistryStore,
    build_audio_key,
    get_audio_asset,
    pre_render_listening_asset,
)
from yki.adapter import advance_governed_exam, get_governed_exam, play_governed_listening_prompt, start_governed_exam
from yki.storage import InMemorySessionStorage, _history, _sessions


class YkiAudioMediaPipelineTests(unittest.TestCase):
    def setUp(self):
        self.temp_dir = tempfile.TemporaryDirectory()
        audio_registry_module.audio_registry = AudioRegistry(
            FileBackedAudioRegistryStore(self.temp_dir.name),
        )
        session_store.storage = InMemorySessionStorage()
        _sessions.clear()
        _history.clear()

    def tearDown(self):
        self.temp_dir.cleanup()

    def test_audio_key_and_asset_are_deterministic(self):
        payload = {
            "settings": DEFAULT_YKI_LISTENING_SETTINGS,
            "text": "A caller asks to move a meeting because the train is delayed.",
            "voiceId": "yki-listening-fi-v1",
        }

        first_key = build_audio_key(
            payload["text"],
            payload["voiceId"],
            payload["settings"],
        )
        second_key = build_audio_key(
            payload["text"],
            payload["voiceId"],
            payload["settings"],
        )
        first_asset = pre_render_listening_asset(
            text=payload["text"],
            voice_id=payload["voiceId"],
            settings=payload["settings"],
        )
        second_asset = pre_render_listening_asset(
            text=payload["text"],
            voice_id=payload["voiceId"],
            settings=payload["settings"],
        )

        self.assertEqual(first_key, second_key)
        self.assertEqual(first_asset["id"], second_asset["id"])
        self.assertEqual(first_asset["file_path"], second_asset["file_path"])
        self.assertEqual(
            Path(first_asset["file_path"]).read_bytes(),
            Path(second_asset["file_path"]).read_bytes(),
        )

    def test_session_creation_prerenders_audio_and_exposes_reference(self):
        session_id = start_governed_exam()["session_id"]

        advance_governed_exam(session_id)
        advance_governed_exam(session_id)
        advance_governed_exam(session_id)
        advance_governed_exam(session_id)

        session = get_governed_exam(session_id)
        playback = session["current_view"]["playback"]

        self.assertEqual(session["current_view"]["kind"], "listening_prompt")
        self.assertTrue(playback["ready"])
        self.assertIsNotNone(playback["audio"])
        self.assertTrue(playback["audio"]["url"].startswith("/api/audio/"))
        self.assertNotIn("audioPrompt", session["current_view"])

    def test_registry_exposes_prerendered_binary_metadata(self):
        asset = pre_render_listening_asset(
            text="A caller asks to move a meeting because the train is delayed.",
        )
        stored = get_audio_asset(asset["id"])

        self.assertIsNotNone(stored)
        self.assertEqual(stored["content_type"], "audio/wav")
        self.assertTrue(Path(stored["file_path"]).exists())
        self.assertGreater(Path(stored["file_path"]).stat().st_size, 0)

    def test_playback_fails_fast_when_prerendered_asset_is_missing(self):
        session_id = start_governed_exam()["session_id"]

        advance_governed_exam(session_id)
        advance_governed_exam(session_id)
        advance_governed_exam(session_id)
        advance_governed_exam(session_id)

        session = session_store.get_session(session_id)
        listening_task = session["sections"]["listening"]["tasks"][0]
        asset = audio_registry_module.get_audio_asset(listening_task["audioAssetId"])
        Path(asset["file_path"]).unlink()
        session_store.storage.update(session_id, session)

        result = play_governed_listening_prompt(session_id)

        self.assertEqual(result["error"], "AUDIO_ASSET_MISSING")


if __name__ == "__main__":
    unittest.main()
