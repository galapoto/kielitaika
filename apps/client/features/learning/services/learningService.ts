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
  suggested?: boolean;
  suggestionReason?: string | null;
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
