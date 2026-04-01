import { StyleSheet, View } from "react-native";

import Button from "../primitives/Button";
import Card from "../primitives/Card";
import Row from "../primitives/Row";
import ScreenContainer from "../primitives/ScreenContainer";
import Stack from "../primitives/Stack";
import Text from "../primitives/Text";
import Input from "../primitives/Input";
import { colors, spacing } from "../tokens";

type LearningLessonExercise = {
  id: string;
  title: string;
  prompt: string;
  inputMode: "choice" | "text";
  options: string[];
  explanation: string;
};

type LearningLesson = {
  id: string;
  title: string;
  summary: string;
  explanation: string;
  examples: string[];
  items: Array<{
    id: string;
    label: string;
    value: string;
  }>;
  exercises: LearningLessonExercise[];
  progress: {
    completed: boolean;
    answeredExerciseIds: string[];
    allExercisesCorrect: boolean;
    exerciseProgress: Array<{
      exerciseId: string;
      attempted: boolean;
      lastCorrect: boolean | null;
      lastSubmittedAnswer: string | null;
    }>;
  };
};

type LearningModule = {
  id: string;
  title: string;
  description: string;
  levelLabel: string;
  currentLessonId: string;
  completedLessonCount: number;
  totalLessonCount: number;
  progressPercent: number;
  lessons: LearningLesson[];
};

type LearningLevel = {
  id: string;
  title: string;
  cefr: string;
  description: string;
  modules: LearningModule[];
};

type Props = {
  activeLesson: LearningLesson | null;
  activeModule: LearningModule | null;
  answerDrafts: Record<string, string>;
  busyExerciseId: string | null;
  completingLesson: boolean;
  completedLessonCount: number;
  errorMessage: string | null;
  errorTraceReference: string | null;
  governanceStatus: "governed" | "legacy_uncontrolled";
  latestEvaluation:
    | {
        lessonId: string;
        exerciseId: string;
        correct: boolean;
        submittedAnswer: string;
        expectedAnswer: string;
        explanation: string;
      }
    | null;
  latestTransition: string | null;
  levels: LearningLevel[];
  loading: boolean;
  offlineMessage: string | null;
  selectedLessonId: string | null;
  selectedModuleId: string | null;
  totalLessonCount: number;
  onAnswerDraftChange: (exerciseId: string, value: string) => void;
  onBack: () => void;
  onCompleteLesson: () => void;
  onRefresh: () => void;
  onSelectLesson: (lessonId: string) => void;
  onSelectModule: (moduleId: string) => void;
  onSubmitAnswer: (exerciseId: string, answer: string) => void;
};

function StatusRow({ label, value }: { label: string; value: string }) {
  return (
    <Row justify="space-between">
      <Text variant="caption" tone="muted">
        {label}
      </Text>
      <Text variant="caption">{value}</Text>
    </Row>
  );
}

function LessonStateLabel({ lesson, isSelected }: { lesson: LearningLesson; isSelected: boolean }) {
  if (lesson.progress.completed) {
    return <Text tone="success">Completed</Text>;
  }

  if (isSelected) {
    return <Text tone="primary">Open lesson</Text>;
  }

  return <Text tone="muted">Not completed</Text>;
}

