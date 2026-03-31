import { useState } from "react";
import { useRouter } from "expo-router";
import { ScrollView, StyleSheet, View } from "react-native";

import Button from "@ui/components/primitives/Button";
import Text from "@ui/components/primitives/Text";
import { colors, radius, spacing } from "@ui/theme/tokens";

import useLearningModules from "./hooks/useLearningModules";
import {
  getLearningDebugState,
  type LearningDebugState,
  type LearningModule,
} from "./services/learningService";

export default function LearningHome() {
  const router = useRouter();
  const { data, dueReviewUnits, loading, error } = useLearningModules();
  const [showDebugInfo, setShowDebugInfo] = useState(false);
  const [debugLoading, setDebugLoading] = useState(false);
  const [debugState, setDebugState] = useState<LearningDebugState | null>(null);
  const [debugError, setDebugError] = useState<string | null>(null);

  async function toggleDebugInfo() {
    if (showDebugInfo) {
      setShowDebugInfo(false);
      return;
    }

    setShowDebugInfo(true);
    if (debugState || debugLoading) {
      return;
    }

    setDebugLoading(true);
    setDebugError(null);
    const response = await getLearningDebugState();
    setDebugLoading(false);

    if (response.ok && response.data) {
      setDebugState(response.data);
      return;
    }

    setDebugError(response.error?.message ?? "DEBUG_STATE_FAILED");
  }

  if (loading) {
    return <Text>Loading learning content...</Text>;
  }

  if (error || !data) {
    return (
      <View style={styles.card}>
        <Text size="lg">Learning unavailable</Text>
        <Text>{error?.message ?? "LEARNING_MODULES_FAILED"}</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.root} contentContainerStyle={styles.content}>
      <View style={styles.card}>
        <Text size="lg">Learning Path</Text>
        <Text>Current level: {data.currentLevel ?? "Not available yet"}</Text>
        <Text>
          Weak patterns: {data.weakPatterns.length ? data.weakPatterns.join(", ") : "None yet"}
        </Text>
        <Button label="Recommended Practice" onPress={() => router.push("/practice")} />
        <Button label="YKI Practice Mode" onPress={() => router.push("/yki-practice")} />
        {__DEV__ ? (
          <Button
            label={showDebugInfo ? "Hide Learning Debug Info" : "Show Learning Debug Info"}
            onPress={toggleDebugInfo}
          />
        ) : null}
      </View>

      {__DEV__ && showDebugInfo ? (
        <DebugPanel debugState={debugState} loading={debugLoading} error={debugError} />
      ) : null}

      <View style={styles.section}>
        <Text size="lg">Review Now</Text>
        {dueReviewUnits.length ? (
          dueReviewUnits.map((item) => (
            <View key={item.unit.id} style={styles.card}>
              <Text size="lg">{item.unit.title}</Text>
              <Text>Urgency: {formatUrgency(item.urgency)}</Text>
              <Text>Next review: {formatReviewDate(item.progress.next_review_at)}</Text>
              <Text>Mastery: {formatMastery(item.progress.mastery_level)}</Text>
              <Button label="Review in Practice" onPress={() => router.push("/practice")} />
            </View>
          ))
        ) : (
          <View style={styles.card}>
            <Text>No units are due for reinforcement yet.</Text>
          </View>
        )}
      </View>

      <View style={styles.section}>
        <Text size="lg">Suggested Modules</Text>
        {data.suggestedModules.map((module) => (
          <ModuleCard
            key={module.id}
            module={module}
            onOpen={() =>
              router.push({
                pathname: "/learning/module/[id]",
                params: { id: module.id },
              })
            }
            onPractice={() =>
              router.push({
                pathname: "/practice",
                params: { moduleId: module.id },
              })
            }
          />
        ))}
      </View>

      <View style={styles.section}>
        <Text size="lg">All Modules</Text>
        {data.modules.map((module) => (
          <ModuleCard
            key={module.id}
            module={module}
            onOpen={() =>
              router.push({
                pathname: "/learning/module/[id]",
                params: { id: module.id },
              })
            }
            onPractice={() =>
              router.push({
                pathname: "/practice",
                params: { moduleId: module.id },
              })
            }
          />
        ))}
      </View>
    </ScrollView>
  );
}

