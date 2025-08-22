import React, { useEffect } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useOnboarding } from '../OnboardingContext';

const CORAL = '#FF725E';
const OFF_WHITE = '#FDF6F3';
const TEXT = '#1F2937';

interface ProjectionStepProps {
  onSetLoading: (loading: boolean) => void;
}

export default function ProjectionStep({ onSetLoading }: ProjectionStepProps) {
  const { updateStepData, onboardingData } = useOnboarding();

  // Auto-save this step as completed since it's just informational
  useEffect(() => {
    updateStepData('projection', { projectionViewed: true });
  }, []);

  // Calculate projection data
  const getProjectionData = () => {
    if (!onboardingData.weight || !onboardingData.targetWeight) {
      return null;
    }

    const currentWeight = onboardingData.weight;
    const targetWeight = onboardingData.targetWeight;
    const weightDiff = Math.abs(targetWeight - currentWeight);
    
    // If we have weeklyPacing, use it; otherwise calculate a reasonable estimate
    let weeklyPacing = onboardingData.weeklyPacing;
    let weeksToGoal = 0;
    
    if (weeklyPacing) {
      weeksToGoal = Math.ceil(weightDiff / weeklyPacing);
    } else {
      // Calculate reasonable pacing based on weight difference
      if (weightDiff <= 5) {
        weeklyPacing = 0.25; // Slow and steady for small changes
      } else if (weightDiff <= 15) {
        weeklyPacing = 0.5; // Moderate pace for medium changes
      } else {
        weeklyPacing = 0.75; // Faster pace for larger changes
      }
      weeksToGoal = Math.ceil(weightDiff / weeklyPacing);
    }

    return {
      currentWeight,
      targetWeight,
      weeklyPacing,
      weeksToGoal,
      isWeightLoss: targetWeight < currentWeight,
      isEstimated: !onboardingData.weeklyPacing
    };
  };

  const projectionData = getProjectionData();

  return (
    <View style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.title}>Sua Projeção de Sucesso</Text>
        <Text style={styles.subtitle}>
          Veja como será sua jornada de transformação
        </Text>

        {projectionData ? (
          <View style={styles.projectionContainer}>
            <View style={styles.projectionCard}>
              <Text style={styles.projectionTitle}>Resumo da Jornada</Text>
              
              <View style={styles.projectionRow}>
                <Text style={styles.projectionLabel}>Peso Atual:</Text>
                <Text style={styles.projectionValue}>{projectionData.currentWeight} kg</Text>
              </View>
              
              <View style={styles.projectionRow}>
                <Text style={styles.projectionLabel}>Peso Alvo:</Text>
                <Text style={styles.projectionValue}>{projectionData.targetWeight} kg</Text>
              </View>
              
              <View style={styles.projectionRow}>
                <Text style={styles.projectionLabel}>Ritmo Semanal:</Text>
                <Text style={styles.projectionValue}>
                  {projectionData.weeklyPacing} kg
                  {projectionData.isEstimated && <Text style={styles.estimatedText}> (estimado)</Text>}
                </Text>
              </View>
              
              <View style={styles.projectionRow}>
                <Text style={styles.projectionLabel}>Tempo Estimado:</Text>
                <Text style={styles.projectionValue}>{projectionData.weeksToGoal} semanas</Text>
              </View>

              <View style={styles.motivationContainer}>
                <Text style={styles.motivationText}>
                  {projectionData.isWeightLoss 
                    ? `Você perderá ${Math.abs(projectionData.targetWeight - projectionData.currentWeight)} kg de forma saudável e sustentável!`
                    : `Você ganhará ${Math.abs(projectionData.targetWeight - projectionData.currentWeight)} kg de massa muscular de forma consistente!`
                  }
                  {projectionData.isEstimated && (
                    <Text style={styles.estimatedText}>
                      {'\n'}O ritmo foi estimado automaticamente para você.
                    </Text>
                  )}
                </Text>
              </View>
            </View>

            <View style={styles.graphPlaceholder}>
              <Text style={styles.graphTitle}>📊 Gráfico de Projeção</Text>
              <Text style={styles.graphSubtitle}>
                Aqui você verá uma visualização da sua jornada
              </Text>
              <View style={styles.graphVisual}>
                <View style={styles.graphBar} />
                <View style={styles.graphBar} />
                <View style={styles.graphBar} />
                <View style={styles.graphBar} />
                <View style={styles.graphBar} />
              </View>
            </View>
          </View>
        ) : (
          <View style={styles.noDataContainer}>
            <Text style={styles.noDataText}>
              Complete os passos anteriores para ver sua projeção personalizada
            </Text>
          </View>
        )}

        {/* Navigation is handled by the parent component's footer */}
        <View style={styles.infoContainer}>
          <Text style={styles.infoText}>
            Use o botão "Continuar" na parte inferior da tela para prosseguir
          </Text>
        </View>
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
    paddingBottom: 120,
    justifyContent: 'center',
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
  projectionContainer: {
    width: '100%',
    marginBottom: 30,
  },
  projectionCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 24,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  projectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: TEXT,
    textAlign: 'center',
    marginBottom: 20,
  },
  projectionRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f1f5f9',
  },
  projectionLabel: {
    fontSize: 16,
    color: '#64748b',
    fontWeight: '500',
  },
  projectionValue: {
    fontSize: 16,
    color: CORAL,
    fontWeight: 'bold',
  },
  estimatedText: {
    fontSize: 14,
    color: '#64748b',
    fontStyle: 'italic',
  },
  motivationContainer: {
    backgroundColor: '#fef3c7',
    borderRadius: 12,
    padding: 16,
    marginTop: 20,
    borderLeftWidth: 4,
    borderLeftColor: '#f59e0b',
  },
  motivationText: {
    fontSize: 14,
    color: '#92400e',
    textAlign: 'center',
    fontWeight: '600',
    lineHeight: 20,
  },
  graphPlaceholder: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 24,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  graphTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: TEXT,
    marginBottom: 8,
  },
  graphSubtitle: {
    fontSize: 14,
    color: '#64748b',
    textAlign: 'center',
    marginBottom: 20,
    lineHeight: 20,
  },
  graphVisual: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    height: 80,
    gap: 8,
  },
  graphBar: {
    width: 20,
    backgroundColor: CORAL,
    borderRadius: 4,
    height: 60,
  },
  noDataContainer: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 40,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  noDataText: {
    fontSize: 16,
    color: '#64748b',
    textAlign: 'center',
    lineHeight: 24,
  },
  infoContainer: {
    width: '100%',
    alignItems: 'center',
    marginTop: 20,
  },
  infoText: {
    color: '#64748b',
    fontSize: 14,
    textAlign: 'center',
    lineHeight: 20,
  },
});
