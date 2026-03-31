import json
from datetime import UTC, datetime
from hashlib import sha256

BACKEND_VERSION = "2026-04-01.backend-lock.v1"
CONTRACT_VERSION = "2026-04-01.contract-lock.v1"
contract_audit_log: list[dict] = []


def current_timestamp():
    return datetime.now(UTC).isoformat()


def stable_value(value):
    if isinstance(value, dict):
        return {key: stable_value(value[key]) for key in sorted(value)}

    if isinstance(value, list):
        return [stable_value(item) for item in value]

    return value


def payload_hash(value):
    serialized = json.dumps(stable_value(value), separators=(",", ":"), sort_keys=True)
    return sha256(serialized.encode("utf-8")).hexdigest()


def meta():
    return {
        "version": BACKEND_VERSION,
        "contract_version": CONTRACT_VERSION,
        "timestamp": current_timestamp(),
    }


def record_contract_action(action_type: str, session_id: str | None, request_payload, response_payload):
    contract_audit_log.append(
        {
            "timestamp": current_timestamp(),
            "action_type": action_type,
            "session_id": session_id,
            "request_payload_hash": payload_hash(request_payload),
            "response_payload_hash": payload_hash(response_payload),
        }
    )

    if len(contract_audit_log) > 50:
        del contract_audit_log[: len(contract_audit_log) - 50]


def success(data):
    return {
        "ok": True,
        "data": stable_value(data),
        "error": None,
        "meta": meta(),
    }


def failure(code, message=None, retryable=False):
    return {
        "ok": False,
        "data": None,
        "error": {
            "code": code,
            "message": message or code,
            "retryable": retryable,
        },
        "meta": meta(),
    }
