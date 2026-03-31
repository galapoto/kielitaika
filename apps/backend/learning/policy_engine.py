from copy import deepcopy
from hashlib import sha256

from audit.audit_service import record_event
from governance.approval_service import record_approval, reset_approval_store
from governance.change_log_service import (
    activate_change,
    ensure_governed_component,
    get_governance_debug_snapshot,
    get_active_policy_rules,
    get_last_approved_change,
    register_change,
    register_policy_candidate,
    reset_change_log_store,
)
from learning.decision_version import (
    DECISION_VERSION,
    GOVERNED_POLICY_COMPONENT,
    POLICY_VERSION,
    get_decision_metadata,
)

DEFAULT_POLICY_RULES = {
    "adaptation": {
        "weight_multiplier_min": 0.8,
        "weight_multiplier_max": 1.2,
        "max_weight_adjustment": 0.06,
        "yki_influence_max_bonus": 0.03,
    },
    "stagnation": {
        "threshold_attempts": 3,
        "improvement_epsilon": 0.05,
        "retry_limit": 2,
        "escalation_path": [
            "retry_current_unit",
            "alternative_unit",
            "switch_difficulty",
            "forced_progression",
        ],
    },
    "yki": {
        "exam_mode_locked": True,
        "max_influence_contribution": 0.12,
    },
}


def _round_score(value: float):
    return round(value, 4)


def _normalize_weights(weights: dict[str, float]):
    total = sum(max(0.0, value) for value in weights.values())
    if total <= 0:
        return {}

    return {
        key: _round_score(max(0.0, value) / total)
        for key, value in weights.items()
    }


def _get_policy_rules():
    ensure_governed_component(
        component=GOVERNED_POLICY_COMPONENT,
        decision_version=DECISION_VERSION,
        policy_version=POLICY_VERSION,
        rules=DEFAULT_POLICY_RULES,
    )
    active_rules = get_active_policy_rules(GOVERNED_POLICY_COMPONENT)
    return deepcopy(active_rules or DEFAULT_POLICY_RULES)


def _increment_version(version: str):
    parts = version.split(".")
    major, minor, patch = (parts + ["0", "0", "0"])[:3]
    return f"{major}.{minor}.{int(patch) + 1}"


def get_policy_config():
    metadata = get_decision_metadata()
    governance = get_governance_debug_snapshot(GOVERNED_POLICY_COMPONENT)
    return {
        "policy_version": metadata["policy_version"],
        "decision_version": metadata["decision_version"],
        "decision_policy_version": metadata["decision_policy_version"],
        "governance_version": metadata["governance_version"],
        "change_reference": metadata["change_reference"],
        "governance_status": metadata["governance_status"],
        "rules": _get_policy_rules(),
        "lastApprovedChange": governance["lastApprovedChange"],
    }


def propose_policy_change(actor_id: str, justification: str, updated_rules: dict):
    metadata = get_decision_metadata()
    new_version = _increment_version(metadata["policy_version"])
    change_record = register_change(
        actor_id=actor_id,
        change_type="POLICY_UPDATE",
        affected_component=GOVERNED_POLICY_COMPONENT,
        previous_version=metadata["policy_version"],
        new_version=new_version,
        justification=justification,
        metadata={"governance_version": metadata["governance_version"]},
    )
    register_policy_candidate(change_record["change_id"], updated_rules)
    return change_record


def approve_policy_change(change_id: str, approver_id: str, approved: bool = True):
    return record_approval(change_id, approver_id, approved)


def activate_policy_change(change_id: str):
    activate_change(change_id, decision_version=DECISION_VERSION)
    return get_policy_config()


def get_last_approved_policy_change():
    return get_last_approved_change(GOVERNED_POLICY_COMPONENT)


def reset_policy_governance():
    reset_approval_store()
    reset_change_log_store()
    ensure_governed_component(
        component=GOVERNED_POLICY_COMPONENT,
        decision_version=DECISION_VERSION,
        policy_version=POLICY_VERSION,
        rules=DEFAULT_POLICY_RULES,
    )


def build_deterministic_seed(*parts):
    normalized_parts = [str(part) for part in parts if part is not None]
    payload = "::".join(normalized_parts)
    return sha256(payload.encode("utf-8")).hexdigest()


def deterministic_order_key(seed: str, *parts):
    payload = build_deterministic_seed(seed, *parts)
    return payload


def clamp_yki_influence_bonus(suggested_bonus: float):
    cap = _get_policy_rules()["adaptation"]["yki_influence_max_bonus"]
    return max(0.0, min(cap, _round_score(suggested_bonus)))


