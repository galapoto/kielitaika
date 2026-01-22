import { useState, useRef, useCallback, useEffect } from 'react';
import { Platform } from 'react-native';
import { useAudioRecorder } from './useAudioRecorder';
import useWebSocket from './useWebSocket';
import { transcribeAudio } from '../utils/stt';

const API_BASE = process.env.EXPO_PUBLIC_API_BASE || 'http://localhost:8000';

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
      // Update transcript
      transcriptBufferRef.current = data;
      setTranscript(data);
      if (onTranscript) {
        onTranscript(data);
      }
      // Reset VAD timer on transcript update (voice activity detected)
      lastVoiceActivityRef.current = Date.now();
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
  const startRecording = useCallback(async () => {
    try {
      setError(null);
      setTranscript('');
      transcriptBufferRef.current = '';
      setIsRecording(true);
      setIsListening(true);
      setIsProcessing(true);

      if (isNativePlatform) {
        await startNativeRecording();
        lastVoiceActivityRef.current = Date.now();
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

        // Final transcript if WebSocket was used
        if (transcriptBufferRef.current && onTranscriptComplete) {
          onTranscriptComplete(transcriptBufferRef.current);
        }

        // Fallback: send final audio blob if WebSocket wasn't fully used
        if (!isSTTConnected && audioChunksRef.current.length > 0) {
          const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
          await sendToAPI(audioBlob, { callTranscriptComplete: true });
        }
      };

      // Connect to STT WebSocket
      const wsUrl = API_BASE.replace('http', 'ws') + '/voice/stt-stream';
      connectSTT(wsUrl);

      // Start recording (send chunks every 100ms)
      mediaRecorder.start(100);
      lastVoiceActivityRef.current = Date.now();
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
    if (isNativePlatform) {
      try {
        setIsProcessing(true);
        const result = await stopNativeRecording();
        const uri = typeof result === 'string' ? result : result?.uri;
        setIsRecording(false);
        setIsListening(false);
        if (uri) {
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
      const normalizedFormat = audioFormat?.startsWith('audio/')
        ? audioFormat.split('/')[1]
        : audioFormat;

      const { text: finalTranscript, meta } = await transcribeAudio({
        audioBlob,
        audioFormat: normalizedFormat || 'webm',
      });
      setTranscript(finalTranscript);
      if (onTranscript) {
        onTranscript(finalTranscript);
      }
      if (callTranscriptComplete && onTranscriptComplete) {
        onTranscriptComplete({ text: finalTranscript, meta });
      }
      return finalTranscript;
    } catch (err) {
      setError(err.message || 'STT transcription failed');
      throw err;
    } finally {
      setIsProcessing(false);
    }
  }, [onTranscript, onTranscriptComplete]);

  const sendNativeAudio = useCallback(
    async (fileUri, options) => {
      const uriExtMatch = fileUri?.split(".").pop()?.split("?")[0];
      const finalFormat = uriExtMatch || options?.audioFormat;
      const { text, meta } = await transcribeAudio({
        fileUri,
        audioFormat: finalFormat || 'wav',
      });
      setTranscript(text);
      if (onTranscript) {
        onTranscript(text);
      }
      if (options?.callTranscriptComplete && onTranscriptComplete) {
        onTranscriptComplete({ text, meta });
      }
      return text;
    },
    [onTranscript, onTranscriptComplete]
  );

  // Speak text via TTS WebSocket
  const speakText = useCallback(async (text) => {
    if (!text || !text.trim()) {
      return;
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
      const wsUrl = API_BASE.replace('http', 'ws') + '/voice/tts-stream';
      connectTTS(wsUrl);

      // Wait for connection, then send text
      const waitForConnection = (attempt = 0) => {
        if (isTTSConnected && sendTTS) {
          sendTTS(JSON.stringify({ text }));
        } else if (attempt < 10) {
          setTimeout(() => waitForConnection(attempt + 1), 150);
        } else {
          // Fallback to HTTP TTS
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
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
    }
    closeTTS();
    setIsSpeaking(false);
  }, [closeTTS]);

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
