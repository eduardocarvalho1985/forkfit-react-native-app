import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Switch, Alert, Linking } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useOnboarding } from '../OnboardingContext';
import { colors, spacing, typography, borderRadius, shadows } from '@/theme';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  getNotificationPermissionStatus,
  requestNotificationPermissions,
  clearNotificationData
} from '../../../services/notificationService';

interface NotificationsStepProps {
  onSetLoading: (loading: boolean) => void;
}

export default function NotificationsStep({ onSetLoading }: NotificationsStepProps) {
  const { getStepData, updateStepData } = useOnboarding();
  const [notificationsEnabled, setNotificationsEnabled] = useState(false);
  const [permissionStatus, setPermissionStatus] = useState<'undetermined' | 'granted' | 'denied' | 'blocked'>('undetermined');

  // Check notification permission status on mount
  useEffect(() => {
    checkNotificationStatus();
  }, []);

  // Update notifications preference in context whenever it changes
  useEffect(() => {
    updateStepData('notifications', { notificationsEnabled });
    console.log('Notifications preference updated in context:', notificationsEnabled);
  }, [notificationsEnabled]);

  const checkNotificationStatus = async () => {
    try {
      const status = await getNotificationPermissionStatus();
      setPermissionStatus(status.status);
      setNotificationsEnabled(status.granted);
    } catch (error) {
      console.error('Error checking notification status:', error);
    }
  };

  const handleNotificationToggle = async (enabled: boolean) => {
    if (enabled) {
      // Always try to request permissions when turning ON
      try {
        const status = await requestNotificationPermissions();
        if (status.granted) {
          setNotificationsEnabled(true);
          setPermissionStatus('granted');
          
          // Clear any existing notifications to prevent immediate triggers
          await clearNotificationData();
          
          // Store preference for later scheduling (after onboarding completion)
          await AsyncStorage.setItem('forkfit_notification_preferences', JSON.stringify({
            dailyReminders: true,
            weeklyReports: true,
            updatedAt: Date.now(),
          }));
          
          Alert.alert(
            'Notificações Ativadas!',
            'Agora você receberá lembretes e atualizações importantes.',
            [{ text: 'Ótimo!' }]
          );
        } else if (status.status === 'denied') {
          Alert.alert(
            'Permissões Negadas',
            'Para receber notificações, você precisa permitir o acesso nas configurações do dispositivo.',
            [
              { text: 'Cancelar', style: 'cancel' },
              { text: 'Configurações', onPress: () => Linking.openSettings() }
            ]
          );
        } else if (status.status === 'blocked') {
          Alert.alert(
            'Permissões Bloqueadas',
            'Para ativar notificações, você precisa permitir o acesso nas configurações do dispositivo.',
            [
              { text: 'Cancelar', style: 'cancel' },
              { text: 'Configurações', onPress: () => Linking.openSettings() }
            ]
          );
        }
        // Update the permission status in the UI
        setPermissionStatus(status.status);
      } catch (error) {
        console.error('Error requesting notification permissions:', error);
        Alert.alert(
          'Erro',
          'Não foi possível solicitar permissões de notificação. Tente novamente.',
          [{ text: 'OK' }]
        );
      }
    } else {
      setNotificationsEnabled(false);
      // Clear notification data when disabling
      await clearNotificationData();
      
      // Store preference when disabling
      await AsyncStorage.setItem('forkfit_notification_preferences', JSON.stringify({
        dailyReminders: false,
        weeklyReports: false,
        updatedAt: Date.now(),
      }));
      
      // Reset permission status to undetermined so user can request again
      setPermissionStatus('undetermined');
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.title}>Permitir Notificações?</Text>
        <Text style={styles.subtitle}>
          Receba lembretes personalizados para manter-se no caminho certo.
        </Text>

        <View style={styles.notificationContainer}>
          <View style={styles.notificationOption}>
            <View style={styles.notificationInfo}>
              <Text style={styles.notificationLabel}>Lembretes de Refeições</Text>
              <Text style={styles.notificationDescription}>
                Lembretes para registrar suas refeições e manter o controle
              </Text>
            </View>
            <Switch
              value={notificationsEnabled}
              onValueChange={handleNotificationToggle}
              trackColor={{ false: colors.border, true: colors.primaryLight }}
              thumbColor={notificationsEnabled ? colors.primary : colors.textTertiary}
            />
          </View>

          <View style={styles.benefitsContainer}>
            <Text style={styles.benefitsTitle}>Benefícios das Notificações:</Text>
            <View style={styles.benefitItem}>
              <Ionicons name="time-outline" size={24} color={colors.primary} style={styles.benefitIcon} />
              <Text style={styles.benefitText}>Lembretes no momento certo</Text>
            </View>
            <View style={styles.benefitItem}>
              <Ionicons name="phone-portrait-outline" size={24} color={colors.primary} style={styles.benefitIcon} />
              <Text style={styles.benefitText}>Acompanhamento consistente</Text>
            </View>
            <View style={styles.benefitItem}>
              <Ionicons name="flag-outline" size={24} color={colors.primary} style={styles.benefitIcon} />
              <Text style={styles.benefitText}>Foco nos seus objetivos</Text>
            </View>
            <View style={styles.benefitItem}>
              <Ionicons name="fitness-outline" size={24} color={colors.primary} style={styles.benefitIcon} />
              <Text style={styles.benefitText}>Motivação contínua</Text>
            </View>
          </View>

          <Text style={styles.privacyNote}>
            Você pode alterar essa configuração a qualquer momento nas configurações do app.
          </Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  content: {
    flex: 1,
    paddingHorizontal: spacing.screenPadding,
    paddingTop: spacing.xxl,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    fontSize: typography['3xl'],
    fontWeight: typography.bold,
    color: colors.textPrimary,
    textAlign: 'center',
    marginBottom: spacing.md,
  },
  subtitle: {
    fontSize: typography.base,
    color: colors.textSecondary,
    textAlign: 'center',
    lineHeight: typography.base * 1.5,
    marginBottom: spacing.xxl,
    paddingHorizontal: spacing.md,
  },
  notificationContainer: {
    width: '100%',
    marginBottom: spacing.xxl,
  },
  notificationOption: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: colors.backgroundTertiary,
    borderRadius: borderRadius.lg,
    padding: spacing.lg,
    marginBottom: spacing.lg,
    ...shadows.sm,
  },
  notificationInfo: {
    flex: 1,
    marginRight: spacing.md,
  },
  notificationLabel: {
    fontSize: typography.lg,
    fontWeight: typography.semibold,
    color: colors.textPrimary,
    marginBottom: spacing.xs,
  },
  notificationDescription: {
    fontSize: typography.sm,
    color: colors.textSecondary,
    lineHeight: typography.sm * 1.4,
  },
  benefitsContainer: {
    backgroundColor: colors.backgroundTertiary,
    borderRadius: borderRadius.lg,
    padding: spacing.lg,
    marginBottom: spacing.lg,
  },
  benefitsTitle: {
    fontSize: typography.lg,
    fontWeight: typography.bold,
    color: colors.textPrimary,
    marginBottom: spacing.md,
    textAlign: 'center',
  },
  benefitItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  benefitIcon: {
    marginRight: spacing.md,
    width: 28,
  },
  benefitText: {
    fontSize: typography.lg,
    color: colors.textSecondary,
    flex: 1,
  },
  privacyNote: {
    fontSize: typography.sm,
    color: colors.textTertiary,
    textAlign: 'center',
    lineHeight: typography.sm * 1.4,
    fontStyle: 'italic',
  },
});
