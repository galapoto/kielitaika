from utils.hash_utils import deterministic_hash


def compute_event_hash(event: dict, previous_hash: str | None):
    payload = {
        "event_id": event.get("event_id"),
        "timestamp": event.get("timestamp"),
        "trace_id": event.get("trace_id"),
        "user_id": event.get("user_id"),
        "session_id": event.get("session_id"),
        "event_type": event.get("event_type"),
        "request_payload_hash": event.get("request_payload_hash"),
        "response_payload_hash": event.get("response_payload_hash"),
        "contract_version": event.get("contract_version"),
        "session_hash": event.get("session_hash"),
        "task_sequence_hash": event.get("task_sequence_hash"),
        "decision_version": event.get("decision_version"),
        "policy_version": event.get("policy_version"),
        "governance_version": event.get("governance_version"),
        "change_reference": event.get("change_reference"),
        "input_snapshot": event.get("input_snapshot") or {},
        "output_snapshot": event.get("output_snapshot") or {},
        "constraint_metadata": event.get("constraint_metadata") or {},
        "previous_event_hash": previous_hash,
    }
    return deterministic_hash(payload)


def get_event_stream_key(event: dict):
    if event.get("session_id"):
        return f"session:{event['session_id']}"
    if event.get("user_id"):
        return f"user:{event['user_id']}"
    return "global:runtime"


def verify_audit_integrity(events: list[dict]):
    if not events:
        return {
            "ok": False,
            "integrityStatus": "invalid",
            "chainLength": 0,
            "failureIndex": 0,
            "failureEventId": None,
            "failureReason": "No audit events were provided.",
            "legacyEventCount": 0,
            "streamKey": None,
        }

    first_event = events[0]
    stream_key = get_event_stream_key(first_event)
    expected_previous_hash = None
    legacy_event_count = 0

    for index, event in enumerate(events):
        current_stream_key = get_event_stream_key(event)
        if current_stream_key != stream_key:
            return {
                "ok": False,
                "integrityStatus": "invalid",
                "chainLength": len(events),
                "failureIndex": index,
                "failureEventId": event.get("event_id"),
                "failureReason": "Mixed audit streams cannot be verified as a single chain.",
                "legacyEventCount": legacy_event_count,
                "streamKey": stream_key,
            }

        event_hash = event.get("event_hash")
        previous_event_hash = event.get("previous_event_hash")
        if not event_hash:
            legacy_event_count += 1
            continue

        if legacy_event_count > 0:
            return {
                "ok": False,
                "integrityStatus": "invalid",
                "chainLength": len(events),
                "failureIndex": index,
                "failureEventId": event.get("event_id"),
                "failureReason": "Verified and legacy audit events were mixed in the same chain.",
                "legacyEventCount": legacy_event_count,
                "streamKey": stream_key,
            }

        if previous_event_hash != expected_previous_hash:
            return {
                "ok": False,
                "integrityStatus": "invalid",
                "chainLength": len(events),
                "failureIndex": index,
                "failureEventId": event.get("event_id"),
                "failureReason": (
                    f"Hash chain broke at index {index}: expected previous hash "
                    f"{expected_previous_hash}, found {previous_event_hash}."
                ),
                "legacyEventCount": legacy_event_count,
                "streamKey": stream_key,
            }

        expected_hash = compute_event_hash(event, previous_event_hash)
        if event_hash != expected_hash:
            return {
                "ok": False,
                "integrityStatus": "invalid",
                "chainLength": len(events),
                "failureIndex": index,
                "failureEventId": event.get("event_id"),
                "failureReason": (
                    f"Event hash mismatch at index {index}: expected {expected_hash}, found {event_hash}."
                ),
                "legacyEventCount": legacy_event_count,
                "streamKey": stream_key,
            }

        expected_previous_hash = event_hash

    if legacy_event_count == len(events):
        return {
            "ok": False,
            "integrityStatus": "legacy_unverified",
            "chainLength": len(events),
            "failureIndex": None,
            "failureEventId": None,
            "failureReason": "Legacy audit events do not include integrity hashes.",
            "legacyEventCount": legacy_event_count,
            "streamKey": stream_key,
        }

    return {
        "ok": True,
        "integrityStatus": "valid",
        "chainLength": len(events),
        "failureIndex": None,
        "failureEventId": None,
        "failureReason": None,
        "legacyEventCount": 0,
        "streamKey": stream_key,
    }
