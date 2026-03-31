import sys
import unittest
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parents[1]))

from audit.audit_service import get_session_events, get_user_events, reset_audit_store
from audit.replay_engine import replay_session, verify_replay_consistency
from learning.graph_service import list_modules_for_user
from learning.practice_service import generate_practice
from learning.progress_service import record_practice_result, reset_progress_store
from yki.storage import _history
from yki_practice.adapter import start_yki_practice, submit_yki_practice
from yki_practice.service import reset_practice_sessions


class AuditReplayTests(unittest.TestCase):
    def setUp(self):
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

    def test_yki_session_is_replayable_and_consistent(self):
        user_id = "audit-yki"
        session = start_yki_practice(user_id)
        session_id = session["session_id"]
        planned_task_ids = session["precomputedPlan"]["task_ids"]

        active_session = session
        while not active_session["isComplete"]:
            current_task = active_session["currentTask"]
            if current_task is None:
                break

            if current_task["section"] in {"reading", "listening"}:
                answer = current_task["correctAnswer"]
            else:
                answer = f"{current_task['prompt']} {current_task['relatedLearningUnitId']}"

            active_session = submit_yki_practice(session_id, answer, "submit_and_next")

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


if __name__ == "__main__":
    unittest.main()
