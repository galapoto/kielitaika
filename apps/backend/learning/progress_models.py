from dataclasses import dataclass


@dataclass
class UserUnitProgress:
    user_id: str
    unit_id: str
    attempts: int = 0
    correct_attempts: int = 0
    recent_results: list[bool] | None = None
    last_attempt_at: str | None = None
    last_practiced_at: str | None = None
    next_review_at: str | None = None
    review_interval_days: int = 1
    streak_correct: int = 0
    previous_mastery_score: float = 0.0
    regression_detected: bool = False
    mastery_score: float = 0.0


@dataclass
class UserModuleProgress:
    user_id: str
    module_id: str
    completion_percentage: float = 0.0
    mastery_score: float = 0.0
