import { ScrollView, StyleSheet, View } from "react-native";

import { colors, componentSizes, radius, spacing } from "../tokens";
import Button from "../primitives/Button";
import Card from "../primitives/Card";
import Row from "../primitives/Row";
import ScreenContainer from "../primitives/ScreenContainer";
import Stack from "../primitives/Stack";
import Text from "../primitives/Text";
import Input from "../primitives/Input";

type ButtonVisualState = "default" | "loading" | "locked";

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
    ready: boolean;
    audio: {
      id: string;
      url: string;
      content_type: string;
      duration_ms: number;
      ready: boolean;
    } | null;
  } | null;
  question?: string | null;
  recording?: {
    max_duration_seconds: number;
  } | null;
  submitted_answer?: string | null;
  submitted_audio?: string | null;
};

type Props = {
  actionStates: {
    next: ButtonVisualState;
    option: ButtonVisualState;
    pausePrompt: ButtonVisualState;
    playPrompt: ButtonVisualState;
    retry: ButtonVisualState;
    resumePrompt: ButtonVisualState;
    startRecording: ButtonVisualState;
    stopRecording: ButtonVisualState;
    submit: ButtonVisualState;
  };
  answerDraft: string;
  busy: boolean;
  certificate: {
    level: string;
    overall_score: number;
    passed: boolean;
  } | null;
  countdownLabel: string;
  currentView: SessionView;
  examStatus: string;
  playbackStateLabel: string | null;
  progress: {
    completedSectionCount: number;
    completedStepCount: number;
    totalSectionCount: number;
    totalStepCount: number;
  };
  readOnly: boolean;
  recording: boolean;
  runtimeMessage: string | null;
  sectionProgress: Array<{
    section: string;
    status: string;
    completed_step_count: number;
    total_steps: number;
  }>;
  transportErrorMessage: string | null;
  transitionLabel: string | null;
  onAnswerChange: (value: string) => void;
  onNext: () => void;
  onPausePrompt: () => void;
  onPlayPrompt: () => void;
  onRetry: () => void;
  onResumePrompt: () => void;
  onSelectChoice: (option: string) => void;
  onStartRecording: () => void;
  onStopRecording: () => void;
  onSubmitText: () => void;
  promptPlaybackPaused: boolean;
};

function formatTokenLabel(value: string | null | undefined) {
  if (!value) {
    return "Pending";
  }

  const normalized = value.replace(/_/g, " ");
  return normalized.charAt(0).toUpperCase() + normalized.slice(1);
}

function MetadataRow({
  label,
  value,
  valueTone = "default",
}: {
  label: string;
  value: string;
  valueTone?: "default" | "muted" | "primary" | "success";
}) {
  return (
    <Row justify="space-between">
      <Text variant="caption" tone="muted">
        {label}
      </Text>
      <Text tone={valueTone} variant="caption">
        {value}
      </Text>
    </Row>
  );
}

function renderInstructions(items: string[]) {
  if (items.length === 0) {
    return null;
  }

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
  state: ButtonVisualState,
  tone: "primary" | "surface" = "primary",
  testID?: string,
  accessibilityLabel?: string,
) {
  if (!action) {
    return null;
  }

  return (
    <Button
      accessibilityLabel={accessibilityLabel ?? action.label}
      disabled={disabled || !action.enabled}
      label={action.label}
      onPress={onPress}
      state={state}
      testID={testID}
      tone={tone}
    />
  );
}

function buildStageReadyCopy(currentView: SessionView, readOnly: boolean, playbackStateLabel: string | null) {
  if (readOnly) {
    return "The exam is complete. Responses are locked and the result view is read-only.";
  }

  if (currentView.kind === "reading_passage") {
    return "Read the full passage before moving into the reading questions.";
  }

  if (currentView.kind === "listening_prompt") {
    return playbackStateLabel ?? "Listen to the prompt first. Questions open only after you continue.";
  }

  if (currentView.kind === "section_complete") {
    return "This section is sealed. Continue when you are ready for the next section.";
  }

  if (currentView.kind === "exam_complete") {
    return "The governed exam session has finished.";
  }

  if (currentView.input_mode === "audio") {
    return "Plan briefly, record once, and stop to submit the response immediately.";
  }

  if (currentView.input_mode === "text") {
    return "Write the response in the locked exam field, then submit when ready.";
  }

  return "Stay in the forward-only flow and complete the current stage before continuing.";
}

