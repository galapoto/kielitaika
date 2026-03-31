import { useEffect, useMemo, useState } from "react";
import { useRouter } from "expo-router";

import Screen from "@ui/components/layout/Screen";
import Section from "@ui/components/layout/Section";
import Text from "@ui/components/primitives/Text";
import LearningScreen from "@ui/screens/LearningScreen";
import { storageService } from "@core/services/storageService";
import {
  getLearningDebugState,
  getLearningModules,
  type LearningDebugState,
  type LearningModulesData,
} from "../features/learning/services/learningService";
import { useAuthStore } from "./authStore";

const COMPLETED_UNITS_KEY = "learning_completed_units";

type LearningRuntimeState = {
  debugState: LearningDebugState | null;
  errorMessage: string | null;
  loading: boolean;
  modulesData: LearningModulesData | null;
};

export default function LearningRoute() {
  const router = useRouter();
  const hasHydrated = useAuthStore((state) => state.hasHydrated);
  const user = useAuthStore((state) => state.user);
  const [state, setState] = useState<LearningRuntimeState>({
    debugState: null,
    errorMessage: null,
    loading: true,
    modulesData: null,
  });
  const [selectedUnitId, setSelectedUnitId] = useState<string | null>(null);
  const [completedUnitIds, setCompletedUnitIds] = useState<string[]>([]);

  useEffect(() => {
    void storageService.get(COMPLETED_UNITS_KEY).then((value) => {
      if (Array.isArray(value)) {
        setCompletedUnitIds(value.filter((item): item is string => typeof item === "string"));
      }
    });
  }, []);

  async function load() {
    setState((current) => ({
      ...current,
      errorMessage: null,
      loading: true,
    }));

    const [modulesResponse, debugResponse] = await Promise.all([
      getLearningModules(),
      getLearningDebugState(),
    ]);

    if (
      modulesResponse.ok &&
      modulesResponse.data &&
      debugResponse.ok &&
      debugResponse.data
    ) {
      setState({
        debugState: debugResponse.data,
        errorMessage: null,
        loading: false,
        modulesData: modulesResponse.data,
      });
      return;
    }

    setState({
      debugState: null,
      errorMessage:
        modulesResponse.error?.message ??
        debugResponse.error?.message ??
        "LEARNING_RUNTIME_FAILED",
      loading: false,
      modulesData: null,
    });
  }

  useEffect(() => {
    if (!hasHydrated) {
      return;
    }

    if (!user) {
      router.replace("/auth");
    }
  }, [hasHydrated, router, user]);

  useEffect(() => {
    if (!user) {
      setState({
        debugState: null,
        errorMessage: null,
        loading: false,
        modulesData: null,
      });
      return;
    }

    void load();
  }, [user]);

  const recommendedUnits = useMemo(() => {
    if (!state.debugState) {
      return [];
    }

    return state.debugState.dueReviewUnits.map((item) => ({
      id: item.unit.id,
      masteryLabel: item.progress.mastery_level,
      title: item.unit.title,
      urgencyLabel: item.urgency,
    }));
  }, [state.debugState]);

  const factorContributionSummary = useMemo(() => {
    const factorAverages = state.debugState?.recommendationEffectiveness.factorAverages;

    if (!factorAverages) {
      return [];
    }

    return Object.entries(factorAverages).map(
      ([key, value]) =>
        `${key}: avg ${value.average_effectiveness.toFixed(2)} across ${value.samples} samples (${value.impact_label})`,
    );
  }, [state.debugState]);

  const recommendationTrace = useMemo(() => {
    if (!state.debugState) {
      return [];
    }

    return state.debugState.recommendationReasoning.slice(0, 5).map((item) => ({
      finalScore: item.scoreBreakdown?.final_score ?? 0,
      moduleId: item.moduleId,
      title: item.title,
      weightedFactors: item.scoreBreakdown
        ? [
            `weak ${item.scoreBreakdown.weak_pattern.weighted_score.toFixed(2)}`,
            `mastery ${item.scoreBreakdown.low_mastery.weighted_score.toFixed(2)}`,
            `review ${item.scoreBreakdown.due_review.weighted_score.toFixed(2)}`,
            `regression ${item.scoreBreakdown.regression.weighted_score.toFixed(2)}`,
            `difficulty ${item.scoreBreakdown.difficulty_alignment.weighted_score.toFixed(2)}`,
          ].join(", ")
        : "No breakdown available",
    }));
  }, [state.debugState]);

  async function handleMarkComplete() {
    if (!selectedUnitId || completedUnitIds.includes(selectedUnitId)) {
      return;
    }

    const nextCompleted = [...completedUnitIds, selectedUnitId];
    setCompletedUnitIds(nextCompleted);
    await storageService.set(COMPLETED_UNITS_KEY, nextCompleted);
  }

  if (!hasHydrated || !user) {
    return (
      <Screen>
        <Section>
          <Text variant="title">Learning</Text>
          <Text tone="secondary">Preparing your learning workspace...</Text>
        </Section>
      </Screen>
    );
  }

  return (
    <LearningScreen
      completedUnitIds={completedUnitIds}
      decisionVersion={state.debugState?.decisionVersion ?? state.modulesData?.decisionVersion ?? "unknown"}
      errorMessage={state.errorMessage}
      factorContributionSummary={factorContributionSummary}
      improvementTrends={state.debugState?.improvementTrends.slice(0, 5).map((item) => ({
        effectivenessScore: item.effectivenessScore,
        impactLabel: item.impactLabel,
        improvementDelta: item.improvementDelta,
        unitId: item.unitId,
      })) ?? []}
      loading={state.loading}
      onBack={() => router.push("/")}
      onMarkComplete={() => {
        void handleMarkComplete();
      }}
      onRefresh={() => {
        void load();
      }}
      onSelectUnit={setSelectedUnitId}
      rawRecommendationOutcomes={state.debugState?.recommendationOutcomes.slice(0, 5).map((item) => ({
        effectivenessScore: item.effectiveness_score,
        improvementDelta: item.improvement_delta,
        status: item.status,
        unitId: item.unit_id,
      })) ?? []}
      recommendedUnits={recommendedUnits}
      recommendationTrace={recommendationTrace}
      selectedUnitId={selectedUnitId}
    />
  );
}
