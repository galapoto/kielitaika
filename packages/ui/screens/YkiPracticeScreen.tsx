import Button from "../primitives/Button";
import Card from "../primitives/Card";
import Row from "../primitives/Row";
import Input from "../primitives/Input";
import ScreenContainer from "../primitives/ScreenContainer";
import Stack from "../primitives/Stack";
import Text from "../primitives/Text";

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
  governanceVersion: string;
  changeReference: string | null;
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
  auditReplaySummary: string[];
  auditTimeline: string[];
  canAdvance: boolean;
  changeReference: string | null;
  certificationSummary: string[];
  certificationTraceReference: string | null;
  completionState: {
    completed_task_count: number;
    status: "active" | "awaiting_advance" | "completed";
    total_task_count: number;
  } | null;
  errorMessage: string | null;
  governanceStatus: "governed" | "legacy_uncontrolled";
  latestResult: LatestResultView | null;
  loading: boolean;
  notice: string | null;
  offlineMessage: string | null;
  policyVersion: string | null;
  sessionId: string | null;
  task: TaskView | null;
  trace: TraceView | null;
  untrustedStateMessage: string | null;
  onAnswerChange: (value: string) => void;
  onAdvance: () => void;
  onBack: () => void;
  onRefresh: () => void;
  onSubmit: () => void;
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

