import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, Platform } from 'react-native';
import { router } from 'expo-router';
import { useAuth } from '@/contexts/AuthContext';

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
    setLoading("email")

    try {
      await signIn(email, password);
      // Navigation will be handled by the root layout
    } catch (error: any) {
      Alert.alert('Erro', error.message);
    } finally {
      setLoading("")
    }
  };

  const handleGoogleSignIn = async () => {
    try {
      setLoading("google")
      await signInWithGoogle();
      // Navigation will be handled by the root layout
    } catch (error: any) {
      Alert.alert('Erro', error.message);
    } finally {
      setLoading("")
    }
  };

  const handleAppleSignIn = async () => {
    try {
      setLoading("apple")
      await signInWithApple();
      // Navigation will be handled by the root layout
    } catch (error: any) {
      Alert.alert('Erro', error.message);
    } finally {
      setLoading("")
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>ForkFit</Text>
      <Text style={styles.subtitle}>Entre na sua conta</Text>

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

      <TouchableOpacity
        style={styles.forgotPasswordButton}
        onPress={() => router.push('/auth/forgot-password')}
      >
        <Text style={styles.forgotPasswordText}>Esqueceu sua senha?</Text>
      </TouchableOpacity>

      <View style={styles.divider}>
        <View style={styles.dividerLine} />
        <Text style={styles.dividerText}>ou</Text>
        <View style={styles.dividerLine} />
      </View>

      <TouchableOpacity style={styles.googleButton} onPress={handleGoogleSignIn} disabled={loading === "google"}>
        <Text style={styles.socialButtonText}>{loading === "google" ? "Entrando com Google..." : "Entrar com Google"}</Text>
      </TouchableOpacity>

      {Platform.OS === 'ios' && (
        <TouchableOpacity style={styles.appleButton} onPress={handleAppleSignIn} disabled={loading === "apple"}>
          <Text style={styles.socialButtonText}>{loading === "apple" ? "Entrando com Apple..." : "Entrar com Apple"}</Text>
        </TouchableOpacity>
      )}

      <TouchableOpacity onPress={() => router.push('/(auth)/register')}>
        <Text style={styles.linkText}>Não tem conta? Cadastre-se</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    padding: 16,
    backgroundColor: '#fff',
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 8,
    color: '#FF725E',
  },
  subtitle: {
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 32,
    color: '#666',
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    padding: 16,
    borderRadius: 8,
    marginBottom: 16,
    fontSize: 16,
  },
  button: {
    backgroundColor: '#FF725E',
    padding: 16,
    borderRadius: 8,
    marginBottom: 16,
  },
  buttonText: {
    color: '#fff',
    textAlign: 'center',
    fontSize: 16,
    fontWeight: '600',
  },
  linkText: {
    textAlign: 'center',
    color: '#FF725E',
    fontSize: 16,
  },
  divider: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 20,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: '#ddd',
  },
  dividerText: {
    marginHorizontal: 15,
    color: '#666',
    fontSize: 14,
  },
  googleButton: {
    backgroundColor: '#4285f4',
    padding: 16,
    borderRadius: 8,
    marginBottom: 12,
  },
  appleButton: {
    backgroundColor: '#000000',
    padding: 16,
    borderRadius: 8,
    marginBottom: 16,
  },
  socialButtonText: {
    color: '#fff',
    textAlign: 'center',
    fontSize: 16,
    fontWeight: '600',
  },
  forgotPasswordButton: {
    alignSelf: 'center',
    marginBottom: 16,
  },
  forgotPasswordText: {
    color: '#FF725E',
    fontSize: 14,
    fontWeight: '500',
  },
});