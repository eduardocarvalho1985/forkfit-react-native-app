import React, { useEffect, useState } from 'react';
import { View, StyleSheet, TouchableOpacity, Text } from 'react-native';
import { useRouter } from 'expo-router';
import { useAuth } from '../../contexts/AuthContext';
import { OnboardingProvider } from './OnboardingContext';
import OnboardingProgress from '../../components/OnboardingProgress';
import GoalStep from './steps/GoalStep';
import VitalsStep from './steps/VitalsStep';
import ActivityStep from './steps/ActivityStep';
import PlanStep from './steps/PlanStep';
import NotificationsStep from './steps/NotificationsStep';

const OFF_WHITE = '#FDF6F3';
const CORAL = '#FF725E';
const TEXT = '#1F2937';

type OnboardingStep = 'goal' | 'vitals' | 'activity' | 'plan' | 'notifications';

const STEP_ORDER: OnboardingStep[] = ['goal', 'vitals', 'activity', 'plan', 'notifications'];

export default function OnboardingManager() {
  const { user } = useAuth();
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState<OnboardingStep>('goal');

  // Check if user is already onboarded
  useEffect(() => {
    if (user?.onboardingCompleted) {
      console.log('User already onboarded, redirecting to dashboard');
      router.replace('/(tabs)/dashboard');
      return;
    }
  }, [user?.onboardingCompleted]);

  const getCurrentStepIndex = () => {
    return STEP_ORDER.indexOf(currentStep) + 1;
  };

  const handleBack = () => {
    const currentIndex = STEP_ORDER.indexOf(currentStep);
    if (currentIndex > 0) {
      setCurrentStep(STEP_ORDER[currentIndex - 1]);
    }
  };

  const canGoBack = () => {
    return STEP_ORDER.indexOf(currentStep) > 0;
  };

  const handleComplete = () => {
    router.replace('/(tabs)/dashboard');
  };

  const getNextStep = (current: OnboardingStep): OnboardingStep => {
    switch (current) {
      case 'goal': return 'vitals';
      case 'vitals': return 'activity';
      case 'activity': return 'plan';
      case 'plan': return 'notifications';
      case 'notifications': return 'notifications'; // This will trigger completion
      default: return 'goal';
    }
  };

  const handleNext = () => {
    const nextStep = getNextStep(currentStep);
    if (nextStep === currentStep) {
      // We're at the last step, complete onboarding
      handleComplete();
    } else {
      setCurrentStep(nextStep);
    }
  };

  const renderCurrentStep = () => {
    switch (currentStep) {
      case 'goal':
        return <GoalStep onNext={handleNext} />;
      case 'vitals':
        return <VitalsStep onNext={handleNext} />;
      case 'activity':
        return <ActivityStep onNext={handleNext} />;
      case 'plan':
        return <PlanStep onNext={handleNext} />;
      case 'notifications':
        return <NotificationsStep onComplete={handleComplete} />;
      default:
        return <GoalStep onNext={handleNext} />;
    }
  };

  return (
    <OnboardingProvider>
      <View style={styles.container}>
        <OnboardingProgress 
          currentStep={getCurrentStepIndex()} 
          totalSteps={STEP_ORDER.length} 
        />
        {renderCurrentStep()}
        {canGoBack() && (
          <TouchableOpacity style={styles.backButton} onPress={handleBack}>
            <Text style={styles.backButtonText}>← Voltar</Text>
          </TouchableOpacity>
        )}
      </View>
    </OnboardingProvider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: OFF_WHITE,
  },
  backButton: {
    position: 'absolute',
    bottom: 40,
    left: 24,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    borderWidth: 1,
    borderColor: CORAL,
  },
  backButtonText: {
    color: CORAL,
    fontSize: 16,
    fontWeight: '600',
  },
}); 