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
  previous_mastery_score: number;
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
  suggested?: boolean;
  suggestionReason?: string | null;
  whyThisWasSelected?: {
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
    difficulty_adjustment: string;
    weights_used: Record<string, number>;
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
  weightsUsed: Record<string, number>;
  decisionVersion: string;
};

export type LearningDebugState = {
  decisionVersion: string;
  currentLevel: string | null;
  weakPatterns: string[];
  unitMastery: Array<{
    unit: LearningUnit;
    progress: LearningUnitProgressSummary;
  }>;
  dueReviewUnits: DueReviewUnit[];
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
    }>;
  recommendationOutcomes: Array<{
    user_id: string;
    module_id: string;
    unit_id: string;
    decision_version: string;
    recommended_at: string;
    baseline_mastery_score: number;
    subsequent_attempts: number;
    improvement_delta: number;
    effectiveness_score: number;
    latest_mastery_score: number;
    status: string;
    factors_used: string[];
    weights_used: Record<string, number>;
    impact_label: string;
  }>;
  recommendationEffectiveness: {
    overallAverageEffectiveness: number;
    measuredOutcomeCount: number;
    factorAverages: Record<
      string,
      {
        average_effectiveness: number;
        samples: number;
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
  }>;
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
