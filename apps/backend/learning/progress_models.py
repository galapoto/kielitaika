from dataclasses import dataclass, field
from datetime import UTC, datetime
from math import isfinite


def _now_isoformat():
    return datetime.now(UTC).isoformat()


def _clamp_score(value: float, minimum: float = 0.0, maximum: float = 1.0):
    if not isfinite(value):
        return minimum
    return max(minimum, min(maximum, round(float(value), 4)))


def _normalize_delta(value: float):
    if not isfinite(value):
        return 0.0
    return max(-1.0, min(1.0, round(float(value), 4)))


def _parse_timestamp(value: str | None):
    if not value:
        return None

    try:
        return datetime.fromisoformat(value)
    except ValueError:
        return None


def _normalize_timestamp(value: str | None):
    parsed = _parse_timestamp(value)
    if parsed is None:
        return None
    return parsed.isoformat()


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
    attempt_history: list[dict] = field(default_factory=list)

    def __post_init__(self):
        self.recommended_at = _normalize_timestamp(self.recommended_at) or _now_isoformat()
        self.baseline_mastery_score = _clamp_score(self.baseline_mastery_score)
        self.latest_mastery_score = _clamp_score(self.latest_mastery_score)
        self.improvement_delta = _normalize_delta(self.improvement_delta)
        self.effectiveness_score = _clamp_score(self.effectiveness_score)
        self.subsequent_attempts = max(0, int(self.subsequent_attempts))
        normalized_weights = {}
        for key, value in self.weights_used.items():
            try:
                normalized_weights[key] = max(0.0, round(float(value), 4))
            except (TypeError, ValueError):
                continue
        self.weights_used = normalized_weights


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
    stagnated: bool = False
    stagnation_reason: str | None = None
    stagnation_detected_at: str | None = None
    yki_influence_count: int = 0
    signal_history: list[dict] = field(default_factory=list)
    post_recommendation_performance: list[dict] | None = None

    def __post_init__(self):
        self.attempts = max(0, int(self.attempts))
        self.correct_attempts = max(0, min(int(self.correct_attempts), self.attempts))
        self.review_interval_days = max(1, int(self.review_interval_days))
        self.streak_correct = max(0, int(self.streak_correct))
        self.yki_influence_count = max(0, int(self.yki_influence_count))
        self.previous_mastery_score = _clamp_score(self.previous_mastery_score)
        self.mastery_score = _clamp_score(self.mastery_score)
        self.last_attempt_at = _normalize_timestamp(self.last_attempt_at)
        self.last_practiced_at = _normalize_timestamp(self.last_practiced_at)
        self.next_review_at = _normalize_timestamp(self.next_review_at)
        self.stagnation_detected_at = _normalize_timestamp(self.stagnation_detected_at)

        last_practiced_at = _parse_timestamp(self.last_practiced_at)
        next_review_at = _parse_timestamp(self.next_review_at)
        if (
            last_practiced_at is not None
            and next_review_at is not None
            and next_review_at < last_practiced_at
        ):
            self.next_review_at = last_practiced_at.isoformat()


@dataclass
class UserModuleProgress:
    user_id: str
    module_id: str
    completion_percentage: float = 0.0
    mastery_score: float = 0.0

    def __post_init__(self):
        self.completion_percentage = _clamp_score(self.completion_percentage, 0.0, 100.0)
        self.mastery_score = _clamp_score(self.mastery_score)
