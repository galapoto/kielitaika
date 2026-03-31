import { apiClient } from "@core/api/apiClient";

type ApiError = {
  message: string;
};

type ApiResponse<T> = {
  ok: boolean;
  data: T | null;
  error: ApiError | null;
};

export type LearningUnit = {
  id: string;
  kind: string;
  level: string;
  difficultyLevel: "easy" | "medium" | "hard";
  title: string;
  summary: string;
  example: string;
  details: Record<string, string>;
  moduleIds: string[];
  relatedUnitIds: string[];
};

export type LearningUnitProgressSummary = {
  user_id: string;
  unit_id: string;
  attempts: number;
  correct_attempts: number;
  last_attempt_at: string | null;
  last_practiced_at: string | null;
  next_review_at: string | null;
  review_interval_days: number;
  streak_correct: number;
  mastery_score: number;
  mastery_level: "weak" | "improving" | "mastered";
  due_for_review: boolean;
  urgency: "scheduled" | "due_now" | "overdue";
  days_overdue: number;
  recent_mistake: boolean;
  regression_detected: boolean;
  stagnated: boolean;
  stagnation_reason: string | null;
  stagnation_detected_at: string | null;
  previous_mastery_score: number;
  yki_influence_count: number;
  signal_history: Array<{
    user_id: string;
    module_id: string;
    unit_id: string;
    signal_source: string;
    is_correct: boolean;
    task_type: string | null;
    task_section: string | null;
    difficulty_level: string | null;
    recorded_at: string;
    previous_mastery_score: number;
    updated_mastery_score: number;
    improvement_delta: number;
    effectiveness_score: number;
    stagnated: boolean;
    impact_label: string;
  }>;
  policy_version: string;
};

export type LearningModule = {
  id: string;
  title: string;
  description: string;
  level: string;
  focusTags: string[];
  unitIds: string[];
  unitCount: number;
  units: LearningUnit[];
  matchedWeaknesses?: string[];
  lowMasteryUnitIds?: string[];
  dueReviewUnitIds?: string[];
  recentMistakeUnitIds?: string[];
  regressionUnitIds?: string[];
  stagnatedUnitIds?: string[];
  suggested?: boolean;
  suggestionReason?: string | null;
  recommendationRejectedBecause?: string[];
  whyThisWasSelected?: {
    decision_version: string;
    policy_version: string;
    decision_policy_version: string;
    weak_patterns_used: string[];
    mastery_score_used: {
      module_mastery_score: number;
      low_mastery_unit_ids: string[];
    };
    due_review_used: {
      unit_ids: string[];
      count: number;
    };
    regression_flag: boolean;
    regression_unit_ids: string[];
    stagnated_unit_ids: string[];
    difficulty_adjustment: string;
    weights_used: Record<string, number>;
    base_weights: Record<string, number>;
    adaptive_weight_modifier: {
      weights: Record<string, number>;
      adjustments: Record<string, number>;
      rawAdjustments: Record<string, number>;
      averageEffectiveness: number;
      averageImprovementDelta: number;
      attemptHistoryDepth: number;
      measuredOutcomeCount: number;
      stagnatedUnitIds: string[];
      retryLogic: string | null;
      variationUnitIds: string[];
      rejectionReasons: string[];
      reasoning: string[];
      moduleOutcomeStatuses: Array<{
        unitId: string;
        status: string;
        effectivenessScore: number;
        improvementDelta: number;
      }>;
      ykiInfluenceCount: number;
      policyVersion: string;
      appliedConstraints: string[];
      clampedValues: string[];
      rejectedAdaptiveChanges: string[];
      ykiInfluenceBonus: number;
    };
    policy_constraints: string[];
    clamped_values: string[];
    rejected_adaptive_changes: string[];
  };
  scoreBreakdown?: {
    weak_pattern: {
      factor_score: number;
      weight: number;
      weighted_score: number;
    };
    low_mastery: {
      factor_score: number;
      weight: number;
      weighted_score: number;
    };
    due_review: {
      factor_score: number;
      weight: number;
      weighted_score: number;
    };
    regression: {
      factor_score: number;
      weight: number;
      weighted_score: number;
    };
    difficulty_alignment: {
      factor_score: number;
      weight: number;
      weighted_score: number;
    };
    final_score: number;
  };
};

