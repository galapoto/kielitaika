// Premium Conversation Screen with ambient clouds + voice orb

import React, { useEffect, useRef, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TextInput, TouchableOpacity, Alert } from 'react-native';
import SceneBackground from '../components/SceneBackground';
import VoiceOrb from '../components/VoiceOrb';
import TutorBubble from '../components/TutorBubble';
import UserBubble from '../components/UserBubble';
import MicButton from '../components/MicButton';
import { colors } from '../styles/colors';
import { spacing } from '../styles/spacing';
import { typography } from '../styles/typography';
import { radius } from '../styles/radius';
import { shadows } from '../styles/shadows';
import { sendMessage } from '../utils/api';
import { useSound } from '../hooks/useSound';
import { useAudioRecorder } from '../hooks/useAudioRecorder';
import { useConversationSocket } from '../hooks/useConversationSocket';
import { transcribeAudio } from '../services/sttService';
import { useAmbientSoundscape } from '../soundscapes/useAmbientSoundscape';
import { useAuth } from '../context/AuthContext';
import VoiceInputIndicator from '../components/mic/VoiceInputIndicator';
import { useRukaStore } from '../state/useRukaStore';

export default function ConversationScreen() {
  const [messages, setMessages] = useState([]);
  const [inputText, setInputText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [aiSpeaking, setAiSpeaking] = useState(false);
  const scrollRef = useRef(null);
  const { playTap, playMicOn } = useSound();
  const { startRecording, stopRecording, isRecording } = useAudioRecorder();
  const { user } = useAuth();
  const { messages: wsMessages, sendUserMessage, connected } = useConversationSocket(user?.id);
  const { setAmplitude } = useRukaStore();
  useAmbientSoundscape({ preset: 'nordicCalm', userSpeaking: isRecording, aiSpeaking });
  
  // Update Ruka store amplitude based on recording state
  React.useEffect(() => {
    setAmplitude(isRecording ? 0.6 : 0.1);
  }, [isRecording, setAmplitude]);

  const handleSend = async () => {
    const text = inputText.trim();
    if (!text || isLoading) return;
    playTap();
    const userMessage = { id: Date.now(), role: 'user', text };
    setMessages((prev) => [...prev, userMessage]);
    setInputText('');
    setIsLoading(true);
    
    // Use WebSocket if connected, otherwise fallback to HTTP
    if (connected) {
      sendUserMessage(text);
      // Response will come via WebSocket and be handled by the useEffect
    } else {
      try {
        const res = await sendMessage({ text });
        const aiText = res?.response?.reply || res?.response?.text || '...';
        setAiSpeaking(true);
        setMessages((prev) => [
          ...prev,
          { id: Date.now() + 1, role: 'assistant', text: aiText, grammar: res?.response?.grammar },
        ]);
      } catch (err) {
        setMessages((prev) => [
          ...prev,
          { id: Date.now() + 1, role: 'error', text: 'Something went wrong. Please try again.' },
        ]);
      } finally {
        setAiSpeaking(false);
        setIsLoading(false);
      }
    }
  };

  const handleMicPressIn = async () => {
    try {
      playMicOn();
      await startRecording();
    } catch (err) {
      Alert.alert('Recording Error', err.message || 'Failed to start recording');
    }
  };

  const handleMicPressOut = async () => {
    try {
      const audioUri = await stopRecording();
      if (audioUri) {
        setIsLoading(true);
        try {
          const result = await transcribeAudio(audioUri);
          const transcript = result?.transcript || result?.text || '';
          if (transcript.trim()) {
            // Add user message to local state
            const userMessage = { id: Date.now(), role: 'user', text: transcript };
            setMessages((prev) => [...prev, userMessage]);
            
            // Send via WebSocket if connected, otherwise fallback to HTTP
          if (connected) {
            sendUserMessage(transcript);
          } else {
            // Fallback to HTTP API
            const res = await sendMessage({ text: transcript });
            const aiText = res?.response?.reply || res?.response?.text || '...';
            setAiSpeaking(true);
            setMessages((prev) => [
              ...prev,
              { id: Date.now() + 1, role: 'assistant', text: aiText, grammar: res?.response?.grammar },
            ]);
          }
          }
        } catch (err) {
          Alert.alert('Transcription Error', err.message || 'Failed to transcribe audio');
        } finally {
          setAiSpeaking(false);
          setIsLoading(false);
        }
      }
    } catch (err) {
      Alert.alert('Recording Error', err.message || 'Failed to stop recording');
      setIsLoading(false);
    }
  };

  // Sync WebSocket messages to local state
  const processedMessageIds = useRef(new Set());
  useEffect(() => {
    if (wsMessages.length > 0) {
      wsMessages.forEach((wsMsg) => {
        // Only process assistant/error messages (user messages are added locally)
        if ((wsMsg.role === 'assistant' || wsMsg.role === 'error') && wsMsg.id) {
          // Avoid duplicates using message IDs
          if (!processedMessageIds.current.has(wsMsg.id)) {
            processedMessageIds.current.add(wsMsg.id);
            setMessages((prev) => {
              // Double-check we don't already have this message
              const exists = prev.some((m) => m.id === wsMsg.id);
              if (exists) return prev;
              return [...prev, { 
                id: wsMsg.id, 
                role: wsMsg.role, 
                text: wsMsg.text,
                grammar: wsMsg.grammar 
              }];
            });
            setIsLoading(false);
          }
        }
      });
    }
  }, [wsMessages]);

  useEffect(() => {
    scrollRef.current?.scrollToEnd({ animated: true });
  }, [messages]);

  const amplitudeLevel = isRecording ? 0.6 : 0.1;

  return (
    <View style={styles.container}>
      <SceneBackground
        sceneKey="aurora"
        orbEmotion="calm"
        aiSpeaking={false}
        amplitude={amplitudeLevel}
        season="winter"
      />
      <View style={styles.header}>
        <Text style={styles.title}>Conversation Practice</Text>
        <Text style={styles.subtitle}>Soft, calm, voice-first experience</Text>
      </View>

      {messages.length === 0 && (
        <View style={styles.orbSection}>
          <VoiceOrb
            amplitude={amplitudeLevel}
            mode={isRecording ? 'speaking' : 'idle'}
            season="winter"
          />
          <Text style={styles.orbHint}>
            Hold the mic and speak. I’ll reply with gentle guidance and corrections.
          </Text>
        </View>
      )}

      <ScrollView
        ref={scrollRef}
        style={styles.messages}
        contentContainerStyle={styles.messagesContent}
        showsVerticalScrollIndicator={false}
      >
        {messages.map((msg) => {
          if (msg.role === 'assistant') {
            return (
              <TutorBubble
                key={msg.id}
                message={msg.text}
                grammar={msg.grammar}
                isTyping={false}
              />
            );
          }
          if (msg.role === 'user') {
            return <UserBubble key={msg.id} text={msg.text} />;
          }
          return (
            <View key={msg.id} style={styles.errorBubble}>
              <Text style={styles.errorText}>{msg.text}</Text>
            </View>
          );
        })}
        {isLoading && (
          <Text style={styles.thinkingText}>Thinking…</Text>
        )}
      </ScrollView>

      <View style={styles.inputBar}>
        <MicButton onPressIn={handleMicPressIn} onPressOut={handleMicPressOut} disabled={isLoading} />
        <View style={styles.inputWrapper}>
          <TextInput
            style={styles.input}
            value={inputText}
            onChangeText={setInputText}
            placeholder="Type or speak your Finnish here..."
            placeholderTextColor={colors.textSoft}
            multiline
            onSubmitEditing={handleSend}
          />
        </View>
        <TouchableOpacity
          style={[styles.sendBtn, (!inputText.trim() || isLoading) && styles.sendBtnDisabled]}
          onPress={handleSend}
          disabled={!inputText.trim() || isLoading}
        >
          <Text style={styles.sendLabel}>Send</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.grayBg,
  },
  header: {
    paddingHorizontal: spacing.l,
    paddingTop: spacing.xl,
    paddingBottom: spacing.m,
  },
  title: {
    ...typography.titleL,
    color: colors.textMain,
    fontWeight: '700',
  },
  subtitle: {
    ...typography.bodySm,
    color: colors.textSoft,
    marginTop: spacing.xs,
  },
  orbSection: {
    alignItems: 'center',
    paddingHorizontal: spacing.l,
    paddingBottom: spacing.m,
  },
  orbHint: {
    ...typography.bodySm,
    color: colors.textSoft,
    textAlign: 'center',
    marginTop: spacing.m,
  },
  messages: {
    flex: 1,
    paddingHorizontal: spacing.l,
  },
  messagesContent: {
    paddingBottom: spacing.xl,
    gap: spacing.s,
  },
  errorBubble: {
    alignSelf: 'flex-start',
    backgroundColor: '#fee2e2',
    padding: spacing.m,
    borderRadius: radius.m,
    borderWidth: 1,
    borderColor: '#fca5a5',
  },
  errorText: {
    color: '#b91c1c',
  },
  thinkingText: {
    ...typography.bodySm,
    color: colors.textSoft,
    paddingVertical: spacing.s,
  },
  inputBar: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    paddingHorizontal: spacing.l,
    paddingVertical: spacing.m,
    gap: spacing.m,
    backgroundColor: colors.white,
    borderTopWidth: 1,
    borderTopColor: colors.grayLine,
  },
  inputWrapper: {
    flex: 1,
    backgroundColor: colors.white,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: colors.grayLine,
    paddingHorizontal: spacing.m,
    paddingVertical: spacing.s,
    ...shadows.s,
  },
  input: {
    ...typography.body,
    color: colors.textMain,
    minHeight: 40,
  },
  sendBtn: {
    backgroundColor: colors.blueMain,
    paddingHorizontal: spacing.l,
    paddingVertical: spacing.s,
    borderRadius: 16,
    ...shadows.s,
  },
  sendBtnDisabled: {
    backgroundColor: colors.grayLine,
  },
  sendLabel: {
    ...typography.bodySm,
    color: colors.white,
    fontWeight: '700',
  },
});
