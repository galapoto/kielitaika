import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Switch, Alert, TouchableOpacity } from 'react-native';
import Background from '../components/ui/Background';

/**
 * PrivacySettingsScreen - Using 17th picture design
 */
export default function PrivacySettingsScreen({ navigation }) {
  const [trackingEnabled, setTrackingEnabled] = useState(true);
  const [personalizationEnabled, setPersonalizationEnabled] = useState(true);
  const [analyticsEnabled, setAnalyticsEnabled] = useState(true);

  const handleExport = () => {
    Alert.alert('Export Requested', 'Your data export will be prepared and sent to your email.');
  };

  // Using 17th picture design - Settings screen with privacy options
  return (
    <Background module="home" variant="brown">
      <View style={styles.container}>
        {/* Header - Dark Blue from 6th picture */}
        <View style={styles.header}>
          <TouchableOpacity
            onPress={() => {
              if (navigation?.canGoBack?.() && navigation.canGoBack()) navigation.goBack();
              else navigation?.navigate?.('Home');
            }}
            style={styles.backButton}
          >
            <Text style={styles.backIcon}>←</Text>
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Privacy Settings</Text>
          <View style={styles.headerRight} />
        </View>

        <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
          {/* Privacy Settings Cards - Flight Booking Style */}
          <View style={styles.settingsList}>
            <View style={styles.settingCard}>
              <View style={styles.settingCardLeft}>
                <Text style={styles.settingCardTitle}>Data Privacy</Text>
                <Text style={styles.settingCardDescription}>Manage sharing and tracking</Text>
              </View>
            </View>

            <View style={styles.settingItem}>
              <View style={styles.settingItemLeft}>
                <Text style={styles.settingItemLabel}>Usage Tracking</Text>
                <Text style={styles.settingItemDescription}>
                  Allow anonymous usage tracking to improve the product
                </Text>
              </View>
              <Switch
                value={trackingEnabled}
                onValueChange={setTrackingEnabled}
                trackColor={{ false: '#767577', true: '#1E3A8A' }}
                thumbColor={trackingEnabled ? '#FFFFFF' : '#f4f3f4'}
              />
            </View>

            <View style={styles.settingItem}>
              <View style={styles.settingItemLeft}>
                <Text style={styles.settingItemLabel}>Personalization</Text>
                <Text style={styles.settingItemDescription}>
                  Use learning data to personalize content
                </Text>
              </View>
              <Switch
                value={personalizationEnabled}
                onValueChange={setPersonalizationEnabled}
                trackColor={{ false: '#767577', true: '#1E3A8A' }}
                thumbColor={personalizationEnabled ? '#FFFFFF' : '#f4f3f4'}
              />
            </View>

            <View style={styles.settingItem}>
              <View style={styles.settingItemLeft}>
                <Text style={styles.settingItemLabel}>Crash Analytics</Text>
                <Text style={styles.settingItemDescription}>
                  Send crash reports to help us fix issues quickly
                </Text>
              </View>
              <Switch
                value={analyticsEnabled}
                onValueChange={setAnalyticsEnabled}
                trackColor={{ false: '#767577', true: '#1E3A8A' }}
                thumbColor={analyticsEnabled ? '#FFFFFF' : '#f4f3f4'}
              />
            </View>

            {/* Export Data Button */}
            <TouchableOpacity style={styles.exportButton} onPress={handleExport}>
              <Text style={styles.exportButtonText}>Export My Data</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </View>
    </Background>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'transparent',
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
    width: 36,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
  },
  settingsList: {
    gap: 12,
  },
  settingCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: 'rgba(0, 0, 0, 0.1)',
  },
  settingCardLeft: {
    flex: 1,
  },
  settingCardTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#000000',
    marginBottom: 4,
  },
  settingCardDescription: {
    fontSize: 14,
    color: 'rgba(0, 0, 0, 0.6)',
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
  exportButton: {
    backgroundColor: '#1E3A8A',
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 8,
  },
  exportButtonText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#FFFFFF',
  },
});
