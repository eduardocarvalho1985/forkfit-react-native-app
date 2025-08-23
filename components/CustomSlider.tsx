import React, { useState, useRef } from 'react';
import { View, Text, StyleSheet, PanResponder, Dimensions } from 'react-native';
import { colors, spacing, typography, borderRadius, shadows } from '@/theme';

const { width: screenWidth } = Dimensions.get('window');

interface CustomSliderProps {
  value: number;
  onValueChange: (value: number) => void;
  minimumValue: number;
  maximumValue: number;
  step?: number;
  width?: number;
  height?: number;
  thumbSize?: number;
  trackHeight?: number;
  showLabels?: boolean;
  disabled?: boolean;
}

export default function CustomSlider({
  value,
  onValueChange,
  minimumValue,
  maximumValue,
  step = 1,
  width = screenWidth - 80,
  height = 40,
  thumbSize = 24,
  trackHeight = 6,
  showLabels = true,
  disabled = false
}: CustomSliderProps) {
  const [sliderWidth, setSliderWidth] = useState(width);
  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => !disabled,
      onMoveShouldSetPanResponder: () => !disabled,
      onPanResponderGrant: () => {},
      onPanResponderMove: (evt, gestureState) => {
        const { locationX } = evt.nativeEvent;
        const clampedLocationX = Math.max(0, Math.min(sliderWidth, locationX));
        const percentage = clampedLocationX / sliderWidth;
        const newValue = minimumValue + percentage * (maximumValue - minimumValue);
        const steppedValue = Math.round(newValue / step) * step;
        const clampedValue = Math.max(minimumValue, Math.min(maximumValue, steppedValue));
        onValueChange(clampedValue);
      },
      onPanResponderRelease: () => {},
    })
  ).current;

  const percentage = (value - minimumValue) / (maximumValue - minimumValue);
  const thumbPosition = percentage * (sliderWidth - thumbSize);

  return (
    <View style={[styles.container, { width, height }]}>
      <View
        style={[styles.track, { height: trackHeight }]}
        onLayout={(event) => {
          const { width: layoutWidth } = event.nativeEvent.layout;
          setSliderWidth(layoutWidth);
        }}
      >
        {/* Filled track */}
        <View
          style={[
            styles.filledTrack,
            {
              width: thumbPosition + thumbSize / 2,
              height: trackHeight,
            },
          ]}
        />
        
        {/* Thumb */}
        <View
          style={[
            styles.thumb,
            {
              width: thumbSize,
              height: thumbSize,
              left: thumbPosition,
              top: (height - thumbSize) / 2,
            },
          ]}
          {...panResponder.panHandlers}
        />
      </View>
      
      {showLabels && (
        <View style={styles.labels}>
          <Text style={styles.label}>{minimumValue}</Text>
          <Text style={styles.label}>{maximumValue}</Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  track: {
    width: '100%',
    backgroundColor: colors.backgroundTertiary,
    borderRadius: 3,
    position: 'relative',
  },
  filledTrack: {
    backgroundColor: colors.primary,
    borderRadius: 3,
    position: 'absolute',
    left: 0,
    top: 0,
  },
  thumb: {
    backgroundColor: colors.primary,
    borderRadius: 12,
    position: 'absolute',
    ...shadows.lg,
    elevation: 8,
  },
  labels: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    marginTop: spacing.sm,
  },
  label: {
    fontSize: typography.sm,
    color: colors.textTertiary,
  },
});
