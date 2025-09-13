import React, { useEffect, useState } from 'react';
import { View, StyleSheet, TouchableOpacity, Text, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { useAuth } from '@/contexts/AuthContext';
import { OnboardingProvider, useOnboarding } from './OnboardingContext';
import { useOnboardingStorage } from '@/hooks/useOnboardingStorage';
import OnboardingProgress from '@/components/OnboardingProgress';
import IntroCarouselStep from './steps/IntroCarouselStep';
import GenderStep from './steps/GenderStep';
import AgeStep from './steps/AgeStep';
import VitalsSlidersStep from './steps/VitalsSlidersStep';
import ExerciseFrequencyStep from './steps/ExerciseFrequencyStep';
import GoalStep from './steps/GoalStep';
import TargetWeightStep from './steps/TargetWeightStep';
import WeightLossInfoStep from './steps/WeightLossInfoStep';
import PacingStep from './steps/PacingStep';
import MotivationStep from './steps/MotivationStep';
import EventChoiceStep from './steps/EventChoiceStep';
import EventDateStep from './steps/EventDateStep';
import LossPlanInfoStep from './steps/LossPlanInfoStep';
import SocialProofStep from './steps/SocialProofStep';
import NotificationsStep from './steps/NotificationsStep';
import LoadingStep from './steps/LoadingStep';
import PlanPreviewStep from './steps/PlanPreviewStep';
import PaywallStep from './steps/PaywallStep';
import { api } from '@/services/api';
import { getAuth } from '@react-native-firebase/auth';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { colors, spacing, typography, borderRadius, shadows } from '@/theme';

type OnboardingStep = 
  | 'introCarousel'
  | 'gender'
  | 'age'
  | 'vitalsSliders'
  | 'exerciseFrequency'
  | 'goal'
  | 'targetWeight'
  | 'weightLossInfo'
  | 'pacing'
  | 'motivation'
  | 'eventChoice'
  | 'eventDate'
  | 'lossPlanInfo'
  | 'socialProof'
  | 'notifications'
  | 'loading'
  | 'planPreview'
  | 'paywall';

const STEP_ORDER: OnboardingStep[] = [
  'introCarousel',
  'gender',
  'age',
  'vitalsSliders',
  'exerciseFrequency',
  'goal',
  'targetWeight',
  'weightLossInfo',
  'pacing',
  'motivation',
  'eventChoice',
  'eventDate',
  'lossPlanInfo',
  'socialProof',
  'notifications',
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
  const { data: storageData, isLoading: storageLoading } = useOnboardingStorage();
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState<OnboardingStep>('introCarousel');
  const [loading, setLoading] = useState(false);

  // Check if user is already onboarded
  useEffect(() => {
    if (user?.onboardingCompleted) {
      router.push('/(app)');
    }
  }, [user, router]);

  // Auto-advance from loading to planPreview when loading is completed
  useEffect(() => {
    if (currentStep === 'loading') {
      const currentData = getCurrentStepData();
      if (currentData.loadingCompleted) {
        console.log('🔍 Auto-advancing from loading to planPreview');
        setCurrentStep('planPreview');
      }
    }
  }, [currentStep, getCurrentStepData]);

  // Data validation on load - check for old onboarding data
  useEffect(() => {
    const validateOnboardingData = async () => {
      const currentData = getCurrentStepData();
      // Check if this is old onboarding data (missing essential fields)
      // Only clear if it's truly old data without basic required fields
      if (currentData && Object.keys(currentData).length > 0 && 
          (!currentData.goal || !currentData.gender || !currentData.age)) {
        console.log('Detected old/incomplete onboarding data, clearing and starting fresh');
        await clearOnboardingData();
        setCurrentStep('introCarousel');
      }
    };
    
    validateOnboardingData();
  }, []);

  // Check for existing onboarding data and resume if needed (only on initial load)
  useEffect(() => {
    // Wait for storage to finish loading before checking for resume
    if (storageLoading) {
      return;
    }
    
    const checkForExistingOnboardingData = async () => {
      console.log('🔍 Checking for existing onboarding data:', storageData);
      
      // Check if we have substantial onboarding data (more than just basic fields)
      const hasSubstantialData = storageData && (
        storageData.gender && 
        storageData.age && 
        storageData.height && 
        storageData.weight && 
        storageData.goal
      );
      
      if (hasSubstantialData) {
        console.log('🔄 Resuming onboarding from existing data');
        
        // Determine the last completed step based on data
        let resumeStep: OnboardingStep = 'introCarousel';
        
        if (storageData.notificationsEnabled !== undefined) {
          // User reached notifications step, resume from paywall
          resumeStep = 'paywall';
        } else if (storageData.socialProofViewed) {
          // User reached social proof, resume from notifications
          resumeStep = 'notifications';
        } else if (storageData.lossPlanInfo) {
          // User reached loss plan info, resume from social proof
          resumeStep = 'socialProof';
        } else if (storageData.motivatingEvent) {
          // User reached event choice, resume from loss plan info
          resumeStep = 'lossPlanInfo';
        } else if (storageData.motivation) {
          // User reached motivation, resume from event choice
          resumeStep = 'eventChoice';
        } else if (storageData.pacing) {
          // User reached pacing, resume from motivation
          resumeStep = 'motivation';
        } else if (storageData.targetWeight) {
          // User reached target weight, resume from pacing
          resumeStep = 'pacing';
        } else if (storageData.goal) {
          // User reached goal, resume from target weight
          resumeStep = 'targetWeight';
        }
        
        console.log(`📍 Resuming onboarding from step: ${resumeStep}`);
        setCurrentStep(resumeStep);
      } else {
        console.log('🆕 Starting fresh onboarding');
        setCurrentStep('introCarousel');
      }
    };
    
    checkForExistingOnboardingData();
  }, [storageLoading, storageData]); // Run when storage loading completes

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
      // After motivation, always go to eventChoice (next step in order)
      return 'eventChoice';
    }

    if (currentStep === 'eventChoice') {
      // If user chose "no specific event", skip eventDate and go to lossPlanInfo
      if (data.motivatingEvent === 'none') {
        return 'lossPlanInfo';
      }
      // Otherwise, go to eventDate (next step in order)
      return 'eventDate';
    }

    if (currentStep === 'eventDate') {
      return 'lossPlanInfo'; // Go to loss plan info after setting event date
    }

    if (currentStep === 'lossPlanInfo') {
      return 'socialProof'; // Skip moreInfo, go directly to socialProof
    }

    if (currentStep === 'loading') {
      // Only advance to plan preview if loading is completed
      if (data.loadingCompleted) {
        return 'planPreview';
      }
      // Stay on loading step if not completed
      return 'loading';
    }

    // If no special conditions are met, return the next step in the array
    return nextStepInOrder || null;
  };

  const handleBack = () => {
    const currentIndex = STEP_ORDER.indexOf(currentStep);
    if (currentIndex > 0) {
      // Special case: if we're at planPreview, skip loading and go to previous step
      if (currentStep === 'planPreview') {
        // Find the previous meaningful step (skip loading)
        const previousStep = STEP_ORDER[currentIndex - 2]; // -2 to skip loading
        console.log(`🔍 handleBack: At planPreview (index ${currentIndex}), going back to ${previousStep} (index ${currentIndex - 2})`);
        if (previousStep) {
          setCurrentStep(previousStep);
          return;
        }
      }
      
      // Special case: if we're at lossPlanInfo and user skipped eventDate
      if (currentStep === 'lossPlanInfo') {
        const currentData = getCurrentStepData();
        // If user chose "no specific event", go back to eventChoice
        if (currentData.motivatingEvent === 'none') {
          setCurrentStep('eventChoice');
          return;
        }
      }
      
      // Default back navigation
      console.log(`🔍 handleBack: Default navigation from ${currentStep} (index ${currentIndex}) to ${STEP_ORDER[currentIndex - 1]} (index ${currentIndex - 1})`);
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
      case 'gender':
        return <GenderStep onSetLoading={setLoading} />;
      case 'age':
        return <AgeStep onSetLoading={setLoading} />;
      case 'vitalsSliders':
        return <VitalsSlidersStep onSetLoading={setLoading} />;
      case 'exerciseFrequency':
        return <ExerciseFrequencyStep onSetLoading={setLoading} />;
      case 'goal':
        return <GoalStep onSetLoading={setLoading} />;
      case 'targetWeight':
        return <TargetWeightStep onSetLoading={setLoading} />;
      case 'weightLossInfo':
        return <WeightLossInfoStep onSetLoading={setLoading} />;
      case 'pacing':
        return <PacingStep onSetLoading={setLoading} />;
      case 'motivation':
        return <MotivationStep onSetLoading={setLoading} />;
      case 'eventChoice':
        return <EventChoiceStep onSetLoading={setLoading} />;
      case 'eventDate':
        return <EventDateStep onSetLoading={setLoading} />;
      case 'lossPlanInfo':
        return <LossPlanInfoStep onSetLoading={setLoading} />;
      case 'socialProof':
        return <SocialProofStep onSetLoading={setLoading} />;
      case 'notifications':
        return <NotificationsStep onSetLoading={setLoading} />;
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
        onPress: () => {}, // No action needed - PaywallStep handles its own button
        disabled: true, // Hide the footer button for paywall
        loading: false,
        buttonText: ''
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
      {currentStep !== 'introCarousel' && (
        <OnboardingProgress
          currentStep={getCurrentStepIndex()}
          totalSteps={STEP_ORDER.length}
          onBack={handleBack}
          canGoBack={canGoBack()}
        />
      )}
      <View style={styles.content}>
        {renderCurrentStep()}
      </View>

      {/* Fixed Footer - Only Continue Button (hidden for paywall) */}
      {currentStep !== 'paywall' && (
        <View style={[styles.footer, { paddingBottom: insets.bottom + spacing.footerPadding }]}>
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
      )}
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
    backgroundColor: colors.background,
  },
  content: {
    flex: 1,
  },
  footer: {
    backgroundColor: colors.background,
    paddingHorizontal: spacing.screenPadding,
    paddingTop: spacing.xs,
    paddingBottom: spacing.sm,
    alignItems: 'center',
    justifyContent: 'center',
  },
  backButton: {
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    borderRadius: borderRadius.sm,
    backgroundColor: colors.background + 'E6', // 90% opacity
    borderWidth: 1,
    borderColor: colors.primary,
    marginRight: spacing.sm,
  },
  backButtonText: {
    color: colors.primary,
    fontSize: typography.base,
    fontWeight: typography.semibold,
  },
  continueButton: {
    backgroundColor: colors.primary,
    borderRadius: borderRadius.md,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.xl,
    alignItems: 'center',
    justifyContent: 'center',
    minWidth: 200,
  },
  continueButtonDisabled: {
    backgroundColor: colors.textTertiary,
  },
  continueButtonText: {
    color: colors.textInverse,
    fontWeight: typography.bold,
    fontSize: typography.lg,
  },
  debugModal: {
    margin: 0,
    justifyContent: 'flex-end',
  },
}); 