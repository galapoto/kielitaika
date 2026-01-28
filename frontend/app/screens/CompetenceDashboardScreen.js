/**
 * Competence Dashboard Screen - Shows workplace function performance
 * 
 * Displays:
 * - Function reliability map
 * - Language signals
 * - Risk alerts
 * - YKI transfer indicators
 */

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  TouchableOpacity,
  RefreshControl,
} from 'react-native';
import Background from '../components/ui/Background';
import { getCompetenceDashboardV2, getWorkplaceProgressV2 } from '../utils/api';
import { useAuth } from '../context/AuthContext';
import HomeButton from '../components/HomeButton';
import {
  getProfessionLabel,
  getFunctionLabel,
  getStatusColor,
  formatYKILevel,
  formatCompetenceMap,
} from '../utils/workplaceHelpers';
import { colors as palette } from '../styles/colors';

export default function CompetenceDashboardScreen({ route, navigation } = {}) {
  const { user } = useAuth();
  const profession = route?.params?.profession || route?.params?.field || 'nurse';
  const professionLabel = getProfessionLabel(profession);
  
  if (!user) {
    return (
      <View style={styles.authGuard}>
        <Text style={styles.authGuardText}>Kirjaudu sisään jatkaaksesi.</Text>
      </View>
    );
  }

  const [dashboard, setDashboard] = useState(null);
  const [progress, setProgress] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    loadDashboard();
  }, [profession]);

  const loadDashboard = async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      const [dashboardData, progressData] = await Promise.all([
        getCompetenceDashboardV2(profession),
        getWorkplaceProgressV2(profession),
      ]);
      
      setDashboard(dashboardData);
      setProgress(progressData);
    } catch (err) {
      console.error('Error loading dashboard:', err);
      setError(err.message || 'Failed to load dashboard');
    } finally {
      setIsLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    loadDashboard();
  };

  const renderFunctionCard = (functionId, data) => {
    const statusColor = getStatusColor(data.status);
    const functionLabel = getFunctionLabel(functionId);
    
    return (
      <View key={functionId} style={styles.functionCard}>
        <View style={styles.functionHeader}>
          <Text style={styles.functionName}>{functionLabel}</Text>
          <View style={[styles.statusBadge, { backgroundColor: statusColor }]}>
            <Text style={styles.statusText}>{data.status.toUpperCase()}</Text>
          </View>
        </View>
        <Text style={styles.attemptsText}>Last 6 attempts: {data.last_6_attempts}</Text>
        {data.status === 'risk' && (
          <Text style={styles.riskWarning}>⚠ Needs improvement</Text>
        )}
      </View>
    );
  };

  if (isLoading && !dashboard) {
    return (
      <Background module="workplace" variant="brown">
        <View style={styles.container}>
          <View style={styles.header}>
            <TouchableOpacity onPress={() => navigation.goBack()}>
              <Text style={styles.backIcon}>←</Text>
            </TouchableOpacity>
            <Text style={styles.headerTitle}>Competence Dashboard</Text>
            <HomeButton navigation={navigation} />
          </View>
          <View style={styles.loader}>
            <ActivityIndicator size="large" color={palette.accentPrimary} />
            <Text style={styles.loadingText}>Loading dashboard...</Text>
          </View>
        </View>
      </Background>
    );
  }

  if (error) {
    return (
      <Background module="workplace" variant="brown">
        <View style={styles.container}>
          <View style={styles.header}>
            <TouchableOpacity onPress={() => navigation.goBack()}>
              <Text style={styles.backIcon}>←</Text>
            </TouchableOpacity>
            <Text style={styles.headerTitle}>Competence Dashboard</Text>
            <HomeButton navigation={navigation} />
          </View>
          <View style={styles.errorContainer}>
            <Text style={styles.errorText}>{error}</Text>
            <TouchableOpacity style={styles.retryButton} onPress={loadDashboard}>
              <Text style={styles.retryButtonText}>Retry</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Background>
    );
  }

  const competenceMap = dashboard?.competence_map || {};
  const languageSignals = dashboard?.language_signals || {};
  const riskAlerts = dashboard?.risk_alerts || [];
  const ykiTransfer = dashboard?.yki_transfer || {};

  return (
    <Background module="workplace" variant="brown">
      <View style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <Text style={styles.backIcon}>←</Text>
          </TouchableOpacity>
          <Text style={styles.headerTitle}>{professionLabel}</Text>
          <HomeButton navigation={navigation} />
        </View>

        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
        >
          {/* Competence Map */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Function Competence</Text>
            <Text style={styles.sectionSubtitle}>Your performance on workplace functions</Text>
            
            {Object.entries(competenceMap).map(([functionId, data]) =>
              renderFunctionCard(functionId, data)
            )}
            
            {Object.keys(competenceMap).length === 0 && (
              <View style={styles.emptyState}>
                <Text style={styles.emptyStateText}>
                  No practice data yet. Complete some tasks to see your competence map.
                </Text>
              </View>
            )}
          </View>

          {/* Language Signals */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Language Signals</Text>
            <View style={styles.signalsGrid}>
              <View style={styles.signalCard}>
                <Text style={styles.signalLabel}>Speaking Clarity</Text>
                <Text style={styles.signalValue}>{languageSignals.speaking_clarity || '→'}</Text>
              </View>
              <View style={styles.signalCard}>
                <Text style={styles.signalLabel}>Terminology</Text>
                <Text style={styles.signalValue}>{languageSignals.terminology_accuracy || '→'}</Text>
              </View>
              <View style={styles.signalCard}>
                <Text style={styles.signalLabel}>Register Control</Text>
                <Text style={styles.signalValue}>{languageSignals.register_control || '→'}</Text>
              </View>
              <View style={styles.signalCard}>
                <Text style={styles.signalLabel}>Hesitation</Text>
                <Text style={styles.signalValue}>{languageSignals.hesitation || '→'}</Text>
              </View>
            </View>
          </View>

          {/* Risk Alerts */}
          {riskAlerts.length > 0 && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Risk Alerts</Text>
              {riskAlerts.map((alert, index) => (
                <View key={index} style={styles.alertCard}>
                  <Text style={styles.alertIcon}>⚠️</Text>
                  <Text style={styles.alertText}>{alert}</Text>
                </View>
              ))}
            </View>
          )}

          {/* YKI Transfer */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>YKI Transfer</Text>
            <Text style={styles.sectionSubtitle}>How your workplace training aligns with YKI levels</Text>
            <View style={styles.ykiCard}>
              <View style={styles.ykiRow}>
                <Text style={styles.ykiLabel}>Speaking:</Text>
                <Text style={styles.ykiValue}>{formatYKILevel(ykiTransfer.speaking || 'Around YKI 3')}</Text>
              </View>
              <View style={styles.ykiRow}>
                <Text style={styles.ykiLabel}>Writing:</Text>
                <Text style={styles.ykiValue}>{formatYKILevel(ykiTransfer.writing || 'Around YKI 3')}</Text>
              </View>
              <View style={styles.ykiRow}>
                <Text style={styles.ykiLabel}>Listening:</Text>
                <Text style={styles.ykiValue}>{formatYKILevel(ykiTransfer.listening || 'Around YKI 3')}</Text>
              </View>
            </View>
          </View>

          {/* Progress Summary */}
          {progress && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Progress Summary</Text>
              <View style={styles.progressCard}>
                <Text style={styles.progressLabel}>Total Attempts:</Text>
                <Text style={styles.progressValue}>{progress.total_attempts || 0}</Text>
              </View>
              <Text style={styles.progressSubtext}>
                {Object.keys(progress.functions || {}).length} functions practiced
              </Text>
            </View>
          )}
        </ScrollView>
      </View>
    </Background>
  );
}

