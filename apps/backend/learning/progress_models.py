from dataclasses import dataclass


@dataclass
class UserUnitProgress:
    user_id: str
    unit_id: str
    attempts: int = 0
    correct_attempts: int = 0
    last_attempt_at: str | None = None
    mastery_score: float = 0.0


@dataclass
class UserModuleProgress:
    user_id: str
    module_id: str
    completion_percentage: float = 0.0
    mastery_score: float = 0.0
