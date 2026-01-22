/**
 * Dual-TTS Service
 * Handles both ElevenLabs (conversation mode) and Azure (system mode) TTS
 * 
 * This service calls the backend /tts endpoint which routes to the appropriate provider
 * based on the mode parameter.
 */

import { Audio } from 'expo-av';
import { Platform } from 'react-native';
import { handleTTSFailure, handleNetworkError, YKIError, YKIErrorType } from './ykiErrorService';

const API_BASE = process.env.EXPO_PUBLIC_API_BASE || 'http://localhost:8000';

// Get auth token for authenticated requests
async function getAuthToken(): Promise<string | null> {
  try {
    if (Platform.OS === 'web') {
      // Web: use localStorage
      return localStorage.getItem('@ruka_token');
    } else {
      // Native: use AsyncStorage
      const AsyncStorage = require('@react-native-async-storage/async-storage').default;
      return await AsyncStorage.getItem('@ruka_token');
    }
  } catch (e) {
    return null;
  }
}

export type TTSMode = 'conversation' | 'system' | 'yki' | 'toihin' | 'professional' | 'vocab' | 'grammar';

export interface TTSResponse {
  audio_base64: string;
  provider: 'elevenlabs' | 'azure';
}

export interface TTSOptions {
  /**
   * Playback speed multiplier (client-side). 1.0 = normal.
   * On iOS/Android this is applied via Expo AV playback rate.
   */
  playbackRate?: number;
  /**
   * Optional server-side TTS speed hint (passed to backend).
   * Not all providers support it, but it’s safe to send.
   */
  speed?: number;
}

/**
 * Play TTS audio from backend
 * 
 * @param text - Text to synthesize
 * @param mode - TTS mode (determines provider: conversation/yki/toihin → ElevenLabs, system/vocab/grammar → Azure)
 * @returns Provider name or null on error
 */
export async function playTTS(
  text: string,
  mode: TTSMode = 'system',
  options: TTSOptions = {}
): Promise<'elevenlabs' | 'azure'> {
  if (!text || !text.trim()) {
    throw new YKIError(
      YKIErrorType.VALIDATION_ERROR,
      'Empty text provided to TTS',
      'Cannot play empty audio. Please provide text.',
      { canRetry: false }
    );
  }

  try {
    const token = await getAuthToken();
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    };

    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    const response = await fetch(`${API_BASE}/tts`, {
      method: 'POST',
      headers,
      body: JSON.stringify({ text, mode, speed: options.speed }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('TTS API error:', response.status, errorText);
      
      // Check if it's a network error
      if (response.status === 0 || !response.status) {
        throw handleNetworkError(new Error('Network error during TTS request'), 'TTS playback');
      }
      
      throw handleTTSFailure(new Error(`TTS API error: ${response.status} ${errorText}`));
    }

    const data: TTSResponse = await response.json();
    const { audio_base64, provider } = data;

    if (!audio_base64) {
      throw handleTTSFailure(new Error('No audio data in TTS response'));
    }

    // Play audio using Expo AV
    try {
      await playAudioFromBase64(audio_base64, options.playbackRate);
    } catch (playbackError) {
      // Audio playback error (not network/API error)
      throw handleTTSFailure(playbackError as Error);
    }

    return provider;
  } catch (err) {
    // If it's already a YKIError, re-throw it
    if (err instanceof YKIError) {
      throw err;
    }
    
    // Check if it's a network error
    const error = err as Error;
    const errorStr = error?.message?.toLowerCase() || '';
    if (errorStr.includes('network') || errorStr.includes('connection') || errorStr.includes('fetch')) {
      throw handleNetworkError(error, 'TTS playback');
    }
    
    // Default to TTS failure
    throw handleTTSFailure(error);
  }
}

/**
 * Play audio from base64 encoded audio data
 */
async function playAudioFromBase64(base64Audio: string, playbackRate: number = 1.0): Promise<void> {
  try {
    // Create data URI for audio
    const audioUri = `data:audio/mp3;base64,${base64Audio}`;

    // Load and play audio
    const { sound } = await Audio.Sound.createAsync(
      { uri: audioUri },
      { shouldPlay: true }
    );

    // Apply playback rate (slower/faster speech) while keeping pitch natural.
    // Clamp to a sane range to avoid platform quirks.
    const rate = Math.max(0.75, Math.min(1.25, playbackRate || 1.0));
    try {
      await sound.setRateAsync(rate, true);
    } catch (e) {
      // ignore rate setting errors on unsupported platforms
    }

    // Wait for playback to complete
    return new Promise((resolve, reject) => {
      sound.setOnPlaybackStatusUpdate((status) => {
        if (status.isLoaded && status.didJustFinish) {
          sound.unloadAsync().then(() => resolve()).catch(reject);
        }
      });

      // Timeout after 30 seconds
      setTimeout(() => {
        sound.unloadAsync().then(() => resolve()).catch(reject);
      }, 30000);
    });
  } catch (err) {
    console.error('Audio playback error:', err);
    throw err;
  }
}

/**
 * Get TTS provider for a given mode (without making API call)
 * Useful for UI indicators
 */
export function getProviderForMode(mode: TTSMode): 'elevenlabs' | 'azure' {
  if (mode === 'conversation' || mode === 'yki' || mode === 'toihin' || mode === 'professional') {
    return 'elevenlabs';
  }
  return 'azure';
}
