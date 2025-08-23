# ForkFit Theme System Usage Guide

## Overview

The ForkFit app now uses a centralized theme system that provides consistent colors, spacing, typography, and other design tokens across all components.

## Importing the Theme

```typescript
import { colors, spacing, typography, borderRadius, shadows } from '@/theme';
```

## Available Design Tokens

### Colors

```typescript
// Primary Brand Colors
colors.primary          // #FF725E - Main coral color
colors.primaryLight     // #FFA28F - Lighter coral for borders/accents
colors.primaryDark      // #E55A47 - Darker coral for pressed states

// Background Colors
colors.background       // #FFFFFF - Main background
colors.backgroundSecondary // #FDF6F3 - Off-white background
colors.backgroundTertiary  // #F8FAFC - Light gray background

// Text Colors
colors.textPrimary      // #1F2937 - Main text color
colors.textSecondary    // #64748B - Secondary text
colors.textTertiary     // #94A3B8 - Muted text
colors.textInverse      // #FFFFFF - Text on colored backgrounds

// Status Colors
colors.success          // #10B981 - Green for success states
colors.error            // #EF4444 - Red for error states
colors.warning          // #F59E0B - Yellow for warnings
colors.info             // #3B82F6 - Blue for info

// Social Platform Colors
colors.google           // #4285F4 - Google brand color
colors.apple            // #000000 - Apple brand color
```

### Spacing

```typescript
// Base spacing unit: 4px
spacing.xs              // 4px
spacing.sm              // 8px
spacing.md              // 16px
spacing.lg              // 24px
spacing.xl              // 32px
spacing.xxl             // 40px
spacing.xxxl            // 48px

// Common component spacing
spacing.screenPadding   // 24px - Standard screen padding
spacing.componentPadding // 16px - Standard component padding
spacing.buttonPadding   // 16px - Button padding
spacing.inputPadding    // 16px - Input field padding
spacing.cardPadding     // 20px - Card padding
spacing.sectionSpacing  // 32px - Space between sections
spacing.itemSpacing     // 16px - Space between items in lists
spacing.footerBottom    // 120px - Extra padding for fixed footer
```

### Typography

```typescript
// Font sizes
typography.xs           // 12px - Caption text
typography.sm           // 14px - Small text
typography.base         // 16px - Body text
typography.lg           // 18px - Large text
typography.xl           // 20px - Subtitle
typography['2xl']       // 24px - Title
typography['3xl']       // 28px - Large title
typography['4xl']       // 32px - Hero title
typography['5xl']       // 48px - Display text

// Font weights
typography.normal       // '400'
typography.medium       // '500'
typography.semibold     // '600'
typography.bold         // '700'

// Line heights
typography.tight        // 1.2 - Tight spacing for headings
typography.normal       // 1.4 - Normal spacing for body text
typography.relaxed      // 1.6 - Relaxed spacing for long text
typography.loose        // 1.8 - Loose spacing for captions
```

### Border Radius

```typescript
borderRadius.sm         // 8px
borderRadius.md         // 12px
borderRadius.lg         // 16px
borderRadius.xl         // 20px
borderRadius.full       // 9999px (full radius for circles)
```

### Shadows

```typescript
shadows.sm              // Small shadow
shadows.md              // Medium shadow
shadows.lg              // Large shadow
shadows.primary         // Primary color shadow
```

## Usage Examples

### Basic Component Styling

```typescript
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.backgroundSecondary,
    paddingHorizontal: spacing.screenPadding,
    paddingVertical: spacing.md,
  },
  title: {
    fontSize: typography['3xl'],
    fontWeight: typography.bold,
    color: colors.textPrimary,
    marginBottom: spacing.md,
  },
  button: {
    backgroundColor: colors.primary,
    borderRadius: borderRadius.md,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
    ...shadows.md,
  },
});
```

### Using Common Styles

```typescript
import { commonStyles } from '@/theme';

const styles = StyleSheet.create({
  container: {
    ...commonStyles.screenContainer,
  },
  card: {
    ...commonStyles.card,
    marginBottom: spacing.md,
  },
  button: {
    ...commonStyles.button,
  },
  buttonText: {
    ...commonStyles.buttonText,
  },
});
```

### Dynamic Styling

```typescript
const getButtonStyle = (isActive: boolean) => [
  styles.button,
  isActive && styles.buttonActive,
];

const styles = StyleSheet.create({
  button: {
    backgroundColor: colors.background,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: borderRadius.md,
    padding: spacing.md,
  },
  buttonActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
});
```

## Best Practices

1. **Always use theme tokens** instead of hard-coded values
2. **Use semantic color names** (e.g., `colors.textPrimary` instead of `colors.textPrimary`)
3. **Leverage spacing scale** for consistent spacing throughout the app
4. **Use typography scale** for consistent text sizing
5. **Apply shadows consistently** using the predefined shadow styles
6. **Extend common styles** when creating new components

## Migration Guide

When updating existing components:

1. Replace hard-coded colors with `colors.*` tokens
2. Replace hard-coded spacing with `spacing.*` tokens
3. Replace hard-coded font sizes with `typography.*` tokens
4. Replace hard-coded border radius with `borderRadius.*` tokens
5. Replace custom shadows with `shadows.*` tokens

### Before (Hard-coded)
```typescript
const styles = StyleSheet.create({
  container: {
    backgroundColor: '#FDF6F3',
    padding: 24,
    borderRadius: 12,
  },
  title: {
    fontSize: 28,
    color: '#1F2937',
    marginBottom: 16,
  },
});
```

### After (Theme-based)
```typescript
const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.backgroundSecondary,
    padding: spacing.screenPadding,
    borderRadius: borderRadius.md,
  },
  title: {
    fontSize: typography['3xl'],
    color: colors.textPrimary,
    marginBottom: spacing.md,
  },
});
```

## TypeScript Support

The theme system includes full TypeScript support with proper typing for all design tokens:

```typescript
import type { ColorKey, SpacingKey, TypographyKey } from '@/theme';

// These will provide autocomplete and type checking
const color: ColorKey = 'primary'; // ✅ Valid
const spacing: SpacingKey = 'md';  // ✅ Valid
const fontSize: TypographyKey = 'base'; // ✅ Valid
```
