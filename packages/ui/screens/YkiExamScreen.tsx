import type { ReactNode } from "react";
import { ScrollView, StyleSheet, View } from "react-native";

import { colors, radius, spacing } from "../tokens";
import Button from "../primitives/Button";
import Card from "../primitives/Card";
import Row from "../primitives/Row";
import ScreenContainer from "../primitives/ScreenContainer";
import Stack from "../primitives/Stack";
import Text from "../primitives/Text";
import Input from "../primitives/Input";

type ViewAction = {
  enabled: boolean;
  kind: string;
  label: string;
} | null;

type SessionView = {
  view_key: string;
  kind: string;
  title: string;
  prompt: string;
  input_mode: "audio" | "choice" | "none" | "text";
  instructions: string[];
  answer_status: string;
  response_locked: boolean;
  section: string | null;
  options: string[];
  actions: {
    next: ViewAction;
    play_prompt: ViewAction;
    submit: ViewAction;
  };
  passage?: string | null;
  playback?: {
    count: number;
    limit: number;
    remaining: number;
  } | null;
  question?: string | null;
  recording?: {
    max_duration_seconds: number;
  } | null;
  submitted_answer?: string | null;
  submitted_audio?: string | null;
};

type Props = {
  answerDraft: string;
  busy: boolean;
  countdownLabel: string;
  currentView: SessionView;
  examStatus: string;
  progress: {
    completedSectionCount: number;
    completedStepCount: number;
    totalSectionCount: number;
    totalStepCount: number;
  };
  recording: boolean;
  runtimeMessage: string | null;
  sectionProgress: Array<{
    section: string;
    status: string;
    completed_step_count: number;
    total_steps: number;
  }>;
  transportErrorMessage: string | null;
  onAnswerChange: (value: string) => void;
  onNext: () => void;
  onPlayPrompt: () => void;
  onRetry: () => void;
  onSelectChoice: (option: string) => void;
  onStartRecording: () => void;
  onStopRecording: () => void;
  onSubmitText: () => void;
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

function renderInstructions(items: string[]) {
  return (
    <Stack gap="xxs">
      {items.map((item) => (
        <Text key={item}>{item}</Text>
      ))}
    </Stack>
  );
}

function buildActionButton(
  action: ViewAction,
  disabled: boolean,
  onPress: () => void,
  tone: "primary" | "surface" = "primary",
) {
  if (!action) {
    return null;
  }

  return (
    <Button
      disabled={disabled || !action.enabled}
      label={action.label}
      onPress={onPress}
      tone={tone}
    />
  );
}

export default function YkiExamScreen({
  answerDraft,
  busy,
  countdownLabel,
  currentView,
  examStatus,
  progress,
  recording,
  runtimeMessage,
  sectionProgress,
  transportErrorMessage,
  onAnswerChange,
  onNext,
  onPlayPrompt,
  onRetry,
  onSelectChoice,
  onStartRecording,
  onStopRecording,
  onSubmitText,
}: Props) {
  let responseBody: ReactNode = null;

  if (currentView.passage) {
    responseBody = (
      <Card tone="surfaceMuted">
        <Stack gap="xs">
          <Text variant="bodyStrong">Passage</Text>
          <Text>{currentView.passage}</Text>
        </Stack>
      </Card>
    );
  } else if (currentView.input_mode === "choice") {
    responseBody = (
      <Stack gap="xs">
        {currentView.options.map((option) => (
          <Button
            key={option}
            disabled={busy || currentView.response_locked}
            label={option}
            onPress={() => onSelectChoice(option)}
            tone="surface"
          />
        ))}
      </Stack>
    );
  } else if (currentView.input_mode === "text") {
    responseBody = (
      <Stack gap="xs">
        <Input
          editable={!busy && !currentView.response_locked}
          multiline
          onChangeText={onAnswerChange}
          placeholder="Write your response"
          value={answerDraft}
        />
        {buildActionButton(currentView.actions.submit, false, onSubmitText)}
      </Stack>
    );
  } else if (currentView.input_mode === "audio") {
    responseBody = (
      <Stack gap="xs">
        <Card tone="surfaceMuted">
          <Stack gap="xs">
            <Text variant="bodyStrong">Recording</Text>
            <Text>
              Max duration: {currentView.recording?.max_duration_seconds ?? 0} seconds
            </Text>
            <Text tone={recording ? "primary" : "muted"}>
              {recording ? "Recording in progress." : "Recording is idle."}
            </Text>
            {currentView.submitted_audio ? (
              <Text tone="muted">Submitted audio reference: {currentView.submitted_audio}</Text>
            ) : null}
          </Stack>
        </Card>
        {!currentView.response_locked ? (
          <Stack gap="xs">
            <Button
              disabled={busy || recording}
              label="Start Recording"
              onPress={onStartRecording}
            />
            <Button
              disabled={busy || !recording}
              label="Stop And Submit"
              onPress={onStopRecording}
              tone="surface"
            />
          </Stack>
        ) : null}
      </Stack>
    );
  } else if (currentView.playback) {
    responseBody = (
      <Card tone="surfaceMuted">
        <Stack gap="xs">
          <Text variant="bodyStrong">Prompt Playback</Text>
          <Text>
            Plays used: {currentView.playback.count}/{currentView.playback.limit}
          </Text>
          <Text tone="muted">Remaining plays: {currentView.playback.remaining}</Text>
        </Stack>
      </Card>
    );
  }

  return (
    <ScreenContainer
      actions={
        <Stack gap="xs">
          {transportErrorMessage ? <Button label="Retry Sync" onPress={onRetry} /> : null}
          {buildActionButton(currentView.actions.play_prompt, busy, onPlayPrompt, "surface")}
          {currentView.input_mode !== "text"
            ? buildActionButton(currentView.actions.next, busy, onNext)
            : buildActionButton(currentView.actions.next, busy, onNext, "surface")}
        </Stack>
      }
      content={
        <View style={styles.contentShell}>
          <ScrollView
            contentContainerStyle={styles.contentScrollFrame}
            style={styles.contentScroll}
          >
            <Stack gap="sm">
              {transportErrorMessage ? (
                <Card>
                  <Stack gap="xs">
                    <Text variant="title">Connection Blocked</Text>
                    <Text tone="error">{transportErrorMessage}</Text>
                  </Stack>
                </Card>
              ) : null}

              {runtimeMessage ? (
                <Card>
                  <Text tone="muted">{runtimeMessage}</Text>
                </Card>
              ) : null}

              <Card>
                <Stack gap="xs">
                  <Text variant="title">{currentView.title}</Text>
                  <Text>{currentView.prompt}</Text>
                  {currentView.question ? <Text variant="bodyStrong">{currentView.question}</Text> : null}
                  {renderInstructions(currentView.instructions)}
                  {currentView.submitted_answer ? (
                    <Card tone="surfaceMuted">
                      <Stack gap="xxs">
                        <Text variant="bodyStrong">Submitted Response</Text>
                        <Text>{currentView.submitted_answer}</Text>
                      </Stack>
                    </Card>
                  ) : null}
                  {responseBody}
                </Stack>
              </Card>

              <Card>
                <Stack gap="xs">
                  <Text variant="title">Section Locking</Text>
                  {sectionProgress.map((section) => (
                    <MetadataRow
                      key={section.section}
                      label={section.section}
                      value={`${section.completed_step_count}/${section.total_steps} ${section.status}`}
                    />
                  ))}
                </Stack>
              </Card>
            </Stack>
          </ScrollView>
        </View>
      }
      header={
        <Card>
          <Stack gap="xs">
            <Text variant="title">YKI Exam Runtime</Text>
            <MetadataRow label="Status" value={examStatus} />
            <MetadataRow
              label="Section Progress"
              value={`${progress.completedSectionCount}/${progress.totalSectionCount}`}
            />
            <MetadataRow
              label="Step Progress"
              value={`${progress.completedStepCount}/${progress.totalStepCount}`}
            />
            <MetadataRow label="Countdown" value={countdownLabel} />
            <MetadataRow label="Navigation" value="Forward only" />
          </Stack>
        </Card>
      }
      scroll={false}
    />
  );
}

const styles = StyleSheet.create({
  contentScroll: {
    alignSelf: "stretch",
    backgroundColor: colors.background,
  },
  contentScrollFrame: {
    gap: spacing.sm,
    paddingBottom: spacing.sm,
  },
  contentShell: {
    alignSelf: "stretch",
    borderRadius: radius.medium,
  },
});
