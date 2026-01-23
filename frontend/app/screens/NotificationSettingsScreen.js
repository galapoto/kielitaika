import React, { useState, useEffect } from 'react';
import { View, Text, Switch, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import Background from '../components/ui/Background';
import HomeButton from '../components/HomeButton';
import { useTheme } from '../context/ThemeContext';
import { useNotifications } from '../hooks/useNotifications';

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

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  header: {
    backgroundColor: '#1E3A8A',
    paddingTop: 50,
    paddingBottom: 16,
    paddingHorizontal: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  backButton: {
    padding: 8,
  },
  backIcon: {
    fontSize: 20,
    color: '#FFFFFF',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#FFFFFF',
    flex: 1,
    textAlign: 'center',
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  profileImageSmall: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  profileImageSmallText: {
    fontSize: 16,
  },
  headerEmail: {
    fontSize: 12,
    color: '#FFFFFF',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
  },
  notificationSection: {
    marginBottom: 24,
  },
  sectionHeader: {
    fontSize: 16,
    fontWeight: '700',
    color: '#000000',
    marginBottom: 16,
  },
  notificationCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    flexDirection: 'row',
    borderWidth: 1,
    borderColor: 'rgba(0, 0, 0, 0.1)',
  },
  notificationIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#1E3A8A',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  notificationIcon: {
    fontSize: 20,
    color: '#FFFFFF',
  },
  notificationContent: {
    flex: 1,
  },
  notificationTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#000000',
    marginBottom: 4,
  },
  notificationDescription: {
    fontSize: 14,
    color: 'rgba(0, 0, 0, 0.6)',
    marginBottom: 8,
  },
  notificationTime: {
    fontSize: 12,
    color: 'rgba(0, 0, 0, 0.5)',
  },
  settingsSection: {
    marginBottom: 24,
  },
  settingItem: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(0, 0, 0, 0.1)',
  },
  settingItemLeft: {
    flex: 1,
  },
  settingItemLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#000000',
    marginBottom: 4,
  },
  settingItemDescription: {
    fontSize: 14,
    color: 'rgba(0, 0, 0, 0.6)',
  },
  infoText: {
    fontSize: 14,
    color: 'rgba(0, 0, 0, 0.6)',
    fontStyle: 'italic',
    marginTop: 16,
    textAlign: 'center',
  },
});

  // Using 18th picture design - Notification settings screen
  return (
    <Background module="home" variant="brown">
      <View style={styles.container}>
      {/* Header - Dark Blue from 6th picture */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation?.goBack?.()} style={styles.backButton}>
          <Text style={styles.backIcon}>←</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Notification</Text>
        <View style={styles.headerRight}>
          <View style={styles.profileImageSmall}>
            <Text style={styles.profileImageSmallText}>👤</Text>
          </View>
          <Text style={styles.headerEmail}>user@example.com</Text>
        </View>
      </View>

      <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
        {/* Today Section - Notification cards from 6th picture */}
        <View style={styles.notificationSection}>
          <Text style={styles.sectionHeader}>Today</Text>
          
          <View style={styles.notificationCard}>
            <View style={styles.notificationIconContainer}>
              <Text style={styles.notificationIcon}>✓</Text>
            </View>
            <View style={styles.notificationContent}>
              <Text style={styles.notificationTitle}>Your booking has been successfully</Text>
              <Text style={styles.notificationDescription}>
                Your notification settings have been updated successfully.
              </Text>
              <Text style={styles.notificationTime}>20 Jun 2023 08:30 PM</Text>
            </View>
          </View>

          <View style={styles.notificationCard}>
            <View style={styles.notificationIconContainer}>
              <Text style={styles.notificationIcon}>🏷️</Text>
            </View>
            <View style={styles.notificationContent}>
              <Text style={styles.notificationTitle}>Don't miss out on discounted flights!</Text>
              <Text style={styles.notificationDescription}>
                Special offers available for premium users.
              </Text>
              <Text style={styles.notificationTime}>20 Jun 2023 10:15 AM</Text>
            </View>
          </View>
        </View>

        {/* Notification Settings - Toggle switches */}
        <View style={styles.settingsSection}>
          <Text style={styles.sectionHeader}>Notification Preferences</Text>
          
          <View style={styles.settingItem}>
            <View style={styles.settingItemLeft}>
              <Text style={styles.settingItemLabel}>Morning (8:00)</Text>
              <Text style={styles.settingItemDescription}>
                "Here are 3 words to warm up your Finnish today!"
              </Text>
            </View>
            <Switch
              value={morningEnabled}
              onValueChange={setMorningEnabled}
              trackColor={{ false: '#767577', true: '#1E3A8A' }}
              thumbColor={morningEnabled ? '#FFFFFF' : '#f4f3f4'}
            />
          </View>

          <View style={styles.settingItem}>
            <View style={styles.settingItemLeft}>
              <Text style={styles.settingItemLabel}>Afternoon (13:00)</Text>
              <Text style={styles.settingItemDescription}>
                "Your grammar snack is ready 🍪"
              </Text>
            </View>
            <Switch
              value={afternoonEnabled}
              onValueChange={setAfternoonEnabled}
              trackColor={{ false: '#767577', true: '#1E3A8A' }}
              thumbColor={afternoonEnabled ? '#FFFFFF' : '#f4f3f4'}
            />
          </View>

          <View style={styles.settingItem}>
            <View style={styles.settingItemLeft}>
              <Text style={styles.settingItemLabel}>Evening (19:00)</Text>
              <Text style={styles.settingItemDescription}>
                "10-second speaking challenge awaits!"
              </Text>
            </View>
            <Switch
              value={eveningEnabled}
              onValueChange={setEveningEnabled}
              trackColor={{ false: '#767577', true: '#1E3A8A' }}
              thumbColor={eveningEnabled ? '#FFFFFF' : '#f4f3f4'}
            />
          </View>

          <View style={styles.settingItem}>
            <View style={styles.settingItemLeft}>
              <Text style={styles.settingItemLabel}>Streak Preserving Alerts</Text>
              <Text style={styles.settingItemDescription}>
                Get notified if you're about to break your streak
              </Text>
            </View>
            <Switch
              value={streakEnabled}
              onValueChange={setStreakEnabled}
              trackColor={{ false: '#767577', true: '#1E3A8A' }}
              thumbColor={streakEnabled ? '#FFFFFF' : '#f4f3f4'}
            />
          </View>
        </View>

        <Text style={styles.infoText}>
          Notifications help you build a daily learning habit. You can change these settings anytime.
        </Text>
      </ScrollView>
      </View>
    </Background>
  );
}
