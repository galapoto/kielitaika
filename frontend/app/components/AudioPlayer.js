// frontend/app/audio/AudioPlayer.js

import { Audio } from 'expo-av';

let currentSound = null;

export async function resetAudioPlayer() {
  if (currentSound) {
    try {
      await currentSound.stopAsync();
      await currentSound.unloadAsync();
    } catch {}
    currentSound = null;
  }
}

export async function playAudioFromUri(uri, { onStart, onEnd } = {}) {
  await resetAudioPlayer();

  const { sound } = await Audio.Sound.createAsync(
    { uri },
    { shouldPlay: true }
  );

  currentSound = sound;

  onStart?.();

  sound.setOnPlaybackStatusUpdate(status => {
    if (status.didJustFinish) {
      onEnd?.();
    }
  });
}

