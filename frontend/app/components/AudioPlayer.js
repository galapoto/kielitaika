// frontend/app/components/AudioPlayer.js

import { Audio } from "expo-av";

/**
 * AudioPlayer
 *
 * HARD RULES:
 * - Only one sound instance at a time
 * - Always unload before resolving
 * - Always reset audio mode after playback
 * - Never overlap with recording
 */

let currentSound = null;
let isPlaying = false;

async function resetAudioMode() {
  try {
    await Audio.setAudioModeAsync({
      allowsRecordingIOS: false,
      playsInSilentModeIOS: true,
      staysActiveInBackground: false,
      interruptionModeIOS: Audio.INTERRUPTION_MODE_IOS_DO_NOT_MIX,
      interruptionModeAndroid: Audio.INTERRUPTION_MODE_ANDROID_DO_NOT_MIX,
      shouldDuckAndroid: true,
      playThroughEarpieceAndroid: false,
    });
  } catch {
    // best effort cleanup
  }
}

async function stopAndUnload() {
  if (currentSound) {
    try {
      await currentSound.stopAsync();
    } catch {}
    try {
      await currentSound.unloadAsync();
    } catch {}
    currentSound = null;
  }
  isPlaying = false;
}

/**
 * Play raw audio buffer (Uint8Array / ArrayBuffer)
 */
export async function playAudioBuffer(buffer, { onStart, onEnd, onError } = {}) {
  if (!buffer) return;

  try {
    // Ensure clean slate
    await stopAndUnload();

    await Audio.setAudioModeAsync({
      allowsRecordingIOS: false,
      playsInSilentModeIOS: true,
      staysActiveInBackground: false,
      interruptionModeIOS: Audio.INTERRUPTION_MODE_IOS_DO_NOT_MIX,
      interruptionModeAndroid: Audio.INTERRUPTION_MODE_ANDROID_DO_NOT_MIX,
      shouldDuckAndroid: true,
      playThroughEarpieceAndroid: false,
    });

    const sound = new Audio.Sound();

    await sound.loadAsync(
      { uri: buffer },
      { shouldPlay: false },
      false
    );

    currentSound = sound;
    isPlaying = true;

    sound.setOnPlaybackStatusUpdate((status) => {
      if (!status.isLoaded) return;

      if (status.didJustFinish) {
        cleanupAfterPlayback(onEnd);
      }
    });

    await sound.playAsync();
    onStart?.();
  } catch (err) {
    await cleanupAfterPlayback();
    onError?.(err);
  }
}

async function cleanupAfterPlayback(onEnd) {
  try {
    await stopAndUnload();
  } finally {
    await resetAudioMode();
    onEnd?.();
  }
}

/**
 * Emergency stop (used when leaving screen / unmount)
 */
export async function stopPlaybackImmediately() {
  await stopAndUnload();
  await resetAudioMode();
}

/**
 * Playback state
 */
export function isAudioPlaying() {
  return isPlaying;
}

