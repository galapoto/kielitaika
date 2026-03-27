import { useMemo } from "react";

import DebugPanel from "../../components/debug/DebugPanel";
import { TextAreaField } from "../../components/Field";
import ContentWrapper from "../../components/layout/ContentWrapper";
import ScreenContainer from "../../components/layout/ScreenContainer";
import { Panel } from "../../components/Panel";
import RuntimeGuard from "../../components/runtime/RuntimeGuard";
import { StatusBanner } from "../../components/StatusBanner";
import { Button } from "../../components/Button";
import { DEV_MODE } from "../../config/devMode";
import type { ExamRuntimeContract } from "../../types/exam";
import EmptyRuntimeState from "../components/EmptyRuntimeState";
import AudioPlayer from "../components/AudioPlayer";
import ExamHeader from "../components/ExamHeader";
import PromptMaterial from "../components/PromptMaterial";
import QuestionList from "../components/QuestionList";
import { useExamRuntimeState } from "../hooks/useExamRuntimeState";

type Props = {
  runtime: ExamRuntimeContract | null;
  onRuntimeChange: (runtime: ExamRuntimeContract | null) => void;
  onExit: () => void;
  onComplete: () => void;
};

function sectionLabel(value: string | undefined): string {
  if (!value) {
    return "YKI Exam";
  }
  return value.charAt(0).toUpperCase() + value.slice(1);
}

function formatRecordingTime(durationMs: number | null): string {
  if (!durationMs) {
    return "0.0s";
  }
  return `${(durationMs / 1000).toFixed(1)}s`;
}

export function ExamRuntimeScreen({ runtime, onRuntimeChange, onExit, onComplete }: Props) {
  const {
    runtime: activeRuntime,
    validationError,
    currentEntry,
    currentItem,
    currentIndex,
    items,
    busy,
    error,
    objectiveAnswers,
    writingAnswer,
    serverAnsweredCount,
    selectAnswer,
    updateWritingAnswer,
    goNext,
    goPrevious,
    canGoPrevious,
    canGoNext,
    recorderState,
    recorderAudioUrl,
    recorderDurationMs,
    recorderError,
    startRecording,
    stopRecording,
    resetRecording,
    submitCurrentSpeaking,
    speakingSubmitted,
  } = useExamRuntimeState({
    runtime,
    onRuntimeChange,
    onComplete,
  });

  const progressText = useMemo(() => {
    if (!activeRuntime || !items.length) {
      return "0 / 0";
    }
    return `${currentIndex + 1} / ${items.length} items`;
  }, [activeRuntime, currentIndex, items.length]);

  return (
    <>
      <div className="screen-shell yki-flow-screen">
        <ScreenContainer className="yki-runtime-screen">
          <ContentWrapper className="exam-content">
            <RuntimeGuard
              condition={Boolean(activeRuntime && currentEntry && currentItem)}
              fallback={
                <EmptyRuntimeState
                  message={validationError || "The exam runtime is not available right now."}
                  actionLabel="Back to intro"
                  onAction={onExit}
                />
              }
            >
              {activeRuntime && currentEntry && currentItem ? (
                <>
                  <ExamHeader
                    title={activeRuntime.level ? `${activeRuntime.level} Exam Runtime` : "YKI Exam Runtime"}
                    sectionLabel={sectionLabel(currentEntry.sectionType)}
                    progressText={progressText}
                    onExit={onExit}
                    disabled={busy}
                  />

                  <StatusBanner
                    tone="neutral"
                    title="Interactive v3 runtime"
                    message={`Progress ${serverAnsweredCount} / ${activeRuntime.progress.total}. Navigate item by item and submit answers through the live session API.`}
                  />

                  {error ? <StatusBanner tone="error" title="Interaction error" message={error} /> : null}

                  <Panel
                    className="flow-panel primary-card"
                    title={`${sectionLabel(currentEntry.sectionType)} item ${currentItem.index + 1}`}
                    subtitle={`Section ${currentEntry.sectionIndex + 1} of ${activeRuntime.sections.length}`}
                  >
                    <div className="runtime-screen">
                      <PromptMaterial prompt={currentItem.prompt} />

                      {currentItem.questions?.length ? (
                        <QuestionList
                          questions={currentItem.questions}
                          answers={objectiveAnswers}
                          onSelect={selectAnswer}
                          disabled={busy}
                        />
                      ) : null}

                      {currentEntry.sectionType === "writing" ? (
                        <TextAreaField
                          label="Your answer"
                          value={writingAnswer}
                          onChange={(event) => updateWritingAnswer(event.target.value)}
                          rows={10}
                        />
                      ) : null}

                      {currentEntry.sectionType === "speaking" ? (
                        <div className="runtime-speaking-block">
                          {currentItem.conversation?.length ? (
                            <Panel
                              className="secondary-card"
                              title="Conversation Turns"
                              subtitle="Play the scripted turns, then record your reply."
                            >
                              <div className="prompt-material">
                                {currentItem.conversation.map((turn) => (
                                  <div key={turn.turn_id} className="field">
                                    <span className="field-label">
                                      <span>{turn.speaker === "user" ? "Your reply" : `Turn ${turn.speaker}`}</span>
                                    </span>
                                    {turn.audio_url ? <AudioPlayer src={turn.audio_url} /> : null}
                                    {turn.text ? <p className="muted">{turn.text}</p> : null}
                                  </div>
                                ))}
                              </div>
                            </Panel>
                          ) : null}

                          <Panel
                            className="secondary-card"
                            title="Speaking Recording"
                            subtitle={`Record between ${currentItem.recording?.min_duration_sec || 0}s and ${currentItem.recording?.max_duration_sec || 0}s.`}
                          >
                            <div className="actions-row">
                              <Button
                                tone={recorderState === "recording" ? "secondary" : "primary"}
                                onClick={recorderState === "recording" ? stopRecording : startRecording}
                                disabled={busy}
                              >
                                {recorderState === "recording" ? "Stop recording" : "Record answer"}
                              </Button>
                              <Button tone="ghost" onClick={resetRecording} disabled={busy}>
                                Reset
                              </Button>
                              <Button onClick={() => void submitCurrentSpeaking()} disabled={busy || !recorderAudioUrl || speakingSubmitted}>
                                {speakingSubmitted ? "Submitted" : "Submit recording"}
                              </Button>
                            </div>
                            <p className="muted">Timer: {formatRecordingTime(recorderDurationMs)}</p>
                            {recorderAudioUrl ? <AudioPlayer src={recorderAudioUrl} /> : null}
                            {recorderError ? <StatusBanner tone="error" title="Recorder error" message={recorderError} /> : null}
                            {speakingSubmitted ? (
                              <StatusBanner
                                tone="success"
                                title="Speaking response saved"
                                message="The recording was accepted by the session API. You can continue to the next item."
                              />
                            ) : null}
                          </Panel>
                        </div>
                      ) : null}

                      <div className="actions-row">
                        <Button tone="secondary" onClick={goPrevious} disabled={busy || !canGoPrevious}>
                          Previous
                        </Button>
                        <Button onClick={() => void goNext()} disabled={busy}>
                          {busy ? "Saving..." : canGoNext ? "Next" : "Submit exam"}
                        </Button>
                      </div>
                    </div>
                  </Panel>
                </>
              ) : null}
            </RuntimeGuard>
          </ContentWrapper>
        </ScreenContainer>
      </div>

      {DEV_MODE ? <DebugPanel data={{ runtime: activeRuntime, currentIndex, currentItem }} /> : null}
    </>
  );
}
