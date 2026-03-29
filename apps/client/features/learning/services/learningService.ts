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
  suggested?: boolean;
  suggestionReason?: string | null;
};

export type LearningModulesData = {
  modules: LearningModule[];
  suggestedModules: LearningModule[];
  currentLevel: string | null;
  weakPatterns: string[];
};

export type RelatedUnitsData = {
  unit: LearningUnit;
  relatedUnits: LearningUnit[];
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
