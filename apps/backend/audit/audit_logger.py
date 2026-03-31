from audit.storage_adapter import (
    next_counter_value,
    read_audit_events,
    reset_storage,
)


def next_event_id(connection=None):
    return f"audit-{next_counter_value('audit_event', connection):06d}"


def append_event(event: dict, connection=None):
    from audit.storage_adapter import insert_audit_event

    insert_audit_event(event, connection)


def read_events(*, session_id: str | None = None, user_id: str | None = None, connection=None):
    return read_audit_events(session_id=session_id, user_id=user_id, connection=connection)


def reset_audit_log():
    reset_storage()
