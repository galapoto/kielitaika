import { useEffect, useMemo, useRef, useState } from "react";
import { ArrowRight, CheckCheck, CircleStop, RotateCcw } from "lucide-react";

import { Button } from "../components/Button";
import { TextAreaField } from "../components/Field";
import { Panel } from "../components/Panel";
import { ScreenScaffold } from "../components/ScreenScaffold";
import { StatusBanner } from "../components/StatusBanner";
import { useRecorder } from "../hooks/useRecorder";
import { saveYkiCache } from "../services/storage";
import { uploadVoiceTranscription } from "../services/voiceService";
import {
  fetchYkiSession,
  requestYkiReply,
  startYkiConversation,
  submitYkiAnswer,
  submitYkiAudio,
  submitYkiConversationTurn,
  submitYkiExam,
  submitYkiWriting,
} from "../services/ykiService";

function formatSectionLabel(value: string | null | undefined): string {
  if (!value) {
    return "unknown";
  }
  return value
    .split("_")
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}

function splitReadingText(value: string | null | undefined): string[] {
  if (!value) {
    return [];
  }
  return value
    .split(/\n\s*\n/)
    .map((part) => part.trim())
    .filter(Boolean);
}

function extractConversationEntries(conversationState: any): Array<{ key: string; speaker: string; text: string }> {
  const candidate =
    (Array.isArray(conversationState?.responses) && conversationState.responses) ||
    (Array.isArray(conversationState?.turns) && conversationState.turns) ||
    (Array.isArray(conversationState?.conversation?.turns) && conversationState.conversation.turns) ||
    [];

  return candidate
    .map((item: any, index: number) => ({
      key: item.turn_id || item.response_id || `${index}`,
      speaker: item.speaker || item.role || (index % 2 === 0 ? "SYSTEM" : "USER"),
      text: item.reply_text || item.text || item.transcript_text || item.prompt_text || item.message || "",
    }))
    .filter((item: { text: string }) => Boolean(item.text));
}

function formatRecorderState(state: string): string {
  if (state === "recording") {
    return "Recording";
  }
  if (state === "stopped") {
    return "Captured";
  }
  if (state === "error") {
    return "Error";
  }
  return "Idle";
}

function formatConversationSpeaker(value: string): string {
  if (value === "USER") {
    return "You";
  }
  if (value === "SYSTEM") {
    return "Guide";
  }
  return value;
}

function readCurrentScreen(runtime: any, screenIndex: number) {
  if (screenIndex < 0) {
    return null;
  }
  return runtime?.screens?.[screenIndex] || null;
}

function readRuntimeMetadata(runtime: any) {
  return runtime?.metadata || {};
}

function screenIsConfirmed(runtime: any, screen: any): boolean {
  if (!screen) {
    return true;
  }
  const payload = screen.payload || {};
  const metadata = readRuntimeMetadata(runtime);
  const answers = metadata.answers || {};
  const writingAnswers = metadata.writing_answers || {};
  const audioAnswers = metadata.audio_answers || {};
  const speakingRuntime = metadata.speaking_runtime || {};

  if (payload.questions?.length) {
    return payload.questions.every((question: any) => question.answer_id in answers);
  }
  if (screen.screen_type === "writing_response") {
    return Boolean(writingAnswers[payload.task_id]);
  }
  if (screen.screen_type === "speaking_task") {
    if (payload.speaking_mode === "conversation") {
      const state = speakingRuntime[payload.task_id];
      return Boolean(state && (state.completed || (Array.isArray(state.responses) && state.responses.length > 0)));
    }
    return Boolean(audioAnswers[payload.task_id]);
  }
  return true;
}

function findCurrentScreenIndex(runtime: any): number {
  const screens = runtime?.screens || [];
  return screens.findIndex((screen: any) => !screenIsConfirmed(runtime, screen));
}

function extractCurrentScreenKey(runtime: any): string {
  const index = findCurrentScreenIndex(runtime);
  return readCurrentScreen(runtime, index)?.payload?.id || "runtime-complete";
}

function readPromptContext(runtime: any, currentScreenIndex: number): any | null {
  if (currentScreenIndex <= 0) {
    return null;
  }
  const screens = runtime?.screens || [];
  const prompt = screens[currentScreenIndex - 1];
  const current = screens[currentScreenIndex];
  if (!prompt || !String(prompt.screen_type || "").endsWith("_prompt")) {
    return null;
  }
  if (prompt?.payload?.task_id && current?.payload?.task_id && prompt.payload.task_id !== current.payload.task_id) {
    return null;
  }
  return prompt;
}

function extractConfirmedAnswers(runtime: any): Record<string, unknown> {
  const metadata = readRuntimeMetadata(runtime);
  return {
    ...(metadata.answers || {}),
    ...(metadata.writing_answers || {}),
    ...(metadata.audio_answers || {}),
    ...(metadata.speaking_runtime || {}),
  };
}

