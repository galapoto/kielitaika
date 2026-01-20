import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  TouchableOpacity,
} from 'react-native';
import { useTheme } from '../context/ThemeContext';
import XPBadge from '../components/XPBadge';
import StreakFlame from '../components/StreakFlame';
import { colors } from '../styles/colors';
import { radius } from '../styles/radius';
import { shadows } from '../styles/shadows';
import { spacing } from '../styles/spacing';
import { typography } from '../styles/typography';

const API_BASE = process.env.EXPO_PUBLIC_API_BASE || 'http://localhost:8000';

export default function ProgressScreen() {
  const { colors: themeColors } = useTheme();
  const [users, setUsers] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [progress, setProgress] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    const bootstrap = async () => {
      await loadUsers();
    };
    bootstrap();
  }, []);

  useEffect(() => {
    if (selectedUser) {
      loadProgress(selectedUser);
    }
  }, [selectedUser]);

  const loadUsers = async () => {
    try {
      const res = await fetch(`${API_BASE}/admin/users`);
      if (!res.ok) throw new Error('Failed to load users');
      const data = await res.json();
      setUsers(data.users || []);
      if ((data.users || []).length > 0) {
        setSelectedUser(data.users[0].id);
      }
    } catch (err) {
      setError(err.message || 'Failed to load users');
    }
  };

  const loadProgress = async (userId) => {
    setLoading(true);
    setError('');
    try {
      const res = await fetch(`${API_BASE}/admin/users/${userId}/progress`);
      if (!res.ok) throw new Error('Failed to load progress');
      const data = await res.json();
      setProgress(data.report);
    } catch (err) {
      setError(err.message || 'Failed to load progress');
    } finally {
      setLoading(false);
    }
  };

  const renderMetric = (label, value, highlight = false, suffix = '') => (
    <View style={[dynamicStyles.metricCard, highlight && dynamicStyles.metricHighlight]}>
      <Text style={dynamicStyles.metricLabel}>{label}</Text>
      <Text style={dynamicStyles.metricValue}>
        {value}
        {suffix}
      </Text>
    </View>
  );

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
    userRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: spacing.m,
      marginBottom: spacing.m,
    },
    userChips: {
      flexDirection: 'row',
      gap: spacing.s,
    },
    userChip: {
      paddingHorizontal: spacing.m,
      paddingVertical: spacing.s,
      borderRadius: radius.m,
      backgroundColor: themeColors.surface,
      borderWidth: 1,
      borderColor: themeColors.border,
    },
    userChipActive: {
      backgroundColor: themeColors.primary,
      borderColor: themeColors.primary,
    },
    userChipText: {
      ...typography.bodySm,
      color: themeColors.text,
    },
    userChipTextActive: {
      color: colors.white,
    },
    refreshButton: {
      paddingHorizontal: spacing.m,
      paddingVertical: spacing.s,
      borderRadius: radius.m,
      backgroundColor: themeColors.primary,
    },
    refreshText: {
      ...typography.bodySm,
      color: colors.white,
      fontWeight: '600',
    },
    metricCard: {
      flex: 1,
      minWidth: '45%',
      backgroundColor: themeColors.surface,
      padding: spacing.m,
      borderRadius: radius.l,
      borderWidth: 1,
      borderColor: themeColors.border,
      ...shadows.s,
    },
    metricHighlight: {
      borderColor: themeColors.primary,
      borderWidth: 2,
    },
    metricLabel: {
      ...typography.micro,
      color: themeColors.textSecondary,
      marginBottom: spacing.xs,
    },
    metricValue: {
      ...typography.titleL,
      fontWeight: '700',
      color: themeColors.primary,
    },
    row: {
      flexDirection: 'row',
      gap: spacing.m,
      flexWrap: 'wrap',
    },
    card: {
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
    listItem: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      paddingVertical: spacing.s,
      borderBottomWidth: 1,
      borderBottomColor: themeColors.border,
    },
    listText: {
      ...typography.body,
      color: themeColors.text,
    },
    listBadge: {
      ...typography.bodySm,
      color: themeColors.primary,
      fontWeight: '600',
    },
    loading: {
      padding: spacing.xl,
      alignItems: 'center',
    },
    error: {
      ...typography.body,
      color: '#EF4444',
      padding: spacing.m,
      textAlign: 'center',
    },
    footer: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      padding: spacing.m,
      backgroundColor: themeColors.surface,
      borderTopWidth: 1,
      borderTopColor: themeColors.border,
    },
  });

  return (
    <View style={dynamicStyles.container}>
      <View style={dynamicStyles.header}>
        <Text style={dynamicStyles.title}>📊 Your Progress</Text>
        <Text style={dynamicStyles.subtitle}>Snapshot of sessions, accuracy, grammar, and workplace tracks</Text>
      </View>

      <ScrollView contentContainerStyle={dynamicStyles.content}>
        {/* Quick Stats Footer */}
        <View style={dynamicStyles.footer}>
          <StreakFlame streakCount={5} />
          <XPBadge xp={120} />
        </View>

        {error ? <Text style={dynamicStyles.error}>{error}</Text> : null}
        {loading && !progress ? (
          <View style={dynamicStyles.loading}>
            <ActivityIndicator size="large" color={themeColors.primary} />
          </View>
        ) : null}

        {progress && (
          <>
            <View style={dynamicStyles.row}>
              {renderMetric('Predicted CEFR', progress.predicted_cefr || 'A1', true)}
              {renderMetric('Sessions', progress.sessions || 0)}
              {renderMetric('Messages', progress.messages_count || 0)}
            </View>

            <View style={dynamicStyles.row}>
              {renderMetric('Accuracy', Math.round((progress.average_accuracy || 0) * 100), false, '%')}
              {renderMetric('Pronunciation', `${progress.pronunciation_score || 0}/4`)}
              {renderMetric('Last activity', progress.last_activity || 'N/A')}
            </View>

            {progress.workplace_performance && Object.keys(progress.workplace_performance).length > 0 && (
              <View style={dynamicStyles.card}>
                <Text style={dynamicStyles.sectionTitle}>💼 Workplace Performance</Text>
                {Object.entries(progress.workplace_performance).map(([field, data]) => (
                  <View key={field} style={dynamicStyles.listItem}>
                    <Text style={dynamicStyles.listText}>{field}</Text>
                    <Text style={dynamicStyles.listBadge}>
                      {(data.average_score || 0).toFixed(1)}/5
                    </Text>
                  </View>
                ))}
              </View>
            )}

            {progress.grammar_errors && Object.keys(progress.grammar_errors).length > 0 && (
              <View style={dynamicStyles.card}>
                <Text style={dynamicStyles.sectionTitle}>📝 Common Grammar Issues</Text>
                {Object.entries(progress.grammar_errors)
                  .slice(0, 6)
                  .map(([issue, count]) => (
                    <View key={issue} style={dynamicStyles.listItem}>
                      <Text style={dynamicStyles.listText}>{issue}</Text>
                      <Text style={dynamicStyles.listBadge}>{count}×</Text>
                    </View>
                  ))}
              </View>
            )}
          </>
        )}

        {!progress && !loading && (
          <View style={dynamicStyles.card}>
            <Text style={dynamicStyles.sectionTitle}>📈 Charts and achievements coming soon.</Text>
            <Text style={{ ...typography.bodySm, color: themeColors.textSecondary, marginTop: spacing.s }}>
              Track your speaking minutes, vocabulary growth, and skill progression.
            </Text>
          </View>
        )}
      </ScrollView>
    </View>
  );
}