export type DueReviewUnit = {
  unit: LearningUnit;
  progress: LearningUnitProgressSummary;
  urgency: "due_now" | "overdue";
  reviewPriorityScore: number;
};

export type LearningModulesData = {
  modules: LearningModule[];
  suggestedModules: LearningModule[];
  currentLevel: string | null;
  weakPatterns: string[];
  lowMasteryUnitIds: string[];
  dueReviewUnitIds: string[];
  stagnatedUnitIds: string[];
  weightsUsed: Record<string, number>;
  decisionVersion: string;
  policyVersion: string;
  decisionPolicyVersion: string;
};

export type LearningDebugState = {
  decisionVersion: string;
  policyVersion: string;
  decisionPolicyVersion: string;
  currentLevel: string | null;
  weakPatterns: string[];
  unitMastery: Array<{
    unit: LearningUnit;
    progress: LearningUnitProgressSummary;
  }>;
  dueReviewUnits: DueReviewUnit[];
  stagnationConfig: {
    attemptThreshold: number;
    improvementEpsilon: number;
    retryLimit: number;
    policyVersion: string;
    escalationPath: string[];
  };
  policyConfig: {
    policy_version: string;
    decision_version: string;
    decision_policy_version: string;
    rules: {
      adaptation: {
        weight_multiplier_min: number;
        weight_multiplier_max: number;
        max_weight_adjustment: number;
        yki_influence_max_bonus: number;
      };
      stagnation: {
        threshold_attempts: number;
        improvement_epsilon: number;
        retry_limit: number;
        escalation_path: string[];
      };
      yki: {
        exam_mode_locked: boolean;
        max_influence_contribution: number;
      };
    };
  };
  stagnatedUnits: Array<{
    unitId: string;
    title: string;
    attempts: number;
    masteryScore: number;
    stagnationReason: string | null;
    retrySuggestion: string;
    alternativeUnit: LearningUnit | null;
    switchDifficultyTo: "easy" | "medium" | "hard";
    retryCount: number;
    policyStage: string;
    policyVersion: string;
  }>;
  regressionFlags: Array<{
    unitId: string;
    title: string;
    previousMasteryScore: number;
    masteryScore: number;
  }>;
  recommendationReasoning: Array<{
      moduleId: string;
      title: string;
      suggested: boolean;
      suggestionReason: string | null;
      suggestionScore: number;
      scoreBreakdown: LearningModule["scoreBreakdown"];
      whyThisWasSelected: LearningModule["whyThisWasSelected"];
      recommendationRejectedBecause: string[];
    }>;
  recommendationOutcomes: Array<{
    user_id: string;
    module_id: string;
    unit_id: string;
    decision_version: string;
    policy_version: string;
    recommended_at: string;
    baseline_mastery_score: number;
    subsequent_attempts: number;
    improvement_delta: number;
    effectiveness_score: number;
    latest_mastery_score: number;
    status: string;
    factors_used: string[];
    weights_used: Record<string, number>;
    retry_count: number;
    policy_stage: string;
    policy_trace: {
      policy_version: string;
      retry_limit: number;
      retry_count: number;
      policy_stage: string;
      signal_source: string;
    };
    attempt_history: Array<{
      attempt_number: number;
      mastery_score: number;
      improvement_delta: number;
      signal_source: string;
      task_type: string | null;
      task_section: string | null;
      difficulty_level: string | null;
      recorded_at: string;
    }>;
    impact_label: string;
  }>;
  recommendationEffectiveness: {
    overallAverageEffectiveness: number;
    measuredOutcomeCount: number;
    stagnatedOutcomeCount: number;
    factorAverages: Record<
      string,
      {
        average_effectiveness: number;
        average_improvement_delta: number;
        samples: number;
        stagnated_count: number;
        impact_label: string;
      }
    >;
    improvementTrends: Array<{
      unitId: string;
      moduleId: string;
      decisionVersion: string;
      subsequentAttempts: number;
      improvementDelta: number;
      effectivenessScore: number;
      impactLabel: string;
      status: string;
    }>;
  };
  improvementTrends: Array<{
    unitId: string;
    moduleId: string;
    decisionVersion: string;
    subsequentAttempts: number;
    improvementDelta: number;
    effectivenessScore: number;
    impactLabel: string;
    status: string;
  }>;
  ykiInfluenceLogs: Array<{
    user_id: string;
    module_id: string;
    unit_id: string;
    signal_source: string;
    is_correct: boolean;
    task_type: string | null;
    task_section: string | null;
    difficulty_level: string | null;
    recorded_at: string;
    previous_mastery_score: number;
    updated_mastery_score: number;
    improvement_delta: number;
    effectiveness_score: number;
    stagnated: boolean;
    impact_label: string;
  }>;
  auditTimeline: Array<{
    event_id: string;
    timestamp: string;
    user_id: string;
    session_id: string | null;
    event_type: string;
    decision_version: string;
    policy_version: string;
    previous_event_hash: string | null;
    event_hash: string | null;
    input_snapshot: Record<string, unknown>;
    output_snapshot: Record<string, unknown>;
    constraint_metadata: Record<string, unknown>;
  }>;
  auditReplay: {
    userId: string | null;
    sessionId: string | null;
    orderedEventIds: string[];
    eventCounts: Record<string, number>;
    decisionVersions: string[];
    policyVersions: string[];
    recommendationSequence: Array<Record<string, unknown>>;
    ykiTaskFlow: Array<Record<string, unknown>>;
    unitProgressFlow: Array<Record<string, unknown>>;
    decisionsMade: Array<Record<string, unknown>>;
    trusted: boolean;
    integrity: {
      ok: boolean;
      integrityStatus: string;
      chainLength: number;
      failureIndex: number | null;
      failureEventId: string | null;
      failureReason: string | null;
      legacyEventCount: number;
      streamKey: string | null;
    };
  };
  auditVerification: {
    ok: boolean;
    issues: string[];
    trusted: boolean;
    integrity: {
      ok: boolean;
      integrityStatus: string;
      chainLength: number;
      failureIndex: number | null;
      failureEventId: string | null;
      failureReason: string | null;
      legacyEventCount: number;
      streamKey: string | null;
    };
    sessionChecks?: Array<{
      sessionId: string | null;
      ok: boolean;
      issues: string[];
      trusted: boolean;
      integrity: {
        ok: boolean;
        integrityStatus: string;
        chainLength: number;
        failureIndex: number | null;
        failureEventId: string | null;
        failureReason: string | null;
        legacyEventCount: number;
        streamKey: string | null;
      };
    }>;
  };
  weightsUsed: Record<string, number>;
};

export type RelatedUnitsData = {
  unit: LearningUnit;
  relatedUnits: LearningUnit[];
};

export type DueReviewUnitsData = {
  units: DueReviewUnit[];
};

export async function getLearningModules() {
  return (await apiClient("/api/v1/learning/modules")) as ApiResponse<LearningModulesData>;
}

export async function getLearningUnit(unitId: string) {
  return (await apiClient(`/api/v1/learning/unit/${unitId}`)) as ApiResponse<LearningUnit>;
}

export async function getRelatedUnits(unitId: string) {
  return (await apiClient(`/api/v1/learning/related/${unitId}`)) as ApiResponse<RelatedUnitsData>;
}

export async function getDueReviewUnits() {
  return (await apiClient("/api/v1/learning/review/due")) as ApiResponse<DueReviewUnitsData>;
}

export async function getLearningDebugState() {
  return (await apiClient("/api/v1/debug/user-learning-state")) as ApiResponse<LearningDebugState>;
}
