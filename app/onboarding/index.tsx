import React, { useEffect, useState } from 'react';
import { View, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { useAuth } from '../../contexts/AuthContext';
import { OnboardingProvider } from './OnboardingContext';
import NameStep from './steps/NameStep';
import GenderStep from './steps/GenderStep';

const OFF_WHITE = '#FDF6F3';

export default function OnboardingManager() {
  const { user } = useAuth();
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState<'name' | 'gender'>('name');

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

  const renderCurrentStep = () => {
    switch (currentStep) {
      case 'name':
        return <NameStep onNext={() => setCurrentStep('gender')} />;
      case 'gender':
        return <GenderStep onComplete={handleComplete} />;
      default:
        return <NameStep onNext={() => setCurrentStep('gender')} />;
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