import { useEffect, useState } from "react";

import { Button } from "../components/Button";
import { Field } from "../components/Field";
import { JsonPreview } from "../components/JsonPreview";
import { Panel } from "../components/Panel";
import { StatusBanner } from "../components/StatusBanner";
import { useRecorder } from "../hooks/useRecorder";
import { analyzePronunciation, requestTts, uploadVoiceTranscription } from "../services/voiceService";

function createSpeakingSessionId(): string {
  return `spk_${crypto.randomUUID().replace(/-/g, "")}`;
}

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

export function VoiceStudioScreen() {
  const recorder = useRecorder();
  const [speakingSessionId, setSpeakingSessionId] = useState("");
  const [expectedText, setExpectedText] = useState("potilas");
  const [ttsText, setTtsText] = useState("Hei, tervetuloa takaisin.");
  const [transcription, setTranscription] = useState<any | null>(null);
  const [pronunciation, setPronunciation] = useState<any | null>(null);
  const [ttsResponse, setTtsResponse] = useState<any | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    setSpeakingSessionId(createSpeakingSessionId());
  }, []);

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
    setTranscription(response.data);
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

  return (
    <div className="screen-stack">
      <Panel title="Voice Studio" subtitle="KAIL-style explicit start and stop. No auto-stop, no speculative transcript persistence.">
        <div className="recorder-card">
          <div className="screen-hero">
            <div>
              <span className="eyebrow">Speaking session</span>
              <h2>{speakingSessionId || "Preparing..."}</h2>
              <p className="muted">Mode: conversation · Locale: fi-FI</p>
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
            <span className="muted">{recorder.durationMs ? `${(recorder.durationMs / 1000).toFixed(1)}s captured` : "Explicit user-controlled capture only."}</span>
          </div>
          {recorder.audioUrl ? <audio className="audio-player" src={recorder.audioUrl} controls /> : null}
          {recorder.error ? <StatusBanner tone="error" title="Microphone error" message={recorder.error} /> : null}
          {error ? <StatusBanner tone="error" title="Voice API error" message={error} /> : null}
          <div className="actions-row">
            <Button onClick={upload} disabled={busy || !recorder.audioBlob}>
              Upload for transcription
            </Button>
            <Button tone="ghost" onClick={recorder.resetRecording}>
              Reset recording
            </Button>
          </div>
        </div>
      </Panel>

      {transcription ? (
        <Panel title="Transcript" subtitle="Backend-confirmed transcription only.">
          <div className="transcript-card">
            <span className="eyebrow">Recognized speech</span>
            <p className="transcript-text">{transcription.transcript || "No transcript returned."}</p>
          </div>
        </Panel>
      ) : null}

      <Panel title="Pronunciation" subtitle="Analysis only after confirmed backend STT response exists.">
        <div className="grid-two">
          <Field label="Expected phrase" value={expectedText} onChange={(event) => setExpectedText(event.target.value)} />
          <Button onClick={runPronunciation} disabled={!transcription}>
            Analyze pronunciation
          </Button>
        </div>
      </Panel>

      <Panel title="TTS Request" subtitle="Backend errors are surfaced directly and never hidden.">
        <div className="grid-two">
          <Field label="Text" value={ttsText} onChange={(event) => setTtsText(event.target.value)} />
          <Button onClick={runTts}>Request TTS</Button>
        </div>
      </Panel>

      {transcription ? <JsonPreview title="STT response" value={transcription} /> : null}
      {pronunciation ? <JsonPreview title="Pronunciation response" value={pronunciation} /> : null}
      {ttsResponse ? <JsonPreview title="TTS response" value={ttsResponse} /> : null}
    </div>
  );
}
