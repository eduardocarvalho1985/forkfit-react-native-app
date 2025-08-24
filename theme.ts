// ForkFit Theme System
// Centralized design tokens for consistent styling across the app

export const colors = {
  // Primary Brand Colors
  primary: '#FF725E',        // Main coral color
  primaryLight: '#FFA28F',   // Lighter coral for borders/accents
  primaryDark: '#E55A47',    // Darker coral for pressed states
  
  // Background Colors
  background: '#FFFFFF',      // Main background
  backgroundSecondary: '#FDF6F3', // Off-white background
  backgroundTertiary: '#F8FAFC',  // Light gray background
  
  // Text Colors
  textPrimary: '#1F2937',    // Main text color
  textSecondary: '#64748B',  // Secondary text
  textTertiary: '#94A3B8',  // Muted text
  textInverse: '#FFFFFF',    // Text on colored backgrounds
  
  // Status Colors
  success: '#10B981',        // Green for success states
  error: '#EF4444',          // Red for error states
  warning: '#F59E0B',        // Yellow for warnings
  info: '#3B82F6',          // Blue for info
  
  // Neutral Colors
  border: '#E2E8F0',        // Light border color
  divider: '#F1F5F9',       // Divider lines
  shadow: '#000000',        // Shadow color
  
  // Social Platform Colors
  google: '#4285F4',        // Google brand color
  apple: '#000000',         // Apple brand color
} as const;

export const spacing = {
  // Base spacing unit: 4px
  xs: 4,      // 4px
  sm: 8,      // 8px
  md: 16,     // 16px
  lg: 24,     // 24px
  xl: 32,     // 32px
  xxl: 40,    // 40px
  xxxl: 48,   // 48px
  
  // Common component spacing
  screenPadding: 24,        // Standard screen padding
  componentPadding: 16,     // Standard component padding
  buttonPadding: 16,        // Button padding
  inputPadding: 16,         // Input field padding
  cardPadding: 20,          // Card padding
  sectionSpacing: 32,       // Space between sections
  itemSpacing: 16,          // Space between items in lists
  
  // Footer spacing (accounts for safe area)
  footerPadding: 20,        // Footer padding
  footerBottom: 120,        // Extra padding for fixed footer
} as const;

export const typography = {
  // Font sizes
  xs: 12,     // Caption text
  sm: 14,     // Small text
  base: 16,   // Body text
  lg: 18,     // Large text
  xl: 20,     // Subtitle
  '2xl': 24,  // Title
  '3xl': 28,  // Large title
  '4xl': 32,  // Hero title
  '5xl': 48,  // Display text
  display: 36, // Display text for headlines
  
  // Font weights
  normal: '400',
  medium: '500',
  semibold: '600',
  bold: '700',
  
  // Line heights
  tight: 1.2,      // Tight spacing for headings
  lineHeightNormal: 1.4,     // Normal spacing for body text
  relaxed: 1.6,    // Relaxed spacing for long text
  loose: 1.8,      // Loose spacing for captions
} as const;

export const borderRadius = {
  sm: 8,      // Small radius
  md: 12,     // Medium radius
  lg: 16,     // Large radius
  xl: 20,     // Extra large radius
  pill: 9999, // Pill radius for buttons/toggles
  full: 9999, // Full radius for circles
} as const;

export const shadows = {
  sm: {
    shadowColor: colors.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  md: {
    shadowColor: colors.shadow,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 4,
  },
  lg: {
    shadowColor: colors.shadow,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.2,
    shadowRadius: 16,
    elevation: 8,
  },
} as const;

// Common style combinations
export const commonStyles = {
  screenContainer: {
    flex: 1,
    backgroundColor: colors.backgroundSecondary,
    paddingHorizontal: spacing.screenPadding,
  },
  card: {
    backgroundColor: colors.background,
    borderRadius: borderRadius.lg,
    padding: spacing.cardPadding,
    ...shadows.md,
  },
  button: {
    backgroundColor: colors.primary,
    borderRadius: borderRadius.md,
    paddingVertical: spacing.buttonPadding,
    paddingHorizontal: spacing.lg,
    alignItems: 'center' as const,
    justifyContent: 'center' as const,
  },
  buttonText: {
    color: colors.textInverse,
    fontSize: typography.base,
    fontWeight: typography.semibold,
  },
  input: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: borderRadius.md,
    padding: spacing.inputPadding,
    fontSize: typography.base,
    backgroundColor: colors.background,
  },
} as const;

// Type exports for TypeScript
export type ColorKey = keyof typeof colors;
export type SpacingKey = keyof typeof spacing;
export type TypographyKey = keyof typeof typography;
export type BorderRadiusKey = keyof typeof borderRadius;
export type ShadowKey = keyof typeof shadows;
