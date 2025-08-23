import React, { useEffect } from 'react';
import { View, Text, StyleSheet, ActivityIndicator } from 'react-native';
import { useOnboarding } from '../OnboardingContext';
import { colors, spacing, typography } from '@/theme';

interface LoadingStepProps {
  onSetLoading: (loading: boolean) => void;
}

export default function LoadingStep({ onSetLoading }: LoadingStepProps) {
  const { updateStepData } = useOnboarding();

  // Auto-advance after 3 seconds
  useEffect(() => {
    const timer = setTimeout(() => {
      // Mark this step as completed
      updateStepData('loading', { loadingCompleted: true });
      console.log('Loading step completed, auto-advancing...');
    }, 3000);

    return () => clearTimeout(timer);
  }, []);

  return (
    <View style={styles.container}>
      <View style={styles.content}>
        <ActivityIndicator size="large" color={colors.primary} style={styles.spinner} />
        <Text style={styles.title}>Personalizando seu plano...</Text>
        <Text style={styles.subtitle}>
          Criando um plano único baseado nas suas informações
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  content: {
    flex: 1,
    paddingHorizontal: spacing.screenPadding,
    paddingTop: spacing.xxl,
    paddingBottom: spacing.xxl,
    justifyContent: 'center',
    alignItems: 'center',
  },
  spinner: {
    marginBottom: spacing.lg,
  },
  title: {
    fontSize: typography['3xl'],
    fontWeight: typography.bold,
    color: colors.textPrimary,
    textAlign: 'center',
    marginBottom: spacing.md,
  },
  subtitle: {
    fontSize: typography.base,
    color: colors.textSecondary,
    textAlign: 'center',
    lineHeight: typography.base * 1.5,
  },
});
