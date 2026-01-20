import unittest

from fastapi.testclient import TestClient

from app.main import app


class VoiceRouterTests(unittest.TestCase):
    def setUp(self):
        self.client = TestClient(app)

    def tearDown(self):
        self.client.close()

    def test_stt_upload_endpoint_returns_transcript_field(self):
        response = self.client.post(
            "/voice/stt",
            content=b"\x00\x01\x02",
            headers={"Content-Type": "audio/webm"},
        )
        self.assertEqual(response.status_code, 200)
        data = response.json()
        self.assertIn("transcript", data)
        self.assertIsInstance(data["transcript"], str)

    def test_stt_stream_stub_emits_placeholder(self):
        with self.client.websocket_connect("/voice/stt-stream") as ws:
            ws.send_bytes(b"\x01\x02")
            message = ws.receive_text()
            self.assertIn(message, ("...", "error", "error:"))

    def test_tts_stream_stub_emits_audio_bytes(self):
        with self.client.websocket_connect("/voice/tts-stream") as ws:
            ws.send_json({"text": "Hei"})
            audio_chunk = ws.receive_bytes()
            self.assertIsInstance(audio_chunk, (bytes, bytearray))


if __name__ == "__main__":
    unittest.main()
