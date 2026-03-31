from copy import deepcopy
import json
import sys
import unittest
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parents[1]))

from audit.audit_logger import AUDIT_LOG_PATH, read_events
from audit.audit_integrity import compute_event_hash, verify_audit_integrity
from audit.audit_service import get_session_events, get_user_events, reset_audit_store
from audit.replay_engine import replay_session, verify_replay_consistency
from learning.graph_service import list_modules_for_user
from learning.policy_engine import reset_policy_governance
from learning.practice_service import generate_practice
from learning.progress_service import record_practice_result, reset_progress_store
from utils.hash_utils import deterministic_hash
from yki.storage import _history
from yki_practice.adapter import start_yki_practice, submit_yki_practice
from yki_practice.service import reset_practice_sessions


class AuditReplayTests(unittest.TestCase):
    def setUp(self):
        reset_policy_governance()
        reset_progress_store()
        reset_practice_sessions()
        reset_audit_store()
        _history.clear()

    def test_learning_events_are_audited_with_replayable_recommendations(self):
        user_id = "audit-learning"
        modules = list_modules_for_user(user_id)
        suggested_module_id = modules["suggestedModules"][0]["id"]
        suggested_unit_id = modules["suggestedModules"][0]["unitIds"][0]

        complete_exercise = next(
            item
            for item in generate_practice("module-daily-life-routines")["exercises"]
            if item["unit_id"] == "vocab-aamu"
        )
        suggested_exercises = generate_practice(suggested_module_id)["exercises"]
        stagnation_exercise = next(
            (
                item
                for item in suggested_exercises
                if item["unit_id"] == suggested_unit_id
                and item["unit_id"] != complete_exercise["unit_id"]
            ),
            None,
        )
        if stagnation_exercise is None:
            stagnation_exercise = next(
                item
                for item in suggested_exercises
                if item["unit_id"] != complete_exercise["unit_id"]
            )

        record_practice_result(user_id, complete_exercise, True)
        record_practice_result(user_id, stagnation_exercise, False)
        record_practice_result(user_id, stagnation_exercise, False)
        record_practice_result(user_id, stagnation_exercise, False)

        events = get_user_events(user_id)
        event_types = [event["event_type"] for event in events]
        replay = replay_session(events)
        verification = verify_replay_consistency(events)

        self.assertIn("POLICY_APPLIED", event_types)
        self.assertIn("RECOMMENDATION_GENERATED", event_types)
        self.assertIn("RECOMMENDATION_SERVED", event_types)
        self.assertIn("UNIT_ATTEMPTED", event_types)
        self.assertIn("UNIT_COMPLETED", event_types)
        self.assertIn("STAGNATION_DETECTED", event_types)
        self.assertTrue(verification["ok"])
        self.assertEqual(
            replay["recommendationSequence"][0]["suggestedModuleIds"],
            [module["id"] for module in modules["suggestedModules"]],
        )
        self.assertTrue(all(event["event_hash"] for event in events))
        self.assertEqual(verification["integrity"]["integrityStatus"], "valid")
        self.assertTrue(replay["responseSequence"])
        self.assertEqual(replay["finalTaskSequenceHash"], events[-1]["task_sequence_hash"])

    def test_audit_log_is_written_as_jsonl_for_replay(self):
        session = start_yki_practice("audit-jsonl")

        self.assertTrue(AUDIT_LOG_PATH.exists())
        lines = AUDIT_LOG_PATH.read_text(encoding="utf-8").strip().splitlines()
        self.assertGreaterEqual(len(lines), 2)

        parsed = [json.loads(line) for line in lines]
        self.assertEqual(parsed[0]["session_id"], session["session_id"])
        self.assertEqual(parsed[0]["event_id"], "audit-000001")
        self.assertEqual(read_events(session_id=session["session_id"])[0]["event_id"], "audit-000001")

    def test_replay_detects_response_hash_mismatch(self):
        session = start_yki_practice("audit-replay-mismatch")
        events = get_session_events(session["session_id"])
        tampered_events = deepcopy(events)
        replay_event = next(
            event
            for event in tampered_events
            if isinstance(event.get("output_snapshot"), dict)
            and "session_hash" in event["output_snapshot"]
        )
        replay_event["output_snapshot"]["session_hash"] = "tampered-session-hash"
        replay_event["response_payload_hash"] = deterministic_hash(replay_event["output_snapshot"])

        previous_hash = None
        for event in tampered_events:
            event["previous_event_hash"] = previous_hash
            event["event_hash"] = compute_event_hash(event, previous_hash)
            previous_hash = event["event_hash"]

        verification = verify_replay_consistency(tampered_events)

        self.assertFalse(verification["ok"])
        self.assertTrue(
            any("REPLAY_MISMATCH" in issue for issue in verification["issues"]),
        )

    def test_yki_session_is_replayable_and_consistent(self):
        user_id = "audit-yki"
        session = start_yki_practice(user_id)
        session_id = session["session_id"]
        planned_task_ids = session["precomputedPlan"]["task_ids"]

        active_session = session
        while not active_session["isComplete"]:
            if active_session["next_allowed_action"] == "advance":
                active_session = submit_yki_practice(session_id, None, "advance")
                continue

            current_task = active_session["currentTask"]
            if current_task is None:
                break

            if current_task["section"] in {"reading", "listening"}:
                answer = current_task["correctAnswer"]
            else:
                answer = f"{current_task['prompt']} {current_task['relatedLearningUnitId']}"

            active_session = submit_yki_practice(session_id, answer, "submit_only")

        events = get_session_events(session_id)
        replay = replay_session(events)
        verification = verify_replay_consistency(events)
        presented_task_ids = [
            item["taskId"]
            for item in replay["ykiTaskFlow"]
            if item["phase"] == "presented"
        ]
        responded_task_ids = [
            item["taskId"]
            for item in replay["ykiTaskFlow"]
            if item["phase"] == "responded"
        ]
        completed_event = next(
            item for item in replay["ykiTaskFlow"] if item["phase"] == "completed"
        )

        self.assertTrue(verification["ok"])
        self.assertEqual(presented_task_ids, planned_task_ids)
        self.assertEqual(responded_task_ids, planned_task_ids)
        self.assertEqual(completed_event["completedTaskIds"], planned_task_ids)
        self.assertEqual(verification["integrity"]["integrityStatus"], "valid")

    def test_integrity_verification_detects_tampering(self):
        user_id = "audit-tamper"
        list_modules_for_user(user_id)
        events = get_user_events(user_id)
        tampered_events = deepcopy(events)
        tampered_events[1]["output_snapshot"]["suggested_module_ids"] = ["tampered-module"]

        verification = verify_audit_integrity(tampered_events)

        self.assertFalse(verification["ok"])
        self.assertEqual(verification["integrityStatus"], "invalid")
        self.assertIn("Event hash mismatch", verification["failureReason"])

    def test_integrity_verification_detects_deleted_event(self):
        user_id = "audit-delete"
        list_modules_for_user(user_id)
        events = get_user_events(user_id)
        deleted_events = [events[0], *events[2:]]

        verification = verify_audit_integrity(deleted_events)

        self.assertFalse(verification["ok"])
        self.assertEqual(verification["integrityStatus"], "invalid")
        self.assertIn("Hash chain broke", verification["failureReason"])

    def test_integrity_verification_detects_reordered_events(self):
        user_id = "audit-reorder"
        list_modules_for_user(user_id)
        events = get_user_events(user_id)
        reordered_events = deepcopy(events)
        reordered_events[0], reordered_events[1] = reordered_events[1], reordered_events[0]

        verification = verify_audit_integrity(reordered_events)

        self.assertFalse(verification["ok"])
        self.assertEqual(verification["integrityStatus"], "invalid")
        self.assertIn("Hash chain broke", verification["failureReason"])


if __name__ == "__main__":
    unittest.main()
