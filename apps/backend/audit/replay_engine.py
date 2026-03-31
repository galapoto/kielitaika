from collections import Counter

from audit.audit_service import get_session_events, get_user_events
from audit.audit_integrity import verify_audit_integrity


def _sort_events(events: list[dict]):
    return sorted(events, key=lambda event: (event["timestamp"], event["event_id"]))


def replay_session(events: list[dict]):
    ordered_events = _sort_events(events)
    integrity = verify_audit_integrity(ordered_events)
    recommendation_sequence = []
    yki_task_flow = []
    unit_progress_flow = []
    decisions_made = []
    decision_versions = []
    policy_versions = []

    if not integrity["ok"] and integrity["integrityStatus"] == "invalid":
        return {
            "userId": ordered_events[0]["user_id"] if ordered_events else None,
            "sessionId": ordered_events[0]["session_id"] if ordered_events else None,
            "orderedEventIds": [event["event_id"] for event in ordered_events],
            "eventCounts": dict(Counter(event["event_type"] for event in ordered_events)),
            "decisionVersions": [],
            "policyVersions": [],
            "recommendationSequence": [],
            "ykiTaskFlow": [],
            "unitProgressFlow": [],
            "decisionsMade": [],
            "trusted": False,
            "integrity": integrity,
        }

    for event in ordered_events:
        decision_versions.append(event["decision_version"])
        policy_versions.append(event["policy_version"])
        decisions_made.append(
            {
                "eventId": event["event_id"],
                "eventType": event["event_type"],
                "decisionVersion": event["decision_version"],
                "policyVersion": event["policy_version"],
                "output": event["output_snapshot"],
                "constraints": event["constraint_metadata"],
            }
        )

        if event["event_type"] == "RECOMMENDATION_GENERATED":
            recommendation_sequence.append(
                {
                    "phase": "generated",
                    "rankingSeed": event["input_snapshot"].get("ranking_seed"),
                    "rankedModuleIds": event["output_snapshot"].get("ranked_module_ids", []),
                    "suggestedModuleIds": event["output_snapshot"].get("suggested_module_ids", []),
                }
            )
        elif event["event_type"] == "RECOMMENDATION_SERVED":
            recommendation_sequence.append(
                {
                    "phase": "served",
                    "servedModuleIds": event["output_snapshot"].get("served_module_ids", []),
                    "servedUnitIds": event["output_snapshot"].get("served_unit_ids", []),
                }
            )
        elif event["event_type"] == "YKI_SESSION_STARTED":
            yki_task_flow.append(
                {
                    "phase": "started",
                    "sessionId": event["session_id"],
                    "taskIds": event["output_snapshot"].get("precomputed_plan", {}).get("task_ids", []),
                    "examMode": event["output_snapshot"].get("exam_mode"),
                }
            )
        elif event["event_type"] == "YKI_TASK_PRESENTED":
            yki_task_flow.append(
                {
                    "phase": "presented",
                    "taskId": event["output_snapshot"].get("task_id"),
                    "section": event["output_snapshot"].get("section"),
                    "trigger": event["input_snapshot"].get("trigger"),
                }
            )
        elif event["event_type"] == "YKI_RESPONSE_SUBMITTED":
            yki_task_flow.append(
                {
                    "phase": "responded",
                    "taskId": event["input_snapshot"].get("task_id"),
                    "isCorrect": event["output_snapshot"].get("is_correct"),
                    "score": event["output_snapshot"].get("score"),
                }
            )
        elif event["event_type"] == "YKI_SESSION_COMPLETED":
            yki_task_flow.append(
                {
                    "phase": "completed",
                    "completedTaskIds": event["output_snapshot"].get("completed_task_ids", []),
                    "averageScore": event["output_snapshot"].get("average_score"),
                }
            )
        elif event["event_type"] in {"UNIT_ATTEMPTED", "UNIT_COMPLETED", "STAGNATION_DETECTED"}:
            unit_progress_flow.append(
                {
                    "eventType": event["event_type"],
                    "unitId": event["output_snapshot"].get("unit_id")
                    or event["input_snapshot"].get("unit_id"),
                    "masteryScore": event["output_snapshot"].get("mastery_score"),
                    "status": event["output_snapshot"].get("status"),
                }
            )

    return {
        "userId": ordered_events[0]["user_id"] if ordered_events else None,
        "sessionId": ordered_events[0]["session_id"] if ordered_events else None,
        "orderedEventIds": [event["event_id"] for event in ordered_events],
        "eventCounts": dict(Counter(event["event_type"] for event in ordered_events)),
        "decisionVersions": sorted(set(decision_versions)),
        "policyVersions": sorted(set(policy_versions)),
        "recommendationSequence": recommendation_sequence,
        "ykiTaskFlow": yki_task_flow,
        "unitProgressFlow": unit_progress_flow,
        "decisionsMade": decisions_made,
        "trusted": integrity["ok"],
        "integrity": integrity,
    }


