import unittest

from app.services.progressive_disclosure_engine import ProgressiveDisclosureEngine


class ProgressiveDisclosureEngineTests(unittest.TestCase):
    def setUp(self):
        self.engine = ProgressiveDisclosureEngine()

    def test_high_error_or_hesitation_returns_level_0(self):
        level = self.engine.compute_support_level(
            history=[{"accuracy": 0.4}, {"accuracy": 0.45}],
            hesitation=0.8,
            accuracy=0.4,
        )
        self.assertEqual(level, 0)

    def test_moderate_error_returns_level_1(self):
        level = self.engine.compute_support_level(
            history=[{"accuracy": 0.7}],
            hesitation=0.4,
            accuracy=0.7,
        )
        self.assertEqual(level, 1)

    def test_low_error_returns_level_3(self):
        level = self.engine.compute_support_level(
            history=[{"accuracy": 0.95}, {"accuracy": 0.9}],
            hesitation=0.1,
            accuracy=0.95,
        )
        self.assertEqual(level, 3)

    def test_mask_case_endings_level_1(self):
        text = "Kissa on talossa ja kaupassa."
        masked = self.engine.mask_text(text, 1)
        self.assertIn("___", masked)
        self.assertNotEqual(text, masked)

    def test_mask_verbs_level_2(self):
        text = "Menin kauppaan ja ostin maitoa."
        masked = self.engine.mask_text(text, 2)
        self.assertIn("____", masked)
        self.assertNotEqual(text, masked)

    def test_memory_mode_level_3_returns_topic_hint(self):
        text = "Hei! Minä menen Helsinkiin ostamaan ruokaa."
        masked = self.engine.mask_text(text, 3)
        self.assertTrue(masked.startswith("Topic:") or masked.startswith("Memory mode"))


if __name__ == "__main__":
    unittest.main()
