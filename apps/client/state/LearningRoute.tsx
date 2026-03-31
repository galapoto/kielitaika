import { useEffect, useMemo, useState } from "react";
import { useRouter } from "expo-router";

import { getApiContractViolations } from "@core/api/apiClient";
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
  const [stagnationActionMessage, setStagnationActionMessage] = useState<string | null>(null);

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
    const suggestedModules = state.modulesData?.suggestedModules ?? [];
    if (suggestedModules.length) {
      return suggestedModules.map((module) => {
        const preferredUnitId =
          module.stagnatedUnitIds?.[0] ??
          module.dueReviewUnitIds?.[0] ??
          module.lowMasteryUnitIds?.[0] ??
          module.unitIds[0];
        const preferredUnit = module.units.find((unit) => unit.id === preferredUnitId) ?? module.units[0];
        const matchingProgress = state.debugState?.unitMastery.find(
          (item) => item.unit.id === preferredUnit?.id,
        )?.progress;

        return {
          id: preferredUnit?.id ?? module.id,
          masteryLabel: matchingProgress?.mastery_level ?? "improving",
          moduleTitle: module.title,
          stagnated: Boolean(module.stagnatedUnitIds?.length),
          suggestionReason: module.suggestionReason ?? "Recommended from the adaptive learning graph.",
          title: preferredUnit?.title ?? module.title,
          urgencyLabel:
            matchingProgress?.urgency ??
            (module.stagnatedUnitIds?.length ? "stagnated" : "adaptive"),
        };
      });
    }

    if (!state.debugState) {
      return [];
    }

    return state.debugState.dueReviewUnits.map((item) => ({
      id: item.unit.id,
      masteryLabel: item.progress.mastery_level,
      moduleTitle: item.unit.moduleIds[0] ?? "review",
      stagnated: Boolean(item.progress.stagnated),
      suggestionReason: item.progress.stagnation_reason ?? "Unit is due for review.",
      title: item.unit.title,
      urgencyLabel: item.urgency,
    }));
  }, [state.debugState, state.modulesData]);

  const factorContributionSummary = useMemo(() => {
    const factorAverages = state.debugState?.recommendationEffectiveness.factorAverages;

    if (!factorAverages) {
      return [];
    }

    return Object.entries(factorAverages).map(
      ([key, value]) =>
        `${key}: avg effectiveness ${value.average_effectiveness.toFixed(2)}, avg delta ${value.average_improvement_delta.toFixed(2)} across ${value.samples} samples (${value.impact_label}, stagnated ${value.stagnated_count})`,
    );
  }, [state.debugState]);

  const policySummary = useMemo(() => {
    if (!state.debugState) {
      return [];
    }

    const adaptationRules = state.debugState.policyConfig.rules.adaptation;
    const stagnationRules = state.debugState.policyConfig.rules.stagnation;
    const ykiRules = state.debugState.policyConfig.rules.yki;

    return [
      `Policy ${state.debugState.policyVersion}: weight multipliers ${adaptationRules.weight_multiplier_min.toFixed(2)}-${adaptationRules.weight_multiplier_max.toFixed(2)}, max adjustment ${adaptationRules.max_weight_adjustment.toFixed(2)}`,
      `Stagnation threshold ${stagnationRules.threshold_attempts} attempts, retry limit ${stagnationRules.retry_limit}, path ${stagnationRules.escalation_path.join(" -> ")}`,
      `YKI exam mode locked ${ykiRules.exam_mode_locked ? "yes" : "no"}, max influence ${ykiRules.max_influence_contribution.toFixed(2)}`,
    ];
  }, [state.debugState]);

  const recommendationTrace = useMemo(() => {
    if (!state.debugState) {
      return [];
    }

    return state.debugState.recommendationReasoning.slice(0, 5).map((item) => ({
      adaptiveSummary:
        item.whyThisWasSelected?.adaptive_weight_modifier
          ? [
              `adaptive ${Object.entries(item.whyThisWasSelected.adaptive_weight_modifier.adjustments)
                .filter(([, value]) => value !== 0)
                .map(([key, value]) => `${key} ${value >= 0 ? "+" : ""}${value.toFixed(2)}`)
                .join(", ") || "no changes"}`,
              `retry ${item.whyThisWasSelected.adaptive_weight_modifier.retryLogic ?? "none"}`,
            ].join(" | ")
          : "Adaptive weighting unavailable",
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

  const adaptiveWeightChanges = useMemo(() => {
    if (!state.debugState) {
      return [];
    }

    return state.debugState.recommendationReasoning
      .flatMap((item) => {
        const adaptive = item.whyThisWasSelected?.adaptive_weight_modifier;
        if (!adaptive) {
          return [];
        }

        const changedFactors = Object.entries(adaptive.adjustments)
          .filter(([, value]) => value !== 0)
          .map(([key, value]) => `${key} ${value >= 0 ? "+" : ""}${value.toFixed(2)}`);

        if (
          !changedFactors.length &&
          !adaptive.reasoning.length &&
          !adaptive.clampedValues.length &&
          !adaptive.appliedConstraints.length
        ) {
          return [];
        }

        return [
          `${item.title}: ${changedFactors.join(", ") || "no factor delta"}${adaptive.reasoning.length ? ` | ${adaptive.reasoning.join(" ")}` : ""}${adaptive.clampedValues.length ? ` | clamped ${adaptive.clampedValues.join(" ")}` : ""}${adaptive.appliedConstraints.length ? ` | policy ${adaptive.appliedConstraints.join(" ")}` : ""}`,
        ];
      })
      .slice(0, 6);
  }, [state.debugState]);

  const recommendationRejections = useMemo(() => {
    if (!state.debugState) {
      return [];
    }

    return state.debugState.recommendationReasoning
      .filter((item) => item.recommendationRejectedBecause.length)
      .flatMap((item) =>
        item.recommendationRejectedBecause.map(
          (reason) => `${item.title}: ${reason}`,
        ),
      )
      .slice(0, 8);
  }, [state.debugState]);

  const policyConstraintLogs = useMemo(() => {
    if (!state.debugState) {
      return [];
    }

    return state.debugState.recommendationReasoning
      .flatMap((item) => {
        const adaptive = item.whyThisWasSelected?.adaptive_weight_modifier;
        if (!adaptive) {
          return [];
        }

        return [
          ...adaptive.appliedConstraints.map(
            (entry) => `${item.title}: ${entry}`,
          ),
          ...adaptive.clampedValues.map(
            (entry) => `${item.title}: ${entry}`,
          ),
        ];
      })
      .slice(0, 8);
  }, [state.debugState]);

  const selectedStagnatedUnit = useMemo(() => {
    if (!state.debugState?.stagnatedUnits.length) {
      return null;
    }

    return (
      state.debugState.stagnatedUnits.find((item) => item.unitId === selectedUnitId) ??
      state.debugState.stagnatedUnits[0]
    );
  }, [selectedUnitId, state.debugState]);

  const ykiInfluenceLogs = useMemo(() => {
    return (
      state.debugState?.ykiInfluenceLogs.slice(0, 6).map(
        (item) =>
          `${item.unit_id}: ${item.task_section ?? "task"} ${item.task_type ?? "response"} ${item.is_correct ? "improved" : "missed"} at ${item.difficulty_level ?? "medium"} difficulty (delta ${item.improvement_delta.toFixed(2)})`,
      ) ?? []
    );
  }, [state.debugState]);

  const contractViolations = useMemo(
    () =>
      getApiContractViolations().map(
        (item) => `${item.path}: ${item.details}`,
      ),
    [state.debugState, state.modulesData],
  );

  const auditTimeline = useMemo(() => {
    if (!state.debugState) {
      return [];
    }

    return state.debugState.auditTimeline.slice(-12).map((event) => {
      const outputKeys = Object.keys(event.output_snapshot).slice(0, 3).join(", ");
      return `${event.timestamp} | ${event.event_type} | decision ${event.decision_version} | policy ${event.policy_version}${outputKeys ? ` | ${outputKeys}` : ""}`;
    });
  }, [state.debugState]);

  const auditReplaySummary = useMemo(() => {
    if (!state.debugState) {
      return [];
    }

    const verification = state.debugState.auditVerification;
    const integrity = verification.integrity;
    const counts = Object.entries(state.debugState.auditReplay.eventCounts)
      .map(([key, value]) => `${key} ${value}`)
      .join(", ");

    return [
      `Integrity status: ${integrity.integrityStatus}`,
      `Replay verification: ${verification.ok ? "consistent" : "issues detected"}`,
      `Hash chain length: ${integrity.chainLength}`,
      integrity.failureEventId
        ? `Failure point: ${integrity.failureEventId} at index ${integrity.failureIndex}`
        : "Failure point: none",
      counts ? `Audit counts: ${counts}` : "Audit counts unavailable.",
      integrity.failureReason ?? "Audit chain is intact.",
      ...verification.issues.slice(0, 4),
    ];
  }, [state.debugState]);

  async function handleMarkComplete() {
    if (!selectedUnitId || completedUnitIds.includes(selectedUnitId)) {
      return;
    }

    const nextCompleted = [...completedUnitIds, selectedUnitId];
    setCompletedUnitIds(nextCompleted);
    await storageService.set(COMPLETED_UNITS_KEY, nextCompleted);
  }

  function handleUseRetrySuggestion() {
    if (!selectedStagnatedUnit) {
      return;
    }

    setSelectedUnitId(selectedStagnatedUnit.unitId);
    setStagnationActionMessage(selectedStagnatedUnit.retrySuggestion);
  }

  function handleTryAlternativeUnit() {
    if (!selectedStagnatedUnit?.alternativeUnit?.id) {
      return;
    }

    setSelectedUnitId(selectedStagnatedUnit.alternativeUnit.id);
    setStagnationActionMessage(
      `Switched focus to ${selectedStagnatedUnit.alternativeUnit.title} as an alternative support unit.`,
    );
  }

  function handleSwitchDifficulty() {
    if (!selectedStagnatedUnit) {
      return;
    }

    setStagnationActionMessage(
      `Next retry should switch ${selectedStagnatedUnit.title} to ${selectedStagnatedUnit.switchDifficultyTo} difficulty.`,
    );
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
      adaptiveWeightChanges={adaptiveWeightChanges}
      auditReplaySummary={auditReplaySummary}
      auditTimeline={auditTimeline}
      completedUnitIds={completedUnitIds}
      contractViolations={contractViolations}
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
        setStagnationActionMessage(null);
        void load();
      }}
      onSelectUnit={setSelectedUnitId}
      onSwitchDifficulty={handleSwitchDifficulty}
      onTryAlternativeUnit={handleTryAlternativeUnit}
      onUseRetrySuggestion={handleUseRetrySuggestion}
      policyConstraintLogs={policyConstraintLogs}
      policySummary={policySummary}
      policyVersion={state.debugState?.policyVersion ?? state.modulesData?.policyVersion ?? "unknown"}
      recommendationRejections={recommendationRejections}
      rawRecommendationOutcomes={state.debugState?.recommendationOutcomes.slice(0, 5).map((item) => ({
        effectivenessScore: item.effectiveness_score,
        improvementDelta: item.improvement_delta,
        impactLabel: item.impact_label,
        status: item.status,
        unitId: item.unit_id,
      })) ?? []}
      recommendedUnits={recommendedUnits}
      recommendationTrace={recommendationTrace}
      selectedUnitId={selectedUnitId}
      selectedStagnatedUnit={
        selectedStagnatedUnit
          ? {
              alternativeUnitTitle: selectedStagnatedUnit.alternativeUnit?.title ?? null,
              attempts: selectedStagnatedUnit.attempts,
              masteryScore: selectedStagnatedUnit.masteryScore,
              stagnationReason: selectedStagnatedUnit.stagnationReason,
              retrySuggestion: selectedStagnatedUnit.retrySuggestion,
              policyStage: selectedStagnatedUnit.policyStage,
              retryCount: selectedStagnatedUnit.retryCount,
              switchDifficultyTo: selectedStagnatedUnit.switchDifficultyTo,
              title: selectedStagnatedUnit.title,
              unitId: selectedStagnatedUnit.unitId,
            }
          : null
      }
      stagnationActionMessage={stagnationActionMessage}
      ykiInfluenceLogs={ykiInfluenceLogs}
    />
  );
}