def verify_replay_consistency(events: list[dict]):
    ordered_events = _sort_events(events)
    replay = replay_session(ordered_events)
    issues = []
    integrity = verify_audit_integrity(ordered_events)

    if not ordered_events:
        issues.append("No audit events were provided.")
        return {
            "ok": False,
            "issues": issues,
            "replay": replay,
            "integrity": integrity,
            "trusted": False,
        }

    if integrity["integrityStatus"] == "legacy_unverified":
        issues.append("Audit chain uses legacy unverified events.")
    elif not integrity["ok"]:
        issues.append(integrity["failureReason"])
        return {
            "ok": False,
            "issues": issues,
            "replay": replay,
            "integrity": integrity,
            "trusted": False,
        }

    event_ids = [event["event_id"] for event in ordered_events]
    if len(event_ids) != len(set(event_ids)):
        issues.append("Duplicate audit event ids were detected.")

    decision_versions = {event["decision_version"] for event in ordered_events}
    if len(decision_versions) > 1:
        issues.append("Decision version inconsistency detected in replay events.")

    policy_versions = {event["policy_version"] for event in ordered_events}
    if len(policy_versions) > 1:
        issues.append("Policy version inconsistency detected in replay events.")

    generated_events = [
        event for event in ordered_events if event["event_type"] == "RECOMMENDATION_GENERATED"
    ]
    served_events = [
        event for event in ordered_events if event["event_type"] == "RECOMMENDATION_SERVED"
    ]
    for generated_event, served_event in zip(generated_events, served_events, strict=False):
        generated_modules = generated_event["output_snapshot"].get("suggested_module_ids", [])
        served_modules = served_event["output_snapshot"].get("served_module_ids", [])
        if generated_modules != served_modules:
            issues.append(
                "Recommendation served order does not match the generated recommendation sequence."
            )

    yki_events = [event for event in ordered_events if event["event_type"].startswith("YKI_")]
    if yki_events:
        started_events = [event for event in yki_events if event["event_type"] == "YKI_SESSION_STARTED"]
        if not started_events:
            issues.append("YKI replay is missing a session start event.")
        else:
            planned_task_ids = started_events[0]["output_snapshot"].get("precomputed_plan", {}).get(
                "task_ids",
                [],
            )
            presented_task_ids = [
                event["output_snapshot"].get("task_id")
                for event in yki_events
                if event["event_type"] == "YKI_TASK_PRESENTED"
            ]
            response_task_ids = [
                event["input_snapshot"].get("task_id")
                for event in yki_events
                if event["event_type"] == "YKI_RESPONSE_SUBMITTED"
            ]

            if planned_task_ids and presented_task_ids[: len(planned_task_ids)] != planned_task_ids[: len(presented_task_ids)]:
                issues.append("Presented YKI task order diverged from the precomputed plan.")
            if any(task_id not in presented_task_ids for task_id in response_task_ids):
                issues.append("A YKI response was submitted for a task that was never presented.")

            completed_events = [
                event for event in yki_events if event["event_type"] == "YKI_SESSION_COMPLETED"
            ]
            if completed_events:
                completed_task_ids = completed_events[-1]["output_snapshot"].get(
                    "completed_task_ids",
                    [],
                )
                if planned_task_ids and completed_task_ids != planned_task_ids:
                    issues.append("Completed YKI task ids do not match the precomputed plan.")

    return {
        "ok": len(issues) == 0 and integrity["ok"],
        "issues": issues,
        "replay": replay,
        "integrity": integrity,
        "trusted": len(issues) == 0 and integrity["ok"],
    }


