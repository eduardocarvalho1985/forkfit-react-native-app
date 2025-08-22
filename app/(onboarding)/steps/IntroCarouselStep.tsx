import React from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import { useRouter } from 'expo-router';

const CORAL = '#FF725E';
const OFF_WHITE = '#FDF6F3';
const TEXT = '#1F2937';

interface IntroCarouselStepProps {
  onSetLoading: (loading: boolean) => void;
}

export default function IntroCarouselStep({ onSetLoading }: IntroCarouselStepProps) {
  const router = useRouter();

  const handleSignIn = () => {
    console.log('IntroCarouselStep: Sign In button pressed, navigating to auth');
    router.push('/(auth)/login');
  };

  return (
    <View style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.title}>Bem-vindo ao ForkFit</Text>
        <Text style={styles.subtitle}>
          Seu parceiro personalizado para uma vida mais saudável
        </Text>
        <Text style={styles.description}>
          Vamos criar um plano personalizado baseado nos seus objetivos e estilo de vida
        </Text>
      </View>
      
      {/* Sign In button for EXISTING users ONLY */}
      <Pressable style={styles.signInButton} onPress={handleSignIn}>
        <Text style={styles.signInText}>Já tem conta? Entrar</Text>
      </Pressable>
      
      <Text style={styles.newUserText}>
        Novo usuário? Complete o onboarding para criar sua conta
      </Text>
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
  },
  description: {
    fontSize: 16,
    color: '#64748b',
    textAlign: 'center',
    lineHeight: 24,
    marginTop: 12,
  },
  signInButton: {
    position: 'absolute',
    bottom: 40,
    right: 20,
  },
  signInText: {
    fontSize: 16,
    color: CORAL,
    fontWeight: '600',
  },
  newUserText: {
    position: 'absolute',
    bottom: 10,
    left: 20,
    fontSize: 14,
    color: '#64748b',
  },
});
