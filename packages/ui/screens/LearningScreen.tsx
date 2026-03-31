import Box from "../components/primitives/Box";
import Button from "../components/primitives/Button";
import Text from "../components/primitives/Text";
import Screen from "../components/layout/Screen";
import Section from "../components/layout/Section";

type RecommendedUnit = {
  id: string;
  title: string;
  urgencyLabel: string;
  masteryLabel: string;
};

type RecommendationOutcome = {
  unitId: string;
  effectivenessScore: number;
  improvementDelta: number;
  status: string;
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
};

type Props = {
  completedUnitIds: string[];
  decisionVersion: string;
  errorMessage: string | null;
  factorContributionSummary: string[];
  improvementTrends: ImprovementTrend[];
  loading: boolean;
  rawRecommendationOutcomes: RecommendationOutcome[];
  recommendedUnits: RecommendedUnit[];
  recommendationTrace: RecommendationTrace[];
  selectedUnitId: string | null;
  onBack: () => void;
  onMarkComplete: () => void;
  onRefresh: () => void;
  onSelectUnit: (unitId: string) => void;
};

export default function LearningScreen({
  completedUnitIds,
  decisionVersion,
  errorMessage,
  factorContributionSummary,
  improvementTrends,
  loading,
  rawRecommendationOutcomes,
  recommendedUnits,
  recommendationTrace,
  selectedUnitId,
  onBack,
  onMarkComplete,
  onRefresh,
  onSelectUnit,
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
          <Button label="Refresh Learning" onPress={onRefresh} />
          <Button label="Back Home" onPress={onBack} />
        </Section>

        <Section>
          <Text variant="title">Recommended Units</Text>
          {recommendedUnits.length ? (
            recommendedUnits.map((unit) => (
              <Box key={unit.id} gap="sm">
                <Text>{unit.title}</Text>
                <Text tone="secondary">Urgency: {unit.urgencyLabel}</Text>
                <Text tone="secondary">Mastery: {unit.masteryLabel}</Text>
                <Button label="Select Unit" onPress={() => onSelectUnit(unit.id)} />
              </Box>
            ))
          ) : (
            <Text tone="secondary">No recommendation units are currently available.</Text>
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

        <Section>
          <Text variant="title">Effectiveness</Text>
          {factorContributionSummary.map((item) => (
            <Text key={item}>{item}</Text>
          ))}
        </Section>

        <Section>
          <Text variant="title">Recommendation Trace</Text>
          {recommendationTrace.map((item) => (
            <Box key={item.moduleId} gap="sm">
              <Text>{item.title}</Text>
              <Text tone="secondary">Final score: {item.finalScore.toFixed(2)}</Text>
              <Text tone="secondary">{item.weightedFactors}</Text>
            </Box>
          ))}
        </Section>

        <Section>
          <Text variant="title">Raw Outcomes</Text>
          {rawRecommendationOutcomes.length ? (
            rawRecommendationOutcomes.map((item) => (
              <Text key={`${item.unitId}-${item.status}`}>
                {item.unitId}: effectiveness {item.effectivenessScore.toFixed(2)}, delta {item.improvementDelta.toFixed(2)}, status {item.status}
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
      </Box>
    </Screen>
  );
}
