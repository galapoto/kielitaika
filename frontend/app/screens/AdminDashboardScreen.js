import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
} from 'react-native';

import { HTTP_API_BASE } from '../config/backend';

export default function AdminDashboardScreen({ route, navigation }) {
  const [cohorts, setCohorts] = useState([]);
  const [selectedCohort, setSelectedCohort] = useState(null);
  const [analytics, setAnalytics] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingCohorts, setIsLoadingCohorts] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    loadCohorts();
  }, []);

  const loadCohorts = async () => {
    setIsLoadingCohorts(true);
    setError('');
    try {
      const response = await fetch(`${HTTP_API_BASE}/admin/cohorts`);
      const data = await response.json();
      const list = data.cohorts || [];
      setCohorts(list);
      if (list.length > 0) {
        setSelectedCohort(list[0].id);
        loadCohortAnalytics(list[0].id);
      }
    } catch (error) {
      console.error('Error loading cohorts:', error);
      setError('Failed to load cohorts');
    } finally {
      setIsLoadingCohorts(false);
    }
  };

  const loadCohortAnalytics = async (cohortId) => {
    setIsLoading(true);
    try {
      const response = await fetch(`${HTTP_API_BASE}/admin/cohorts/${cohortId}/analytics`);
      const data = await response.json();
      setAnalytics(data.analytics);
      setSelectedCohort(cohortId);
    } catch (error) {
      console.error('Error loading analytics:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const exportReport = async (format) => {
    if (!selectedCohort) return;
    
    try {
      const response = await fetch(
        `${HTTP_API_BASE}/admin/cohorts/${selectedCohort}/report?format=${format}`
      );
      const data = await response.json();
      
      if (format === 'csv') {
        // Download CSV
        alert(`CSV report ready: ${data.filename}`);
      } else {
        // Show JSON
        console.log('Report:', data);
      }
    } catch (error) {
      console.error('Error exporting report:', error);
    }
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Admin Dashboard</Text>
        <Text style={styles.subtitle}>Cohort Analytics & Reporting</Text>
      </View>
      
      {error ? <Text style={{ color: '#dc2626', paddingHorizontal: 20 }}>{error}</Text> : null}

      <View style={styles.cohortsSection}>
        <Text style={styles.sectionTitle}>Cohorts</Text>
        {isLoadingCohorts && (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="small" color="#0A3D62" />
          </View>
        )}
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.cohortChips}>
          {cohorts.map((cohort) => (
            <TouchableOpacity
              key={cohort.id}
              style={[
                styles.cohortChip,
                selectedCohort === cohort.id && styles.cohortChipActive,
              ]}
              onPress={() => loadCohortAnalytics(cohort.id)}
            >
              <Text
                style={[
                  styles.cohortChipText,
                  selectedCohort === cohort.id && styles.cohortChipTextActive,
                ]}
              >
                {cohort.name}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
        {cohorts.map((cohort) => (
          <TouchableOpacity
            key={cohort.id}
            style={[
              styles.cohortCard,
              selectedCohort === cohort.id && styles.cohortCardSelected,
            ]}
            onPress={() => loadCohortAnalytics(cohort.id)}
          >
            <Text style={styles.cohortName}>{cohort.name}</Text>
            <Text style={styles.cohortId}>ID: {cohort.id}</Text>
          </TouchableOpacity>
        ))}
      </View>

      {isLoading && (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#0A3D62" />
        </View>
      )}

      {analytics && (
        <View style={styles.analyticsSection}>
          <View style={styles.analyticsHeader}>
            <Text style={styles.sectionTitle}>Analytics</Text>
            <View style={styles.exportButtons}>
              <TouchableOpacity
                style={styles.exportButton}
                onPress={() => exportReport('csv')}
              >
                <Text style={styles.exportButtonText}>Export CSV</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.exportButton}
                onPress={() => exportReport('json')}
              >
                <Text style={styles.exportButtonText}>Export JSON</Text>
              </TouchableOpacity>
            </View>
          </View>

          <View style={styles.metricCard}>
            <Text style={styles.metricLabel}>Total Users</Text>
            <Text style={styles.metricValue}>{analytics.user_count}</Text>
          </View>

          <View style={styles.metricCard}>
            <Text style={styles.metricLabel}>Active Users</Text>
            <Text style={styles.metricValue}>{analytics.active_users}</Text>
          </View>

          {analytics.cefr_distribution && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>CEFR Distribution</Text>
              <View style={styles.distributionGrid}>
                {Object.entries(analytics.cefr_distribution).map(([level, count]) => {
                  if (level === 'total') return null;
                  return (
                    <View key={level} style={styles.distributionItem}>
                      <Text style={styles.distributionLevel}>{level}</Text>
                      <Text style={styles.distributionCount}>{count}</Text>
                    </View>
                  );
                })}
              </View>
            </View>
          )}

          {analytics.progress && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Progress Metrics</Text>
              <View style={styles.metricCard}>
                <Text style={styles.metricLabel}>Avg Sessions</Text>
                <Text style={styles.metricValue}>
                  {analytics.progress.average_sessions}
                </Text>
              </View>
              <View style={styles.metricCard}>
                <Text style={styles.metricLabel}>Avg Messages</Text>
                <Text style={styles.metricValue}>
                  {analytics.progress.average_messages}
                </Text>
              </View>
              <View style={styles.metricCard}>
                <Text style={styles.metricLabel}>Avg Accuracy</Text>
                <Text style={styles.metricValue}>
                  {(analytics.progress.average_accuracy * 100).toFixed(1)}%
                </Text>
              </View>
            </View>
          )}

          {analytics.workplace_performance && Object.keys(analytics.workplace_performance).length > 0 && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Workplace Performance</Text>
              {Object.entries(analytics.workplace_performance).map(([profession, data]) => (
                <View key={profession} style={styles.metricCard}>
                  <Text style={styles.metricLabel}>{profession}</Text>
                  <Text style={styles.metricValue}>
                    Score: {data.average_score?.toFixed(1)}/5
                  </Text>
                  <Text style={styles.metricSubtext}>
                    {data.user_count} users
                  </Text>
                </View>
              ))}
            </View>
          )}
        </View>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  header: {
    padding: 24,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e2e8f0',
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: '#0A3D62',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 14,
    color: '#64748b',
  },
  cohortsSection: {
    padding: 20,
  },
  cohortChips: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 12,
  },
  cohortChip: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#cbd5e1',
    backgroundColor: '#fff',
  },
  cohortChipActive: {
    borderColor: '#0A3D62',
    backgroundColor: '#eef2ff',
  },
  cohortChipText: {
    color: '#1e293b',
    fontWeight: '600',
  },
  cohortChipTextActive: {
    color: '#0A3D62',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1e293b',
    marginBottom: 16,
  },
  cohortCard: {
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  cohortCardSelected: {
    borderColor: '#0A3D62',
    borderWidth: 2,
    backgroundColor: '#eef2ff',
  },
  cohortName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1e293b',
    marginBottom: 4,
  },
  cohortId: {
    fontSize: 12,
    color: '#64748b',
  },
  loadingContainer: {
    padding: 40,
    alignItems: 'center',
  },
  analyticsSection: {
    padding: 20,
  },
  analyticsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  exportButtons: {
    flexDirection: 'row',
    gap: 8,
  },
  exportButton: {
    backgroundColor: '#24CBA4',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
  },
  exportButtonText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
  },
  section: {
    marginBottom: 24,
  },
  metricCard: {
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  metricLabel: {
    fontSize: 14,
    color: '#64748b',
    marginBottom: 4,
  },
  metricValue: {
    fontSize: 24,
    fontWeight: '700',
    color: '#0A3D62',
  },
  metricSubtext: {
    fontSize: 12,
    color: '#94a3b8',
    marginTop: 4,
  },
  distributionGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  distributionItem: {
    flex: 1,
    minWidth: '30%',
    backgroundColor: '#fff',
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  distributionLevel: {
    fontSize: 12,
    color: '#64748b',
    marginBottom: 4,
  },
  distributionCount: {
    fontSize: 20,
    fontWeight: '700',
    color: '#0A3D62',
  },
});
