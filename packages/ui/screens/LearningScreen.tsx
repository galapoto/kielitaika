import Button from "../primitives/Button";
import Card from "../primitives/Card";
import Row from "../primitives/Row";
import ScreenContainer from "../primitives/ScreenContainer";
import Stack from "../primitives/Stack";
import Text from "../primitives/Text";

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
  errorTraceReference: string | null;
  factorContributionSummary: string[];
  governanceStatus: "governed" | "legacy_uncontrolled";
  governanceVersion: string;
  improvementTrends: ImprovementTrend[];
  loading: boolean;
  offlineMessage: string | null;
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

function MetadataRow({ label, value }: { label: string; value: string }) {
  return (
    <Row justify="space-between">
      <Text variant="caption" tone="muted">
        {label}
      </Text>
      <Text variant="caption">{value}</Text>
    </Row>
  );
}

function TextList({ items, tone = "default" }: { items: string[]; tone?: "default" | "muted" }) {
  return (
    <Stack gap="xxs">
      {items.map((item) => (
        <Text key={item} tone={tone}>
          {item}
        </Text>
      ))}
    </Stack>
  );
}

export default function LearningScreen({
  adaptiveWeightChanges,
  auditReplaySummary,
  auditTimeline,
  changeReference,
  contractViolations,
  decisionVersion,
  errorMessage,
  errorTraceReference,
  factorContributionSummary,
  governanceStatus,
  governanceVersion,
  improvementTrends,
  loading,
  offlineMessage,
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
      <ScreenContainer
        actions={null}
        center
        content={null}
        header={
          <Card>
            <Stack gap="xs">
              <Text variant="title">Learning</Text>
              <Text tone="muted">Loading governed learning state...</Text>
            </Stack>
          </Card>
        }
      />
    );
  }

  if (errorMessage) {
    return (
      <ScreenContainer
        actions={
          <Stack gap="xs">
            <Button label="Retry" onPress={onRefresh} />
            <Button label="Back" onPress={onBack} tone="surface" />
          </Stack>
        }
        center
        content={
          errorTraceReference ? (
            <Card tone="surfaceMuted">
              <Text tone="muted">{errorTraceReference}</Text>
            </Card>
          ) : null
        }
        header={
          <Card>
            <Stack gap="xs">
              <Text variant="title">Learning</Text>
              <Text tone="error">{errorMessage}</Text>
            </Stack>
          </Card>
        }
      />
    );
  }

  return (
    <ScreenContainer
      actions={
        <Stack gap="xs">
          {!offlineMessage ? <Button label="Refresh Learning" onPress={onRefresh} /> : null}
          <Button label="Back Home" onPress={onBack} tone="surface" />
        </Stack>
      }
      content={
        <Stack gap="sm">
          {policySummary.length || policyConstraintLogs.length ? (
            <Card>
              <Stack gap="xs">
                <Text variant="title">Policy Controls</Text>
                {policySummary.length ? <TextList items={policySummary} /> : null}
                {policyConstraintLogs.length ? (
                  <TextList items={policyConstraintLogs} tone="muted" />
                ) : null}
              </Stack>
            </Card>
          ) : null}

          {recommendedModules.length ? (
            <Card>
              <Stack gap="xs">
                <Text variant="title">Recommended Modules</Text>
                {recommendedModules.map((module) => (
                  <Card key={module.id} tone="surfaceMuted">
                    <Stack gap="xxs">
                      <Text variant="bodyStrong">{module.title}</Text>
                      {module.suggestionReason ? (
                        <Text tone="muted">{module.suggestionReason}</Text>
                      ) : null}
                      {module.lowMasteryUnitIds.length ? (
                        <Text tone="muted">
                          Low mastery units: {module.lowMasteryUnitIds.join(", ")}
                        </Text>
                      ) : null}
                      {module.dueReviewUnitIds.length ? (
                        <Text tone="muted">
                          Due review units: {module.dueReviewUnitIds.join(", ")}
                        </Text>
                      ) : null}
                      {module.stagnatedUnitIds.length ? (
                        <Text tone="muted">
                          Stagnated units: {module.stagnatedUnitIds.join(", ")}
                        </Text>
                      ) : null}
                      {module.recommendationRejectedBecause.length ? (
                        <Text tone="muted">
                          Rejections: {module.recommendationRejectedBecause.join(", ")}
                        </Text>
                      ) : null}
                    </Stack>
                  </Card>
                ))}
              </Stack>
            </Card>
          ) : null}

          {stagnatedUnits.length ? (
            <Card>
              <Stack gap="xs">
                <Text variant="title">Stagnation State</Text>
                {stagnatedUnits.map((unit) => (
                  <Text key={unit.unitId}>
                    {unit.title}: attempts {unit.attempts}, mastery{" "}
                    {unit.masteryScore.toFixed(2)}, retry {unit.retryCount}, policy{" "}
                    {unit.policyStage}, next difficulty {unit.switchDifficultyTo}, suggestion{" "}
                    {unit.retrySuggestion}
                    {unit.alternativeUnitTitle ? `, alternative ${unit.alternativeUnitTitle}` : ""}
                    {unit.stagnationReason ? `, reason ${unit.stagnationReason}` : ""}
                  </Text>
                ))}
              </Stack>
            </Card>
          ) : null}

          {factorContributionSummary.length ? (
            <Card>
              <Stack gap="xs">
                <Text variant="title">Effectiveness</Text>
                <TextList items={factorContributionSummary} />
              </Stack>
            </Card>
          ) : null}

          {recommendationTrace.length ? (
            <Card>
              <Stack gap="xs">
                <Text variant="title">Recommendation Trace</Text>
                {recommendationTrace.map((item) => (
                  <Card key={item.moduleId} tone="surfaceMuted">
                    <Stack gap="xxs">
                      <Text variant="bodyStrong">{item.title}</Text>
                      <Text tone="muted">Final score: {item.finalScore.toFixed(2)}</Text>
                      <Text tone="muted">{item.weightedFactors}</Text>
                      <Text tone="muted">{item.adaptiveSummary}</Text>
                    </Stack>
                  </Card>
                ))}
              </Stack>
            </Card>
          ) : null}

          {adaptiveWeightChanges.length ? (
            <Card>
              <Stack gap="xs">
                <Text variant="title">Adaptive Weight Changes</Text>
                <TextList items={adaptiveWeightChanges} />
              </Stack>
            </Card>
          ) : null}

          {recommendationRejections.length ? (
            <Card>
              <Stack gap="xs">
                <Text variant="title">Recommendation Rejections</Text>
                <TextList items={recommendationRejections} />
              </Stack>
            </Card>
          ) : null}

          {auditReplaySummary.length || auditTimeline.length ? (
            <Card>
              <Stack gap="xs">
                <Text variant="title">Audit Timeline</Text>
                {auditReplaySummary.length ? <TextList items={auditReplaySummary} /> : null}
                {auditTimeline.length ? <TextList items={auditTimeline} tone="muted" /> : null}
              </Stack>
            </Card>
          ) : null}

          {rawRecommendationOutcomes.length ? (
            <Card>
              <Stack gap="xs">
                <Text variant="title">Raw Outcomes</Text>
                {rawRecommendationOutcomes.map((item) => (
                  <Text key={`${item.unitId}-${item.status}`}>
                    {item.unitId}: effectiveness {item.effectivenessScore.toFixed(2)}, delta{" "}
                    {item.improvementDelta.toFixed(2)}, status {item.status}, impact{" "}
                    {item.impactLabel}
                  </Text>
                ))}
              </Stack>
            </Card>
          ) : null}

          {improvementTrends.length ? (
            <Card>
              <Stack gap="xs">
                <Text variant="title">Improvement Trends</Text>
                {improvementTrends.map((item) => (
                  <Text key={`${item.unitId}-${item.impactLabel}`}>
                    {item.unitId}: {item.impactLabel}, delta {item.improvementDelta.toFixed(2)},
                    effectiveness {item.effectivenessScore.toFixed(2)}
                  </Text>
                ))}
              </Stack>
            </Card>
          ) : null}

          {ykiInfluenceLogs.length ? (
            <Card>
              <Stack gap="xs">
                <Text variant="title">YKI Influence Logs</Text>
                <TextList items={ykiInfluenceLogs} />
              </Stack>
            </Card>
          ) : null}

          {contractViolations.length ? (
            <Card>
              <Stack gap="xs">
                <Text variant="title">Contract Diagnostics</Text>
                <TextList items={contractViolations} tone="muted" />
              </Stack>
            </Card>
          ) : null}
        </Stack>
      }
      header={
        <Card>
          <Stack gap="xs">
            <Text variant="title">Learning</Text>
            <MetadataRow label="Decision version" value={decisionVersion} />
            <MetadataRow label="Policy version" value={policyVersion} />
            <MetadataRow label="Governance version" value={governanceVersion} />
            <MetadataRow label="Governance status" value={governanceStatus} />
            {changeReference ? (
              <MetadataRow label="Change reference" value={changeReference} />
            ) : null}
            {offlineMessage ? <Text tone="muted">{offlineMessage}</Text> : null}
            {untrustedStateMessage ? <Text tone="error">{untrustedStateMessage}</Text> : null}
          </Stack>
        </Card>
      }
    />
  );
}