function buildCompletionLabel(certificate: Props["certificate"]) {
  if (!certificate) {
    return "Completed";
  }

  return certificate.passed ? "Passed" : "Completed";
}

export default function YkiExamScreen({
  actionStates,
  answerDraft,
  busy,
  certificate,
  countdownLabel,
  currentView,
  examStatus,
  playbackStateLabel,
  progress,
  readOnly,
  recording,
  runtimeMessage,
  sectionProgress,
  transportErrorMessage,
  transitionLabel,
  onAnswerChange,
  onNext,
  onPausePrompt,
  onPlayPrompt,
  onRetry,
  onResumePrompt,
  onSelectChoice,
  onStartRecording,
  onStopRecording,
  onSubmitText,
  promptPlaybackPaused,
}: Props) {
  const isReadOnly = readOnly || examStatus === "read_only" || currentView.kind === "exam_complete";
  const selectedChoice = currentView.submitted_answer ?? answerDraft;
  const submittedValue = currentView.submitted_answer ?? currentView.submitted_audio ?? null;
  const transitionCopy =
    transitionLabel ?? buildStageReadyCopy(currentView, isReadOnly, playbackStateLabel);
  const listeningRemaining = currentView.playback?.remaining ?? 0;
  const listeningAudio = currentView.playback?.audio ?? null;

  return (
    <ScreenContainer
      actionsPosition="top"
      actions={
        isReadOnly ? null : (
          <Stack gap="xs">
            {transportErrorMessage ? (
              <Button
                accessibilityLabel="Retry Sync"
                label="Retry Sync"
                onPress={onRetry}
                state={actionStates.retry}
                testID="yki-retry-sync"
              />
            ) : null}

            {currentView.input_mode === "audio" && !currentView.response_locked ? (
              <>
                <Button
                  accessibilityLabel="yki-record-start"
                  disabled={busy || recording}
                  label="Start Recording"
                  onPress={onStartRecording}
                  state={actionStates.startRecording}
                  testID="yki-record-start"
                />
                <Button
                  accessibilityLabel="yki-record-stop"
                  disabled={busy || !recording}
                  label="Stop And Submit"
                  onPress={onStopRecording}
                  state={actionStates.stopRecording}
                  testID="yki-record-stop"
                  tone="surface"
                />
              </>
            ) : null}

            {currentView.input_mode === "text"
              ? buildActionButton(
                  currentView.actions.submit,
                  false,
                  onSubmitText,
                  actionStates.submit,
                  "primary",
                  "yki-submit-button",
                  "yki-submit-button",
                )
              : null}

            {currentView.playback?.ready ? (
              promptPlaybackPaused ? (
                <Button
                  accessibilityLabel="yki-play-audio"
                  disabled={busy}
                  label="Resume Prompt"
                  onPress={onResumePrompt}
                  state={actionStates.resumePrompt}
                  testID="yki-play-audio"
                  tone="surface"
                />
              ) : (
                <Button
                  accessibilityLabel="yki-pause-audio"
                  disabled={busy || currentView.playback.count === 0}
                  label="Pause Prompt"
                  onPress={onPausePrompt}
                  state={actionStates.pausePrompt}
                  testID="yki-pause-audio"
                  tone="surface"
                />
              )
            ) : null}

            {buildActionButton(
              currentView.actions.play_prompt,
              busy,
              onPlayPrompt,
              actionStates.playPrompt,
              "surface",
              "yki-play-audio",
              "yki-play-audio",
            )}

            {buildActionButton(
              currentView.actions.next,
              busy,
              onNext,
              actionStates.next,
              currentView.input_mode === "text" ? "surface" : "primary",
              "yki-next-button",
              "yki-next-button",
            )}
          </Stack>
        )
      }
      content={
        <View style={styles.contentShell}>
          <ScrollView
            contentContainerStyle={styles.contentScrollFrame}
            style={styles.contentScroll}
          >
            <Stack gap="sm">
              {transportErrorMessage ? (
                <Card tone="warning">
                  <Stack gap="xs">
                    <Text variant="title">Connection interrupted</Text>
                    <Text>
                      The exam runtime could not confirm the latest server state. Use Retry
                      Sync to restore the governed session before continuing.
                    </Text>
                    <Text tone="muted">{transportErrorMessage}</Text>
                  </Stack>
                </Card>
              ) : null}

              {runtimeMessage ? (
                <Card tone="info">
                  <Stack gap="xs">
                    <Text variant="bodyStrong">Runtime notice</Text>
                    <Text>{runtimeMessage}</Text>
                  </Stack>
                </Card>
              ) : null}

              <Card tone={transitionLabel ? "info" : "surfaceRaised"}>
                <View style={styles.transitionPanel}>
                  <Stack gap="xxs" justify="center">
                    <Text variant="bodyStrong">
                      {transitionLabel ? "Transition in progress" : "Stage ready"}
                    </Text>
                    <Text>{transitionCopy}</Text>
                  </Stack>
                </View>
              </Card>

              {isReadOnly ? (
                <Card tone="surfaceRaised">
                  <View style={styles.statusPanel}>
                    <Stack gap="xs" justify="center">
                      <Text variant="title">Exam complete</Text>
                      <Text>
                        The governed session is now read-only. Interactive controls have been
                        removed.
                      </Text>
                      <MetadataRow
                        label="Result"
                        value={buildCompletionLabel(certificate)}
                        valueTone={certificate?.passed ? "success" : "primary"}
                      />
                      {certificate ? (
                        <>
                          <MetadataRow label="Level" value={certificate.level} />
                          <MetadataRow
                            label="Score"
                            value={certificate.overall_score.toString()}
                          />
                        </>
                      ) : null}
                    </Stack>
                  </View>
                </Card>
              ) : null}

              <View style={styles.stageRegion}>
                <Card>
                  <Stack gap="xs">
                    <Text variant="title">{currentView.title}</Text>
                    <Text>{currentView.prompt}</Text>
                    <MetadataRow
                      label="Section"
                      value={formatTokenLabel(currentView.section)}
                    />
                    <MetadataRow
                      label="Stage"
                      value={formatTokenLabel(currentView.kind)}
                    />
                    <MetadataRow
                      label="Answer status"
                      value={formatTokenLabel(currentView.answer_status)}
                    />
                    {renderInstructions(currentView.instructions)}
                  </Stack>
                </Card>

                {currentView.passage ? (
                  <Card tone="surfaceRaised">
                    <View style={styles.heroPanel}>
                      <Stack gap="sm">
                        <Text variant="title">Reading passage</Text>
                        <Text>
                          Read this passage in full before moving forward to the question
                          phase.
                        </Text>
                        <Text>{currentView.passage}</Text>
                        <Text tone="primary">
                          Continue only after you have finished reading.
                        </Text>
                      </Stack>
                    </View>
                  </Card>
                ) : null}

                {currentView.playback ? (
                  <Card tone={currentView.playback.ready ? "surfaceRaised" : "warning"}>
                    <View style={styles.heroPanel}>
                      <Stack gap="sm">
                        <Text variant="title">Listening prompt</Text>
                        <Text>
                          Listen first, then continue to the listening questions. The engine
                          controls replay availability.
                        </Text>
                        <View style={styles.statusBadge}>
                          <Text tone="primary">
                            {playbackStateLabel ?? "Prompt ready for playback."}
                          </Text>
                        </View>
                        <MetadataRow
                          label="Plays used"
                          value={`${currentView.playback.count}/${currentView.playback.limit}`}
                        />
                        <MetadataRow
                          label="Replay availability"
                          value={
                            listeningRemaining > 0
                              ? `${listeningRemaining} replay remaining`
                              : "No replay remaining"
                          }
                          valueTone={listeningRemaining > 0 ? "primary" : "muted"}
                        />
                        <MetadataRow
                          label="Audio state"
                          value={currentView.playback.ready ? "Pre-rendered and ready" : "Missing"}
                          valueTone={currentView.playback.ready ? "success" : "muted"}
                        />
                        {listeningAudio ? (
                          <>
                            <MetadataRow label="Audio asset" value={listeningAudio.id} />
                            <MetadataRow
                              label="Duration"
                              value={`${Math.round(listeningAudio.duration_ms / 1000)} sec`}
                            />
                          </>
                        ) : null}
                        <Text tone="muted">
                          Questions stay hidden until you continue from this prompt screen.
                        </Text>
                      </Stack>
                    </View>
                  </Card>
                ) : null}

                {currentView.question ? (
                  <Card>
                    <Stack gap="xs">
                      <Text variant="bodyStrong">Question</Text>
                      <Text>{currentView.question}</Text>
                    </Stack>
                  </Card>
                ) : null}

                {currentView.input_mode === "choice" ? (
                  <Card>
                    <Stack gap="xs">
                      <Text variant="bodyStrong">Select one answer</Text>
                      <Stack gap="xs">
                        {currentView.options.map((option, index) => {
                          const isSelected = selectedChoice === option;
                          const optionState =
                            currentView.response_locked
                              ? "locked"
                              : actionStates.option === "loading" && isSelected
                                ? "loading"
                                : actionStates.option === "loading"
                                  ? "locked"
                                  : "default";

                          return (
                            <Button
                              accessibilityLabel={option}
                              key={option}
                              disabled={busy || currentView.response_locked}
                              label={option}
                              onPress={() => onSelectChoice(option)}
                              state={optionState}
                              testID={`yki-option-${index}`}
                              tone={isSelected ? "primary" : "surface"}
                            />
                          );
                        })}
                      </Stack>
                    </Stack>
                  </Card>
                ) : null}

                {currentView.input_mode === "text" ? (
                  <Card>
                    <Stack gap="xs">
                      <Text variant="bodyStrong">Written response</Text>
                      <Input
                        editable={!busy && !currentView.response_locked && !isReadOnly}
                        multiline
                        onChangeText={onAnswerChange}
                        placeholder="Write your response"
                        testID="yki-written-response"
                        value={answerDraft}
                      />
                      <Text tone="muted">
                        Submitted answers lock immediately and the flow remains forward only.
                      </Text>
                    </Stack>
                  </Card>
                ) : null}

                {currentView.input_mode === "audio" ? (
                  <Card>
                    <Stack gap="xs">
                      <Text variant="bodyStrong">Recorded response</Text>
                      <MetadataRow
                        label="Max duration"
                        value={`${currentView.recording?.max_duration_seconds ?? 0} seconds`}
                      />
                      <MetadataRow
                        label="Recording state"
                        value={recording ? "Recording in progress" : "Ready to record"}
                        valueTone={recording ? "primary" : "default"}
                      />
                      <Text tone="muted">
                        Stop recording to submit immediately. Once submitted, the response is
                        locked.
                      </Text>
                    </Stack>
                  </Card>
                ) : null}

                {submittedValue ? (
                  <Card tone="surfaceMuted">
                    <Stack gap="xs">
                      <Text variant="bodyStrong">Submitted response</Text>
                      <Text>{submittedValue}</Text>
                    </Stack>
                  </Card>
                ) : null}
              </View>

              <Card>
                <View style={styles.statusPanel}>
                  <Stack gap="xs" justify="center">
                    <Text variant="title">Section locking</Text>
                    {sectionProgress.map((section) => (
                      <MetadataRow
                        key={section.section}
                        label={formatTokenLabel(section.section)}
                        value={`${section.completed_step_count}/${section.total_steps} ${formatTokenLabel(section.status)}`}
                      />
                    ))}
                  </Stack>
                </View>
              </Card>
            </Stack>
          </ScrollView>
        </View>
      }
      header={
        <Card>
          <Stack gap="xs">
            <Text variant="title">YKI Exam Runtime</Text>
            <MetadataRow label="Status" value={formatTokenLabel(examStatus)} />
            <MetadataRow
              label="Section progress"
              value={`${progress.completedSectionCount}/${progress.totalSectionCount}`}
            />
            <MetadataRow
              label="Step progress"
              value={`${progress.completedStepCount}/${progress.totalStepCount}`}
            />
            <MetadataRow label="Countdown" value={countdownLabel} />
            <MetadataRow label="Navigation" value="Forward only" valueTone="primary" />
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
  heroPanel: {
    justifyContent: "center",
    minHeight: componentSizes.exam.heroMinHeight,
  },
  stageRegion: {
    gap: spacing.sm,
    minHeight: componentSizes.exam.stageMinHeight,
  },
  statusBadge: {
    backgroundColor: colors.infoBackground,
    borderColor: colors.infoBorder,
    borderRadius: radius.small,
    borderWidth: 1,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
  },
  statusPanel: {
    justifyContent: "center",
    minHeight: componentSizes.exam.statusPanelMinHeight,
  },
  transitionPanel: {
    justifyContent: "center",
    minHeight: componentSizes.exam.transitionPanelMinHeight,
  },
});
