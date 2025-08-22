import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, Platform } from 'react-native';
import { router } from 'expo-router';
import { useAuth } from '@/contexts/AuthContext';
import { useOnboarding } from '@/app/(onboarding)/OnboardingContext';
import { api } from '@/services/api';
import { getAuth } from '@react-native-firebase/auth';

export default function Register() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState("");
  const { signUp, signInWithGoogle, signInWithApple } = useAuth();
  const { getCurrentStepData, clearOnboardingData } = useOnboarding();

  const handleRegister = async () => {
    if (!email || !password || !confirmPassword) {
      Alert.alert('Erro', 'Por favor, preencha todos os campos');
      return;
    }
    if (password !== confirmPassword) {
      Alert.alert('Erro', 'As senhas não coincidem');
      return;
    }
    
    setLoading("email");
    try {
      // Create the user account
      await signUp(email, password);
      
      // Get the current user and onboarding data
      const currentUser = getAuth().currentUser;
      if (!currentUser) {
        throw new Error('User creation failed');
      }
      
      // Get all onboarding data
      const onboardingData = getCurrentStepData();
      console.log('Onboarding data to save:', onboardingData);
      
      // Get authentication token
      const token = await currentUser.getIdToken();
      if (!token) {
        throw new Error('No authentication token available');
      }
      
      // Create user profile with all onboarding data
      const userProfileData = {
        ...onboardingData,
        onboardingCompleted: true,
        notificationsEnabled: false // Will be set later
      };
      
      console.log('Creating user profile with data:', userProfileData);
      
      // Save user profile to backend
      await api.updateUserProfile(currentUser.uid, userProfileData, token);
      console.log('User profile created successfully');
      
      // Clear onboarding data
      clearOnboardingData();
      
      // Navigate to main app
      router.replace('/(app)');
      
    } catch (error: any) {
      console.error('Error in registration flow:', error);
      Alert.alert('Erro', error.message || 'Erro ao criar conta');
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

      <TextInput
        style={styles.input}
        placeholder="Senha"
        value={password}
        onChangeText={setPassword}
        secureTextEntry
      />

      <TextInput
        style={styles.input}
        placeholder="Confirmar Senha"
        value={confirmPassword}
        onChangeText={setConfirmPassword}
        secureTextEntry
      />

      <TouchableOpacity style={styles.button} onPress={handleRegister} disabled={loading === "email"}>
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

      <TouchableOpacity style={styles.appleButton} onPress={handleAppleSignIn} disabled={loading === "apple"}>
        <Text style={styles.socialButtonText}>{loading === "apple" ? "Cadastrando com Apple..." : "Cadastrar com Apple"}</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.loginLink} onPress={() => router.push('/(auth)/login')}>
        <Text style={styles.loginLinkText}>Já tem uma conta? Faça login</Text>
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
  description: {
    fontSize: 14,
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
  loginLink: {
    marginTop: 20,
    alignSelf: 'center',
  },
  loginLinkText: {
    color: '#FF725E',
    fontSize: 16,
  },
});