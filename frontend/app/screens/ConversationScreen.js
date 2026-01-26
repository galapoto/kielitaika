// Premium Conversation Screen with ambient clouds + voice orb
// Enhanced with real-time WebSocket streaming, VAD, and state management

import React, { useEffect, useRef, useState, useCallback, useMemo } from 'react';
import { View, Text, StyleSheet, ScrollView, TextInput, ActivityIndicator, TouchableOpacity } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Background from '../components/ui/Background';
import VoiceOrb from '../components/VoiceOrb';
import AIVoiceVisualization from '../ui/components/AIVoiceVisualization';
import TutorBubble from '../components/TutorBubble';
import UserBubble from '../components/UserBubble';
import MicButton from '../components/MicButton';
import { SkeletonBubble } from '../components/SkeletonScreen';
import { useToast } from '../context/ToastContext';
import NetworkStatus, { useNetworkStatus } from '../components/NetworkStatus';
import { colors } from '../styles/colors';
import { spacing } from '../styles/spacing';
import { typography } from '../styles/typography';
import { radius } from '../styles/radius';
import { shadows } from '../styles/shadows';
import { sendMessage, saveConversationBookmark, listConversationBookmarks, sendAnalyticsEvent } from '../utils/api';
import { useSound } from '../hooks/useSound';
import { useVoiceStreaming } from '../hooks/useVoiceStreaming';
import { useConversationSocket } from '../hooks/useConversationSocket';
import { useAmbientSoundscape } from '../soundscapes/useAmbientSoundscape';
import { useAuth } from '../context/AuthContext';
import { useRukaStore } from '../state/useRukaStore';
import TTSProviderIndicator from '../components/TTSProviderIndicator';
import { useVoice } from '../hooks/useVoice';
import { RukaButton } from '../ui';
import { IconPlay, IconLightning } from '../ui/icons/IconPack';
import CoachCard from '../components/CoachCard';
import SuggestionChip from '../components/SuggestionChip';
import GoalMeter from '../components/GoalMeter';
import ProfileImage from '../components/ProfileImage';
import HomeButton from '../components/HomeButton';
import AbstractNetworkVisualization from '../components/AbstractNetworkVisualization';

