import unittest

from app.services.pronunciation_engine import PronunciationEngine


class PronunciationEngineTests(unittest.TestCase):
    def setUp(self):
        self.engine = PronunciationEngine()

    def test_perfect_pronunciation_scores_high(self):
        result = self.engine.analyze_audio(
            expected_text="Minä menen kauppaan",
            transcript="Minä menen kauppaan",
        )
        self.assertGreaterEqual(result["score"], 4)
        self.assertEqual(result["vowel_issues"], [])
        self.assertEqual(result["consonant_issues"], [])

    def test_vowel_length_issue_detected(self):
        result = self.engine.analyze_audio(
            expected_text="Tuuli tuli",
            transcript="Tuli tuli",
        )
        self.assertTrue(result["vowel_issues"])
        self.assertLess(result["score"], 4)

    def test_consonant_length_issue_detected(self):
        result = self.engine.analyze_audio(
            expected_text="mutta",
            transcript="muta",
        )
        self.assertTrue(result["consonant_issues"])
        self.assertLess(result["score"], 4)

    def test_rhythm_assessment_handles_short_and_long(self):
        slow = self.engine._assess_rhythm("Hei hei hei", "Hei")
        fast = self.engine._assess_rhythm("Hei", "Hei hei hei hei")
        self.assertEqual(slow, "too_slow")
        self.assertEqual(fast, "too_fast")


if __name__ == "__main__":
    unittest.main()
