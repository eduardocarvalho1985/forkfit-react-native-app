import React, { useEffect, useState } from 'react';
import { View, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { useAuth } from '../../contexts/AuthContext';
import { OnboardingProvider } from './OnboardingContext';
import GoalStep from './steps/GoalStep';
import VitalsStep from './steps/VitalsStep';
import ActivityStep from './steps/ActivityStep';
import PlanStep from './steps/PlanStep';
import NotificationsStep from './steps/NotificationsStep';

const OFF_WHITE = '#FDF6F3';

type OnboardingStep = 'goal' | 'vitals' | 'activity' | 'plan' | 'notifications';

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
        {renderCurrentStep()}
      </View>
    </OnboardingProvider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: OFF_WHITE,
  },
}); 