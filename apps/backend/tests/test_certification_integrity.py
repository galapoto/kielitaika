import sys
import unittest
from copy import deepcopy
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parents[1]))

from audit.audit_service import get_session_events, record_event, reset_audit_store
from audit.verification_engine import verify_certification
from learning.policy_engine import reset_policy_governance
from learning.progress_service import reset_progress_store
from yki.storage import _history
from yki_practice.certification_service import export_certification
from yki_practice.service import reset_practice_sessions
from yki_practice.adapter import start_yki_practice, submit_yki_practice


class CertificationIntegrityTests(unittest.TestCase):
    def setUp(self):
        reset_policy_governance()
        reset_progress_store()
        reset_practice_sessions()
        reset_audit_store()
        _history.clear()

    def _complete_session(self, user_id: str):
        session = start_yki_practice(user_id)
        active_session = session

        while not active_session["isComplete"]:
            if active_session["next_allowed_action"] == "advance":
                active_session = submit_yki_practice(session["session_id"], None, "advance")
                continue

            current_task = active_session["currentTask"]
            if current_task is None:
                break

            if current_task["section"] in {"reading", "listening"}:
                answer = current_task["correctAnswer"]
            else:
                answer = f"{current_task['prompt']} {current_task['relatedLearningUnitId']}"

            active_session = submit_yki_practice(session["session_id"], answer, "submit_only")

        return active_session

    def test_completed_session_produces_certification_record(self):
        completed = self._complete_session("certification-created")
        certification = completed["certification"]

        self.assertIsNotNone(certification)
        self.assertEqual(
            certification["certification_record"]["session_id"],
            completed["session_id"],
        )
        self.assertTrue(certification["final_result_hash"])
        self.assertEqual(certification["verification"]["status"], "valid")

    def test_certification_is_immutable_after_creation(self):
        completed = self._complete_session("certification-immutable")
        first_export = deepcopy(export_certification(completed["session_id"]))

        extra_event = record_event(
            {
                "user_id": completed["user_id"],
                "session_id": completed["session_id"],
                "event_type": "YKI_POST_COMPLETION_NOOP",
                "input_snapshot": {"source": "test"},
                "output_snapshot": {"sealed": True},
                "constraint_metadata": {},
            }
        )
        second_export = export_certification(completed["session_id"])

        self.assertIsNotNone(extra_event)
        self.assertEqual(first_export, second_export)

    def test_verification_succeeds_for_sealed_session(self):
        completed = self._complete_session("certification-valid")

        verification = verify_certification(completed["session_id"])

        self.assertTrue(verification["ok"])
        self.assertEqual(verification["status"], "valid")

    def test_post_completion_mutation_is_rejected(self):
        completed = self._complete_session("certification-locked")

        mutated = submit_yki_practice(completed["session_id"], "new answer", "submit_only")

        self.assertEqual(mutated["error"], "SESSION_CERTIFIED")

    def test_verification_fails_when_audit_is_tampered(self):
        completed = self._complete_session("certification-invalid")
        record_event(
            {
                "user_id": completed["user_id"],
                "session_id": completed["session_id"],
                "event_type": "YKI_TAMPERED_EVENT",
                "session_hash": "tampered-session-hash",
                "task_sequence_hash": completed["task_sequence_hash"],
                "input_snapshot": {"source": "tamper-test"},
                "output_snapshot": {"session_hash": "tampered-session-hash"},
                "constraint_metadata": {},
            }
        )

        verification = verify_certification(completed["session_id"])

        self.assertFalse(verification["ok"])
        self.assertEqual(verification["status"], "CERTIFICATION_INVALID")


if __name__ == "__main__":
    unittest.main()