const styles = StyleSheet.create({
  authGuard: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#0f172a',
    padding: 24,
  },
  authGuardText: {
    color: '#e2e8f0',
    fontSize: 16,
    textAlign: 'center',
  },
  container: {
    flex: 1,
    backgroundColor: 'transparent',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 60,
    paddingBottom: 20,
    paddingHorizontal: 20,
    backgroundColor: palette.backgroundPrimary,
  },
  backIcon: {
    fontSize: 24,
    color: palette.textPrimary,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: palette.textPrimary,
    flex: 1,
    textAlign: 'center',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 20,
    paddingBottom: 100,
  },
  loader: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 12,
    color: palette.textSecondary,
  },
  errorContainer: {
    padding: 20,
    alignItems: 'center',
  },
  errorText: {
    color: palette.error,
    textAlign: 'center',
    marginBottom: 16,
  },
  retryButton: {
    backgroundColor: palette.accentPrimary,
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
  },
  retryButtonText: {
    color: '#FFFFFF',
    fontWeight: '600',
  },
  section: {
    marginBottom: 32,
  },
  sectionTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: palette.textPrimary,
    marginBottom: 8,
  },
  sectionSubtitle: {
    fontSize: 14,
    color: palette.textSecondary,
    marginBottom: 16,
  },
  functionCard: {
    backgroundColor: palette.surface,
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: palette.divider,
  },
  functionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  functionName: {
    fontSize: 16,
    fontWeight: '600',
    color: palette.textPrimary,
    flex: 1,
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  attemptsText: {
    fontSize: 14,
    color: palette.textSecondary,
  },
  riskWarning: {
    fontSize: 14,
    color: palette.error,
    marginTop: 8,
    fontWeight: '600',
  },
  signalsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  signalCard: {
    width: '48%',
    backgroundColor: palette.surface,
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    alignItems: 'center',
  },
  signalLabel: {
    fontSize: 14,
    color: palette.textSecondary,
    marginBottom: 8,
  },
  signalValue: {
    fontSize: 24,
    fontWeight: '700',
    color: palette.accentPrimary,
  },
  alertCard: {
    flexDirection: 'row',
    backgroundColor: '#FFF3CD',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    alignItems: 'center',
  },
  alertIcon: {
    fontSize: 24,
    marginRight: 12,
  },
  alertText: {
    flex: 1,
    fontSize: 14,
    color: '#856404',
  },
  ykiCard: {
    backgroundColor: palette.surface,
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: palette.divider,
  },
  ykiRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: palette.divider,
  },
  ykiLabel: {
    fontSize: 16,
    color: palette.textPrimary,
  },
  ykiValue: {
    fontSize: 16,
    fontWeight: '700',
    color: palette.accentPrimary,
  },
  progressCard: {
    backgroundColor: palette.surface,
    borderRadius: 12,
    padding: 16,
    marginBottom: 8,
  },
  progressLabel: {
    fontSize: 14,
    color: palette.textSecondary,
    marginBottom: 4,
  },
  progressValue: {
    fontSize: 32,
    fontWeight: '700',
    color: palette.accentPrimary,
  },
  progressSubtext: {
    fontSize: 14,
    color: palette.textSecondary,
    marginTop: 8,
  },
  emptyState: {
    backgroundColor: palette.surface,
    borderRadius: 12,
    padding: 24,
    alignItems: 'center',
  },
  emptyStateText: {
    fontSize: 14,
    color: palette.textSecondary,
    textAlign: 'center',
  },
});











