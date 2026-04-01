import Button from "../primitives/Button";
import Card from "../primitives/Card";
import Input from "../primitives/Input";
import Row from "../primitives/Row";
import ScreenContainer from "../primitives/ScreenContainer";
import Stack from "../primitives/Stack";
import Text from "../primitives/Text";

type Exercise = {
  id: string;
  type: "vocabulary_selection" | "sentence_completion" | "grammar_selection";
  title: string;
  prompt: string;
  options: string[];
  input_mode: "choice" | "text";
  answer_status: "pending" | "answered";
} | null;

type LatestResult = {
  exercise_id: string;
  type: string;
  correct: boolean;
  submitted_answer: string;
  expected_answer: string;
  explanation: string | null;
} | null;

type Props = {
  accuracy: number;
  answerDraft: string;
  completedCount: number;
  currentExercise: Exercise;
  errorMessage: string | null;
  latestResult: LatestResult;
  loading: boolean;
  sessionComplete: boolean;
  totalCount: number;
  onAnswerChange: (value: string) => void;
  onBack: () => void;
  onNext: () => void;
  onOpenLearning: () => void;
  onRetry: () => void;
  onSubmit: () => void;
};

function formatPercent(value: number) {
  return `${Math.round(value * 100)}%`;
}

function formatExerciseType(value: string) {
  const normalized = value.replace(/_/g, " ");
  return normalized.charAt(0).toUpperCase() + normalized.slice(1);
}

export default function DailyPracticeScreen({
  accuracy,
  answerDraft,
  completedCount,
  currentExercise,
  errorMessage,
  latestResult,
  loading,
  sessionComplete,
  totalCount,
  onAnswerChange,
  onBack,
  onNext,
  onOpenLearning,
  onRetry,
  onSubmit,
}: Props) {
  const canSubmit =
    currentExercise !== null &&
    currentExercise.answer_status === "pending" &&
    (currentExercise.input_mode === "choice" ? answerDraft !== "" : answerDraft.trim() !== "");

  return (
    <ScreenContainer
      actions={
        <Stack gap="xs">
          {sessionComplete ? (
            <Button label="Open Learning" onPress={onOpenLearning} />
          ) : currentExercise?.answer_status === "answered" ? (
            <Button
              disabled={loading}
              label="Next Exercise"
              onPress={onNext}
              state={loading ? "loading" : "default"}
            />
          ) : (
            <Button
              disabled={loading || !canSubmit}
              label="Submit Answer"
              onPress={onSubmit}
              state={loading ? "loading" : "default"}
            />
          )}
          {errorMessage ? (
            <Button label="Retry" onPress={onRetry} tone="surface" />
          ) : null}
          <Button label="Back Home" onPress={onBack} tone="surface" />
        </Stack>
      }
      content={
        <Stack gap="sm">
          {errorMessage ? (
            <Card tone="warning">
              <Stack gap="xs">
                <Text variant="title">Daily practice unavailable</Text>
                <Text>{errorMessage}</Text>
              </Stack>
            </Card>
          ) : null}

          {sessionComplete ? (
            <Card tone="surfaceRaised">
              <Stack gap="xs">
                <Text variant="title">Session complete</Text>
                <Text>
                  Daily practice is complete for this session. Review the result or return to
                  learning.
                </Text>
                <Row justify="space-between">
                  <Text tone="muted">Exercises completed</Text>
                  <Text>{completedCount}</Text>
                </Row>
                <Row justify="space-between">
                  <Text tone="muted">Accuracy</Text>
                  <Text tone="primary">{formatPercent(accuracy)}</Text>
                </Row>
              </Stack>
            </Card>
          ) : currentExercise ? (
            <Card>
              <Stack gap="sm">
                <Stack gap="xs">
                  <Text variant="title">{currentExercise.title}</Text>
                  <Text tone="muted">{formatExerciseType(currentExercise.type)}</Text>
                  <Text>{currentExercise.prompt}</Text>
                </Stack>

                {currentExercise.input_mode === "choice" ? (
                  <Stack gap="xs">
                    {currentExercise.options.map((option) => {
                      const isSelected = answerDraft === option;
                      return (
                        <Button
                          key={option}
                          disabled={loading || currentExercise.answer_status === "answered"}
                          label={option}
                          onPress={() => onAnswerChange(option)}
                          tone={isSelected ? "primary" : "surface"}
                          state={currentExercise.answer_status === "answered" ? "locked" : "default"}
                        />
                      );
                    })}
                  </Stack>
                ) : (
                  <Input
                    editable={!loading && currentExercise.answer_status === "pending"}
                    onChangeText={onAnswerChange}
                    placeholder="Write the missing word"
                    value={answerDraft}
                  />
                )}
              </Stack>
            </Card>
          ) : (
            <Card>
              <Text tone="muted">Preparing daily practice.</Text>
            </Card>
          )}

          {latestResult ? (
            <Card tone={latestResult.correct ? "info" : "warning"}>
              <Stack gap="xs">
                <Text variant="title">
                  {latestResult.correct ? "Correct" : "Incorrect"}
                </Text>
                <Row justify="space-between">
                  <Text tone="muted">Your answer</Text>
                  <Text>{latestResult.submitted_answer || "No answer"}</Text>
                </Row>
                <Row justify="space-between">
                  <Text tone="muted">Expected answer</Text>
                  <Text>{latestResult.expected_answer}</Text>
                </Row>
                {latestResult.explanation ? <Text>{latestResult.explanation}</Text> : null}
              </Stack>
            </Card>
          ) : null}
        </Stack>
      }
      header={
        <Card>
          <Stack gap="xs">
            <Text variant="title">Daily Practice</Text>
            <Row justify="space-between">
              <Text tone="muted">Completed</Text>
              <Text>
                {completedCount}/{totalCount}
              </Text>
            </Row>
            <Row justify="space-between">
              <Text tone="muted">Accuracy</Text>
              <Text tone="primary">{formatPercent(accuracy)}</Text>
            </Row>
            <Row justify="space-between">
              <Text tone="muted">Flow</Text>
              <Text>Forward only</Text>
            </Row>
          </Stack>
        </Card>
      }
    />
  );
}
