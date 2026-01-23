import React, { useState, useEffect, useRef, useCallback } from 'react';
import { TouchableOpacity, View, Text, StyleSheet, ActivityIndicator, Platform } from 'react-native';
import useWebSocket from '../hooks/useWebSocket';
import { useAudioRecorder } from '../hooks/useAudioRecorder';
import { handleSTTFailure, handleNetworkError, handlePermissionError, handleEmptyRecording, YKIError, YKIErrorType } from '../services/ykiErrorService';

const API_BASE = process.env.EXPO_PUBLIC_API_BASE || 'http://localhost:8000';
const hasMediaRecorder =
  typeof window !== 'undefined' &&
  typeof MediaRecorder !== 'undefined' &&
  typeof navigator !== 'undefined' &&
  navigator?.mediaDevices?.getUserMedia;
const isWeb = Platform.OS === 'web';

export default function MicRecorder({ onTranscript, minSeconds = 0 }) {
  const [isRecording, setIsRecording] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [statusText, setStatusText] = useState('');
  const [errorText, setErrorText] = useState('');
  const transcriptRef = useRef('');
  const { startRecording: startNativeRecording, stopRecording: stopNativeRecording } = useAudioRecorder();

  const handleWsMessage = useCallback(
    (data) => {
      if (typeof data === 'string') {
        transcriptRef.current = data;
        setTranscript(data);
        setIsProcessing(false);
        if (onTranscript) {
          onTranscript(data);
        }
      }
    },
    [onTranscript]
  );
  const handleWsError = useCallback((error) => {
    console.error('STT WebSocket error:', error);
    setIsProcessing(false);
  }, []);
  const { connect, send, isConnected, close, connectionError } = useWebSocket(
    handleWsMessage,
    handleWsError,
    { autoReconnect: true, maxRetries: 3, retryDelayMs: 400 }
  );
  const mediaRecorderRef = useRef(null);
  const audioChunksRef = useRef([]);

  useEffect(() => {
    return () => {
      if (mediaRecorderRef.current) {
        mediaRecorderRef.current.stop();
      }
      close();
    };
  }, [close]);

  const startRecording = async () => {
    // Native: Expo recorder (reliable on Android/iOS)
    if (!isWeb || !hasMediaRecorder) {
      try {
        setErrorText('');
        setTranscript('');
        setIsProcessing(false);
        setStatusText('Listening…');
        setIsRecording(true);
        await startNativeRecording();
      } catch (error) {
        console.error('Error starting native recording:', error);
        setIsRecording(false);
        setStatusText('');
        // Handle permission errors properly
        const errorMsg = error?.message?.toLowerCase() || '';
        if (errorMsg.includes('permission') || errorMsg.includes('denied') || errorMsg.includes('access')) {
          const ykiError = handlePermissionError(error, 'microphone');
          setErrorText(ykiError.userMessage);
        } else {
          setErrorText(error?.message || 'Failed to access microphone. Check permissions.');
        }
      }
      return;
    }

    try {
      // Request microphone permission and get stream
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      
      // Create MediaRecorder (browser API)
      const mediaRecorder = new MediaRecorder(stream, {
        mimeType: 'audio/webm;codecs=opus',
      });

      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
          // Send chunk to WebSocket if connected
          if (isConnected) {
            send(event.data);
          }
        }
      };

      mediaRecorder.onstop = async () => {
        stream.getTracks().forEach((track) => track.stop());
        
        // Combine all chunks
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        
        // If WebSocket wasn't used, send to API directly.
        // If streaming is connected, still schedule an HTTP fallback so we always get a final transcript.
        if (!isConnected) {
          await sendToAPI(audioBlob);
        } else {
          setTimeout(() => {
            if (!transcriptRef.current) {
              sendToAPI(audioBlob);
            }
          }, 800);
        }
      };

      // Connect to WebSocket STT endpoint
      const wsUrl = API_BASE.replace('http', 'ws') + '/voice/stt-stream';
      transcriptRef.current = '';
      connect(wsUrl);

      // Start recording
      mediaRecorder.start(100); // Send chunks every 100ms
      setIsRecording(true);
      setTranscript('');
      setIsProcessing(true);
      setStatusText('Listening…');
    } catch (error) {
      console.error('Error starting recording:', error);
      // Handle permission errors properly
      const errorMsg = error?.message?.toLowerCase() || '';
      if (errorMsg.includes('permission') || errorMsg.includes('denied') || errorMsg.includes('notallowed')) {
        const ykiError = handlePermissionError(error, 'microphone');
        setErrorText(ykiError.userMessage);
      } else {
        setErrorText('Failed to access microphone. Please check permissions.');
      }
    }
  };

  const stopRecording = async () => {
    // Native: stop + upload the file bytes
    if (!isWeb || !hasMediaRecorder) {
      setIsRecording(false);
      setIsProcessing(true);
      setStatusText('Processing…');
      setErrorText('');
      try {
        const result = await stopNativeRecording();
        const uri = typeof result === 'string' ? result : result?.uri;
        const durationMs = typeof result === 'object' ? (result?.durationMs || 0) : 0;
        if (!uri) {
          setErrorText('No recording available. Please try again.');
          return;
        }
        if (minSeconds && durationMs && durationMs < minSeconds * 1000) {
          setErrorText(`Recording too short. Speak for at least ${minSeconds}s and try again.`);
          return;
        }
        const resp = await fetch(uri);
        const blob = await resp.blob();
        await sendToAPI(blob, uri);
      } catch (err) {
        console.error('Native STT failed:', err);
        setErrorText('STT failed. Please try again.');
      } finally {
        setIsProcessing(false);
        setStatusText('');
      }
      return;
    }

    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      setIsProcessing(true);
      setStatusText('Processing…');
      // Close the socket shortly after stopping to let the backend flush
      setTimeout(() => close(), 500);
    }
  };

  const sendToAPI = async (audioBlob, uriHint) => {
    try {
      const audioFormat =
        typeof uriHint === 'string' && uriHint.includes('.')
          ? uriHint.split('.').pop()
          : 'webm';
      const response = await fetch(`${API_BASE}/voice/stt`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/octet-stream',
          'x-audio-format': audioFormat || 'webm',
        },
        body: audioBlob,
      });

      if (!response.ok) {
        throw new Error(`STT HTTP error ${response.status}`);
      }

      const result = await response.json();
      const text = result?.transcript || '';
      
      // Check for empty transcript
      if (!text || !text.trim()) {
        const emptyError = handleEmptyRecording();
        setIsProcessing(false);
        setErrorText(emptyError.userMessage);
        return;
      }
      
      transcriptRef.current = text;
      setTranscript(text);
      if (onTranscript) {
        onTranscript(text);
      }
      setStatusText('');
    } catch (error) {
      console.error('Error sending audio:', error);
      setIsProcessing(false);
      
      // Handle different error types
      let errorMessage = 'STT failed. Please try again.';
      const errorStr = error?.message?.toLowerCase() || '';
      
      if (errorStr.includes('network') || errorStr.includes('connection') || errorStr.includes('fetch')) {
        const ykiError = handleNetworkError(error, 'STT transcription');
        errorMessage = ykiError.userMessage;
      } else {
        const ykiError = handleSTTFailure(error);
        errorMessage = ykiError.userMessage;
      }
      
      setErrorText(errorMessage);
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <View style={styles.container}>
      <TouchableOpacity
        style={[styles.button, isRecording && styles.buttonRecording]}
        onPress={isRecording ? stopRecording : startRecording}
        disabled={isProcessing}
      >
        {isProcessing ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <Text style={styles.buttonText}>
            {isRecording ? '⏹ Stop' : '🎤 Start Speaking'}
          </Text>
        )}
      </TouchableOpacity>
      
      {transcript && (
        <View style={styles.transcriptContainer}>
          <Text style={styles.transcriptLabel}>You said:</Text>
          <Text style={styles.transcriptText}>{transcript}</Text>
        </View>
      )}
      
      {isProcessing && !transcript && (
        <Text style={styles.processingText}>Processing audio...</Text>
      )}
      {connectionError && (
        <Text style={styles.connectionErrorText}>Connection issue. Retrying...</Text>
      )}
      {errorText ? <Text style={styles.connectionErrorText}>{errorText}</Text> : null}
      {statusText ? (
        <Text style={styles.statusText}>{statusText}</Text>
      ) : null}
      {!isRecording && errorText ? (
        <TouchableOpacity
          style={styles.retryButton}
          onPress={() => {
            setErrorText('');
            setStatusText('');
            startRecording();
          }}
        >
          <Text style={styles.retryText}>Retry</Text>
        </TouchableOpacity>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: 8,
  },
  button: {
    backgroundColor: '#0A3D62',
    padding: 14,
    borderRadius: 12,
    alignItems: 'center',
  },
  buttonRecording: {
    backgroundColor: '#dc2626',
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  transcriptContainer: {
    marginTop: 8,
    padding: 12,
    backgroundColor: '#f1f5f9',
    borderRadius: 8,
  },
  transcriptLabel: {
    fontSize: 12,
    color: '#64748b',
    marginBottom: 4,
  },
  transcriptText: {
    fontSize: 14,
    color: '#1e293b',
  },
  processingText: {
    fontSize: 12,
    color: '#64748b',
    fontStyle: 'italic',
    textAlign: 'center',
  },
  connectionErrorText: {
    fontSize: 12,
    color: '#dc2626',
    textAlign: 'center',
  },
  statusText: {
    fontSize: 12,
    color: '#1e293b',
    textAlign: 'center',
  },
  retryButton: {
    marginTop: 8,
    alignSelf: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
    backgroundColor: '#0A3D62',
  },
  retryText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 12,
  },
});
