import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView, Switch, Alert } from 'react-native';
import { useTheme } from '../context/ThemeContext';
import { useAuth } from '../context/AuthContext';
import ThemeToggle from '../components/ThemeToggle';
import AnimatedCTA from '../components/AnimatedCTA';
import { colors } from '../styles/colors';
import { radius } from '../styles/radius';
import { shadows } from '../styles/shadows';
import { spacing } from '../styles/spacing';
import { typography } from '../styles/typography';

export default function SettingsScreen({ navigation }) {
  const { colors: themeColors, theme, toggleTheme } = useTheme();
  const { user, logout } = useAuth();
  const [notificationsEnabled, setNotificationsEnabled] = React.useState(true);
  const [language, setLanguage] = React.useState('en'); // 'en' or 'fi'

  const handleLogout = () => {
    Alert.alert(
      'Sign Out',
      'Are you sure you want to sign out?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Sign Out',
          style: 'destructive',
          onPress: async () => {
            await logout();
            // Navigation will be handled by App.js auth state
          },
        },
      ]
    );
  };

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
      borderWidth: 1,
      borderColor: themeColors.border,
      ...shadows.s,
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
    languageButton: {
      paddingHorizontal: spacing.m,
      paddingVertical: spacing.s,
      borderRadius: radius.m,
      borderWidth: 1,
      borderColor: themeColors.border,
      backgroundColor: themeColors.background,
    },
    languageButtonActive: {
      backgroundColor: themeColors.primary,
      borderColor: themeColors.primary,
    },
    languageButtonText: {
      ...typography.body,
      color: themeColors.text,
      fontWeight: '600',
    },
    languageButtonTextActive: {
      color: colors.white,
    },
    accountSection: {
      marginTop: spacing.xl,
    },
    accountButton: {
      padding: spacing.m,
      borderRadius: radius.m,
      backgroundColor: themeColors.surface,
      borderWidth: 1,
      borderColor: themeColors.border,
      alignItems: 'center',
    },
    accountButtonText: {
      ...typography.body,
      color: themeColors.primary,
      fontWeight: '600',
    },
  });

  return (
    <View style={dynamicStyles.container}>
      <View style={dynamicStyles.header}>
        <Text style={dynamicStyles.title}>⚙️ Settings</Text>
        <Text style={dynamicStyles.subtitle}>Customize your KieliTaika experience</Text>
      </View>

      <ScrollView contentContainerStyle={dynamicStyles.content}>
        {/* Appearance Section */}
        <View style={dynamicStyles.section}>
          <Text style={dynamicStyles.sectionTitle}>Appearance</Text>
          
          <View style={[dynamicStyles.settingRow, dynamicStyles.settingRowLast]}>
            <View style={{ flex: 1 }}>
              <Text style={dynamicStyles.settingLabel}>Dark Mode</Text>
              <Text style={dynamicStyles.settingDescription}>
                Switch between light and dark theme
              </Text>
            </View>
            <ThemeToggle />
          </View>
        </View>

        {/* Notifications Section */}
        <View style={dynamicStyles.section}>
          <Text style={dynamicStyles.sectionTitle}>Notifications</Text>
          
          <View style={dynamicStyles.settingRow}>
            <View style={{ flex: 1 }}>
              <Text style={dynamicStyles.settingLabel}>Daily Reminders</Text>
              <Text style={dynamicStyles.settingDescription}>
                Get notified about your daily recharge
              </Text>
            </View>
            <Switch
              value={notificationsEnabled}
              onValueChange={setNotificationsEnabled}
              trackColor={{ false: themeColors.border, true: themeColors.primary }}
              thumbColor={colors.white}
            />
          </View>
          
          <View style={[dynamicStyles.settingRow, dynamicStyles.settingRowLast]}>
            <View style={{ flex: 1 }}>
              <Text style={dynamicStyles.settingLabel}>Notification Settings</Text>
              <Text style={dynamicStyles.settingDescription}>
                Configure morning, afternoon, and evening reminders
              </Text>
            </View>
            <AnimatedCTA 
              label="Configure" 
              onPress={() => navigation.navigate('Notifications')}
            />
          </View>
        </View>

        {/* Language Section */}
        <View style={dynamicStyles.section}>
          <Text style={dynamicStyles.sectionTitle}>Language</Text>
          
          <View style={[dynamicStyles.settingRow, dynamicStyles.settingRowLast]}>
            <View style={{ flex: 1 }}>
              <Text style={dynamicStyles.settingLabel}>App Language</Text>
              <Text style={dynamicStyles.settingDescription}>
                Choose your preferred interface language
              </Text>
            </View>
            <View style={{ flexDirection: 'row', gap: spacing.s }}>
              <TouchableOpacity
                style={[
                  dynamicStyles.languageButton,
                  language === 'en' && dynamicStyles.languageButtonActive,
                ]}
                onPress={() => setLanguage('en')}
              >
                <Text
                  style={[
                    dynamicStyles.languageButtonText,
                    language === 'en' && dynamicStyles.languageButtonTextActive,
                  ]}
                >
                  EN
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[
                  dynamicStyles.languageButton,
                  language === 'fi' && dynamicStyles.languageButtonActive,
                ]}
                onPress={() => setLanguage('fi')}
              >
                <Text
                  style={[
                    dynamicStyles.languageButtonText,
                    language === 'fi' && dynamicStyles.languageButtonTextActive,
                  ]}
                >
                  FI
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>

        {/* Account Section */}
        <View style={[dynamicStyles.section, dynamicStyles.accountSection]}>
          <Text style={dynamicStyles.sectionTitle}>Account</Text>
          
          {user?.email && (
            <View style={[dynamicStyles.settingRow, { paddingBottom: spacing.m }]}>
              <View style={{ flex: 1 }}>
                <Text style={dynamicStyles.settingLabel}>Email</Text>
                <Text style={dynamicStyles.settingDescription}>{user.email}</Text>
              </View>
            </View>
          )}
          
          <TouchableOpacity
            style={[dynamicStyles.accountButton, { marginBottom: spacing.m }]}
            onPress={() => navigation.navigate('Subscription')}
          >
            <Text style={dynamicStyles.accountButtonText}>Manage Subscription</Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            style={[dynamicStyles.accountButton, { backgroundColor: '#fee2e2', borderColor: '#fca5a5' }]}
            onPress={handleLogout}
          >
            <Text style={[dynamicStyles.accountButtonText, { color: '#dc2626' }]}>Sign Out</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </View>
  );
}

