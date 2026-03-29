import { Audio } from "expo-av";

let currentSound: Audio.Sound | null = null;
let currentRecording: Audio.Recording | null = null;

export const audioManager = {
  async startRecording() {
    const permission = await Audio.requestPermissionsAsync();

    if (!permission.granted) {
      throw new Error("MICROPHONE_PERMISSION_DENIED");
    }

    await Audio.setAudioModeAsync({
      allowsRecordingIOS: true,
      playsInSilentModeIOS: true,
    });

    if (currentRecording) {
      await currentRecording.stopAndUnloadAsync();
      currentRecording = null;
    }

    const recording = new Audio.Recording();

    await recording.prepareToRecordAsync(
      Audio.RecordingOptionsPresets.HIGH_QUALITY,
    );
    await recording.startAsync();

    currentRecording = recording;
  },

  async stopRecording() {
    if (!currentRecording) {
      return null;
    }

    await currentRecording.stopAndUnloadAsync();
    const uri = currentRecording.getURI();

    currentRecording = null;

    await Audio.setAudioModeAsync({
      allowsRecordingIOS: false,
    });

    return uri;
  },

  async play(uri: string) {
    try {
      if (currentSound) {
        await currentSound.unloadAsync();
      }

      const { sound } = await Audio.Sound.createAsync({ uri });

      currentSound = sound;

      await sound.playAsync();
    } catch (error) {
      console.error("Audio play error", error);
    }
  },

  async stop() {
    if (currentSound) {
      await currentSound.stopAsync();
      await currentSound.unloadAsync();
      currentSound = null;
    }
  },
};
