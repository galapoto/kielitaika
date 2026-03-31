from dataclasses import asdict, dataclass, field

AuditEventType = str

AUDIT_EVENT_TYPES: tuple[AuditEventType, ...] = (
    "LEARNING_MODULES_LOADED",
    "LEARNING_UNIT_LOADED",
    "LEARNING_PROGRESS_SUBMITTED",
    "RECOMMENDATION_GENERATED",
    "RECOMMENDATION_SERVED",
    "UNIT_ATTEMPTED",
    "UNIT_COMPLETED",
    "STAGNATION_DETECTED",
    "POLICY_APPLIED",
    "YKI_SESSION_STARTED",
    "YKI_SESSION_RESUMED",
    "YKI_TASK_PRESENTED",
    "YKI_TASK_ADVANCED",
    "YKI_RESPONSE_SUBMITTED",
    "YKI_SESSION_COMPLETED",
)


@dataclass(frozen=True)
class AuditEvent:
    event_id: str
    timestamp: str
    user_id: str | None
    session_id: str | None
    event_type: AuditEventType
    trace_id: str | None
    request_payload_hash: str
    response_payload_hash: str
    contract_version: str
    session_hash: str | None
    task_sequence_hash: str | None
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
