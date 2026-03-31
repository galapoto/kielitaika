import { useEffect, useMemo, useState } from "react";
import { useRouter } from "expo-router";

import { getApiContractViolations } from "@core/api/apiClient";
import Card from "@ui/primitives/Card";
import ScreenContainer from "@ui/primitives/ScreenContainer";
import Stack from "@ui/primitives/Stack";
import Text from "@ui/primitives/Text";
import LearningScreen from "@ui/screens/LearningScreen";
import {
  getLearningDebugState,
  getLearningModules,
  type LearningDebugState,
  type LearningModulesData,
} from "../features/learning/services/learningService";
import { useAuthStore } from "./authStore";

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

    if (modulesResponse.ok && modulesResponse.data && debugResponse.ok && debugResponse.data) {
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
        "CONTRACT_VIOLATION",
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

  const untrustedStateMessage = useMemo(() => {
    if (state.modulesData?.governanceStatus === "legacy_uncontrolled") {
      return "UNTRUSTED_STATE: learning modules are legacy and not governed.";
    }

    if (state.debugState?.governanceStatus === "legacy_uncontrolled") {
      return "UNTRUSTED_STATE: learning diagnostics are legacy and not governed.";
    }

    return null;
  }, [state.debugState, state.modulesData]);

  const recommendedModules = useMemo(
    () =>
      (state.modulesData?.suggestedModules ?? []).map((module) => ({
        id: module.id,
        title: module.title,
        suggestionReason: module.suggestionReason ?? null,
        lowMasteryUnitIds: module.lowMasteryUnitIds ?? [],
        dueReviewUnitIds: module.dueReviewUnitIds ?? [],
        stagnatedUnitIds: module.stagnatedUnitIds ?? [],
        recommendationRejectedBecause: module.recommendationRejectedBecause ?? [],
      })),
    [state.modulesData],
  );

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
    const lastApprovedChange = state.debugState.policyConfig.lastApprovedChange;

    return [
      `Policy ${state.debugState.policyVersion}: weight multipliers ${adaptationRules.weight_multiplier_min.toFixed(2)}-${adaptationRules.weight_multiplier_max.toFixed(2)}, max adjustment ${adaptationRules.max_weight_adjustment.toFixed(2)}`,
      `Governance ${state.debugState.governanceVersion}: ${state.debugState.governanceStatus}`,
      lastApprovedChange
        ? `Last approved change ${lastApprovedChange.change_id}: ${lastApprovedChange.change_type} to ${lastApprovedChange.new_version} because ${lastApprovedChange.justification}`
        : "Last approved change: none",
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
        item.recommendationRejectedBecause.map((reason) => `${item.title}: ${reason}`),
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
          ...adaptive.appliedConstraints.map((entry) => `${item.title}: ${entry}`),
          ...adaptive.clampedValues.map((entry) => `${item.title}: ${entry}`),
        ];
      })
      .slice(0, 8);
  }, [state.debugState]);

  const ykiInfluenceLogs = useMemo(
    () =>
      state.debugState?.ykiInfluenceLogs.slice(0, 6).map(
        (item) =>
          `${item.unit_id}: ${item.task_section ?? "task"} ${item.task_type ?? "response"} ${item.is_correct ? "improved" : "missed"} at ${item.difficulty_level ?? "medium"} difficulty (delta ${item.improvement_delta.toFixed(2)})`,
      ) ?? [],
    [state.debugState],
  );

  const contractViolations = useMemo(
    () => getApiContractViolations().map((item) => `${item.code} ${item.path}: ${item.details}`),
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

  if (!hasHydrated || !user) {
    return (
      <ScreenContainer center>
        <Stack gap="sm">
          <Card>
            <Stack gap="xs">
              <Text variant="title">Learning</Text>
              <Text tone="muted">Preparing your learning workspace...</Text>
            </Stack>
          </Card>
        </Stack>
      </ScreenContainer>
    );
  }

  if (!state.loading && !state.errorMessage && (!state.modulesData || !state.debugState)) {
    return (
      <ScreenContainer center>
        <Stack gap="sm">
          <Card>
            <Stack gap="xs">
              <Text variant="title">Learning</Text>
              <Text tone="error">CONTRACT_VIOLATION</Text>
            </Stack>
          </Card>
        </Stack>
      </ScreenContainer>
    );
  }

  const modulesData = state.modulesData;
  const debugState = state.debugState;

  return (
    <LearningScreen
      adaptiveWeightChanges={adaptiveWeightChanges}
      auditReplaySummary={auditReplaySummary}
      auditTimeline={auditTimeline}
      changeReference={debugState?.changeReference ?? modulesData?.changeReference ?? null}
      contractViolations={contractViolations}
      decisionVersion={debugState?.decisionVersion ?? modulesData?.decisionVersion ?? ""}
      errorMessage={state.errorMessage}
      factorContributionSummary={factorContributionSummary}
      governanceStatus={debugState?.governanceStatus ?? modulesData?.governanceStatus ?? "governed"}
      governanceVersion={debugState?.governanceVersion ?? modulesData?.governanceVersion ?? ""}
      improvementTrends={
        state.debugState?.improvementTrends.slice(0, 5).map((item) => ({
          effectivenessScore: item.effectivenessScore,
          impactLabel: item.impactLabel,
          improvementDelta: item.improvementDelta,
          unitId: item.unitId,
        })) ?? []
      }
      loading={state.loading}
      onBack={() => router.push("/")}
      onRefresh={() => {
        void load();
      }}
      policyConstraintLogs={policyConstraintLogs}
      policySummary={policySummary}
      policyVersion={debugState?.policyVersion ?? modulesData?.policyVersion ?? ""}
      rawRecommendationOutcomes={
        state.debugState?.recommendationOutcomes.slice(0, 5).map((item) => ({
          effectivenessScore: item.effectiveness_score,
          improvementDelta: item.improvement_delta,
          impactLabel: item.impact_label,
          status: item.status,
          unitId: item.unit_id,
        })) ?? []
      }
      recommendedModules={recommendedModules}
      recommendationRejections={recommendationRejections}
      recommendationTrace={recommendationTrace}
      stagnatedUnits={
        state.debugState?.stagnatedUnits.map((item) => ({
          alternativeUnitTitle: item.alternativeUnit?.title ?? null,
          attempts: item.attempts,
          masteryScore: item.masteryScore,
          policyStage: item.policyStage,
          retryCount: item.retryCount,
          retrySuggestion: item.retrySuggestion,
          stagnationReason: item.stagnationReason,
          switchDifficultyTo: item.switchDifficultyTo,
          title: item.title,
          unitId: item.unitId,
        })) ?? []
      }
      untrustedStateMessage={untrustedStateMessage}
      ykiInfluenceLogs={ykiInfluenceLogs}
    />
  );
}
