import { Audio } from "expo-av";
import { AppState } from "react-native";

import { logger } from "@core/logging/logger";

let currentSound: Audio.Sound | null = null;
let currentRecording: Audio.Recording | null = null;
let lifecycleGuardInitialized = false;

function ensureLifecycleGuard() {
  if (lifecycleGuardInitialized) {
    return;
  }

  lifecycleGuardInitialized = true;

  AppState.addEventListener("change", (nextState) => {
    if (nextState === "active") {
      return;
    }

    void audioManager.stop();
    void audioManager.stopRecording();
    logger.warn("Audio lifecycle guard released active media because app left foreground.", {
      actionType: "AUDIO_LIFECYCLE_GUARD",
    });
  });
}

export const audioManager = {
  async startRecording() {
    ensureLifecycleGuard();
    logger.setLastUserAction("recording:start");
    logger.info("Recording start requested.", {
      actionType: "RECORDING_START",
    });

    const permission = await Audio.requestPermissionsAsync();

    if (!permission.granted) {
      logger.error("Recording start failed because microphone permission was denied.", {
        actionType: "RECORDING_START",
      });
      throw new Error("MICROPHONE_PERMISSION_DENIED");
    }

    await Audio.setAudioModeAsync({
      allowsRecordingIOS: true,
      playsInSilentModeIOS: true,
    });

    if (currentRecording) {
      await currentRecording.stopAndUnloadAsync();
      currentRecording = null;
      logger.warn("Existing recording was force-stopped before starting a new one.", {
        actionType: "RECORDING_START",
      });
    }

    const recording = new Audio.Recording();

    await recording.prepareToRecordAsync(
      Audio.RecordingOptionsPresets.HIGH_QUALITY,
    );
    await recording.startAsync();

    currentRecording = recording;
    logger.info("Recording started.", {
      actionType: "RECORDING_START",
    });
  },

  async stopRecording() {
    ensureLifecycleGuard();
    logger.setLastUserAction("recording:stop");

    if (!currentRecording) {
      logger.warn("Recording stop requested without an active recording.", {
        actionType: "RECORDING_STOP",
      });
      return null;
    }

    await currentRecording.stopAndUnloadAsync();
    const uri = currentRecording.getURI();

    currentRecording = null;

    await Audio.setAudioModeAsync({
      allowsRecordingIOS: false,
    });

    logger.info("Recording stopped and microphone released.", {
      actionType: "RECORDING_STOP",
    });
    return uri;
  },

  async play(uri: string) {
    ensureLifecycleGuard();
    logger.setLastUserAction("audio:play");

    if (currentSound) {
      logger.warn("Existing playback was force-stopped before starting a new one.", {
        actionType: "AUDIO_PLAY",
      });
      await currentSound.stopAsync();
      await currentSound.unloadAsync();
      currentSound = null;
    }

    try {
      logger.info("Audio playback started.", {
        actionType: "AUDIO_PLAY",
      });
      await Audio.setAudioModeAsync({
        allowsRecordingIOS: false,
        playsInSilentModeIOS: true,
      });

      const { sound } = await Audio.Sound.createAsync({ uri });

      currentSound = sound;

      await sound.playAsync();
    } catch (error) {
      if (currentSound) {
        await currentSound.unloadAsync();
        currentSound = null;
      }

      logger.error("Audio playback failed.", {
        actionType: "AUDIO_PLAY",
      });

      throw error instanceof Error
        ? error
        : new Error("Pre-rendered listening audio failed to play.");
    }
  },

  async stop() {
    if (currentSound) {
      await currentSound.stopAsync();
      await currentSound.unloadAsync();
      currentSound = null;
      logger.info("Audio playback stopped.", {
        actionType: "AUDIO_STOP",
      });
    }
  },
};
