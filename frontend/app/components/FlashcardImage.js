import React from 'react';
import { Image, View, StyleSheet } from 'react-native';
import Animated from 'react-native-reanimated';
import { useFadeIn } from '../animations/useFadeIn';
import { colors } from '../styles/colors';
import { radius } from '../styles/radius';

export default function FlashcardImage({ url }) {
  const fadeStyle = useFadeIn();
  const AnimatedImage = Animated.createAnimatedComponent(Image);
  return (
    <View style={styles.container}>
      {url ? (
        <AnimatedImage source={{ uri: url }} style={[styles.image, fadeStyle]} />
      ) : (
        <View style={styles.placeholder} />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
    height: 140,
  },
  image: {
    width: '100%',
    height: '100%',
    borderRadius: radius.l,
  },
  placeholder: {
    flex: 1,
    backgroundColor: colors.grayLine,
    borderRadius: radius.l,
  },
});


