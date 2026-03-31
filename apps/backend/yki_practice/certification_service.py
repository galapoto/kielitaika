import json
import os
from datetime import UTC, datetime
from pathlib import Path

from api_contract import CONTRACT_VERSION
from audit.audit_integrity import verify_audit_integrity
from audit.audit_service import get_session_events
from utils.hash_utils import deterministic_hash, stable_value

CERTIFICATION_VERSION = "2026-04-01.certification.v1"
CERTIFICATION_LOG_PATH = Path(
    os.getenv("KIELITAIKA_CERTIFICATION_LOG_PATH", "/tmp/kielitaika_yki_certifications.jsonl")
)

_certification_store: dict[str, dict] = {}


def _current_timestamp():
    return datetime.now(UTC).isoformat()


def _ensure_parent_directory():
    CERTIFICATION_LOG_PATH.parent.mkdir(parents=True, exist_ok=True)


def _append_record(record: dict):
    _ensure_parent_directory()
    with CERTIFICATION_LOG_PATH.open("a", encoding="utf-8") as handle:
        handle.write(json.dumps(stable_value(record), separators=(",", ":"), sort_keys=True))
        handle.write("\n")


def _audit_event_range(events: list[dict]):
    if not events:
        return None

    ordered = sorted(events, key=lambda event: (event["timestamp"], event["event_id"]))
    return {
        "event_count": len(ordered),
        "first_event_id": ordered[0]["event_id"],
        "last_event_id": ordered[-1]["event_id"],
    }


def compute_final_result_hash(
    session_hash: str,
    task_sequence_hash: str,
    audit_event_range: dict,
    contract_version: str,
):
    return deterministic_hash(
        f"{session_hash}|{task_sequence_hash}|"
        f"{audit_event_range['first_event_id']}:{audit_event_range['last_event_id']}:{audit_event_range['event_count']}|"
        f"{contract_version}"
    )


def get_certification_record(session_id: str):
    if session_id in _certification_store:
        return stable_value(_certification_store[session_id])

    if not CERTIFICATION_LOG_PATH.exists():
        return None

    with CERTIFICATION_LOG_PATH.open("r", encoding="utf-8") as handle:
        for raw_line in handle:
            line = raw_line.strip()
            if not line:
                continue
            record = stable_value(json.loads(line))
            _certification_store[record["certification_record"]["session_id"]] = record

    if session_id not in _certification_store:
        return None

    return stable_value(_certification_store[session_id])


def create_certification_record(
    *,
    session_id: str,
    user_id: str | None,
    final_score: float,
    session_hash: str,
    task_sequence_hash: str,
):
    existing = get_certification_record(session_id)
    if existing:
        return existing

    events = get_session_events(session_id)
    integrity = verify_audit_integrity(events)
    event_range = _audit_event_range(events)

    if not events or not event_range:
        raise ValueError("CERTIFICATION_REQUIRES_AUDIT_EVENTS")

    if not integrity["ok"]:
        raise ValueError("CERTIFICATION_REQUIRES_VALID_AUDIT_CHAIN")

    completed_events = [
        event for event in events if event["event_type"] == "YKI_SESSION_COMPLETED"
    ]
    if not completed_events:
        raise ValueError("CERTIFICATION_REQUIRES_COMPLETED_SESSION")

    completion_timestamp = completed_events[-1]["timestamp"]
    certification_record = {
        "session_id": session_id,
        "user_id": user_id,
        "completion_timestamp": completion_timestamp,
        "final_score": round(final_score, 2),
        "session_hash": session_hash,
        "task_sequence_hash": task_sequence_hash,
        "audit_event_range": event_range,
        "contract_version": CONTRACT_VERSION,
        "certification_version": CERTIFICATION_VERSION,
    }
    final_result_hash = compute_final_result_hash(
        session_hash,
        task_sequence_hash,
        event_range,
        CONTRACT_VERSION,
    )
    stored_record = {
        "certification_record": certification_record,
        "final_result_hash": final_result_hash,
        "stored_at": _current_timestamp(),
    }
    _certification_store[session_id] = stored_record
    _append_record(stored_record)
    return stable_value(stored_record)


def export_certification(session_id: str):
    stored_record = get_certification_record(session_id)
    if not stored_record:
        return None

    certification_record = stored_record["certification_record"]
    replay_reference = {
        "session_id": session_id,
        "audit_event_range": certification_record["audit_event_range"],
        "contract_version": certification_record["contract_version"],
    }
    return {
        "certification_record": certification_record,
        "final_result_hash": stored_record["final_result_hash"],
        "replay_reference": replay_reference,
        "verification_instructions": [
            "Load the append-only audit events for the certification session_id.",
            "Recompute the latest session_hash and task_sequence_hash from the sealed audit chain.",
            "Recompute audit_event_range from the first and last session audit event ids.",
            "Recompute final_result_hash from the stored contract_version and compare it to the sealed export.",
        ],
    }


def reset_certification_store():
    _certification_store.clear()
    if CERTIFICATION_LOG_PATH.exists():
        CERTIFICATION_LOG_PATH.unlink()
