from dataclasses import asdict, dataclass, field
from typing import Literal

ChangeType = Literal[
    "POLICY_UPDATE",
    "WEIGHT_LOGIC_UPDATE",
    "SCHEMA_CHANGE",
    "CONFIG_CHANGE",
    "YKI_LOGIC_CHANGE",
]


@dataclass(frozen=True)
class ChangeRecord:
    change_id: str
    timestamp: str
    actor_id: str
    change_type: ChangeType
    affected_component: str
    previous_version: str | None
    new_version: str
    justification: str
    metadata: dict = field(default_factory=dict)


@dataclass(frozen=True)
class ApprovalRecord:
    approval_id: str
    change_id: str
    approver_id: str
    timestamp: str
    approved: bool


@dataclass(frozen=True)
class GovernanceVersion:
    governance_version: str
    component: str
    decision_version: str
    policy_version: str
    change_reference: str | None
    activated_at: str
    governance_status: str
    justification: str


def serialize_change_record(record: ChangeRecord):
    return asdict(record)


def serialize_approval_record(record: ApprovalRecord):
    return asdict(record)


def serialize_governance_version(record: GovernanceVersion):
    return asdict(record)
