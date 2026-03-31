import { useRouter } from "expo-router";
import { ScrollView, StyleSheet, View } from "react-native";

import Button from "@ui/components/primitives/Button";
import Text from "@ui/components/primitives/Text";
import { colors, radius, spacing } from "@ui/theme/tokens";

import useLearningModules from "./hooks/useLearningModules";
import type { LearningModule } from "./services/learningService";

export default function LearningHome() {
  const router = useRouter();
  const { data, dueReviewUnits, loading, error } = useLearningModules();

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
      </View>

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
