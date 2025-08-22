import React, { useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { useOnboarding } from '../OnboardingContext';

const CORAL = '#FF725E';
const OFF_WHITE = '#FDF6F3';
const TEXT = '#1F2937';

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
    backgroundColor: OFF_WHITE,
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
    paddingHorizontal: 20,
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    marginBottom: 40,
  },
  statCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    flex: 1,
    marginHorizontal: 4,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  statNumber: {
    fontSize: 20,
    fontWeight: 'bold',
    color: CORAL,
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    color: '#64748b',
    textAlign: 'center',
  },
  testimonialsContainer: {
    width: '100%',
    marginBottom: 30,
  },
  testimonialsTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: TEXT,
    textAlign: 'center',
    marginBottom: 20,
  },
  testimonialCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
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
    fontSize: 16,
    fontWeight: '600',
    color: TEXT,
    marginBottom: 2,
  },
  testimonialResult: {
    fontSize: 14,
    color: CORAL,
    fontWeight: '500',
  },
  testimonialText: {
    fontSize: 14,
    color: '#64748b',
    lineHeight: 20,
    fontStyle: 'italic',
  },
  motivationContainer: {
    backgroundColor: '#f0f9ff',
    borderRadius: 16,
    padding: 24,
    marginBottom: 30,
    borderWidth: 1,
    borderColor: '#0ea5e9',
    alignItems: 'center',
  },
  motivationTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#0c4a6e',
    marginBottom: 12,
    textAlign: 'center',
  },
  motivationText: {
    fontSize: 14,
    color: '#0c4a6e',
    textAlign: 'center',
    lineHeight: 20,
  },
  infoContainer: {
    width: '100%',
    alignItems: 'center',
  },
  infoText: {
    color: '#64748b',
    fontSize: 14,
    textAlign: 'center',
    lineHeight: 20,
  },
});
