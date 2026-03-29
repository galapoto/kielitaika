import { useRouter } from "expo-router";
import { ScrollView, StyleSheet, View } from "react-native";

import Button from "@ui/components/primitives/Button";
import Text from "@ui/components/primitives/Text";
import { colors, radius, spacing } from "@ui/theme/tokens";

import useLearningUnit from "./hooks/useLearningUnit";

type Props = {
  unitId: string | null;
};

export default function UnitView({ unitId }: Props) {
  const router = useRouter();
  const { data, relatedUnits, loading, error } = useLearningUnit(unitId);

  if (loading) {
    return <Text>Loading unit...</Text>;
  }

  if (error || !data) {
    return (
      <View style={styles.card}>
        <Text size="lg">Unit unavailable</Text>
        <Text>{error?.message ?? "UNIT_NOT_FOUND"}</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.root} contentContainerStyle={styles.content}>
      <View style={styles.card}>
        <Text size="lg">{data.title}</Text>
        <Text>{formatKind(data.kind)} unit</Text>
        <Text>Level: {data.level}</Text>
        <Text>{data.summary}</Text>
        <Text>{data.example}</Text>
        {Object.entries(data.details).map(([key, value]) => (
          <Text key={key}>
            {formatDetailLabel(key)}: {value}
          </Text>
        ))}
      </View>

      <View style={styles.section}>
        <Text size="lg">Related Units</Text>
        {relatedUnits.map((unit) => (
          <View key={unit.id} style={styles.card}>
            <Text size="lg">{unit.title}</Text>
            <Text>{formatKind(unit.kind)} unit</Text>
            <Text>{unit.summary}</Text>
            <Button
              label="Open Related Unit"
              onPress={() =>
                router.push({
                  pathname: "/learning/unit/[id]",
                  params: { id: unit.id },
                })
              }
            />
          </View>
        ))}
      </View>
    </ScrollView>
  );
}

function formatKind(kind: string) {
  return kind.charAt(0).toUpperCase() + kind.slice(1);
}

function formatDetailLabel(value: string) {
  return value.replace(/([A-Z])/g, " $1").replace(/^./, (match) => match.toUpperCase());
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
