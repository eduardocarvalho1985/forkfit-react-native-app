import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import { useOnboarding } from '@/app/(onboarding)/OnboardingContext';
import { useSubscription } from '@/contexts/SubscriptionContext';
import { colors, spacing, typography, borderRadius, shadows } from '@/theme';

interface PaywallStepProps {
  onSetLoading: (loading: boolean) => void;
}

export default function PaywallStep({ onSetLoading }: PaywallStepProps) {
  const router = useRouter();
  const { getCurrentStepData } = useOnboarding();
  const { presentPaywall, isLoading: subscriptionLoading } = useSubscription();
  const [paywallPresented, setPaywallPresented] = useState(false);

  // Automatically present paywall when component mounts
  useEffect(() => {
    if (!paywallPresented && !subscriptionLoading) {
      console.log('🎯 PaywallStep: Presenting RevenueCat paywall...');
      setPaywallPresented(true);
      handleShowSubscription();
    }
  }, [subscriptionLoading, paywallPresented]);

  const handleShowSubscription = async () => {
    try {
      console.log('🎯 PaywallStep: Presenting subscription paywall...');
      
      const subscriptionSuccessful = await presentPaywall();
      
      if (subscriptionSuccessful) {
        console.log('✅ PaywallStep: Subscription successful, proceeding to registration');
        handleCreateAccount(true);
      } else {
        console.log('❌ PaywallStep: Subscription cancelled');
        // User cancelled - just reset so they can try again
        setPaywallPresented(false);
      }
      
    } catch (error: any) {
      console.error('❌ PaywallStep: Subscription error:', error);
      // If error, just reset so they can try again
      setPaywallPresented(false);
    }
  };

  const handleCreateAccount = (isPremiumUser: boolean = false) => {
    try {
      console.log('🎯 PaywallStep: Starting account creation process...', { isPremiumUser });
      
      const onboardingData = getCurrentStepData();
      
      const dataWithSubscription = {
        ...onboardingData,
        isPremium: isPremiumUser,
        subscriptionStatus: isPremiumUser ? 'active' : 'free'
      };
      
      console.log('📦 PaywallStep: Onboarding data with subscription:', dataWithSubscription);
      
      router.push({
        pathname: '/(auth)/register',
        params: { 
          onboardingData: JSON.stringify(dataWithSubscription)
        }
      });
      
    } catch (error: any) {
      console.error('❌ PaywallStep: Error preparing for account creation:', error);
      Alert.alert('Erro', 'Erro ao preparar dados para criação de conta');
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.title}>Carregando Planos... 🚀</Text>
        <Text style={styles.subtitle}>
          O RevenueCat está carregando seus planos de assinatura
        </Text>
        
        <ActivityIndicator 
          color={colors.primary} 
          size="large" 
          style={styles.loader}
        />
        
        <TouchableOpacity 
          style={styles.retryButton} 
          onPress={() => setPaywallPresented(false)}
        >
          <Text style={styles.retryButtonText}>Tentar Novamente</Text>
        </TouchableOpacity>
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
    paddingBottom: spacing.lg,
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
  loader: {
    marginVertical: spacing.xxl,
  },
  retryButton: {
    backgroundColor: colors.primary,
    borderRadius: borderRadius.md,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
    minWidth: 200,
    ...shadows.primary,
  },
  retryButtonText: {
    color: colors.textInverse,
    fontSize: typography.base,
    fontWeight: typography.medium,
    textAlign: 'center',
  },
});
