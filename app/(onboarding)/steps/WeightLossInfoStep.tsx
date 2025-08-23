import React, { useEffect } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useOnboarding } from '../OnboardingContext';
import { colors, spacing, typography, borderRadius } from '@/theme';

interface WeightLossInfoStepProps {
  onSetLoading: (loading: boolean) => void;
}

export default function WeightLossInfoStep({ onSetLoading }: WeightLossInfoStepProps) {
  const { updateStepData } = useOnboarding();

  // Mark this step as completed when component mounts
  useEffect(() => {
    updateStepData('weightLossInfo', { weightLossCurveInfo: true });
    console.log('Weight loss info step completed');
  }, []);

  return (
    <View style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.title}>Entenda a Curva de Perda de Peso</Text>
        
        <View style={styles.infoSection}>
          <Text style={styles.sectionTitle}>📊 Como Funciona a Perda de Peso</Text>
          <Text style={styles.infoText}>
            A perda de peso não é linear. Você pode perder mais peso no início e depois estabilizar. 
            Isso é normal e saudável!
          </Text>
        </View>

        <View style={styles.infoSection}>
          <Text style={styles.sectionTitle}>🎯 Expectativas Realistas</Text>
          <Text style={styles.infoText}>
            • Primeiras semanas: 1-2kg por semana{'\n'}
            • Meses seguintes: 0.5-1kg por semana{'\n'}
            • Estabilização: 0.2-0.5kg por semana
          </Text>
        </View>

        <View style={styles.infoSection}>
          <Text style={styles.sectionTitle}>💡 Dicas Importantes</Text>
          <Text style={styles.infoText}>
            • Foque na consistência, não na velocidade{'\n'}
            • Pequenas mudanças levam a grandes resultados{'\n'}
            • O peso pode variar diariamente (água, hormônios)
          </Text>
        </View>

        <View style={styles.infoSection}>
          <Text style={styles.sectionTitle}>🌟 Sua Jornada</Text>
          <Text style={styles.infoText}>
            Cada pessoa é única. Seu plano será personalizado para maximizar 
            seus resultados de forma segura e sustentável.
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
