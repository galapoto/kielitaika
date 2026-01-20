import { useState, useCallback } from 'react';
import { Audio } from 'expo-av';

// Lightweight audio recorder hook for Expo
// NOTE: Requires expo-av configured in the project.
export function useAudioRecorder() {
  const [recording, setRecording] = useState(null);
  const [isRecording, setIsRecording] = useState(false);

  const startRecording = useCallback(async () => {
    try {
      const permission = await Audio.requestPermissionsAsync();
      if (permission.status !== 'granted') {
        throw new Error('Microphone permission not granted');
      }
      await Audio.setAudioModeAsync({
        allowsRecordingIOS: true,
        playsInSilentModeIOS: true,
      });
      const rec = new Audio.Recording();
      await rec.prepareToRecordAsync(Audio.RECORDING_OPTIONS_PRESET_HIGH_QUALITY);
      await rec.startAsync();
      setRecording(rec);
      setIsRecording(true);
    } catch (err) {
      setIsRecording(false);
      throw err;
    }
  }, []);

  const stopRecording = useCallback(async () => {
    if (!recording) return null;
    try {
      await recording.stopAndUnloadAsync();
      const uri = recording.getURI();
      setIsRecording(false);
      return uri;
    } finally {
      setRecording(null);
    }
  }, [recording]);

  return { startRecording, stopRecording, isRecording };
}
