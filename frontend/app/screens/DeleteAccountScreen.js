import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  Alert,
  ActivityIndicator,
} from 'react-native';
import Background from '../components/ui/Background';
import HomeButton from '../components/HomeButton';
import PremiumEmbossedButton from '../components/PremiumEmbossedButton';
import { colors } from '../styles/colors';
import { spacing } from '../styles/spacing';
import { typography } from '../styles/typography';
import { radius } from '../styles/radius';
import { shadows } from '../styles/shadows';
import { useAuth } from '../context/AuthContext';
import { RukaButton, RukaCard } from '../ui';
import { IconPlay, IconLightning } from '../ui/icons/IconPack';

const API_BASE = process.env.EXPO_PUBLIC_API_BASE || 'http://localhost:8000';

/**
 * DeleteAccountScreen - GDPR account deletion
 * 
 * Features:
 * - Confirmation flow
 * - Account deletion
 * - Data removal confirmation
 */
export default function DeleteAccountScreen({ navigation }) {
  const [confirmText, setConfirmText] = useState('');
  const [deleting, setDeleting] = useState(false);
  const { user, logout } = useAuth();
  const requiredText = 'DELETE';

  if (!user) {
    return (
      <View style={styles.authGuard}>
        <Text style={styles.authGuardText}>Kirjaudu sisään jatkaaksesi.</Text>
      </View>
    );
  }

  const handleDelete = async () => {
    if (confirmText !== requiredText) {
      Alert.alert('Error', `Please type "${requiredText}" to confirm`);
      return;
    }

    Alert.alert(
      'Permanent Deletion',
      'This will permanently delete your account and all data. This cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete Forever',
          style: 'destructive',
          onPress: async () => {
            try {
              setDeleting(true);
              
              // TODO: Call backend GDPR deletion endpoint
              // await fetch(`${API_BASE}/gdpr/delete`, {
              //   method: 'POST',
              //   headers: { 'Authorization': `Bearer ${token}` }
              // });
              
              await logout();
              // Navigation handled by auth state
            } catch (err) {
              Alert.alert('Error', 'Failed to delete account. Please contact support.');
            } finally {
              setDeleting(false);
            }
          },
        },
      ]
    );
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
          icon={IconPlay}
          style={{ width: 120 }}
        />
        <Text style={styles.title}>Delete Account</Text>
      </View>

      <ScrollView style={styles.content} contentContainerStyle={styles.contentContainer}>
        <RukaCard title="Permanent Account Deletion" subtitle="This action cannot be undone." icon={IconLightning} style={styles.warningCard}>
          <Text style={styles.warningIcon}>⚠️</Text>
          <Text style={styles.warningText}>
            Deleting your account will permanently remove:
          </Text>
          <View style={styles.warningList}>
            <Text style={styles.warningItem}>• All conversation history</Text>
            <Text style={styles.warningItem}>• Progress and achievements</Text>
            <Text style={styles.warningItem}>• Certificates</Text>
            <Text style={styles.warningItem}>• Payment history</Text>
            <Text style={styles.warningItem}>• All personal data</Text>
          </View>
        </RukaCard>

        <View style={styles.confirmSection}>
          <Text style={styles.confirmLabel}>
            Type "{requiredText}" to confirm:
          </Text>
          <TextInput
            style={styles.confirmInput}
            value={confirmText}
            onChangeText={setConfirmText}
            placeholder={requiredText}
            placeholderTextColor={colors.textSoft}
            autoCapitalize="characters"
          />
        </View>

        <RukaButton
          title={deleting ? 'Deleting...' : 'Delete Account Forever'}
          onPress={handleDelete}
          icon={IconLightning}
          disabled={confirmText !== requiredText || deleting}
          style={{ marginTop: spacing.m }}
        />
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
  warningCard: {
    backgroundColor: '#fee2e2',
    padding: spacing.xl,
    borderRadius: radius.l,
    borderWidth: 2,
    borderColor: '#fca5a5',
    alignItems: 'center',
  },
  warningIcon: {
    fontSize: 48,
    marginBottom: spacing.m,
  },
  warningTitle: {
    ...typography.titleM,
    fontWeight: '700',
    color: '#b91c1c',
    marginBottom: spacing.m,
  },
  warningText: {
    ...typography.body,
    color: '#991b1b',
    marginBottom: spacing.m,
    textAlign: 'center',
  },
  warningList: {
    alignSelf: 'flex-start',
    gap: spacing.xs,
    marginBottom: spacing.m,
  },
  warningItem: {
    ...typography.body,
    color: '#991b1b',
  },
  warningFooter: {
    ...typography.body,
    fontWeight: '700',
    color: '#991b1b',
    marginTop: spacing.m,
  },
  confirmSection: {
    backgroundColor: colors.white,
    padding: spacing.l,
    borderRadius: radius.l,
    borderWidth: 1,
    borderColor: colors.grayLine,
    ...shadows.s,
  },
  confirmLabel: {
    ...typography.body,
    fontWeight: '600',
    color: colors.textMain,
    marginBottom: spacing.m,
  },
  confirmInput: {
    ...typography.body,
    borderWidth: 1,
    borderColor: colors.grayLine,
    borderRadius: radius.m,
    padding: spacing.m,
    backgroundColor: colors.grayBg,
  },
});
