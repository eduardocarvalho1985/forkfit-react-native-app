import React, { useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { useOnboarding } from '../OnboardingContext';
import { colors, spacing, typography, borderRadius, shadows } from '@/theme';

interface SocialProofStepProps {
  onSetLoading: (loading: boolean) => void;
}

const TESTIMONIALS = [
  {
    name: 'Maria S.',
    result: 'Perdeu 15kg em 6 meses',
    text: 'O ForkFit mudou minha vida! Agora me sinto mais confiante e saudável do que nunca.',
    avatar: '👩‍🦰'
  },
  {
    name: 'João P.',
    result: 'Ganhou 8kg de massa muscular',
    text: 'Sempre quis ser mais forte, e com o ForkFit consegui de forma sustentável e saudável.',
    avatar: '👨‍🦱'
  },
  {
    name: 'Ana L.',
    result: 'Manteve o peso ideal',
    text: 'O app me ajudou a entender melhor minha alimentação e manter um estilo de vida saudável.',
    avatar: '👩‍🦳'
  }
];

export default function SocialProofStep({ onSetLoading }: SocialProofStepProps) {
  const { updateStepData } = useOnboarding();

  // Auto-save this step as completed since it's just informational
  useEffect(() => {
    updateStepData('socialProof', { socialProofViewed: true });
  }, []);

  return (
    <View style={styles.container}>
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        <View style={styles.content}>
          <Text style={styles.title}>Histórias de Sucesso</Text>
          <Text style={styles.subtitle}>
            Veja como outras pessoas transformaram suas vidas com o ForkFit
          </Text>

          <View style={styles.statsContainer}>
            <View style={styles.statCard}>
              <Text style={styles.statNumber}>50,000+</Text>
              <Text style={styles.statLabel}>Usuários Ativos</Text>
            </View>
            <View style={styles.statCard}>
              <Text style={styles.statNumber}>95%</Text>
              <Text style={styles.statLabel}>Taxa de Sucesso</Text>
            </View>
            <View style={styles.statCard}>
              <Text style={styles.statNumber}>4.8★</Text>
              <Text style={styles.statLabel}>Avaliação Média</Text>
            </View>
          </View>

          <View style={styles.testimonialsContainer}>
            <Text style={styles.testimonialsTitle}>Depoimentos Reais</Text>
            
            {TESTIMONIALS.map((testimonial, index) => (
              <View key={index} style={styles.testimonialCard}>
                <View style={styles.testimonialHeader}>
                  <Text style={styles.avatar}>{testimonial.avatar}</Text>
                  <View style={styles.testimonialInfo}>
                    <Text style={styles.testimonialName}>{testimonial.name}</Text>
                    <Text style={styles.testimonialResult}>{testimonial.result}</Text>
                  </View>
                </View>
                <Text style={styles.testimonialText}>{testimonial.text}</Text>
              </View>
            ))}
          </View>

          <View style={styles.motivationContainer}>
            <Text style={styles.motivationTitle}>🎯 Você é o próximo!</Text>
            <Text style={styles.motivationText}>
              Com dedicação e o suporte do ForkFit, você também pode alcançar seus objetivos de saúde e fitness.
            </Text>
          </View>

          {/* Navigation is handled by the parent component's footer */}
          <View style={styles.infoContainer}>
            <Text style={styles.infoText}>
              Use o botão "Continuar" na parte inferior da tela para prosseguir
            </Text>
          </View>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  scrollView: {
    flex: 1,
  },
  content: {
    paddingHorizontal: 24,
    paddingTop: 40,
    paddingBottom: 120,
    alignItems: 'center',
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
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    marginBottom: 40,
  },
  statCard: {
    backgroundColor: colors.backgroundTertiary,
    borderRadius: borderRadius.lg,
    padding: spacing.md,
    alignItems: 'center',
    flex: 1,
    marginHorizontal: spacing.xs,
    ...shadows.sm,
  },
  statNumber: {
    fontSize: typography.xl,
    fontWeight: typography.bold,
    color: colors.primary,
    marginBottom: spacing.xs,
  },
  statLabel: {
    fontSize: typography.sm,
    color: colors.textSecondary,
    textAlign: 'center',
  },
  testimonialsContainer: {
    width: '100%',
    marginBottom: 30,
  },
  testimonialsTitle: {
    fontSize: typography.xl,
    fontWeight: typography.bold,
    color: colors.textPrimary,
    textAlign: 'center',
    marginBottom: spacing.lg,
  },
  testimonialCard: {
    backgroundColor: colors.backgroundTertiary,
    borderRadius: borderRadius.xl,
    padding: spacing.lg,
    marginBottom: spacing.md,
    ...shadows.md,
  },
  testimonialHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  avatar: {
    fontSize: 32,
    marginRight: 12,
  },
  testimonialInfo: {
    flex: 1,
  },
  testimonialName: {
    fontSize: typography.base,
    fontWeight: typography.semibold,
    color: colors.textPrimary,
    marginBottom: spacing.xs,
  },
  testimonialResult: {
    fontSize: typography.sm,
    color: colors.primary,
    fontWeight: typography.medium,
  },
  testimonialText: {
    fontSize: typography.sm,
    color: colors.textSecondary,
    lineHeight: typography.sm * 1.4,
    fontStyle: 'italic',
  },
  motivationContainer: {
    backgroundColor: colors.primary,
    borderRadius: borderRadius.xl,
    padding: spacing.lg,
    marginBottom: spacing.xxl,
    alignItems: 'center',
  },
  motivationTitle: {
    fontSize: typography.lg,
    fontWeight: typography.bold,
    color: colors.background,
    marginBottom: spacing.sm,
    textAlign: 'center',
  },
  motivationText: {
    fontSize: typography.sm,
    color: colors.background,
    textAlign: 'center',
    lineHeight: typography.sm * 1.4,
  },
  infoContainer: {
    width: '100%',
    alignItems: 'center',
  },
  infoText: {
    color: colors.textSecondary,
    fontSize: typography.sm,
    textAlign: 'center',
    lineHeight: typography.sm * 1.4,
  },
});