def clamp_adaptive_weights(
    base_weights: dict[str, float],
    suggested_adjustments: dict[str, float],
    *,
    yki_influence_bonus: float = 0.0,
    audit_context: dict | None = None,
):
    adaptation_rules = _get_policy_rules()["adaptation"]
    metadata = get_decision_metadata()
    min_multiplier = adaptation_rules["weight_multiplier_min"]
    max_multiplier = adaptation_rules["weight_multiplier_max"]
    max_adjustment = adaptation_rules["max_weight_adjustment"]
    applied_constraints = []
    clamped_values = []
    rejected_changes = []
    constrained_weights = {}

    capped_yki_bonus = clamp_yki_influence_bonus(yki_influence_bonus)
    if capped_yki_bonus != _round_score(yki_influence_bonus):
        applied_constraints.append(
            f"YKI influence bonus clamped from {_round_score(yki_influence_bonus):.2f} to {capped_yki_bonus:.2f}."
        )

    for factor, base_weight in base_weights.items():
        suggested_adjustment = _round_score(suggested_adjustments.get(factor, 0.0))
        allowed_adjustment = max(-max_adjustment, min(max_adjustment, suggested_adjustment))
        min_allowed_weight = _round_score(base_weight * min_multiplier)
        max_allowed_weight = _round_score(base_weight * max_multiplier)
        unclamped_weight = _round_score(base_weight + allowed_adjustment)
        constrained_weight = max(min_allowed_weight, min(max_allowed_weight, unclamped_weight))

        if factor == "regression" and capped_yki_bonus > 0:
            constrained_weight = min(
                max_allowed_weight,
                _round_score(constrained_weight + capped_yki_bonus),
            )
            applied_constraints.append(
                f"YKI influence bonus applied to {factor} with cap {capped_yki_bonus:.2f}."
            )

        constrained_weights[factor] = constrained_weight

        if suggested_adjustment != allowed_adjustment:
            clamped_values.append(
                f"{factor}: adjustment {_round_score(suggested_adjustment):.2f} limited to {_round_score(allowed_adjustment):.2f}."
            )
        if unclamped_weight != constrained_weight:
            rejected_changes.append(
                f"{factor}: suggested weight {unclamped_weight:.2f} constrained to policy range {min_allowed_weight:.2f}-{max_allowed_weight:.2f}, applied {constrained_weight:.2f}."
            )

    normalized_weights = _normalize_weights(constrained_weights)
    normalized_adjustments = {
        factor: _round_score(normalized_weights.get(factor, 0.0) - base_weights.get(factor, 0.0))
        for factor in base_weights
    }

    constrained_policy = {
        "policy_version": metadata["policy_version"],
        "governance_version": metadata["governance_version"],
        "change_reference": metadata["change_reference"],
        "applied_constraints": applied_constraints,
        "clamped_values": clamped_values,
        "rejected_changes": rejected_changes,
        "weights": normalized_weights,
        "adjustments": normalized_adjustments,
        "raw_adjustments": {
            factor: _round_score(suggested_adjustments.get(factor, 0.0))
            for factor in base_weights
        },
        "yki_influence_bonus": capped_yki_bonus,
    }

    if audit_context and audit_context.get("user_id"):
        record_event(
            {
                "user_id": audit_context["user_id"],
                "session_id": audit_context.get("session_id"),
                "event_type": "POLICY_APPLIED",
                "decision_version": metadata["decision_version"],
                "policy_version": metadata["policy_version"],
                "governance_version": metadata["governance_version"],
                "change_reference": metadata["change_reference"],
                "input_snapshot": {
                    "module_id": audit_context.get("module_id"),
                    "base_weights": {
                        key: _round_score(value) for key, value in base_weights.items()
                    },
                    "suggested_adjustments": {
                        key: _round_score(value)
                        for key, value in suggested_adjustments.items()
                    },
                    "yki_influence_bonus": _round_score(yki_influence_bonus),
                },
                "output_snapshot": {
                    "module_id": audit_context.get("module_id"),
                    "weights": constrained_policy["weights"],
                    "adjustments": constrained_policy["adjustments"],
                    "yki_influence_bonus": constrained_policy["yki_influence_bonus"],
                },
                "constraint_metadata": {
                    "decision_policy_version": metadata["decision_policy_version"],
                    "governance_version": metadata["governance_version"],
                    "change_reference": metadata["change_reference"],
                    "applied_constraints": constrained_policy["applied_constraints"],
                    "clamped_values": constrained_policy["clamped_values"],
                    "rejected_changes": constrained_policy["rejected_changes"],
                },
            }
        )

    return constrained_policy


def get_stagnation_policy():
    return deepcopy(_get_policy_rules()["stagnation"])


def resolve_stagnation_stage(retry_count: int):
    escalation_path = _get_policy_rules()["stagnation"]["escalation_path"]
    if retry_count < 0:
        retry_count = 0
    if retry_count >= len(escalation_path):
        return escalation_path[-1]
    return escalation_path[retry_count]


def clamp_retry_count(retry_count: int):
    retry_limit = _get_policy_rules()["stagnation"]["retry_limit"]
    return max(0, min(retry_limit, int(retry_count)))


def is_exam_mode_locked():
    return bool(_get_policy_rules()["yki"]["exam_mode_locked"])


ensure_governed_component(
    component=GOVERNED_POLICY_COMPONENT,
    decision_version=DECISION_VERSION,
    policy_version=POLICY_VERSION,
    rules=DEFAULT_POLICY_RULES,
)
