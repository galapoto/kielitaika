from copy import deepcopy
from datetime import UTC, datetime

from audit.audit_logger import append_event, next_event_id, read_events, reset_audit_log
from audit.audit_integrity import compute_event_hash, get_event_stream_key
from audit.audit_models import AUDIT_EVENT_TYPES, AuditEvent, serialize_event
from learning.decision_version import get_decision_metadata
from utils.hash_utils import deterministic_hash

_audit_enabled = True


def _current_timestamp():
    return datetime.now(UTC).isoformat()


def _current_contract_version():
    from api_contract import CONTRACT_VERSION

    return CONTRACT_VERSION


def _extract_runtime_hash(snapshot: dict, key: str):
    value = snapshot.get(key)
    if isinstance(value, str):
        return value

    data = snapshot.get("data")
    if isinstance(data, dict):
        nested_value = data.get(key)
        if isinstance(nested_value, str):
            return nested_value

    return None


def _coerce_event(event: AuditEvent | dict):
    runtime_metadata = get_decision_metadata()

    if isinstance(event, AuditEvent):
        return AuditEvent(
            event_id=event.event_id or next_event_id(),
            timestamp=event.timestamp or _current_timestamp(),
            user_id=event.user_id,
            session_id=event.session_id,
            event_type=event.event_type,
            trace_id=event.trace_id,
            request_payload_hash=event.request_payload_hash,
            response_payload_hash=event.response_payload_hash,
            contract_version=event.contract_version,
            session_hash=event.session_hash,
            task_sequence_hash=event.task_sequence_hash,
            decision_version=event.decision_version or runtime_metadata["decision_version"],
            policy_version=event.policy_version or runtime_metadata["policy_version"],
            governance_version=event.governance_version or runtime_metadata["governance_version"],
            change_reference=event.change_reference or runtime_metadata["change_reference"],
            input_snapshot=deepcopy(event.input_snapshot),
            output_snapshot=deepcopy(event.output_snapshot),
            constraint_metadata=deepcopy(event.constraint_metadata),
            previous_event_hash=event.previous_event_hash,
            event_hash=event.event_hash,
        )

    event_type = event["event_type"]
    if not isinstance(event_type, str) or not event_type.strip():
        raise ValueError(f"Unsupported audit event type: {event_type}")

    input_snapshot = deepcopy(event.get("input_snapshot") or {})
    output_snapshot = deepcopy(event.get("output_snapshot") or {})

    return AuditEvent(
        event_id=event.get("event_id") or next_event_id(),
        timestamp=event.get("timestamp") or _current_timestamp(),
        user_id=event.get("user_id"),
        session_id=event.get("session_id"),
        event_type=event_type,
        trace_id=event.get("trace_id"),
        request_payload_hash=event.get("request_payload_hash") or deterministic_hash(input_snapshot),
        response_payload_hash=event.get("response_payload_hash")
        or deterministic_hash(output_snapshot),
        contract_version=event.get("contract_version") or _current_contract_version(),
        session_hash=event.get("session_hash") or _extract_runtime_hash(output_snapshot, "session_hash"),
        task_sequence_hash=event.get("task_sequence_hash")
        or _extract_runtime_hash(output_snapshot, "task_sequence_hash"),
        decision_version=event.get("decision_version") or runtime_metadata["decision_version"],
        policy_version=event.get("policy_version") or runtime_metadata["policy_version"],
        governance_version=event.get("governance_version") or runtime_metadata["governance_version"],
        change_reference=event.get("change_reference") or runtime_metadata["change_reference"],
        input_snapshot=input_snapshot,
        output_snapshot=output_snapshot,
        constraint_metadata=deepcopy(event.get("constraint_metadata") or {}),
        previous_event_hash=event.get("previous_event_hash"),
        event_hash=event.get("event_hash"),
    )


def _sorted_events(events: list[AuditEvent]):
    return sorted(events, key=lambda event: (event.timestamp, event.event_id))


def _get_last_event_for_stream(stream_key: str):
    stream_events = [
        event
        for event in (AuditEvent(**item) for item in read_events())
        if get_event_stream_key(serialize_event(event)) == stream_key
    ]
    if not stream_events:
        return None
    return _sorted_events(stream_events)[-1]


def set_audit_enabled(enabled: bool):
    global _audit_enabled
    _audit_enabled = bool(enabled)


def is_audit_enabled():
    return _audit_enabled


def record_event(event: AuditEvent | dict):
    if not _audit_enabled:
        return None

    normalized_event = _coerce_event(event)
    serialized_event = serialize_event(normalized_event)
    stream_key = get_event_stream_key(serialized_event)
    last_event = _get_last_event_for_stream(stream_key)
    previous_event_hash = last_event.event_hash if last_event else None
    event_hash = compute_event_hash(serialized_event, previous_event_hash)
    normalized_event = AuditEvent(
        event_id=normalized_event.event_id,
        timestamp=normalized_event.timestamp,
        user_id=normalized_event.user_id,
        session_id=normalized_event.session_id,
        event_type=normalized_event.event_type,
        trace_id=normalized_event.trace_id,
        request_payload_hash=normalized_event.request_payload_hash,
        response_payload_hash=normalized_event.response_payload_hash,
        contract_version=normalized_event.contract_version,
        session_hash=normalized_event.session_hash,
        task_sequence_hash=normalized_event.task_sequence_hash,
        decision_version=normalized_event.decision_version,
        policy_version=normalized_event.policy_version,
        governance_version=normalized_event.governance_version,
        change_reference=normalized_event.change_reference,
        input_snapshot=deepcopy(normalized_event.input_snapshot),
        output_snapshot=deepcopy(normalized_event.output_snapshot),
        constraint_metadata=deepcopy(normalized_event.constraint_metadata),
        previous_event_hash=previous_event_hash,
        event_hash=event_hash,
    )
    serialized = serialize_event(normalized_event)
    append_event(serialized)
    return serialized


def get_session_events(session_id: str):
    return read_events(session_id=session_id)


def get_user_events(user_id: str):
    return read_events(user_id=user_id)


def get_all_events():
    return read_events()


def reset_audit_store():
    reset_audit_log()
