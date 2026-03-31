from copy import deepcopy
from datetime import UTC, datetime

from governance.approval_service import is_change_approved, record_approval, requires_approval
from governance.governance_models import (
    ChangeRecord,
    GovernanceVersion,
    serialize_change_record,
    serialize_governance_version,
)

_change_log_store: list[ChangeRecord] = []
_governance_history_store: list[GovernanceVersion] = []
_active_governance_by_component: dict[str, GovernanceVersion] = {}
_pending_policy_rules: dict[str, dict] = {}
_active_policy_rules: dict[str, dict] = {}
_change_counter = 0
_governance_counter = 0


def _timestamp():
    return datetime.now(UTC).isoformat()


def _next_change_id():
    global _change_counter
    _change_counter += 1
    return f"change-{_change_counter:05d}"


def _next_governance_version():
    global _governance_counter
    _governance_counter += 1
    return f"gov-{_governance_counter:05d}"


def _get_change_record(change_id: str):
    return next((record for record in _change_log_store if record.change_id == change_id), None)


def _serialize_history(records: list[GovernanceVersion]):
    return [serialize_governance_version(record) for record in records]


def register_change(
    *,
    actor_id: str,
    change_type: str,
    affected_component: str,
    previous_version: str | None,
    new_version: str,
    justification: str,
    metadata: dict | None = None,
):
    if not justification or not justification.strip():
        raise ValueError("CHANGE_JUSTIFICATION_REQUIRED")

    record = ChangeRecord(
        change_id=_next_change_id(),
        timestamp=_timestamp(),
        actor_id=actor_id,
        change_type=change_type,
        affected_component=affected_component,
        previous_version=previous_version,
        new_version=new_version,
        justification=justification.strip(),
        metadata=deepcopy(metadata or {}),
    )
    _change_log_store.append(record)
    return serialize_change_record(record)


def register_policy_candidate(change_id: str, rules: dict):
    _pending_policy_rules[change_id] = deepcopy(rules)


def activate_change(change_id: str, *, decision_version: str):
    change_record = _get_change_record(change_id)
    if change_record is None:
        raise ValueError("CHANGE_NOT_FOUND")

    if requires_approval(change_record.change_type) and not is_change_approved(
        change_id,
        change_record.change_type,
    ):
        raise ValueError("CHANGE_NOT_APPROVED")

    if change_record.change_type == "POLICY_UPDATE":
        if change_id not in _pending_policy_rules:
            raise ValueError("POLICY_CANDIDATE_NOT_REGISTERED")
        _active_policy_rules[change_record.affected_component] = deepcopy(
            _pending_policy_rules[change_id]
        )

    governance_version = GovernanceVersion(
        governance_version=_next_governance_version(),
        component=change_record.affected_component,
        decision_version=decision_version,
        policy_version=change_record.new_version,
        change_reference=change_record.change_id,
        activated_at=_timestamp(),
        governance_status="approved_controlled",
        justification=change_record.justification,
    )
    _governance_history_store.append(governance_version)
    _active_governance_by_component[change_record.affected_component] = governance_version
    return serialize_governance_version(governance_version)


def ensure_governed_component(
    *,
    component: str,
    decision_version: str,
    policy_version: str,
    rules: dict,
    actor_id: str = "system",
    justification: str = "Governance bootstrap for approved runtime policy.",
):
    if component in _active_governance_by_component:
        return serialize_governance_version(_active_governance_by_component[component])

    bootstrap_change = register_change(
        actor_id=actor_id,
        change_type="POLICY_UPDATE",
        affected_component=component,
        previous_version=None,
        new_version=policy_version,
        justification=justification,
        metadata={"bootstrap": True},
    )
    register_policy_candidate(bootstrap_change["change_id"], rules)
    record_approval(bootstrap_change["change_id"], "system-governance", True)
    return activate_change(bootstrap_change["change_id"], decision_version=decision_version)


def get_active_governance(component: str):
    governance = _active_governance_by_component.get(component)
    if governance is None:
        return {
            "governance_version": "legacy_uncontrolled",
            "component": component,
            "decision_version": None,
            "policy_version": None,
            "change_reference": None,
            "activated_at": None,
            "governance_status": "legacy_uncontrolled",
            "justification": "No governed version has been activated for this component.",
        }
    return serialize_governance_version(governance)


def get_active_policy_rules(component: str):
    rules = _active_policy_rules.get(component)
    return deepcopy(rules) if rules is not None else None


def get_change_log(component: str | None = None):
    records = [
        serialize_change_record(record)
        for record in _change_log_store
        if component is None or record.affected_component == component
    ]
    records.sort(key=lambda item: (item["timestamp"], item["change_id"]))
    return records


def get_last_approved_change(component: str | None = None):
    relevant_history = [
        record
        for record in _governance_history_store
        if component is None or record.component == component
    ]
    if not relevant_history:
        return None
    latest = sorted(
        relevant_history,
        key=lambda item: (item.activated_at, item.governance_version),
    )[-1]
    if latest.change_reference is None:
        return None
    change_record = _get_change_record(latest.change_reference)
    return serialize_change_record(change_record) if change_record else None


def get_governance_debug_snapshot(component: str):
    active = get_active_governance(component)
    return {
        "activeVersion": active,
        "lastApprovedChange": get_last_approved_change(component),
        "recentChanges": get_change_log(component)[-5:],
        "governanceHistory": _serialize_history(
            [record for record in _governance_history_store if record.component == component]
        )[-5:],
    }


def reset_change_log_store():
    global _change_counter, _governance_counter
    _change_log_store.clear()
    _governance_history_store.clear()
    _active_governance_by_component.clear()
    _pending_policy_rules.clear()
    _active_policy_rules.clear()
    _change_counter = 0
    _governance_counter = 0
