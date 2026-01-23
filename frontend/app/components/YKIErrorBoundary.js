/**
 * YKI Error Boundary Component
 * Handles YKI-specific errors with user-friendly messages, retry options, and fix steps
 */

import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { YKIError, YKIErrorType } from '../services/ykiErrorService';
import { colors } from '../styles/colors';
import { spacing } from '../styles/spacing';
import { typography } from '../styles/typography';
import { radius } from '../styles/radius';
import PremiumEmbossedButton from './PremiumEmbossedButton';
import Background from './ui/Background';

class YKIErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { 
      hasError: false, 
      error: null, 
      errorInfo: null,
      ykiError: null,
    };
  }

  static getDerivedStateFromError(error) {
    // Check if it's a YKIError
    if (error instanceof YKIError) {
      return { hasError: true, ykiError: error };
    }
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    console.error('YKIErrorBoundary caught an error:', error, errorInfo);
    this.setState({
      error,
      errorInfo,
      ykiError: error instanceof YKIError ? error : null,
    });
    
    // Log to error tracking service if available
    if (this.props.onError) {
      this.props.onError(error, errorInfo);
    }
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null, errorInfo: null, ykiError: null });
  };

  handleRetry = () => {
    if (this.props.onRetry) {
      this.props.onRetry();
    }
    this.handleReset();
  };

  renderYKIError() {
    const { ykiError } = this.state;
    if (!ykiError) return null;

    const display = ykiError.toDisplayFormat();

    return (
      <View style={styles.ykiErrorContainer}>
        <Text style={styles.errorEmoji}>
          {display.errorType === YKIErrorType.NETWORK_ERROR && '📡'}
          {display.errorType === YKIErrorType.PERMISSION_ERROR && '🔒'}
          {display.errorType === YKIErrorType.EMPTY_RECORDING && '🎤'}
          {display.errorType === YKIErrorType.TTS_FAILURE && '🔊'}
          {display.errorType === YKIErrorType.STT_FAILURE && '🎙️'}
          {display.errorType === YKIErrorType.TIMEOUT && '⏱️'}
          {!['network_error', 'permission_error', 'empty_recording', 'tts_failure', 'stt_failure', 'timeout'].includes(display.errorType) && '⚠️'}
        </Text>
        
        <Text style={styles.errorTitle}>{display.message}</Text>

        {display.fixSteps && display.fixSteps.length > 0 && (
          <View style={styles.fixStepsContainer}>
            <Text style={styles.fixStepsTitle}>How to fix:</Text>
            {display.fixSteps.map((step, index) => (
              <View key={index} style={styles.fixStepItem}>
                <Text style={styles.fixStepNumber}>{index + 1}.</Text>
                <Text style={styles.fixStepText}>{step}</Text>
              </View>
            ))}
          </View>
        )}

        <View style={styles.actions}>
          {display.canRetry && (
            <PremiumEmbossedButton
              title="Try Again"
              onPress={this.handleRetry}
              accessibilityLabel="Retry the operation"
              style={styles.button}
            />
          )}
          {this.props.onGoBack && (
            <TouchableOpacity
              onPress={this.props.onGoBack}
              style={styles.secondaryButton}
              accessibilityLabel="Go back"
            >
              <Text style={styles.secondaryButtonText}>Go Back</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>
    );
  }

  render() {
    if (this.state.hasError) {
      // If we have a YKIError, render it specially
      if (this.state.ykiError) {
        return (
          <Background module="yki">
            <ScrollView 
              contentContainerStyle={styles.container}
              showsVerticalScrollIndicator={false}
            >
              {this.renderYKIError()}
            </ScrollView>
          </Background>
        );
      }

      // Fallback to generic error if custom fallback provided
      if (this.props.fallback) {
        return this.props.fallback(this.state.error, this.handleReset);
      }

      // Generic error fallback
      return (
        <Background module="yki">
          <ScrollView 
            contentContainerStyle={styles.container}
            showsVerticalScrollIndicator={false}
          >
            <View style={styles.content}>
              <Text style={styles.emoji}>😔</Text>
              <Text style={styles.title}>Something went wrong</Text>
              <Text style={styles.message}>
                We're sorry, but something unexpected happened. Don't worry, your progress is safe.
              </Text>
              
              {__DEV__ && this.state.error && (
                <View style={styles.errorDetails}>
                  <Text style={styles.errorTitleText}>Error Details (Dev Only):</Text>
                  <Text style={styles.errorText}>
                    {this.state.error.toString()}
                  </Text>
                  {this.state.errorInfo && (
                    <Text style={styles.errorStack}>
                      {this.state.errorInfo.componentStack}
                    </Text>
                  )}
                </View>
              )}

              <View style={styles.actions}>
                <PremiumEmbossedButton
                  title="Try Again"
                  onPress={this.handleReset}
                  accessibilityLabel="Try again to reload the screen"
                  style={styles.button}
                />
                {this.props.onRetry && (
                  <TouchableOpacity
                    onPress={() => {
                      this.handleReset();
                      if (this.props.onRetry) {
                        this.props.onRetry();
                      }
                    }}
                    style={styles.secondaryButton}
                    accessibilityLabel="Go back to previous screen"
                  >
                    <Text style={styles.secondaryButtonText}>Go Back</Text>
                  </TouchableOpacity>
                )}
              </View>
            </View>
          </ScrollView>
        </Background>
      );
    }

    return this.props.children;
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: spacing.xl,
    justifyContent: 'center',
    alignItems: 'center',
    minHeight: '100%',
  },
  content: {
    alignItems: 'center',
    maxWidth: 400,
    width: '100%',
  },
  ykiErrorContainer: {
    alignItems: 'center',
    maxWidth: 400,
    width: '100%',
  },
  emoji: {
    fontSize: 64,
    marginBottom: spacing.l,
  },
  errorEmoji: {
    fontSize: 64,
    marginBottom: spacing.l,
  },
  title: {
    ...typography.titleXL,
    color: colors.textMain,
    textAlign: 'center',
    marginBottom: spacing.m,
  },
  errorTitle: {
    ...typography.titleL,
    color: colors.textMain,
    textAlign: 'center',
    marginBottom: spacing.l,
  },
  message: {
    ...typography.body,
    color: colors.textSecondary,
    textAlign: 'center',
    marginBottom: spacing.xl,
    lineHeight: 24,
  },
  fixStepsContainer: {
    backgroundColor: colors.surface,
    borderRadius: radius.m,
    padding: spacing.l,
    marginBottom: spacing.xl,
    width: '100%',
    borderWidth: 1,
    borderColor: colors.border,
  },
  fixStepsTitle: {
    ...typography.body,
    fontWeight: '600',
    color: colors.textMain,
    marginBottom: spacing.m,
  },
  fixStepItem: {
    flexDirection: 'row',
    marginBottom: spacing.s,
  },
  fixStepNumber: {
    ...typography.body,
    fontWeight: '600',
    color: colors.primary,
    marginRight: spacing.s,
    minWidth: 20,
  },
  fixStepText: {
    ...typography.body,
    color: colors.textSecondary,
    flex: 1,
  },
  errorDetails: {
    backgroundColor: colors.surface,
    borderRadius: radius.m,
    padding: spacing.m,
    marginBottom: spacing.l,
    width: '100%',
    borderWidth: 1,
    borderColor: colors.error,
  },
  errorTitleText: {
    ...typography.bodySm,
    fontWeight: '600',
    color: colors.error,
    marginBottom: spacing.s,
  },
  errorText: {
    ...typography.bodySm,
    color: colors.textSecondary,
    fontFamily: 'monospace',
    marginBottom: spacing.s,
  },
  errorStack: {
    ...typography.bodySm,
    color: colors.textTertiary,
    fontFamily: 'monospace',
    fontSize: 10,
  },
  actions: {
    width: '100%',
    gap: spacing.m,
  },
  button: {
    width: '100%',
  },
  secondaryButton: {
    padding: spacing.m,
    alignItems: 'center',
    justifyContent: 'center',
  },
  secondaryButtonText: {
    ...typography.body,
    color: colors.textSecondary,
    textDecorationLine: 'underline',
  },
});

export default YKIErrorBoundary;

