import { useState, useCallback } from 'react';
import { Audio } from 'expo-av';
import * as FileSystem from 'expo-file-system';

// Lightweight audio recorder hook for Expo
// NOTE: Requires expo-av configured in the project.
export function useAudioRecorder() {
  const [recording, setRecording] = useState(null);
  const [isRecording, setIsRecording] = useState(false);

  const startRecording = useCallback(async () => {
    try {
      const permission = await Audio.requestPermissionsAsync();
      console.log('[STT] Permission status:', permission?.status);
      if (permission.status !== 'granted') {
        throw new Error('Microphone permission not granted');
      }
      console.log('[STT] Setting audio mode for recording');
      await Audio.setAudioModeAsync({
        allowsRecordingIOS: true,
        playsInSilentModeIOS: true,
        interruptionModeAndroid: Audio.INTERRUPTION_MODE_ANDROID_DO_NOT_MIX,
        shouldDuckAndroid: false,
        playThroughEarpieceAndroid: false,
        staysActiveInBackground: false,
      });
      const rec = new Audio.Recording();
      console.log('[STT] Preparing recorder');
      await rec.prepareToRecordAsync(Audio.RECORDING_OPTIONS_PRESET_HIGH_QUALITY);
      console.log('[STT] Starting recorder');
      await rec.startAsync();
      setRecording(rec);
      setIsRecording(true);
      console.log('[STT] Recorder started');
    } catch (err) {
      setIsRecording(false);
      throw err;
    }
  }, []);

  const stopRecording = useCallback(async () => {
    if (!recording) return null;
    try {
      console.log('[STT] Stopping recorder');
      await recording.stopAndUnloadAsync();
      const uri = recording.getURI();
      if (uri) {
        try {
          const info = await FileSystem.getInfoAsync(uri);
          console.log('[STT] Recorded file:', uri, 'bytes=', info?.size);
        } catch (e) {
          console.log('[STT] Recorded file info error', e);
        }
      }
      setIsRecording(false);
      return uri;
    } finally {
      setRecording(null);
    }
  }, [recording]);

  return { startRecording, stopRecording, isRecording };
}
