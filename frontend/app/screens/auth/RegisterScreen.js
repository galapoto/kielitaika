import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import * as WebBrowser from 'expo-web-browser';
import * as Google from 'expo-auth-session/providers/google';
import { useAuth } from '../../context/AuthContext';
import GoogleLogo from '../../ui/icons/GoogleLogo';
import RukaLogo3D from '../../components/RukaLogo3D';

WebBrowser.maybeCompleteAuthSession();

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = require('react-native').Dimensions.get('window');

export default function RegisterScreen({ navigation }) {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const { register, loginWithGoogle } = useAuth();
  const googleClientId = process.env.EXPO_PUBLIC_GOOGLE_CLIENT_ID || '946481356194-v8t6riiihp9oetqd1fl6gc1onhi2quf1.apps.googleusercontent.com';
  const [request, response, promptAsync] = Google.useAuthRequest({
    clientId: googleClientId,
    iosClientId: googleClientId,
    androidClientId: googleClientId,
    expoClientId: googleClientId,
    responseType: 'id_token',
  });

  const handleRegister = async () => {
    if (!email.trim() || !password.trim()) {
      Alert.alert('Error', 'Please enter email and password');
      return;
    }

    if (password.length < 6) {
      Alert.alert('Error', 'Password must be at least 6 characters');
      return;
    }

    if (password !== confirmPassword) {
      Alert.alert('Error', 'Passwords do not match');
      return;
    }

    setLoading(true);
    try {
      await register(email.trim(), password, name.trim() || null);
      // Navigation will be handled by AuthProvider/AppNavigator
    } catch (error) {
      Alert.alert('Registration Failed', error.message || 'Please try again');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const handleGoogleResponse = async () => {
      if (response?.type === 'success' && response.authentication?.idToken) {
        try {
          setGoogleLoading(true);
          await loginWithGoogle(response.authentication.idToken);
        } catch (err) {
          Alert.alert('Google Sign-In Failed', err.message || 'Please try again');
        } finally {
          setGoogleLoading(false);
        }
      }
    };
    handleGoogleResponse();
  }, [response]);

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <View style={styles.container}>
        <ScrollView 
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.content}>
            {/* Logo */}
            <View style={styles.logoContainer}>
              <RukaLogo3D width={280} height={93} />
            </View>
            
            {/* Welcome Text */}
            <View style={styles.header}>
              <Text style={styles.title}>Create Account!</Text>
              <Text style={styles.subtitle}>Please sign up to start your journey</Text>
            </View>

            {/* Registration Form */}
            <View style={styles.form}>
              {/* Name Field */}
              <View style={styles.inputContainer}>
                <TextInput
                  style={styles.input}
                  placeholder="Name (Optional)"
                  placeholderTextColor="rgba(255, 255, 255, 0.5)"
                  value={name}
                  onChangeText={setName}
                  autoCapitalize="words"
                  editable={!loading}
                />
              </View>

              {/* Email Field */}
              <View style={styles.inputContainer}>
                <TextInput
                  style={styles.input}
                  placeholder="Email"
                  placeholderTextColor="rgba(255, 255, 255, 0.5)"
                  value={email}
                  onChangeText={setEmail}
                  autoCapitalize="none"
                  keyboardType="email-address"
                  autoComplete="email"
                  editable={!loading}
                />
              </View>

              {/* Password Field */}
              <View style={styles.inputContainer}>
                <TextInput
                  style={styles.input}
                  placeholder="Password"
                  placeholderTextColor="rgba(255, 255, 255, 0.5)"
                  value={password}
                  onChangeText={setPassword}
                  secureTextEntry
                  autoCapitalize="none"
                  autoComplete="password-new"
                  editable={!loading}
                />
              </View>

              {/* Confirm Password Field */}
              <View style={styles.inputContainer}>
                <TextInput
                  style={styles.input}
                  placeholder="Confirm Password"
                  placeholderTextColor="rgba(255, 255, 255, 0.5)"
                  value={confirmPassword}
                  onChangeText={setConfirmPassword}
                  secureTextEntry
                  autoCapitalize="none"
                  autoComplete="password-new"
                  editable={!loading}
                  onSubmitEditing={handleRegister}
                />
              </View>

              {/* Sign Up Button */}
              <TouchableOpacity
                style={[styles.signUpButton, loading && styles.signUpButtonDisabled]}
                onPress={handleRegister}
                disabled={loading}
              >
                <Text style={styles.signUpButtonText}>
                  {loading ? 'Creating...' : 'Sign Up'}
                </Text>
              </TouchableOpacity>

              {/* Google Sign Up */}
              <TouchableOpacity
                style={styles.googleButton}
                onPress={() => {
                  if (request) promptAsync();
                }}
                disabled={googleLoading || !request}
              >
                <View style={styles.googleButtonContent}>
                  <GoogleLogo size={20} />
                  <Text style={styles.googleButtonText}>
                    {googleLoading ? 'Connecting...' : 'Sign Up With Google'}
                  </Text>
                </View>
              </TouchableOpacity>

              {/* Sign In Link */}
              <View style={styles.signInContainer}>
                <Text style={styles.signInText}>Already Have An Account? </Text>
                <TouchableOpacity onPress={() => navigation.navigate('Login')}>
                  <Text style={styles.signInLink}>Sign In</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </ScrollView>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000000', // Dark background matching LoginScreen
  },
  scrollContent: {
    flexGrow: 1,
    minHeight: SCREEN_HEIGHT,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: 24,
    paddingTop: 60,
    paddingBottom: 40,
  },
  logoContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 20,
    marginBottom: 20,
  },
  header: {
    alignItems: 'center',
    marginBottom: 40,
  },
  title: {
    fontSize: 32,
    fontWeight: '700',
    color: '#FFFFFF',
    textAlign: 'center',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.6)',
    textAlign: 'center',
  },
  form: {
    width: '100%',
    gap: 16,
  },
  inputContainer: {
    width: '100%',
    backgroundColor: 'rgba(40, 40, 40, 0.8)', // Dark gray rounded rectangle
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 16,
    marginBottom: 12,
  },
  input: {
    fontSize: 16,
    color: '#FFFFFF',
    padding: 0,
  },
  signUpButton: {
    width: '100%',
    backgroundColor: '#4A90E2', // Medium blue
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 8,
    marginBottom: 12,
  },
  signUpButtonDisabled: {
    opacity: 0.6,
  },
  signUpButtonText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  googleButton: {
    width: '100%',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(200, 200, 200, 0.5)',
    marginBottom: 12,
  },
  googleButtonContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  googleButtonText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#333333',
  },
  signInContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 8,
  },
  signInText: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.6)',
  },
  signInLink: {
    fontSize: 14,
    color: '#4A90E2', // Blue link color
    fontWeight: '600',
  },
});
