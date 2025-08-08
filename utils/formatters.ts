/**
 * Formats a number for clean UI display.
 * - Rounds to a specified number of decimal places (defaults to 0).
 * - Uses Math.round() for proper rounding (e.g., 5.5 -> 6, 5.4 -> 5).
 *
 * @param num The number to format.
 * @param decimalPlaces The number of decimal places to keep (e.g., 0 for calories, 1 for macros).
 * @returns A formatted string.
 */
export const formatNumber = (num: number | undefined | null, decimalPlaces: number = 0): string => {
  if (num === null || num === undefined || isNaN(num)) {
    return '0'; // Return a safe default for invalid inputs
  }

  const multiplier = Math.pow(10, decimalPlaces);
  const roundedNumber = Math.round(num * multiplier) / multiplier;
  
  return roundedNumber.toString();
};

// Test cases (for reference):
// formatNumber(1234.5678, 0) -> "1235"
// formatNumber(1234.5678, 1) -> "1234.6"
// formatNumber(1234.5678, 2) -> "1234.57"
// formatNumber(5.5, 0) -> "6"
// formatNumber(5.4, 0) -> "5"
// formatNumber(null) -> "0"
// formatNumber(undefined) -> "0"
// formatNumber(NaN) -> "0" 