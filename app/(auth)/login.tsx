import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, Platform } from 'react-native';
import { router } from 'expo-router';
import { useAuth } from '@/contexts/AuthContext';
import { colors, spacing, typography, borderRadius } from '@/theme';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState("");
  const { signIn, signInWithGoogle, signInWithApple } = useAuth();

  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert('Erro', 'Por favor, preencha todos os campos');
      return;
    }
    
    setLoading("email");
    try {
      await signIn(email, password);
      // Navigation will be handled by the root layout
    } catch (error: any) {
      Alert.alert('Erro', error.message);
    } finally {
      setLoading("");
    }
  };

  const handleGoogleSignIn = async () => {
    try {
      setLoading("google");
      await signInWithGoogle();
      // Navigation will be handled by the root layout
    } catch (error: any) {
      Alert.alert('Erro', error.message);
    } finally {
      setLoading("");
    }
  };

  const handleAppleSignIn = async () => {
    try {
      setLoading("apple");
      await signInWithApple();
      // Navigation will be handled by the root layout
    } catch (error: any) {
      Alert.alert('Erro', error.message);
    } finally {
      setLoading("");
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>ForkFit</Text>
      <Text style={styles.subtitle}>Entrar na sua conta</Text>
      <Text style={styles.description}>
        Acesse seu plano personalizado e continue sua jornada
      </Text>

      <TextInput
        style={styles.input}
        placeholder="Email"
        value={email}
        onChangeText={setEmail}
        keyboardType="email-address"
        autoCapitalize="none"
      />

      <TextInput
        style={styles.input}
        placeholder="Senha"
        value={password}
        onChangeText={setPassword}
        secureTextEntry
      />

      <TouchableOpacity style={styles.button} onPress={handleLogin} disabled={loading === "email"}>
        <Text style={styles.buttonText}>{loading === "email" ? "Entrando..." : "Entrar"}</Text>
      </TouchableOpacity>

      <View style={styles.divider}>
        <View style={styles.dividerLine} />
        <Text style={styles.dividerText}>ou</Text>
        <View style={styles.dividerLine} />
      </View>

      <TouchableOpacity style={styles.googleButton} onPress={handleGoogleSignIn} disabled={loading === "google"}>
        <Text style={styles.socialButtonText}>{loading === "google" ? "Entrando com Google..." : "Entrar com Google"}</Text>
      </TouchableOpacity>

      {/* Apple Sign-In Button - iOS ONLY */}
      {Platform.OS === 'ios' && (
        <TouchableOpacity style={styles.appleButton} onPress={handleAppleSignIn} disabled={loading === "apple"}>
          <Text style={styles.socialButtonText}>{loading === "apple" ? "Entrando com Apple..." : "Entrar com Apple"}</Text>
        </TouchableOpacity>
      )}

      {/* Debug info in development */}
      {__DEV__ && (
        <Text style={styles.debugText}>
          Platform: {Platform.OS} | Apple Button: {Platform.OS === 'ios' ? 'Visible' : 'Hidden'}
        </Text>
      )}

      <TouchableOpacity onPress={() => router.push('/(auth)/forgot-password')}>
        <Text style={styles.linkText}>Esqueceu sua senha?</Text>
      </TouchableOpacity>

      <TouchableOpacity onPress={() => router.push('/(onboarding)')}>
        <Text style={styles.linkText}>Não tem conta? Volte ao onboarding</Text>
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
    textAlign: 'center',
    fontSize: typography.base,
    fontWeight: typography.semibold,
  },
  forgotPasswordButton: {
    alignSelf: 'center',
    marginBottom: spacing.md,
  },
  forgotPasswordText: {
    color: colors.primary,
    fontSize: typography.sm,
    fontWeight: typography.medium,
  },
  debugText: {
    marginTop: spacing.lg,
    textAlign: 'center',
    color: colors.textPrimary,
    fontSize: typography.xs,
  },
});