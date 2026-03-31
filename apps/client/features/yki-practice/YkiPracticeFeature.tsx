import { useRouter } from "expo-router";
import { ScrollView, StyleSheet, TextInput, View } from "react-native";
import { useEffect, useState } from "react";

import Button from "@ui/components/primitives/Button";
import Text from "@ui/components/primitives/Text";
import { colors, radius, spacing } from "@ui/theme/tokens";

import useYkiPractice from "./hooks/useYkiPractice";

export default function YkiPracticeFeature() {
  const router = useRouter();
  const {
    data,
    loading,
    error,
    notice,
    latestResult,
    startSession,
    refreshSession,
    submitAnswer,
    advanceTask,
    retryTask,
    retrySection,
  } = useYkiPractice();
  const [answer, setAnswer] = useState("");

  useEffect(() => {
    setAnswer("");
  }, [data?.currentTask?.id]);

  if (loading) {
    return <Text>Loading YKI practice...</Text>;
  }

  if (error) {
    return (
      <View style={styles.card}>
        <Text size="lg">Practice unavailable</Text>
        <Text>{error.message}</Text>
        <Button label="Retry" onPress={refreshSession} />
      </View>
    );
  }

  if (!data) {
    return (
      <View style={styles.card}>
        <Text size="lg">No active YKI practice session</Text>
        <Text>This mode stays separate from the certification exam.</Text>
        <Button label="Start Practice Session" onPress={startSession} />
        <Button label="Open Learning" onPress={() => router.push("/learning")} />
      </View>
    );
  }

  const currentTask = data.currentTask;
  const currentTaskReviewed = Boolean(currentTask?.evaluation);

  return (
    <ScrollView style={styles.root} contentContainerStyle={styles.content}>
      <View style={styles.card}>
        <Text size="lg">YKI Practice Mode</Text>
        <Text>Session: {data.session_id}</Text>
        <Text>Practice level: {data.level}</Text>
        <Text>Focus areas: {data.focus_areas.join(", ")}</Text>
        <Text>
          Progress: {data.completedTaskCount} / {data.tasks.length}
        </Text>
        <Button label="Open Official YKI" onPress={() => router.push("/yki")} />
      </View>

      {notice ? (
        <View style={styles.card}>
          <Text>{notice}</Text>
        </View>
      ) : null}

      {currentTask ? (
        <View style={styles.card}>
          <Text size="lg">{currentTask.title}</Text>
          <Text>Section: {formatSection(currentTask.section)}</Text>
          <Text>Time limit: {currentTask.timeLimitSeconds} sec</Text>
          <Text>{currentTask.prompt}</Text>
          {currentTask.ttsPrompt ? (
            <View style={styles.subCard}>
              <Text>TTS prompt</Text>
              <Text>{currentTask.ttsPrompt}</Text>
            </View>
          ) : null}
          {currentTask.question ? <Text>{currentTask.question}</Text> : null}
          {currentTask.guidance ? (
            <View style={styles.subCard}>
              <Text>Guidance</Text>
              <Text>{currentTask.guidance}</Text>
            </View>
          ) : null}
          {currentTask.options?.length ? (
            <View style={styles.optionList}>
              {currentTask.options.map((option) => (
                <Button
                  key={option}
                  label={option}
                  onPress={() => setAnswer(option)}
                />
              ))}
            </View>
          ) : null}
          <TextInput
            value={answer}
            onChangeText={setAnswer}
            editable={!currentTaskReviewed}
            placeholder="Write your answer"
            placeholderTextColor={colors.muted}
            style={styles.input}
            multiline
          />
          {!currentTaskReviewed ? (
            <Button
              label="Check Answer"
              onPress={() => submitAnswer(answer)}
            />
          ) : (
            <View style={styles.actionRow}>
              <Button label="Next Task" onPress={advanceTask} />
              <Button
                label="Retry Task"
                onPress={() => {
                  setAnswer("");
                  retryTask();
                }}
              />
              <Button
                label="Retry Section"
                onPress={() => {
                  setAnswer("");
                  retrySection();
                }}
              />
            </View>
          )}
        </View>
      ) : (
        <View style={styles.card}>
          <Text size="lg">Practice session complete</Text>
          <Text>You can start another round or revisit learning.</Text>
          <Button label="Start New Practice Session" onPress={startSession} />
        </View>
      )}

      {latestResult ? (
        <View style={styles.card}>
          <Text size="lg">Latest Feedback</Text>
          <Text>Score: {latestResult.score} / 5</Text>
          <Text>{latestResult.explanation}</Text>
          <Text>Related learning unit: {latestResult.relatedLearningUnitId}</Text>
          {latestResult.learningProgress?.unitProgress ? (
            <Text>
              Updated mastery: {latestResult.learningProgress.unitProgress.mastery_level},
              review interval {latestResult.learningProgress.unitProgress.review_interval_days} day(s)
            </Text>
          ) : null}
        </View>
      ) : null}
    </ScrollView>
  );
}

function formatSection(value: string) {
  return value.charAt(0).toUpperCase() + value.slice(1);
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
  subCard: {
    backgroundColor: colors.background,
    borderRadius: radius.md,
    gap: spacing.xs,
    padding: spacing.sm,
  },
  optionList: {
    gap: spacing.sm,
  },
  input: {
    borderColor: colors.primary,
    borderRadius: radius.md,
    borderWidth: 1,
    color: colors.text,
    minHeight: 120,
    padding: spacing.md,
    textAlignVertical: "top",
    width: "100%",
  },
  actionRow: {
    gap: spacing.sm,
  },
});
