import React, { useCallback, memo } from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import { colors, spacing, borderRadius, typography } from '../theme';

interface UnitToggleProps {
  options: string[];
  value: string;
  onChange: (option: string) => void;
  label?: string;
}

const UnitToggle = memo(({ options, value, onChange, label }: UnitToggleProps) => {
  const handlePress = useCallback((option: string) => {
    // Only call onChange if the value is actually different
    if (option !== value) {
      onChange(option);
    }
  }, [value, onChange]);

  return (
    <View style={styles.container}>
      {label && <Text style={styles.label}>{label}</Text>}
      <View style={styles.toggleContainer}>
        {options.map((option) => (
          <Pressable
            key={option}
            style={({ pressed }) => [
              styles.segment,
              value === option && styles.segmentSelected,
              pressed && { opacity: 0.7 }
            ]}
            onPress={() => handlePress(option)}
            android_ripple={{ color: colors.backgroundSecondary, borderless: false }}
          >
            <Text style={[
              styles.segmentText,
              value === option && styles.segmentTextSelected
            ]}>
              {option}
            </Text>
          </Pressable>
        ))}
      </View>
    </View>
  );
});

UnitToggle.displayName = 'UnitToggle';

export default UnitToggle;

const styles = StyleSheet.create({
  container: {
    alignItems: 'flex-start',
  },
  label: {
    fontSize: typography.sm,
    fontWeight: typography.medium,
    color: colors.textSecondary,
    marginBottom: spacing.xs,
  },
  toggleContainer: {
    height: 36,
    padding: spacing.xs,
    borderRadius: borderRadius.full,
    backgroundColor: colors.backgroundSecondary,
    flexDirection: 'row',
    alignItems: 'center',
  },
  segment: {
    flex: 1,
    borderRadius: borderRadius.full,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 28,
  },
  segmentSelected: {
    backgroundColor: colors.textPrimary,
  },
  segmentText: {
    fontSize: typography.sm,
    fontWeight: typography.semibold,
    color: colors.textPrimary,
  },
  segmentTextSelected: {
    color: colors.background,
  },
});
