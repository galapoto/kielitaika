from dataclasses import dataclass, field


@dataclass
class RecommendationOutcome:
    user_id: str
    module_id: str
    unit_id: str
    decision_version: str
    recommended_at: str
    baseline_mastery_score: float = 0.0
    subsequent_attempts: int = 0
    improvement_delta: float = 0.0
    effectiveness_score: float = 0.0
    latest_mastery_score: float = 0.0
    status: str = "active"
    factors_used: list[str] = field(default_factory=list)
    weights_used: dict[str, float] = field(default_factory=dict)


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
    post_recommendation_performance: list[dict] | None = None


@dataclass
class UserModuleProgress:
    user_id: str
    module_id: str
    completion_percentage: float = 0.0
    mastery_score: float = 0.0
