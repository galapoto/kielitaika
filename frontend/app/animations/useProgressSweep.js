import { useEffect } from 'react';
import { useSharedValue, withTiming, Easing } from 'react-native-reanimated';

export function useProgressSweep(initial = 0) {
  const progress = useSharedValue(initial);

  const animateTo = (value) => {
    progress.value = withTiming(value, {
      duration: 900,
      easing: Easing.out(Easing.quad),
    });
  };

  useEffect(() => {
    progress.value = initial;
  }, [initial, progress]);

  return { progress, animateTo };
}
