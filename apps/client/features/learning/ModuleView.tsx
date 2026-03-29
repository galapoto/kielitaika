import { useRouter } from "expo-router";
import { ScrollView, StyleSheet, View } from "react-native";

import Button from "@ui/components/primitives/Button";
import Text from "@ui/components/primitives/Text";
import { colors, radius, spacing } from "@ui/theme/tokens";

import useLearningModules from "./hooks/useLearningModules";

type Props = {
  moduleId: string | null;
};

export default function ModuleView({ moduleId }: Props) {
  const router = useRouter();
  const { data, loading, error } = useLearningModules();

  if (loading) {
    return <Text>Loading module...</Text>;
  }

  if (error || !data || !moduleId) {
    return (
      <View style={styles.card}>
        <Text size="lg">Module unavailable</Text>
        <Text>{error?.message ?? "MODULE_NOT_FOUND"}</Text>
      </View>
    );
  }

  const module = data.modules.find((item) => item.id === moduleId);

  if (!module) {
    return (
      <View style={styles.card}>
        <Text size="lg">Module unavailable</Text>
        <Text>MODULE_NOT_FOUND</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.root} contentContainerStyle={styles.content}>
      <View style={styles.card}>
        <Text size="lg">{module.title}</Text>
        <Text>Level: {module.level}</Text>
        <Text>{module.description}</Text>
        <Text>Focus: {module.focusTags.join(", ")}</Text>
        {module.matchedWeaknesses?.length ? (
          <Text>Matched weaknesses: {module.matchedWeaknesses.join(", ")}</Text>
        ) : null}
        <Button
          label="Practice Module"
          onPress={() =>
            router.push({
              pathname: "/practice",
              params: { moduleId: module.id },
            })
          }
        />
      </View>

      {module.units.map((unit) => (
        <View key={unit.id} style={styles.card}>
          <Text size="lg">{unit.title}</Text>
          <Text>{formatKind(unit.kind)} unit</Text>
          <Text>Level: {unit.level}</Text>
          <Text>{unit.summary}</Text>
          <Text>{unit.example}</Text>
          <Button
            label="Open Unit"
            onPress={() =>
              router.push({
                pathname: "/learning/unit/[id]",
                params: { id: unit.id },
              })
            }
          />
        </View>
      ))}
    </ScrollView>
  );
}

function formatKind(kind: string) {
  return kind.charAt(0).toUpperCase() + kind.slice(1);
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
  card: {
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    gap: spacing.sm,
    padding: spacing.md,
    width: "100%",
  },
});
