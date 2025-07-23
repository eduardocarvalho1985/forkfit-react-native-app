import React, { useEffect, useState } from 'react';
import { View, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { useAuth } from '../../contexts/AuthContext';
import { OnboardingProvider } from './OnboardingContext';
import NameStep from './steps/NameStep';
import GenderStep from './steps/GenderStep';
import AgeStep from './steps/AgeStep';
import HeightStep from './steps/HeightStep';
import WeightStep from './steps/WeightStep';

const OFF_WHITE = '#FDF6F3';

type OnboardingStep = 'name' | 'gender' | 'age' | 'height' | 'weight';

export default function OnboardingManager() {
  const { user } = useAuth();
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState<OnboardingStep>('name');

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
      case 'name': return 'gender';
      case 'gender': return 'age';
      case 'age': return 'height';
      case 'height': return 'weight';
      case 'weight': return 'weight'; // This will trigger completion
      default: return 'name';
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
      case 'name':
        return <NameStep onNext={handleNext} />;
      case 'gender':
        return <GenderStep onNext={handleNext} />;
      case 'age':
        return <AgeStep onNext={handleNext} />;
      case 'height':
        return <HeightStep onNext={handleNext} />;
      case 'weight':
        return <WeightStep onComplete={handleComplete} />;
      default:
        return <NameStep onNext={handleNext} />;
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