import React, { useEffect, useState } from 'react';
import { View, StyleSheet, TouchableOpacity, Text, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { useAuth } from '@/contexts/AuthContext';
import { OnboardingProvider, useOnboarding } from './OnboardingContext';
import OnboardingProgress from '@/components/OnboardingProgress';
import IntroCarouselStep from './steps/IntroCarouselStep';
import GoalStep from './steps/GoalStep';
import VitalsSlidersStep from './steps/VitalsSlidersStep';
import ActivityStep from './steps/ActivityStep';
import TargetWeightStep from './steps/TargetWeightStep';
import EmotionalGoalStep from './steps/EmotionalGoalStep';
import MotivationStep from './steps/MotivationStep';
import EventDateStep from './steps/EventDateStep';
import PacingStep from './steps/PacingStep';
import ProjectionStep from './steps/ProjectionStep';
import SocialProofStep from './steps/SocialProofStep';
import LoadingStep from './steps/LoadingStep';
import PlanPreviewStep from './steps/PlanPreviewStep';
import PaywallStep from './steps/PaywallStep';
import { api } from '@/services/api';
import { getAuth } from '@react-native-firebase/auth';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const OFF_WHITE = '#FDF6F3';
const CORAL = '#FF725E';
const TEXT = '#1F2937';

type OnboardingStep = 
  | 'introCarousel'
  | 'goal'
  | 'vitalsSliders'
  | 'activity'
  | 'targetWeight'
  | 'emotionalGoal'
  | 'motivation'
  | 'eventDate'
  | 'pacing'
  | 'projection'
  | 'socialProof'
  | 'loading'
  | 'planPreview'
  | 'paywall';

const STEP_ORDER: OnboardingStep[] = [
  'introCarousel',
  'goal',
  'vitalsSliders',
  'activity',
  'targetWeight',
  'emotionalGoal',
  'motivation',
  'eventDate',
  'pacing',
  'projection',
  'socialProof',
  'loading',
  'planPreview',
  'paywall'
];

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

function OnboardingContent() {
  const insets = useSafeAreaInsets()
  const { user, syncUser } = useAuth();
  const { isStepValid, getCurrentStepData, clearOnboardingData } = useOnboarding();
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState<OnboardingStep>('introCarousel');
  const [loading, setLoading] = useState(false);

  // Check if user is already onboarded
  useEffect(() => {
    if (user?.onboardingCompleted) {
      console.log('User already onboarded, redirecting to dashboard');
      router.replace('/(tabs)/dashboard');
      return;
    }
  }, [user?.onboardingCompleted]);

  // Data validation on load - check for old onboarding data
  useEffect(() => {
    const validateOnboardingData = async () => {
      const currentData = getCurrentStepData();
      // Check if this is old onboarding data (missing new fields)
      if (currentData && !currentData.hasOwnProperty('emotionalGoal')) {
        console.log('Detected old onboarding data, clearing and starting fresh');
        await clearOnboardingData();
        setCurrentStep('introCarousel');
      }
    };
    
    validateOnboardingData();
  }, []);

  const getCurrentStepIndex = () => {
    return STEP_ORDER.indexOf(currentStep) + 1;
  };

  const canGoBack = () => {
    return STEP_ORDER.indexOf(currentStep) > 0;
  };

  // Dedicated function to determine the next step based on business logic
  const determineNextStep = (currentStep: OnboardingStep, data: any): OnboardingStep | null => {
    const currentIndex = STEP_ORDER.indexOf(currentStep);
    const nextStepInOrder = STEP_ORDER[currentIndex + 1];

    // --- Conditional Logic Lives Here ---
    if (currentStep === 'motivation') {
      return data.motivatingEvent && data.motivatingEvent !== 'none' ? 'eventDate' : 'pacing';
    }

    if (currentStep === 'eventDate') {
      return 'projection'; // Always skip 'pacing' after setting a date
    }

    // If no special conditions are met, return the next step in the array
    return nextStepInOrder || null;
  };

  const handleBack = () => {
    const currentIndex = STEP_ORDER.indexOf(currentStep);
    if (currentIndex > 0) {
      setCurrentStep(STEP_ORDER[currentIndex - 1]);
    }
  };

  const handleNext = () => {
    // 1. Get current data for decision making
    const currentData = getCurrentStepData();
    
    // 2. Determine the next step using the dedicated function
    const nextStep = determineNextStep(currentStep, currentData);

    // 3. Update state to move to the next step
    if (nextStep) {
      setCurrentStep(nextStep);
    } else {
      // This means we're at the end of the flow
      handleComplete();
    }
  };

  const handleComplete = async () => {
    // Onboarding completion is now handled in the signup flow
    // This function is kept for backward compatibility but should not be called
    console.log('Onboarding completion should be handled in signup flow');
  };

  const renderCurrentStep = () => {
    switch (currentStep) {
      case 'introCarousel':
        return <IntroCarouselStep onSetLoading={setLoading} />;
      case 'goal':
        return <GoalStep onSetLoading={setLoading} />;
      case 'vitalsSliders':
        return <VitalsSlidersStep onSetLoading={setLoading} />;
      case 'activity':
        return <ActivityStep onSetLoading={setLoading} />;
      case 'targetWeight':
        return <TargetWeightStep onSetLoading={setLoading} />;
      case 'emotionalGoal':
        return <EmotionalGoalStep onSetLoading={setLoading} />;
      case 'motivation':
        return <MotivationStep onSetLoading={setLoading} />;
      case 'eventDate':
        return <EventDateStep onSetLoading={setLoading} />;
      case 'pacing':
        return <PacingStep onSetLoading={setLoading} />;
      case 'projection':
        return <ProjectionStep onSetLoading={setLoading} />;
      case 'socialProof':
        return <SocialProofStep onSetLoading={setLoading} />;
      case 'loading':
        return <LoadingStep onSetLoading={setLoading} />;
      case 'planPreview':
        return <PlanPreviewStep onSetLoading={setLoading} />;
      case 'paywall':
        return <PaywallStep onSetLoading={setLoading} />;
      default:
        return <IntroCarouselStep onSetLoading={setLoading} />;
    }
  };

  const getStepProps = () => {
    const stepValid = isStepValid(currentStep);

    if (currentStep === 'paywall') {
      return {
        onPress: () => router.push('/(auth)/register'),
        disabled: false, // Paywall step is always accessible
        loading: false,
        buttonText: 'Criar Conta'
      };
    }
    return {
      onPress: handleNext,
      disabled: !stepValid || loading,
      loading: loading,
      buttonText: 'Continuar'
    };
  };

  return (
    <View style={styles.container}>
      <OnboardingProgress
        currentStep={getCurrentStepIndex()}
        totalSteps={STEP_ORDER.length}
      />
      <View style={styles.content}>
        {renderCurrentStep()}
      </View>

      {/* Fixed Footer */}
      <View style={[styles.footer, { paddingBottom: insets.bottom + 20 }]}>
        {canGoBack() && (
          <TouchableOpacity style={styles.backButton} onPress={handleBack}>
            <Text style={styles.backButtonText}>← Voltar</Text>
          </TouchableOpacity>
        )}
        <TouchableOpacity
          style={[styles.continueButton, getStepProps().disabled && styles.continueButtonDisabled]}
          onPress={getStepProps().onPress}
          disabled={getStepProps().disabled}
        >
          <Text style={styles.continueButtonText}>
            {getStepProps().loading ? 'Salvando...' : getStepProps().buttonText}
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

export default function OnboardingManager() {
  return (
    <OnboardingProvider>
      <OnboardingContent />
    </OnboardingProvider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: OFF_WHITE,
  },
  content: {
    flex: 1,
  },
  footer: {
    backgroundColor: OFF_WHITE,
    paddingHorizontal: 24,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 114, 94, 0.1)',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  backButton: {
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    borderWidth: 1,
    borderColor: CORAL,
    marginRight: 12,
  },
  backButtonText: {
    color: CORAL,
    fontSize: 16,
    fontWeight: '600',
  },
  continueButton: {
    flex: 1,
    backgroundColor: CORAL,
    borderRadius: 12,
    paddingVertical: 16,
    paddingHorizontal: 24,
    alignItems: 'center',
  },
  continueButtonDisabled: {
    backgroundColor: '#ccc',
  },
  continueButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 18,
  },
}); 