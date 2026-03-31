from dataclasses import asdict, dataclass, field
from typing import Literal

AuditEventType = Literal[
    "RECOMMENDATION_GENERATED",
    "RECOMMENDATION_SERVED",
    "UNIT_ATTEMPTED",
    "UNIT_COMPLETED",
    "STAGNATION_DETECTED",
    "POLICY_APPLIED",
    "YKI_SESSION_STARTED",
    "YKI_TASK_PRESENTED",
    "YKI_RESPONSE_SUBMITTED",
    "YKI_SESSION_COMPLETED",
]

AUDIT_EVENT_TYPES: tuple[AuditEventType, ...] = (
    "RECOMMENDATION_GENERATED",
    "RECOMMENDATION_SERVED",
    "UNIT_ATTEMPTED",
    "UNIT_COMPLETED",
    "STAGNATION_DETECTED",
    "POLICY_APPLIED",
    "YKI_SESSION_STARTED",
    "YKI_TASK_PRESENTED",
    "YKI_RESPONSE_SUBMITTED",
    "YKI_SESSION_COMPLETED",
)


@dataclass(frozen=True)
class AuditEvent:
    event_id: str
    timestamp: str
    user_id: str
    session_id: str | None
    event_type: AuditEventType
    decision_version: str
    policy_version: str
    governance_version: str
    change_reference: str | None
    input_snapshot: dict = field(default_factory=dict)
    output_snapshot: dict = field(default_factory=dict)
    constraint_metadata: dict = field(default_factory=dict)
    previous_event_hash: str | None = None
    event_hash: str | None = None


def serialize_event(event: AuditEvent):
    return asdict(event)
