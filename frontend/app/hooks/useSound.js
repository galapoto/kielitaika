import { useEffect, useRef } from 'react';
import { Audio } from 'expo-av';

// Try to load sound files - gracefully handle if they don't exist
// Metro requires static require() paths, so we must list each file explicitly
const soundPaths = {};

try {
  soundPaths.tap = require('../assets/sounds/ui/tap_soft.wav');
} catch (e) {
  soundPaths.tap = null;
}

try {
  soundPaths.success = require('../assets/sounds/ui/success_chime.wav');
} catch (e) {
  soundPaths.success = null;
}

try {
  soundPaths.mic_on = require('../assets/sounds/ui/pop_light.wav');
} catch (e) {
  soundPaths.mic_on = null;
}

try {
  soundPaths.certificate = require('../assets/sounds/ui/send1.wav');
} catch (e) {
  soundPaths.certificate = null;
}

// Filter out any that failed to load
const sounds = {};
Object.keys(soundPaths).forEach(key => {
  if (soundPaths[key]) {
    sounds[key] = soundPaths[key];
  }
});

export function useSound() {
  const soundRefs = useRef({});

  useEffect(() => {
    // Load available sounds
    const loadSounds = async () => {
      for (const [key, source] of Object.entries(sounds)) {
        try {
          const { sound } = await Audio.Sound.createAsync(source, { shouldPlay: false });
          soundRefs.current[key] = sound;
        } catch (error) {
          console.warn(`Failed to load sound ${key}:`, error);
        }
      }
    };

    loadSounds();

    return () => {
      // Unload all sounds on cleanup
      const unload = Object.values(soundRefs.current || {}).map((s) => s.unloadAsync());
      Promise.all(unload).catch(() => {});
    };
  }, []);

  const play = async (key) => {
    const s = soundRefs.current[key];
    if (s) {
      try {
        await s.replayAsync();
      } catch (e) {
        // ignore playback errors
      }
    }
  };

  return {
    playTap: () => play('tap'),
    playSuccess: () => play('success'),
    playMicOn: () => play('mic_on'),
    playCertificate: () => play('certificate'),
  };
}
