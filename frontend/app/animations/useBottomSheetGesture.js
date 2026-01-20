import { Dimensions } from 'react-native';
import { useSharedValue, useAnimatedStyle, withSpring, runOnJS } from 'react-native-reanimated';
import { Gesture } from 'react-native-gesture-handler';

const { height: SCREEN_HEIGHT } = Dimensions.get('window');

export function useBottomSheetGesture({ onSnap } = {}) {
  const top = 0;
  const mid = SCREEN_HEIGHT * 0.4;
  const closed = SCREEN_HEIGHT;

  const translateY = useSharedValue(closed);

  const snapTo = (dest) => {
    translateY.value = withSpring(dest, { damping: 18, stiffness: 180 }, () => {
      if (onSnap) runOnJS(onSnap)(dest);
    });
  };

  const gesture = Gesture.Pan()
    .onChange((event) => {
      translateY.value = translateY.value + event.changeY;
    })
    .onEnd((event) => {
      const velocity = event.velocityY;
      const current = translateY.value + velocity * 0.2;
      const distances = [
        { point: top, dist: Math.abs(current - top) },
        { point: mid, dist: Math.abs(current - mid) },
        { point: closed, dist: Math.abs(current - closed) },
      ];
      distances.sort((a, b) => a.dist - b.dist);
      snapTo(distances[0].point);
    });

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: translateY.value }],
  }));

  return { gesture, animatedStyle, snapTo, positions: { top, mid, closed }, translateY };
}
