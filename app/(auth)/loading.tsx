import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ActivityIndicator, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { colors, spacing, typography } from '@/theme';
import { useOnboarding } from '@/app/(onboarding)/OnboardingContext';
import { useAuth } from '@/contexts/AuthContext';

export default function Loading() {
  const router = useRouter();
  const { user } = useAuth();
  const { clearOnboardingData } = useOnboarding();
  const [status, setStatus] = useState('Criando conta...');
  const [error, setError] = useState<string | null>(null);
  const [checkCount, setCheckCount] = useState(0);

  useEffect(() => {
    const setupUser = async () => {
      try {
        console.log('🔄 Loading: Starting user setup process...');
        console.log('👤 Loading: Current user state:', user);
        console.log('🆔 Loading: User UID:', user?.uid);
        console.log('📊 Loading: User onboarding status:', user?.onboardingCompleted);
        console.log('🔢 Loading: Check count:', checkCount);
        
        // Wait for user to be available from auth context
        if (!user?.uid) {
          console.log('⏳ Loading: Waiting for user to be available...');
          return;
        }

        console.log('✅ Loading: User available, checking onboarding completion...');
        
        // Check both the user state and AsyncStorage for onboarding completion
        const [userOnboardingStatus, storedOnboardingData] = await Promise.all([
          Promise.resolve(user.onboardingCompleted),
          AsyncStorage.getItem('onboardingData').catch(() => null)
        ]);
        
        console.log('📊 Loading: User onboarding status:', userOnboardingStatus);
        console.log('📦 Loading: Stored onboarding data exists:', !!storedOnboardingData);
        
        // Check if the user has been fully set up with onboarding data
        if (userOnboardingStatus === true) {
          console.log('🎉 Loading: User onboarding completed, proceeding to home...');
          
          // Clear onboarding data and navigate to home
          setStatus('Finalizando...');
          console.log('🧹 Loading: Clearing onboarding data...');
          clearOnboardingData();
          console.log('🧹 Loading: Onboarding data cleared');
          
          // Navigate to home
          console.log('🏠 Loading: Navigating to home...');
          router.replace('/(app)');
          return;
        }
        
        // If user state shows onboarding not complete, wait and check again
        console.log('⏳ Loading: Waiting for onboarding to complete...');
        console.log('📊 Loading: Current onboarding status:', userOnboardingStatus);
        
        // Increment check count to track attempts
        setCheckCount(prev => prev + 1);
        
        // Wait a bit more and check again
        setTimeout(async () => {
          console.log('⏰ Loading: Checking onboarding status again after delay...');
          
          // Check both sources again
          const [updatedUserStatus, updatedStoredData] = await Promise.all([
            Promise.resolve(user.onboardingCompleted),
            AsyncStorage.getItem('onboardingData').catch(() => null)
          ]);
          
          console.log('📊 Loading: Updated user status:', updatedUserStatus);
          console.log('📦 Loading: Updated stored data exists:', !!updatedStoredData);
          
          if (updatedUserStatus === true) {
            console.log('🎉 Loading: Onboarding completed after delay, navigating to home...');
            clearOnboardingData();
            router.replace('/(app)');
          } else {
            console.log('⚠️ Loading: Onboarding still not completed after delay');
            console.log('📊 Loading: Final user status:', updatedUserStatus);
            
            // If we've checked multiple times and still no completion, show error
            if (checkCount >= 2) {
              console.log('❌ Loading: Max checks reached, showing error');
              setError('Timeout: Onboarding completion not detected. Please try again.');
            }
          }
        }, 2000);
        
      } catch (err: any) {
        console.error('❌ Loading: Error during user setup:', err);
        setError(err.message || 'Erro durante a configuração da conta');
      }
    };

    setupUser();
  }, [router, clearOnboardingData, user, checkCount]);

  if (error) {
    return (
      <View style={styles.container}>
        <View style={styles.content}>
          <Text style={styles.errorTitle}>Erro na Configuração</Text>
          <Text style={styles.errorMessage}>{error}</Text>
          <Text style={styles.retryMessage}>
            Por favor, tente novamente ou entre em contato com o suporte.
          </Text>
          
          <TouchableOpacity 
            style={styles.retryButton} 
            onPress={() => {
              console.log('🔄 Loading: Retry button pressed, resetting state...');
              setError(null);
              setCheckCount(0);
              setStatus('Criando conta...');
            }}
          >
            <Text style={styles.retryButtonText}>Tentar Novamente</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  if (!user?.uid) {
    return (
      <View style={styles.container}>
        <View style={styles.content}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={styles.title}>Criando conta...</Text>
          <Text style={styles.description}>
            Aguarde enquanto criamos sua conta...
          </Text>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.content}>
        <ActivityIndicator size="large" color={colors.primary} />
        <Text style={styles.title}>Configurando sua conta</Text>
        <Text style={styles.status}>{status}</Text>
        <Text style={styles.description}>
          Isso pode levar alguns segundos...
        </Text>
        
        {/* Debug info */}
        <View style={styles.debugInfo}>
          <Text style={styles.debugText}>UID: {user?.uid}</Text>
          <Text style={styles.debugText}>Onboarding: {user?.onboardingCompleted ? '✅' : '❌'}</Text>
          <Text style={styles.debugText}>Checks: {checkCount}</Text>
        </View>
        
        {/* Debug button */}
        <TouchableOpacity 
          style={styles.debugButton} 
          onPress={async () => {
            console.log('🔍 Loading: Debug button pressed, checking status...');
            const storedData = await AsyncStorage.getItem('onboardingData');
            console.log('📦 Loading: Debug - Stored onboarding data:', storedData);
            console.log('👤 Loading: Debug - Current user state:', user);
            console.log('📊 Loading: Debug - User onboarding status:', user?.onboardingCompleted);
          }}
        >
          <Text style={styles.debugButtonText}>Debug Status</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: spacing.screenPadding,
  },
  content: {
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
  },
  title: {
    fontSize: typography['2xl'],
    fontWeight: typography.bold,
    color: colors.textPrimary,
    marginBottom: spacing.sm,
    textAlign: 'center',
  },
  status: {
    fontSize: typography.lg,
    color: colors.textSecondary,
    marginBottom: spacing.sm,
    textAlign: 'center',
  },
  description: {
    fontSize: typography.base,
    color: colors.textSecondary,
    textAlign: 'center',
    lineHeight: typography.base * 1.5,
  },
  errorTitle: {
    fontSize: typography['2xl'],
    fontWeight: typography.bold,
    color: colors.error,
    marginBottom: spacing.md,
    textAlign: 'center',
  },
  errorMessage: {
    fontSize: typography.base,
    color: colors.textSecondary,
    marginBottom: spacing.sm,
    textAlign: 'center',
    lineHeight: typography.base * 1.5,
  },
  retryMessage: {
    fontSize: typography.sm,
    color: colors.textSecondary,
    textAlign: 'center',
    lineHeight: typography.sm * 1.5,
    opacity: 0.8,
  },
  retryButton: {
    backgroundColor: colors.primary,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
    borderRadius: spacing.md,
    marginTop: spacing.lg,
  },
  retryButtonText: {
    color: colors.textInverse,
    fontSize: typography.base,
    fontWeight: typography.bold,
    textAlign: 'center',
  },
  debugInfo: {
    marginTop: spacing.md,
    padding: spacing.sm,
    backgroundColor: colors.backgroundSecondary,
    borderRadius: spacing.sm,
    borderWidth: 1,
    borderColor: colors.border,
    width: '100%',
    alignItems: 'center',
  },
  debugText: {
    fontSize: typography.sm,
    color: colors.textSecondary,
    marginBottom: spacing.xs,
  },
  debugButton: {
    backgroundColor: colors.primaryLight,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
    borderRadius: spacing.md,
    marginTop: spacing.md,
  },
  debugButtonText: {
    color: colors.primary,
    fontSize: typography.base,
    fontWeight: typography.bold,
    textAlign: 'center',
  },
});
