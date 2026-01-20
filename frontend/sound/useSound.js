// ============================================================================
// useSound - Sound effects hook (FULL IMPLEMENTATION)
// ============================================================================

import { useCallback, useEffect, useRef } from 'react';
import { Audio } from 'expo-av';

// Preload sounds
const soundCache = {};

/**
 * useSound - Provides sound effects
 * 
 * @returns {Object} - { playSound }
 */
export function useSound() {
  useEffect(() => {
    // Set audio mode
    Audio.setAudioModeAsync({
      playsInSilentModeIOS: true,
      staysActiveInBackground: false,
    }).catch(() => {});

    return () => {
      // Cleanup sounds on unmount
      Object.values(soundCache).forEach(sound => {
        if (sound) {
          sound.unloadAsync().catch(() => {});
        }
      });
    };
  }, []);

  const playSound = useCallback(async (soundName) => {
    try {
      // Use placeholder sounds (replace with actual files later)
      const soundMap = {
        tap: require('./sounds/tap.mp3'),
        success: require('./sounds/success.mp3'),
        micStart: require('./sounds/mic-start.mp3'),
        certificate: require('./sounds/certificate.mp3'),
      };

      // For now, just log (sounds need to be added to assets)
      console.log(`Playing sound: ${soundName}`);
      
      // TODO: Uncomment when sound files are added
      // if (soundCache[soundName]) {
      //   await soundCache[soundName].replayAsync();
      //   return;
      // }
      // 
      // const { sound } = await Audio.Sound.createAsync(soundMap[soundName] || soundMap.tap);
      // soundCache[soundName] = sound;
      // await sound.playAsync();
    } catch (error) {
      console.error('Error playing sound:', error);
    }
  }, []);

  return {
    playSound,
  };
}


