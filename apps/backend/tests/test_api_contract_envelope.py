import sys
import unittest
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parents[1]))

import api_contract


class ApiContractEnvelopeTests(unittest.TestCase):
    def test_success_response_includes_locked_meta(self):
        response = api_contract.success({"z": 1, "a": {"d": 2, "c": 1}})

        self.assertTrue(response["ok"])
        self.assertIsNone(response["error"])
        self.assertEqual(response["meta"]["version"], api_contract.BACKEND_VERSION)
        self.assertEqual(response["meta"]["contract_version"], api_contract.CONTRACT_VERSION)
        self.assertEqual(list(response["data"].keys()), ["a", "z"])

    def test_failure_response_is_normalized(self):
        response = api_contract.failure("SESSION_NOT_FOUND")

        self.assertFalse(response["ok"])
        self.assertIsNone(response["data"])
        self.assertEqual(response["error"]["code"], "SESSION_NOT_FOUND")
        self.assertFalse(response["error"]["retryable"])
        self.assertEqual(response["meta"]["version"], api_contract.BACKEND_VERSION)


if __name__ == "__main__":
    unittest.main()
