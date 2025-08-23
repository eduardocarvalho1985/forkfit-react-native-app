import React from 'react';
import { View, StyleSheet, TouchableOpacity, Text } from 'react-native';
import { colors, spacing, borderRadius, typography } from '@/theme';

interface OnboardingProgressProps {
  currentStep: number;
  totalSteps: number;
  onBack?: () => void;
  canGoBack?: boolean;
}

export default function OnboardingProgress({ 
  currentStep, 
  totalSteps,
  onBack,
  canGoBack = false
}: OnboardingProgressProps) {
  const progress = (currentStep / totalSteps) * 100;

  return (
    <View style={styles.container}>
      <View style={styles.headerRow}>
        {/* Back Button */}
        {canGoBack && (
          <TouchableOpacity style={styles.backButton} onPress={onBack}>
            <Text style={styles.backButtonText}>←</Text>
          </TouchableOpacity>
        )}
        
        {/* Progress Bar */}
        <View style={styles.progressBar}>
          <View 
            style={[
              styles.progressFill, 
              { width: `${progress}%` }
            ]} 
          />
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: spacing.screenPadding,
    paddingTop: spacing.xxxl + spacing.lg + spacing.sm, // Just a few more pixels below status bar
    paddingBottom: spacing.md,
    backgroundColor: colors.background,
    alignItems: 'center',
  },
  headerRow: {
    width: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  backButton: {
    padding: spacing.sm,
    borderRadius: borderRadius.full,
    backgroundColor: colors.background,
    borderWidth: 1,
    borderColor: colors.border,
    minWidth: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  backButtonText: {
    fontSize: typography.xl,
    color: colors.textPrimary,
    fontWeight: typography.bold,
  },
  progressBar: {
    flex: 1,
    height: 4,
    backgroundColor: colors.primaryLight,
    borderRadius: 2,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: colors.primary,
    borderRadius: 2,
  },
}); 