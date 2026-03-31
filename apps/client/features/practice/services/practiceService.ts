import { apiClient } from "@core/api/apiClient";

type ApiError = {
  message: string;
};

type ApiResponse<T> = {
  ok: boolean;
  data: T | null;
  error: ApiError | null;
};

export type PracticeExercise = {
  id: string;
  type: string;
  question: string;
  correct_answer: string;
  unit_id: string;
  unit_kind: string;
  module_id: string;
  input_mode: "text" | "choice";
  options: string[];
};

export type PracticeBundle = {
  module: {
    id: string;
    title: string;
    level: string;
    focusTags: string[];
  };
  source: "module" | "recommended";
  recommendation?: {
    reason: string | null;
    weakPatterns: string[];
    currentLevel: string | null;
    matchedWeaknesses: string[];
    prioritizedUnitIds: string[];
    dueReviewUnitIds: string[];
  } | null;
  exerciseCount: number;
  exercises: PracticeExercise[];
};

export type UnitProgress = {
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

export type ModuleProgress = {
  user_id: string;
  module_id: string;
  completion_percentage: number;
  mastery_score: number;
  mastery_level: "weak" | "improving" | "mastered";
  mastered_unit_count: number;
  total_unit_count: number;
  low_mastery_unit_ids: string[];
  due_review_unit_ids: string[];
  recent_mistake_unit_ids: string[];
  unit_progress: UnitProgress[];
};

export type PracticeProgressSubmission = {
  unitProgress: UnitProgress;
  moduleProgress: ModuleProgress;
};

export async function getModulePractice(moduleId: string) {
  return (await apiClient(
    `/api/v1/learning/practice/module/${moduleId}`,
  )) as ApiResponse<PracticeBundle>;
}

export async function getRecommendedPractice() {
  return (await apiClient(
    "/api/v1/learning/practice/recommended",
  )) as ApiResponse<PracticeBundle>;
}

export async function submitPracticeResult(exercise: PracticeExercise, isCorrect: boolean) {
  return (await apiClient("/api/v1/learning/progress/submit", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      exercise,
      isCorrect,
    }),
  })) as ApiResponse<PracticeProgressSubmission>;
}

export async function getUnitProgress(unitId: string) {
  return (await apiClient(
    `/api/v1/learning/progress/unit/${unitId}`,
  )) as ApiResponse<UnitProgress>;
}

export async function getModuleProgress(moduleId: string) {
  return (await apiClient(
    `/api/v1/learning/progress/module/${moduleId}`,
  )) as ApiResponse<ModuleProgress>;
}
