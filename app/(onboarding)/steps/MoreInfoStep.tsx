import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useOnboarding } from '../OnboardingContext';
import { colors, spacing, typography, borderRadius } from '@/theme';

interface MoreInfoStepProps {
  onSetLoading: (loading: boolean) => void;
}

export default function MoreInfoStep({ onSetLoading }: MoreInfoStepProps) {
  const { updateStepData } = useOnboarding();
  const hasMarkedCompleted = useRef(false);

  // Mark this step as completed when component mounts (only once)
  useEffect(() => {
    if (!hasMarkedCompleted.current) {
      hasMarkedCompleted.current = true;
      updateStepData('moreInfo', { moreInfo: true });
      console.log('More info step completed');
    }
  }, []);

  return (
    <View style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.title}>Informações Adicionais</Text>
        
        <View style={styles.infoSection}>
          <Text style={styles.sectionTitle}>🔬 Baseado na Ciência</Text>
          <Text style={styles.infoText}>
            Nosso algoritmo utiliza pesquisas científicas comprovadas sobre metabolismo, 
            perda de peso e nutrição para criar planos eficazes e seguros.
          </Text>
        </View>

        <View style={styles.infoSection}>
          <Text style={styles.sectionTitle}>🔄 Adaptação Contínua</Text>
          <Text style={styles.infoText}>
            O plano se adapta automaticamente ao seu progresso, garantindo que você 
            continue perdendo peso de forma consistente e saudável.
          </Text>
        </View>

        <View style={styles.infoSection}>
          <Text style={styles.sectionTitle}>📊 Métricas Importantes</Text>
          <Text style={styles.infoText}>
            Além do peso, acompanhamos outras métricas como medidas corporais, 
            níveis de energia e qualidade do sono para uma visão completa da sua saúde.
          </Text>
        </View>

        <View style={styles.infoSection}>
          <Text style={styles.sectionTitle}>🎉 Celebração de Conquistas</Text>
          <Text style={styles.infoText}>
            Cada marco alcançado é celebrado, mantendo você motivado e focado 
            em seus objetivos de longo prazo.
          </Text>
        </View>

        <View style={styles.infoSection}>
          <Text style={styles.sectionTitle}>💡 Dicas Personalizadas</Text>
          <Text style={styles.infoText}>
            Receba dicas específicas para sua rotina, preferências alimentares e 
            estilo de vida, tornando sua jornada mais fácil e agradável.
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
    marginBottom: spacing.lg,
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
