import Box from "../components/primitives/Box";
import Button from "../components/primitives/Button";
import Text from "../components/primitives/Text";
import Screen from "../components/layout/Screen";
import Section from "../components/layout/Section";

type RecommendedModule = {
  id: string;
  title: string;
  suggestionReason: string | null;
  lowMasteryUnitIds: string[];
  dueReviewUnitIds: string[];
  stagnatedUnitIds: string[];
  recommendationRejectedBecause: string[];
};

type RecommendationOutcome = {
  unitId: string;
  effectivenessScore: number;
  improvementDelta: number;
  status: string;
  impactLabel: string;
};

type ImprovementTrend = {
  unitId: string;
  improvementDelta: number;
  effectivenessScore: number;
  impactLabel: string;
};

type RecommendationTrace = {
  moduleId: string;
  title: string;
  finalScore: number;
  weightedFactors: string;
  adaptiveSummary: string;
};

type StagnatedUnit = {
  unitId: string;
  title: string;
  attempts: number;
  masteryScore: number;
  stagnationReason: string | null;
  retrySuggestion: string;
  alternativeUnitTitle: string | null;
  retryCount: number;
  policyStage: string;
  switchDifficultyTo: "easy" | "medium" | "hard";
};

type Props = {
  adaptiveWeightChanges: string[];
  auditReplaySummary: string[];
  auditTimeline: string[];
  changeReference: string | null;
  contractViolations: string[];
  decisionVersion: string;
  errorMessage: string | null;
  factorContributionSummary: string[];
  governanceStatus: "governed" | "legacy_uncontrolled";
  governanceVersion: string;
  improvementTrends: ImprovementTrend[];
  loading: boolean;
  policyConstraintLogs: string[];
  policySummary: string[];
  policyVersion: string;
  recommendationRejections: string[];
  rawRecommendationOutcomes: RecommendationOutcome[];
  recommendedModules: RecommendedModule[];
  recommendationTrace: RecommendationTrace[];
  stagnatedUnits: StagnatedUnit[];
  untrustedStateMessage: string | null;
  ykiInfluenceLogs: string[];
  onBack: () => void;
  onRefresh: () => void;
};

