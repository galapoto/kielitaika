import React from 'react';
import { TouchableOpacity, Text, StyleSheet } from 'react-native';
import { colors } from '../styles/colors';
import { spacing } from '../styles/spacing';
import { typography } from '../styles/typography';
import { radius } from '../styles/radius';
import { useHaptic } from '../hooks/useHaptic';

function SuggestionChip({ text, onPress }) {
  const { light } = useHaptic();
  
  if (!text) return null;
  
  const handlePress = () => {
    light();
    onPress?.();
  };

  return (
    <TouchableOpacity 
      style={styles.chip} 
      onPress={handlePress}
      accessibilityRole="button"
      accessibilityLabel={`Suggestion: ${text}`}
      accessibilityHint="Tap to use this suggestion"
    >
      <Text style={styles.label}>Try this next</Text>
      <Text style={styles.text}>{text}</Text>
    </TouchableOpacity>
  );
}

export default React.memo(SuggestionChip);

const styles = StyleSheet.create({
  chip: {
    marginHorizontal: spacing.l,
    marginBottom: spacing.s,
    paddingHorizontal: spacing.m,
    paddingVertical: spacing.s,
    borderRadius: radius.l,
    borderWidth: 1,
    borderColor: colors.grayLine,
    backgroundColor: '#F3F7FF',
  },
  label: {
    ...typography.bodySm,
    color: colors.textSoft,
    marginBottom: spacing.xs,
  },
  text: {
    ...typography.body,
    color: colors.textMain,
    fontWeight: '600',
  },
});
