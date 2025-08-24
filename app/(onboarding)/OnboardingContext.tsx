import React, { createContext, useContext, ReactNode } from 'react';
import { Alert } from 'react-native';
import { api } from '@/services/api';
import { getAuth } from '@react-native-firebase/auth';
import { useOnboardingStorage, OnboardingData } from '@/hooks/useOnboardingStorage';
import { 
  calculateNutritionPlan, 
  calculateWeeklyPacing as calculateWeeklyPacingUtil
} from '@/utils/onboardingCalculations';

/**
 * OnboardingContext - Manages the onboarding flow state and logic
 * 
 * This context orchestrates the onboarding process by:
 * - Managing step validation
 * - Coordinating data flow between steps
 * - Handling onboarding completion
 * 
 * REFACTORING NOTES:
 * - Calculations have been moved to utils/onboardingCalculations.ts
 * - Storage logic has been moved to hooks/useOnboardingStorage.ts
 * - This context now focuses purely on orchestration
 * - Future: Consider adding step dependency management
 * - Future: Consider adding progress tracking analytics
 * 
 * ARCHITECTURE:
 * - OnboardingContext: Orchestration and step management
 * - useOnboardingStorage: Data persistence and state management
 * - onboardingCalculations: Pure mathematical functions
 * - Components: UI rendering and user interaction
 * 
 * This separation of concerns makes the code:
 * - More testable (each piece can be tested independently)
 * - More maintainable (changes to one area don't affect others)
 * - More reusable (calculations and storage can be used elsewhere)
 * - Easier to debug (clear separation of responsibilities)
 */

interface CalculatedPlan {
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
}

interface OnboardingContextType {
  onboardingData: OnboardingData;
  updateStepData: (stepId: string, data: Partial<OnboardingData>) => void;
  getStepData: (stepId: string) => any;
  clearOnboardingData: () => void;
  isStepValid: (stepId: string) => boolean;
  getCurrentStepData: () => OnboardingData;
  calculatePlan: () => CalculatedPlan | null;
  calculateWeeklyPacing: () => number | null;
  completeOnboarding: (notificationsEnabled: boolean) => Promise<void>;
}

const OnboardingContext = createContext<OnboardingContextType | undefined>(undefined);

