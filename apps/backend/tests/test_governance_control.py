import sys
import unittest
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parents[1]))

from audit.audit_service import get_user_events, reset_audit_store
from governance.change_log_service import get_last_approved_change
from learning.graph_service import list_modules_for_user
from learning.policy_engine import (
    activate_policy_change,
    approve_policy_change,
    get_policy_config,
    propose_policy_change,
    reset_policy_governance,
)
from learning.progress_service import reset_progress_store
from yki.storage import _history


class GovernanceControlTests(unittest.TestCase):
    def setUp(self):
        reset_policy_governance()
        reset_progress_store()
        reset_audit_store()
        _history.clear()

    def test_unapproved_policy_change_cannot_activate(self):
        current_policy = get_policy_config()
        proposed_change = propose_policy_change(
            "governance-actor",
            "Tighten the allowed adaptive multiplier range.",
            {
                **current_policy["rules"],
                "adaptation": {
                    **current_policy["rules"]["adaptation"],
                    "weight_multiplier_max": 1.1,
                },
            },
        )

        with self.assertRaises(ValueError):
            activate_policy_change(proposed_change["change_id"])

        self.assertEqual(get_policy_config()["policy_version"], current_policy["policy_version"])

    def test_approved_policy_change_activates_new_version(self):
        current_policy = get_policy_config()
        proposed_change = propose_policy_change(
            "governance-actor",
            "Reduce the max adaptive adjustment after audit review.",
            {
                **current_policy["rules"],
                "adaptation": {
                    **current_policy["rules"]["adaptation"],
                    "max_weight_adjustment": 0.05,
                },
            },
        )
        approve_policy_change(proposed_change["change_id"], "governance-reviewer", True)
        activated_policy = activate_policy_change(proposed_change["change_id"])
        last_change = get_last_approved_change("learning.policy_engine")

        self.assertEqual(activated_policy["policy_version"], proposed_change["new_version"])
        self.assertNotEqual(
            activated_policy["governance_version"],
            current_policy["governance_version"],
        )
        self.assertEqual(last_change["change_id"], proposed_change["change_id"])
        self.assertEqual(last_change["justification"], proposed_change["justification"])

    def test_runtime_and_audit_use_only_approved_governed_versions(self):
        baseline_policy = get_policy_config()
        proposed_change = propose_policy_change(
            "governance-actor",
            "Shift YKI max influence after formal approval.",
            {
                **baseline_policy["rules"],
                "yki": {
                    **baseline_policy["rules"]["yki"],
                    "max_influence_contribution": 0.09,
                },
            },
        )

        before_activation = list_modules_for_user("governance-runtime-before")
        approve_policy_change(proposed_change["change_id"], "governance-reviewer", True)
        activated_policy = activate_policy_change(proposed_change["change_id"])
        after_activation = list_modules_for_user("governance-runtime-after")
        audit_events = get_user_events("governance-runtime-after")

        self.assertEqual(before_activation["policyVersion"], baseline_policy["policy_version"])
        self.assertEqual(after_activation["policyVersion"], activated_policy["policy_version"])
        self.assertEqual(after_activation["governanceVersion"], activated_policy["governance_version"])
        self.assertTrue(audit_events)
        self.assertTrue(all(event["governance_version"] for event in audit_events))
        self.assertTrue(all(event["change_reference"] == proposed_change["change_id"] for event in audit_events))


if __name__ == "__main__":
    unittest.main()
