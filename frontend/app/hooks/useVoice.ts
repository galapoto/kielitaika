/**
 * useVoice Hook
 * Simple hook for TTS playback with provider tracking
 * 
 * This hook wraps the TTS service and manages speaking state
 */

import { useState, useCallback } from 'react';
import { playTTS, TTSMode, getProviderForMode } from '../services/tts';
import { usePreferences } from '../context/PreferencesContext';
import { isSpeakingReviewActive } from '../utils/speakingAttempts';

export interface UseVoiceReturn {
  speak: (text: string, mode?: TTSMode) => Promise<void>;
  isSpeaking: boolean;
  provider: 'elevenlabs' | 'azure' | null;
  error: Error | null;
}

/**
 * Hook for TTS voice playback
 * 
 * @example
 * const { speak, isSpeaking, provider } = useVoice();
 * await speak("Hei, mitä kuuluu?", "conversation");
 */
export function useVoice(): UseVoiceReturn {
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [provider, setProvider] = useState<'elevenlabs' | 'azure' | null>(null);
  const [error, setError] = useState<Error | null>(null);
  const { speechRate } = usePreferences();

  const playbackRate =
    speechRate === 'slow' ? 0.9 : speechRate === 'fast' ? 1.1 : 1.0;

  const speak = useCallback(async (text: string, mode: TTSMode = 'system') => {
    if (!text || !text.trim()) {
      return;
    }
    if (isSpeakingReviewActive()) {
      throw new Error('Speaking invariant: audio playback is not allowed in review mode.');
    }

    setIsSpeaking(true);
    setError(null);

    try {
      // Set expected provider immediately for UI feedback
      const expectedProvider = getProviderForMode(mode);
      setProvider(expectedProvider);

      // Play TTS and get actual provider used
      const actualProvider = await playTTS(text, mode, { playbackRate, speed: playbackRate });
      
      if (actualProvider) {
        setProvider(actualProvider);
      } else {
        // If TTS failed, provider might have changed due to fallback
        setProvider(null);
      }
    } catch (err) {
      const error = err instanceof Error ? err : new Error('TTS playback failed');
      setError(error);
      console.error('useVoice error:', error);
      setProvider(null);
    } finally {
      setIsSpeaking(false);
    }
  }, []);

  return {
    speak,
    isSpeaking,
    provider,
    error,
  };
}
