import React, { useEffect, useState } from 'react';
import { View, StyleSheet, TouchableOpacity, Text, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { useAuth } from '../../contexts/AuthContext';
import { OnboardingProvider, useOnboarding } from './OnboardingContext';
import OnboardingProgress from '../../components/OnboardingProgress';
import GoalStep from './steps/GoalStep';
import VitalsStep from './steps/VitalsStep';
import ActivityStep from './steps/ActivityStep';
import PlanStep from './steps/PlanStep';
import NotificationsStep from './steps/NotificationsStep';
import { api } from '../../services/api';
import { getAuth } from '@react-native-firebase/auth';

const OFF_WHITE = '#FDF6F3';
const CORAL = '#FF725E';
const TEXT = '#1F2937';

type OnboardingStep = 'goal' | 'vitals' | 'activity' | 'plan' | 'notifications';

const STEP_ORDER: OnboardingStep[] = ['goal', 'vitals', 'activity', 'plan', 'notifications'];

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
  const { user, syncUser } = useAuth();
  const { isStepValid, getCurrentStepData, clearOnboardingData } = useOnboarding();
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState<OnboardingStep>('goal');
  const [loading, setLoading] = useState(false);

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

  const handleComplete = async (notificationsEnabled: boolean = false) => {
    if (!user) {
      Alert.alert('Erro', 'Usuário não encontrado. Tente fazer login novamente.');
      return;
    }

    setLoading(true);
    try {
      const completeOnboardingData = getCurrentStepData();
      console.log('Complete onboarding data to save:', completeOnboardingData);

      // Calculate age from birth date
      const calculatedAge = completeOnboardingData.birthDate ? calculateAge(completeOnboardingData.birthDate) : 0;
      console.log('Calculated age from birth date:', completeOnboardingData.birthDate, '=', calculatedAge);

      // Get authentication token
      const token = await getAuth().currentUser?.getIdToken();
      if (!token) {
        throw new Error('No authentication token available');
      }

      // Direct API call with all onboarding data including calculated age
      const userProfileData = {
        ...completeOnboardingData,
        age: calculatedAge, // Add calculated age
        notificationsEnabled,
        onboardingCompleted: true
      };
      
      console.log('Saving complete user profile:', userProfileData);
      console.log('User UID:', user.uid);
      
      await api.updateUserProfile(user.uid, userProfileData, token);
      console.log('User profile updated successfully with all onboarding data');

      // Sync updated user data to AuthContext
      await syncUser();
      console.log('User data synced after onboarding completion');

      // Clear onboarding context data
      clearOnboardingData();
      
      // Navigate to dashboard
      router.replace('/(tabs)/dashboard');
      
    } catch (error: any) {
      console.error('Error completing onboarding:', error);
      
      // Simple, clear error message for MVP
      Alert.alert(
        'Erro de Conexão', 
        'Parece que você está sem conexão. Verifique sua internet e tente novamente.'
      );
    } finally {
      setLoading(false);
    }
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
        return <GoalStep onSetLoading={setLoading} />;
      case 'vitals':
        return <VitalsStep onSetLoading={setLoading} />;
      case 'activity':
        return <ActivityStep onSetLoading={setLoading} />;
      case 'plan':
        return <PlanStep onSetLoading={setLoading} />;
      case 'notifications':
        return <NotificationsStep onSetLoading={setLoading} />;
      default:
        return <GoalStep onSetLoading={setLoading} />;
    }
  };

  const getStepProps = () => {
    const stepValid = isStepValid(currentStep);
    
    if (currentStep === 'notifications') {
      return {
        onPress: () => handleComplete(false), // For now, handle notifications separately
        disabled: loading,
        loading: loading,
        buttonText: 'Finalizar'
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
      <View style={styles.footer}>
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
    paddingBottom: 40,
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