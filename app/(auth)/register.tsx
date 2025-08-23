import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, Platform } from 'react-native';
import { router } from 'expo-router';
import { useAuth } from '@/contexts/AuthContext';
import { useOnboarding } from '@/app/(onboarding)/OnboardingContext';
import { api } from '@/services/api';
import { colors, spacing, typography, borderRadius } from '@/theme';

export default function Register() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState("");
  const { signUp, signInWithGoogle, signInWithApple } = useAuth();
  const { getCurrentStepData, clearOnboardingData } = useOnboarding();

  // Password validation state
  const [passwordErrors, setPasswordErrors] = useState<string[]>([]);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // Validate password in real-time
  const validatePassword = (password: string) => {
    const errors: string[] = [];
    
    if (password.length < 8) {
      errors.push('Mínimo 8 caracteres');
    }
    if (!/[a-z]/.test(password)) {
      errors.push('Uma letra minúscula');
    }
    if (!/[A-Z]/.test(password)) {
      errors.push('Uma letra maiúscula');
    }
    if (!/[0-9]/.test(password)) {
      errors.push('Um número');
    }
    if (!/[^a-zA-Z0-9]/.test(password)) {
      errors.push('Um caractere especial (!@#$%^&*)');
    }
    
    setPasswordErrors(errors);
    return errors.length === 0;
  };

  // Handle password change
  const handlePasswordChange = (text: string) => {
    setPassword(text);
    validatePassword(text);
  };

  // Get Firebase error message in Portuguese
  const getFirebaseErrorMessage = (error: any): string => {
    const errorCode = error?.code || '';
    
    switch (errorCode) {
      case 'auth/email-already-in-use':
        return 'Este email já está em uso. Tente fazer login ou use outro email.';
      case 'auth/invalid-email':
        return 'Email inválido. Verifique o formato do email.';
      case 'auth/weak-password':
        return 'Senha muito fraca. Verifique os requisitos abaixo.';
      case 'auth/password-does':
        return 'Senha não atende aos requisitos de segurança. Verifique os critérios abaixo.';
      case 'auth/network-request-failed':
        return 'Erro de conexão. Verifique sua internet e tente novamente.';
      default:
        return error?.message || 'Ocorreu um erro inesperado. Tente novamente.';
    }
  };

  const handleRegister = async () => {
    if (!email || !password || !confirmPassword) {
      Alert.alert('Erro', 'Por favor, preencha todos os campos');
      return;
    }
    
    if (password !== confirmPassword) {
      Alert.alert('Erro', 'As senhas não coincidem');
      return;
    }

    if (passwordErrors.length > 0) {
      Alert.alert('Erro', 'A senha não atende aos requisitos de segurança');
      return;
    }
    
    setLoading("email");
    try {
      // Get all onboarding data
      const onboardingData = getCurrentStepData();
      console.log('Register: Onboarding data to save:', onboardingData);
      
      // Create Firebase account
      await signUp(email, password);
      
      // The AuthContext will handle the backend sync automatically
      // and redirect to the dashboard when complete
      
      // Clear onboarding data after successful account creation
      clearOnboardingData();
      
      console.log('Register: Account created successfully');
      
    } catch (error: any) {
      console.error('Error in registration flow:', error);
      const errorMessage = getFirebaseErrorMessage(error);
      Alert.alert('Erro no Cadastro', errorMessage);
    } finally {
      setLoading("");
    }
  };

  const handleGoogleSignIn = async () => {
    try {
      setLoading("google");
      
      // Get onboarding data for new users
      const onboardingData = getCurrentStepData();
      console.log('Register: Google sign in with onboarding data:', onboardingData);
      
      await signInWithGoogle();
      
      // Clear onboarding data after successful sign in
      clearOnboardingData();
      
      console.log('Register: Google sign in successful');
      
    } catch (error: any) {
      console.error('Error during Google sign in:', error);
      Alert.alert('Erro', error.message || 'Erro no login com Google');
    } finally {
      setLoading("");
    }
  };

  const handleAppleSignIn = async () => {
    try {
      setLoading("apple");
      
      // Get onboarding data for new users
      const onboardingData = getCurrentStepData();
      console.log('Register: Apple sign in with onboarding data:', onboardingData);
      
      await signInWithApple();
      
      // Clear onboarding data after successful sign in
      clearOnboardingData();
      
      console.log('Register: Apple sign in successful');
      
    } catch (error: any) {
      console.error('Error during Apple sign in:', error);
      Alert.alert('Erro', error.message || 'Erro no login com Apple');
    } finally {
      setLoading("");
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>ForkFit</Text>
      <Text style={styles.subtitle}>Crie sua conta</Text>
      <Text style={styles.description}>
        Complete seu cadastro para acessar seu plano personalizado
      </Text>

      <TextInput
        style={styles.input}
        placeholder="Email"
        value={email}
        onChangeText={setEmail}
        keyboardType="email-address"
        autoCapitalize="none"
      />

      <View style={styles.passwordContainer}>
        <TextInput
          style={styles.input}
          placeholder="Senha"
          value={password}
          onChangeText={handlePasswordChange}
          secureTextEntry={!showPassword}
        />
        <TouchableOpacity 
          style={styles.eyeButton} 
          onPress={() => setShowPassword(!showPassword)}
        >
          <Text style={styles.eyeButtonText}>{showPassword ? '👁️' : '👁️‍🗨️'}</Text>
        </TouchableOpacity>
      </View>

      {/* Password requirements */}
      {password.length > 0 && (
        <View style={styles.passwordRequirements}>
          <Text style={styles.requirementsTitle}>A senha deve conter:</Text>
          {[
            { text: 'Mínimo 8 caracteres', valid: password.length >= 8 },
            { text: 'Uma letra minúscula', valid: /[a-z]/.test(password) },
            { text: 'Uma letra maiúscula', valid: /[A-Z]/.test(password) },
            { text: 'Um número', valid: /[0-9]/.test(password) },
            { text: 'Um caractere especial (!@#$%^&*)', valid: /[^a-zA-Z0-9]/.test(password) }
          ].map((requirement, index) => (
            <Text 
              key={index} 
              style={[
                styles.requirementText,
                { color: requirement.valid ? '#10B981' : '#EF4444' }
              ]}
            >
              {requirement.valid ? '✅' : '❌'} {requirement.text}
            </Text>
          ))}
        </View>
      )}

      <View style={styles.passwordContainer}>
        <TextInput
          style={styles.input}
          placeholder="Confirmar Senha"
          value={confirmPassword}
          onChangeText={setConfirmPassword}
          secureTextEntry={!showConfirmPassword}
        />
        <TouchableOpacity 
          style={styles.eyeButton} 
          onPress={() => setShowConfirmPassword(!showConfirmPassword)}
        >
          <Text style={styles.eyeButtonText}>{showConfirmPassword ? '👁️' : '👁️‍🗨️'}</Text>
        </TouchableOpacity>
      </View>

      {/* Password match indicator */}
      {confirmPassword.length > 0 && (
        <Text style={[
          styles.matchIndicator,
          { color: password === confirmPassword ? '#10B981' : '#EF4444' }
        ]}>
          {password === confirmPassword ? '✅ Senhas coincidem' : '❌ Senhas não coincidem'}
        </Text>
      )}

      <TouchableOpacity 
        style={[
          styles.button, 
          { opacity: loading === "email" || passwordErrors.length > 0 || password !== confirmPassword ? 0.5 : 1 }
        ]} 
        onPress={handleRegister} 
        disabled={loading === "email" || passwordErrors.length > 0 || password !== confirmPassword}
      >
        <Text style={styles.buttonText}>{loading === "email" ? "Cadastrando..." : "Criar Conta"}</Text>
      </TouchableOpacity>

      <View style={styles.divider}>
        <View style={styles.dividerLine} />
        <Text style={styles.dividerText}>ou</Text>
        <View style={styles.dividerLine} />
      </View>

      <TouchableOpacity style={styles.googleButton} onPress={handleGoogleSignIn} disabled={loading === "google"}>
        <Text style={styles.socialButtonText}>{loading === "google" ? "Cadastrando com Google..." : "Cadastrar com Google"}</Text>
      </TouchableOpacity>

      {Platform.OS === 'ios' && (
        <TouchableOpacity style={styles.appleButton} onPress={handleAppleSignIn} disabled={loading === "apple"}>
          <Text style={styles.socialButtonText}>{loading === "apple" ? "Cadastrando com Apple..." : "Cadastrar com Apple"}</Text>
        </TouchableOpacity>
      )}

      <TouchableOpacity onPress={() => router.push('/(auth)/login')}>
        <Text style={styles.linkText}>Já tem conta? Entre aqui</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    padding: spacing.md,
    backgroundColor: colors.background,
  },
  title: {
    fontSize: typography['4xl'],
    fontWeight: typography.bold,
    textAlign: 'center',
    marginBottom: spacing.sm,
    color: colors.primary,
  },
  subtitle: {
    fontSize: typography.base,
    textAlign: 'center',
    marginBottom: spacing.xl,
    color: colors.textSecondary,
  },
  description: {
    fontSize: typography.sm,
    textAlign: 'center',
    marginBottom: spacing.xl,
    color: colors.textSecondary,
  },
  input: {
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.md,
    borderRadius: borderRadius.sm,
    marginBottom: spacing.md,
    fontSize: typography.base,
  },
  button: {
    backgroundColor: colors.primary,
    padding: spacing.md,
    borderRadius: borderRadius.sm,
    marginBottom: spacing.md,
  },
  buttonText: {
    color: colors.textInverse,
    textAlign: 'center',
    fontSize: typography.base,
    fontWeight: typography.semibold,
  },
  linkText: {
    textAlign: 'center',
    color: colors.primary,
    fontSize: typography.base,
  },
  divider: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: spacing.lg,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: colors.border,
  },
  dividerText: {
    marginHorizontal: spacing.md,
    color: colors.textSecondary,
    fontSize: typography.sm,
  },
  googleButton: {
    backgroundColor: colors.google,
    padding: spacing.md,
    borderRadius: borderRadius.sm,
    marginBottom: spacing.sm,
  },
  appleButton: {
    backgroundColor: colors.apple,
    padding: spacing.md,
    borderRadius: borderRadius.sm,
    marginBottom: spacing.md,
  },
  socialButtonText: {
    color: colors.textInverse,
    fontSize: typography.base,
    fontWeight: typography.semibold,
    textAlign: 'center',
  },
  passwordContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.md,
    borderRadius: borderRadius.sm,
    marginBottom: spacing.md,
  },
  eyeButton: {
    padding: spacing.sm,
  },
  eyeButtonText: {
    fontSize: typography['2xl'],
  },
  passwordRequirements: {
    marginTop: -10,
    marginBottom: spacing.md,
    paddingHorizontal: spacing.md,
    backgroundColor: colors.backgroundTertiary,
    borderRadius: borderRadius.sm,
  },
  requirementsTitle: {
    fontSize: typography.sm,
    fontWeight: typography.bold,
    marginBottom: spacing.sm,
    color: colors.textSecondary,
  },
  requirementText: {
    fontSize: typography.xs,
    marginBottom: spacing.xs,
  },
  matchIndicator: {
    fontSize: typography.sm,
    marginTop: -10,
    marginBottom: spacing.md,
    textAlign: 'center',
  },
});