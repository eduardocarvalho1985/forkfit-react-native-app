/**
 * Unit conversion utilities for height and weight
 * Internal storage is always in metric units (cm for height, kg for weight)
 */

/**
 * Convert centimeters to feet and inches
 * @param cm - height in centimeters
 * @returns formatted string like "5ft,6in"
 */
export const cmToFeetIn = (cm: number): string => {
  const totalInches = cm / 2.54;
  const feet = Math.floor(totalInches / 12);
  const inches = Math.round(totalInches % 12);
  
  // Handle edge case where inches rounds to 12
  if (inches === 12) {
    return `${feet + 1}ft,0in`;
  }
  
  return `${feet}ft,${inches}in`;
};

/**
 * Convert feet and inches to centimeters
 * @param ft - feet
 * @param inches - inches
 * @returns height in centimeters
 */
export const feetInToCm = (ft: number, inches: number): number => {
  return (ft * 12 + inches) * 2.54;
};

/**
 * Convert kilograms to pounds
 * @param kg - weight in kilograms
 * @returns weight in pounds (1 decimal place for display)
 */
export const kgToLbs = (kg: number): number => {
  return Math.round(kg * 2.20462 * 10) / 10; // Round to 1 decimal place
};

/**
 * Convert pounds to kilograms
 * @param lbs - weight in pounds
 * @returns weight in kilograms
 */
export const lbsToKg = (lbs: number): number => {
  return lbs / 2.20462;
};