export const OnboardingProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  // Use the storage hook for all data persistence
  const storage = useOnboardingStorage();
  
  // Extract data and methods from storage hook
  const { 
    data: onboardingData, 
    updateData, 
    clearData, 
    getField, 
    isDataComplete 
  } = storage;

  const updateStepData = (stepId: string, data: Partial<OnboardingData>) => {
    console.log(`🔍 updateStepData called with stepId: ${stepId}, data:`, data);
    console.log(`🔍 Current onboardingData before update:`, onboardingData);
    // Use the storage hook's updateData method
    updateData(data);
    console.log(`🔍 updateData called with:`, data);
  };

  const getStepData = (stepId: string) => {
    // Use the storage hook's getField method for type-safe access
    return getField(stepId as keyof OnboardingData);
  };

  const calculateWeeklyPacing = (): number | null => {
    const { weight, targetWeight, eventDate, isEventDriven, weeklyPacing } = onboardingData;
    
    if (!weight || !targetWeight) return null;
    
    // Use the utility function from onboardingCalculations
    return calculateWeeklyPacingUtil(weight, targetWeight, eventDate, isEventDriven, weeklyPacing);
  };

  const calculatePlan = (): CalculatedPlan | null => {
    const { goal, height, weight, activityLevel, weeklyPacing, gender, age } = onboardingData;
    
    if (!goal || !height || !weight || !activityLevel) {
      return null;
    }

    try {
      // Use the utility function from onboardingCalculations
      const plan = calculateNutritionPlan({
        goal,
        gender,
        age, // Use age instead of birthDate
        height,
        weight,
        activityLevel,
        weeklyPacing
      });
      
      if (plan) {
        return {
          calories: plan.calories,
          protein: plan.protein,
          carbs: plan.carbs,
          fat: plan.fat
        };
      }
      
      return null;
    } catch (error) {
      console.error('Error calculating plan:', error);
      return null;
    }
  };

  const isStepValid = (stepId: string): boolean => {
    switch (stepId) {
      case 'introCarousel':
        return true; // Always valid, just informational
      case 'gender':
        return !!onboardingData.gender;
      case 'age':
        return !!onboardingData.age;
      case 'goal':
        console.log('Goal step validation - onboardingData.goal:', onboardingData.goal);
        const isValid = !!onboardingData.goal;
        console.log('Goal step isValid:', isValid);
        return isValid;
      case 'vitalsSliders':
        return !!(onboardingData.gender && onboardingData.age && 
                 onboardingData.height && onboardingData.weight);
      case 'exerciseFrequency':
        return !!onboardingData.activityLevel;
      case 'targetWeight':
        // Allow continuing if target weight is set, even if it's the same as current weight
        // This supports users who want to maintain their current weight
        return !!onboardingData.targetWeight;
      case 'weightLossInfo':
        return true; // Always valid, just informational
      case 'pacing':
        // Only check if weekly pacing is set - motivating event is handled in other steps
        console.log('🔍 Pacing validation - weeklyPacing:', onboardingData.weeklyPacing);
        console.log('🔍 Pacing validation - isValid:', !!onboardingData.weeklyPacing);
        return !!onboardingData.weeklyPacing;
      case 'motivation':
        return !!onboardingData.motivation;
      case 'eventChoice':
        return !!onboardingData.motivatingEvent;
      case 'eventDate':
        return !!(onboardingData.eventDate && onboardingData.motivatingEvent && onboardingData.motivatingEvent !== 'none');
      case 'lossPlanInfo':
        return true; // Always valid, just informational
      case 'socialProof':
        return true; // Always valid, just informational
      case 'notifications':
        return true; // Always valid, user can choose
      case 'loading':
        return true; // Always valid, just loading state
      case 'planPreview':
        return true; // Always valid for now, will be enhanced later
      case 'paywall':
        return true; // Always valid, user can choose
      default:
        return true;
    }
  };

  const getCurrentStepData = () => onboardingData;

  const clearOnboardingData = async () => {
    console.log('Clearing onboarding data');
    // Use the storage hook's clearData method
    await clearData();
  };

  const completeOnboarding = async (notificationsEnabled: boolean) => {
    try {
      console.log('Completing onboarding with notifications enabled:', notificationsEnabled);
      
      // Update onboarding data with notifications preference
      const finalData = { ...onboardingData, notificationsEnabled };
      
      // Save final onboarding data using storage hook
      await updateData({ notificationsEnabled });
      
      // Get current Firebase user
      const currentUser = getAuth().currentUser;
      if (!currentUser) {
        throw new Error('No authenticated user found');
      }
      
      // Save onboarding data to backend
      try {
        // Get Firebase ID token for authentication
        const token = await currentUser.getIdToken();
        
        await api.updateUserProfile(
          currentUser.uid,
          { onboardingCompleted: true, ...finalData },
          token
        );
        console.log('Onboarding data saved to backend successfully');
      } catch (backendError) {
        console.error('Failed to save onboarding data to backend:', backendError);
        // Continue with local completion even if backend fails
      }
      
      console.log('Onboarding completed successfully');
    } catch (error) {
      console.error('Error completing onboarding:', error);
      throw error;
    }
  };

  return (
    <OnboardingContext.Provider value={{
      onboardingData,
      updateStepData,
      getStepData,
      clearOnboardingData,
      isStepValid,
      getCurrentStepData,
      calculatePlan,
      calculateWeeklyPacing,
      completeOnboarding
    }}>
      {children}
    </OnboardingContext.Provider>
  );
};

export const useOnboarding = () => {
  const context = useContext(OnboardingContext);
  if (!context) {
    throw new Error('useOnboarding must be used within OnboardingProvider');
  }
  return context;
};

// Default export to satisfy Expo Router
export default OnboardingProvider; 