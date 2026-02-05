// frontend/app/hooks/useVoiceStreaming.js

import { useCallback, useRef, useState } from "react";
import { Audio } from "expo-av";
import { transcribeAudio } from "../services/stt";
import { isCurrentlySpeaking, forceStopSpeaking } from "../services/tts";

export function useVoiceStreaming() {
  const recordingRef = useRef(null);
  const [isRecording, setIsRecording] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState(null);

  /**
   * HARD RULE:
   * Recording can NEVER start while TTS is active.
   */
  const startRecording = useCallback(async () => {
    setError(null);

    if (isRecording || isProcessing) return;

    if (isCurrentlySpeaking()) {
      if (__DEV__) console.warn("[STT] Attempted to record while TTS active");
      await forceStopSpeaking();
    }

    try {
      if (__DEV__) console.log("[STT] Preparing microphone");

      await Audio.setAudioModeAsync({
        allowsRecordingIOS: true,
        interruptionModeIOS: Audio.INTERRUPTION_MODE_IOS_DO_NOT_MIX,
        playsInSilentModeIOS: true,
        staysActiveInBackground: false,
        shouldDuckAndroid: true,
        interruptionModeAndroid: Audio.INTERRUPTION_MODE_ANDROID_DO_NOT_MIX,
        playThroughEarpieceAndroid: false,
      });

      const recording = new Audio.Recording();
      await recording.prepareToRecordAsync(
        Audio.RecordingOptionsPresets.HIGH_QUALITY
      );

      await recording.startAsync();
      recordingRef.current = recording;
      setIsRecording(true);

      if (__DEV__) console.log("[STT] Recording started");
    } catch (err) {
      setError(err);
      setIsRecording(false);
      if (__DEV__) console.error("[STT] Failed to start recording", err);
    }
  }, [isRecording, isProcessing]);

  const stopRecording = useCallback(async () => {
    if (!isRecording || !recordingRef.current) return;

    setIsRecording(false);
    setIsProcessing(true);

    try {
      const recording = recordingRef.current;
      recordingRef.current = null;

      await recording.stopAndUnloadAsync();
      const uri = recording.getURI();

      if (__DEV__) console.log("[STT] Recording stopped", uri);

      if (!uri) {
        throw new Error("Recording URI missing");
      }

      const transcript = await transcribeAudio(uri);

      if (__DEV__) console.log("[STT] Transcript:", transcript);

      setIsProcessing(false);
      return transcript;
    } catch (err) {
      setError(err);
      setIsProcessing(false);
      if (__DEV__) console.error("[STT] Transcription failed", err);
      return null;
    }
  }, [isRecording]);

  const reset = useCallback(() => {
    setIsRecording(false);
    setIsProcessing(false);
    setError(null);
    recordingRef.current = null;
  }, []);

  return {
    startRecording,
    stopRecording,
    isRecording,
    isProcessing,
    error,
    reset,
  };
}

