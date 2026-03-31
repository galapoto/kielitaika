from dataclasses import dataclass, field


@dataclass
class PracticeSession:
    session_id: str
    user_id: str
    level: str
    focus_areas: list[str]
    tasks: list[dict]
    current_task_index: int = 0
    results: list[dict] = field(default_factory=list)
