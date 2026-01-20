import { useEffect } from 'react';
import { useAmbientController } from './AmbientController';

/**
 * Hook to orchestrate ambient volume according to conversation events.
 *
 * @param {object} events - callbacks indicating state
 *  - onUserSpeak (bool)
 *  - onAIRespond (bool)
 */
export function useAmbientSoundscape({ preset = 'nordicCalm', userSpeaking = false, aiSpeaking = false }) {
  const { lowerVolumeForSpeech, raiseVolumeForAISpeech, restoreIdleWave } = useAmbientController(preset);

  useEffect(() => {
    if (userSpeaking) {
      lowerVolumeForSpeech();
    } else if (aiSpeaking) {
      raiseVolumeForAISpeech();
    } else {
      restoreIdleWave();
    }
  }, [userSpeaking, aiSpeaking, lowerVolumeForSpeech, raiseVolumeForAISpeech, restoreIdleWave]);
}
