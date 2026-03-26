import { useEffect, useRef, useState } from "react";

import { playMicStart, playMicStop } from "../services/audioService";

type RecorderState = "idle" | "recording" | "stopped" | "error";

export function useRecorder() {
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const startedAtRef = useRef<number>(0);
  const [state, setState] = useState<RecorderState>("idle");
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [durationMs, setDurationMs] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    return () => {
      if (audioUrl) {
        URL.revokeObjectURL(audioUrl);
      }
      streamRef.current?.getTracks().forEach((track) => track.stop());
    };
  }, [audioUrl]);

  async function startRecording() {
    setError(null);
    setAudioBlob(null);
    setDurationMs(null);
    if (audioUrl) {
      URL.revokeObjectURL(audioUrl);
      setAudioUrl(null);
    }
    if (!navigator.mediaDevices?.getUserMedia) {
      setState("error");
      setError("Microphone recording is not supported in this browser.");
      return;
    }
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const recorder = new MediaRecorder(stream);
      chunksRef.current = [];
      recorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          chunksRef.current.push(event.data);
        }
      };
      recorder.onstop = () => {
        const blob = new Blob(chunksRef.current, { type: recorder.mimeType || "audio/webm" });
        setAudioBlob(blob);
        setAudioUrl(URL.createObjectURL(blob));
        setDurationMs(Date.now() - startedAtRef.current);
        setState("stopped");
      };
      recorder.start();
      startedAtRef.current = Date.now();
      mediaRecorderRef.current = recorder;
      streamRef.current = stream;
      setState("recording");
      playMicStart();
    } catch {
      setState("error");
      setError("Microphone access was denied.");
    }
  }

  function stopRecording() {
    if (mediaRecorderRef.current?.state === "recording") {
      playMicStop();
      mediaRecorderRef.current.stop();
      streamRef.current?.getTracks().forEach((track) => track.stop());
    }
  }

  function resetRecording() {
    if (audioUrl) {
      URL.revokeObjectURL(audioUrl);
    }
    setAudioBlob(null);
    setAudioUrl(null);
    setDurationMs(null);
    setError(null);
    setState("idle");
  }

  return {
    state,
    audioBlob,
    audioUrl,
    durationMs,
    error,
    startRecording,
    stopRecording,
    resetRecording,
  };
}
