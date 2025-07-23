# Backend Streak Implementation Guide

## Overview
The frontend requires streak functionality to track user engagement and provide gamification. This guide provides detailed requirements for implementing streak calculation and data structures.

## Current Frontend Implementation

### Data Structure Requirements

#### 1. ProgressSummary Interface (Already Defined)
```typescript
interface ProgressSummary {
  period: string;
  startDate: string;
  endDate: string;
  averageCalories: number;
  daysOnTarget: number;
  totalDays: number;
  weightChange: number;
  startWeight: number;
  currentWeight: number;
  caloriesGoal: number;
  proteinGoal: number;
  carbsGoal: number;
  fatGoal: number;
  dayStreak: number;           // ✅ REQUIRED: Current streak count
  weeklyStreakData: boolean[]; // ✅ REQUIRED: Last 7 days of activity
}
```

#### 2. Frontend Display Requirements
- **Day Streak**: Shows current consecutive days of activity
- **Weekly Dots**: Visual representation of last 7 days (S T Q Q S S D)
- **Streak Icon**: 🔥 with streak number overlay

## Backend Implementation Requirements

### 1. Streak Calculation Logic

#### Day Streak Definition
- **Consecutive days** where user has logged food entries
- **Reset to 0** if user misses a day
- **Count from most recent activity** backwards

#### Weekly Streak Data
- **Array of 7 booleans** representing last 7 days
- **Index 0 = Today, Index 6 = 6 days ago**
- **True** if user logged food on that day
- **False** if no food logged on that day

### 2. Database Schema Updates

#### Option A: Add to Existing Tables
```sql
-- Add streak fields to users table
ALTER TABLE users ADD COLUMN current_streak INTEGER DEFAULT 0;
ALTER TABLE users ADD COLUMN longest_streak INTEGER DEFAULT 0;
ALTER TABLE users ADD COLUMN last_activity_date DATE;
```

#### Option B: Create New Streak Table (Recommended)
```sql
CREATE TABLE user_streaks (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id),
    current_streak INTEGER DEFAULT 0,
    longest_streak INTEGER DEFAULT 0,
    last_activity_date DATE,
    weekly_data BOOLEAN[7] DEFAULT ARRAY[false, false, false, false, false, false, false],
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Index for performance
CREATE INDEX idx_user_streaks_user_id ON user_streaks(user_id);
```

### 3. API Endpoint Updates

#### Update Progress Summary Endpoint
**Current**: `GET /api/users/{uid}/progress/summary`

**Required Changes**:
```typescript
// Add streak calculation to existing endpoint
GET /api/users/{uid}/progress/summary?period={period}&startDate={startDate}&endDate={endDate}

Response:
{
  // ... existing fields ...
  dayStreak: number,           // Current consecutive days
  weeklyStreakData: boolean[]  // Last 7 days [today, yesterday, ..., 6 days ago]
}
```

### 4. Streak Calculation Algorithm

#### Day Streak Logic
```python
def calculate_day_streak(user_id: int) -> int:
    """
    Calculate current consecutive days of food logging
    """
    today = datetime.now().date()
    streak = 0
    current_date = today
    
    while True:
        # Check if user logged food on current_date
        has_food_log = check_food_log_exists(user_id, current_date)
        
        if has_food_log:
            streak += 1
            current_date -= timedelta(days=1)
        else:
            break
    
    return streak

def check_food_log_exists(user_id: int, date: date) -> bool:
    """
    Check if user has any food logs for the given date
    """
    query = """
    SELECT COUNT(*) FROM food_logs 
    WHERE user_id = %s AND DATE(date) = %s
    """
    result = execute_query(query, (user_id, date))
    return result[0][0] > 0
```

#### Weekly Streak Data Logic
```python
def calculate_weekly_streak_data(user_id: int) -> List[bool]:
    """
    Calculate last 7 days of activity (today = index 0)
    """
    today = datetime.now().date()
    weekly_data = []
    
    for i in range(7):
        check_date = today - timedelta(days=i)
        has_food_log = check_food_log_exists(user_id, check_date)
        weekly_data.append(has_food_log)
    
    return weekly_data  # [today, yesterday, ..., 6 days ago]
```

### 5. Integration Points

#### Food Log Creation
When a user creates a food log, update their streak:

```python
def create_food_log(user_id: int, food_data: dict):
    # 1. Create the food log
    food_log_id = insert_food_log(user_id, food_data)
    
    # 2. Update user streak
    update_user_streak(user_id)
    
    return food_log_id

def update_user_streak(user_id: int):
    """
    Update user's streak when they log food
    """
    today = datetime.now().date()
    
    # Get current streak data
    current_streak = get_current_streak(user_id)
    last_activity = get_last_activity_date(user_id)
    
    if last_activity is None or last_activity < today - timedelta(days=1):
        # Reset streak if more than 1 day gap
        new_streak = 1
    elif last_activity == today:
        # Already logged today, keep current streak
        new_streak = current_streak
    else:
        # Consecutive day, increment streak
        new_streak = current_streak + 1
    
    # Update streak data
    update_streak_data(user_id, new_streak, today)
```

### 6. Performance Considerations

#### Caching Strategy
```python
# Cache streak data for 1 hour
CACHE_KEY = f"user_streak_{user_id}"
CACHE_TTL = 3600  # 1 hour

def get_cached_streak(user_id: int):
    cached = redis.get(CACHE_KEY)
    if cached:
        return json.loads(cached)
    
    # Calculate and cache
    streak_data = calculate_streak_data(user_id)
    redis.setex(CACHE_KEY, CACHE_TTL, json.dumps(streak_data))
    return streak_data
```

#### Database Optimization
```sql
-- Index for fast food log queries by date
CREATE INDEX idx_food_logs_user_date ON food_logs(user_id, DATE(date));

-- Index for streak updates
CREATE INDEX idx_user_streaks_activity ON user_streaks(last_activity_date);
```

### 7. Testing Scenarios

#### Test Cases
1. **New User**: Streak = 0, weekly_data = [false, false, false, false, false, false, false]
2. **First Log**: Streak = 1, weekly_data = [true, false, false, false, false, false, false]
3. **Consecutive Days**: Streak = 3, weekly_data = [true, true, true, false, false, false, false]
4. **Missed Day**: Streak = 0, weekly_data = [true, false, true, true, false, false, false]
5. **Week Gap**: Streak = 1, weekly_data = [true, false, false, false, false, false, false]

### 8. Implementation Checklist

#### Backend Tasks
- [ ] Create user_streaks table
- [ ] Implement streak calculation functions
- [ ] Update progress summary endpoint
- [ ] Add streak update on food log creation
- [ ] Add caching layer
- [ ] Create database indexes
- [ ] Add unit tests
- [ ] Add integration tests

#### API Response Example
```json
{
  "period": "7d",
  "startDate": "2024-01-01",
  "endDate": "2024-01-07",
  "averageCalories": 1850,
  "daysOnTarget": 5,
  "totalDays": 7,
  "weightChange": -2.5,
  "startWeight": 80.0,
  "currentWeight": 77.5,
  "caloriesGoal": 2000,
  "proteinGoal": 150,
  "carbsGoal": 200,
  "fatGoal": 67,
  "dayStreak": 3,
  "weeklyStreakData": [true, true, true, false, true, false, false]
}
```

### 9. Frontend Integration Notes

#### Current Frontend Expectations
- **dayStreak**: Number displayed on streak card
- **weeklyStreakData**: Array of 7 booleans for dot visualization
- **Data Source**: From progress summary endpoint
- **Update Frequency**: On food log creation and app refresh

#### Error Handling
- Return `dayStreak: 0` if calculation fails
- Return `weeklyStreakData: [false, false, false, false, false, false, false]` if data unavailable
- Log errors for debugging

### 10. Deployment Notes

#### Migration Script
```sql
-- Create streak table
CREATE TABLE user_streaks (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id),
    current_streak INTEGER DEFAULT 0,
    longest_streak INTEGER DEFAULT 0,
    last_activity_date DATE,
    weekly_data BOOLEAN[7] DEFAULT ARRAY[false, false, false, false, false, false, false],
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Initialize streak data for existing users
INSERT INTO user_streaks (user_id, current_streak, longest_streak)
SELECT id, 0, 0 FROM users
ON CONFLICT DO NOTHING;
```

This implementation will provide the frontend with all necessary streak data for the gamification features. 