function buildRuntimeGuardSignature(runtime: any): string {
  const metadata = readRuntimeMetadata(runtime);
  return JSON.stringify({
    answers: metadata.answers || {},
    writing_answers: metadata.writing_answers || {},
    audio_answers: metadata.audio_answers || {},
    speaking_runtime: metadata.speaking_runtime || {},
    completed: metadata.completed || false,
  });
}

export function YkiExamScreen(props: {
  runtime: any | null;
  onRuntimeChange: (runtime: any | null) => void;
  onBackToIntro: () => void;
  onComplete: () => void;
}) {
  const recorder = useRecorder();
  const [writingDraft, setWritingDraft] = useState("");
  const [conversationState, setConversationState] = useState<any | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const flowGuardRef = useRef<{ sessionId: string; signature: string; screenKey: string } | null>(null);
  const runtime = props.runtime;
  const screenIndex = useMemo(() => findCurrentScreenIndex(runtime), [runtime]);
  const currentScreen = readCurrentScreen(runtime, screenIndex);
  const promptContext = readPromptContext(runtime, screenIndex);
  const submittedAnswers = useMemo(() => extractConfirmedAnswers(runtime), [runtime]);
  const activeSectionLabel = formatSectionLabel(runtime?.metadata?.timing?.active_section || null);
  const promptParagraphs = splitReadingText(promptContext?.payload?.materials?.text);
  const currentParagraphs = splitReadingText(currentScreen?.payload?.materials?.text);
  const conversationEntries = extractConversationEntries(conversationState);

  async function syncRuntime(sessionId: string): Promise<boolean> {
    const response = await fetchYkiSession(sessionId);
    if (!response.ok) {
      setError(response.error.message);
      return false;
    }
    props.onRuntimeChange(response.data.runtime);
    return true;
  }

  useEffect(() => {
    if (!runtime) {
      return;
    }
    saveYkiCache({
      schema_version: "1",
      exam_session_id: runtime.session_id,
      level_band: runtime.metadata?.level_band || "B1_B2",
      current_screen_key: extractCurrentScreenKey(runtime),
      runtime_contract_version: runtime.runtime_schema_version || "unknown",
      answers: submittedAnswers,
      saved_at: new Date().toISOString(),
    });
  }, [runtime, submittedAnswers]);

  useEffect(() => {
    if (!currentScreen || currentScreen.screen_type !== "speaking_task" || currentScreen.payload?.speaking_mode !== "conversation") {
      return;
    }
    const speakingRuntime = readRuntimeMetadata(runtime).speaking_runtime || {};
    if (speakingRuntime[currentScreen.payload.task_id]) {
      setConversationState(speakingRuntime[currentScreen.payload.task_id]);
    }
  }, [currentScreen, runtime]);

  useEffect(() => {
    if (!runtime) {
      flowGuardRef.current = null;
      return;
    }
    const nextState = {
      sessionId: runtime.session_id,
      signature: buildRuntimeGuardSignature(runtime),
      screenKey: extractCurrentScreenKey(runtime),
    };
    if (
      flowGuardRef.current &&
      flowGuardRef.current.sessionId === nextState.sessionId &&
      flowGuardRef.current.signature === nextState.signature &&
      flowGuardRef.current.screenKey !== nextState.screenKey
    ) {
      setError("The exam changed unexpectedly. Please exit and reopen the exam before continuing.");
    }
    flowGuardRef.current = nextState;
  }, [runtime]);

  async function submitQuestion(question: any, choice: string) {
    if (!runtime) {
      return;
    }
    setBusy(true);
    setError(null);
    const response = await submitYkiAnswer(runtime.session_id, { answer_id: question.answer_id, answer: choice });
    if (response.ok) {
      await syncRuntime(runtime.session_id);
    } else {
      setError(response.error.message);
    }
    setBusy(false);
  }

  async function submitWriting(taskId: string) {
    if (!runtime) {
      return;
    }
    setBusy(true);
    setError(null);
    const response = await submitYkiWriting(runtime.session_id, { task_id: taskId, text: writingDraft });
    if (response.ok) {
      await syncRuntime(runtime.session_id);
    } else {
      setError(response.error.message);
    }
    setBusy(false);
  }

  async function submitSpeakingTask(screenPayload: any) {
    if (!runtime || !recorder.audioBlob) {
      return;
    }
    setBusy(true);
    setError(null);
    const sttResponse = await uploadVoiceTranscription({
      blob: recorder.audioBlob,
      fileName: "yki-speaking.webm",
      mimeType: recorder.audioBlob.type || "audio/webm",
      durationMs: recorder.durationMs,
      sessionId: runtime.session_id,
      speakingSessionId: null,
      turnId: screenPayload.conversation?.turns?.[screenPayload.conversation.turns.length - 1]?.turn_id || null,
      taskId: screenPayload.task_id,
      mode: "yki_exam",
      locale: "fi-FI",
    });
    if (!sttResponse.ok) {
      setError(sttResponse.error.message);
      setBusy(false);
      return;
    }
    if (!sttResponse.data.ok || !sttResponse.data.audio_ref) {
      setError("We could not read that recording clearly. Please record the answer again.");
      setBusy(false);
      return;
    }

    if (screenPayload.speaking_mode === "conversation") {
      if (!conversationState) {
        const startConversationResponse = await startYkiConversation(runtime.session_id, { task_id: screenPayload.task_id });
        if (!startConversationResponse.ok) {
          setError(startConversationResponse.error.message);
          setBusy(false);
          return;
        }
        setConversationState(startConversationResponse.data);
      }
      const latestTurnId =
        conversationState?.turn_id ||
        screenPayload.conversation?.turns?.[screenPayload.conversation.turns.length - 1]?.turn_id ||
        "turn_1";
      const turnResponse = await submitYkiConversationTurn(runtime.session_id, {
        task_id: screenPayload.task_id,
        turn_id: latestTurnId,
        audio_ref: sttResponse.data.audio_ref,
        transcript_text: sttResponse.data.transcript || null,
      });
      if (!turnResponse.ok) {
        setError(turnResponse.error.message);
        setBusy(false);
        return;
      }
      setConversationState(turnResponse.data);
      const replyResponse = await requestYkiReply(runtime.session_id, { task_id: screenPayload.task_id });
      if (replyResponse.ok) {
        setConversationState(replyResponse.data);
        await syncRuntime(runtime.session_id);
      } else {
        setError(replyResponse.error.message);
      }
    } else {
      const audioResponse = await submitYkiAudio(runtime.session_id, {
        task_id: screenPayload.task_id,
        audio_ref: sttResponse.data.audio_ref,
      });
      if (audioResponse.ok) {
        await syncRuntime(runtime.session_id);
      } else {
        setError(audioResponse.error.message);
      }
    }
    setBusy(false);
  }

  async function finishExam(confirmIncomplete: boolean) {
    if (!runtime) {
      return;
    }
    setBusy(true);
    setError(null);
    const response = await submitYkiExam(runtime.session_id, { confirm_incomplete: confirmIncomplete });
    if (!response.ok) {
      setError(response.error.message);
      setBusy(false);
      return;
    }
    const synced = await syncRuntime(runtime.session_id);
    setBusy(false);
    if (synced) {
      props.onComplete();
    }
  }

  if (!runtime) {
    return (
      <ScreenScaffold
        className="yki-flow-screen"
        header={
          <div className="screen-heading">
            <span className="eyebrow">YKI Exam</span>
            <h1 className="hero-title">No exam in progress</h1>
            <p className="hero-subtitle">Start a new exam or continue a saved one from the exam home screen.</p>
          </div>
        }
        actions={
          <div className="actions-row">
            <Button onClick={props.onBackToIntro}>
              <RotateCcw size={16} aria-hidden="true" />
              Go to exam home
            </Button>
          </div>
        }
      >
        <Panel className="flow-panel primary-card">
          <span className="eyebrow">Ready to begin</span>
          <p className="hero-subtitle">Choose your level and start the exam from the YKI intro screen.</p>
        </Panel>
      </ScreenScaffold>
    );
  }

  const runtimeAction =
    currentScreen?.screen_type === "writing_response" ? (
      <Button onClick={() => submitWriting(currentScreen.payload.task_id)} disabled={busy || !writingDraft}>
        <ArrowRight size={16} aria-hidden="true" />
        Submit writing
      </Button>
    ) : currentScreen?.screen_type === "speaking_task" ? (
      <Button onClick={() => submitSpeakingTask(currentScreen.payload)} disabled={busy || !recorder.audioBlob}>
        <ArrowRight size={16} aria-hidden="true" />
        Submit speaking response
      </Button>
    ) : null;

  return (
    <ScreenScaffold
      className="yki-flow-screen"
      header={
        <div className="flow-header">
          <div>
            <span className="eyebrow">YKI Exam</span>
            <h1 className="hero-title">{currentScreen?.payload?.title || "Continue your exam"}</h1>
            <p className="hero-subtitle">
              {activeSectionLabel}
              {screenIndex >= 0 ? ` · Stage ${screenIndex + 1} of ${runtime.screens.length}` : " · All stages complete"}
            </p>
          </div>
          <Button tone="secondary" onClick={props.onBackToIntro} disabled={busy}>
            <CircleStop size={16} aria-hidden="true" />
            Exit exam
          </Button>
        </div>
      }
      actions={
        <div className="actions-row">
          {runtimeAction}
          <Button onClick={() => finishExam(false)} disabled={busy}>
            <CheckCheck size={16} aria-hidden="true" />
            Finish exam
          </Button>
          <Button tone="secondary" onClick={() => finishExam(true)} disabled={busy}>
            Finish with unanswered tasks
          </Button>
          {screenIndex < 0 ? (
            <Button tone="secondary" onClick={props.onComplete} disabled={busy}>
              View results
            </Button>
          ) : null}
        </div>
      }
    >
      <Panel className="flow-panel primary-card">
        {error ? <StatusBanner tone="error" title="Exam error" message={error} /> : null}

        {promptContext ? (
          <div className="runtime-screen reading-stage">
            {promptParagraphs.length ? (
              <div className="reading-passages">
                <span className="eyebrow">Read first</span>
                {promptParagraphs.map((paragraph, index) => (
                  <p key={`${promptContext.payload?.id || promptContext.screen_type}-${index}`} className="reading-paragraph">
                    {paragraph}
                  </p>
                ))}
              </div>
            ) : null}
            {promptContext.payload?.audio_url ? <audio className="audio-player" src={promptContext.payload.audio_url} controls /> : null}
          </div>
        ) : null}

        {currentScreen ? (
          <div className="runtime-screen">
            {currentParagraphs.length ? (
              <div className="reading-passages">
                <span className="eyebrow">Material</span>
                {currentParagraphs.map((paragraph, index) => (
                  <p key={`${currentScreen.payload?.id || currentScreen.screen_type}-${index}`} className="reading-paragraph">
                    {paragraph}
                  </p>
                ))}
              </div>
            ) : null}
            {currentScreen.payload?.audio_url ? <audio className="audio-player" src={currentScreen.payload.audio_url} controls /> : null}

            {currentScreen.payload?.questions?.length ? (
              <div className="question-list">
                {currentScreen.payload.questions.map((question: any) => (
                  <div className="question-card" key={question.answer_id}>
                    <strong>{question.prompt}</strong>
                    <div className="option-grid">
                      {question.options.map((option: string) => (
                        <Button
                          key={`${question.answer_id}-${option}`}
                          tone={submittedAnswers[question.answer_id] === option ? "primary" : "secondary"}
                          className="option-button"
                          onClick={() => submitQuestion(question, option)}
                          disabled={busy}
                        >
                          {option}
                        </Button>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            ) : null}

            {currentScreen.screen_type === "writing_response" ? (
              <>
                <TextAreaField label="Your answer" value={writingDraft} onChange={(event) => setWritingDraft(event.target.value)} />
              </>
            ) : null}

            {currentScreen.screen_type === "speaking_task" ? (
              <>
                <div className="screen-hero">
                  <div>
                    <span className="eyebrow">Speaking task</span>
                    <h2>{formatSectionLabel(currentScreen.payload.speaking_mode)}</h2>
                    <p className="muted">{currentScreen.payload.prompt_text}</p>
                  </div>
                  <button
                    type="button"
                    className={recorder.state === "recording" ? "mic-button recording" : "mic-button"}
                    disabled={busy}
                    onClick={recorder.state === "recording" ? recorder.stopRecording : recorder.startRecording}
                  >
                    {recorder.state === "recording" ? "Stop" : "Record"}
                  </button>
                </div>
                <div className="recorder-status-row">
                  <span className={`state-pill ${recorder.state}`}>{formatRecorderState(recorder.state)}</span>
                  <span className="muted">
                    {recorder.durationMs ? `${(recorder.durationMs / 1000).toFixed(1)}s captured` : "Press record, speak, then submit once."}
                  </span>
                </div>
                {recorder.audioUrl ? <audio className="audio-player" src={recorder.audioUrl} controls /> : null}
                {recorder.error ? <StatusBanner tone="error" title="Recording error" message={recorder.error} /> : null}
                {conversationEntries.length ? (
                  <div className="transcript-stack">
                    <span className="eyebrow">Conversation so far</span>
                    {conversationEntries.map((entry) => (
                      <div key={entry.key} className={entry.speaker === "USER" ? "chat-bubble user" : "chat-bubble"}>
                        <strong>{formatConversationSpeaker(entry.speaker)}</strong>
                        <p>{entry.text}</p>
                      </div>
                    ))}
                  </div>
                ) : null}
              </>
            ) : null}
          </div>
        ) : (
          <div className="runtime-screen">
            <div className="reading-passages">
              <span className="eyebrow">Exam complete</span>
              <p className="reading-paragraph">All tasks are complete. Continue to the results screen when you are ready.</p>
            </div>
          </div>
        )}
      </Panel>
    </ScreenScaffold>
  );
}
