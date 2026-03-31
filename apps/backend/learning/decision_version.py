BASE_DECISION_VERSION = "1.0.0"
DECISION_VERSION = BASE_DECISION_VERSION
POLICY_VERSION = "1.0.0"
DECISION_POLICY_VERSION = f"{DECISION_VERSION}|policy:{POLICY_VERSION}"


def get_decision_metadata():
    return {
        "decision_version": DECISION_VERSION,
        "policy_version": POLICY_VERSION,
        "decision_policy_version": DECISION_POLICY_VERSION,
    }
