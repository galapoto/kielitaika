import json
import os
from pathlib import Path

from utils.hash_utils import stable_serialize, stable_value

AUDIT_LOG_PATH = Path(
    os.getenv("KIELITAIKA_AUDIT_LOG_PATH", "/tmp/kielitaika_app_audit_log.jsonl")
)

_event_counter = 0


def _ensure_parent_directory():
    AUDIT_LOG_PATH.parent.mkdir(parents=True, exist_ok=True)


def next_event_id():
    global _event_counter
    _event_counter += 1
    return f"audit-{_event_counter:06d}"


def append_event(event: dict):
    _ensure_parent_directory()
    with AUDIT_LOG_PATH.open("a", encoding="utf-8") as handle:
        handle.write(stable_serialize(event))
        handle.write("\n")


def read_events(*, session_id: str | None = None, user_id: str | None = None):
    if not AUDIT_LOG_PATH.exists():
        return []

    events = []
    with AUDIT_LOG_PATH.open("r", encoding="utf-8") as handle:
        for raw_line in handle:
            line = raw_line.strip()
            if not line:
                continue

            event = stable_value(json.loads(line))
            if session_id is not None and event.get("session_id") != session_id:
                continue
            if user_id is not None and event.get("user_id") != user_id:
                continue
            events.append(event)

    return sorted(events, key=lambda event: (event["timestamp"], event["event_id"]))


def reset_audit_log():
    global _event_counter
    if AUDIT_LOG_PATH.exists():
        AUDIT_LOG_PATH.unlink()
    _event_counter = 0
