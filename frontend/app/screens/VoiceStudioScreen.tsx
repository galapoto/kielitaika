import { useState } from "react";
import { ArrowRight, RefreshCw, Volume2, Waves } from "lucide-react";

import { Button } from "../components/Button";
import { Field } from "../components/Field";
import { Panel } from "../components/Panel";
import { ScreenScaffold } from "../components/ScreenScaffold";
import { StatusBanner } from "../components/StatusBanner";
import { useRecorder } from "../hooks/useRecorder";
import { analyzePronunciation, requestTts, uploadVoiceTranscription } from "../services/voiceService";

function formatRecorderState(state: string): string {
  if (state === "recording") {
    return "Recording";
  }
  if (state === "stopped") {
    return "Ready";
  }
  if (state === "error") {
    return "Error";
  }
  return "Idle";
}

function readPronunciationScore(payload: any): string {
  const candidate = payload?.overall_score ?? payload?.score ?? payload?.accuracy_score ?? null;
  if (typeof candidate === "number") {
    return `${Math.round(candidate)}%`;
  }
  if (typeof candidate === "string" && candidate.trim().length > 0) {
    return candidate;
  }
  return "Ready";
}

function readPronunciationMessage(payload: any): string {
  const candidate = payload?.summary || payload?.feedback || payload?.message || payload?.notes || null;
  return typeof candidate === "string" && candidate.trim().length > 0
    ? candidate
    : "Use the model audio and your transcript to repeat the phrase with clearer rhythm and pronunciation.";
}

function readTtsAudioUrl(payload: any): string | null {
  const candidate = payload?.audio_url || payload?.replay_url || payload?.url || null;
  return typeof candidate === "string" && candidate.trim().length > 0 ? candidate : null;
}

