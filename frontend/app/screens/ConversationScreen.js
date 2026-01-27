import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity } from 'react-native';
import Background from '../components/ui/Background';
import MicButton from '../components/MicButton';
import HomeButton from '../components/HomeButton';
import { useAuth } from '../context/AuthContext';
import { useConversationSocket } from '../hooks/useConversationSocket';
import { useVoiceStreaming } from '../hooks/useVoiceStreaming';
import { useVoice } from '../hooks/useVoice';
import {
  advanceSpeakingTurn,
  completeSpeakingSession,
  setSpeakingTurnAiTranscript,
  setSpeakingTurnUserTranscript,
} from '../utils/speakingAttempts';
import { useSpeakingSessionContext } from '../context/SpeakingSessionContext';

/**
 * ConversationScreen (SpeakingSession contract)
 * - Live mode: current turn only, no Previous, mic active, audio playback allowed.
 * - Review mode: purely textual paging, no mic/audio, transcripts read-only.
 * - Transcripts are engine-owned (no local conversation history state).
 */
export default function ConversationScreen({ navigation, route } = {}) {
  const { level = 'A1', path = 'general', field = null, type = 'speaking' } = route?.params || {};

  const { user } = useAuth();
  const socketUserId = user?.id || null;
  const { messages: wsMessages, sendUserMessage, connected } = useConversationSocket(socketUserId);

  // Get session from context (provided by SpeakingScreenWrapper)
  const { sessionId, session, status: sessionStatus, currentTurnIndex: turnIndex, currentTurn: turn } = useSpeakingSessionContext();
  const aiText = turn?.aiSpeech?.transcript || '';
  const userText = turn?.userSpeech?.transcript || '';

  const [reviewTurnIndex, setReviewTurnIndex] = useState(0);
  const [inputText, setInputText] = useState('');

  const lastAiMessageIdRef = useRef(null);
  const lastSpokenTurnRef = useRef(-1);
  const { speak } = useVoice();

  const handleUserUtterance = useCallback(
    async (text) => {
      if (sessionStatus === 'completed') return;
      const normalized = String(text || '').trim();
      if (!normalized) return;
      // Store user transcript in engine first
      setSpeakingTurnUserTranscript(sessionId, turnIndex, normalized);
      setInputText('');
      // Then send to backend via WebSocket
      try {
        if (sendUserMessage && connected) {
          sendUserMessage(normalized, { level, path, profession: field });
        } else {
          console.warn('Conversation WebSocket not connected. Message not sent.');
        }
      } catch (err) {
        console.error('Failed to send user message:', err);
        // transport failures are ignored at UI level
      }
    },
    [field, level, path, sendUserMessage, connected, sessionId, sessionStatus, turnIndex]
  );

  const { startRecording, stopRecording, isRecording, isProcessing } = useVoiceStreaming({
    onTranscriptComplete: async (sttText) => {
      await handleUserUtterance(sttText);
    },
  });

  useEffect(() => {
    if (sessionStatus !== 'completed') return;
    try {
      stopRecording?.();
    } catch (_) {
      // ignore
    }
  }, [sessionStatus, stopRecording]);

  // Store latest AI message as transcript for the current turn.
  // Only process new messages that arrive after the current turn's user message was sent.
  useEffect(() => {
    if (sessionStatus === 'completed') return;
    if (!Array.isArray(wsMessages) || wsMessages.length === 0) return;

    // Find the most recent assistant message
    const lastAssistant = [...wsMessages].reverse().find((m) => m?.role === 'assistant' && m?.text);
    if (!lastAssistant) return;

    const msgId = lastAssistant.id || lastAssistant.ts || lastAssistant.createdAt || lastAssistant.text;
    // Skip if this is the same message we already processed
    if (msgId === lastAiMessageIdRef.current) return;
    
    // Only update if we have a user transcript for this turn (ensures AI response matches current turn)
    const currentUserText = turn?.userSpeech?.transcript;
    if (!currentUserText) {
      // No user message for this turn yet, wait for it
      return;
    }

    lastAiMessageIdRef.current = msgId;
    setSpeakingTurnAiTranscript(sessionId, turnIndex, String(lastAssistant.text || ''), {
      isConclusive: turnIndex >= 4,
    });
  }, [sessionId, sessionStatus, turnIndex, wsMessages, turn?.userSpeech?.transcript]);

  // Live-mode audio playback only (never in review mode).
  useEffect(() => {
    if (sessionStatus !== 'live') return;
    if (!aiText) return;
    if (turnIndex === lastSpokenTurnRef.current) return;

    lastSpokenTurnRef.current = turnIndex;
    (async () => {
      try {
        await speak(aiText, 'conversation');
      } catch (_) {
        // ignore TTS errors
      } finally {
        if (turnIndex >= 4) completeSpeakingSession(sessionId);
      }
    })();
  }, [aiText, completeSpeakingSession, sessionId, sessionStatus, speak, turnIndex]);

  // REVIEW MODE
  if (sessionStatus === 'completed') {
    const turns = session?.turns || [];
    const idx = Math.max(0, Math.min(turns.length - 1, reviewTurnIndex));
    const t = turns[idx] || null;
    return (
      <Background module="conversation" variant="blue">
        <View style={styles.container}>
          <View style={styles.card}>
            <Text style={styles.cardLabel}>Tekoäly</Text>
            <Text style={styles.cardText}>{t?.aiSpeech?.transcript || '—'}</Text>
          </View>
          <View style={styles.card}>
            <Text style={styles.cardLabel}>Sinä</Text>
            <Text style={styles.cardText}>{t?.userSpeech?.transcript || '—'}</Text>
          </View>

          <View style={styles.controlsRow}>
            <TouchableOpacity
              style={[styles.controlButton, idx === 0 && styles.controlButtonDisabled]}
              disabled={idx === 0}
              onPress={() => setReviewTurnIndex((n) => Math.max(0, n - 1))}
            >
              <Text style={styles.controlButtonText}>Edellinen</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.controlButton, idx >= turns.length - 1 && styles.controlButtonDisabled]}
              disabled={idx >= turns.length - 1}
              onPress={() => setReviewTurnIndex((n) => Math.min(turns.length - 1, n + 1))}
            >
              <Text style={styles.controlButtonText}>Seuraava</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Background>
    );
  }

  const canAdvance = Boolean(aiText && userText) && turnIndex < 4;

  return (
    <Background module="conversation" variant="blue">
      <View style={styles.container}>
        <View style={styles.headerRow}>
          <Text style={styles.title}>Keskustelu</Text>
          <HomeButton navigation={navigation} />
        </View>
        <Text style={styles.subtitle}>
          {connected ? 'Yhdistetty' : 'Ei yhteyttä'} · vuoro {turnIndex + 1}/5
        </Text>

        <View style={styles.card}>
          <Text style={styles.cardLabel}>Tekoäly</Text>
          <Text style={styles.cardText}>{aiText || '…'}</Text>
        </View>
        <View style={styles.card}>
          <Text style={styles.cardLabel}>Sinä</Text>
          <Text style={styles.cardText}>{userText || '…'}</Text>
        </View>

        <View style={styles.inputRow}>
          <MicButton
            onPressIn={() => startRecording?.({ userInitiated: true, userGesture: true })}
            onPressOut={() => stopRecording?.()}
            disabled={sessionStatus === 'completed' || isProcessing}
            isActive={isRecording}
          />
          <TextInput
            style={styles.input}
            value={inputText}
            onChangeText={setInputText}
            placeholder="Kirjoita tai puhu suomeksi…"
            placeholderTextColor="rgba(255,255,255,0.6)"
          />
          <TouchableOpacity style={styles.sendButton} onPress={() => handleUserUtterance(inputText)}>
            <Text style={styles.sendButtonText}>Lähetä</Text>
          </TouchableOpacity>
        </View>

        <TouchableOpacity
          style={[styles.nextButton, !canAdvance && styles.controlButtonDisabled]}
          disabled={!canAdvance}
          onPress={() => advanceSpeakingTurn(sessionId)}
        >
          <Text style={styles.nextButtonText}>Seuraava</Text>
        </TouchableOpacity>
      </View>
    </Background>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 18,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  title: {
    color: '#e2e8f0',
    fontSize: 18,
    fontWeight: '700',
  },
  subtitle: {
    color: 'rgba(255,255,255,0.70)',
    marginBottom: 14,
  },
  card: {
    backgroundColor: 'rgba(15, 23, 42, 0.85)',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(148, 163, 184, 0.22)',
    padding: 14,
    marginBottom: 12,
  },
  cardLabel: {
    color: 'rgba(125, 211, 252, 0.95)',
    fontSize: 12,
    fontWeight: '700',
    marginBottom: 6,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  cardText: {
    color: '#e2e8f0',
    fontSize: 14,
    lineHeight: 18,
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginTop: 'auto',
  },
  input: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.70)',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: 'rgba(148, 163, 184, 0.22)',
    paddingHorizontal: 12,
    paddingVertical: 10,
    color: '#e2e8f0',
  },
  sendButton: {
    backgroundColor: 'rgba(56, 189, 248, 0.18)',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: 'rgba(56, 189, 248, 0.35)',
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  sendButtonText: {
    color: '#e2e8f0',
    fontWeight: '700',
  },
  nextButton: {
    marginTop: 12,
    backgroundColor: 'rgba(56, 189, 248, 0.18)',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: 'rgba(56, 189, 248, 0.35)',
    paddingVertical: 12,
    alignItems: 'center',
  },
  nextButtonText: {
    color: '#e2e8f0',
    fontWeight: '700',
  },
  controlsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
    marginTop: 10,
  },
  controlButton: {
    flex: 1,
    backgroundColor: 'rgba(56, 189, 248, 0.18)',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: 'rgba(56, 189, 248, 0.35)',
    paddingVertical: 12,
    alignItems: 'center',
  },
  controlButtonDisabled: {
    opacity: 0.5,
  },
  controlButtonText: {
    color: '#e2e8f0',
    fontWeight: '700',
  },
});
