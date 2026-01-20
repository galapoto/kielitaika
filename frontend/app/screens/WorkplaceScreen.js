import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
} from 'react-native';
import { listWorkplaceFields } from '../utils/api';
import UpgradeNotice from '../components/UpgradeNotice';
import { useTheme } from '../context/ThemeContext';
import Animated from 'react-native-reanimated';
import { useCardLift } from '../animations/useCardLift';
import { colors } from '../styles/colors';
import { radius } from '../styles/radius';
import { shadows } from '../styles/shadows';
import { spacing } from '../styles/spacing';
import { typography } from '../styles/typography';

const AnimatedTouchable = Animated.createAnimatedComponent(TouchableOpacity);

function FieldCard({ field, onPress, themeColors, dynamicStyles }) {
  const { animatedStyle, onPressIn, onPressOut } = useCardLift();
  
  return (
    <AnimatedTouchable
      style={[dynamicStyles.fieldCard, animatedStyle]}
      onPress={onPress}
      onPressIn={onPressIn}
      onPressOut={onPressOut}
    >
      <Text style={dynamicStyles.fieldIcon}>💼</Text>
      <Text style={dynamicStyles.fieldName}>{field.label}</Text>
      <Text style={dynamicStyles.fieldArrow}>→</Text>
    </AnimatedTouchable>
  );
}

export default function WorkplaceScreen({ navigation }) {
  const { colors: themeColors } = useTheme();
  const [fields, setFields] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [upgradeReason, setUpgradeReason] = useState(null);

  useEffect(() => {
    loadFields();
  }, []);

  const loadFields = async () => {
    try {
      setIsLoading(true);
      const response = await listWorkplaceFields();
      setFields(response.fields || []);
      setUpgradeReason(null);
    } catch (err) {
      console.error('Error loading workplace fields:', err);
      if (err?.message?.includes('Upgrade required')) {
        setUpgradeReason(err.message);
      }
      setError(err.message || 'Failed to load professions');
    } finally {
      setIsLoading(false);
    }
  };

  const handleFieldSelect = (field) => {
    navigation.navigate('ProfessionDetail', { field: field.id, fieldName: field.label });
  };

  const dynamicStyles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: themeColors.background,
    },
    centerContainer: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      padding: spacing.xl,
      backgroundColor: themeColors.background,
    },
    header: {
      padding: spacing.l,
      backgroundColor: themeColors.surface,
      borderBottomWidth: 1,
      borderBottomColor: themeColors.border,
    },
    title: {
      ...typography.titleXL,
      color: themeColors.primary,
      marginBottom: spacing.xs,
    },
    subtitle: {
      ...typography.bodySm,
      color: themeColors.textSecondary,
    },
    fieldsGrid: {
      padding: spacing.m,
      gap: spacing.m,
    },
    fieldCard: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: themeColors.surface,
      padding: spacing.l,
      borderRadius: radius.xl,
      borderWidth: 1,
      borderColor: themeColors.border,
      ...shadows.s,
    },
    fieldIcon: {
      fontSize: 32,
      marginRight: spacing.m,
    },
    fieldName: {
      ...typography.titleL,
      flex: 1,
      color: themeColors.text,
    },
    fieldArrow: {
      ...typography.titleL,
      color: themeColors.primary,
    },
    emptyContainer: {
      padding: spacing.xl,
      alignItems: 'center',
    },
    emptyText: {
      ...typography.body,
      color: themeColors.textSecondary,
    },
    loadingText: {
      ...typography.body,
      color: themeColors.textSecondary,
      marginTop: spacing.m,
    },
    errorText: {
      ...typography.body,
      color: '#EF4444',
      marginBottom: spacing.m,
    },
    retryButton: {
      paddingHorizontal: spacing.l,
      paddingVertical: spacing.m,
      borderRadius: radius.m,
      backgroundColor: themeColors.primary,
      ...shadows.s,
    },
    retryButtonText: {
      ...typography.body,
      color: colors.white,
      fontWeight: '600',
    },
  });

  if (isLoading) {
    return (
      <View style={dynamicStyles.centerContainer}>
        <ActivityIndicator size="large" color={themeColors.primary} />
        <Text style={dynamicStyles.loadingText}>Loading professions...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={dynamicStyles.centerContainer}>
        <Text style={dynamicStyles.errorText}>{error}</Text>
        {upgradeReason && (
          <UpgradeNotice
            reason={upgradeReason}
            onPress={() => navigation.navigate('Subscription')}
          />
        )}
        <TouchableOpacity style={dynamicStyles.retryButton} onPress={loadFields}>
          <Text style={dynamicStyles.retryButtonText}>Retry</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <ScrollView style={dynamicStyles.container}>
      <View style={dynamicStyles.header}>
        <Text style={dynamicStyles.title}>💼 Töihin — Workplace Finnish</Text>
        <Text style={dynamicStyles.subtitle}>
          Choose your profession to practice workplace-specific Finnish
        </Text>
      </View>

      <View style={dynamicStyles.fieldsGrid}>
        {fields.map((field) => (
          <FieldCard
            key={field.id}
            field={field}
            onPress={() => handleFieldSelect(field)}
            themeColors={themeColors}
            dynamicStyles={dynamicStyles}
          />
        ))}
      </View>

      {fields.length === 0 && (
        <View style={dynamicStyles.emptyContainer}>
          <Text style={dynamicStyles.emptyText}>No professions available</Text>
        </View>
      )}
    </ScrollView>
  );
}

// Styles are now in dynamicStyles within the component
