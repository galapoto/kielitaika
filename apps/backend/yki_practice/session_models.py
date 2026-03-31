from dataclasses import dataclass, field


@dataclass
class PracticeSession:
    session_id: str
    user_id: str
    level: str
    focus_areas: list[str]
    tasks: list[dict]
    exam_mode: bool = True
    policy_version: str = "1.0.0"
    decision_version: str = "1.0.0"
    precomputed_plan: dict | None = None
    current_task_index: int = 0
    results: list[dict] = field(default_factory=list)
    session_summary: dict | None = None
    session_trace: dict | None = None
