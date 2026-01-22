import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { colors } from '../styles/colors';
import { spacing } from '../styles/spacing';
import { typography } from '../styles/typography';
import { radius } from '../styles/radius';
import RukaButton from '../ui/components/Button';
import Background from './ui/Background';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    console.error('ErrorBoundary caught an error:', error, errorInfo);
    this.setState({
      error,
      errorInfo,
    });
    
    // Log to error tracking service if available
    if (this.props.onError) {
      this.props.onError(error, errorInfo);
    }
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null, errorInfo: null });
  };

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback(this.state.error, this.handleReset);
      }

      return (
        <Background module="home">
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
                  <Text style={styles.errorTitle}>Error Details (Dev Only):</Text>
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
                <RukaButton
                  title="Try Again"
                  onPress={this.handleReset}
                  accessibilityLabel="Try again to reload the screen"
                  style={styles.button}
                />
                {this.props.onRetry && (
                  <RukaButton
                    title="Go Back"
                    onPress={() => {
                      this.handleReset();
                      if (this.props.onRetry) {
                        this.props.onRetry();
                      }
                    }}
                    variant="secondary"
                    accessibilityLabel="Go back to previous screen"
                    style={styles.button}
                  />
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
  emoji: {
    fontSize: 64,
    marginBottom: spacing.l,
  },
  title: {
    ...typography.titleXL,
    color: colors.textMain,
    textAlign: 'center',
    marginBottom: spacing.m,
  },
  message: {
    ...typography.body,
    color: colors.textSecondary,
    textAlign: 'center',
    marginBottom: spacing.xl,
    lineHeight: 24,
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
  errorTitle: {
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
});

export default ErrorBoundary;






