export default function LearningScreen({
  adaptiveWeightChanges,
  auditReplaySummary,
  auditTimeline,
  changeReference,
  contractViolations,
  decisionVersion,
  errorMessage,
  factorContributionSummary,
  governanceStatus,
  governanceVersion,
  improvementTrends,
  loading,
  policyConstraintLogs,
  policySummary,
  policyVersion,
  recommendationRejections,
  rawRecommendationOutcomes,
  recommendedModules,
  recommendationTrace,
  stagnatedUnits,
  untrustedStateMessage,
  ykiInfluenceLogs,
  onBack,
  onRefresh,
}: Props) {
  if (loading) {
    return (
      <Screen>
        <Section>
          <Text variant="title">Learning</Text>
          <Text tone="secondary">Loading governed learning state...</Text>
        </Section>
      </Screen>
    );
  }

  if (errorMessage) {
    return (
      <Screen>
        <Section>
          <Text variant="title">Learning</Text>
          <Text>{errorMessage}</Text>
          <Button label="Retry" onPress={onRefresh} />
          <Button label="Back" onPress={onBack} />
        </Section>
      </Screen>
    );
  }

  return (
    <Screen>
      <Box gap="md">
        <Section>
          <Text variant="title">Learning</Text>
          <Text>Decision version: {decisionVersion}</Text>
          <Text>Policy version: {policyVersion}</Text>
          <Text>Governance version: {governanceVersion}</Text>
          <Text tone="secondary">Change reference: {changeReference ?? "none"}</Text>
          <Text tone="secondary">Governance status: {governanceStatus}</Text>
          {untrustedStateMessage ? <Text>{untrustedStateMessage}</Text> : null}
          <Button label="Refresh Learning" onPress={onRefresh} />
          <Button label="Back Home" onPress={onBack} />
        </Section>

        <Section>
          <Text variant="title">Policy Controls</Text>
          {policySummary.map((item) => (
            <Text key={item}>{item}</Text>
          ))}
          {policyConstraintLogs.length ? (
            policyConstraintLogs.map((item) => <Text key={item}>{item}</Text>)
          ) : (
            <Text tone="secondary">No policy clamps were applied to the current governed output.</Text>
          )}
        </Section>

        <Section>
          <Text variant="title">Recommended Modules</Text>
          {recommendedModules.length ? (
            recommendedModules.map((module) => (
              <Box key={module.id} gap="sm">
                <Text>{module.title}</Text>
                <Text tone="secondary">{module.suggestionReason ?? "No suggestion reason was returned."}</Text>
                <Text tone="secondary">Low mastery units: {module.lowMasteryUnitIds.join(", ") || "none"}</Text>
                <Text tone="secondary">Due review units: {module.dueReviewUnitIds.join(", ") || "none"}</Text>
                <Text tone="secondary">Stagnated units: {module.stagnatedUnitIds.join(", ") || "none"}</Text>
                {module.recommendationRejectedBecause.length ? (
                  <Text tone="secondary">
                    Rejections: {module.recommendationRejectedBecause.join(", ")}
                  </Text>
                ) : null}
              </Box>
            ))
          ) : (
            <Text tone="secondary">The backend returned no governed module recommendations.</Text>
          )}
        </Section>

        <Section>
          <Text variant="title">Stagnation State</Text>
          {stagnatedUnits.length ? (
            stagnatedUnits.map((unit) => (
              <Text key={unit.unitId}>
                {unit.title}: attempts {unit.attempts}, mastery {unit.masteryScore.toFixed(2)}, retry {unit.retryCount}, policy {unit.policyStage}, next difficulty {unit.switchDifficultyTo}, suggestion {unit.retrySuggestion}
                {unit.alternativeUnitTitle ? `, alternative ${unit.alternativeUnitTitle}` : ""}
                {unit.stagnationReason ? `, reason ${unit.stagnationReason}` : ""}
              </Text>
            ))
          ) : (
            <Text tone="secondary">No stagnated units are currently governed for escalation.</Text>
          )}
        </Section>

        <Section>
          <Text variant="title">Effectiveness</Text>
          {factorContributionSummary.length ? (
            factorContributionSummary.map((item) => <Text key={item}>{item}</Text>)
          ) : (
            <Text tone="secondary">Effectiveness data is still calibrating.</Text>
          )}
        </Section>

        <Section>
          <Text variant="title">Recommendation Trace</Text>
          {recommendationTrace.length ? (
            recommendationTrace.map((item) => (
              <Box key={item.moduleId} gap="sm">
                <Text>{item.title}</Text>
                <Text tone="secondary">Final score: {item.finalScore.toFixed(2)}</Text>
                <Text tone="secondary">{item.weightedFactors}</Text>
                <Text tone="secondary">{item.adaptiveSummary}</Text>
              </Box>
            ))
          ) : (
            <Text tone="secondary">No recommendation trace is available.</Text>
          )}
        </Section>

        <Section>
          <Text variant="title">Adaptive Weight Changes</Text>
          {adaptiveWeightChanges.length ? (
            adaptiveWeightChanges.map((item) => <Text key={item}>{item}</Text>)
          ) : (
            <Text tone="secondary">No adaptive weight adjustments were applied yet.</Text>
          )}
        </Section>

        <Section>
          <Text variant="title">Recommendation Rejections</Text>
          {recommendationRejections.length ? (
            recommendationRejections.map((item) => <Text key={item}>{item}</Text>)
          ) : (
            <Text tone="secondary">No recommendation rejections were recorded.</Text>
          )}
        </Section>

        <Section>
          <Text variant="title">Audit Timeline</Text>
          {auditReplaySummary.length ? (
            auditReplaySummary.map((item) => <Text key={item}>{item}</Text>)
          ) : null}
          {auditTimeline.length ? (
            auditTimeline.map((item) => <Text key={item}>{item}</Text>)
          ) : (
            <Text tone="secondary">No audit events have been recorded yet.</Text>
          )}
        </Section>

        <Section>
          <Text variant="title">Raw Outcomes</Text>
          {rawRecommendationOutcomes.length ? (
            rawRecommendationOutcomes.map((item) => (
              <Text key={`${item.unitId}-${item.status}`}>
                {item.unitId}: effectiveness {item.effectivenessScore.toFixed(2)}, delta {item.improvementDelta.toFixed(2)}, status {item.status}, impact {item.impactLabel}
              </Text>
            ))
          ) : (
            <Text tone="secondary">No measured outcomes yet.</Text>
          )}
        </Section>

        <Section>
          <Text variant="title">Improvement Trends</Text>
          {improvementTrends.length ? (
            improvementTrends.map((item) => (
              <Text key={`${item.unitId}-${item.impactLabel}`}>
                {item.unitId}: {item.impactLabel}, delta {item.improvementDelta.toFixed(2)}, effectiveness {item.effectivenessScore.toFixed(2)}
              </Text>
            ))
          ) : (
            <Text tone="secondary">No improvement trends available.</Text>
          )}
        </Section>

        <Section>
          <Text variant="title">YKI Influence Logs</Text>
          {ykiInfluenceLogs.length ? (
            ykiInfluenceLogs.map((item) => <Text key={item}>{item}</Text>)
          ) : (
            <Text tone="secondary">No YKI influence has been recorded yet.</Text>
          )}
        </Section>

        <Section>
          <Text variant="title">Contract Diagnostics</Text>
          {contractViolations.length ? (
            contractViolations.map((item) => <Text key={item}>{item}</Text>)
          ) : (
            <Text tone="secondary">No contract violations detected.</Text>
          )}
        </Section>
      </Box>
    </Screen>
  );
}