export default function ConversationScreen({ navigation, route } = {}) {
  // Get route params for listening/speaking practice with specific levels
  const { 
    level = 'A1', 
    path = 'general', 
    field = null,
    type = 'speaking', // 'speaking' or 'listening'
    mode = 'practice', // 'practice' or 'review'
  } = route?.params || {};
  
  const [messages, setMessages] = useState([]);
  const [inputText, setInputText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isAiTtsPlaying, setIsAiTtsPlaying] = useState(false);
  const [error, setError] = useState(null);
  const [goalProgress, setGoalProgress] = useState(0.1);
  const [bookmarks, setBookmarks] = useState([]);
  const [bookmarksVisible, setBookmarksVisible] = useState(false);
  const [ttftMs, setTtftMs] = useState(null);
  const [correctionAccepted, setCorrectionAccepted] = useState(0);
  const [bargeInCount, setBargeInCount] = useState(0);
  const targetTurns = 8;
  const scrollRef = useRef(null);
  const sendStartRef = useRef(null);
  const lastSavedRef = useRef(null);
  const hasUserInteractedRef = useRef(false);
  const lastAiSpokeTimeRef = useRef(Date.now());
  const markUserInteracted = useCallback(() => {
    hasUserInteractedRef.current = true;
  }, []);
  const { playTap, playMicOn, playMicOff } = useSound();
  const { user } = useAuth();

  // After clearing app data or during auth refresh, `/auth/me` can temporarily be 401,
  // which makes `user` null. We still want conversation to work using the persisted auth payload.
  const [socketUserId, setSocketUserId] = useState(user?.id || null);
  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const raw = await AsyncStorage.getItem('@ruka_auth');
        if (!raw) return;
        const parsed = JSON.parse(raw);
        const id = parsed?.user?.id;
        if (!cancelled && id) setSocketUserId(id);
      } catch (_) {
        // ignore
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);
  useEffect(() => {
    if (user?.id) setSocketUserId(user.id);
  }, [user?.id]);
  const { 
    messages: wsMessages, 
    sendUserMessage, 
    sendControl,
    connected,
    status: socketStatus,
    coachEvents,
    suggestion,
    meta,
    resetCoach,
    partial,
    floor,
    tokens,
  } = useConversationSocket(socketUserId);
  const { setAmplitude } = useRukaStore();
  const { showError, showSuccess } = useToast();
  const DEBUG_MODE = typeof __DEV__ !== 'undefined' ? __DEV__ : false;
  const [debugEvents, setDebugEvents] = useState([]);
  const addDebugEvent = useCallback(
    (label, detail) => {
      if (!DEBUG_MODE) return;
      const entry = {
        label,
        detail,
        timestamp: new Date().toLocaleTimeString(),
      };
      setDebugEvents((prev) => [...prev.slice(-5), entry]);
      console.info('[Conversation Debug]', label, detail);
    },
    [DEBUG_MODE]
  );
  
  // Dual-TTS system hook (for provider tracking and future use)
  const { speak, provider: ttsProvider } = useVoice();
  const speakAssistant = useCallback(
    async (text) => {
      const t = (text || '').trim();
      if (!t) return;
      addDebugEvent('tts_request', { text: t });
      
      // CRITICAL: Stop any active recording before AI speaks to prevent feedback loop
      // (AI speech getting transcribed and sent back as user input)
      if (isRecording) {
        try {
          await stopRecording();
        } catch (_) {
          // ignore stop errors
        }
      }
      
      setIsAiTtsPlaying(true);
      lastAiSpokeTimeRef.current = Date.now(); // Track when AI starts speaking
      try {
        await speak(t, 'conversation');
      } finally {
        setIsAiTtsPlaying(false);
        // Keep the timestamp for cooldown period (AI might have just finished)
        lastAiSpokeTimeRef.current = Date.now();
      }
      addDebugEvent('tts_complete', { text: t });
    },
    [speak, isRecording, stopRecording]
  );

  const handleVoiceState = useCallback(
    (state) => {
      addDebugEvent('voice_state', {
        isRecording: state.isRecording,
        isProcessing: state.isProcessing,
        isListening: state.isListening,
        isSpeaking: state.isSpeaking,
      });
    },
    [addDebugEvent]
  );

  const handleTtsChunk = useCallback(
    () => {
      addDebugEvent('tts_chunk', { emittedAt: Date.now() });
    },
    [addDebugEvent]
  );

  // Enhanced voice streaming with WebSocket, VAD, and state management
  // Note: Callbacks are defined inline but kept lightweight
  const {
    isRecording,
    isProcessing,
    isListening,
    isSpeaking,
    transcript: liveTranscript,
    startRecording,
    stopRecording,
    speakText,
    stopSpeaking,
  } = useVoiceStreaming({
    onStateChange: handleVoiceState,
    onTranscript: useCallback(() => {
      // Real-time transcript updates while speaking - no-op for now
    }, []),
    onTranscriptComplete: useCallback(async (finalTranscript) => {
      // Auto-send when transcription completes
      const normalized = (finalTranscript || '').trim();
      // Guard: ignore empty / noise-only transcripts
      if (normalized.length < 2) return;
      if (!/[A-Za-zÄÖÅäöå0-9]/.test(normalized)) return;
      
      const recentAiMessages = messages.filter(m => m.role === 'assistant').slice(-5); // Check last 5 messages
      const aiTexts = recentAiMessages.map(m => (m.text || '').toLowerCase().trim());
      const normalizedLower = normalized.toLowerCase();

      const timeSinceAiSpoke = Date.now() - lastAiSpokeTimeRef.current;
      const aiRecentlySpoke = isAiTtsPlaying || timeSinceAiSpoke < 4000;

      const matchesAiSpeech = aiTexts.some((aiText) => {
        if (!aiText) return false;
        if (aiText === normalizedLower) return true;
        if (aiText.startsWith(normalizedLower) || normalizedLower.startsWith(aiText)) return true;
        if (aiText.includes(normalizedLower) && normalizedLower.length > 3) return true;
        if (normalizedLower.includes(aiText) && aiText.length > 3) return true;
        return false;
      });

      if (aiRecentlySpoke && matchesAiSpeech) {
        addDebugEvent('filtered_as_ai', {
          normalized: normalizedLower,
          matchesAiSpeech,
          aiRecentlySpoke,
        });
        return;
      }

     
      const userMessage = { id: Date.now(), role: 'user', text: normalized };
      setMessages((prev) => [...prev, userMessage]);
      markUserInteracted();
      // Send via WebSocket if connected, otherwise fallback to HTTP
      // Include level, path, and field for context-aware conversations
      const messageOptions = {
        level,
        path,
        ...(field && { profession: field }),
      };
      
      if (connected) {
        sendUserMessage(normalized, messageOptions);
        addDebugEvent('send_ws', { text: normalized, options: messageOptions });
      } else {
        try {
          setIsLoading(true);
          const messagePayload = {
            text: normalized,
            level,
            path,
            ...(field && { field }),
          };
          const res = await sendMessage(messagePayload);
          const aiText = res?.response?.reply || res?.response?.text || '...';
          setMessages((prev) => [
            ...prev,
            { id: Date.now() + 1, role: 'assistant', text: aiText, grammar: res?.response?.grammar },
          ]);
          // For listening mode, always speak the AI response
          // For speaking mode, speak if enabled
          if (type === 'listening' || !type || type === 'speaking') {
            try {
              await speakAssistant(aiText || '');
            } catch (_) {
              // ignore TTS errors
            }
          }
        } catch (err) {
          addDebugEvent('send_error', { message: err?.message });
          const errorMessage = err?.message || 'Viestin lähetys epäonnistui. Yritä uudelleen.';
          setError(errorMessage);
          showError(errorMessage);
          setMessages((prev) => [
            ...prev,
            { id: Date.now() + 1, role: 'error', text: errorMessage },
          ]);
        } finally {
          setIsLoading(false);
        }
      }
    }, [connected, sendUserMessage, showError, markUserInteracted, speakAssistant, messages, isAiTtsPlaying]),
    onTTSAudio: handleTtsChunk,
    vadSilenceThreshold: 2000, // Auto-stop after 2 seconds of silence
  });

  // Optimize: Only enable soundscape when actively in conversation
  const soundscapeEnabled = useMemo(() => 
    messages.length > 0 || isRecording || isSpeaking,
    [messages.length, isRecording, isSpeaking]
  );
  
  useAmbientSoundscape({ 
    preset: 'nordicCalm', 
    userSpeaking: isRecording, 
    aiSpeaking: isSpeaking,
    enabled: soundscapeEnabled,
  });
  
  // Barge-in: stop AI speech when user starts talking
  useEffect(() => {
    if (isRecording) {
      stopSpeaking?.();
    }
  }, [isRecording, stopSpeaking]);

  // Track barge-ins and send cancel control when user interrupts AI
  const wasRecording = useRef(false);
  // Offline cache keys
  const CACHE_KEY = '@ruka_convo_messages';
  const CACHE_META_KEY = '@ruka_convo_meta';
  // NOTE: We intentionally avoid streaming/assembling TTS chunks here.
  // We use the unified `/tts` playback path (`useVoice().speak`) for stability.

  // Restore last session messages for resilience
  useEffect(() => {
    (async () => {
      try {
        const cached = await AsyncStorage.getItem(CACHE_KEY);
        if (cached) {
          const parsed = JSON.parse(cached);
          if (Array.isArray(parsed)) {
            setMessages(parsed);
          }
        }
        const cachedMeta = await AsyncStorage.getItem(CACHE_META_KEY);
        if (cachedMeta) {
          const parsedMeta = JSON.parse(cachedMeta);
          if (parsedMeta.ttftMs) setTtftMs(parsedMeta.ttftMs);
          if (parsedMeta.bargeInCount) setBargeInCount(parsedMeta.bargeInCount);
        }
      } catch (e) {
        // ignore cache errors
      }
    })();
  }, []);

  // Persist messages + small meta
  useEffect(() => {
    try {
      if (messages !== lastSavedRef.current) {
        const trimmed = messages.slice(-30);
        AsyncStorage.setItem(CACHE_KEY, JSON.stringify(trimmed));
        AsyncStorage.setItem(CACHE_META_KEY, JSON.stringify({ ttftMs, bargeInCount }));
        lastSavedRef.current = messages;
      }
    } catch (e) {
      // ignore persistence errors
    }
  }, [messages, ttftMs, bargeInCount]);

  useEffect(() => {
    if (isRecording && !wasRecording.current) {
      if (isSpeaking || floor === 'ai') {
        sendControl?.('cancel_tts');
        setBargeInCount((c) => c + 1);
        sendAnalyticsEvent('barge_in', { floor, ttft_ms: ttftMs || undefined }).catch(() => {});
      }
    }
    wasRecording.current = isRecording;
  }, [isRecording, isSpeaking, floor, sendControl]);

  // NOTE: We intentionally do NOT auto-play historical/cached messages on load.
  // Speaking is triggered only for new assistant replies after the user interacts.

  // Update Ruka store amplitude based on recording state
  useEffect(() => {
    setAmplitude(isRecording ? 0.6 : (isSpeaking ? 0.4 : 0.1));
  }, [isRecording, isSpeaking, setAmplitude]);

  // Light HUD progress: tie to conversation turn meta (optimized with useMemo)
  const goalProgressMemo = useMemo(() => {
    if (meta?.conversation_turn !== undefined) {
      return Math.min(1, (meta.conversation_turn + 1) / 8); // target 8 turns per session
    }
    return goalProgress;
  }, [meta?.conversation_turn, goalProgress]);
  
  // Update state only when value actually changes
  useEffect(() => {
    if (goalProgressMemo !== goalProgress) {
      setGoalProgress(goalProgressMemo);
    }
  }, [goalProgressMemo, goalProgress]);

  const loadBookmarks = useCallback(async () => {
    try {
      const res = await listConversationBookmarks();
      setBookmarks(res?.bookmarks || []);
    } catch (err) {
      showError(err?.message || 'Kirjanmerkkien lataus epäonnistui');
    }
  }, [showError]);

  const handleDrill = useCallback((mistake) => {
    const phrase = mistake?.correction || mistake?.explanation || mistake?.message;
    if (phrase) {
      setInputText(phrase);
      setCorrectionAccepted((c) => c + 1);
      showSuccess('Aloitetaan pikaharjoitus…');
      speakText?.(phrase);
      sendAnalyticsEvent('correction_accept', { phrase }).catch(() => {});
    } else {
      showError('Harjoituksen sisältöä ei ole saatavilla.');
    }
  }, [showError, showSuccess, speakText]);
  
  // Memoize coach encouragement handler
  const handleCoachEncouragement = useCallback(() => {
    speakText('Jatka vain, hienoa työtä!');
  }, [speakText]);

  const handleSend = useCallback(async () => {
    const text = inputText.trim();
    if (!text || isLoading) return;
    const start = Date.now();
    sendStartRef.current = start;
    playTap();
    const userMessage = { id: Date.now(), role: 'user', text };
    setMessages((prev) => [...prev, userMessage]);
    setInputText('');
    markUserInteracted();
    setIsLoading(true);
    
    // Use WebSocket if connected, otherwise fallback to HTTP
    // Include level, path, and field for context-aware conversations
    const messageOptions = {
      level,
      path,
      ...(field && { profession: field }),
    };
    
    if (connected) {
      sendUserMessage(text, messageOptions);
      // Response will come via WebSocket and be handled by the useEffect
    } else {
      try {
        const messagePayload = {
          text,
          level,
          path,
          ...(field && { field }),
        };
        const res = await sendMessage(messagePayload);
        const aiText = res?.response?.reply || res?.response?.text || '...';
        setMessages((prev) => [
          ...prev,
          { id: Date.now() + 1, role: 'assistant', text: aiText, grammar: res?.response?.grammar },
        ]);
        const ttftVal = Date.now() - start;
        setTtftMs(ttftVal);
        sendAnalyticsEvent('ttft', { ms: ttftVal }).catch(() => {});
        // Speak immediately in HTTP fallback mode
        try {
          await speakAssistant(aiText || '');
        } catch (_) {
          // ignore TTS errors
        }
      } catch (err) {
        const errorMessage = err?.message || 'Viestin lähetys epäonnistui. Yritä uudelleen.';
        setError(errorMessage);
        showError(errorMessage);
        setMessages((prev) => [
          ...prev,
          { id: Date.now() + 1, role: 'error', text: errorMessage },
        ]);
      } finally {
        setIsLoading(false);
      }
    }
  }, [inputText, isLoading, playTap, connected, sendUserMessage, speakText, showError, markUserInteracted, speakAssistant]);

  const handleMicPressIn = async () => {
    try {
      playMicOn();
      markUserInteracted();
      await startRecording();
    } catch (err) {
      // Silently handle errors - user feedback via Toast
      const errorMessage = err?.message || 'Nauhoituksen aloitus epäonnistui. Tarkista mikrofonin oikeudet asetuksista.';
      setError(errorMessage);
      showError(errorMessage);
    }
  };

  const handleMicPressOut = async () => {
    try {
      await stopRecording();
      playMicOff();
      // Transcription and sending is handled by onTranscriptComplete callback
    } catch (err) {
      // Silently handle errors - user feedback via Toast
      const errorMessage = err?.message || 'Nauhoituksen lopetus epäonnistui';
      setError(errorMessage);
      showError(errorMessage);
    }
  };

  // Sync WebSocket messages to local state (optimized to prevent unnecessary re-renders)
  const processedMessageIds = useRef(new Set());
  const lastProcessedLength = useRef(0);
  
  useEffect(() => {
    // Only process if new messages arrived
    if (wsMessages.length === 0 || wsMessages.length === lastProcessedLength.current) return;
    
    // Batch process messages to avoid multiple state updates
    // CRITICAL: Only process assistant/error messages. Never add user messages from WebSocket
    // (user messages come from onTranscriptComplete or handleSend, not from backend)
    const newMessages = [];
    wsMessages.slice(lastProcessedLength.current).forEach((wsMsg) => {
      // Only accept assistant or error messages from WebSocket
      // Ignore any message with role: 'user' from backend (should never happen, but safety check)
      if ((wsMsg.role === 'assistant' || wsMsg.role === 'error') && wsMsg.id && wsMsg.role !== 'user') {
        if (!processedMessageIds.current.has(wsMsg.id)) {
          processedMessageIds.current.add(wsMsg.id);
          newMessages.push({
            id: wsMsg.id,
            role: wsMsg.role,
            text: wsMsg.text,
            grammar: wsMsg.grammar,
          });
        }
      }
    });
    
    lastProcessedLength.current = wsMessages.length;
    
    if (newMessages.length > 0) {
      setMessages((prev) => {
        // Filter out duplicates in one pass
        const existingIds = new Set(prev.map(m => m.id));
        const uniqueNew = newMessages.filter(m => !existingIds.has(m.id));
        if (uniqueNew.length === 0) return prev;
        return [...prev, ...uniqueNew];
      });
      setIsLoading(false);
      const now = Date.now();
      if (sendStartRef.current && newMessages.some(m => m.role === 'assistant')) {
        const ttftVal = now - sendStartRef.current;
        setTtftMs(ttftVal);
        sendStartRef.current = null;
        sendAnalyticsEvent('ttft', { ms: ttftVal }).catch(() => {});
      }
      
      // Auto-speak only after the user has interacted (non-blocking)
      const lastAssistant = newMessages.filter(m => m.role === 'assistant' && m.text).pop();
      if (lastAssistant && lastAssistant.text && hasUserInteractedRef.current) {
        // Use setTimeout to avoid blocking the state update
        setTimeout(() => {
          try {
            speakAssistant(lastAssistant.text);
          } catch (e) {
            // Silently fail if TTS unavailable
          }
        }, 0);
      }
    }
  }, [wsMessages.length, speakAssistant]); // Only depend on length, not entire array

  // Optimize scroll: only scroll when new messages added, not on every render
  const messageCountRef = useRef(0);
  useEffect(() => {
    if (messages.length > messageCountRef.current) {
      messageCountRef.current = messages.length;
      // Use requestAnimationFrame for smoother scrolling
      requestAnimationFrame(() => {
        scrollRef.current?.scrollToEnd({ animated: true });
      });
    }
  }, [messages.length]);

  // Auto-start conversation for listening practice mode
  const hasAutoStartedRef = useRef(false);
  useEffect(() => {
    if (type === 'listening' && mode === 'practice' && messages.length === 0 && !isLoading && !hasAutoStartedRef.current) {
      hasAutoStartedRef.current = true;
      
      // Start with a greeting appropriate for the level
      const greetingMessages = {
        'A1': 'Hei! Tervetuloa suomen oppimiseen. Aloitetaan yksinkertaisella keskustelulla.',
        'A2': 'Hei! Tänään harjoittelemme kuuntelua. Kuuntele tarkasti ja vastaa kysymyksiin.',
        'B1': 'Hei! Tervetuloa keskusteluun. Tänään keskustelemme päivästäsi ja harrastuksistasi.',
        'B2': 'Hei! Aloitetaan keskustelu työstäsi ja tulevaisuuden suunnitelmistasi.',
        'C1': 'Hei! Tervetuloa syvempään keskusteluun. Keskustelemme yhteiskunnallisista aiheista.',
        'C2': 'Hei! Tervetuloa vaativaan keskusteluun. Keskustelemme monimutkaisista aiheista.',
      };
      const greeting = greetingMessages[level] || greetingMessages['A1'];
      
      // Auto-send initial message for listening practice
      const autoStart = async () => {
        const messageOptions = {
          level,
          path,
          ...(field && { profession: field }),
        };
        
        if (connected) {
          sendUserMessage(greeting, messageOptions);
        } else {
          try {
            setIsLoading(true);
            const res = await sendMessage({
              text: greeting,
              level,
              path,
              ...(field && { field }),
            });
            const aiText = res?.response?.reply || res?.response?.text || '...';
            setMessages([
              { id: Date.now(), role: 'assistant', text: aiText, grammar: res?.response?.grammar },
            ]);
            // Auto-play for listening mode
            try {
              await speakAssistant(aiText || '');
            } catch (_) {
              // ignore TTS errors
            }
          } catch (err) {
            console.error('[ConversationScreen] Auto-start failed:', err);
            hasAutoStartedRef.current = false; // Allow retry on error
          } finally {
            setIsLoading(false);
          }
        }
      };
      
      // Small delay to ensure component is fully mounted
      const timer = setTimeout(autoStart, 500);
      return () => clearTimeout(timer);
    }
    
    // Reset auto-start flag when type/mode changes
    if (type !== 'listening' || mode !== 'practice') {
      hasAutoStartedRef.current = false;
    }
  }, [type, mode, messages.length, isLoading, level, path, field, connected, sendUserMessage, speakAssistant]);

  // Suggested prompts for welcome screen
  const suggestedPrompts = type === 'listening' 
    ? [
        'Aloita keskustelu',
        'Kerro minulle päivästäsi',
        'Mitä teit tänään?',
        'Missä asut?',
        'Mikä on suosikkiruokasi?',
      ]
    : [
        'Hei! Minun nimi on ___ .',
        'Mitä kuuluu?',
        'Missä sinä asut?',
        'Minä opiskelen suomea.',
        'Voitko puhua hitaasti?',
      ];

  return (
    <Background module="conversation" variant="blue">
      <View style={styles.conversationContainer}>
        {/* Abstract Network Visualization (top half) */}
        <AbstractNetworkVisualization style={styles.networkVisualization} />
      
      {/* Welcome/Initial State */}
      {messages.length === 0 && !isRecording && !inputText && !isLoading && (
        <View style={styles.welcomeContainer}>
          <View style={styles.welcomeHeader}>
            <ProfileImage size={48} />
            <Text style={styles.greetingText}>
              {type === 'listening' && mode === 'practice' 
                ? `Kuunteluharjoitus – taso ${level.toUpperCase()}`
                : type === 'listening' && mode === 'review'
                ? `Kuuntelukertaus – taso ${level.toUpperCase()}`
                : `Hei, ${user?.name || 'opiskelija'}`}
            </Text>
            <HomeButton navigation={navigation} style={styles.homeButtonWelcome} />
          </View>
          {type === 'listening' && (
            <Text style={styles.listeningHint}>
              {mode === 'practice' 
                ? 'Keskustelu alkaa automaattisesti. Kuuntele tarkasti ja vastaa kysymyksiin.'
                : 'Tarkastele aiemmin kuultuja keskusteluja ja harjoittele kuuntelua.'}
            </Text>
          )}

          {/* Input Field */}
          <View style={styles.welcomeInputContainer}>
            <View style={styles.embossInputShell24}>
              <View pointerEvents="none" style={styles.embossHighlight24} />
              <TextInput
                style={styles.welcomeInput}
                placeholder="Kokeile kysyä…"
                placeholderTextColor="rgba(255,255,255,0.55)"
                value={inputText}
                onChangeText={setInputText}
                onSubmitEditing={handleSend}
              />
            </View>
          </View>

          {/* Suggested Prompts */}
          <View style={styles.suggestedPromptsContainer}>
            {suggestedPrompts.map((prompt, index) => (
              <TouchableOpacity
                key={index}
                style={styles.suggestedPromptCard}
                onPress={() => {
                  setInputText(prompt);
                  handleSend();
                }}
              >
                <View pointerEvents="none" style={styles.embossHighlight16} />
                <Text style={styles.suggestedPromptText}>{prompt}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      )}

      {/* Active Query/Voice Input State */}
      {(isRecording || inputText || messages.length > 0) && (
        <View style={styles.activeContainer}>
          {/* User Question Bubble */}
          {inputText && messages.length === 0 && (
            <View style={styles.userQuestionBubble}>
              <Text style={styles.userQuestionText}>{inputText}</Text>
            </View>
          )}

          {/* Voice Input Indicator - Active */}
          {isRecording && (
            <View style={styles.voiceIndicatorContainer}>
              <View style={[styles.voiceIndicator, styles.voiceIndicatorActive]}>
                <View style={styles.voiceIndicatorInner} />
              </View>
            </View>
          )}

          {/* Conversation Messages */}
          {messages.length > 0 && (
            <ScrollView
              ref={scrollRef}
              style={styles.messagesScrollView}
              contentContainerStyle={styles.messagesContent}
              showsVerticalScrollIndicator={false}
            >
              {messages.map((msg, index) => {
                const key = msg.id || `msg-${index}-${msg.role}`;
                if (msg.role === 'user') {
                  return (
                    <View key={key} style={styles.userBubbleContainer}>
                      <View style={styles.userBubble}>
                        <View pointerEvents="none" style={styles.embossHighlight20} />
                        <Text style={styles.userBubbleText}>{msg.text}</Text>
                      </View>
                    </View>
                  );
                }
                if (msg.role === 'assistant') {
                  return (
                    <View key={key} style={styles.aiBubbleContainer}>
                      <View style={styles.aiBubble}>
                        <View pointerEvents="none" style={styles.embossHighlight20} />
                        <Text style={styles.aiBubbleText}>{msg.text}</Text>
                      </View>
                    </View>
                  );
                }
                if (msg.role === 'error') {
                  return (
                    <View key={key} style={styles.aiBubbleContainer}>
                      <View style={styles.errorBubble}>
                        <View pointerEvents="none" style={styles.embossHighlight20} />
                        <Text style={styles.errorText}>{msg.text}</Text>
                      </View>
                    </View>
                  );
                }
                return null;
              })}
              {/* Streaming assistant partial (gives "live" feel after send) */}
              {!!partial && floor === 'ai' && (
                <View style={styles.aiBubbleContainer}>
                  <View style={styles.aiBubbleNew}>
                    <Text style={styles.aiBubbleTextNew}>{partial}</Text>
                  </View>
                </View>
              )}
              {/* While transcribing/sending voice, show clear state */}
              {isProcessing && (
                <View style={styles.aiBubbleContainer}>
                  <View style={styles.aiBubbleNew}>
                    <Text style={styles.aiBubbleTextNew}>Litteroidaan…</Text>
                  </View>
                </View>
              )}
              {isLoading && <ActivityIndicator size="small" color="#FFFFFF" style={styles.loadingIndicator} />}
            </ScrollView>
          )}

          {/* Voice Input Indicator - Idle State */}
          {!isRecording && messages.length > 0 && (
            <View style={styles.voiceIndicatorContainer}>
              <View style={styles.voiceIndicatorIdle}>
                <View style={styles.voiceIndicatorDot} />
              </View>
            </View>
          )}
        </View>
      )}

      {/* Input Bar - Keep existing functionality */}
      <View style={styles.inputBarNew}>
        <MicButton 
          onPressIn={handleMicPressIn} 
          onPressOut={handleMicPressOut} 
          disabled={isLoading || isSpeaking || isAiTtsPlaying}
          isActive={isRecording}
        />
        <View style={styles.inputWrapperNew}>
          <View style={styles.embossInputShell20}>
            <View pointerEvents="none" style={styles.embossHighlight20} />
            <TextInput
              style={styles.inputNew}
              value={inputText}
              onChangeText={setInputText}
              placeholder="Kirjoita tai puhu suomeksi tähän…"
              placeholderTextColor="rgba(255,255,255,0.55)"
              multiline
              onSubmitEditing={handleSend}
            />
          </View>
        </View>
        <TouchableOpacity
          style={styles.sendButton}
          onPress={handleSend}
          disabled={!inputText.trim() || isLoading}
        >
          <View pointerEvents="none" style={styles.embossHighlight20} />
          <Text style={styles.sendButtonText}>Lähetä</Text>
        </TouchableOpacity>
      </View>

      {/* Bottom Navigation Bar */}
      <View style={styles.bottomNavBar}>
        <TouchableOpacity style={styles.bottomNavButton}>
          <View pointerEvents="none" style={styles.embossHighlight20} />
          <Text style={styles.bottomNavIcon}>✕</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.bottomNavButton}>
          <View pointerEvents="none" style={styles.embossHighlight20} />
          <Text style={styles.bottomNavIcon}>📎</Text>
        </TouchableOpacity>
      </View>
      </View>
    </Background>
  );
}

const styles = StyleSheet.create({
  // Emboss highlights - VERY OBVIOUS (image-2/3 style)
  embossHighlight20: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: '50%',
    backgroundColor: 'rgba(255,255,255,0.20)', // Much stronger highlight
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
  },
  embossHighlight16: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: '50%',
    backgroundColor: 'rgba(255,255,255,0.20)', // Much stronger highlight
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
  },
  embossHighlight24: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: '50%',
    backgroundColor: 'rgba(255,255,255,0.20)', // Much stronger highlight
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
  },
  embossInputShell24: {
    backgroundColor: '#3A2A1E', // Brown matching theme
    borderRadius: 24,
    borderWidth: 1,
    borderColor: 'rgba(27, 78, 218, 0.25)', // Blue edge accent
    shadowColor: '#000',
    shadowOpacity: 0.90, // Even more obvious shadow
    shadowRadius: 24, // Larger shadow radius
    shadowOffset: { width: 0, height: 18 }, // Deeper shadow
    elevation: 16, // Higher elevation
    overflow: 'hidden',
    position: 'relative',
  },
  embossInputShell20: {
    backgroundColor: '#3A2A1E', // Brown matching theme
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(27, 78, 218, 0.25)', // Blue edge accent
    shadowColor: '#000',
    shadowOpacity: 0.90, // Even more obvious shadow
    shadowRadius: 22,
    shadowOffset: { width: 0, height: 16 },
    elevation: 14,
    overflow: 'hidden',
    position: 'relative',
  },
  conversationContainer: {
    flex: 1,
    backgroundColor: 'transparent',
  },
  floatingHomeButton: {
    position: 'absolute',
    top: 50,
    right: 20,
    zIndex: 1000,
  },
  homeButtonWelcome: {
    marginLeft: 'auto',
  },
  welcomeContainer: {
    flex: 1,
    paddingTop: 60,
    paddingHorizontal: 20,
  },
  welcomeHeader: {
    alignItems: 'center',
    marginBottom: 40,
  },
  avatarPlaceholder: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#3A2A1E', // Brown matching theme
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
    borderWidth: 1,
    borderColor: 'rgba(27, 78, 218, 0.25)', // Blue edge accent
    shadowColor: '#000',
    shadowOpacity: 0.85, // Very obvious shadow
    shadowRadius: 20,
    shadowOffset: { width: 0, height: 14 },
    elevation: 12,
    overflow: 'hidden',
    position: 'relative',
  },
  avatarText: {
    fontSize: 24,
  },
  greetingText: {
    fontSize: 24,
    fontWeight: '700',
    color: 'rgba(255,255,255,0.95)',
  },
  listeningHint: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.7)',
    textAlign: 'center',
    marginTop: spacing?.sm || 12,
    marginBottom: spacing?.md || 16,
    fontStyle: 'italic',
  },
  welcomeInputContainer: {
    marginBottom: 24,
  },
  welcomeInput: {
    backgroundColor: 'transparent',
    borderRadius: 24,
    paddingHorizontal: 20,
    paddingVertical: 16,
    fontSize: 16,
    color: 'rgba(255,255,255,0.92)',
  },
  suggestedPromptsContainer: {
    gap: 12,
  },
  suggestedPromptCard: {
    backgroundColor: '#3A2A1E', // Brown matching theme
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: 'rgba(27, 78, 218, 0.25)', // Blue edge accent
    marginBottom: 12,
    shadowColor: '#000',
    shadowOpacity: 0.85, // Very obvious shadow
    shadowRadius: 20,
    shadowOffset: { width: 0, height: 14 }, // Deep shadow
    elevation: 12,
    overflow: 'hidden',
    position: 'relative',
  },
  suggestedPromptText: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.86)',
    lineHeight: 20,
  },
  activeContainer: {
    flex: 1,
    paddingTop: 60,
    paddingHorizontal: 20,
  },
  userQuestionBubble: {
    backgroundColor: '#3A2A1E', // Brown matching theme
    borderRadius: 20,
    padding: 16,
    marginBottom: 24,
    alignSelf: 'center',
    maxWidth: '90%',
    borderWidth: 1,
    borderColor: 'rgba(27, 78, 218, 0.30)', // Blue edge accent
    shadowColor: '#000',
    shadowOpacity: 0.85, // Very obvious shadow
    shadowRadius: 20,
    shadowOffset: { width: 0, height: 14 },
    elevation: 12,
    overflow: 'hidden',
    position: 'relative',
  },
  userQuestionText: {
    fontSize: 16,
    color: 'rgba(255,255,255,0.92)',
    lineHeight: 24,
  },
  voiceIndicatorContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 40,
  },
  voiceIndicator: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#2A2A2A', // Dark gray
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.15)',
    shadowColor: '#000',
    shadowOpacity: 0.75,
    shadowRadius: 18,
    shadowOffset: { width: 0, height: 12 },
    elevation: 10,
    overflow: 'hidden',
    position: 'relative',
  },
  voiceIndicatorActive: {
    backgroundColor: '#1B4EDA', // Blue when active
    borderColor: 'rgba(255,255,255,0.30)',
    shadowColor: '#1B4EDA',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.85,
    shadowRadius: 24,
    elevation: 14,
  },
  voiceIndicatorInner: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.95)', // White inner dot
  },
  voiceIndicatorIdle: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#3A2A1E', // Brown matching theme
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(27, 78, 218, 0.25)', // Blue edge accent
    shadowColor: '#000',
    shadowOpacity: 0.85,
    shadowRadius: 20,
    shadowOffset: { width: 0, height: 14 },
    elevation: 12,
    overflow: 'hidden',
    position: 'relative',
  },
  voiceIndicatorDot: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: 'rgba(255,255,255,0.88)',
  },
  messagesScrollView: {
    flex: 1,
  },
  messagesContent: {
    paddingVertical: 20,
    gap: 16,
  },
  userBubbleContainer: {
    alignItems: 'flex-end',
    paddingHorizontal: 20,
  },
  userBubble: {
    backgroundColor: '#3A2A1E', // Brown matching theme
    borderRadius: 20,
    padding: 16,
    maxWidth: '80%',
    borderWidth: 1,
    borderColor: 'rgba(27, 78, 218, 0.30)', // Blue edge accent
    shadowColor: '#000',
    shadowOpacity: 0.85, // Very obvious shadow
    shadowRadius: 20,
    shadowOffset: { width: 0, height: 14 }, // Deep shadow
    elevation: 12,
    overflow: 'hidden',
    position: 'relative',
  },
  userBubbleText: {
    fontSize: 16,
    color: 'rgba(255,255,255,0.92)',
    lineHeight: 24,
  },
  // New styles matching image - translucent bubbles
  userBubbleNew: {
    backgroundColor: 'rgba(10, 14, 39, 0.85)', // Dark blue (matching image user bubbles)
    borderRadius: 16,
    padding: 14,
    maxWidth: '75%',
    borderWidth: 0,
  },
  userBubbleTextNew: {
    fontSize: 15,
    color: '#FFFFFF',
    lineHeight: 22,
  },
  aiBubbleNew: {
    backgroundColor: 'rgba(135, 206, 250, 0.25)', // Light blue translucent (matching image AI bubbles)
    borderRadius: 16,
    padding: 14,
    maxWidth: '80%',
    borderWidth: 0,
    backdropFilter: 'blur(10px)',
  },
  aiBubbleTextNew: {
    fontSize: 15,
    color: '#FFFFFF',
    lineHeight: 22,
  },
  networkVisualization: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: '50%',
    zIndex: 0,
  },
  aiBubble: {
    backgroundColor: 'rgba(16, 22, 40, 0.78)',
    borderRadius: 20,
    padding: 16,
    maxWidth: '85%',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.12)',
    shadowColor: '#000',
    shadowOpacity: 0.30,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 6 },
    elevation: 5,
    overflow: 'hidden',
    position: 'relative',
  },
  aiBubbleText: {
    fontSize: 16,
    color: 'rgba(255,255,255,0.90)',
    lineHeight: 24,
  },
  loadingIndicator: {
    marginVertical: 20,
  },
  inputBarNew: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255,255,255,0.10)',
    backgroundColor: 'rgba(10, 14, 39, 0.58)',
  },
  inputWrapperNew: {
    flex: 1,
    marginHorizontal: 12,
  },
  inputNew: {
    backgroundColor: 'transparent',
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    color: 'rgba(255,255,255,0.92)',
    maxHeight: 100,
  },
  sendButton: {
    backgroundColor: '#3A2A1E', // Brown matching theme
    borderRadius: 20,
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderWidth: 1,
    borderColor: 'rgba(27, 78, 218, 0.35)', // Blue edge accent
    shadowColor: '#000',
    shadowOpacity: 0.90, // Very obvious shadow
    shadowRadius: 22,
    shadowOffset: { width: 0, height: 16 }, // Deep shadow
    elevation: 14,
    overflow: 'hidden',
    position: 'relative',
  },
  sendButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: 'rgba(255,255,255,0.92)',
  },
  // Glowing circular button (matching image)
  sendButtonGlow: {
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
    // Iridescent glow effect
    shadowColor: '#87CEEB',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8,
    shadowRadius: 20,
    elevation: 10,
  },
  sendButtonGlowInner: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: 'rgba(135, 206, 250, 0.4)', // Light blue
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: 'rgba(255, 255, 255, 0.6)',
    // Inner glow
    shadowColor: '#FFFFFF',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.5,
    shadowRadius: 15,
  },
  sendButtonGlowText: {
    fontSize: 28,
    color: '#FFFFFF',
    fontWeight: '300',
  },
  bottomNavBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderTopWidth: 1,
    borderTopColor: 'rgba(27, 78, 218, 0.20)', // Blue edge accent
    backgroundColor: '#2A1F16', // Brown background
  },
  bottomNavButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#3A2A1E', // Brown matching theme
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(27, 78, 218, 0.25)', // Blue edge accent
    shadowColor: '#000',
    shadowOpacity: 0.85, // Very obvious shadow
    shadowRadius: 20,
    shadowOffset: { width: 0, height: 14 }, // Deep shadow
    elevation: 12,
    overflow: 'hidden',
    position: 'relative',
  },
  bottomNavIcon: {
    fontSize: 20,
    color: 'rgba(255,255,255,0.92)',
  },
  container: {
    flex: 1,
    backgroundColor: 'transparent', // Let Background component handle the background
  },
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.l,
    paddingTop: spacing.xl,
    paddingBottom: spacing.m,
  },
  titleBlock: {
    flex: 1,
    paddingHorizontal: spacing.m,
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
  providerIndicator: {
    marginTop: spacing.s,
    alignSelf: 'flex-start',
  },
  hudRight: {
    alignItems: 'flex-end',
    gap: spacing.xs,
  },
  ttft: {
    ...typography.bodySm,
    color: colors.textSoft,
  },
  orbSection: {
    alignItems: 'center',
    paddingHorizontal: spacing.l,
    paddingBottom: spacing.m,
  },
  aiVisualizationContainer: {
    position: 'absolute',
    top: -75,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1,
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
    backgroundColor: '#3A2A1E', // Brown matching theme
    padding: spacing.m,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(27, 78, 218, 0.30)', // Blue edge accent
    shadowColor: '#000',
    shadowOpacity: 0.85, // Very obvious shadow
    shadowRadius: 20,
    shadowOffset: { width: 0, height: 14 }, // Deep shadow
    elevation: 12,
    overflow: 'hidden',
    position: 'relative',
  },
  errorText: {
    color: 'rgba(255,255,255,0.92)',
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
  stateIndicators: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.s,
    marginTop: spacing.s,
  },
  stateBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    backgroundColor: colors.white,
    paddingHorizontal: spacing.s,
    paddingVertical: spacing.xs,
    borderRadius: radius.s,
    borderWidth: 1,
    borderColor: colors.grayLine,
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  dotLive: { backgroundColor: colors.blueMain },
  dotMuted: { backgroundColor: colors.grayLine },
  stateText: {
    ...typography.bodySm,
    color: colors.textMain,
    fontSize: 12,
  },
  speakingDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.blueMain,
  },
  liveTranscript: {
    ...typography.bodySm,
    color: colors.blueMain,
    fontStyle: 'italic',
    marginTop: spacing.xs,
  },
  liveRibbon: {
    marginHorizontal: spacing.l,
    marginBottom: spacing.m,
    padding: spacing.m,
    borderRadius: radius.m,
    backgroundColor: '#F1F6FF',
    borderWidth: 1,
    borderColor: colors.grayLine,
  },
  liveLabel: {
    ...typography.bodySm,
    color: colors.textSoft,
    marginBottom: spacing.xs,
  },
  partialBadge: {
    marginTop: spacing.s,
    backgroundColor: colors.white,
    padding: spacing.m,
    borderRadius: radius.m,
    borderWidth: 1,
    borderColor: colors.grayLine,
  },
  partialLabel: {
    ...typography.bodySm,
    color: colors.textSoft,
    marginBottom: spacing.xs,
  },
  partialText: {
    ...typography.body,
    color: colors.textMain,
  },
  partialBubble: {
    paddingHorizontal: spacing.l,
    paddingBottom: spacing.s,
  },
  coachStrip: {
    paddingHorizontal: spacing.l,
    paddingBottom: spacing.s,
    gap: spacing.s,
  },
  bottomActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.l,
    paddingBottom: spacing.l,
    gap: spacing.s,
  },
  bookmark: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.xs,
    padding: spacing.m,
    borderRadius: radius.m,
    borderWidth: 1,
    borderColor: colors.grayLine,
    backgroundColor: colors.white,
  },
  bookmarkText: {
    ...typography.bodySm,
    color: colors.textMain,
  },
  lightning: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.xs,
    paddingHorizontal: spacing.l,
    paddingVertical: spacing.m,
    borderRadius: radius.m,
    backgroundColor: colors.blueMain,
  },
  lightningText: {
    ...typography.bodySm,
    color: colors.white,
    fontWeight: '700',
  },
  bookmarkDrawer: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    maxHeight: '45%',
    backgroundColor: colors.white,
    borderTopLeftRadius: radius.l,
    borderTopRightRadius: radius.l,
    borderWidth: 1,
    borderColor: colors.grayLine,
    paddingBottom: spacing.m,
  },
  drawerHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: spacing.l,
    paddingTop: spacing.m,
    paddingBottom: spacing.s,
  },
  drawerTitle: {
    ...typography.titleS,
    color: colors.textMain,
    fontWeight: '700',
  },
  drawerList: {
    paddingHorizontal: spacing.l,
  },
  drawerItem: {
    borderBottomWidth: 1,
    borderBottomColor: colors.grayLine,
    paddingVertical: spacing.s,
  },
  drawerLabel: {
    ...typography.bodySm,
    color: colors.textSoft,
  },
  drawerText: {
    ...typography.body,
    color: colors.textMain,
    marginBottom: spacing.xs,
  },
  nudgeCard: {
    marginHorizontal: spacing.l,
    marginTop: spacing.s,
    marginBottom: spacing.s,
    padding: spacing.m,
    borderRadius: radius.m,
    borderWidth: 1,
    borderColor: colors.grayLine,
    backgroundColor: '#F1F6FF',
  },
  nudgeTitle: {
    ...typography.titleS,
    color: colors.textMain,
    marginBottom: spacing.xs,
  },
  nudgeText: {
    ...typography.bodySm,
    color: colors.textSoft,
  },
  trustBanner: {
    marginHorizontal: spacing.l,
    marginTop: spacing.s,
    padding: spacing.m,
    borderRadius: radius.m,
    backgroundColor: '#EFF6FF',
    borderWidth: 1,
    borderColor: colors.grayLine,
    gap: spacing.xs,
  },
  trustTitle: {
    ...typography.titleS,
    color: colors.textMain,
    fontWeight: '700',
  },
  trustText: {
    ...typography.bodySm,
    color: colors.textSoft,
  },
  trustButton: {
    alignSelf: 'flex-start',
    marginTop: spacing.xs,
  },
});
