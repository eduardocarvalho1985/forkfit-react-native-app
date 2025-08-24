interface DataPoint {
  x: number;
  y: number;
}

interface ProjectionParams {
  mode: 'lose' | 'gain' | 'maintain';
  currentWeight: number;
  targetWeight: number;
  weeks: number;
}

export function generateWeightProjections({
  mode,
  currentWeight,
  targetWeight,
  weeks
}: ProjectionParams): {
  withForkFit: DataPoint[];
  withoutForkFit: DataPoint[];
} {
  const points = weeks + 1;
  const withForkFit: DataPoint[] = [];
  const withoutForkFit: DataPoint[] = [];

  // Generate "With ForkFit" curve - achieves the goal
  for (let i = 0; i < points; i++) {
    const progress = i / (points - 1);
    
    // Smooth easing function (ease-out)
    const easedProgress = 1 - Math.pow(1 - progress, 3);
    
    let targetY: number;
    if (mode === 'maintain') {
      targetY = currentWeight;
    } else {
      const weightChange = targetWeight - currentWeight;
      targetY = currentWeight + (weightChange * easedProgress);
    }
    
    // Add small random variation (±0.1kg) for realism
    const variation = (Math.random() - 0.5) * 0.2;
    targetY += variation;
    
    withForkFit.push({
      x: progress,
      y: Math.max(0, targetY) // Ensure weight doesn't go below 0
    });
  }

  // Generate "Without ForkFit" curve - unfavorable trajectory
  for (let i = 0; i < points; i++) {
    const progress = i / (points - 1);
    
    let targetY: number;
    
    if (mode === 'maintain') {
      // Without ForkFit: keeps gaining weight over time
      const weightGain = 0.5 + (progress * 2); // 0.5kg to 2.5kg gain over time
      targetY = currentWeight + weightGain;
    } else if (mode === 'lose') {
      // Without ForkFit: bounces around but doesn't lose weight effectively
      // Start with some loss, then bounce back up
      if (progress < 0.3) {
        // Initial small loss
        targetY = currentWeight - (progress * 0.5);
      } else if (progress < 0.7) {
        // Bounce back up
        const bounceProgress = (progress - 0.3) / 0.4;
        targetY = (currentWeight - 0.15) + (bounceProgress * 1.5);
      } else {
        // End up slightly higher than start
        const finalProgress = (progress - 0.7) / 0.3;
        targetY = (currentWeight + 1.35) + (finalProgress * 0.5);
      }
    } else { // gain
      // Without ForkFit: gains some weight but then loses it
      if (progress < 0.6) {
        // Initial gain
        const gainProgress = progress / 0.6;
        const weightGain = (targetWeight - currentWeight) * 0.6 * gainProgress;
        targetY = currentWeight + weightGain;
      } else {
        // Then lose the gained weight
        const lossProgress = (progress - 0.6) / 0.4;
        const peakWeight = currentWeight + ((targetWeight - currentWeight) * 0.6);
        const weightLoss = (peakWeight - currentWeight) * lossProgress;
        targetY = peakWeight - weightLoss;
      }
    }
    
    // Add some random variation for realism
    const variation = (Math.random() - 0.5) * 0.3;
    targetY += variation;
    
    withoutForkFit.push({
      x: progress,
      y: Math.max(0, targetY) // Ensure weight doesn't go below 0
    });
  }

  return { withForkFit, withoutForkFit };
}

// Helper function to get weight difference for display
export function getWeightDifference(currentWeight: number, targetWeight: number): number {
  return Math.abs(targetWeight - currentWeight);
}

// Helper function to get goal description
export function getGoalDescription(mode: 'lose' | 'gain' | 'maintain', amountKg?: number): string {
  switch (mode) {
    case 'lose':
      return `perder ${amountKg} kg`;
    case 'gain':
      return `ganhar ${amountKg} kg`;
    case 'maintain':
      return 'manter seu peso';
    default:
      return 'alcançar seu objetivo';
  }
}
