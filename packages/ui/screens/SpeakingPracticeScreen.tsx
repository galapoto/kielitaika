import Button from "../primitives/Button";
import Card from "../primitives/Card";
import Input from "../primitives/Input";
import Row from "../primitives/Row";
import ScreenContainer from "../primitives/ScreenContainer";
import Stack from "../primitives/Stack";
import Text from "../primitives/Text";

type Prompt = {
  id: string;
  title: string;
  prompt_text: string;
  response_guidance: string;
  answer_status: "pending" | "answered";
  prompt_audio: {
    asset_id: string;
    url: string;
    duration_ms: number;
    ready: boolean;
  };
} | null;

type LatestResult = {
  prompt_id: string;
  correct: boolean;
  submitted_transcript: string;
  expected_response: string;
  difference: string | null;
  evaluation_mode: string;
  recording_captured: boolean;
  capture_mode: "recording_with_transcript" | "transcript_only";
} | null;

type Props = {
  accuracy: number;
  audioPlaying: boolean;
  completedCount: number;
  currentPrompt: Prompt;
  errorMessage: string | null;
  latestResult: LatestResult;
  loading: boolean;
  promptServed: number;
  recordingError: string | null;
  recordingState: "idle" | "recorded" | "recording";
  sessionComplete: boolean;
  totalCount: number;
  transcriptDraft: string;
  onBack: () => void;
  onNext: () => void;
  onOpenLearning: () => void;
  onPlayPrompt: () => void;
  onRetry: () => void;
  onStartRecording: () => void;
  onStopRecording: () => void;
  onSubmit: () => void;
  onTranscriptChange: (value: string) => void;
};

function formatPercent(value: number) {
  return `${Math.round(value * 100)}%`;
}

function formatRecordingState(value: "idle" | "recorded" | "recording") {
  if (value === "recording") {
    return "Recording in progress";
  }

  if (value === "recorded") {
    return "Recording captured";
  }

  return "Transcript only";
}

