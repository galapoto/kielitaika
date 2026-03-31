import sys
import unittest
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parents[1]))

from utils.hash_utils import deterministic_hash, stable_serialize


class HashUtilsTests(unittest.TestCase):
    def test_hash_is_deterministic_for_equivalent_objects(self):
        left = {"b": 2, "a": {"d": [3, 2, 1], "c": 1}}
        right = {"a": {"c": 1, "d": [3, 2, 1]}, "b": 2}

        self.assertEqual(deterministic_hash(left), deterministic_hash(right))
        self.assertEqual(stable_serialize(left), stable_serialize(right))


if __name__ == "__main__":
    unittest.main()
