/**
 * Onboarding Calculations Utility
 * 
 * This file contains all the mathematical calculations used during onboarding:
 * - BMR (Basal Metabolic Rate) calculations
 * - TDEE (Total Daily Energy Expenditure) calculations  
 * - Macronutrient distribution calculations
 * - Weekly pacing calculations
 * 
 * All functions are pure and can be easily unit tested.
 * 
 * REFACTORING NOTES:
 * - These calculations were previously embedded in OnboardingContext
 * - Extracting them makes the code more maintainable and testable
 * - Future: Consider adding validation for input ranges
 * - Future: Consider adding more calculation methods (Katch-McArdle, etc.)
 */

/**
 * Calculate age from birth date
 * 
 * @param birthDate - ISO date string (YYYY-MM-DD)
 * @returns Age in years
 * 
 * REFACTORING NOTES:
 * - This is a simple calculation that could be moved to a general date utility
 * - Consider using a date library like date-fns for more robust date handling
 */
export const calculateAge = (birthDate: string): number => {
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

/**
 * Calculate BMR using Mifflin-St Jeor Equation
 * 
 * This is the most accurate equation for most people.
 * 
 * @param weight - Weight in kg
 * @param height - Height in cm  
 * @param age - Age in years
 * @param gender - 'male' | 'female' | 'other'
 * @returns BMR in calories per day
 * 
 * REFACTORING NOTES:
 * - Consider adding validation for weight/height ranges
 * - Future: Add Katch-McArdle equation for body composition data
 * - Future: Add Harris-Benedict equation as alternative
 */
export const calculateBMR = (weight: number, height: number, age: number, gender: string): number => {
  // Mifflin-St Jeor Equation
  if (gender === 'male') {
    return 10 * weight + 6.25 * height - 5 * age + 5;
  } else {
    return 10 * weight + 6.25 * height - 5 * age - 161;
  }
};

/**
 * Calculate TDEE (Total Daily Energy Expenditure) from BMR
 * 
 * @param bmr - Basal Metabolic Rate in calories
 * @param activityLevel - Activity level multiplier
 * @returns TDEE in calories per day
 * 
 * REFACTORING NOTES:
 * - Activity multipliers are standard values, but could be made configurable
 * - Future: Consider adding more granular activity levels
 * - Future: Consider adding NEAT (Non-Exercise Activity Thermogenesis) calculations
 */
export const calculateTDEE = (bmr: number, activityLevel: string): number => {
  const multipliers = {
    sedentary: 1.2,      // Little to no exercise
    light: 1.375,         // Light exercise 1-3 days/week
    moderate: 1.55,       // Moderate exercise 3-5 days/week
    very_active: 1.725    // Hard exercise 6-7 days/week
  };
  
  const multiplier = multipliers[activityLevel as keyof typeof multipliers] || 1.2;
  return Math.round(bmr * multiplier);
};

/**
 * Calculate macronutrient distribution based on TDEE and goal
 * 
 * @param tdee - Total Daily Energy Expenditure in calories
 * @param goal - Weight goal: 'lose_weight' | 'maintain' | 'gain_muscle'
 * @returns Object with protein, carbs, and fat in grams
 * 
 * REFACTORING NOTES:
 * - Macro ratios are based on general fitness guidelines
 * - Future: Make these ratios configurable per user preference
 * - Future: Add more sophisticated macro calculations based on body composition
 * - Future: Consider adding meal timing recommendations
 */
export const calculateMacros = (tdee: number, goal: string): { protein: number; carbs: number; fat: number } => {
  const macroRatios = {
    lose_weight: { protein: 0.30, carbs: 0.40, fat: 0.30 },    // Higher protein for satiety
    maintain: { protein: 0.25, carbs: 0.45, fat: 0.30 },        // Balanced approach
    gain_muscle: { protein: 0.35, carbs: 0.40, fat: 0.25 }      // Higher protein for muscle building
  };

  const ratios = macroRatios[goal as keyof typeof macroRatios] || macroRatios.maintain;
  
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

/**
 * Calculate weekly pacing for weight loss/gain
 * 
 * This function handles both event-driven and manual pacing calculations.
 * 
 * @param weight - Current weight in kg
 * @param targetWeight - Target weight in kg
 * @param eventDate - Optional event date for event-driven pacing
 * @param isEventDriven - Whether pacing is calculated from event date
 * @param weeklyPacing - Manual weekly pacing if not event-driven
 * @returns Weekly weight change in kg (positive for gain, negative for loss)
 * 
 * REFACTORING NOTES:
 * - Business rule: Maximum safe pacing is 1.5kg/week
 * - Future: Add more sophisticated pacing algorithms
 * - Future: Consider adding body composition changes
 * - Future: Add seasonal adjustments for events
 */
export const calculateWeeklyPacing = (
  weight: number, 
  targetWeight: number, 
  eventDate?: string, 
  isEventDriven?: boolean, 
  weeklyPacing?: number
): number | null => {
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
  
  return weeklyPacing || null;
};

/**
 * Calculate daily calorie adjustment based on weekly pacing
 * 
 * @param tdee - Total Daily Energy Expenditure in calories
 * @param weeklyPacing - Weekly weight change in kg
 * @returns Adjusted daily calories
 * 
 * REFACTORING NOTES:
 * - 7700 calories = 1kg of fat (standard conversion)
 * - Future: Consider different ratios for muscle vs fat
 * - Future: Add metabolic adaptation calculations
 * - Future: Add plateau prevention strategies
 */
export const calculateAdjustedCalories = (tdee: number, weeklyPacing: number): number => {
  // 7700 calories = 1kg of fat
  const dailyCalorieAdjustment = (weeklyPacing * 7700) / 7;
  return Math.round(tdee - dailyCalorieAdjustment);
};

/**
 * Main function to calculate the complete nutrition plan
 * 
 * This is the main entry point that orchestrates all calculations.
 * 
 * @param userData - Object containing all user input data
 * @returns Complete nutrition plan or null if insufficient data
 * 
 * REFACTORING NOTES:
 * - This function coordinates all other calculations
 * - Future: Add validation for input data ranges
 * - Future: Add multiple calculation method options
 * - Future: Add confidence intervals for recommendations
 */
export const calculateNutritionPlan = (userData: {
  goal?: 'lose_weight' | 'maintain' | 'gain_muscle';
  gender?: 'male' | 'female' | 'other';
  birthDate?: string;
  height?: number;
  weight?: number;
  activityLevel?: string;
  weeklyPacing?: number;
}): {
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
} | null => {
  const { goal, gender, birthDate, height, weight, activityLevel, weeklyPacing } = userData;
  
  if (!goal || !gender || !birthDate || !height || !weight || !activityLevel) {
    return null;
  }

  try {
    // Step 1: Calculate age
    const age = calculateAge(birthDate);
    
    // Step 2: Calculate BMR
    const bmr = calculateBMR(weight, height, age, gender);
    
    // Step 3: Calculate TDEE
    const tdee = calculateTDEE(bmr, activityLevel);
    
    // Step 4: Apply weekly pacing adjustment to calories
    let adjustedCalories = tdee;
    if (weeklyPacing) {
      adjustedCalories = calculateAdjustedCalories(tdee, weeklyPacing);
    }
    
    // Step 5: Calculate macronutrients
    const macros = calculateMacros(adjustedCalories, goal);
    
    return {
      calories: Math.round(adjustedCalories),
      protein: macros.protein,
      carbs: macros.carbs,
      fat: macros.fat
    };
  } catch (error) {
    console.error('Error calculating nutrition plan:', error);
    return null;
  }
};
