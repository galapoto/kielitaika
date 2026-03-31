from datetime import UTC, datetime

from governance.governance_models import ApprovalRecord, serialize_approval_record

REQUIRES_APPROVAL = {"POLICY_UPDATE", "YKI_LOGIC_CHANGE"}

_approval_store: list[ApprovalRecord] = []
_approval_counter = 0


def _timestamp():
    return datetime.now(UTC).isoformat()


def _next_approval_id():
    global _approval_counter
    _approval_counter += 1
    return f"approval-{_approval_counter:05d}"


def requires_approval(change_type: str):
    return change_type in REQUIRES_APPROVAL


def record_approval(change_id: str, approver_id: str, approved: bool = True):
    approval = ApprovalRecord(
        approval_id=_next_approval_id(),
        change_id=change_id,
        approver_id=approver_id,
        timestamp=_timestamp(),
        approved=bool(approved),
    )
    _approval_store.append(approval)
    return serialize_approval_record(approval)


def get_change_approvals(change_id: str):
    approvals = [
        serialize_approval_record(approval)
        for approval in _approval_store
        if approval.change_id == change_id
    ]
    approvals.sort(key=lambda item: (item["timestamp"], item["approval_id"]))
    return approvals


def is_change_approved(change_id: str, change_type: str):
    if not requires_approval(change_type):
        return True

    approvals = get_change_approvals(change_id)
    if not approvals:
        return False

    return approvals[-1]["approved"] is True


def reset_approval_store():
    global _approval_counter
    _approval_store.clear()
    _approval_counter = 0
