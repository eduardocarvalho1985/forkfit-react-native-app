import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Switch } from 'react-native';
import { useOnboarding } from '../OnboardingContext';
import { colors, spacing, typography, borderRadius, shadows } from '@/theme';

interface NotificationsStepProps {
  onSetLoading: (loading: boolean) => void;
}

export default function NotificationsStep({ onSetLoading }: NotificationsStepProps) {
  const { getStepData, updateStepData } = useOnboarding();
  const [notificationsEnabled, setNotificationsEnabled] = useState(getStepData('notificationsEnabled') || false);

  // Load existing data when component mounts
  useEffect(() => {
    const existingNotifications = getStepData('notificationsEnabled');
    if (existingNotifications !== undefined) {
      setNotificationsEnabled(existingNotifications);
    }
  }, []);

  // Update notifications preference in context whenever it changes
  useEffect(() => {
    updateStepData('notifications', { notificationsEnabled });
    console.log('Notifications preference updated in context:', notificationsEnabled);
  }, [notificationsEnabled]);

  const toggleNotifications = () => {
    setNotificationsEnabled(prev => !prev);
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
              onValueChange={toggleNotifications}
              trackColor={{ false: colors.border, true: colors.primaryLight }}
              thumbColor={notificationsEnabled ? colors.primary : colors.textTertiary}
            />
          </View>

          <View style={styles.benefitsContainer}>
            <Text style={styles.benefitsTitle}>Benefícios das Notificações:</Text>
            <View style={styles.benefitItem}>
              <Text style={styles.benefitEmoji}>⏰</Text>
              <Text style={styles.benefitText}>Lembretes no momento certo</Text>
            </View>
            <View style={styles.benefitItem}>
              <Text style={styles.benefitEmoji}>📱</Text>
              <Text style={styles.benefitText}>Acompanhamento consistente</Text>
            </View>
            <View style={styles.benefitItem}>
              <Text style={styles.benefitEmoji}>🎯</Text>
              <Text style={styles.benefitText}>Foco nos seus objetivos</Text>
            </View>
            <View style={styles.benefitItem}>
              <Text style={styles.benefitEmoji}>💪</Text>
              <Text style={styles.benefitText}>Motivação contínua</Text>
            </View>
          </View>

          <Text style={styles.privacyNote}>
            Você pode alterar essa configuração a qualquer momento nas configurações do app.
          </Text>
        </View>

        <Text style={styles.disclaimer}>
          * Suas informações serão excluídas após gerar o plano.
        </Text>
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
  benefitEmoji: {
    fontSize: typography.lg,
    marginRight: spacing.sm,
    width: 24,
  },
  benefitText: {
    fontSize: typography.base,
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
  disclaimer: {
    fontSize: typography.sm,
    color: colors.textTertiary,
    textAlign: 'center',
    lineHeight: typography.sm * 1.4,
    position: 'absolute',
    bottom: spacing.xxl,
  },
});
