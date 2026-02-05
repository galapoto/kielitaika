import { useState, useRef, useCallback, useEffect } from 'react';
import { AppState, Platform } from 'react-native';
import { useAudioRecorder } from './useAudioRecorder';
import useWebSocket from './useWebSocket';
import { transcribeAudio } from '../utils/stt';
import { HTTP_API_BASE, WS_API_BASE } from '../config/backend';
import { assertSpeakingSessionActive, isSpeakingReviewActive } from '../utils/speakingAttempts';

const API_BASE = HTTP_API_BASE;

/**
 * Enhanced voice streaming hook with VAD, WebSocket streaming, and state management
 * 
 * Features:
 * - Real-time STT streaming via WebSocket
 * - Real-time TTS streaming via WebSocket
 * - Voice Activity Detection (auto-stop on silence)
 * - Speaking/listening state management
 * - Automatic fallback to HTTP if WebSocket fails
 */
export function useVoiceStreaming(options = {}) {
  const {
    onTranscript,
    onTranscriptComplete,
    onTTSAudio,
    onStateChange,
    vadSilenceThreshold = 1500, // ms of silence before auto-stop
    vadEnergyThreshold = 200, // RMS energy threshold for VAD
  } = options;

  // State
  const [isRecording, setIsRecording] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [error, setError] = useState(null);

  const isNativePlatform = Platform.OS !== 'web';
  const {
    startRecording: startNativeRecording,
    stopRecording: stopNativeRecording,
  } = useAudioRecorder();

  // Refs
  const mediaRecorderRef = useRef(null);
  const audioStreamRef = useRef(null);
  const sttWsRef = useRef(null);
  const ttsWsRef = useRef(null);
  const vadTimerRef = useRef(null);
  const lastVoiceActivityRef = useRef(Date.now());
  const transcriptBufferRef = useRef('');
  const audioChunksRef = useRef([]);

  // STT WebSocket handlers
  const handleSTTMessage = useCallback((data) => {
    if (typeof data === 'string') {
      if (data.startsWith('error:')) {
        setError(data);
        setIsProcessing(false);
        return;
      }
      // Update transcript buffer and state
      transcriptBufferRef.current = data;
      setTranscript(data);
      if (onTranscript) {
        onTranscript(data);
      }
      // Reset VAD timer on transcript update (voice activity detected)
      lastVoiceActivityRef.current = Date.now();
    } else if (data instanceof Blob || data instanceof ArrayBuffer) {
      // Binary audio data - should not happen in STT stream, but handle gracefully
      console.warn('Unexpected binary data in STT WebSocket stream');
    }
  }, [onTranscript]);

  const handleSTTError = useCallback((err) => {
    console.error('STT WebSocket error:', err);
    setError(err.message || 'STT connection error');
    setIsProcessing(false);
  }, []);

  // TTS WebSocket handlers
  const handleTTSMessage = useCallback((data) => {
    if (typeof data === 'string') {
      if (data.startsWith('error:')) {
        setError(data);
        setIsSpeaking(false);
        return;
      }
    } else if (data instanceof Blob || data instanceof ArrayBuffer) {
      // Audio chunk received
      if (onTTSAudio) {
        onTTSAudio(data);
      }
    }
  }, [onTTSAudio]);

  const handleTTSError = useCallback((err) => {
    console.error('TTS WebSocket error:', err);
    setError(err.message || 'TTS connection error');
    setIsSpeaking(false);
  }, []);

  // STT WebSocket hook
  const {
    connect: connectSTT,
    send: sendSTT,
    close: closeSTT,
    isConnected: isSTTConnected,
  } = useWebSocket(handleSTTMessage, handleSTTError, { autoReconnect: true });

  // TTS WebSocket hook
  const {
    connect: connectTTS,
    send: sendTTS,
    close: closeTTS,
    isConnected: isTTSConnected,
  } = useWebSocket(handleTTSMessage, handleTTSError, { autoReconnect: false });

  // VAD: Check for silence and auto-stop
  const checkVAD = useCallback(() => {
    const silenceDuration = Date.now() - lastVoiceActivityRef.current;
    if (isRecording && silenceDuration > vadSilenceThreshold) {
      // Auto-stop recording after silence threshold
      stopRecording();
    }
  }, [isRecording, vadSilenceThreshold]);

  // Start VAD monitoring
  useEffect(() => {
    if (isNativePlatform) return undefined;
    if (isRecording) {
      vadTimerRef.current = setInterval(checkVAD, 500); // Check every 500ms
    } else {
      if (vadTimerRef.current) {
        clearInterval(vadTimerRef.current);
        vadTimerRef.current = null;
      }
    }
    return () => {
      if (vadTimerRef.current) {
        clearInterval(vadTimerRef.current);
      }
    };
  }, [isRecording, checkVAD]);

  // Notify state changes
  useEffect(() => {
    if (onStateChange) {
      onStateChange({
        isRecording,
        isProcessing,
        isListening,
        isSpeaking,
        transcript,
        error,
      });
    }
  }, [isRecording, isProcessing, isListening, isSpeaking, transcript, error, onStateChange]);

  // Start recording with WebSocket streaming
  const startRecording = useCallback(async (recordingOptions = {}) => {
    try {
      if (isRecording) {
        console.log('[STT] Start ignored: already recording');
        return;
      }
      if (recordingOptions?.userInitiated !== true || recordingOptions?.userGesture !== true) {
        throw new Error('Speaking invariant: microphone must be started by explicit user gesture.');
      }
      assertSpeakingSessionActive();
      console.log('[STT] Start requested');
      setError(null);
      setTranscript('');
      transcriptBufferRef.current = '';
      setIsRecording(true);
      setIsListening(true);
      setIsProcessing(false);

      if (isNativePlatform) {
        await startNativeRecording();
        lastVoiceActivityRef.current = Date.now();
        setIsProcessing(false);
        return;
      }

      // Guard: ensure mic APIs exist
      if (typeof navigator === 'undefined' || !navigator.mediaDevices?.getUserMedia) {
        throw new Error('Microphone is not available in this environment. Try a supported browser or device.');
      }
      if (typeof MediaRecorder === 'undefined') {
        throw new Error('MediaRecorder is not available. Use a modern browser or enable HTTPS for mic access.');
      }
      if (typeof window !== 'undefined' && window.location && window.location.protocol === 'http:' && window.location.hostname !== 'localhost') {
        throw new Error('Microphone requires HTTPS or localhost. Please use https:// or run locally.');
      }

      // Request microphone permission
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      audioStreamRef.current = stream;

      // Create MediaRecorder
      const mediaRecorder = new MediaRecorder(stream, {
        mimeType: 'audio/webm;codecs=opus',
      });
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];

      // Handle audio chunks
      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
          // Send to WebSocket if connected
          if (isSTTConnected && sendSTT) {
            sendSTT(event.data);
          }
        }
      };

      mediaRecorder.onstop = async () => {
        stream.getTracks().forEach((track) => track.stop());
        audioStreamRef.current = null;
        setIsRecording(false);
        setIsListening(false);

        // Final transcript if WebSocket was used
        if (transcriptBufferRef.current && onTranscriptComplete) {
          const finalTranscript = transcriptBufferRef.current;
          transcriptBufferRef.current = '';
          onTranscriptComplete(finalTranscript);
          setIsProcessing(false);
          return;
        }

        // Fallback: send final audio blob if WebSocket wasn't fully used
        if (!isSTTConnected && audioChunksRef.current.length > 0) {
          const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
          audioChunksRef.current = [];
          await sendToAPI(audioBlob, { callTranscriptComplete: true });
        } else {
          setIsProcessing(false);
        }
      };

      // Connect to STT WebSocket
      const wsUrl = `${WS_API_BASE}/voice/stt-stream`;
      connectSTT(wsUrl);

      // Start recording (send chunks every 100ms)
      mediaRecorder.start(100);
      lastVoiceActivityRef.current = Date.now();
      setIsProcessing(false);
    } catch (err) {
      setError(err.message || 'Failed to start recording');
      setIsRecording(false);
      setIsListening(false);
      setIsProcessing(false);
      throw err;
    }
  }, [connectSTT, sendSTT, isSTTConnected, onTranscriptComplete, isNativePlatform, startNativeRecording]);

  // Stop recording
  const stopRecording = useCallback(async () => {
    if (!isRecording) return;
    console.log('[STT] Stop requested');
    if (isNativePlatform) {
      try {
        setIsProcessing(true);
        const result = await stopNativeRecording();
        const uri = typeof result === 'string' ? result : result?.uri;
        setIsRecording(false);
        setIsListening(false);
        if (uri) {
          console.log('[STT] Uploading recorded file', uri);
          await sendNativeAudio(uri, { callTranscriptComplete: true });
        }
      } catch (err) {
        const message = err?.message || 'Failed to stop native recording';
        setError(message);
        throw err;
      } finally {
        setIsProcessing(false);
      }
      return;
    }

    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      setIsListening(false);
      closeSTT();
    }
  }, [isNativePlatform, stopNativeRecording, sendNativeAudio, isRecording, closeSTT]);

  // HTTP fallback for STT
  const sendToAPI = useCallback(
    async (audioBlob, { callTranscriptComplete = false, audioFormat = 'webm' } = {}) => {
    try {
      setIsProcessing(true);
      console.log('[STT] Uploading audio blob', audioFormat);
      const normalizedFormat = audioFormat?.startsWith('audio/')
        ? audioFormat.split('/')[1]
        : audioFormat;

      const { text: finalTranscript, meta } = await transcribeAudio({
        audioBlob,
        audioFormat: normalizedFormat || 'webm',
      });
      const normalized = (finalTranscript || '').trim();
      if (normalized) {
        setTranscript(normalized);
        if (onTranscript) {
          onTranscript(normalized);
        }
        if (callTranscriptComplete && onTranscriptComplete) {
          console.log('[STT] Transcript received');
          onTranscriptComplete(normalized, meta);
        }
      } else if (callTranscriptComplete && onTranscriptComplete) {
        // Even if transcript is empty, call complete to signal recording finished
        console.log('[STT] Transcript empty');
        onTranscriptComplete('', meta);
      }
      return normalized;
    } catch (err) {
      const errorMessage = err.message || 'STT transcription failed';
      console.log('[STT] Upload failed', errorMessage);
      setError(errorMessage);
      if (callTranscriptComplete && onTranscriptComplete) {
        // Signal completion even on error so UI can update
        onTranscriptComplete('', { error: errorMessage });
      }
      throw err;
    } finally {
      setIsProcessing(false);
    }
  }, [onTranscript, onTranscriptComplete]);

  const sendNativeAudio = useCallback(
    async (fileUri, options) => {
      try {
        setIsProcessing(true);
        console.log('[STT] Sending native audio', fileUri);
        const uriExtMatch = fileUri?.split(".").pop()?.split("?")[0];
        const finalFormat = uriExtMatch || options?.audioFormat;
        const { text, meta } = await transcribeAudio({
          fileUri,
          audioFormat: finalFormat || 'wav',
        });
        const normalized = (text || '').trim();
        if (normalized) {
          setTranscript(normalized);
          if (onTranscript) {
            onTranscript(normalized);
          }
          if (options?.callTranscriptComplete && onTranscriptComplete) {
            console.log('[STT] Transcript received');
            onTranscriptComplete(normalized, meta);
          }
        } else if (options?.callTranscriptComplete && onTranscriptComplete) {
          // Even if transcript is empty, call complete to signal recording finished
          console.log('[STT] Transcript empty');
          onTranscriptComplete('', meta);
        }
        return normalized;
      } catch (err) {
        console.log('[STT] Transcription failed', err?.message || err);
        setError(err.message || 'STT transcription failed');
        if (options?.callTranscriptComplete && onTranscriptComplete) {
          // Signal completion even on error so UI can update
          onTranscriptComplete('', { error: err.message });
        }
        throw err;
      } finally {
        setIsProcessing(false);
      }
    },
    [onTranscript, onTranscriptComplete]
  );

  // Speak text via TTS WebSocket
  const speakText = useCallback(async (text) => {
    if (!text || !text.trim()) {
      return;
    }
    if (isSpeakingReviewActive()) {
      throw new Error('Speaking invariant: audio playback is not allowed in review mode.');
    }

    try {
      setIsSpeaking(true);
      setError(null);

      // On web, prefer browser TTS immediately for reliability and lower latency.
      if (typeof window !== 'undefined') {
        await speakTextHTTP(text);
        return;
      }

      // Connect to TTS WebSocket
      const wsUrl = `${WS_API_BASE}/voice/tts-stream`;
      connectTTS(wsUrl);

      // Wait for connection, then send text
      const waitForConnection = (attempt = 0) => {
        if (isTTSConnected && sendTTS) {
          sendTTS(JSON.stringify({ text }));
        } else if (attempt < 10) {
          setTimeout(() => waitForConnection(attempt + 1), 150);
        } else {
          // Fallback to HTTP TTS
          console.error('TTS WebSocket failed to connect. Falling back to HTTP TTS.');
          speakTextHTTP(text);
        }
      };

      waitForConnection();
    } catch (err) {
      setError(err.message || 'TTS failed');
      setIsSpeaking(false);
    }
  }, [connectTTS, sendTTS, isTTSConnected]);

  // HTTP fallback for TTS
  const speakTextHTTP = useCallback(async (text) => {
    try {
      // Use browser SpeechSynthesis as fallback
      if ('speechSynthesis' in window) {
        // Add slight humanization: vary pitch/rate and occasionally add a playful aside.
        const playful = Math.random() < 0.12 ? ' (Nopea vinkki: otetaan rennosti!)' : '';
        const utterance = new SpeechSynthesisUtterance(`${text}${playful}`);
        utterance.lang = 'fi-FI';
        utterance.pitch = 0.95 + Math.random() * 0.1;
        utterance.rate = 0.95 + Math.random() * 0.1;
        utterance.onend = () => setIsSpeaking(false);
        utterance.onerror = () => setIsSpeaking(false);
        window.speechSynthesis.speak(utterance);
      } else {
        setIsSpeaking(false);
      }
    } catch (err) {
      setError(err.message || 'TTS fallback failed');
      setIsSpeaking(false);
    }
  }, []);

  // Stop speaking
  const stopSpeaking = useCallback(() => {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.cancel();
    }
    closeTTS();
    setIsSpeaking(false);
  }, [closeTTS]);

  // Teardown on app background / tab hidden
  useEffect(() => {
    const teardown = () => {
      try {
        stopRecording();
      } catch (_) {
        // ignore teardown errors
      }
      try {
        stopSpeaking();
      } catch (_) {
        // ignore teardown errors
      }
    };

    const appStateSub =
      typeof AppState?.addEventListener === 'function'
        ? AppState.addEventListener('change', (nextState) => {
            if (nextState !== 'active') teardown();
          })
        : null;

    const onVisibility =
      typeof document !== 'undefined' && typeof document.addEventListener === 'function'
        ? () => {
            if (document.visibilityState !== 'visible') teardown();
          }
        : null;

    if (onVisibility) {
      document.addEventListener('visibilitychange', onVisibility);
    }

    return () => {
      if (appStateSub && typeof appStateSub.remove === 'function') {
        appStateSub.remove();
      }
      if (onVisibility) {
        document.removeEventListener('visibilitychange', onVisibility);
      }
    };
  }, [stopRecording, stopSpeaking]);

  // Cleanup
  useEffect(() => {
    return () => {
      if (mediaRecorderRef.current) {
        mediaRecorderRef.current.stop();
      }
      if (audioStreamRef.current) {
        audioStreamRef.current.getTracks().forEach((track) => track.stop());
      }
      closeSTT();
      closeTTS();
      if (vadTimerRef.current) {
        clearInterval(vadTimerRef.current);
      }
    };
  }, [closeSTT, closeTTS]);

  return {
    // State
    isRecording,
    isProcessing,
    isListening,
    isSpeaking,
    transcript,
    error,
    isSTTConnected,
    isTTSConnected,

    // Actions
    startRecording,
    stopRecording,
    speakText,
    stopSpeaking,

    // Manual transcript update (for external sources)
    setTranscript,
  };
}
