import { useEffect, useRef } from 'react';
import { Audio } from 'expo-av';

const sounds = {
  tap: require('../assets/sounds/tap.mp3'),
  success: require('../assets/sounds/success.mp3'),
  mic_on: require('../assets/sounds/mic_on.mp3'),
  certificate: require('../assets/sounds/certificate.mp3'),
};

export function useSound() {
  const soundRefs = useRef({});

  useEffect(() => {
    let mounted = true;
    const load = async () => {
      for (const key of Object.keys(sounds)) {
        const { sound } = await Audio.Sound.createAsync(sounds[key], { volume: 0.4 });
        if (mounted) soundRefs.current[key] = sound;
        else await sound.unloadAsync();
      }
    };
    load();
    return () => {
      mounted = false;
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
        // ignore
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
