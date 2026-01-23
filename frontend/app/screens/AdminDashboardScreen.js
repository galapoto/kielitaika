import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
} from 'react-native';
import { RukaButton, RukaCard } from '../ui';
import { IconLightning, IconPlay } from '../ui/icons/IconPack';

const API_BASE = process.env.EXPO_PUBLIC_API_BASE || 'http://localhost:5000';

export default function AdminDashboardScreen({ route, navigation } = {}) {
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
      const response = await fetch(`${API_BASE}/admin/cohorts`);
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
      const response = await fetch(`${API_BASE}/admin/cohorts/${cohortId}/analytics`);
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
        `${API_BASE}/admin/cohorts/${selectedCohort}/report?format=${format}`
      );
      const data = await response.json();
      
      if (format === 'csv') {
        alert(`CSV report ready: ${data.filename}`);
      } else {
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
            <RukaButton
              key={cohort.id}
              title={cohort.name}
              onPress={() => loadCohortAnalytics(cohort.id)}
              icon={IconPlay}
              style={{ opacity: selectedCohort === cohort.id ? 1 : 0.7, marginRight: 8 }}
            />
          ))}
        </ScrollView>
        {cohorts.map((cohort) => (
          <RukaCard
            key={cohort.id}
            title={cohort.name}
            subtitle={`ID: ${cohort.id}`}
            icon={IconLightning}
            onPress={() => loadCohortAnalytics(cohort.id)}
            style={{ width: '100%' }}
          />
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
              <RukaButton
                title="Export CSV"
                onPress={() => exportReport('csv')}
                icon={IconLightning}
              />
              <RukaButton
                title="Export JSON"
                onPress={() => exportReport('json')}
                icon={IconLightning}
              />
            </View>
          </View>

          <RukaCard title="Total Users" subtitle={`${analytics.user_count}`} icon={IconPlay} style={styles.metricCard} />
          <RukaCard title="Active Today" subtitle={`${analytics.daily_active}`} icon={IconPlay} style={styles.metricCard} />
          <RukaCard title="Completion Rate" subtitle={`${analytics.completion_rate}%`} icon={IconLightning} style={styles.metricCard} />
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
    padding: 20,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e2e8f0',
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: '#0A3D62',
  },
  subtitle: {
    fontSize: 14,
    color: '#64748b',
  },
  cohortsSection: {
    padding: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#0f172a',
    marginBottom: 12,
  },
  loadingContainer: {
    padding: 12,
  },
  cohortChips: {
    paddingVertical: 8,
    gap: 8,
  },
  analyticsSection: {
    padding: 20,
    gap: 12,
  },
  analyticsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  exportButtons: {
    flexDirection: 'row',
    gap: 8,
  },
  metricCard: {
    width: '100%',
  },
});