export default function YkiPracticeScreen({
  answer,
  auditReplaySummary,
  auditTimeline,
  canAdvance,
  changeReference,
  certificationSummary,
  certificationTraceReference,
  completionState,
  errorMessage,
  governanceStatus,
  latestResult,
  loading,
  notice,
  offlineMessage,
  policyVersion,
  sessionId,
  task,
  trace,
  untrustedStateMessage,
  onAnswerChange,
  onAdvance,
  onBack,
  onRefresh,
  onSubmit,
}: Props) {
  if (loading) {
    return (
      <ScreenContainer center>
        <Card>
          <Stack gap="xs">
            <Text variant="title">YKI Practice</Text>
            <Text tone="muted">Loading governed session...</Text>
          </Stack>
        </Card>
      </ScreenContainer>
    );
  }

  if (errorMessage) {
    return (
      <ScreenContainer center>
        <Stack gap="sm">
          <Card>
            <Stack gap="xs">
              <Text variant="title">YKI Practice</Text>
              <Text tone="error">{errorMessage}</Text>
            </Stack>
          </Card>
          <Button label="Retry" onPress={onRefresh} />
          <Button label="Back" onPress={onBack} tone="surface" />
        </Stack>
      </ScreenContainer>
    );
  }

  if (!sessionId || !trace || !policyVersion) {
    return (
      <ScreenContainer center>
        <Stack gap="sm">
          <Card>
            <Stack gap="xs">
              <Text variant="title">YKI Practice</Text>
              <Text tone="muted">No active governed practice session.</Text>
              {offlineMessage ? <Text tone="muted">{offlineMessage}</Text> : null}
            </Stack>
          </Card>
          {!offlineMessage ? <Button label="Refresh Session" onPress={onRefresh} /> : null}
          <Button label="Back Home" onPress={onBack} tone="surface" />
        </Stack>
      </ScreenContainer>
    );
  }

  return (
    <ScreenContainer>
      <Stack gap="sm">
        <Card>
          <Stack gap="xs">
            <Text variant="title">YKI Practice</Text>
            <MetadataRow label="Session" value={sessionId} />
            <MetadataRow label="Policy version" value={policyVersion} />
            <MetadataRow label="Governance status" value={governanceStatus} />
            {completionState ? (
              <MetadataRow
                label="Completion"
                value={`${completionState.completed_task_count}/${completionState.total_task_count} ${completionState.status}`}
              />
            ) : null}
            {changeReference ? <MetadataRow label="Change reference" value={changeReference} /> : null}
            {offlineMessage ? <Text tone="muted">{offlineMessage}</Text> : null}
            {untrustedStateMessage ? <Text tone="error">{untrustedStateMessage}</Text> : null}
            {notice ? <Text tone="muted">{notice}</Text> : null}
          </Stack>
        </Card>

        <Card>
          <Stack gap="xs">
            {!offlineMessage ? <Button label="Refresh Session" onPress={onRefresh} /> : null}
            <Button label="Back Home" onPress={onBack} tone="surface" />
          </Stack>
        </Card>

        {completionState?.status !== "completed" && task ? (
          <Card>
            <Stack gap="xs">
              <Text variant="title">{task.title}</Text>
              <MetadataRow label="Section" value={task.section} />
              <Text>{task.prompt}</Text>
              {task.question ? <Text>{task.question}</Text> : null}
              {task.guidance ? <Text tone="muted">{task.guidance}</Text> : null}
              {task.options?.length && !offlineMessage ? (
                <Stack gap="xs">
                  {task.options.map((option) => (
                    <Button key={option} label={option} onPress={() => onAnswerChange(option)} tone="surface" />
                  ))}
                </Stack>
              ) : null}
              {offlineMessage ? (
                <Stack gap="xxs">
                  <Text tone="muted">Playback is locked until connection resumes.</Text>
                  <Text tone="muted">
                    Current answer: {answer || "No submitted answer captured for this task."}
                  </Text>
                </Stack>
              ) : (
                <Input multiline onChangeText={onAnswerChange} placeholder="Write your answer" value={answer} />
              )}
              {!canAdvance && !offlineMessage ? <Button label="Submit Answer" onPress={onSubmit} /> : null}
              {canAdvance && !offlineMessage ? <Button label="Continue Playback" onPress={onAdvance} /> : null}
            </Stack>
          </Card>
        ) : (
          <Card>
            <Stack gap="xs">
              <Text variant="title">Session Complete</Text>
              <Text tone="muted">The governed playback plan has been completed and sealed.</Text>
              {certificationTraceReference ? (
                <Text tone="muted">Trace reference: {certificationTraceReference}</Text>
              ) : null}
              {certificationSummary.map((item) => (
                <Text key={item}>{item}</Text>
              ))}
              <Button label="Back Home" onPress={onBack} />
            </Stack>
          </Card>
        )}

        {latestResult ? (
          <Card>
            <Stack gap="xs">
              <Text variant="title">Latest Result</Text>
              <MetadataRow label="Score" value={`${latestResult.score}`} />
              <Text>{latestResult.explanation}</Text>
              <Text tone="muted">{latestResult.whyWrong}</Text>
            </Stack>
          </Card>
        ) : null}

        <Card>
          <Stack gap="xs">
            <Text variant="title">Session Trace</Text>
            <MetadataRow label="Decision version" value={trace.decisionVersion} />
            <MetadataRow label="Policy version" value={trace.policyVersion} />
            <MetadataRow label="Governance version" value={trace.governanceVersion} />
            <MetadataRow label="Exam mode" value={trace.examMode ? "locked" : "adaptive"} />
            {trace.changeReference ? (
              <MetadataRow label="Change reference" value={trace.changeReference} />
            ) : null}
            <Text tone="muted">Precomputed plan: {trace.precomputedPlanSummary}</Text>
            {trace.tasks.map((item) => (
              <Text key={item.taskId}>
                {item.taskId}: {item.reason} ({item.difficultyLevel}) unit {item.relatedLearningUnitId}
              </Text>
            ))}
          </Stack>
        </Card>

        {auditReplaySummary.length || auditTimeline.length ? (
          <Card>
            <Stack gap="xs">
              <Text variant="title">Audit Timeline</Text>
              {auditReplaySummary.map((item) => (
                <Text key={item}>{item}</Text>
              ))}
              {auditTimeline.map((item) => (
                <Text key={item} tone="muted">
                  {item}
                </Text>
              ))}
            </Stack>
          </Card>
        ) : null}
      </Stack>
    </ScreenContainer>
  );
}
