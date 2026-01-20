import unittest

from app.services.conversation_engine import run_conversation


class ConversationEngineTests(unittest.IsolatedAsyncioTestCase):
    async def test_progressive_disclosure_applies_masking(self):
        response = await run_conversation(
            user_text="Minä mennä kauppassa",
            user_id="test-user-1",
            level="A1",
            enable_progressive_disclosure=True,
        )

        self.assertIn("reply", response)
        self.assertIn("masked_reply", response)
        self.assertIn("support_level", response)
        self.assertIn("grammar", response)
        self.assertIsInstance(response["grammar"].get("mistakes", []), list)

        # With mistakes present, support level should be >0
        if response["grammar"]["mistakes"]:
            self.assertGreaterEqual(response["support_level"], 1)
            self.assertIsInstance(response["masked_reply"], str)

    async def test_support_level_rises_with_accuracy(self):
        low_accuracy = await run_conversation(
            user_text="Minä mennä kauppassa",
            user_id="test-user-2",
            level="A1",
            enable_progressive_disclosure=True,
        )
        high_accuracy = await run_conversation(
            user_text="Minä menen kauppaan",
            user_id="test-user-2",
            level="A1",
            enable_progressive_disclosure=True,
        )

        self.assertLessEqual(low_accuracy["support_level"], high_accuracy["support_level"])
        self.assertIn("path", low_accuracy["meta"])
        self.assertIn("correction_mode", low_accuracy["meta"])


if __name__ == "__main__":
    unittest.main()