export default function SpeakingPracticeScreen({
  accuracy,
  audioPlaying,
  completedCount,
  currentPrompt,
  errorMessage,
  latestResult,
  loading,
  promptServed,
  recordingError,
  recordingState,
  sessionComplete,
  totalCount,
  transcriptDraft,
  onBack,
  onNext,
  onOpenLearning,
  onPlayPrompt,
  onRetry,
  onStartRecording,
  onStopRecording,
  onSubmit,
  onTranscriptChange,
}: Props) {
  const canSubmit =
    currentPrompt !== null &&
    currentPrompt.answer_status === "pending" &&
    transcriptDraft.trim() !== "";

  return (
    <ScreenContainer
      actions={
        <Stack gap="xs">
          {sessionComplete ? (
            <Button label="Open Learning" onPress={onOpenLearning} />
          ) : currentPrompt?.answer_status === "answered" ? (
            <Button
              disabled={loading}
              label="Next Prompt"
              onPress={onNext}
              state={loading ? "loading" : "default"}
            />
          ) : (
            <Button
              disabled={loading || !canSubmit}
              label="Submit Response"
              onPress={onSubmit}
              state={loading ? "loading" : "default"}
            />
          )}
          {errorMessage ? <Button label="Retry" onPress={onRetry} tone="surface" /> : null}
          <Button label="Back Home" onPress={onBack} tone="surface" />
        </Stack>
      }
      content={
        <Stack gap="sm">
          {errorMessage ? (
            <Card tone="warning">
              <Stack gap="xs">
                <Text variant="title">Speaking practice unavailable</Text>
                <Text>{errorMessage}</Text>
              </Stack>
            </Card>
          ) : null}

          {sessionComplete ? (
            <Card tone="surfaceRaised">
              <Stack gap="xs">
                <Text variant="title">Session complete</Text>
                <Text>
                  Speaking practice is complete for this session. Review the structured feedback or
                  return to learning.
                </Text>
                <Row justify="space-between">
                  <Text tone="muted">Attempts</Text>
                  <Text>{completedCount}</Text>
                </Row>
                <Row justify="space-between">
                  <Text tone="muted">Accuracy</Text>
                  <Text tone="primary">{formatPercent(accuracy)}</Text>
                </Row>
              </Stack>
            </Card>
          ) : currentPrompt ? (
            <>
              <Card>
                <Stack gap="sm">
                  <Stack gap="xs">
                    <Text variant="title">{currentPrompt.title}</Text>
                    <Text>{currentPrompt.prompt_text}</Text>
                    <Text tone="muted">{currentPrompt.response_guidance}</Text>
                  </Stack>
                </Stack>
              </Card>

              <Card>
                <Stack gap="xs">
                  <Text variant="title">Prompt Audio</Text>
                  <Row justify="space-between">
                    <Text tone="muted">Asset status</Text>
                    <Text>{currentPrompt.prompt_audio.ready ? "Ready" : "Missing"}</Text>
                  </Row>
                  <Row justify="space-between">
                    <Text tone="muted">Duration</Text>
                    <Text>{currentPrompt.prompt_audio.duration_ms} ms</Text>
                  </Row>
                  <Button
                    disabled={loading || !currentPrompt.prompt_audio.ready || recordingState === "recording"}
                    label={audioPlaying ? "Playing Prompt" : "Play Prompt"}
                    onPress={onPlayPrompt}
                    state={audioPlaying ? "loading" : "default"}
                    tone="surface"
                  />
                </Stack>
              </Card>

              <Card>
                <Stack gap="xs">
                  <Text variant="title">Response Capture</Text>
                  <Row justify="space-between">
                    <Text tone="muted">Capture mode</Text>
                    <Text>{formatRecordingState(recordingState)}</Text>
                  </Row>
                  <Stack gap="xs">
                    {recordingState === "recording" ? (
                      <Button
                        disabled={loading}
                        label="Stop Recording"
                        onPress={onStopRecording}
                        tone="surface"
                      />
                    ) : (
                      <Button
                        disabled={loading || currentPrompt.answer_status === "answered"}
                        label="Start Recording"
                        onPress={onStartRecording}
                        tone="surface"
                        state={currentPrompt.answer_status === "answered" ? "locked" : "default"}
                      />
                    )}
                    <Input
                      editable={!loading && currentPrompt.answer_status === "pending"}
                      multiline
                      onChangeText={onTranscriptChange}
                      placeholder="Type the transcript of what you said"
                      value={transcriptDraft}
                    />
                    {recordingError ? <Text tone="error">{recordingError}</Text> : null}
                  </Stack>
                </Stack>
              </Card>
            </>
          ) : (
            <Card>
              <Text tone="muted">Preparing speaking prompts.</Text>
            </Card>
          )}

          {latestResult ? (
            <Card tone={latestResult.correct ? "info" : "warning"}>
              <Stack gap="xs">
                <Text variant="title">{latestResult.correct ? "Correct" : "Incorrect"}</Text>
                <Row justify="space-between">
                  <Text tone="muted">Your transcript</Text>
                  <Text>{latestResult.submitted_transcript || "No transcript"}</Text>
                </Row>
                <Row justify="space-between">
                  <Text tone="muted">Expected response</Text>
                  <Text>{latestResult.expected_response}</Text>
                </Row>
                <Row justify="space-between">
                  <Text tone="muted">Capture</Text>
                  <Text>
                    {latestResult.recording_captured
                      ? "Recording with transcript"
                      : "Transcript only"}
                  </Text>
                </Row>
                {latestResult.difference ? <Text>{latestResult.difference}</Text> : null}
                <Text tone="muted">Evaluation: {latestResult.evaluation_mode}</Text>
              </Stack>
            </Card>
          ) : null}
        </Stack>
      }
      header={
        <Card>
          <Stack gap="xs">
            <Text variant="title">Speaking Practice</Text>
            <Row justify="space-between">
              <Text tone="muted">Prompts served</Text>
              <Text>
                {promptServed}/{totalCount}
              </Text>
            </Row>
            <Row justify="space-between">
              <Text tone="muted">Attempts</Text>
              <Text>{completedCount}</Text>
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
