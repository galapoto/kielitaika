import React, { useState, useRef, useEffect, useCallback } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ActivityIndicator } from 'react-native';
import useWebSocket from '../hooks/useWebSocket';
import { WS_API_BASE } from '../config/backend';

export default function AudioPlayer({ text, autoPlay = false }) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const audioChunksRef = useRef([]);
  const chunkFlushTimerRef = useRef(null);
  const audioRef = useRef(null);
  const playAudioHTTP = useCallback(async () => {
    try {
      // For now, use browser's built-in TTS as fallback
      // In production, you'd call your TTS API
      if ('speechSynthesis' in window) {
        const utterance = new SpeechSynthesisUtterance(text);
        utterance.lang = 'fi-FI'; // Finnish
        utterance.onend = () => {
          setIsPlaying(false);
          setIsLoading(false);
        };
        window.speechSynthesis.speak(utterance);
      } else {
        alert('Audio playback not supported in this environment');
        setIsLoading(false);
        setIsPlaying(false);
      }
    } catch (error) {
      console.error('Error with HTTP TTS:', error);
      setIsLoading(false);
      setIsPlaying(false);
    }
  }, [text]);
  const handleWsMessage = useCallback(
    (data) => {
      // Text frames may carry errors
      if (typeof data === 'string') {
        if (data.startsWith('error')) {
          playAudioHTTP();
        }
        return;
      }

      // Binary frames are audio chunks (Blob or ArrayBuffer)
      let blob;
      if (data instanceof Blob) {
        blob = data;
      } else if (data instanceof ArrayBuffer) {
        blob = new Blob([data], { type: 'audio/ogg; codecs=opus' });
      } else {
        return;
      }

      audioChunksRef.current.push(blob);

      // Debounce playback start until stream quiets down
      if (chunkFlushTimerRef.current) {
        clearTimeout(chunkFlushTimerRef.current);
      }
      chunkFlushTimerRef.current = setTimeout(() => {
        flushAndPlay();
      }, 250);
    },
    [playAudioHTTP, flushAndPlay]
  );
  const handleWsError = useCallback((error) => {
    console.error('TTS WebSocket error:', error);
    playAudioHTTP();
  }, [playAudioHTTP]);
  const { connect, send, isConnected, close, connectionError } = useWebSocket(
    handleWsMessage,
    handleWsError,
    { autoReconnect: false }
  );

  useEffect(() => {
    if (autoPlay && text) {
      playAudio();
    }
    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
      }
      if (chunkFlushTimerRef.current) {
        clearTimeout(chunkFlushTimerRef.current);
      }
      close();
    };
  }, [text, autoPlay, close, playAudio]);

  const playAudio = useCallback(async () => {
    if (!text || !text.trim()) {
      alert('No text to speak');
      return;
    }

    setIsLoading(true);
    setIsPlaying(true);
    audioChunksRef.current = [];

    try {
      // Connect to TTS WebSocket
      const wsUrl = `${WS_API_BASE}/voice/tts-stream`;
      connect(wsUrl);

      const sendPayload = () => {
        send(JSON.stringify({ text }));
      };

      // Retry a few times for slower connections before falling back
      const waitForConnection = (attempt = 0) => {
        if (isConnected) {
          sendPayload();
        } else if (attempt < 10) {
          setTimeout(() => waitForConnection(attempt + 1), 150);
        } else {
          console.error('TTS WebSocket failed to connect. Falling back to HTTP TTS.');
          playAudioHTTP();
        }
      };

      waitForConnection();
    } catch (error) {
      console.error('Error playing audio:', error);
      playAudioHTTP();
    }
  }, [text, isConnected, send, playAudioHTTP, connect]);

  const stopAudio = () => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current = null;
    }
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
    }
    setIsPlaying(false);
    setIsLoading(false);
  };

  const flushAndPlay = useCallback(() => {
    if (!audioChunksRef.current.length) return;

    const blob = new Blob(audioChunksRef.current, { type: 'audio/ogg; codecs=opus' });
    const url = URL.createObjectURL(blob);

    if (audioRef.current) {
      audioRef.current.pause();
      URL.revokeObjectURL(audioRef.current.src);
    }

    const audioEl = new Audio(url);
    audioRef.current = audioEl;
    audioEl.onended = () => {
      setIsPlaying(false);
      setIsLoading(false);
      close();
    };
    audioEl.onerror = () => {
      playAudioHTTP();
    };
    audioEl.play().catch(() => {
      playAudioHTTP();
    });
  }, [close, playAudioHTTP]);

  if (!text) {
    return null;
  }

  return (
    <View style={styles.container}>
      <TouchableOpacity
        style={[styles.button, isPlaying && styles.buttonPlaying]}
        onPress={isPlaying ? stopAudio : playAudio}
        disabled={isLoading}
      >
        {isLoading ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <Text style={styles.buttonText}>
            {isPlaying ? '⏹ Stop' : '🔊 Play Audio'}
          </Text>
        )}
      </TouchableOpacity>
      {text && (
        <Text style={styles.textPreview} numberOfLines={2}>
          {text}
        </Text>
      )}
      {connectionError && (
        <Text style={styles.errorText}>TTS connection issue. Using fallback.</Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: 8,
  },
  button: {
    backgroundColor: '#24CBA4',
    padding: 12,
    borderRadius: 12,
    alignItems: 'center',
  },
  buttonPlaying: {
    backgroundColor: '#dc2626',
  },
  buttonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  textPreview: {
    fontSize: 12,
    color: '#64748b',
    fontStyle: 'italic',
  },
  errorText: {
    fontSize: 12,
    color: '#dc2626',
  },
});
