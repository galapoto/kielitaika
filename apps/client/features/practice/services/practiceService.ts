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
  } | null;
  exerciseCount: number;
  exercises: PracticeExercise[];
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
