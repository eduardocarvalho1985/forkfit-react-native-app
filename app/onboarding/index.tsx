import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import { useAuth } from '../../contexts/AuthContext';
import { api } from '../../services/api';
import { getAuth } from '@react-native-firebase/auth';

const CORAL = '#FF725E';
const OFF_WHITE = '#FFF8F6';
const BORDER = '#FFA28F';
const TEXT = '#1F2937';

export default function OnboardingScreen() {
  const { user, syncUser } = useAuth();
  const [name, setName] = useState(user?.name || '');
  const [loading, setLoading] = useState(false);

  // Update name when user data changes
  useEffect(() => {
    if (user?.name) {
      setName(user.name);
    }
  }, [user?.name]);

  const handleCompleteOnboarding = async () => {
    if (!user) {
      Alert.alert('Erro', 'Usuário não encontrado. Tente fazer login novamente.');
      return;
    }

    if (!name.trim()) {
      Alert.alert('Erro', 'Por favor, insira seu nome para continuar.');
      return;
    }

    if (name.trim().length < 2) {
      Alert.alert('Erro', 'O nome deve ter pelo menos 2 caracteres.');
      return;
    }

    setLoading(true);
    try {
      const token = await getAuth().currentUser?.getIdToken();
      if (!token) {
        throw new Error('No authentication token available');
      }

      // Update user profile with name and complete onboarding
      console.log('Updating user profile with name and onboarding status...');
      console.log('Name being saved:', name.trim());
      console.log('User UID:', user.uid);
      
      const userProfileData = {
        name: name.trim(),
        onboardingCompleted: true
      };
      console.log('User profile data being sent:', userProfileData);
      
      await api.updateUserProfile(user.uid, userProfileData, token);
      console.log('User profile updated successfully');

      // Try to update onboarding status specifically
      try {
        console.log('Updating onboarding status via dedicated endpoint...');
        await api.updateOnboardingStatus(user.uid, true, token);
        console.log('Onboarding endpoint call successful');
      } catch (onboardingError: any) {
        console.warn('Onboarding endpoint failed, but user profile was updated:', onboardingError.message);
        // Continue with the flow since the user profile update should have set onboardingCompleted
      }

      console.log('Onboarding completed successfully - syncing with backend');
      
      // Sync the updated user data to AuthContext
      await syncUser();
      console.log('User data synced after onboarding completion');

      console.log('Onboarding flow completed - redirect should happen now');
      
    } catch (error: any) {
      console.error('Error completing onboarding:', error);
      
      // More specific error messages
      if (error.message.includes('JSON Parse error')) {
        Alert.alert('Erro de Servidor', 'O servidor está retornando dados inválidos. Tente novamente em alguns instantes.');
      } else if (error.message.includes('timeout')) {
        Alert.alert('Erro de Conexão', 'A conexão com o servidor demorou muito. Verifique sua internet e tente novamente.');
      } else {
        Alert.alert('Erro', 'Não foi possível completar o onboarding. Tente novamente.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.title}>Bem-vindo ao ForkFit! 🍓</Text>
        <Text style={styles.subtitle}>
          Vamos começar configurando seu perfil para personalizar sua experiência.
        </Text>

        <View style={styles.formSection}>
          <Text style={styles.label}>
            {user?.name ? 'Atualizar seu nome' : 'Como devemos te chamar?'}
          </Text>
          <TextInput
            style={styles.input}
            value={name}
            onChangeText={setName}
            placeholder={user?.name ? "Seu nome atualizado" : "Seu nome"}
            placeholderTextColor="#A0AEC0"
            autoFocus
            autoCapitalize="words"
          />
        </View>

        <TouchableOpacity
          style={[styles.button, loading && styles.buttonDisabled]}
          onPress={handleCompleteOnboarding}
          disabled={loading}
        >
          <Text style={styles.buttonText}>
            {loading ? 'Salvando...' : 'Começar'}
          </Text>
        </TouchableOpacity>

        <Text style={styles.note}>
          Você poderá adicionar mais informações sobre seus objetivos e preferências depois.
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: OFF_WHITE,
    paddingTop: 60,
  },
  content: {
    flex: 1,
    paddingHorizontal: 24,
    paddingTop: 40,
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
  formSection: {
    marginBottom: 32,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: TEXT,
    marginBottom: 8,
  },
  input: {
    backgroundColor: '#fff',
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: BORDER,
    paddingHorizontal: 16,
    paddingVertical: 16,
    fontSize: 16,
    color: TEXT,
  },
  button: {
    backgroundColor: CORAL,
    borderRadius: 12,
    paddingVertical: 16,
    paddingHorizontal: 24,
    alignItems: 'center',
    marginBottom: 24,
  },
  buttonDisabled: {
    backgroundColor: '#ccc',
  },
  buttonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 18,
  },
  note: {
    fontSize: 14,
    color: '#64748b',
    textAlign: 'center',
    lineHeight: 20,
  },
}); 