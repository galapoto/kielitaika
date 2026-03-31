import Box from "../components/primitives/Box";
import Button from "../components/primitives/Button";
import Input from "../components/primitives/Input";
import Text from "../components/primitives/Text";
import Screen from "../components/layout/Screen";
import Section from "../components/layout/Section";

type TaskView = {
  guidance?: string;
  id: string;
  options?: string[];
  prompt: string;
  question?: string;
  section: string;
  title: string;
};

type TraceView = {
  decisionVersion: string;
  policyVersion: string;
  examMode: boolean;
  precomputedPlanSummary: string;
  tasks: Array<{
    difficultyLevel: string;
    reason: string;
    relatedLearningUnitId: string;
    taskId: string;
  }>;
};

type LatestResultView = {
  explanation: string;
  score: number;
  whyWrong: string;
};

type Props = {
  answer: string;
  errorMessage: string | null;
  latestResult: LatestResultView | null;
  loading: boolean;
  notice: string | null;
  sessionId: string | null;
  task: TaskView | null;
  trace: TraceView | null;
  onAnswerChange: (value: string) => void;
  onAdvance: () => void;
  onBack: () => void;
  onRefresh: () => void;
  onRetrySection: () => void;
  onRetryTask: () => void;
  onStart: () => void;
  onSubmit: () => void;
};

export default function YkiPracticeScreen({
  answer,
  errorMessage,
  latestResult,
  loading,
  notice,
  sessionId,
  task,
  trace,
  onAnswerChange,
  onAdvance,
  onBack,
  onRefresh,
  onRetrySection,
  onRetryTask,
  onStart,
  onSubmit,
}: Props) {
  if (loading) {
    return (
      <Screen>
        <Section>
          <Text variant="title">YKI Practice</Text>
          <Text tone="secondary">Loading session...</Text>
        </Section>
      </Screen>
    );
  }

  if (errorMessage) {
    return (
      <Screen>
        <Section>
          <Text variant="title">YKI Practice</Text>
          <Text>{errorMessage}</Text>
          <Button label="Retry" onPress={onRefresh} />
          <Button label="Back" onPress={onBack} />
        </Section>
      </Screen>
    );
  }

  if (!sessionId) {
    return (
      <Screen>
        <Section>
          <Text variant="title">YKI Practice</Text>
          <Text tone="secondary">No active practice session.</Text>
          <Button label="Start Session" onPress={onStart} />
          <Button label="Back Home" onPress={onBack} />
        </Section>
      </Screen>
    );
  }

  return (
    <Screen>
      <Box gap="md">
        <Section>
          <Text variant="title">YKI Practice</Text>
          <Text>Session: {sessionId}</Text>
          {notice ? <Text tone="secondary">{notice}</Text> : null}
          <Button label="Refresh Session" onPress={onRefresh} />
          <Button label="Back Home" onPress={onBack} />
        </Section>

        {task ? (
          <Section>
            <Text variant="title">{task.title}</Text>
            <Text>Section: {task.section}</Text>
            <Text>{task.prompt}</Text>
            {task.question ? <Text>{task.question}</Text> : null}
            {task.guidance ? <Text tone="secondary">{task.guidance}</Text> : null}
            {task.options?.length ? (
              <Box gap="sm">
                {task.options.map((option) => (
                  <Button key={option} label={option} onPress={() => onAnswerChange(option)} />
                ))}
              </Box>
            ) : null}
            <Input multiline onChangeText={onAnswerChange} placeholder="Write your answer" value={answer} />
            <Button label="Submit Answer" onPress={onSubmit} />
            <Button label="Next Task" onPress={onAdvance} />
            <Button label="Retry Task" onPress={onRetryTask} />
            <Button label="Retry Section" onPress={onRetrySection} />
          </Section>
        ) : (
          <Section>
            <Text variant="title">Session Complete</Text>
            <Text tone="secondary">All tasks have been completed for this session.</Text>
            <Button label="Start Session" onPress={onStart} />
          </Section>
        )}

        {latestResult ? (
          <Section>
            <Text variant="title">Latest Result</Text>
            <Text>Score: {latestResult.score}</Text>
            <Text>{latestResult.explanation}</Text>
            <Text tone="secondary">{latestResult.whyWrong}</Text>
          </Section>
        ) : null}

        {trace ? (
          <Section>
            <Text variant="title">Session Trace</Text>
            <Text>Decision version: {trace.decisionVersion}</Text>
            <Text>Policy version: {trace.policyVersion}</Text>
            <Text>Exam mode: {trace.examMode ? "locked" : "adaptive"}</Text>
            <Text tone="secondary">Precomputed plan: {trace.precomputedPlanSummary}</Text>
            {trace.tasks.map((item) => (
              <Text key={item.taskId}>
                {item.taskId}: {item.reason} ({item.difficultyLevel}) unit {item.relatedLearningUnitId}
              </Text>
            ))}
          </Section>
        ) : null}
      </Box>
    </Screen>
  );
}
