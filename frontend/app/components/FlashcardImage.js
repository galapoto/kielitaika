import React from 'react';
import { Image, View, StyleSheet, Text } from 'react-native';
import Animated from 'react-native-reanimated';
import { useFadeIn } from '../animations/useFadeIn';
import { colors } from '../styles/colors';
import { radius } from '../styles/radius';
import { typography } from '../styles/typography';

export default function FlashcardImage({ url, prompt }) {
  const fadeStyle = useFadeIn();
  const AnimatedImage = Animated.createAnimatedComponent(Image);
  return (
    <View style={styles.container}>
      {url ? (
        <AnimatedImage source={{ uri: url }} style={[styles.image, fadeStyle]} />
      ) : (
        <View style={styles.placeholder}>
          {prompt ? (
            <Text style={styles.prompt} numberOfLines={3}>
              {prompt}
            </Text>
          ) : null}
        </View>
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
    padding: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  prompt: {
    ...typography.bodySm,
    color: colors.textSoft,
    textAlign: 'center',
  },
});




