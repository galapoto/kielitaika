import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { colors } from '../../styles/colors';
import { spacing } from '../../styles/spacing';
import { typography } from '../../styles/typography';
import { radius } from '../../styles/radius';

/**
 * FeatureComparisonTable - Feature comparison across tiers
 * 
 * Features:
 * - Side-by-side feature comparison
 * - Checkmarks and X marks
 * - Highlighted differences
 */
export default function FeatureComparisonTable({ tiers = [], features = [] }) {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Feature Comparison</Text>
      
      <View style={styles.table}>
        {/* Header */}
        <View style={styles.headerRow}>
          <View style={styles.featureColumn}>
            <Text style={styles.headerText}>Feature</Text>
          </View>
          {tiers.map((tier, idx) => (
            <View key={idx} style={styles.tierColumn}>
              <Text style={styles.headerText}>{tier.name}</Text>
            </View>
          ))}
        </View>

        {/* Feature Rows */}
        {features.map((feature, idx) => (
          <View key={idx} style={[styles.row, idx % 2 === 0 && styles.rowEven]}>
            <View style={styles.featureColumn}>
              <Text style={styles.featureText}>{feature.name}</Text>
            </View>
            {tiers.map((tier, tierIdx) => {
              const hasFeature = tier.features?.includes(feature.id) || false;
              return (
                <View key={tierIdx} style={styles.tierColumn}>
                  <Text style={[styles.checkmark, !hasFeature && styles.cross]}>
                    {hasFeature ? '✓' : '✗'}
                  </Text>
                </View>
              );
            })}
          </View>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginVertical: spacing.l,
  },
  title: {
    ...typography.titleM,
    fontWeight: '700',
    color: colors.textMain,
    marginBottom: spacing.m,
  },
  table: {
    backgroundColor: colors.white,
    borderRadius: radius.l,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: colors.grayLine,
  },
  headerRow: {
    flexDirection: 'row',
    backgroundColor: colors.blueMain,
    padding: spacing.m,
  },
  row: {
    flexDirection: 'row',
    padding: spacing.m,
    borderTopWidth: 1,
    borderTopColor: colors.grayLine,
  },
  rowEven: {
    backgroundColor: colors.grayBg,
  },
  featureColumn: {
    flex: 2,
  },
  tierColumn: {
    flex: 1,
    alignItems: 'center',
  },
  headerText: {
    ...typography.body,
    fontWeight: '700',
    color: colors.white,
  },
  featureText: {
    ...typography.bodySm,
    color: colors.textMain,
  },
  checkmark: {
    ...typography.titleM,
    color: '#10b981',
    fontWeight: '700',
  },
  cross: {
    color: colors.grayLine,
  },
});
