import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Alert } from 'react-native';
import { api } from '@/services/api';
import { getAuth } from '@react-native-firebase/auth';

export interface OnboardingData {
  // --- Existing Fields ---
  goal?: 'lose_weight' | 'maintain' | 'gain_muscle';
  gender?: 'male' | 'female' | 'other';
  birthDate?: string; // ISO date string
  age?: number; // Calculated age from birth date
  height?: number; // Store in cm
  weight?: number; // Store in kg
  activityLevel?: 'sedentary' | 'light' | 'moderate' | 'very_active';
  
  // --- New Additions for Revamped Flow ---
  targetWeight?: number; // User's desired final weight
  emotionalGoal?: string; // User's deeper motivation (e.g., "feel confident", "be healthy")
  motivatingEvent?: 'wedding' | 'vacation' | 'reunion' | 'beach_season' | 'none'; // Specific event or none
  
  // --- Date-Driven Goal Logic ---
  isEventDriven?: boolean; // Flag to determine if pacing is calculated or chosen
  eventDate?: string; // Stored as 'YYYY-MM-DD'
  
  // --- Pacing Logic ---
  // This value is EITHER set by the user in PacingStep OR calculated from eventDate
  weeklyPacing?: number; // e.g., 0.5 for 0.5kg/week loss
  
  // --- Calculated Data ---
  calories?: number;
  protein?: number;
  carbs?: number;
  fat?: number;
  notificationsEnabled?: boolean; // This will now be set after onboarding
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
  calculateWeeklyPacing: () => number | null;
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
      case 'targetWeight': return onboardingData.targetWeight;
      case 'emotionalGoal': return onboardingData.emotionalGoal;
      case 'motivatingEvent': return onboardingData.motivatingEvent;
      case 'isEventDriven': return onboardingData.isEventDriven;
      case 'eventDate': return onboardingData.eventDate;
      case 'weeklyPacing': return onboardingData.weeklyPacing;
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

  const calculateWeeklyPacing = (): number | null => {
    const { weight, targetWeight, eventDate, isEventDriven } = onboardingData;
    
    if (!weight || !targetWeight) return null;
    
    if (isEventDriven && eventDate) {
      const totalWeightToChange = weight - targetWeight;
      const today = new Date();
      const eventDateTime = new Date(eventDate);
      const weeksUntilEvent = Math.max(1, (eventDateTime.getTime() - today.getTime()) / (1000 * 60 * 60 * 24 * 7));
      const calculatedPacing = totalWeightToChange / weeksUntilEvent;
      
      // Business Rule: Safety check for unsafe pacing
      if (Math.abs(calculatedPacing) > 1.5) {
        console.warn('Calculated pacing is unsafe:', calculatedPacing);
        // Return a safe maximum pacing
        return calculatedPacing > 0 ? 1.5 : -1.5;
      }
      
      return Math.round(calculatedPacing * 10) / 10; // Round to 1 decimal place
    }
    
    return onboardingData.weeklyPacing || null;
  };

  const calculatePlan = (): CalculatedPlan | null => {
    const { goal, gender, birthDate, height, weight, activityLevel, weeklyPacing } = onboardingData;
    
    if (!goal || !gender || !birthDate || !height || !weight || !activityLevel) {
      return null;
    }

    try {
      const age = calculateAge(birthDate);
      const bmr = calculateBMR(weight, height, age, gender);
      const tdee = calculateTDEE(bmr, activityLevel);
      
      // Apply weekly pacing adjustment to calories
      let adjustedCalories = tdee;
      if (weeklyPacing) {
        // 7700 calories = 1kg of fat
        const dailyCalorieAdjustment = (weeklyPacing * 7700) / 7;
        adjustedCalories = tdee - dailyCalorieAdjustment;
      }
      
      const macros = calculateMacros(adjustedCalories, goal);
      
      return {
        calories: Math.round(adjustedCalories),
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
      case 'introCarousel':
        return true; // Always valid, just informational
      case 'goal':
        return !!onboardingData.goal;
      case 'vitalsSliders':
        return !!(onboardingData.gender && onboardingData.birthDate && 
                 onboardingData.height && onboardingData.weight);
      case 'activity':
        return !!onboardingData.activityLevel;
      case 'targetWeight':
        return !!(onboardingData.targetWeight && onboardingData.targetWeight !== onboardingData.weight);
      case 'emotionalGoal':
        return !!onboardingData.emotionalGoal;
      case 'motivation':
        return !!onboardingData.motivatingEvent;
      case 'eventDate':
        return !!(onboardingData.eventDate && onboardingData.isEventDriven);
      case 'pacing':
        return !!(onboardingData.weeklyPacing && !onboardingData.isEventDriven);
      case 'projection':
        // Allow projection step if we have either weeklyPacing or can calculate it
        return !!(onboardingData.weeklyPacing || 
                 (onboardingData.eventDate && onboardingData.weight && onboardingData.targetWeight) ||
                 (onboardingData.weight && onboardingData.targetWeight));
      case 'socialProof':
        return true; // Always valid, just informational
      case 'loading':
        return true; // Always valid, just loading state
      case 'planPreview':
        return !!calculatePlan();
      case 'paywall':
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
    try {
      console.log('Completing onboarding with notifications enabled:', notificationsEnabled);
      
      // Update onboarding data with notifications preference
      const finalData = { ...onboardingData, notificationsEnabled };
      
      // Save final onboarding data
      await saveOnboardingData(finalData);
      
      // Get current Firebase user
      const currentUser = getAuth().currentUser;
      if (!currentUser) {
        throw new Error('No authenticated user found');
      }
      
      // Save onboarding data to backend
      try {
        await api.updateUserProfile({
          uid: currentUser.uid,
          onboardingCompleted: true,
          ...finalData
        });
        console.log('Onboarding data saved to backend successfully');
      } catch (backendError) {
        console.error('Failed to save onboarding data to backend:', backendError);
        // Continue with local completion even if backend fails
      }
      
      // Mark onboarding as completed locally
      setOnboardingData(prev => ({ ...prev, onboardingCompleted: true }));
      
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