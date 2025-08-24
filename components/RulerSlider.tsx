import React, { useCallback, useMemo, useRef, useState } from 'react';
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  Dimensions,
} from 'react-native';
import * as Haptics from 'expo-haptics';
import { colors, spacing } from '../theme';

const { width: screenWidth } = Dimensions.get('window');

interface RulerSliderProps {
  min: number;
  max: number;
  step: number;
  value: number;
  onChange: (value: number) => void;
  majorEvery: number;
  labelEvery?: number;
  tickWidth?: number;
  formatCenterLabel: (value: number) => string;
  unit?: string;
  color?: string;
  accent?: string;
}

interface TickItem {
  index: number;
  value: number;
  isMajor: boolean;
  shouldLabel: boolean;
}

export default function RulerSlider({
  min,
  max,
  step,
  value,
  onChange,
  majorEvery,
  labelEvery = majorEvery,
  tickWidth = 12,
  formatCenterLabel,
  unit,
  color = colors.textPrimary,
  accent = colors.primary, // Use coral theme color for main indicator
}: RulerSliderProps) {
  const flatListRef = useRef<FlatList>(null);
  const [currentIndex, setCurrentIndex] = useState(() => {
    return Math.round((value - min) / step);
  });

  // Calculate total steps
  const totalSteps = Math.round((max - min) / step) + 1;

  // Generate tick data
  const tickData = useMemo(() => {
    const ticks: TickItem[] = [];
    for (let i = 0; i < totalSteps; i++) {
      const tickValue = min + i * step;
      const isMajor = i % Math.round(majorEvery / step) === 0;
      const shouldLabel = i % Math.round(labelEvery / step) === 0;
      
      ticks.push({
        index: i,
        value: tickValue,
        isMajor,
        shouldLabel,
      });
    }
    return ticks;
  }, [min, step, totalSteps, majorEvery, labelEvery]);

  // Calculate content container padding to center the indicator
  const contentPadding = screenWidth / 2 - tickWidth / 2;

  // Scroll to current value when it changes externally
  const scrollToValue = useCallback((targetValue: number) => {
    // Calculate the exact position for the target value
    const exactPosition = ((targetValue - min) / step) * tickWidth;
    
    flatListRef.current?.scrollToOffset({
      offset: exactPosition,
      animated: false, // Don't animate initial positioning
    });
    
    // Update the current index to match the target value
    const targetIndex = Math.round((targetValue - min) / step);
    setCurrentIndex(targetIndex);
  }, [min, step, tickWidth]);

  // Scroll to current value when component mounts or value changes
  React.useEffect(() => {
    // Small delay to ensure the component is fully rendered
    const timer = setTimeout(() => {
      scrollToValue(value);
    }, 150); // Increased delay for better rendering
    return () => clearTimeout(timer);
  }, [value, scrollToValue]);

  // Handle scroll and snap to ticks
  const handleScroll = useCallback((event: any) => {
    const offsetX = event.nativeEvent.contentOffset.x;
    const newIndex = Math.round(offsetX / tickWidth);
    
    if (newIndex !== currentIndex && newIndex >= 0 && newIndex < totalSteps) {
      setCurrentIndex(newIndex);
      const newValue = min + newIndex * step;
      
      // Only trigger onChange if the value actually changed significantly
      if (Math.abs(newValue - value) >= step / 2) {
        onChange(newValue);
        // Trigger haptic feedback
        Haptics.selectionAsync();
      }
    }
  }, [currentIndex, tickWidth, totalSteps, min, step, onChange, value]);

  // Render individual tick
  const renderTick = useCallback(({ item }: { item: TickItem }) => {
    const tickHeight = item.isMajor ? 24 : 12;
    const opacity = item.isMajor ? 1.0 : 0.5;

    return (
      <View style={[styles.tickContainer, { width: tickWidth }]}>
        <View
          style={[
            styles.tick,
            {
              height: tickHeight,
              backgroundColor: color,
              opacity,
            },
          ]}
        />
        {item.shouldLabel && (
          <Text
            style={[
              styles.tickLabel,
              { color, marginTop: spacing.xs },
            ]}
          >
            {item.value.toFixed(step < 1 ? 1 : 0)}
            {unit && !item.isMajor ? unit : ''}
          </Text>
        )}
      </View>
    );
  }, [tickWidth, color, unit, step]);

  // Get item layout for FlatList optimization
  const getItemLayout = useCallback(
    (data: any, index: number) => ({
      length: tickWidth,
      offset: index * tickWidth,
      index,
    }),
    [tickWidth]
  );

  return (
    <View style={styles.container}>
      {/* Center value label */}
      <Text style={[styles.centerLabel, { color: accent }]}>
        {formatCenterLabel(value)}
      </Text>

      {/* Ruler container */}
      <View style={styles.rulerContainer}>
        {/* Center indicator */}
        <View style={[styles.centerIndicator, { backgroundColor: accent }]} />
        
        {/* Ruler ticks */}
        <FlatList
          ref={flatListRef}
          data={tickData}
          renderItem={renderTick}
          keyExtractor={(item) => item.index.toString()}
          horizontal
          showsHorizontalScrollIndicator={false}
          snapToInterval={tickWidth}
          decelerationRate="fast"
          getItemLayout={getItemLayout}
          contentContainerStyle={{
            paddingHorizontal: contentPadding,
          }}
          onScroll={handleScroll}
          scrollEventThrottle={8} // Increased from 16 for smoother scrolling
          removeClippedSubviews={true}
          initialNumToRender={Math.min(100, totalSteps)}
          maxToRenderPerBatch={50}
          windowSize={21}
          onLayout={() => {
            // Ensure we scroll to the correct position after layout
            setTimeout(() => scrollToValue(value), 100);
          }}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
  },
  centerLabel: {
    fontSize: 22,
    fontWeight: '700',
    marginBottom: spacing.lg,
    textAlign: 'center',
  },
  rulerContainer: {
    height: 60,
    width: '100%',
    position: 'relative',
  },
  centerIndicator: {
    position: 'absolute',
    left: '50%',
    top: 0,
    width: 2,
    height: 30,
    zIndex: 10,
  },
  tickContainer: {
    alignItems: 'center',
    justifyContent: 'flex-end',
  },
  tick: {
    width: 2,
    backgroundColor: colors.textPrimary,
  },
  tickLabel: {
    fontSize: 12,
    textAlign: 'center',
    minWidth: 30,
  },
});