export default function LearningScreen({
  activeLesson,
  activeModule,
  answerDrafts,
  busyExerciseId,
  completingLesson,
  completedLessonCount,
  errorMessage,
  errorTraceReference,
  governanceStatus,
  latestEvaluation,
  latestTransition,
  levels,
  loading,
  offlineMessage,
  selectedLessonId,
  selectedModuleId,
  totalLessonCount,
  onAnswerDraftChange,
  onBack,
  onCompleteLesson,
  onRefresh,
  onSelectLesson,
  onSelectModule,
  onSubmitAnswer,
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
              <Text tone="muted">Loading structured lesson system...</Text>
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
            <Button label="Back Home" onPress={onBack} tone="surface" />
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

  const lessonFeedback =
    latestEvaluation && activeLesson && latestEvaluation.lessonId === activeLesson.id
      ? latestEvaluation
      : null;

  return (
    <ScreenContainer
      actions={
        <Stack gap="xs">
          <Button
            label={activeLesson?.progress.completed ? "Lesson Completed" : "Mark Lesson Complete"}
            onPress={onCompleteLesson}
            state={
              activeLesson?.progress.completed
                ? "locked"
                : completingLesson
                  ? "loading"
                  : "default"
            }
          />
          <Button label="Refresh Learning" onPress={onRefresh} tone="surface" />
          <Button label="Back Home" onPress={onBack} tone="surface" />
        </Stack>
      }
      content={
        <Stack gap="sm">
          {offlineMessage ? (
            <Card tone="warning">
              <Text>{offlineMessage}</Text>
            </Card>
          ) : null}

          {governanceStatus === "legacy_uncontrolled" ? (
            <Card tone="warning">
              <Text>
                Learning content is structured and deterministic, but governance metadata is still
                reporting legacy control.
              </Text>
            </Card>
          ) : null}

          {latestTransition ? (
            <Card tone="info">
              <Text>{latestTransition}</Text>
            </Card>
          ) : null}

          {levels.map((level) => (
            <Card key={level.id}>
              <Stack gap="xs">
                <Text variant="title">
                  {level.cefr} {level.title}
                </Text>
                <Text tone="muted">{level.description}</Text>
                {level.modules.map((module) => {
                  const selected = module.id === selectedModuleId;

                  return (
                    <Card key={module.id} tone={selected ? "surfaceRaised" : "surfaceMuted"}>
                      <Stack gap="xs">
                        <Text variant="bodyStrong">{module.title}</Text>
                        <Text tone="muted">{module.description}</Text>
                        <StatusRow
                          label="Progress"
                          value={`${module.completedLessonCount}/${module.totalLessonCount} lessons`}
                        />
                        <StatusRow
                          label="Current lesson"
                          value={module.lessons.find((lesson) => lesson.id === module.currentLessonId)?.title ?? module.lessons[0]?.title ?? "None"}
                        />
                        <Text tone="muted">
                          Completion {Math.round(module.progressPercent * 100)}%
                        </Text>
                        <Button
                          label={selected ? "Module Open" : "Open Module"}
                          onPress={() => onSelectModule(module.id)}
                          tone="surface"
                          state={selected ? "locked" : "default"}
                        />
                        {selected ? (
                          <Stack gap="xs">
                            {module.lessons.map((lesson) => (
                              <View key={lesson.id} style={styles.lessonListItem}>
                                <Stack gap="xxs">
                                  <Text variant="bodyStrong">{lesson.title}</Text>
                                  <Text tone="muted">{lesson.summary}</Text>
                                  <LessonStateLabel
                                    isSelected={lesson.id === selectedLessonId}
                                    lesson={lesson}
                                  />
                                </Stack>
                                <Button
                                  label={lesson.id === selectedLessonId ? "Viewing" : "View Lesson"}
                                  onPress={() => onSelectLesson(lesson.id)}
                                  tone="surface"
                                  state={lesson.id === selectedLessonId ? "locked" : "default"}
                                />
                              </View>
                            ))}
                          </Stack>
                        ) : null}
                      </Stack>
                    </Card>
                  );
                })}
              </Stack>
            </Card>
          ))}

          {activeLesson && activeModule ? (
            <>
              <Card>
                <Stack gap="xs">
                  <Text variant="title">{activeLesson.title}</Text>
                  <Text tone="muted">
                    {activeModule.levelLabel} module: {activeModule.title}
                  </Text>
                  <Text>{activeLesson.summary}</Text>
                </Stack>
              </Card>

              <Card>
                <Stack gap="xs">
                  <Text variant="bodyStrong">Explanation</Text>
                  <Text>{activeLesson.explanation}</Text>
                </Stack>
              </Card>

              <Card>
                <Stack gap="xs">
                  <Text variant="bodyStrong">Key Items</Text>
                  {activeLesson.items.map((item) => (
                    <View key={item.id} style={styles.detailRow}>
                      <Text variant="caption" tone="muted">
                        {item.label}
                      </Text>
                      <Text>{item.value}</Text>
                    </View>
                  ))}
                </Stack>
              </Card>

              <Card>
                <Stack gap="xs">
                  <Text variant="bodyStrong">Examples</Text>
                  {activeLesson.examples.map((example) => (
                    <Text key={example}>{example}</Text>
                  ))}
                </Stack>
              </Card>

              {activeLesson.exercises.length ? (
                <Card>
                  <Stack gap="sm">
                    <Text variant="bodyStrong">Deterministic Exercises</Text>
                    {activeLesson.exercises.map((exercise) => {
                      const exerciseProgress = activeLesson.progress.exerciseProgress.find(
                        (item) => item.exerciseId === exercise.id,
                      );

                      return (
                        <Card key={exercise.id} tone="surfaceMuted">
                          <Stack gap="xs">
                            <Text variant="bodyStrong">{exercise.title}</Text>
                            <Text>{exercise.prompt}</Text>
                            {exercise.inputMode === "choice" ? (
                              <Stack gap="xs">
                                {exercise.options.map((option) => (
                                  <Button
                                    key={option}
                                    label={option}
                                    onPress={() => onSubmitAnswer(exercise.id, option)}
                                    tone="surface"
                                    state={
                                      busyExerciseId === exercise.id ? "loading" : "default"
                                    }
                                  />
                                ))}
                              </Stack>
                            ) : (
                              <Stack gap="xs">
                                <Input
                                  autoCapitalize="none"
                                  autoCorrect={false}
                                  onChangeText={(value) => onAnswerDraftChange(exercise.id, value)}
                                  placeholder="Type your answer"
                                  value={answerDrafts[exercise.id] ?? ""}
                                />
                                <Button
                                  disabled={!answerDrafts[exercise.id]?.trim()}
                                  label="Submit Answer"
                                  onPress={() =>
                                    onSubmitAnswer(exercise.id, answerDrafts[exercise.id] ?? "")
                                  }
                                  state={
                                    busyExerciseId === exercise.id ? "loading" : "default"
                                  }
                                />
                              </Stack>
                            )}
                            {exerciseProgress?.attempted ? (
                              <Text tone={exerciseProgress.lastCorrect ? "success" : "error"}>
                                {exerciseProgress.lastCorrect
                                  ? "Latest result: correct."
                                  : "Latest result: incorrect."}
                              </Text>
                            ) : null}
                          </Stack>
                        </Card>
                      );
                    })}
                  </Stack>
                </Card>
              ) : null}

              {lessonFeedback ? (
                <Card tone={lessonFeedback.correct ? "info" : "warning"}>
                  <Stack gap="xs">
                    <Text tone={lessonFeedback.correct ? "success" : "error"}>
                      {lessonFeedback.correct ? "Correct answer" : "Review needed"}
                    </Text>
                    <Text>Submitted: {lessonFeedback.submittedAnswer}</Text>
                    <Text>Expected: {lessonFeedback.expectedAnswer}</Text>
                    <Text tone="muted">{lessonFeedback.explanation}</Text>
                  </Stack>
                </Card>
              ) : null}
            </>
          ) : null}
        </Stack>
      }
      header={
        <Card>
          <Stack gap="xs">
            <Text variant="title">Learning System</Text>
            <Text tone="muted">
              Structured lessons with deterministic progression and governed UI contracts.
            </Text>
            <Row gap="sm" wrap>
              <View style={styles.metric}>
                <Text variant="caption" tone="muted">
                  Completed
                </Text>
                <Text variant="bodyStrong">
                  {completedLessonCount}/{totalLessonCount}
                </Text>
              </View>
              <View style={styles.metric}>
                <Text variant="caption" tone="muted">
                  Active Module
                </Text>
                <Text variant="bodyStrong">{activeModule?.title ?? "None"}</Text>
              </View>
            </Row>
          </Stack>
        </Card>
      }
    />
  );
}

const styles = StyleSheet.create({
  detailRow: {
    borderColor: colors.border,
    borderRadius: 12,
    borderWidth: 1,
    gap: spacing.xxs,
    padding: spacing.xs,
  },
  lessonListItem: {
    borderColor: colors.border,
    borderRadius: 12,
    borderWidth: 1,
    gap: spacing.xs,
    padding: spacing.xs,
  },
  metric: {
    backgroundColor: colors.surfaceMuted,
    borderColor: colors.border,
    borderRadius: 12,
    borderWidth: 1,
    gap: spacing.xxs,
    minWidth: 136,
    padding: spacing.xs,
  },
});
