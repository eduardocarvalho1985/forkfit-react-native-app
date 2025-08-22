import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { useOnboarding } from '@/app/(onboarding)/OnboardingContext';

const CORAL = '#FF725E';
const OFF_WHITE = '#FDF6F3';
const TEXT = '#1F2937';

interface PaywallStepProps {
  onSetLoading: (loading: boolean) => void;
}

export default function PaywallStep({ onSetLoading }: PaywallStepProps) {
  const router = useRouter();
  const { getCurrentStepData } = useOnboarding();

  const handleCreateAccount = () => {
    try {
      // Get all onboarding data
      const onboardingData = getCurrentStepData();
      console.log('PaywallStep: Onboarding data to save:', onboardingData);
      
      // Navigate to register with onboarding data
      // The register screen will handle Firebase account creation and backend sync
      router.push('/(auth)/register');
      
    } catch (error: any) {
      console.error('Error preparing for account creation:', error);
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
    backgroundColor: OFF_WHITE,
  },
  content: {
    flex: 1,
    paddingHorizontal: 24,
    paddingTop: 40,
    paddingBottom: 120, // Extra padding for fixed footer
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: TEXT,
    textAlign: 'center',
    marginBottom: 12,
  },
  subtitle: {
    fontSize: 16,
    color: '#64748b',
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 40,
  },
  description: {
    fontSize: 14,
    color: '#64748b',
    textAlign: 'center',
    marginBottom: 40,
  },
  createAccountButton: {
    backgroundColor: CORAL,
    borderRadius: 12,
    paddingVertical: 16,
    paddingHorizontal: 24,
    shadowColor: CORAL,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  createAccountText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
    textAlign: 'center',
  },
});
