import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import { useAuth } from '../../../contexts/AuthContext';
import { api } from '../../../services/api';
import { getAuth } from '@react-native-firebase/auth';
import { useOnboarding } from '../OnboardingContext';

// Helper function to calculate age from birth date
const calculateAge = (birthDate: string): number => {
  const today = new Date();
  
  // Parse YYYY-MM-DD format directly to avoid timezone issues
  const [year, month, day] = birthDate.split('-').map(Number);
  if (!year || !month || !day) return 0;
  
  const birth = new Date(year, month - 1, day); // month is 0-indexed
  let age = today.getFullYear() - birth.getFullYear();
  const monthDiff = today.getMonth() - birth.getMonth();
  
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
    age--;
  }
  
  return age;
};

const CORAL = '#FF725E';
const OFF_WHITE = '#FDF6F3';
const BORDER = '#FFA28F';
const TEXT = '#1F2937';

interface NotificationsStepProps {
  onComplete: () => void;
}

export default function NotificationsStep({ onComplete }: NotificationsStepProps) {
  const { user, syncUser } = useAuth();
  const { getCurrentStepData, clearOnboardingData } = useOnboarding();
  const [notificationsEnabled, setNotificationsEnabled] = useState(false);
  const [loading, setLoading] = useState(false);

  const requestNotifications = async () => {
    try {
      // For now, we'll simulate notification permission request
      // In a real implementation, you would use expo-notifications or react-native-push-notification
      console.log('Requesting notification permissions...');
      
      // Simulate permission request
      setNotificationsEnabled(true);
      
      // In real implementation, you would check the actual permission status
      // const { status } = await Notifications.requestPermissionsAsync();
      // setNotificationsEnabled(status === 'granted');
      
    } catch (error) {
      console.error('Error requesting notifications:', error);
      setNotificationsEnabled(false);
    }
  };

  const handleComplete = async () => {
    if (!user) {
      Alert.alert('Erro', 'Usuário não encontrado. Tente fazer login novamente.');
      return;
    }

    setLoading(true);
    try {
      // Get all onboarding data from context
      const completeOnboardingData = getCurrentStepData();
      console.log('Complete onboarding data to save:', completeOnboardingData);

      // Calculate age from birth date
      const calculatedAge = completeOnboardingData.birthDate ? calculateAge(completeOnboardingData.birthDate) : 0;
      console.log('Calculated age from birth date:', completeOnboardingData.birthDate, '=', calculatedAge);

      // Get authentication token
      const token = await getAuth().currentUser?.getIdToken();
      if (!token) {
        throw new Error('No authentication token available');
      }

      // Direct API call with all onboarding data including calculated age
      const userProfileData = {
        ...completeOnboardingData,
        age: calculatedAge, // Add calculated age
        notificationsEnabled,
        onboardingCompleted: true
      };
      
      console.log('Saving complete user profile:', userProfileData);
      console.log('User UID:', user.uid);
      
      await api.updateUserProfile(user.uid, userProfileData, token);
      console.log('User profile updated successfully with all onboarding data');

      // Sync updated user data to AuthContext
      await syncUser();
      console.log('User data synced after onboarding completion');

      // Clear onboarding context data
      clearOnboardingData();
      
      // Call the onComplete callback to finish onboarding
      onComplete();
      
    } catch (error: any) {
      console.error('Error completing onboarding:', error);
      
      // Simple, clear error message for MVP
      Alert.alert(
        'Erro de Conexão', 
        'Parece que você está sem conexão. Verifique sua internet e tente novamente.'
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.content}>
        <View style={styles.iconContainer}>
          <Text style={styles.icon}>🔔</Text>
        </View>
        
        <Text style={styles.title}>Receba lembretes e alcance seus objetivos</Text>
        <Text style={styles.subtitle}>
          Para te ajudar a manter o foco, podemos enviar lembretes para registrar suas refeições.
        </Text>

        <View style={styles.benefitsContainer}>
          <View style={styles.benefitItem}>
            <Text style={styles.benefitIcon}>✅</Text>
            <Text style={styles.benefitText}>Lembretes para registrar refeições</Text>
          </View>
          <View style={styles.benefitItem}>
            <Text style={styles.benefitIcon}>✅</Text>
            <Text style={styles.benefitText}>Dicas personalizadas diárias</Text>
          </View>
          <View style={styles.benefitItem}>
            <Text style={styles.benefitIcon}>✅</Text>
            <Text style={styles.benefitText}>Acompanhamento do seu progresso</Text>
          </View>
        </View>

        <TouchableOpacity
          style={[styles.notificationButton, notificationsEnabled && styles.notificationButtonEnabled]}
          onPress={requestNotifications}
          disabled={notificationsEnabled}
        >
          <Text style={styles.notificationButtonText}>
            {notificationsEnabled ? 'Notificações Ativadas' : 'Ativar Notificações'}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.button, loading && styles.buttonDisabled]}
          onPress={handleComplete}
          disabled={loading}
        >
          <Text style={styles.buttonText}>
            {loading ? 'Finalizando...' : 'Continuar'}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.skipButton}
          onPress={handleComplete}
          disabled={loading}
        >
          <Text style={styles.skipButtonText}>
            Pular por enquanto
          </Text>
        </TouchableOpacity>

        <Text style={styles.note}>
          Você pode alterar as configurações de notificação a qualquer momento nos Ajustes.
        </Text>
      </View>
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
  },
  iconContainer: {
    alignItems: 'center',
    marginBottom: 24,
  },
  icon: {
    fontSize: 64,
    marginBottom: 16,
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
    marginBottom: 32,
  },
  benefitsContainer: {
    marginBottom: 32,
  },
  benefitItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
    backgroundColor: '#fff',
    borderRadius: 12,
    paddingVertical: 16,
    paddingHorizontal: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  benefitIcon: {
    fontSize: 20,
    marginRight: 12,
  },
  benefitText: {
    fontSize: 16,
    color: TEXT,
    flex: 1,
  },
  notificationButton: {
    backgroundColor: '#fff',
    borderRadius: 16,
    borderWidth: 2,
    borderColor: CORAL,
    paddingVertical: 20,
    paddingHorizontal: 24,
    alignItems: 'center',
    marginBottom: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  notificationButtonEnabled: {
    backgroundColor: CORAL,
    borderColor: CORAL,
  },
  notificationButtonText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: CORAL,
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
  skipButton: {
    paddingVertical: 12,
    paddingHorizontal: 24,
    alignItems: 'center',
    marginBottom: 24,
  },
  skipButtonText: {
    color: '#64748b',
    fontSize: 16,
    textDecorationLine: 'underline',
  },
  note: {
    fontSize: 14,
    color: '#64748b',
    textAlign: 'center',
    lineHeight: 20,
  },
}); 