/**
 * Onboarding Storage Hook
 * 
 * This hook handles all AsyncStorage operations for onboarding data.
 * It separates persistence logic from the OnboardingContext, making
 * the code more modular and easier to test.
 * 
 * REFACTORING NOTES:
 * - Previously, storage logic was mixed with context logic
 * - This hook can be easily mocked for testing
 * - Future: Consider adding encryption for sensitive data
 * - Future: Consider adding data validation before storage
 * - Future: Consider adding backup/restore functionality
 */

import { useState, useEffect, useCallback } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Storage key for onboarding data
const STORAGE_KEY = 'onboarding_data';

// Interface for onboarding data
export interface OnboardingData {
  // Basic user information
  goal?: 'lose_weight' | 'maintain' | 'gain_muscle';
  gender?: 'male' | 'female' | 'other';
  birthDate?: string; // ISO date string
  age?: number; // Calculated age from birth date
  height?: number; // Store in cm
  weight?: number; // Store in kg
  activityLevel?: 'sedentary' | 'light' | 'moderate' | 'very_active';
  
  // Goal-specific information
  targetWeight?: number; // User's desired final weight
  emotionalGoal?: string; // User's deeper motivation
  motivatingEvent?: 'wedding' | 'vacation' | 'reunion' | 'beach_season' | 'none';
  
  // Date-driven goal logic
  isEventDriven?: boolean; // Flag to determine if pacing is calculated or chosen
  eventDate?: string; // Stored as 'YYYY-MM-DD'
  
  // Pacing logic
  weeklyPacing?: number; // e.g., 0.5 for 0.5kg/week loss
  
  // New informational steps
  weightLossCurveInfo?: boolean; // User has seen weight loss curve info
  lossPlanInfo?: boolean; // User has seen loss plan info
  moreInfo?: boolean; // User has seen additional info
  
  // Calculated data
  calories?: number;
  protein?: number;
  carbs?: number;
  fat?: number;
  notificationsEnabled?: boolean;
}

/**
 * Custom hook for managing onboarding data persistence
 * 
 * @returns Object with storage methods and current data
 * 
 * REFACTORING NOTES:
 * - This hook encapsulates all storage logic
 * - Easy to test by mocking AsyncStorage
 * - Future: Add data migration for schema changes
 * - Future: Add data compression for large datasets
 */
export const useOnboardingStorage = () => {
  const [data, setData] = useState<OnboardingData>({});
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  /**
   * Load onboarding data from AsyncStorage
   * 
   * This function is called when the hook initializes to restore
   * any previously saved onboarding data.
   * 
   * REFACTORING NOTES:
   * - Error handling could be more sophisticated
   * - Future: Add data validation before setting state
   * - Future: Add data migration for old formats
   */
  const loadData = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      const savedData = await AsyncStorage.getItem(STORAGE_KEY);
      if (savedData) {
        const parsedData = JSON.parse(savedData);
        setData(parsedData);
        console.log('OnboardingStorage: Loaded saved data:', parsedData);
      } else {
        console.log('OnboardingStorage: No saved data found');
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      console.error('OnboardingStorage: Error loading data:', errorMessage);
      setError(errorMessage);
      
      // Don't throw error, just log it and continue with empty data
      // This prevents the app from crashing due to storage issues
    } finally {
      setIsLoading(false);
    }
  }, []);

  /**
   * Save onboarding data to AsyncStorage
   * 
   * This function is called whenever onboarding data changes.
   * It ensures data persistence across app restarts.
   * 
   * @param newData - New onboarding data to save
   * 
   * REFACTORING NOTES:
   * - Future: Add data compression for large datasets
   * - Future: Add backup to cloud storage
   * - Future: Add data validation before saving
   */
  const saveData = useCallback(async (newData: OnboardingData) => {
    try {
      setError(null);
      
      // Save to AsyncStorage
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(newData));
      
      // Update local state
      setData(newData);
      
      console.log('OnboardingStorage: Data saved successfully:', newData);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      console.error('OnboardingStorage: Error saving data:', errorMessage);
      setError(errorMessage);
      
      // Don't throw error, just log it
      // The app can continue functioning even if storage fails
    }
  }, []);

  /**
   * Update specific fields in onboarding data
   * 
   * This function allows partial updates without overwriting
   * the entire data object.
   * 
   * @param updates - Partial data to update
   * 
   * REFACTORING NOTES:
   * - This is a convenience method for partial updates
   * - Future: Add validation for specific field updates
   * - Future: Add change tracking for analytics
   */
  const updateData = useCallback(async (updates: Partial<OnboardingData>) => {
    const updatedData = { ...data, ...updates };
    await saveData(updatedData);
  }, [data, saveData]);

  /**
   * Clear all onboarding data from storage
   * 
   * This function is called when onboarding is completed
   * or when the user wants to start over.
   * 
   * REFACTORING NOTES:
   * - Future: Add confirmation before clearing
   * - Future: Add backup before clearing
   * - Future: Add analytics tracking for completion
   */
  const clearData = useCallback(async () => {
    try {
      setError(null);
      
      // Remove from AsyncStorage
      await AsyncStorage.removeItem(STORAGE_KEY);
      
      // Clear local state
      setData({});
      
      console.log('OnboardingStorage: Data cleared successfully');
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      console.error('OnboardingStorage: Error clearing data:', errorMessage);
      setError(errorMessage);
    }
  }, []);

  /**
   * Get specific field value from onboarding data
   * 
   * This function provides type-safe access to specific fields.
   * 
   * @param field - Field name to retrieve
   * @returns Field value or undefined if not found
   * 
   * REFACTORING NOTES:
   * - This provides a clean interface for accessing data
   * - Future: Add field validation
   * - Future: Add default values for missing fields
   */
  const getField = useCallback((field: keyof OnboardingData) => {
    return data[field];
  }, [data]);

  /**
   * Check if onboarding data is complete enough to proceed
   * 
   * This function validates that all required fields are present
   * before allowing the user to proceed to the next step.
   * 
   * @returns Boolean indicating if data is complete
   * 
   * REFACTORING NOTES:
   * - This validation logic could be made more sophisticated
   * - Future: Add field-specific validation rules
   * - Future: Add conditional validation based on user choices
   */
  const isDataComplete = useCallback(() => {
    const requiredFields: (keyof OnboardingData)[] = [
      'goal', 'gender', 'birthDate', 'height', 'weight', 'activityLevel'
    ];
    
    return requiredFields.every(field => data[field] !== undefined && data[field] !== null);
  }, [data]);

  // Load data when hook initializes
  useEffect(() => {
    loadData();
  }, [loadData]);

  return {
    // Data
    data,
    isLoading,
    error,
    
    // Methods
    saveData,
    updateData,
    clearData,
    getField,
    isDataComplete,
    
    // Utility
    loadData, // Exposed for manual refresh if needed
  };
};
