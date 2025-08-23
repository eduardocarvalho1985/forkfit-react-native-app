import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useOnboarding } from '../OnboardingContext';
import { colors, spacing, typography, borderRadius } from '@/theme';

interface LossPlanInfoStepProps {
  onSetLoading: (loading: boolean) => void;
}

export default function LossPlanInfoStep({ onSetLoading }: LossPlanInfoStepProps) {
  const { updateStepData } = useOnboarding();
  const hasMarkedCompleted = useRef(false);

  // Mark this step as completed when component mounts (only once)
  useEffect(() => {
    if (!hasMarkedCompleted.current) {
      hasMarkedCompleted.current = true;
      updateStepData('lossPlanInfo', { lossPlanInfo: true });
      console.log('Loss plan info step completed');
    }
  }, []);

  return (
    <View style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.title}>Seu Plano de Perda de Peso</Text>
        
        <View style={styles.infoSection}>
          <Text style={styles.sectionTitle}>🎯 O Que Esperar</Text>
          <Text style={styles.infoText}>
            Com base nas suas informações, criamos um plano personalizado que inclui:
          </Text>
          <Text style={styles.bulletPoints}>
            • Calorias diárias recomendadas{'\n'}
            • Distribuição de macronutrientes{'\n'}
            • Cronograma de perda de peso{'\n'}
            • Dicas personalizadas para seu estilo de vida
          </Text>
        </View>

        <View style={styles.infoSection}>
          <Text style={styles.sectionTitle}>📱 Como Usar o App</Text>
          <Text style={styles.infoText}>
            • Tire fotos das suas refeições{'\n'}
            • Nossa IA analisa automaticamente{'\n'}
            • Acompanhe seu progresso diário{'\n'}
            • Ajuste o plano conforme necessário
          </Text>
        </View>

        <View style={styles.infoSection}>
          <Text style={styles.sectionTitle}>💪 Suporte Contínuo</Text>
          <Text style={styles.infoText}>
            • Lembretes personalizados{'\n'}
            • Dicas semanais baseadas no seu progresso{'\n'}
            • Ajustes automáticos do plano{'\n'}
            • Comunidade de usuários para motivação
          </Text>
        </View>

        <View style={styles.infoSection}>
          <Text style={styles.sectionTitle}>🌟 Próximos Passos</Text>
          <Text style={styles.infoText}>
            Após gerar seu plano, você terá acesso completo ao app com todas as 
            funcionalidades para alcançar seus objetivos de forma sustentável.
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
    paddingBottom: spacing.xxl,
  },
  title: {
    fontSize: typography['3xl'],
    fontWeight: typography.bold,
    color: colors.textPrimary,
    textAlign: 'center',
    marginBottom: spacing.xl,
  },
  infoSection: {
    marginBottom: spacing.xl,
    padding: spacing.lg,
    backgroundColor: colors.backgroundTertiary,
    borderRadius: borderRadius.lg,
  },
  sectionTitle: {
    fontSize: typography.lg,
    fontWeight: typography.bold,
    color: colors.textPrimary,
    marginBottom: spacing.md,
  },
  infoText: {
    fontSize: typography.base,
    color: colors.textSecondary,
    lineHeight: typography.base * 1.6,
    marginBottom: spacing.sm,
  },
  bulletPoints: {
    fontSize: typography.base,
    color: colors.textSecondary,
    lineHeight: typography.base * 1.6,
    marginLeft: spacing.sm,
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
