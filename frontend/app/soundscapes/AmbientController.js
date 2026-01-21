import { Audio } from 'expo-av';
import { useEffect, useRef } from 'react';
import { useSharedValue, withTiming, withRepeat } from 'react-native-reanimated';
import { soundPresets } from './soundPresets';

// Controls ambient loop playback + smooth volume ramps.
export function useAmbientController(presetKey = 'nordicCalm') {
  const soundRef = useRef(null);
  const currentPreset = soundPresets[presetKey] || soundPresets.nordicCalm;
  const volume = useSharedValue(currentPreset.baseVolume);

  // Load and play ambient
  useEffect(() => {
    let mounted = true;
    const load = async () => {
      if (soundRef.current) {
        await soundRef.current.stopAsync();
        await soundRef.current.unloadAsync();
      }
      if (!currentPreset.file) return; // Skip if no sound file
      const { sound } = await Audio.Sound.createAsync(currentPreset.file, {
        isLooping: true,
        volume: currentPreset.baseVolume,
      });
      if (mounted) {
        soundRef.current = sound;
        await sound.playAsync();
      } else {
        await sound.unloadAsync();
      }
    };
    load();
    return () => {
      mounted = false;
      if (soundRef.current) {
        soundRef.current.unloadAsync().catch(() => {});
      }
    };
  }, [presetKey]);

  // Apply volume changes to actual sound
  useEffect(() => {
    const id = volume.addListener((v) => {
      if (soundRef.current) soundRef.current.setVolumeAsync(v.value);
    });
    return () => volume.removeListener(id);
  }, [volume]);

  const lowerVolumeForSpeech = () => {
    volume.value = withTiming(Math.max(0.1, currentPreset.baseVolume * 0.6), { duration: 400 });
  };

  const raiseVolumeForAISpeech = () => {
    volume.value = withTiming(Math.min(0.55, currentPreset.baseVolume + 0.12), { duration: 500 });
  };

  const restoreIdleWave = () => {
    volume.value = withTiming(currentPreset.baseVolume, { duration: 600 });
    // optional gentle oscillation
    volume.value = withRepeat(withTiming(currentPreset.baseVolume + 0.03, { duration: 4000 }), -1, true);
  };

  return {
    lowerVolumeForSpeech,
    raiseVolumeForAISpeech,
    restoreIdleWave,
    volume,
  };
}
