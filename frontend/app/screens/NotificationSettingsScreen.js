import React, { useState, useEffect } from 'react';
import { View, Text, Switch, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { useTheme } from '../context/ThemeContext';
import { useNotifications } from '../hooks/useNotifications';
import { colors } from '../styles/colors';
import { radius } from '../styles/radius';
import { shadows } from '../styles/shadows';
import { spacing } from '../styles/spacing';
import { typography } from '../styles/typography';

export default function NotificationSettingsScreen({ navigation }) {
  const { colors: themeColors } = useTheme();
  const { scheduleDailyNotifications, scheduleBehaviorDrivenNotification } = useNotifications();
  
  const [morningEnabled, setMorningEnabled] = useState(true);
  const [afternoonEnabled, setAfternoonEnabled] = useState(true);
  const [eveningEnabled, setEveningEnabled] = useState(true);
  const [streakEnabled, setStreakEnabled] = useState(true);

  useEffect(() => {
    // Schedule notifications when settings change
    if (morningEnabled || afternoonEnabled || eveningEnabled) {
      scheduleDailyNotifications();
    }
  }, [morningEnabled, afternoonEnabled, eveningEnabled]);

  const dynamicStyles = StyleSheet.create({
    container: {
      flex: 1,
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
    content: {
      padding: spacing.l,
      gap: spacing.l,
    },
    section: {
      backgroundColor: themeColors.surface,
      borderRadius: radius.l,
      padding: spacing.l,
      ...shadows.s,
      borderWidth: 1,
      borderColor: themeColors.border,
    },
    sectionTitle: {
      ...typography.titleL,
      color: themeColors.text,
      marginBottom: spacing.m,
    },
    settingRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      paddingVertical: spacing.m,
      borderBottomWidth: 1,
      borderBottomColor: themeColors.border,
    },
    settingRowLast: {
      borderBottomWidth: 0,
    },
    settingLabel: {
      ...typography.body,
      color: themeColors.text,
      flex: 1,
    },
    settingDescription: {
      ...typography.bodySm,
      color: themeColors.textSecondary,
      marginTop: spacing.xs,
    },
    infoText: {
      ...typography.bodySm,
      color: themeColors.textSecondary,
      marginTop: spacing.m,
      fontStyle: 'italic',
    },
  });

  return (
    <View style={dynamicStyles.container}>
      <View style={dynamicStyles.header}>
        <Text style={dynamicStyles.title}>🔔 Notifications</Text>
        <Text style={dynamicStyles.subtitle}>Control your daily reminders</Text>
      </View>

      <ScrollView contentContainerStyle={dynamicStyles.content}>
        {/* Daily Reminders Section */}
        <View style={dynamicStyles.section}>
          <Text style={dynamicStyles.sectionTitle}>Daily Reminders</Text>
          
          <View style={dynamicStyles.settingRow}>
            <View style={{ flex: 1 }}>
              <Text style={dynamicStyles.settingLabel}>Morning (8:00)</Text>
              <Text style={dynamicStyles.settingDescription}>
                "Here are 3 words to warm up your Finnish today!"
              </Text>
            </View>
            <Switch
              value={morningEnabled}
              onValueChange={setMorningEnabled}
              trackColor={{ false: themeColors.border, true: themeColors.primary }}
              thumbColor={colors.white}
            />
          </View>

          <View style={dynamicStyles.settingRow}>
            <View style={{ flex: 1 }}>
              <Text style={dynamicStyles.settingLabel}>Afternoon (13:00)</Text>
              <Text style={dynamicStyles.settingDescription}>
                "Your grammar snack is ready 🍪"
              </Text>
            </View>
            <Switch
              value={afternoonEnabled}
              onValueChange={setAfternoonEnabled}
              trackColor={{ false: themeColors.border, true: themeColors.primary }}
              thumbColor={colors.white}
            />
          </View>

          <View style={[dynamicStyles.settingRow, dynamicStyles.settingRowLast]}>
            <View style={{ flex: 1 }}>
              <Text style={dynamicStyles.settingLabel}>Evening (19:00)</Text>
              <Text style={dynamicStyles.settingDescription}>
                "10-second speaking challenge awaits!"
              </Text>
            </View>
            <Switch
              value={eveningEnabled}
              onValueChange={setEveningEnabled}
              trackColor={{ false: themeColors.border, true: themeColors.primary }}
              thumbColor={colors.white}
            />
          </View>
        </View>

        {/* Streak Notifications Section */}
        <View style={dynamicStyles.section}>
          <Text style={dynamicStyles.sectionTitle}>Streak & Engagement</Text>
          
          <View style={[dynamicStyles.settingRow, dynamicStyles.settingRowLast]}>
            <View style={{ flex: 1 }}>
              <Text style={dynamicStyles.settingLabel}>Streak Preserving Alerts</Text>
              <Text style={dynamicStyles.settingDescription}>
                Get notified if you're about to break your streak
              </Text>
            </View>
            <Switch
              value={streakEnabled}
              onValueChange={setStreakEnabled}
              trackColor={{ false: themeColors.border, true: themeColors.primary }}
              thumbColor={colors.white}
            />
          </View>
        </View>

        <Text style={dynamicStyles.infoText}>
          Notifications help you build a daily learning habit. You can change these settings anytime.
        </Text>
      </ScrollView>
    </View>
  );
}
