import React from 'react';
import { View, Text, StyleSheet, Dimensions } from 'react-native';
import Svg, { Path, Defs, LinearGradient, Stop, Line, Circle } from 'react-native-svg';
import { colors, spacing, typography } from '@/theme';

const { width: screenWidth } = Dimensions.get('window');
const chartWidth = screenWidth - (spacing.screenPadding * 2);
const chartHeight = 240;
const padding = 40;

interface DataPoint {
  x: number;
  y: number;
}

interface CurvedLineChartWithGradientProps {
  withForkFit: DataPoint[];
  withoutForkFit: DataPoint[];
  currentWeight: number;
  targetWeight: number;
  mode: 'lose' | 'gain' | 'maintain';
}

export default function CurvedLineChartWithGradient({
  withForkFit,
  withoutForkFit,
  currentWeight,
  targetWeight,
  mode
}: CurvedLineChartWithGradientProps) {
  const chartAreaWidth = chartWidth - (padding * 2);
  const chartAreaHeight = chartHeight - (padding * 2);

  // Find min/max weights for Y-axis scaling
  const allWeights = [...withForkFit, ...withoutForkFit].map(p => p.y);
  const minWeight = Math.min(...allWeights) - 2;
  const maxWeight = Math.max(...allWeights) + 2;
  const weightRange = maxWeight - minWeight;

  // Convert data points to chart coordinates
  const toChartCoords = (point: DataPoint) => ({
    x: padding + (point.x * chartAreaWidth),
    y: padding + chartAreaHeight - ((point.y - minWeight) / weightRange * chartAreaHeight)
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
    
    // Add bottom line to close the fill
    const lastPoint = chartPoints[chartPoints.length - 1];
    const firstPoint = chartPoints[0];
    
    return `${curvePath} L ${lastPoint.x} ${chartHeight - padding} L ${firstPoint.x} ${chartHeight - padding} Z`;
  };

  // Generate grid lines
  const generateGridLines = () => {
    const lines = [];
    const gridCount = 5;
    
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

  return (
    <View style={styles.container}>
      <Svg width={chartWidth} height={chartHeight}>
        <Defs>
          {/* With ForkFit gradient - now orange */}
          <LinearGradient id="withForkFitGradient" x1="0%" y1="0%" x2="0%" y2="100%">
            <Stop offset="0%" stopColor={colors.primary} stopOpacity={0.18} />
            <Stop offset="100%" stopColor={colors.primary} stopOpacity={0.02} />
          </LinearGradient>
          
          {/* Without ForkFit gradient - now black */}
          <LinearGradient id="withoutForkFitGradient" x1="0%" y1="0%" x2="0%" y2="100%">
            <Stop offset="0%" stopColor={colors.textPrimary} stopOpacity={0.18} />
            <Stop offset="100%" stopColor={colors.textPrimary} stopOpacity={0.02} />
          </LinearGradient>
        </Defs>
        
        {/* Grid lines */}
        {generateGridLines()}
        
        {/* Fill areas */}
        <Path
          d={generateFillPath(withForkFit)}
          fill="url(#withForkFitGradient)"
        />
        <Path
          d={generateFillPath(withoutForkFit)}
          fill="url(#withoutForkFitGradient)"
        />
        
        {/* Lines */}
        <Path
          d={generateCurvePath(withForkFit)}
          stroke={colors.primary}
          strokeWidth={3}
          fill="none"
        />
        <Path
          d={generateCurvePath(withoutForkFit)}
          stroke={colors.textPrimary}
          strokeWidth={3}
          fill="none"
        />
        
        {/* Markers */}
        {withForkFit.map((point, index) => {
          const coords = toChartCoords(point);
          return (
            <Circle
              key={`with-${index}`}
              cx={coords.x}
              cy={coords.y}
              r={4}
              fill={colors.primary}
            />
          );
        })}
        
        {withoutForkFit.map((point, index) => {
          const coords = toChartCoords(point);
          return (
            <Circle
              key={`without-${index}`}
              cx={coords.x}
              cy={coords.y}
              r={4}
              fill={colors.textPrimary}
            />
          );
        })}
      </Svg>
      
      {/* Chart labels */}
      <View style={styles.chartLabels}>
        <Text style={styles.yAxisLabel}>Peso</Text>
        <Text style={styles.xAxisLabel}>Resultados esperados</Text>
      </View>
      
      {/* Legend */}
      <View style={styles.legend}>
        <View style={styles.legendItem}>
          <View style={[styles.legendDot, { backgroundColor: colors.primary }]} />
          <Text style={styles.legendText}>Com ForkFit</Text>
        </View>
        <View style={styles.legendItem}>
          <View style={[styles.legendDot, { backgroundColor: colors.textPrimary }]} />
          <Text style={styles.legendText}>Sem ForkFit</Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    marginTop: spacing.xl,
  },
  chartLabels: {
    position: 'absolute',
    left: 0,
    top: 0,
    width: chartWidth,
    height: chartHeight,
    justifyContent: 'space-between',
    paddingHorizontal: padding,
    paddingVertical: padding,
  },
  yAxisLabel: {
    position: 'absolute',
    left: 0,
    top: padding + 20,
    fontSize: typography.sm,
    color: colors.textSecondary,
    transform: [{ rotate: '-90deg' }],
  },
  xAxisLabel: {
    position: 'absolute',
    bottom: 0,
    left: padding,
    fontSize: typography.sm,
    color: colors.textSecondary,
  },
  legend: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: spacing.lg,
    gap: spacing.xl,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  legendDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
  },
  legendText: {
    fontSize: typography.sm,
    color: colors.textSecondary,
  },
});
