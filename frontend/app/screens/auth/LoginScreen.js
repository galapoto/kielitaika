import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import SceneBackground from '../../components/SceneBackground';
import { useAuth } from '../../context/AuthContext';
import { colors } from '../../styles/colors';
import { spacing } from '../../styles/spacing';
import { typography } from '../../styles/typography';
import { radius } from '../../styles/radius';
import { shadows } from '../../styles/shadows';

const runtimeBuildId = new Date().toISOString();
console.log('RUNTIME BUILD ID (LoginScreen.js):', runtimeBuildId);
const loginBackgroundSource = require('../../assets/backgrounds/metsä_talvi.png');
console.log('LOGIN BG SOURCE', loginBackgroundSource);

export default function LoginScreen({ navigation }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();

  const handleLogin = async () => {
    if (!email.trim() || !password.trim()) {
      Alert.alert('Error', 'Please enter both email and password');
      return;
    }

    setLoading(true);
    try {
      await login(email.trim(), password);
      // Navigation will be handled by AuthProvider/AppNavigator
    } catch (error) {
      Alert.alert('Login Failed', error.message || 'Please check your credentials and try again');
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <SceneBackground sceneKey="forest" orbEmotion="calm" />
      <View style={styles.content}>
        <View style={styles.header}>
          <Text style={styles.title}>Welcome to KieliTaika</Text>
          <Text style={styles.subtitle}>Sign in to continue your Finnish learning journey</Text>
        </View>

        <View style={styles.form}>
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Email</Text>
            <TextInput
              style={styles.input}
              placeholder="your@email.com"
              placeholderTextColor={colors.textSoft}
              value={email}
              onChangeText={setEmail}
              autoCapitalize="none"
              keyboardType="email-address"
              autoComplete="email"
              editable={!loading}
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Password</Text>
            <TextInput
              style={styles.input}
              placeholder="Enter your password"
              placeholderTextColor={colors.textSoft}
              value={password}
              onChangeText={setPassword}
              secureTextEntry
              autoCapitalize="none"
              autoComplete="password"
              editable={!loading}
              onSubmitEditing={handleLogin}
            />
          </View>

          <TouchableOpacity
            style={[styles.loginButton, loading && styles.loginButtonDisabled]}
            onPress={handleLogin}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.loginButtonText}>Sign In</Text>
            )}
          </TouchableOpacity>

          <View style={styles.footer}>
            <Text style={styles.footerText}>Don't have an account? </Text>
            <TouchableOpacity onPress={() => navigation.navigate('Register')}>
              <Text style={styles.footerLink}>Sign Up</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    padding: spacing.xl,
  },
  header: {
    alignItems: 'center',
    marginBottom: spacing['3xl'],
  },
  title: {
    ...typography.titleXL,
    color: colors.textMain,
    fontWeight: '700',
    marginBottom: spacing.m,
  },
  subtitle: {
    ...typography.body,
    color: colors.textSoft,
    textAlign: 'center',
  },
  form: {
    gap: spacing.l,
  },
  inputGroup: {
    gap: spacing.s,
  },
  label: {
    ...typography.bodySm,
    color: colors.textMain,
    fontWeight: '600',
  },
  input: {
    ...typography.body,
    color: colors.textMain,
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.grayLine,
    borderRadius: radius.m,
    padding: spacing.m,
    ...shadows.s,
  },
  loginButton: {
    backgroundColor: colors.blueMain,
    paddingVertical: spacing.m,
    borderRadius: radius.l,
    alignItems: 'center',
    marginTop: spacing.m,
    ...shadows.s,
  },
  loginButtonDisabled: {
    opacity: 0.7,
  },
  loginButtonText: {
    ...typography.body,
    color: colors.white,
    fontWeight: '700',
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: spacing.l,
  },
  footerText: {
    ...typography.bodySm,
    color: colors.textSoft,
  },
  footerLink: {
    ...typography.bodySm,
    color: colors.blueMain,
    fontWeight: '600',
  },
});
