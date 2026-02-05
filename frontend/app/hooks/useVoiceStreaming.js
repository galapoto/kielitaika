// frontend/app/hooks/useVoiceStreaming.js
import { useRef } from "react";
import { startRecording, stopRecording } from "../services/sttService";

export default function useVoiceStreaming({
  onPartialTranscript,
  onFinalTranscript,
}) {
  const recordingRef = useRef(false);

  const start = async () => {
    recordingRef.current = true;
    await startRecording({
      onPartial: (text) => {
        if (recordingRef.current) {
          onPartialTranscript?.(text);
        }
      },
      onFinal: (text) => {
        if (recordingRef.current) {
          recordingRef.current = false;
          onFinalTranscript?.(text);
        }
      },
    });
  };

  const stop = async () => {
    recordingRef.current = false;
    await stopRecording();
  };

  return { start, stop };
}

