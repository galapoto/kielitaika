import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, ActivityIndicator, Alert, Platform } from 'react-native';
import Background from '../components/ui/Background';
import HomeButton from '../components/HomeButton';
import PremiumEmbossedButton from '../components/PremiumEmbossedButton';
import { colors } from '../styles/colors';
import { spacing } from '../styles/spacing';
import { typography } from '../styles/typography';
import { radius } from '../styles/radius';
import { shadows } from '../styles/shadows';
import * as FileSystem from 'expo-file-system';
import * as Sharing from 'expo-sharing';
import { RukaButton, RukaCard } from '../ui';
import { IconCertificate, IconLightning } from '../ui/icons/IconPack';

const API_BASE = process.env.EXPO_PUBLIC_API_BASE || 'http://localhost:8000';

/**
 * DataExportScreen - GDPR data export
 * 
 * Features:
 * - Request data export
 * - Download as JSON/ZIP
 * - Show export history
 */
export default function DataExportScreen({ navigation }) {
  const [exporting, setExporting] = useState(false);
  const [format, setFormat] = useState('json'); // json or zip

  const handleExport = async () => {
    try {
      setExporting(true);
      
      // TODO: Call backend GDPR export endpoint
      // const res = await fetch(`${API_BASE}/gdpr/export`, {
      //   method: 'POST',
      //   headers: { 'Authorization': `Bearer ${token}` },
      //   body: JSON.stringify({ format })
      // });
      // const blob = await res.blob();
      
      // Mock for now
      Alert.alert(
        'Export Started',
        'Your data export will be ready shortly. You will receive a notification when it\'s available.',
        [{ text: 'OK' }]
      );
      
      // On mobile, download file
      if (Platform.OS !== 'web') {
        // const fileUri = FileSystem.documentDirectory + 'ruka_export.' + format;
        // await FileSystem.writeAsStringAsync(fileUri, JSON.stringify(mockData));
        // await Sharing.shareAsync(fileUri);
      }
    } catch (err) {
      Alert.alert('Error', 'Failed to export data. Please try again.');
    } finally {
      setExporting(false);
    }
  };

  return (
    <Background module="home" variant="brown">
      <View style={styles.container}>
        <View style={styles.header}>
        <RukaButton
          title="Back"
          onPress={() => {
            if (navigation?.canGoBack?.() && navigation.canGoBack()) navigation.goBack();
            else navigation?.navigate?.('Home');
          }}
          icon={IconLightning}
          style={{ width: 120 }}
        />
        <Text style={styles.title}>Export My Data</Text>
      </View>

      <ScrollView style={styles.content} contentContainerStyle={styles.contentContainer}>
        <RukaCard title="GDPR Data Export" subtitle="Download all your personal data" icon={IconCertificate} style={styles.infoCard}>
          <View style={styles.dataList}>
            <Text style={styles.dataItem}>• Conversation history</Text>
            <Text style={styles.dataItem}>• Progress and achievements</Text>
            <Text style={styles.dataItem}>• Certificates</Text>
            <Text style={styles.dataItem}>• Settings and preferences</Text>
            <Text style={styles.dataItem}>• Payment history</Text>
          </View>
        </RukaCard>

        <RukaCard title="Export Format" subtitle="Choose JSON or ZIP" icon={IconLightning}>
          <View style={styles.formatButtons}>
            <RukaButton
              title="JSON"
              onPress={() => setFormat('json')}
              icon={IconLightning}
              style={{ flex: 1, opacity: format === 'json' ? 1 : 0.7 }}
              disabled={format === 'json'}
            />
            <RukaButton
              title="ZIP"
              onPress={() => setFormat('zip')}
              icon={IconLightning}
              style={{ flex: 1, opacity: format === 'zip' ? 1 : 0.7 }}
              disabled={format === 'zip'}
            />
          </View>
        </RukaCard>

        <RukaButton
          title={exporting ? 'Preparing...' : 'Request Data Export'}
          onPress={handleExport}
          icon={IconCertificate}
          disabled={exporting}
        />

        <RukaCard title="Note" subtitle="Large exports may take a few minutes to prepare. You'll receive a notification when ready." style={styles.noteCard} />
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
    padding: spacing.l,
    backgroundColor: colors.white,
    borderBottomWidth: 1,
    borderBottomColor: colors.grayLine,
  },
  backButton: {
    ...typography.body,
    color: colors.blueMain,
    fontWeight: '600',
    marginBottom: spacing.s,
  },
  title: {
    ...typography.titleL,
    fontWeight: '700',
    color: colors.textMain,
  },
  content: {
    flex: 1,
  },
  contentContainer: {
    padding: spacing.l,
    gap: spacing.l,
  },
  infoCard: {
    width: '100%',
  },
  infoTitle: {
    ...typography.titleM,
    color: colors.white,
    fontWeight: '700',
    marginBottom: spacing.m,
  },
  infoText: {
    ...typography.body,
    color: colors.white,
    marginBottom: spacing.m,
  },
  dataList: {
    gap: spacing.xs,
  },
  dataItem: {
    ...typography.body,
    color: 'rgba(255, 255, 255, 0.9)',
  },
  formatSection: {
    backgroundColor: colors.white,
    padding: spacing.l,
    borderRadius: radius.l,
    borderWidth: 1,
    borderColor: colors.grayLine,
    ...shadows.s,
  },
  formatLabel: {
    ...typography.body,
    fontWeight: '600',
    color: colors.textMain,
    marginBottom: spacing.m,
  },
  formatButtons: {
    flexDirection: 'row',
    gap: spacing.m,
  },
  formatButton: {
    flex: 1,
    padding: spacing.m,
    borderRadius: radius.m,
    borderWidth: 2,
    borderColor: colors.grayLine,
    alignItems: 'center',
  },
  formatButtonActive: {
    borderColor: colors.blueMain,
    backgroundColor: colors.blueLight,
  },
  formatText: {
    ...typography.body,
    color: colors.textMain,
    fontWeight: '600',
  },
  formatTextActive: {
    color: colors.blueMain,
  },
  exportButton: {
    backgroundColor: colors.blueMain,
    padding: spacing.l,
    borderRadius: radius.l,
    alignItems: 'center',
    ...shadows.m,
  },
  exportButtonDisabled: {
    opacity: 0.6,
  },
  exportButtonText: {
    ...typography.body,
    color: colors.white,
    fontWeight: '700',
  },
  noteCard: {
    backgroundColor: '#fef3c7',
    padding: spacing.m,
    borderRadius: radius.m,
    borderLeftWidth: 4,
    borderLeftColor: '#F6C400',
  },
  noteText: {
    ...typography.bodySm,
    color: colors.textMain,
  },
});
