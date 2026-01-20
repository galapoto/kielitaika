import React, { useState, useEffect, useRef, useCallback } from 'react';
import { TouchableOpacity, View, Text, StyleSheet, ActivityIndicator } from 'react-native';
import useWebSocket from '../hooks/useWebSocket';
import useRecorder from '../hooks/useRecorder';

const API_BASE = process.env.EXPO_PUBLIC_API_BASE || 'http://localhost:5000';
const hasMediaRecorder =
  typeof window !== 'undefined' &&
  typeof MediaRecorder !== 'undefined' &&
  typeof navigator !== 'undefined' &&
  navigator?.mediaDevices?.getUserMedia;

export default function MicRecorder({ onTranscript }) {
  const [isRecording, setIsRecording] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [statusText, setStatusText] = useState('');
  const [errorText, setErrorText] = useState('');
  const transcriptRef = useRef('');
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
  const {
    isRecording: fallbackRecording,
    audioBlob: fallbackAudioBlob,
    audioUrl: fallbackAudioUrl,
    startRecording: startFallbackRecording,
    stopRecording: stopFallbackRecording,
    error: recorderError,
  } = useRecorder();
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
    // Fallback path: environments without MediaRecorder (or native)
    if (!hasMediaRecorder) {
      setIsProcessing(true);
      setTranscript('');
      setIsRecording(true);
      setStatusText('Listening (native)…');
      await startFallbackRecording();
      setIsProcessing(false);
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
      alert('Failed to access microphone. Please check permissions.');
    }
  };

  const stopRecording = async () => {
    if (!hasMediaRecorder) {
      setIsRecording(false);
      setIsProcessing(true);
      setStatusText('Wrapping up recording…');
      const result = await stopFallbackRecording();
      const blob = result?.audioBlob || fallbackAudioBlob;

      if (blob) {
        await sendToAPI(blob);
      } else if (result?.audioUrl || fallbackAudioUrl) {
        // Fetch the URI into a blob for upload
        try {
          const uri = result?.audioUrl || fallbackAudioUrl;
          const resp = await fetch(uri);
          const fetchedBlob = await resp.blob();
          await sendToAPI(fetchedBlob);
        } catch (err) {
          console.error('Failed to fetch native URI', err);
          setErrorText('Could not upload recording. Please retry.');
        }
      } else {
        setErrorText('No recording available. Please try again.');
      }
      setIsProcessing(false);
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

  const sendToAPI = async (audioBlob) => {
    try {
      const response = await fetch(`${API_BASE}/voice/stt`, {
        method: 'POST',
        headers: { 'Content-Type': 'audio/webm' },
        body: audioBlob,
      });

      if (!response.ok) {
        throw new Error(`STT HTTP error ${response.status}`);
      }

      const result = await response.json();
      const text = result?.transcript || '';
      transcriptRef.current = text;
      setTranscript(text);
      if (onTranscript) {
        onTranscript(text);
      }
      setStatusText('');
    } catch (error) {
      console.error('Error sending audio:', error);
      setIsProcessing(false);
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
      {recorderError && (
        <Text style={styles.connectionErrorText}>{recorderError}</Text>
      )}
      {errorText ? <Text style={styles.connectionErrorText}>{errorText}</Text> : null}
      {statusText ? (
        <Text style={styles.statusText}>{statusText}</Text>
      ) : null}
      {!isRecording && (recorderError || errorText) ? (
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
