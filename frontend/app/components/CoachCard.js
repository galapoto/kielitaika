import React, { useMemo } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { colors } from '../styles/colors';
import { spacing } from '../styles/spacing';
import { typography } from '../styles/typography';
import { radius } from '../styles/radius';

/**
 * Compact feedback card for corrections or hints.
 * Optimized with memoization and useMemo for mistakes.
 */
function CoachCard({ title, mistakes = [], hint, supportLevel, onDrill }) {
  const topMistakes = useMemo(() => mistakes.slice(0, 2), [mistakes]);

  return (
    <View style={styles.card}>
      <View style={styles.headerRow}>
        <Text style={styles.title}>{title}</Text>
        {supportLevel !== undefined && (
          <Text style={styles.badge}>Support {supportLevel}</Text>
        )}
      </View>
      {hint ? <Text style={styles.hint}>{hint}</Text> : null}
      {topMistakes.length > 0 && (
        <View style={styles.mistakeList}>
          {topMistakes.map((mistake, idx) => (
            <View key={idx} style={styles.mistakeRow}>
              <Text style={styles.mistakeBullet}>•</Text>
              <Text style={styles.mistakeText}>
                {mistake?.correction || mistake?.explanation || mistake?.message || 'Check this phrase'}
              </Text>
            </View>
          ))}
        </View>
      )}
      {onDrill && (
        <TouchableOpacity style={styles.drillBtn} onPress={() => onDrill(topMistakes[0])}>
          <Text style={styles.drillText}>Swipe to drill →</Text>
        </TouchableOpacity>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.white,
    borderRadius: radius.m,
    borderWidth: 1,
    borderColor: colors.grayLine,
    padding: spacing.m,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.xs,
  },
  title: {
    ...typography.body,
    fontWeight: '700',
    color: colors.textMain,
  },
  badge: {
    ...typography.bodySm,
    color: colors.blueMain,
  },
  hint: {
    ...typography.bodySm,
    color: colors.textSoft,
    marginBottom: spacing.s,
  },
  mistakeList: {
    gap: spacing.xs,
  },
  mistakeRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.xs,
  },
  mistakeBullet: {
    ...typography.body,
    color: colors.textMain,
    lineHeight: 18,
  },
  mistakeText: {
    ...typography.bodySm,
    color: colors.textMain,
    flex: 1,
  },
  drillBtn: {
    marginTop: spacing.s,
    paddingVertical: spacing.xs,
  },
  drillText: {
    ...typography.bodySm,
    color: colors.blueMain,
    fontWeight: '700',
  },
});

export default React.memo(CoachCard);
