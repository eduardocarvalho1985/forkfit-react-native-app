import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert, ActivityIndicator, Platform, ScrollView } from 'react-native';
import { useAuth } from '../../../contexts/AuthContext';
import { api } from '../../../services/api';
import { getAuth } from '@react-native-firebase/auth';
import { useOnboarding } from '../OnboardingContext';
// Temporarily disabled to isolate runtime issues
// import { 
//   registerForPushNotificationsAsync, 
//   getNotificationPermissionStatus,
//   openAppSettings 
// } from '../../../services/notificationService';

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
  const { user } = useAuth();
  const { updateStepData } = useOnboarding();
  const [notificationsEnabled, setNotificationsEnabled] = useState(false);
  const [isRequesting, setIsRequesting] = useState(false);
  const [permissionStatus, setPermissionStatus] = useState<'undetermined' | 'granted' | 'denied' | 'blocked'>('undetermined');

  // Check current permission status on mount
  useEffect(() => {
    checkPermissionStatus();
  }, []);

  const checkPermissionStatus = async () => {
    try {
      // const status = await getNotificationPermissionStatus(); // Temporarily commented out
      // setPermissionStatus(status.status);
      // setNotificationsEnabled(status.granted);

      // Update context with current status
      updateStepData('notifications', { notificationsEnabled: false }); // Default to false if service is down
    } catch (error) {
      console.error('Error checking permission status:', error);
    }
  };

  const requestNotifications = async () => {
    if (isRequesting) return;

    setIsRequesting(true);
    onSetLoading(true);

    try {
      console.log('Requesting notification permissions...');

      // const result = await registerForPushNotificationsAsync(); // Temporarily commented out

      // if (result.token && result.permissionStatus.granted) {
      //   setNotificationsEnabled(true);
      //   setPermissionStatus('granted');

      //   // Save push token to backend
      //   if (user) {
      //     try {
      //       const authToken = await getAuth().currentUser?.getIdToken();
      //       if (authToken) {
      //         await api.savePushToken(user.uid, result.token, authToken);
      //         console.log('Push token saved to backend successfully');
      //       }
      //     } catch (error) {
      //       console.error('Failed to save push token to backend:', error);
      //       // Don't block the user, just log the error
      //     }
      //   }

      //   // Update context
      //   updateStepData('notifications', { 
      //     notificationsEnabled: true,
      //     pushToken: result.token 
      //   });

      //   Alert.alert(
      //     'Notificações Ativadas!',
      //     'Agora você receberá lembretes importantes para manter seus objetivos.',
      //     [{ text: 'Ótimo!', style: 'default' }]
      //   );
      // } else {
      setNotificationsEnabled(false);
      setPermissionStatus('denied'); // Default to denied if service is down

      if (Platform.OS === 'ios') {
        Alert.alert(
          'Permissão Negada',
          'Para receber lembretes importantes, você precisa permitir notificações. Você pode ativá-las nas configurações do app.',
          [
            { text: 'Cancelar', style: 'cancel' },
            {
              text: 'Configurações', onPress: () => {
                // This function is not available in the current environment,
                // so we'll just show a message.
                Alert.alert('Configurações', 'Não foi possível abrir as configurações do app.');
              }
            }
          ]
        );
      } else {
        Alert.alert(
          'Permissão Negada',
          'Para receber lembretes importantes, você precisa permitir notificações. Você pode ativá-las nas configurações do app.',
          [
            { text: 'Cancelar', style: 'cancel' },
            {
              text: 'Configurações', onPress: () => {
                // This function is not available in the current environment,
                // so we'll just show a message.
                Alert.alert('Configurações', 'Não foi possível abrir as configurações do app.');
              }
            }
          ]
        );
      }
      // }
    } catch (error) {
      console.error('Error requesting notifications:', error);
      setNotificationsEnabled(false);
      Alert.alert(
        'Erro',
        'Não foi possível ativar as notificações. Tente novamente mais tarde.',
        [{ text: 'OK', style: 'default' }]
      );
    } finally {
      setIsRequesting(false);
      onSetLoading(false);
    }
  };

  // Update notifications preference in context
  useEffect(() => {
    updateStepData('notifications', { notificationsEnabled });
    console.log('Notifications preference updated:', notificationsEnabled);
  }, [notificationsEnabled]);

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
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
          style={[
            styles.notificationButton,
            notificationsEnabled && styles.notificationButtonEnabled,
            isRequesting && styles.notificationButtonDisabled
          ]}
          onPress={requestNotifications}
          disabled={notificationsEnabled || isRequesting}
        >
          {isRequesting ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="small" color={notificationsEnabled ? '#fff' : CORAL} />
              <Text style={[styles.notificationButtonText, { marginLeft: 8 }]}>
                Ativando...
              </Text>
            </View>
          ) : (
            <Text style={styles.notificationButtonText}>
              {notificationsEnabled ? 'Notificações Ativadas' : 'Ativar Notificações'}
            </Text>
          )}
        </TouchableOpacity>

        {permissionStatus === 'blocked' && (
          <TouchableOpacity
            style={styles.settingsButton}
            onPress={() => {
              Alert.alert('Configurações', 'Não foi possível abrir as configurações do app.');
            }}
          >
            <Text style={styles.settingsButtonText}>Ir para Configurações</Text>
          </TouchableOpacity>
        )}

        <Text style={styles.note}>
          Você pode alterar as configurações de notificação a qualquer momento nos Ajustes.
        </Text>
      </View>
    </ScrollView>
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

  notificationButtonDisabled: {
    opacity: 0.6,
  },

  loadingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },

  settingsButton: {
    backgroundColor: 'transparent',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#64748b',
    paddingVertical: 12,
    paddingHorizontal: 20,
    alignItems: 'center',
    marginTop: 16,
  },

  settingsButtonText: {
    fontSize: 16,
    color: '#64748b',
    fontWeight: '600',
  },

  note: {
    fontSize: 14,
    color: '#64748b',
    textAlign: 'center',
    lineHeight: 20,
  },
}); 