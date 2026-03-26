import { useEffect, useMemo, useRef, useState } from "react";

import { Button } from "../components/Button";
import { TextAreaField } from "../components/Field";
import { JsonPreview } from "../components/JsonPreview";
import { Panel } from "../components/Panel";
import { StatusBanner } from "../components/StatusBanner";
import { useRecorder } from "../hooks/useRecorder";
import { saveYkiCache } from "../services/storage";
import { uploadVoiceTranscription } from "../services/voiceService";
import {
  fetchYkiCertificate,
  fetchYkiSession,
  requestYkiReply,
  startYkiConversation,
  startYkiSession,
  submitYkiAnswer,
  submitYkiAudio,
  submitYkiConversationTurn,
  submitYkiExam,
  submitYkiWriting,
} from "../services/ykiService";

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

function extractEngineSessionToken(runtime: any): string {
  return runtime?.metadata?.engine_session_token || "";
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

export function YkiExamScreen(props: { restoredRuntime: any | null }) {
  const recorder = useRecorder();
  const [levelBand, setLevelBand] = useState<"A1_A2" | "B1_B2" | "C1_C2">("A1_A2");
  const [runtime, setRuntime] = useState<any | null>(props.restoredRuntime);
  const [writingDraft, setWritingDraft] = useState("");
  const [conversationState, setConversationState] = useState<any | null>(null);
  const [certificate, setCertificate] = useState<any | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const flowGuardRef = useRef<{ sessionId: string; signature: string; screenKey: string } | null>(null);
  const screenIndex = useMemo(() => findCurrentScreenIndex(runtime), [runtime]);
  const currentScreen = readCurrentScreen(runtime, screenIndex);
  const promptContext = readPromptContext(runtime, screenIndex);
  const submittedAnswers = useMemo(() => extractConfirmedAnswers(runtime), [runtime]);

  async function syncRuntime(sessionId: string): Promise<boolean> {
    const response = await fetchYkiSession(sessionId);
    if (!response.ok) {
      setError(response.error.message);
      return false;
    }
    setRuntime(response.data.runtime);
    return true;
  }

  useEffect(() => {
    if (!runtime) {
      return;
    }
    saveYkiCache({
      schema_version: "1",
      exam_session_id: runtime.session_id,
      engine_session_token: extractEngineSessionToken(runtime),
      level_band: levelBand,
      current_screen_key: extractCurrentScreenKey(runtime),
      runtime_contract_version: runtime.runtime_schema_version || "unknown",
      answers: submittedAnswers,
      saved_at: new Date().toISOString(),
    });
  }, [levelBand, runtime, submittedAnswers]);

  useEffect(() => {
    if (props.restoredRuntime) {
      setRuntime(props.restoredRuntime);
    }
  }, [props.restoredRuntime]);

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
      const message = "YKI flow guardrail triggered: screen changed without backend state update.";
      console.error(message, { previous: flowGuardRef.current, next: nextState });
      setError(message);
    }
    flowGuardRef.current = nextState;
  }, [runtime]);

  async function start() {
    setBusy(true);
    setError(null);
    const response = await startYkiSession({ level_band: levelBand });
    if (!response.ok) {
      setError(response.error.message);
      setBusy(false);
      return;
    }
    setRuntime(response.data.runtime);
    setWritingDraft("");
    setConversationState(null);
    setCertificate(null);
    setBusy(false);
  }

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

  async function submitExam(confirmIncomplete: boolean) {
    if (!runtime) {
      return;
    }
    setBusy(true);
    setError(null);
    const response = await submitYkiExam(runtime.session_id, { confirm_incomplete: confirmIncomplete });
    if (response.ok) {
      await syncRuntime(runtime.session_id);
    } else {
      setError(response.error.message);
    }
    setBusy(false);
  }

  async function loadCertificate() {
    if (!runtime) {
      return;
    }
    const response = await fetchYkiCertificate(runtime.session_id);
    if (response.ok) {
      setCertificate(response.data);
    } else {
      setError(response.error.message);
    }
  }

  return (
    <div className="screen-stack">
      <Panel title="YKI Exam Runtime" subtitle="Runtime order is fixed by backend adapter output. The UI renders the first unconfirmed engine screen only.">
        <div className="grid-two">
          <label className="field">
            <span>Level band</span>
            <select value={levelBand} onChange={(event) => setLevelBand(event.target.value as "A1_A2" | "B1_B2" | "C1_C2")}>
              <option value="A1_A2">A1_A2</option>
              <option value="B1_B2">B1_B2</option>
              <option value="C1_C2">C1_C2</option>
            </select>
          </label>
          <div className="actions-row">
            <Button onClick={start} disabled={busy}>
              {busy ? "Starting..." : "Start exam"}
            </Button>
          </div>
        </div>
        {error ? <StatusBanner tone="error" title="YKI error" message={error} /> : null}
      </Panel>

      {runtime ? (
        <Panel
          title={`Session ${runtime.session_id}`}
          subtitle={screenIndex >= 0 ? `Screen ${screenIndex + 1} of ${runtime.screens.length}` : "All engine-confirmed runtime screens are complete."}
        >
          <div className="meta-grid">
            <div className="meta-item">
              <span className="eyebrow">Current screen key</span>
              <strong>{extractCurrentScreenKey(runtime)}</strong>
            </div>
            <div className="meta-item">
              <span className="eyebrow">Active section</span>
              <strong>{runtime.metadata?.timing?.active_section || "unknown"}</strong>
            </div>
            <div className="meta-item">
              <span className="eyebrow">Runtime schema</span>
              <strong>{runtime.runtime_schema_version}</strong>
            </div>
          </div>
        </Panel>
      ) : null}

      {promptContext ? (
        <Panel title={promptContext.payload?.title || promptContext.screen_type} subtitle={promptContext.payload?.instruction || "Backend-authored prompt context."}>
          <div className="runtime-screen">
            {promptContext.payload?.materials?.text ? <p>{promptContext.payload.materials.text}</p> : null}
            {promptContext.payload?.audio_url ? <audio className="audio-player" src={promptContext.payload.audio_url} controls /> : null}
          </div>
        </Panel>
      ) : null}

      {currentScreen ? (
        <Panel title={currentScreen.payload?.title || currentScreen.screen_type} subtitle={currentScreen.payload?.instruction || "Backend-authored runtime screen."}>
          <div className="runtime-screen">
            {currentScreen.payload?.materials?.text ? <p>{currentScreen.payload.materials.text}</p> : null}
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
                <TextAreaField label="Writing answer" value={writingDraft} onChange={(event) => setWritingDraft(event.target.value)} />
                <Button onClick={() => submitWriting(currentScreen.payload.task_id)} disabled={busy || !writingDraft}>
                  Submit writing
                </Button>
              </>
            ) : null}

            {currentScreen.screen_type === "speaking_task" ? (
              <>
                <div className="screen-hero">
                  <div>
                    <span className="eyebrow">Speaking mode</span>
                    <h2>{currentScreen.payload.speaking_mode}</h2>
                    <p className="muted">{currentScreen.payload.prompt_text}</p>
                  </div>
                  <button
                    type="button"
                    className={recorder.state === "recording" ? "mic-button recording" : "mic-button"}
                    onClick={recorder.state === "recording" ? recorder.stopRecording : recorder.startRecording}
                  >
                    {recorder.state === "recording" ? "Stop" : "Record"}
                  </button>
                </div>
                {recorder.audioUrl ? <audio className="audio-player" src={recorder.audioUrl} controls /> : null}
                <div className="actions-row">
                  <Button onClick={() => submitSpeakingTask(currentScreen.payload)} disabled={busy || !recorder.audioBlob}>
                    Submit speaking response
                  </Button>
                </div>
                {conversationState ? <JsonPreview title="Conversation state" value={conversationState} /> : null}
              </>
            ) : null}
          </div>
        </Panel>
      ) : null}

      {runtime ? (
        <Panel title="Submission" subtitle="Review reads only backend-confirmed state.">
          <div className="actions-row">
            <Button onClick={() => submitExam(false)} disabled={busy}>
              Submit exam
            </Button>
            <Button tone="secondary" onClick={() => submitExam(true)} disabled={busy}>
              Submit with incomplete confirmation
            </Button>
            <Button tone="secondary" onClick={loadCertificate} disabled={busy}>
              Load certificate
            </Button>
          </div>
        </Panel>
      ) : null}

      {runtime ? <JsonPreview title="Runtime snapshot" value={runtime} /> : null}
      {certificate ? <JsonPreview title="Certificate" value={certificate} /> : null}
    </div>
  );
}
