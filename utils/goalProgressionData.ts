interface DataPoint {
  x: number;
  y: number;
}

interface GoalProgressionParams {
  goalType: 'lose' | 'gain' | 'maintain';
}

export function generateGoalProgressionData({ goalType }: GoalProgressionParams): DataPoint[] {
  // Data points for 3 days, 7 days, and 30 days
  // x: 0 = start, 0.33 = 3 days, 0.66 = 7 days, 1 = 30 days
  // y: 0 = no progress, 1 = goal achieved
  
  if (goalType === 'maintain') {
    // For maintain: slow start, then steady progress
    return [
      { x: 0, y: 0 },           // Start: 0% progress
      { x: 0.33, y: 0.1 },      // 3 days: 10% progress
      { x: 0.66, y: 0.4 },      // 7 days: 40% progress
      { x: 1, y: 1.0 }          // 30 days: 100% progress
    ];
  } else if (goalType === 'gain') {
    // For weight gain: slow start, then acceleration
    return [
      { x: 0, y: 0 },           // Start: 0% progress
      { x: 0.33, y: 0.08 },     // 3 days: 8% progress
      { x: 0.66, y: 0.35 },     // 7 days: 35% progress
      { x: 1, y: 1.0 }          // 30 days: 100% progress
    ];
  } else {
    // For weight loss: slow start, then acceleration
    return [
      { x: 0, y: 0 },           // Start: 0% progress
      { x: 0.33, y: 0.12 },     // 3 days: 12% progress
      { x: 0.66, y: 0.45 },     // 7 days: 45% progress
      { x: 1, y: 1.0 }          // 30 days: 100% progress
    ];
  }
}
