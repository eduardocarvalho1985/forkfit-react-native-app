import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, Platform } from 'react-native';
import { router } from 'expo-router';
import { useAuth } from '@/contexts/AuthContext';
import { colors, spacing, typography, borderRadius } from '@/theme';
import Icon from 'react-native-vector-icons/MaterialIcons';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState("");
  const [showPassword, setShowPassword] = useState(false);
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

      <View style={styles.passwordContainer}>
        <TextInput
          style={styles.passwordInput}
          placeholder="Senha"
          value={password}
          onChangeText={setPassword}
          secureTextEntry={!showPassword}
        />
        <TouchableOpacity 
          style={styles.eyeButton} 
          onPress={() => setShowPassword(!showPassword)}
        >
          <Icon 
            name={showPassword ? 'visibility' : 'visibility-off'} 
            size={20} 
            color={colors.textSecondary}
          />
        </TouchableOpacity>
      </View>

      <TouchableOpacity style={styles.button} onPress={handleLogin} disabled={loading === "email"}>
        <Text style={styles.buttonText}>{loading === "email" ? "Entrando..." : "Entrar"}</Text>
      </TouchableOpacity>

      <View style={styles.divider}>
        <View style={styles.dividerLine} />
        <Text style={styles.dividerText}>ou</Text>
        <View style={styles.dividerLine} />
      </View>

      <TouchableOpacity style={styles.googleButton} onPress={handleGoogleSignIn} disabled={loading === "google"}>
        <Icon name="g-translate" size={20} color={colors.textInverse} style={styles.buttonIcon} />
        <Text style={styles.socialButtonText}>{loading === "google" ? "Entrando com Google..." : "Entrar com Google"}</Text>
      </TouchableOpacity>

      {/* Apple Sign-In Button - iOS ONLY */}
      {Platform.OS === 'ios' && (
        <TouchableOpacity style={styles.appleButton} onPress={handleAppleSignIn} disabled={loading === "apple"}>
          <Icon name="apple" size={20} color={colors.textInverse} style={styles.buttonIcon} />
          <Text style={styles.socialButtonText}>{loading === "apple" ? "Entrando com Apple..." : "Entrar com Apple"}</Text>
        </TouchableOpacity>
      )}

      <TouchableOpacity onPress={() => router.push('/(auth)/forgot-password')}>
        <Text style={styles.linkText}>Esqueceu sua senha?</Text>
      </TouchableOpacity>

      <TouchableOpacity 
        style={styles.createAccountButton} 
        onPress={() => router.push('/(onboarding)')}
      >
        <Text style={styles.createAccountButtonText}>Não tem conta? Comece aqui</Text>
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
  subtitle: {
    fontSize: typography['2xl'],
    fontWeight: typography.bold,
    textAlign: 'center',
    marginBottom: spacing.xl,
    color: colors.textPrimary,
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
  passwordContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.md,
    borderRadius: borderRadius.sm,
    marginBottom: spacing.md,
  },
  passwordInput: {
    flex: 1,
    fontSize: typography.base,
  },
  eyeButton: {
    padding: spacing.sm,
    borderRadius: borderRadius.full,
    backgroundColor: colors.background,
    borderWidth: 1,
    borderColor: colors.border,
    minWidth: 32,
    height: 32,
    alignItems: 'center',
    justifyContent: 'center',
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
    marginTop: spacing.md,
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
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  appleButton: {
    backgroundColor: colors.apple,
    padding: spacing.md,
    borderRadius: borderRadius.sm,
    marginBottom: spacing.md,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  socialButtonText: {
    color: colors.textInverse,
    textAlign: 'center',
    fontSize: typography.base,
    fontWeight: typography.semibold,
    marginLeft: spacing.sm,
  },
  buttonIcon: {
    marginRight: spacing.sm,
  },
  createAccountButton: {
    backgroundColor: colors.primary,
    borderRadius: borderRadius.md,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.xl,
    alignItems: 'center',
    justifyContent: 'center',
    minWidth: 200,
    marginTop: spacing.lg,
  },
  createAccountButtonText: {
    color: colors.textInverse,
    fontWeight: typography.bold,
    fontSize: typography.lg,
  },
});