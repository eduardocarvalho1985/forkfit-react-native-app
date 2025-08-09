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
  onSetLoading: (loading: boolean) => void;
}

export default function NotificationsStep({ onSetLoading }: NotificationsStepProps) {
  const { user, syncUser } = useAuth();
  const { getCurrentStepData, clearOnboardingData, updateStepData } = useOnboarding();
  const [notificationsEnabled, setNotificationsEnabled] = useState(false);

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

  // Update notifications preference in context
  useEffect(() => {
    updateStepData('notifications', { notificationsEnabled });
    console.log('Notifications preference updated:', notificationsEnabled);
  }, [notificationsEnabled]);

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
    paddingBottom: 120, // Extra padding for fixed footer
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

  note: {
    fontSize: 14,
    color: '#64748b',
    textAlign: 'center',
    lineHeight: 20,
  },
}); 