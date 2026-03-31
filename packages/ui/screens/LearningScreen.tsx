import Box from "../components/primitives/Box";
import Button from "../components/primitives/Button";
import Text from "../components/primitives/Text";
import Screen from "../components/layout/Screen";
import Section from "../components/layout/Section";

type RecommendedUnit = {
  id: string;
  moduleTitle: string;
  title: string;
  urgencyLabel: string;
  masteryLabel: string;
  suggestionReason: string;
  stagnated: boolean;
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
  completedUnitIds: string[];
  contractViolations: string[];
  decisionVersion: string;
  errorMessage: string | null;
  factorContributionSummary: string[];
  improvementTrends: ImprovementTrend[];
  loading: boolean;
  policyConstraintLogs: string[];
  policySummary: string[];
  policyVersion: string;
  recommendationRejections: string[];
  rawRecommendationOutcomes: RecommendationOutcome[];
  recommendedUnits: RecommendedUnit[];
  recommendationTrace: RecommendationTrace[];
  selectedUnitId: string | null;
  selectedStagnatedUnit: StagnatedUnit | null;
  stagnationActionMessage: string | null;
  ykiInfluenceLogs: string[];
  onBack: () => void;
  onMarkComplete: () => void;
  onRefresh: () => void;
  onSelectUnit: (unitId: string) => void;
  onSwitchDifficulty: () => void;
  onTryAlternativeUnit: () => void;
  onUseRetrySuggestion: () => void;
};

export default function LearningScreen({
  adaptiveWeightChanges,
  completedUnitIds,
  contractViolations,
  decisionVersion,
  errorMessage,
  factorContributionSummary,
  improvementTrends,
  loading,
  policyConstraintLogs,
  policySummary,
  policyVersion,
  recommendationRejections,
  rawRecommendationOutcomes,
  recommendedUnits,
  recommendationTrace,
  selectedUnitId,
  selectedStagnatedUnit,
  stagnationActionMessage,
  ykiInfluenceLogs,
  onBack,
  onMarkComplete,
  onRefresh,
  onSelectUnit,
  onSwitchDifficulty,
  onTryAlternativeUnit,
  onUseRetrySuggestion,
}: Props) {
  if (loading) {
    return (
      <Screen>
        <Section>
          <Text variant="title">Learning</Text>
          <Text tone="secondary">Loading recommendations...</Text>
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
            <Text tone="secondary">No policy clamps were needed for the current recommendations.</Text>
          )}
        </Section>

        <Section>
          <Text variant="title">Recommended Units</Text>
          {recommendedUnits.length ? (
            recommendedUnits.map((unit) => (
              <Box key={unit.id} gap="sm">
                <Text>{unit.title}</Text>
                <Text tone="secondary">Module: {unit.moduleTitle}</Text>
                <Text tone="secondary">Urgency: {unit.urgencyLabel}</Text>
                <Text tone="secondary">Mastery: {unit.masteryLabel}</Text>
                <Text tone="secondary">{unit.suggestionReason}</Text>
                {unit.stagnated ? (
                  <Text tone="secondary">Adaptive status: stagnated, retry variation suggested.</Text>
                ) : null}
                <Button label="Select Unit" onPress={() => onSelectUnit(unit.id)} />
              </Box>
            ))
          ) : (
            <Text tone="secondary">
              No recommendation units are currently available. Refresh to rebuild recommendations or review your debug signals below.
            </Text>
          )}
          {selectedUnitId ? (
            <Box gap="sm">
              <Text>Selected unit: {selectedUnitId}</Text>
              <Button label="Mark Completion" onPress={onMarkComplete} />
            </Box>
          ) : null}
          {completedUnitIds.length ? (
            <Text tone="secondary">Simulated completions: {completedUnitIds.join(", ")}</Text>
          ) : null}
        </Section>

        {selectedStagnatedUnit ? (
          <Section>
            <Text variant="title">Stagnation Response</Text>
            <Text>{selectedStagnatedUnit.title}</Text>
            <Text tone="secondary">
              Attempts: {selectedStagnatedUnit.attempts}, mastery {selectedStagnatedUnit.masteryScore.toFixed(2)}
            </Text>
            <Text tone="secondary">
              Policy stage: {selectedStagnatedUnit.policyStage}, retry count {selectedStagnatedUnit.retryCount}
            </Text>
            <Text tone="secondary">
              {selectedStagnatedUnit.stagnationReason ?? selectedStagnatedUnit.retrySuggestion}
            </Text>
            <Button label="Use Retry Suggestion" onPress={onUseRetrySuggestion} />
            <Button
              label={
                selectedStagnatedUnit.alternativeUnitTitle
                  ? `Try ${selectedStagnatedUnit.alternativeUnitTitle}`
                  : "Try Alternative Unit"
              }
              onPress={onTryAlternativeUnit}
              disabled={!selectedStagnatedUnit.alternativeUnitTitle}
            />
            <Button
              label={`Switch To ${selectedStagnatedUnit.switchDifficultyTo}`}
              onPress={onSwitchDifficulty}
            />
            {stagnationActionMessage ? (
              <Text tone="secondary">{stagnationActionMessage}</Text>
            ) : null}
          </Section>
        ) : null}

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
          {recommendationTrace.map((item) => (
            <Box key={item.moduleId} gap="sm">
              <Text>{item.title}</Text>
              <Text tone="secondary">Final score: {item.finalScore.toFixed(2)}</Text>
              <Text tone="secondary">{item.weightedFactors}</Text>
              <Text tone="secondary">{item.adaptiveSummary}</Text>
            </Box>
          ))}
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
