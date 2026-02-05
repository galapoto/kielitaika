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
import { WS_API_BASE } from '../config/backend';

const WS_BASE = WS_API_BASE;

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

type TTSProvider = 'elevenlabs' | 'azure';

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
): Promise<TTSProvider> {
  if (!text || !text.trim()) {
    throw new YKIError(
      YKIErrorType.VALIDATION_ERROR,
      'Empty text provided to TTS',
      'Cannot play empty audio. Please provide text.',
      { canRetry: false }
    );
  }

  try {
    const provider = getProviderForMode(mode);
    const { audioBase64, format } = await fetchTTSAudioBase64(text);

    if (!audioBase64) {
      throw handleTTSFailure(new Error('No audio data in TTS response'));
    }

    try {
      await playAudioFromBase64(
        audioBase64,
        options.playbackRate,
        resolveMimeType(format)
      );
    } catch (playbackError) {
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
async function playAudioFromBase64(
  base64Audio: string,
  playbackRate: number = 1.0,
  mimeType: string = 'audio/ogg;codecs=opus'
): Promise<void> {
  try {
    // Create data URI for audio
    const audioUri = `data:${mimeType};base64,${base64Audio}`;

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
      let hasStarted = false;
      sound.setOnPlaybackStatusUpdate((status) => {
        if (!hasStarted && status.isLoaded && status.isPlaying) {
          hasStarted = true;
          if (__DEV__) console.log('[TTS] Playback started');
        }
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

async function fetchTTSAudioBase64(text: string): Promise<{ audioBase64: string; format: string | null }> {
  return new Promise((resolve, reject) => {
    const wsUrl = `${WS_BASE}/voice/tts-stream`;
    let settled = false;
    let idleTimer: ReturnType<typeof setTimeout> | null = null;
    const chunks: Uint8Array[] = [];
    let ttsFormat: string | null = null;
    let ttsEndReceived = false;

    if (__DEV__) {
      console.log('[TTS] WebSocket URL:', wsUrl);
    }
    const ws = new WebSocket(wsUrl);
    ws.binaryType = 'arraybuffer';

    ws.onopen = () => {
      if (__DEV__) console.log('[TTS] WebSocket onOpen');
      ws.send(JSON.stringify({ text }));
    };

    ws.onerror = (e) => {
      if (__DEV__) console.warn('[TTS] WebSocket onError', e);
      if (settled) return;
      settled = true;
      reject(handleNetworkError(new Error('TTS WebSocket error'), 'TTS playback'));
    };

    ws.onclose = (ev) => {
      if (__DEV__) console.log('[TTS] WebSocket onClose', ev.code, ev.reason);
      if (!settled && ev.code !== 1000 && ev.reason) {
        settled = true;
        reject(handleTTSFailure(new Error(`TTS closed: ${ev.reason}`)));
        return;
      }
      finalize();
    };

    const finalize = () => {
      if (settled) return;
      settled = true;
      if (idleTimer) clearTimeout(idleTimer);
      try {
        ws.close();
      } catch (_) {
        // ignore close errors
      }

      if (!chunks.length) {
        reject(handleTTSFailure(new Error('TTS stream returned no audio')));
        return;
      }

      try {
        const merged = concatChunks(chunks);
        const base64 = toBase64(merged);
        resolve({ audioBase64: base64, format: ttsFormat });
      } catch (err) {
        reject(handleTTSFailure(err as Error));
      }
    };

    ws.onmessage = (event) => {
      if (typeof event.data === 'string') {
        try {
          const parsed = JSON.parse(event.data) as {
            type?: string;
            reason?: string;
            message?: string;
            format?: string;
            sampleRate?: number;
          };
          if (parsed?.type === 'tts_start') {
            ttsFormat = typeof parsed.format === 'string' ? parsed.format : null;
            if (__DEV__) console.log('[TTS] tts_start', parsed);
            return;
          }
          if (parsed?.type === 'tts_end') {
            ttsEndReceived = true;
            if (__DEV__) console.log('[TTS] tts_end');
            finalize();
            return;
          }
          if (parsed?.type === 'error' && parsed?.message) {
            if (!settled) {
              settled = true;
              if (__DEV__) console.warn('[TTS] error:', parsed.reason, parsed.message);
              reject(handleTTSFailure(new Error(parsed.message)));
            }
            return;
          }
        } catch {
          // not JSON
        }
        if (event.data.startsWith('error')) {
          if (!settled) {
            settled = true;
            reject(handleTTSFailure(new Error(event.data)));
          }
        }
        return;
      }

      const chunk = event.data instanceof ArrayBuffer
        ? new Uint8Array(event.data)
        : null;

      if (chunk && chunk.length) {
        chunks.push(chunk);
        if (__DEV__) console.log('[TTS] chunk bytes', chunk.length);
        if (idleTimer) clearTimeout(idleTimer);
        idleTimer = setTimeout(() => {
          if (!ttsEndReceived) finalize();
        }, 200);
      }
    };

  });
}

function resolveMimeType(format: string | null): string {
  switch ((format || '').toLowerCase()) {
    case 'mp3':
      return 'audio/mpeg';
    case 'wav':
      return 'audio/wav';
    case 'opus':
    default:
      return 'audio/ogg;codecs=opus';
  }
}

function concatChunks(chunks: Uint8Array[]): Uint8Array {
  const total = chunks.reduce((sum, c) => sum + c.length, 0);
  const merged = new Uint8Array(total);
  let offset = 0;
  for (const c of chunks) {
    merged.set(c, offset);
    offset += c.length;
  }
  return merged;
}

function toBase64(bytes: Uint8Array): string {
  let binary = '';
  const chunkSize = 0x8000;
  for (let i = 0; i < bytes.length; i += chunkSize) {
    const chunk = bytes.subarray(i, i + chunkSize);
    binary += String.fromCharCode(...chunk);
  }
  if (typeof btoa === 'function') {
    return btoa(binary);
  }
  // Fallback for environments without btoa
  return global?.Buffer ? global.Buffer.from(bytes).toString('base64') : '';
}
