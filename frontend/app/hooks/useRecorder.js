import { useCallback, useEffect, useRef, useState } from 'react';

/**
 * Recorder hook with dual paths:
 * - Web: uses MediaRecorder when available.
 * - Native: attempts to use expo-av Audio. If expo-av is not installed, surfaces an error.
 */
export default function useRecorder() {
  const [isRecording, setIsRecording] = useState(false);
  const [audioUrl, setAudioUrl] = useState(null);
  const [audioBlob, setAudioBlob] = useState(null);
  const [error, setError] = useState(null);

  const mediaRecorderRef = useRef(null);
  const chunksRef = useRef([]);
  const streamRef = useRef(null);
  const nativeRecordingRef = useRef(null);
  const nativeAudioModuleRef = useRef(null);

  const cleanup = useCallback(() => {
    if (mediaRecorderRef.current) {
      mediaRecorderRef.current.ondataavailable = null;
      mediaRecorderRef.current.onstop = null;
      mediaRecorderRef.current = null;
    }
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((t) => t.stop());
      streamRef.current = null;
    }
    if (nativeRecordingRef.current) {
      nativeRecordingRef.current.stopAndUnloadAsync?.();
      nativeRecordingRef.current = null;
    }
    chunksRef.current = [];
  }, []);

  useEffect(() => {
    return () => {
      if (audioUrl) {
        URL.revokeObjectURL(audioUrl);
      }
      cleanup();
    };
  }, [audioUrl, cleanup]);

  const startWebRecording = useCallback(async () => {
    const hasMediaRecorder =
      typeof navigator !== 'undefined' &&
      navigator?.mediaDevices?.getUserMedia &&
      typeof MediaRecorder !== 'undefined';

    if (!hasMediaRecorder) return false;

    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    streamRef.current = stream;
    const recorder = new MediaRecorder(stream, { mimeType: 'audio/webm;codecs=opus' });
    mediaRecorderRef.current = recorder;
    chunksRef.current = [];

    recorder.ondataavailable = (event) => {
      if (event.data && event.data.size > 0) {
        chunksRef.current.push(event.data);
      }
    };

    recorder.onstop = () => {
      const blob = new Blob(chunksRef.current, { type: 'audio/webm' });
      const url = URL.createObjectURL(blob);
      setAudioBlob(blob);
      setAudioUrl(url);
      setIsRecording(false);
      cleanup();
    };

    recorder.start(100);
    return true;
  }, [cleanup]);

  const startNativeRecording = useCallback(async () => {
    try {
      // Lazy load expo-av if available in the runtime
      if (!nativeAudioModuleRef.current) {
        nativeAudioModuleRef.current = require('expo-av');
      }
      const { Audio } = nativeAudioModuleRef.current;
      await Audio.requestPermissionsAsync();
      await Audio.setAudioModeAsync({
        allowsRecordingIOS: true,
        playsInSilentModeIOS: true,
        staysActiveInBackground: false,
      });

      const recording = new Audio.Recording();
      await recording.prepareToRecordAsync(
        Audio.RecordingOptionsPresets.HIGH_QUALITY
      );
      await recording.startAsync();
      nativeRecordingRef.current = recording;
      return true;
    } catch (err) {
      console.error('Native recording failed', err);
      setError('Native recording unavailable.');
      return false;
    }
  }, []);

  const startRecording = useCallback(async () => {
    setError(null);
    setAudioBlob(null);
    setAudioUrl(null);
    // Reset prior native instance so a fresh recording can start
    nativeRecordingRef.current = null;

    // Try web MediaRecorder first
    try {
      const startedWeb = await startWebRecording();
      if (startedWeb) {
        setIsRecording(true);
        return;
      }
    } catch (err) {
      console.error('Web recorder start failed', err);
    }

    // Fallback to native/expo-av
    const startedNative = await startNativeRecording();
    if (startedNative) {
      setIsRecording(true);
      return;
    }

    setError('Recording not supported in this environment.');
    setIsRecording(false);
  }, [startNativeRecording, startWebRecording]);

  const stopRecording = useCallback(async () => {
    // Web path
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      return { audioBlob, audioUrl };
    }

    // Native path
    if (nativeRecordingRef.current) {
      try {
        await nativeRecordingRef.current.stopAndUnloadAsync();
        const uri = nativeRecordingRef.current.getURI();
        let blob = null;
        if (uri && typeof fetch !== 'undefined') {
          const resp = await fetch(uri);
          blob = await resp.blob();
        }
        setAudioBlob(blob);
        setAudioUrl(uri);
      } catch (err) {
        console.error('Failed to stop native recording', err);
        setError('Could not finalize recording.');
      } finally {
        setIsRecording(false);
        cleanup();
      }
      return { audioBlob, audioUrl };
    }

    setIsRecording(false);
    return { audioBlob, audioUrl };
  }, [audioBlob, audioUrl, cleanup, isRecording]);

  return {
    isRecording,
    audioUrl,
    audioBlob,
    error,
    startRecording,
    stopRecording,
  };
}
