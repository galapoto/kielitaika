from copy import deepcopy
from datetime import UTC, datetime

from audit.audit_integrity import compute_event_hash, get_event_stream_key
from audit.audit_models import AUDIT_EVENT_TYPES, AuditEvent, serialize_event

_audit_store: list[AuditEvent] = []
_audit_enabled = True
_event_counter = 0


def _current_timestamp():
    return datetime.now(UTC).isoformat()


def _next_event_id():
    global _event_counter
    _event_counter += 1
    return f"audit-{_event_counter:06d}"


def _coerce_event(event: AuditEvent | dict):
    if isinstance(event, AuditEvent):
        return AuditEvent(
            event_id=event.event_id or _next_event_id(),
            timestamp=event.timestamp or _current_timestamp(),
            user_id=event.user_id,
            session_id=event.session_id,
            event_type=event.event_type,
            decision_version=event.decision_version,
            policy_version=event.policy_version,
            input_snapshot=deepcopy(event.input_snapshot),
            output_snapshot=deepcopy(event.output_snapshot),
            constraint_metadata=deepcopy(event.constraint_metadata),
            previous_event_hash=event.previous_event_hash,
            event_hash=event.event_hash,
        )

    event_type = event["event_type"]
    if event_type not in AUDIT_EVENT_TYPES:
        raise ValueError(f"Unsupported audit event type: {event_type}")

    return AuditEvent(
        event_id=event.get("event_id") or _next_event_id(),
        timestamp=event.get("timestamp") or _current_timestamp(),
        user_id=event["user_id"],
        session_id=event.get("session_id"),
        event_type=event_type,
        decision_version=event["decision_version"],
        policy_version=event["policy_version"],
        input_snapshot=deepcopy(event.get("input_snapshot") or {}),
        output_snapshot=deepcopy(event.get("output_snapshot") or {}),
        constraint_metadata=deepcopy(event.get("constraint_metadata") or {}),
        previous_event_hash=event.get("previous_event_hash"),
        event_hash=event.get("event_hash"),
    )


def _sorted_events(events: list[AuditEvent]):
    return sorted(events, key=lambda event: (event.timestamp, event.event_id))


def _get_last_event_for_stream(stream_key: str):
    stream_events = [
        event for event in _audit_store if get_event_stream_key(serialize_event(event)) == stream_key
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
        decision_version=normalized_event.decision_version,
        policy_version=normalized_event.policy_version,
        input_snapshot=deepcopy(normalized_event.input_snapshot),
        output_snapshot=deepcopy(normalized_event.output_snapshot),
        constraint_metadata=deepcopy(normalized_event.constraint_metadata),
        previous_event_hash=previous_event_hash,
        event_hash=event_hash,
    )
    _audit_store.append(normalized_event)
    return serialize_event(normalized_event)


def get_session_events(session_id: str):
    return [
        serialize_event(event)
        for event in _sorted_events(
            [event for event in _audit_store if event.session_id == session_id]
        )
    ]


def get_user_events(user_id: str):
    return [
        serialize_event(event)
        for event in _sorted_events(
            [event for event in _audit_store if event.user_id == user_id]
        )
    ]


def get_all_events():
    return [serialize_event(event) for event in _sorted_events(list(_audit_store))]


def reset_audit_store():
    global _event_counter
    _audit_store.clear()
    _event_counter = 0