export function VoiceStudioScreen(props: { title?: string; subtitle?: string; modeLabel?: string }) {
  const recorder = useRecorder();
  const [speakingSessionId] = useState(() => `spk_${crypto.randomUUID().replace(/-/g, "")}`);
  const [expectedText, setExpectedText] = useState("potilas");
  const [ttsText, setTtsText] = useState("Hei, tervetuloa takaisin.");
  const [transcription, setTranscription] = useState<any | null>(null);
  const [pronunciation, setPronunciation] = useState<any | null>(null);
  const [ttsResponse, setTtsResponse] = useState<any | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function upload() {
    if (!recorder.audioBlob || !speakingSessionId) {
      return;
    }
    setBusy(true);
    setError(null);
    const response = await uploadVoiceTranscription({
      blob: recorder.audioBlob,
      fileName: "voice.webm",
      mimeType: recorder.audioBlob.type || "audio/webm",
      durationMs: recorder.durationMs,
      sessionId: speakingSessionId,
      speakingSessionId,
      turnId: null,
      taskId: null,
      mode: "conversation",
      locale: "fi-FI",
    });
    if (!response.ok) {
      setError(response.error.message);
      setBusy(false);
      return;
    }
    if (!response.data.ok || !response.data.audio_ref) {
      setError("We could not read that recording clearly. Please record it again.");
      setBusy(false);
      return;
    }
    setTranscription(response.data);
    setPronunciation(null);
    setBusy(false);
  }

  async function runPronunciation() {
    if (!transcription) {
      return;
    }
    const response = await analyzePronunciation({
      expected_text: expectedText,
      transcript: transcription.transcript || expectedText,
      audio_ref: transcription.audio_ref || null,
    });
    if (response.ok) {
      setPronunciation(response.data);
    } else {
      setError(response.error.message);
    }
  }

  async function runTts() {
    setError(null);
    const response = await requestTts({
      text: ttsText,
      mode: "conversation",
      voice_preference: "neutral",
      replayable: true,
      speed: 1,
    });
    if (response.ok) {
      setTtsResponse(response.data);
    } else {
      setError(response.error.message);
      setTtsResponse(response);
    }
  }

  const primaryAction = !transcription
    ? {
        label: busy ? "Uploading..." : "Upload recording",
        icon: ArrowRight,
        onClick: upload,
        disabled: busy || !recorder.audioBlob,
      }
    : !pronunciation
      ? {
          label: "Analyze pronunciation",
          icon: Waves,
          onClick: runPronunciation,
          disabled: busy,
        }
      : {
          label: "Play model audio",
          icon: Volume2,
          onClick: runTts,
          disabled: busy,
        };
  const PrimaryIcon = primaryAction.icon;
  const modelAudioUrl = readTtsAudioUrl(ttsResponse);

  return (
    <ScreenScaffold
      className="voice-studio-screen"
      header={
        <div className="screen-heading">
          <span className="eyebrow">{props.modeLabel || "Speaking session"}</span>
          <h1 className="hero-title">{props.title || "Voice Studio"}</h1>
          <p className="hero-subtitle">{props.subtitle || "Record your voice, review the transcript, and refine your pronunciation in one focused speaking flow."}</p>
        </div>
      }
      actions={
        <div className="actions-row">
          <Button onClick={primaryAction.onClick} disabled={primaryAction.disabled}>
            <PrimaryIcon size={16} aria-hidden="true" />
            {primaryAction.label}
          </Button>
          <Button tone="ghost" onClick={recorder.resetRecording}>
            <RefreshCw size={16} aria-hidden="true" />
            Reset recording
          </Button>
        </div>
      }
    >
      <Panel
        title={props.title || "Voice Studio"}
        subtitle="Stay in one speaking loop: record, upload, listen, and improve."
        className="primary-card"
      >
        <div className="recorder-card">
          <div className="screen-hero">
            <div>
              <span className="eyebrow">{props.modeLabel || "Speaking session"}</span>
              <h2>{props.title || "Professional Finnish"}</h2>
              <p className="muted">Speak clearly, then continue to the next step from the action area below.</p>
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
            <span className="muted">{recorder.durationMs ? `${(recorder.durationMs / 1000).toFixed(1)}s captured` : "Record when you're ready, then upload the clip to continue."}</span>
          </div>
          {recorder.audioUrl ? <audio className="audio-player" src={recorder.audioUrl} controls /> : null}
          {recorder.error ? <StatusBanner tone="error" title="Microphone error" message={recorder.error} /> : null}
          {error ? <StatusBanner tone="error" title="Voice practice error" message={error} /> : null}
        </div>
      </Panel>

      {transcription ? (
        <Panel title="Transcript" subtitle="Review what the app heard before moving on to pronunciation feedback." className="secondary-card">
          <div className="transcript-card">
            <span className="eyebrow">Recognized speech</span>
            <p className="transcript-text">{transcription.transcript || "No transcript returned."}</p>
          </div>
        </Panel>
      ) : null}

      <Panel title="Pronunciation" subtitle="Compare your spoken phrase with the target wording." className="secondary-card">
        <div className="grid-two">
          <Field label="Expected phrase" value={expectedText} onChange={(event) => setExpectedText(event.target.value)} />
          <div className="meta-item">
            <span className="eyebrow">Status</span>
            <strong>{pronunciation ? readPronunciationScore(pronunciation) : transcription ? "Ready to analyze" : "Waiting for transcript"}</strong>
            <p className="muted">{pronunciation ? readPronunciationMessage(pronunciation) : "Upload a recording first, then continue with pronunciation feedback."}</p>
          </div>
        </div>
      </Panel>

      <Panel title="Model audio" subtitle="Listen to a clean reference version of the same phrase." className="secondary-card">
        <Field label="Text" value={ttsText} onChange={(event) => setTtsText(event.target.value)} />
        {modelAudioUrl ? <audio className="audio-player" src={modelAudioUrl} controls /> : <p className="muted">Generate model audio from the action area after pronunciation feedback is ready.</p>}
      </Panel>
    </ScreenScaffold>
  );
}
