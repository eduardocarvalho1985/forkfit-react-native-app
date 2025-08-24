import React from 'react';
import { View, Text, StyleSheet, Dimensions } from 'react-native';
import Svg, { Path, Defs, LinearGradient, Stop, Line, Circle } from 'react-native-svg';
import { colors, spacing, typography } from '@/theme';

const { width: screenWidth } = Dimensions.get('window');
const chartWidth = screenWidth - (spacing.screenPadding * 2) - 80;
const chartHeight = 120;
const padding = 20;

interface DataPoint {
  x: number;
  y: number;
}

interface GoalProgressionChartProps {
  data: DataPoint[];
  goalType: 'lose' | 'gain' | 'maintain';
}

export default function GoalProgressionChart({ data, goalType }: GoalProgressionChartProps) {
  const chartAreaWidth = chartWidth - (padding * 2);
  const chartAreaHeight = chartHeight - (padding * 2);

  // Find min/max values for Y-axis scaling
  const allValues = data.map(p => p.y);
  const minValue = Math.min(...allValues) - 0.1;
  const maxValue = Math.max(...allValues) + 0.1;
  const valueRange = maxValue - minValue;

  // Convert data points to chart coordinates
  const toChartCoords = (point: DataPoint) => ({
    x: padding + (point.x * chartAreaWidth),
    y: padding + chartAreaHeight - ((point.y - minValue) / valueRange * chartAreaHeight)
  });

  // Generate smooth curve path
  const generateCurvePath = (points: DataPoint[]) => {
    if (points.length < 2) return '';
    
    const chartPoints = points.map(toChartCoords);
    let path = `M ${chartPoints[0].x} ${chartPoints[0].y}`;
    
    for (let i = 1; i < chartPoints.length; i++) {
      const prev = chartPoints[i - 1];
      const curr = chartPoints[i];
      const next = chartPoints[i + 1];
      
      if (next) {
        // Smooth curve using quadratic bezier
        const cp1x = prev.x + (curr.x - prev.x) * 0.5;
        const cp1y = prev.y;
        
        path += ` Q ${cp1x} ${cp1y} ${curr.x} ${curr.y}`;
      } else {
        path += ` L ${curr.x} ${curr.y}`;
      }
    }
    
    return path;
  };

  // Generate gradient fill path
  const generateFillPath = (points: DataPoint[]) => {
    if (points.length < 2) return '';
    
    const chartPoints = points.map(toChartCoords);
    const curvePath = generateCurvePath(points);
    
    // Add bottom/top line to close the fill based on goal type
    const lastPoint = chartPoints[chartPoints.length - 1];
    const firstPoint = chartPoints[0];
    
    if (goalType === 'gain') {
      // For weight gain, fill above the curve
      return `${curvePath} L ${lastPoint.x} ${padding} L ${firstPoint.x} ${padding} Z`;
    } else {
      // For weight loss/maintain, fill below the curve
      return `${curvePath} L ${lastPoint.x} ${chartHeight - padding} L ${firstPoint.x} ${chartHeight - padding} Z`;
    }
  };

  // Generate grid lines
  const generateGridLines = () => {
    const lines = [];
    const gridCount = 4;
    
    for (let i = 0; i <= gridCount; i++) {
      const y = padding + (i / gridCount) * chartAreaHeight;
      
      lines.push(
        <Line
          key={`grid-${i}`}
          x1={padding}
          y1={y}
          x2={chartWidth - padding}
          y2={y}
          stroke={colors.border}
          strokeWidth={1}
          strokeDasharray="5,5"
          opacity={0.6}
        />
      );
    }
    
    return lines;
  };

  // X-axis labels
  const xAxisLabels = ['3 dias', '7 dias', '30 dias'];

  return (
    <View style={styles.container}>
      <Svg width={chartWidth} height={chartHeight}>
        <Defs>
          {/* Success gradient - green for goal achievement */}
          <LinearGradient id="goalGradient" x1="0%" y1="0%" x2="0%" y2="100%">
            <Stop offset="0%" stopColor={colors.success} stopOpacity={0.18} />
            <Stop offset="100%" stopColor={colors.success} stopOpacity={0.02} />
          </LinearGradient>
        </Defs>
        
        {/* Grid lines */}
        {generateGridLines()}
        
        {/* Fill area */}
        <Path
          d={generateFillPath(data)}
          fill="url(#goalGradient)"
        />
        
        {/* Main line */}
        <Path
          d={generateCurvePath(data)}
          stroke={colors.success}
          strokeWidth={3}
          fill="none"
        />
        
        {/* Data point markers */}
        {data.map((point, index) => {
          const coords = toChartCoords(point);
          return (
            <Circle
              key={`point-${index}`}
              cx={coords.x}
              cy={coords.y}
              r={4}
              fill={colors.success}
            />
          );
        })}
      </Svg>
      
      {/* X-axis labels */}
      <View style={styles.xAxisLabels}>
        {xAxisLabels.map((label, index) => (
          <Text key={index} style={styles.xAxisLabel}>
            {label}
          </Text>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    marginTop: spacing.md,
  },
  xAxisLabels: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: chartWidth - (padding * 2),
    marginTop: spacing.md,
  },
  xAxisLabel: {
    fontSize: typography.sm,
    color: colors.textSecondary,
    textAlign: 'center',
    flex: 1,
  },
});
