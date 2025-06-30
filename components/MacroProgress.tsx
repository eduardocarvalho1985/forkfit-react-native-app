import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Svg, { Circle } from 'react-native-svg';
import FAIcon from 'react-native-vector-icons/FontAwesome5';

interface MacroProgressProps {
  label: string;
  current: number;
  target: number;
  unit: string;
  color: string;
}

const ICONS: Record<string, string> = {
  'proteína': 'utensils', // protein
  'carbs': 'bread-slice', // carbs
  'gordura': 'tint',      // fat
};

const COLOR_MAP: Record<string, { ring: string; text: string; bg: string }> = {
  'proteína': { ring: '#3b82f6', text: '#2563eb', bg: '#e0e7ff' },
  'carbs':    { ring: '#f97316', text: '#ea580c', bg: '#fef3c7' },
  'gordura':  { ring: '#ef4444', text: '#b91c1c', bg: '#fee2e2' },
};

export const MacroProgress = ({ label, current, target, unit, color }: MacroProgressProps) => {
  const lowerLabel = label.toLowerCase();
  const iconName = ICONS[lowerLabel] || 'circle';
  const colorSet = COLOR_MAP[lowerLabel] || { ring: color, text: color, bg: '#f1f5f9' };

  const roundedCurrent = Math.round(current * 10) / 10;
  const roundedTarget = Math.round(target * 10) / 10;
  const percentage = Math.min((roundedCurrent / (roundedTarget || 1)) * 100, 100);
  const radius = 22;
  const stroke = 5;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (percentage / 100) * circumference;

  return (
    <View style={[styles.container, { backgroundColor: colorSet.bg }]}>  
      {/* Circular Progress */}
      <View style={styles.svgWrapper}>
        <Svg width={radius * 2 + stroke} height={radius * 2 + stroke}>
          {/* Background Circle */}
          <Circle
            cx={(radius + stroke / 2)}
            cy={(radius + stroke / 2)}
            r={radius}
            stroke="#f1f5f9"
            strokeWidth={stroke}
            fill="none"
          />
          {/* Progress Circle */}
          <Circle
            cx={(radius + stroke / 2)}
            cy={(radius + stroke / 2)}
            r={radius}
            stroke={colorSet.ring}
            strokeWidth={stroke}
            fill="none"
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            strokeLinecap="round"
          />
        </Svg>
        {/* Icon in center */}
        <View style={styles.iconCenter}>
          <FAIcon name={iconName} size={18} color={colorSet.text} solid />
        </View>
      </View>
      {/* Label and Values */}
      <View style={styles.textBlock}>
        <Text style={[styles.label, { color: colorSet.text }]}>{label.toUpperCase()}</Text>
        <Text style={styles.value}>{roundedCurrent}{unit}</Text>
        <Text style={styles.target}>de {roundedTarget}{unit}</Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    padding: 12,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    width: 110,
    marginHorizontal: 2,
  },
  svgWrapper: {
    width: 54,
    height: 54,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  iconCenter: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
  },
  textBlock: {
    alignItems: 'center',
  },
  label: {
    fontSize: 12,
    fontWeight: 'bold',
    letterSpacing: 0.5,
    marginBottom: 2,
  },
  value: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1e293b',
    marginBottom: 0,
  },
  target: {
    fontSize: 12,
    color: '#64748b',
    fontWeight: '500',
  },
}); 