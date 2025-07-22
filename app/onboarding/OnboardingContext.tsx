import React, { createContext, useContext, useState, ReactNode } from 'react';

export interface OnboardingData {
  name?: string;
  gender?: 'male' | 'female' | 'other';
  age?: number;
  height?: number;
  weight?: number;
  activityLevel?: 'sedentary' | 'light' | 'moderate' | 'active' | 'very_active';
  goals?: string[];
  dietaryRestrictions?: string[];
  allergies?: string[];
  preferences?: string[];
}

interface OnboardingContextType {
  onboardingData: OnboardingData;
  updateStepData: (stepId: string, data: Partial<OnboardingData>) => void;
  getStepData: (stepId: string) => any;
  clearOnboardingData: () => void;
  isStepValid: (stepId: string) => boolean;
  getCurrentStepData: () => OnboardingData;
}

const OnboardingContext = createContext<OnboardingContextType | undefined>(undefined);

export const OnboardingProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [onboardingData, setOnboardingData] = useState<OnboardingData>({});

  const updateStepData = (stepId: string, data: Partial<OnboardingData>) => {
    console.log(`Updating step ${stepId} with data:`, data);
    setOnboardingData(prev => {
      const updated = { ...prev, ...data };
      console.log('Updated onboarding data:', updated);
      return updated;
    });
  };

  const getStepData = (stepId: string) => {
    switch (stepId) {
      case 'name': return onboardingData.name;
      case 'gender': return onboardingData.gender;
      case 'age': return onboardingData.age;
      case 'height': return onboardingData.height;
      case 'weight': return onboardingData.weight;
      case 'activityLevel': return onboardingData.activityLevel;
      case 'goals': return onboardingData.goals;
      case 'dietaryRestrictions': return onboardingData.dietaryRestrictions;
      case 'allergies': return onboardingData.allergies;
      case 'preferences': return onboardingData.preferences;
      default: return undefined;
    }
  };

  const isStepValid = (stepId: string): boolean => {
    switch (stepId) {
      case 'name':
        return !!(onboardingData.name && onboardingData.name.trim().length >= 2);
      case 'gender':
        return !!onboardingData.gender;
      case 'age':
        return !!(onboardingData.age && onboardingData.age > 0 && onboardingData.age < 120);
      case 'height':
        return !!(onboardingData.height && onboardingData.height > 0);
      case 'weight':
        return !!(onboardingData.weight && onboardingData.weight > 0);
      default:
        return true;
    }
  };

  const getCurrentStepData = () => onboardingData;

  const clearOnboardingData = () => {
    console.log('Clearing onboarding data');
    setOnboardingData({});
  };

  return (
    <OnboardingContext.Provider value={{
      onboardingData,
      updateStepData,
      getStepData,
      clearOnboardingData,
      isStepValid,
      getCurrentStepData
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