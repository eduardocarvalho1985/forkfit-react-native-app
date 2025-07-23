# Backend Streak API Requirements

## **🔥 Day Streak Implementation**

The Progress tab now requires streak data from the backend. Please update the `/api/users/{uid}/progress/summary` endpoint to include:

### **Required Fields in ProgressSummary Response:**

```typescript
{
  // ... existing fields ...
  dayStreak: number,           // Current consecutive days of food logging
  weeklyStreakData: boolean[]  // Array of 7 booleans representing last 7 days
}
```

### **Streak Calculation Logic:**

1. **dayStreak**: Count consecutive days from today backwards where user logged food (consumed > 0)
2. **weeklyStreakData**: Array of 7 booleans for the last 7 days (including today)
   - `[true, true, false, true, true, true, true]` = logged food on 6 of 7 days
   - Order: [7 days ago, 6 days ago, ..., yesterday, today]

### **Example Response:**

```json
{
  "period": "7d",
  "startDate": "2024-01-15",
  "endDate": "2024-01-22",
  "averageCalories": 1850,
  "daysOnTarget": 5,
  "totalDays": 7,
  "weightChange": -0.5,
  "startWeight": 70.0,
  "currentWeight": 69.5,
  "caloriesGoal": 2000,
  "proteinGoal": 150,
  "carbsGoal": 250,
  "fatGoal": 65,
  "dayStreak": 3,
  "weeklyStreakData": [true, true, false, true, true, true, true]
}
```

### **Implementation Notes:**

- **Food Logging Definition**: A day counts as "logged" if the user has any food entries with calories > 0
- **Streak Reset**: Streak resets to 0 if user misses a day
- **Weekly Data**: Always return 7 elements, even if user hasn't been using the app for 7 days
- **Performance**: Consider caching streak calculations for better performance

### **Priority: HIGH**

This feature is critical for user engagement and retention. The streak display drives daily app usage. 