type ModuleCardProps = {
  module: LearningModule;
  onOpen: () => void;
  onPractice: () => void;
};

function ModuleCard({ module, onOpen, onPractice }: ModuleCardProps) {
  return (
    <View style={styles.card}>
      <Text size="lg">{module.title}</Text>
      <Text>Level: {module.level}</Text>
      <Text>{module.description}</Text>
      <Text>Focus: {module.focusTags.join(", ")}</Text>
      <Text>Units: {module.unitCount}</Text>
      {module.dueReviewUnitIds?.length ? <Text>Due review units: {module.dueReviewUnitIds.length}</Text> : null}
      {module.suggestionReason ? <Text>{module.suggestionReason}</Text> : null}
      <Button label="Open Module" onPress={onOpen} />
      <Button label="Practice Module" onPress={onPractice} />
    </View>
  );
}

function formatUrgency(value: string) {
  if (value === "overdue") {
    return "Overdue";
  }
  if (value === "due_now") {
    return "Due now";
  }
  return "Scheduled";
}

function formatMastery(value: string) {
  return value.charAt(0).toUpperCase() + value.slice(1);
}

function formatReviewDate(value: string | null) {
  if (!value) {
    return "Not scheduled";
  }

  return new Date(value).toLocaleString();
}

type DebugPanelProps = {
  debugState: LearningDebugState | null;
  loading: boolean;
  error: string | null;
};

function DebugPanel({ debugState, loading, error }: DebugPanelProps) {
  if (loading) {
    return (
      <View style={styles.card}>
        <Text size="lg">Learning Debug Info</Text>
        <Text>Loading debug snapshot...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.card}>
        <Text size="lg">Learning Debug Info</Text>
        <Text>{error}</Text>
      </View>
    );
  }

  if (!debugState) {
    return null;
  }

  return (
    <View style={styles.section}>
      <View style={styles.card}>
        <Text size="lg">Learning Debug Info</Text>
        <Text>Tracked units: {debugState.unitMastery.length}</Text>
        <Text>
          Active weights: {Object.entries(debugState.weightsUsed).map(([key, value]) => `${key} ${value}`).join(", ")}
        </Text>
        <Text>
          Regression flags: {debugState.regressionFlags.length ? debugState.regressionFlags.map((item) => item.title).join(", ") : "None"}
        </Text>
        <Text>
          Due review units: {debugState.dueReviewUnits.length ? debugState.dueReviewUnits.map((item) => item.unit.title).join(", ") : "None"}
        </Text>
      </View>

      <View style={styles.section}>
        <Text size="lg">Recommendation Trace</Text>
        {debugState.recommendationReasoning.slice(0, 3).map((item) => (
          <View key={item.moduleId} style={styles.card}>
            <Text size="lg">{item.title}</Text>
            <Text>Suggested: {item.suggested ? "Yes" : "No"}</Text>
            <Text>Reason: {item.suggestionReason ?? "No suggestion reason"}</Text>
            <Text>Score: {item.suggestionScore}</Text>
            <Text>
              Breakdown: weak {item.scoreBreakdown?.weak_pattern.weighted_score ?? 0}, mastery {item.scoreBreakdown?.low_mastery.weighted_score ?? 0}, review {item.scoreBreakdown?.due_review.weighted_score ?? 0}, regression {item.scoreBreakdown?.regression.weighted_score ?? 0}, difficulty {item.scoreBreakdown?.difficulty_alignment.weighted_score ?? 0}
            </Text>
            <Text>
              Trace: weak patterns {item.whyThisWasSelected?.weak_patterns_used.join(", ") || "none"}, low mastery {item.whyThisWasSelected?.mastery_score_used.low_mastery_unit_ids.join(", ") || "none"}, due review {item.whyThisWasSelected?.due_review_used.unit_ids.join(", ") || "none"}
            </Text>
            <Text>
              Difficulty adjustment: {item.whyThisWasSelected?.difficulty_adjustment ?? "baseline"}
            </Text>
          </View>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    width: "100%",
    maxWidth: 920,
    alignSelf: "center",
  },
  content: {
    gap: spacing.md,
    paddingBottom: spacing.xl,
  },
  section: {
    gap: spacing.md,
  },
  card: {
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    gap: spacing.sm,
    padding: spacing.md,
    width: "100%",
  },
});
