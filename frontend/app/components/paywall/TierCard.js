import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { colors } from '../../styles/colors';
import { spacing } from '../../styles/spacing';
import { typography } from '../../styles/typography';
import { radius } from '../../styles/radius';
import { shadows } from '../../styles/shadows';

/**
 * TierCard - Subscription tier card component
 * 
 * Features:
 * - Tier information display
 * - Price display
 * - Feature list
 * - Recommended badge
 * - Current tier indicator
 */
export default function TierCard({
  tier,
  price,
  period = 'month',
  features = [],
  isRecommended = false,
  isCurrent = false,
  onSelect,
  style,
}) {
  return (
    <TouchableOpacity
      style={[styles.container, isCurrent && styles.containerCurrent, style]}
      onPress={onSelect}
      activeOpacity={0.8}
    >
      {isRecommended && (
        <View style={styles.recommendedBadge}>
          <Text style={styles.recommendedText}>⭐ RECOMMENDED</Text>
        </View>
      )}
      
      {isCurrent && (
        <View style={styles.currentBadge}>
          <Text style={styles.currentText}>✓ Current Plan</Text>
        </View>
      )}

      <LinearGradient
        colors={isRecommended ? ['#0A3D62', '#1e5a8a'] : ['#ffffff', '#f8fafc']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.gradient}
      >
        <View style={styles.content}>
          <Text style={[styles.title, isRecommended && styles.titlePremium]}>
            {tier}
          </Text>
          
          {price !== null && (
            <View style={styles.priceContainer}>
              <Text style={[styles.price, isRecommended && styles.pricePremium]}>
                €{price}
              </Text>
              <Text style={[styles.period, isRecommended && styles.periodPremium]}>
                /{period}
              </Text>
            </View>
          )}

          <View style={styles.featuresList}>
            {features.map((feature, idx) => (
              <View key={idx} style={styles.featureItem}>
                <Text style={styles.featureIcon}>✓</Text>
                <Text style={[styles.featureText, isRecommended && styles.featureTextPremium]}>
                  {feature}
                </Text>
              </View>
            ))}
          </View>
        </View>
      </LinearGradient>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    borderRadius: radius.xl,
    overflow: 'hidden',
    borderWidth: 2,
    borderColor: colors.grayLine,
    ...shadows.m,
  },
  containerCurrent: {
    borderColor: colors.blueMain,
    borderWidth: 3,
  },
  recommendedBadge: {
    position: 'absolute',
    top: spacing.m,
    right: spacing.m,
    backgroundColor: '#F6C400',
    paddingHorizontal: spacing.s,
    paddingVertical: spacing.xs,
    borderRadius: radius.s,
    zIndex: 10,
  },
  recommendedText: {
    ...typography.bodySm,
    color: colors.textMain,
    fontWeight: '700',
    fontSize: 10,
  },
  currentBadge: {
    position: 'absolute',
    top: spacing.m,
    left: spacing.m,
    backgroundColor: '#10b981',
    paddingHorizontal: spacing.s,
    paddingVertical: spacing.xs,
    borderRadius: radius.s,
    zIndex: 10,
  },
  currentText: {
    ...typography.bodySm,
    color: colors.white,
    fontWeight: '700',
    fontSize: 10,
  },
  gradient: {
    padding: spacing.xl,
    minHeight: 300,
  },
  content: {
    gap: spacing.m,
  },
  title: {
    ...typography.titleL,
    fontWeight: '700',
    color: colors.textMain,
  },
  titlePremium: {
    color: colors.white,
  },
  priceContainer: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: spacing.xs,
  },
  price: {
    ...typography.titleXL,
    fontWeight: '700',
    color: colors.textMain,
  },
  pricePremium: {
    color: colors.white,
  },
  period: {
    ...typography.body,
    color: colors.textSoft,
  },
  periodPremium: {
    color: 'rgba(255, 255, 255, 0.8)',
  },
  featuresList: {
    gap: spacing.s,
    marginTop: spacing.m,
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.s,
  },
  featureIcon: {
    ...typography.body,
    color: '#10b981',
    fontWeight: '700',
    marginTop: 2,
  },
  featureText: {
    ...typography.body,
    color: colors.textMain,
    flex: 1,
  },
  featureTextPremium: {
    color: colors.white,
  },
});
