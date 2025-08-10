/**
 * Weight formatting utilities for Brazilian Portuguese locale
 */

/**
 * Parse weight string to number, handling both comma and period decimal separators
 * @param weightString - Weight as string (e.g., "76,5" or "76.5")
 * @returns Weight as number
 */
export const parseWeight = (weightString: string): number => {
  // Replace comma with period for proper parsing
  const normalizedWeight = weightString.replace(',', '.');
  return parseFloat(normalizedWeight);
};

/**
 * Format weight number to Brazilian Portuguese format (comma as decimal separator)
 * @param weight - Weight as number
 * @param decimals - Number of decimal places (default: 1)
 * @returns Formatted weight string (e.g., "76,5")
 */
export const formatWeight = (weight: number, decimals: number = 1): string => {
  return weight.toFixed(decimals).replace('.', ',');
};

/**
 * Format weight for display with unit
 * @param weight - Weight as number
 * @param decimals - Number of decimal places (default: 1)
 * @returns Formatted weight with unit (e.g., "76,5 kg")
 */
export const formatWeightWithUnit = (weight: number, decimals: number = 1): string => {
  return `${formatWeight(weight, decimals)} kg`;
};

/**
 * Validate weight input
 * @param weight - Weight as string
 * @returns Object with isValid boolean and error message if invalid
 */
export const validateWeight = (weight: string): { isValid: boolean; error?: string } => {
  if (!weight.trim()) {
    return { isValid: false, error: 'Por favor, insira um peso' };
  }
  
  const weightValue = parseWeight(weight);
  
  if (isNaN(weightValue)) {
    return { isValid: false, error: 'Por favor, insira um número válido' };
  }
  
  if (weightValue < 30 || weightValue > 300) {
    return { isValid: false, error: 'Peso deve estar entre 30 e 300 kg' };
  }
  
  return { isValid: true };
}; 