BASE_DECISION_VERSION = "1.0.0"
DECISION_VERSION = BASE_DECISION_VERSION
POLICY_VERSION = "1.0.0"
GOVERNANCE_VERSION = "legacy_uncontrolled"
GOVERNED_POLICY_COMPONENT = "learning.policy_engine"
DECISION_POLICY_VERSION = f"{DECISION_VERSION}|policy:{POLICY_VERSION}"


def get_decision_metadata():
    from governance.change_log_service import get_active_governance

    active_governance = get_active_governance(GOVERNED_POLICY_COMPONENT)
    policy_version = active_governance.get("policy_version") or POLICY_VERSION
    governance_version = active_governance.get("governance_version") or GOVERNANCE_VERSION
    change_reference = active_governance.get("change_reference")
    governance_status = active_governance.get("governance_status") or "legacy_uncontrolled"

    return {
        "decision_version": DECISION_VERSION,
        "policy_version": policy_version,
        "decision_policy_version": f"{DECISION_VERSION}|policy:{policy_version}",
        "governance_version": governance_version,
        "change_reference": change_reference,
        "governance_status": governance_status,
    }
