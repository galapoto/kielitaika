// frontend/app/services/stt.js

import * as Audio from 'expo-av';
import { updateUserLiveTranscript, finalizeUserTranscript } from '../utils/speakingAttempts';

let recording = null;

export async function startRecording({ sessionId, turnIndex }) {
  await Audio.Audio.requestPermissionsAsync();

  recording = new Audio.Audio.Recording();
  await recording.prepareToRecordAsync(
    Audio.Audio.RecordingOptionsPresets.HIGH_QUALITY
  );
  await recording.startAsync();
}

export async function stopRecording({ sessionId, turnIndex }) {
  if (!recording) return;

  await recording.stopAndUnloadAsync();
  const uri = recording.getURI();
  recording = null;

  const text = await sendToBackendSTT(uri);

  finalizeUserTranscript(sessionId, turnIndex, text);
}

async function sendToBackendSTT(uri) {
  const data = new FormData();
  data.append('file', {
    uri,
    type: 'audio/m4a',
    name: 'speech.m4a'
  });

  const res = await fetch('/voice/stt', {
    method: 'POST',
    body: data
  });

  const json = await res.json();
  return json.text || '';
}