def replay_session_by_id(session_id: str):
    events = get_session_events(session_id)
    return {
        "events": events,
        "replay": replay_session(events),
        "verification": verify_replay_consistency(events),
    }


def replay_user_journey(user_id: str):
    events = get_user_events(user_id)
    session_groups: dict[str | None, list[dict]] = {}
    for event in events:
        session_groups.setdefault(event["session_id"], []).append(event)

    session_checks = []
    stream_replays = []
    issues = []
    ok = True
    legacy_event_count = 0
    for session_id, grouped_events in session_groups.items():
        relevant_events = grouped_events
        if session_id is None:
            relevant_events = [
                event
                for event in grouped_events
                if not event["event_type"].startswith("YKI_")
            ]
        verification = (
            verify_replay_consistency(relevant_events)
            if relevant_events
            else {
                "ok": True,
                "issues": [],
                "integrity": {
                    "ok": True,
                    "integrityStatus": "valid",
                    "chainLength": 0,
                    "failureIndex": None,
                    "failureEventId": None,
                    "failureReason": None,
                    "legacyEventCount": 0,
                    "streamKey": None,
                },
                "trusted": True,
            }
        )
        replay = replay_session(relevant_events) if relevant_events else {
            "userId": user_id,
            "sessionId": session_id,
            "orderedEventIds": [],
            "eventCounts": {},
            "decisionVersions": [],
            "policyVersions": [],
            "recommendationSequence": [],
            "ykiTaskFlow": [],
            "unitProgressFlow": [],
            "decisionsMade": [],
            "trusted": True,
            "integrity": verification["integrity"],
        }
        session_checks.append(
            {
                "sessionId": session_id,
                "ok": verification["ok"],
                "issues": verification["issues"],
                "integrity": verification["integrity"],
                "trusted": verification["trusted"],
            }
        )
        stream_replays.append(
            {
                "sessionId": session_id,
                "replay": replay,
            }
        )
        ok = ok and verification["ok"]
        legacy_event_count += verification["integrity"]["legacyEventCount"]
        issues.extend(
            [
                f"{session_id or 'sessionless'}: {issue}"
                for issue in verification["issues"]
            ]
        )

    aggregate_event_counts = dict(Counter(event["event_type"] for event in events))
    decision_versions = sorted({event["decision_version"] for event in events})
    policy_versions = sorted({event["policy_version"] for event in events})
    aggregate_replay = {
        "userId": user_id,
        "sessionId": None,
        "orderedEventIds": [event["event_id"] for event in _sort_events(events)],
        "eventCounts": aggregate_event_counts,
        "decisionVersions": decision_versions,
        "policyVersions": policy_versions,
        "recommendationSequence": [
            item
            for stream in stream_replays
            for item in stream["replay"]["recommendationSequence"]
        ],
        "ykiTaskFlow": [
            item
            for stream in stream_replays
            for item in stream["replay"]["ykiTaskFlow"]
        ],
        "unitProgressFlow": [
            item
            for stream in stream_replays
            for item in stream["replay"]["unitProgressFlow"]
        ],
        "decisionsMade": [
            item
            for stream in stream_replays
            for item in stream["replay"]["decisionsMade"]
        ],
        "trusted": all(stream["replay"]["trusted"] for stream in stream_replays),
        "integrity": {
            "ok": ok,
            "integrityStatus": (
                "valid"
                if ok
                else (
                    "legacy_unverified"
                    if stream_replays
                    and all(
                        stream["replay"]["integrity"]["integrityStatus"] == "legacy_unverified"
                        for stream in stream_replays
                    )
                    else "invalid"
                )
            ),
            "chainLength": len(events),
            "failureIndex": None,
            "failureEventId": None,
            "failureReason": issues[0] if issues else None,
            "legacyEventCount": legacy_event_count,
            "streamKey": f"user:{user_id}:multi-stream",
        },
        "streamReplays": stream_replays,
    }

    return {
        "events": events,
        "replay": aggregate_replay,
        "verification": {
            "ok": ok,
            "issues": issues,
            "sessionChecks": session_checks,
            "trusted": ok,
            "integrity": aggregate_replay["integrity"],
        },
    }
