import { Pressable, ScrollView, StyleSheet, TextInput, View } from "react-native";

import Button from "@ui/components/primitives/Button";
import Text from "@ui/components/primitives/Text";
import { colors, radius, spacing } from "@ui/theme/tokens";

import usePractice from "./hooks/usePractice";

type Props = {
  moduleId: string | null;
};

export default function PracticeView({ moduleId }: Props) {
  const {
    data,
    loading,
    error,
    currentIndex,
    currentExercise,
    answer,
    submitted,
    feedback,
    moduleProgress,
    unitProgress,
    setAnswer,
    submitAnswer,
    nextExercise,
    restartPractice,
    reloadPractice,
  } = usePractice(moduleId);

  if (loading) {
    return <Text>Loading practice...</Text>;
  }

  if (error || !data) {
    return (
      <View style={styles.card}>
        <Text size="lg">Practice unavailable</Text>
        <Text>{error?.message ?? "PRACTICE_NOT_AVAILABLE"}</Text>
        <Button label="Retry" onPress={reloadPractice} />
      </View>
    );
  }

  if (!currentExercise) {
    return (
      <View style={styles.card}>
        <Text size="lg">Practice complete</Text>
        <Text>{data.module.title}</Text>
        <Text>You completed {data.exerciseCount} exercises.</Text>
        <Button label="Restart Practice" onPress={restartPractice} />
      </View>
    );
  }

  return (
    <ScrollView style={styles.root} contentContainerStyle={styles.content}>
      <View style={styles.card}>
        <Text size="lg">{data.module.title}</Text>
        <Text>Level: {data.module.level}</Text>
        <Text>Focus: {data.module.focusTags.join(", ")}</Text>
        <Text>
          Exercise {currentIndex + 1} / {data.exerciseCount}
        </Text>
      </View>

      {data.recommendation ? (
        <View style={styles.card}>
          <Text size="lg">Recommended Practice</Text>
          {data.recommendation.reason ? <Text>{data.recommendation.reason}</Text> : null}
          <Text>
            Weak patterns:{" "}
            {data.recommendation.weakPatterns.length
              ? data.recommendation.weakPatterns.join(", ")
              : "None"}
          </Text>
          <Text>Current level: {data.recommendation.currentLevel ?? "Not available yet"}</Text>
          <Text>
            Prioritized units:{" "}
            {data.recommendation.prioritizedUnitIds.length
              ? data.recommendation.prioritizedUnitIds.length
              : "None"}
          </Text>
        </View>
      ) : null}

      {moduleProgress ? (
        <View style={styles.card}>
          <Text size="lg">Module Progress</Text>
          <Text>
            Completion: {formatPercentage(moduleProgress.completion_percentage)} ({moduleProgress.mastered_unit_count}/
            {moduleProgress.total_unit_count} units mastered)
          </Text>
          <View style={styles.progressTrack}>
            <View
              style={[
                styles.progressFill,
                { width: `${Math.max(0, Math.min(moduleProgress.completion_percentage, 100))}%` },
              ]}
            />
          </View>
          <Text>Module mastery: {formatMasteryLevel(moduleProgress.mastery_level)}</Text>
          <View style={styles.masteryList}>
            {moduleProgress.unit_progress.map((progress) => (
              <View key={progress.unit_id} style={styles.masteryPill}>
                <Text>
                  {progress.unit_id}: {formatMasteryLevel(progress.mastery_level)}
                </Text>
              </View>
            ))}
          </View>
        </View>
      ) : null}

      <View style={styles.card}>
        <Text size="lg">{formatExerciseType(currentExercise.type)}</Text>
        <Text>{currentExercise.question}</Text>
        <Text>Unit type: {currentExercise.unit_kind}</Text>
        {unitProgress ? (
          <View style={styles.unitProgressCard}>
            <Text>Unit mastery: {formatMasteryLevel(unitProgress.mastery_level)}</Text>
            <Text>
              Attempts: {unitProgress.attempts} | Correct: {unitProgress.correct_attempts}
            </Text>
          </View>
        ) : null}
        {currentExercise.input_mode === "choice" ? (
          <ChoiceOptions
            options={currentExercise.options}
            selectedAnswer={answer}
            submitted={submitted}
            setAnswer={setAnswer}
          />
        ) : (
          <TextInput
            value={answer}
            onChangeText={setAnswer}
            editable={!submitted}
            style={styles.input}
            placeholder="Type your answer"
            placeholderTextColor={colors.muted}
          />
        )}
        {!submitted ? (
          <Button label="Submit Answer" onPress={submitAnswer} />
        ) : (
          <View style={styles.feedbackCard}>
            <Text size="lg">{feedback?.isCorrect ? "Correct" : "Incorrect"}</Text>
            <Text>Your answer: {feedback?.submittedAnswer || "No answer"}</Text>
            <Text>Correct answer: {currentExercise.correct_answer}</Text>
            <Button
              label={currentIndex + 1 === data.exerciseCount ? "Finish Practice" : "Next Question"}
              onPress={nextExercise}
            />
          </View>
        )}
      </View>
    </ScrollView>
  );
}

type ChoiceOptionsProps = {
  options: string[];
  selectedAnswer: string;
  submitted: boolean;
  setAnswer: (value: string) => void;
};

function ChoiceOptions({
  options,
  selectedAnswer,
  submitted,
  setAnswer,
}: ChoiceOptionsProps) {
  return (
    <View style={styles.choiceList}>
      {options.map((option) => {
        const isSelected = selectedAnswer === option;
        return (
          <Pressable
            key={option}
            onPress={() => {
              if (!submitted) {
                setAnswer(option);
              }
            }}
            style={[styles.choiceOption, isSelected ? styles.choiceOptionSelected : null]}
          >
            <Text>{option}</Text>
          </Pressable>
        );
      })}
    </View>
  );
}

function formatExerciseType(value: string) {
  return value
    .split("_")
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}

function formatMasteryLevel(value: string) {
  return value.charAt(0).toUpperCase() + value.slice(1);
}

function formatPercentage(value: number) {
  return `${value.toFixed(0)}%`;
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
  input: {
    borderColor: colors.primary,
    borderRadius: radius.md,
    borderWidth: 1,
    color: colors.text,
    padding: spacing.md,
    width: "100%",
  },
  choiceList: {
    gap: spacing.sm,
  },
  choiceOption: {
    backgroundColor: colors.background,
    borderColor: colors.primary,
    borderRadius: radius.md,
    borderWidth: 1,
    padding: spacing.md,
  },
  choiceOptionSelected: {
    backgroundColor: colors.primary,
  },
  progressTrack: {
    backgroundColor: colors.background,
    borderRadius: radius.md,
    height: 12,
    overflow: "hidden",
    width: "100%",
  },
  progressFill: {
    backgroundColor: colors.primary,
    height: "100%",
  },
  masteryList: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing.sm,
  },
  masteryPill: {
    backgroundColor: colors.background,
    borderRadius: radius.md,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
  },
  unitProgressCard: {
    backgroundColor: colors.background,
    borderRadius: radius.md,
    gap: spacing.xs,
    padding: spacing.sm,
  },
  feedbackCard: {
    backgroundColor: colors.background,
    borderRadius: radius.md,
    gap: spacing.sm,
    padding: spacing.md,
  },
});
