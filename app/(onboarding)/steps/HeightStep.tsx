import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import { useOnboarding } from '../OnboardingContext';
import RulerSlider from '../../../components/RulerSlider';
import UnitToggle from '../../../components/UnitToggle';
import { cmToFeetIn } from '../../../utils/units';
import { colors, spacing, borderRadius, typography } from '../../../theme';

interface HeightStepProps {
  onNext: () => void;
}

export default function HeightStep({ onNext }: HeightStepProps) {
  console.log('🔍 HeightStep: Component rendering with new RulerSlider interface');
  
  const { getStepData, updateStepData } = useOnboarding();
  const [heightCm, setHeightCm] = useState(175); // Default to 175cm
  const [unit, setUnit] = useState<'cm' | 'ft/in'>('cm');
  const [loading, setLoading] = useState(false);

  // Load existing data when component mounts
  useEffect(() => {
    console.log('🔍 HeightStep: Loading existing data...');
    const existingHeight = getStepData('height');
    console.log('🔍 HeightStep: Existing height data:', existingHeight);
    
    // Handle both number and object formats for backward compatibility
    if (typeof existingHeight === 'number') {
      setHeightCm(existingHeight);
      console.log('🔍 HeightStep: Set height from number:', existingHeight);
    } else if (existingHeight && typeof existingHeight.height === 'number') {
      setHeightCm(existingHeight.height);
      console.log('🔍 HeightStep: Set height from object:', existingHeight.height);
    }
    
    // Load unit preference if available
    const unitPref = getStepData('prefs')?.units?.height;
    if (unitPref === 'cm' || unitPref === 'ft/in') {
      setUnit(unitPref);
      console.log('🔍 HeightStep: Set unit from prefs:', unitPref);
    }
  }, [getStepData]);

  const handleHeightChange = (value: number) => {
    setHeightCm(value);
  };

  const handleUnitChange = (newUnit: string) => {
    setUnit(newUnit as 'cm' | 'ft/in');
    // Save unit preference
    const currentPrefs = getStepData('prefs') || {};
    updateStepData('prefs', {
      ...currentPrefs,
      units: { ...currentPrefs.units, height: newUnit }
    });
  };

  const formatCenterLabel = (value: number) => {
    if (unit === 'cm') {
      return `${value.toFixed(0)} cm`;
    } else {
      return cmToFeetIn(value);
    }
  };

  const handleNext = async () => {
    if (heightCm < 140 || heightCm > 210) {
      Alert.alert('Erro', 'Por favor, selecione uma altura válida entre 140 e 210 cm.');
      return;
    }

    setLoading(true);
    try {
      // Update context with height data - store as number, not object
      updateStepData('height', { height: heightCm });
      console.log('Height step completed, moving to next step');
      
      // Call the onNext callback to move to next step
      onNext();
    } catch (error) {
      console.error('Error in height step:', error);
      Alert.alert('Erro', 'Não foi possível salvar a altura. Tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  const isValidHeight = heightCm >= 140 && heightCm <= 210;

  return (
    <View style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.title}>Qual é a sua altura?</Text>
        <Text style={styles.subtitle}>
          Sua altura é essencial para calcular seu IMC e necessidades nutricionais.
        </Text>

        <View style={styles.formSection}>
          <Text style={styles.label}>Unidade</Text>
          <UnitToggle
            options={['cm', 'ft/in']}
            value={unit}
            onChange={handleUnitChange}
          />
          
          <Text style={styles.label}>Altura</Text>
          <RulerSlider
            min={140}
            max={210}
            step={1}
            value={heightCm}
            onChange={handleHeightChange}
            majorEvery={10}
            labelEvery={10}
            tickWidth={12}
            formatCenterLabel={formatCenterLabel}
            unit={unit === 'cm' ? 'cm' : ''}
          />
          <Text style={styles.hint}>
            Deslize para selecionar sua altura
          </Text>
        </View>

        <TouchableOpacity
          style={[styles.button, (!isValidHeight || loading) && styles.buttonDisabled]}
          onPress={handleNext}
          disabled={!isValidHeight || loading}
        >
          <Text style={styles.buttonText}>
            {loading ? 'Salvando...' : 'Continuar'}
          </Text>
        </TouchableOpacity>

        <Text style={styles.note}>
          Você poderá alterar essas informações no seu perfil a qualquer momento.
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.backgroundSecondary,
  },
  content: {
    flex: 1,
    paddingHorizontal: spacing.screenPadding,
    paddingTop: spacing.xxl,
  },
  title: {
    fontSize: typography['3xl'],
    fontWeight: typography.bold,
    color: colors.textPrimary,
    textAlign: 'center',
    marginBottom: spacing.sm,
  },
  subtitle: {
    fontSize: typography.base,
    color: colors.textSecondary,
    textAlign: 'center',
    lineHeight: typography.lineHeightNormal * typography.base,
    marginBottom: spacing.xxl,
  },
  formSection: {
    marginBottom: spacing.sectionSpacing,
  },
  label: {
    fontSize: typography.base,
    fontWeight: typography.semibold,
    color: colors.textPrimary,
    marginBottom: spacing.sm,
    marginTop: spacing.md,
  },
  hint: {
    fontSize: typography.sm,
    color: colors.textSecondary,
    marginTop: spacing.sm,
    fontStyle: 'italic',
    textAlign: 'center',
  },
  button: {
    backgroundColor: colors.primary,
    borderRadius: borderRadius.md,
    paddingVertical: spacing.buttonPadding,
    paddingHorizontal: spacing.lg,
    alignItems: 'center',
    marginBottom: spacing.lg,
  },
  buttonDisabled: {
    backgroundColor: colors.border,
  },
  buttonText: {
    color: colors.textInverse,
    fontWeight: typography.semibold,
    fontSize: typography.lg,
  },
  note: {
    fontSize: typography.sm,
    color: colors.textSecondary,
    textAlign: 'center',
    lineHeight: typography.lineHeightNormal * typography.sm,
  },
}); 