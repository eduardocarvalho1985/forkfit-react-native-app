import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { useOnboarding } from '@/app/(onboarding)/OnboardingContext';
import { colors, spacing, typography, borderRadius, shadows } from '@/theme';

interface PaywallStepProps {
  onSetLoading: (loading: boolean) => void;
}

export default function PaywallStep({ onSetLoading }: PaywallStepProps) {
  const router = useRouter();
  const { getCurrentStepData } = useOnboarding();

  const handleCreateAccount = () => {
    try {
      console.log('🎯 PaywallStep: Starting account creation process...');
      
      // Get all onboarding data
      console.log('📊 PaywallStep: Getting current step data...');
      const onboardingData = getCurrentStepData();
      console.log('📦 PaywallStep: Onboarding data to save:', onboardingData);
      console.log('📊 PaywallStep: Onboarding data keys:', Object.keys(onboardingData));
      console.log('📊 PaywallStep: Onboarding data values:', onboardingData);
      
      // Navigate to register with onboarding data as navigation params
      // This ensures the data survives the navigation between route groups
      console.log('🧭 PaywallStep: Navigating to register with onboarding data...');
      router.push({
        pathname: '/(auth)/register',
        params: { onboardingData: JSON.stringify(onboardingData) }
      });
      console.log('✅ PaywallStep: Navigation initiated successfully');
      
    } catch (error: any) {
      console.error('❌ PaywallStep: Error preparing for account creation:', error);
      Alert.alert('Erro', 'Erro ao preparar dados para criação de conta');
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.title}>Parabéns! 🎉</Text>
        <Text style={styles.subtitle}>
          Você completou o onboarding e agora pode criar sua conta
        </Text>
        <Text style={styles.description}>
          Crie sua conta ForkFit para salvar seu plano personalizado e começar sua jornada
        </Text>
      </View>
      
      <TouchableOpacity style={styles.createAccountButton} onPress={handleCreateAccount}>
        <Text style={styles.createAccountText}>Criar Minha Conta</Text>
      </TouchableOpacity>
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
    paddingBottom: spacing.footerBottom,
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    fontSize: typography['3xl'],
    fontWeight: typography.bold,
    color: colors.textPrimary,
    textAlign: 'center',
    marginBottom: spacing.sm,
  },
  subtitle: {
    fontSize: typography.base,
    color: colors.textSecondary,
    textAlign: 'center',
    lineHeight: typography.base * 1.5,
    marginBottom: spacing.xxl,
  },
  description: {
    fontSize: typography.sm,
    color: colors.textSecondary,
    textAlign: 'center',
    marginBottom: spacing.xxl,
  },
  createAccountButton: {
    backgroundColor: colors.primary,
    borderRadius: borderRadius.md,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
    ...shadows.primary,
  },
  createAccountText: {
    color: colors.textInverse,
    fontSize: typography.lg,
    fontWeight: typography.bold,
    textAlign: 'center',
  },
});
