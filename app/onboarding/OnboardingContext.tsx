import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Alert } from 'react-native';
import { api } from '../../services/api';
import { getAuth } from '@react-native-firebase/auth';

export interface OnboardingData {
  goal?: 'lose_weight' | 'maintain' | 'gain_muscle';
  gender?: 'male' | 'female' | 'other';
  birthDate?: string; // ISO date string
  age?: number; // Calculated age from birth date
  height?: number;
  weight?: number;
  activityLevel?: 'sedentary' | 'light' | 'moderate' | 'very_active';
  calories?: number;
  protein?: number;
  carbs?: number;
  fat?: number;
  notificationsEnabled?: boolean;
}

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
  completeOnboarding: (notificationsEnabled: boolean) => Promise<void>;
}

const OnboardingContext = createContext<OnboardingContextType | undefined>(undefined);

export const OnboardingProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [onboardingData, setOnboardingData] = useState<OnboardingData>({});

  // Load saved onboarding data on mount
  useEffect(() => {
    loadOnboardingData();
  }, []);

  const loadOnboardingData = async () => {
    try {
      const savedData = await AsyncStorage.getItem('onboarding_data');
      if (savedData) {
        const parsedData = JSON.parse(savedData);
        setOnboardingData(parsedData);
        console.log('Loaded saved onboarding data:', parsedData);
      }
    } catch (error) {
      console.error('Error loading onboarding data:', error);
    }
  };

  const saveOnboardingData = async (data: OnboardingData) => {
    try {
      await AsyncStorage.setItem('onboarding_data', JSON.stringify(data));
      console.log('Saved onboarding data:', data);
    } catch (error) {
      console.error('Error saving onboarding data:', error);
    }
  };

  const updateStepData = (stepId: string, data: Partial<OnboardingData>) => {
    console.log(`Updating step ${stepId} with data:`, data);
    setOnboardingData(prev => {
      const updated = { ...prev, ...data };
      console.log('Updated onboarding data:', updated);
      // Save to AsyncStorage
      saveOnboardingData(updated);
      return updated;
    });
  };

  const getStepData = (stepId: string) => {
    switch (stepId) {
      case 'goal': return onboardingData.goal;
      case 'gender': return onboardingData.gender;
      case 'birthDate': return onboardingData.birthDate;
      case 'age': return onboardingData.age;
      case 'height': return onboardingData.height;
      case 'weight': return onboardingData.weight;
      case 'activityLevel': return onboardingData.activityLevel;
      case 'calories': return onboardingData.calories;
      case 'protein': return onboardingData.protein;
      case 'carbs': return onboardingData.carbs;
      case 'fat': return onboardingData.fat;
      case 'notificationsEnabled': return onboardingData.notificationsEnabled;
      default: return undefined;
    }
  };

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
    
    console.log(`Age calculation: birthDate=${birthDate}, parsed=${year}-${month}-${day}, age=${age}`);
    return age;
  };

  const calculateBMR = (weight: number, height: number, age: number, gender: string): number => {
    // Mifflin-St Jeor Equation
    if (gender === 'male') {
      return 10 * weight + 6.25 * height - 5 * age + 5;
    } else {
      return 10 * weight + 6.25 * height - 5 * age - 161;
    }
  };

  const calculateTDEE = (bmr: number, activityLevel: string): number => {
    const multipliers = {
      sedentary: 1.2,
      light: 1.375,
      moderate: 1.55,
      very_active: 1.725
    };
    
    return Math.round(bmr * multipliers[activityLevel as keyof typeof multipliers]);
  };

  const calculateMacros = (tdee: number, goal: string): { protein: number; carbs: number; fat: number } => {
    const macroRatios = {
      lose_weight: { protein: 0.30, carbs: 0.40, fat: 0.30 },
      maintain: { protein: 0.25, carbs: 0.45, fat: 0.30 },
      gain_muscle: { protein: 0.35, carbs: 0.40, fat: 0.25 }
    };

    const ratios = macroRatios[goal as keyof typeof macroRatios];
    
    // Calculate calories for each macro
    const proteinCalories = tdee * ratios.protein;
    const carbsCalories = tdee * ratios.carbs;
    const fatCalories = tdee * ratios.fat;
    
    // Convert to grams (protein: 4 cal/g, carbs: 4 cal/g, fat: 9 cal/g)
    return {
      protein: Math.round(proteinCalories / 4),
      carbs: Math.round(carbsCalories / 4),
      fat: Math.round(fatCalories / 9)
    };
  };

  const calculatePlan = (): CalculatedPlan | null => {
    const { goal, gender, birthDate, height, weight, activityLevel } = onboardingData;
    
    if (!goal || !gender || !birthDate || !height || !weight || !activityLevel) {
      return null;
    }

    try {
      const age = calculateAge(birthDate);
      const bmr = calculateBMR(weight, height, age, gender);
      const tdee = calculateTDEE(bmr, activityLevel);
      const macros = calculateMacros(tdee, goal);
      
      return {
        calories: tdee,
        protein: macros.protein,
        carbs: macros.carbs,
        fat: macros.fat
      };
    } catch (error) {
      console.error('Error calculating plan:', error);
      return null;
    }
  };

  const isStepValid = (stepId: string): boolean => {
    switch (stepId) {
      case 'goal':
        return !!onboardingData.goal;
      case 'vitals':
        return !!(onboardingData.gender && onboardingData.birthDate && 
                 onboardingData.height && onboardingData.weight);
      case 'activity':
        return !!onboardingData.activityLevel;
      case 'plan':
        return !!calculatePlan();
      case 'notifications':
        return true; // Always valid, user can choose
      default:
        return true;
    }
  };

  const getCurrentStepData = () => onboardingData;

  const clearOnboardingData = async () => {
    console.log('Clearing onboarding data');
    setOnboardingData({});
    try {
      await AsyncStorage.removeItem('onboarding_data');
      console.log('Cleared onboarding data from storage');
    } catch (error) {
      console.error('Error clearing onboarding data:', error);
    }
  };

  const completeOnboarding = async (notificationsEnabled: boolean) => {
    // This function needs access to AuthContext, so it will be implemented 
    // in the parent component instead
    throw new Error('completeOnboarding must be implemented in parent component');
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