import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import Animated from 'react-native-reanimated';
import { useBounce } from '../animations/useBounce';
import { useGlowPulse } from '../animations/useGlowPulse';
import { useShake } from '../animations/useShake';
import { colors } from '../styles/colors';
import { spacing } from '../styles/spacing';
import { radius } from '../styles/radius';
import { shadows } from '../styles/shadows';

export default function MiniChallengeCard({ challengeData, onComplete }) {
  const [selected, setSelected] = useState(null);
  const [status, setStatus] = useState(null); // 'correct' | 'wrong'
  const { trigger: bounce, animatedStyle: bounceStyle } = useBounce();
  const glowStyle = useGlowPulse();
  const { trigger: shake, animatedStyle: shakeStyle } = useShake();
  const AnimatedTouchable = Animated.createAnimatedComponent(TouchableOpacity);

  if (!challengeData) {
    return (
      <View style={styles.card}><Text style={styles.text}>No challenge</Text></View>
    );
  }

  const handleSelect = (option) => {
    setSelected(option);
    const isCorrect = option === challengeData.answer;
    setStatus(isCorrect ? 'correct' : 'wrong');
    if (isCorrect) {
      bounce();
      onComplete?.();
    } else {
      shake();
    }
  };

  return (
    <Animated.View style={[styles.card, status === 'correct' ? glowStyle : null, shakeStyle]}>
      <Text style={styles.title}>{challengeData.prompt || 'Choose the right option'}</Text>
      {challengeData.sentence && (
        <Text style={styles.sentence}>{challengeData.sentence}</Text>
      )}
      <View style={styles.options}>
        {challengeData.options?.map((opt) => (
          <AnimatedTouchable
            key={opt}
            style={[
              styles.option,
              selected === opt && styles.optionSelected,
              status === 'correct' && selected === opt && bounceStyle,
            ]}
            onPress={() => !status && handleSelect(opt)}
            disabled={!!status}
          >
            <Text style={styles.optionText}>{opt}</Text>
          </AnimatedTouchable>
        ))}
      </View>
      {status === 'correct' && <Text style={styles.feedback}>✔ Correct! Great job!</Text>}
      {status === 'wrong' && <Text style={styles.feedback}>Try again</Text>}
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.white,
    borderRadius: radius.l,
    padding: spacing.m,
    ...shadows.s,
    gap: spacing.s,
  },
  title: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.textMain,
    marginBottom: spacing.s,
  },
  sentence: {
    fontSize: 14,
    color: colors.textSoft,
    fontStyle: 'italic',
    marginBottom: spacing.m,
  },
  options: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.s,
  },
  option: {
    paddingHorizontal: spacing.m,
    paddingVertical: spacing.s,
    borderRadius: radius.m,
    borderWidth: 1,
    borderColor: colors.grayLine,
    backgroundColor: colors.blueLight,
  },
  optionSelected: {
    borderColor: colors.blueMain,
  },
  optionText: {
    fontSize: 14,
    color: colors.textMain,
  },
  feedback: {
    fontSize: 14,
    color: colors.textSoft,
  },
  text: {
    color: colors.textSoft,
  },
});


