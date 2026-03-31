from audit.audit_integrity import verify_audit_integrity
from audit.audit_service import get_session_events
from yki_practice.certification_service import compute_final_result_hash, get_certification_record


def _latest_runtime_hash(events: list[dict], key: str):
    values = [event.get(key) for event in events if event.get(key)]
    return values[-1] if values else None


def _audit_event_range(events: list[dict]):
    if not events:
        return None

    ordered = sorted(events, key=lambda event: (event["timestamp"], event["event_id"]))
    return {
        "event_count": len(ordered),
        "first_event_id": ordered[0]["event_id"],
        "last_event_id": ordered[-1]["event_id"],
    }


def verify_certification(session_id: str):
    stored_record = get_certification_record(session_id)
    if not stored_record:
        return {
            "ok": False,
            "status": "CERTIFICATION_NOT_FOUND",
            "issues": ["No certification record exists for this session."],
        }

    certification_record = stored_record["certification_record"]
    events = get_session_events(session_id)
    integrity = verify_audit_integrity(events)
    issues = []

    if not integrity["ok"]:
        issues.append(integrity["failureReason"] or "Audit integrity is invalid.")

    recomputed_session_hash = _latest_runtime_hash(events, "session_hash")
    recomputed_task_sequence_hash = _latest_runtime_hash(events, "task_sequence_hash")
    recomputed_audit_event_range = _audit_event_range(events)

    if recomputed_session_hash != certification_record["session_hash"]:
        issues.append("CERTIFICATION_INVALID: session_hash mismatch.")

    if recomputed_task_sequence_hash != certification_record["task_sequence_hash"]:
        issues.append("CERTIFICATION_INVALID: task_sequence_hash mismatch.")

    if recomputed_audit_event_range != certification_record["audit_event_range"]:
        issues.append("CERTIFICATION_INVALID: audit_event_range mismatch.")

    if not issues:
        recomputed_final_result_hash = compute_final_result_hash(
            certification_record["session_hash"],
            certification_record["task_sequence_hash"],
            certification_record["audit_event_range"],
            certification_record["contract_version"],
        )
        if recomputed_final_result_hash != stored_record["final_result_hash"]:
            issues.append("CERTIFICATION_INVALID: final_result_hash mismatch.")
    else:
        recomputed_final_result_hash = None

    return {
        "ok": len(issues) == 0,
        "status": "valid" if len(issues) == 0 else "CERTIFICATION_INVALID",
        "issues": issues,
        "integrity": integrity,
        "recomputed": {
            "session_hash": recomputed_session_hash,
            "task_sequence_hash": recomputed_task_sequence_hash,
            "audit_event_range": recomputed_audit_event_range,
            "final_result_hash": recomputed_final_result_hash,
        },
    }
