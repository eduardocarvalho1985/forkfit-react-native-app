# Frontend Integration Guide - Backend Onboarding Fix

## Overview
The backend onboarding status update system has been completely fixed and is now ready for mobile app integration. All SQL syntax errors have been resolved, and the API endpoints are working reliably.

## What Changed

### 1. Fixed Endpoints
The following endpoints are now fully functional:

#### Dedicated Onboarding Update
```
PUT /api/users/{uid}/onboarding
```
**Purpose**: Specifically for updating onboarding completion status
**Request Body**:
```json
{
  "onboardingCompleted": true | false
}
```
**Response**:
```json
{
  "success": true,
  "user": {
    "id": 49,
    "uid": "user-firebase-uid",
    "onboardingCompleted": true,
    "updatedAt": "2025-07-19T12:12:33.529Z",
    // ... other user fields
  }
}
```

#### General User Update
```
PUT /api/users/{uid}
```
**Purpose**: Update any user fields including onboarding status
**Request Body** (example):
```json
{
  "name": "Updated Name",
  "onboardingCompleted": false,
  "age": 25,
  "height": 175
}
```
**Response**: Standard user object with updated fields

#### User Retrieval
```
GET /api/users/{uid}
```
**Response**: Complete user object with consistent field mapping
```json
{
  "id": 49,
  "uid": "user-firebase-uid",
  "email": "user@example.com",
  "name": "User Name",
  "onboardingCompleted": false,
  "updatedAt": "2025-07-19T12:12:43.840Z",
  // ... all other user fields
}
```

### 2. Fixed Issues
- ✅ **SQL Syntax Errors**: No more "syntax error at or near 'where'" 
- ✅ **Empty SET Clauses**: Proper field mapping ensures data reaches database
- ✅ **Field Consistency**: camelCase frontend ↔ snake_case database mapping works
- ✅ **Boolean Handling**: `true`/`false` values process correctly
- ✅ **Timestamp Updates**: `updatedAt` field automatically maintained

## Frontend Implementation

### React Native/Mobile Integration

#### 1. User Creation (Firebase → Backend Sync)
```typescript
// After Firebase user creation, sync to backend
const syncUserToBackend = async (firebaseUser: User) => {
  const response = await fetch(`${API_BASE}/api/users`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      uid: firebaseUser.uid,
      email: firebaseUser.email,
      name: firebaseUser.displayName,
      photoURL: firebaseUser.photoURL
    })
  });
  
  const userData = await response.json();
  // userData.onboardingCompleted will be false by default
  return userData;
};
```

#### 2. Onboarding Flow Management
```typescript
// Check onboarding status
const checkOnboardingStatus = async (uid: string) => {
  const response = await fetch(`${API_BASE}/api/users/${uid}`);
  const user = await response.json();
  return user.onboardingCompleted; // boolean
};

// Update onboarding completion
const completeOnboarding = async (uid: string) => {
  const response = await fetch(`${API_BASE}/api/users/${uid}/onboarding`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ onboardingCompleted: true })
  });
  
  const result = await response.json();
  if (result.success) {
    // Onboarding completed successfully
    return result.user;
  }
};
```

#### 3. Profile Updates with Onboarding
```typescript
// Update user profile and onboarding status together
const updateUserProfile = async (uid: string, profileData: any) => {
  const response = await fetch(`${API_BASE}/api/users/${uid}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      ...profileData,
      onboardingCompleted: true // Set when profile is complete
    })
  });
  
  return await response.json();
};
```

### Web Frontend Integration

#### 1. React Hook for Onboarding
```typescript
// Custom hook for onboarding management
const useOnboarding = (uid: string) => {
  const [isOnboarded, setIsOnboarded] = useState<boolean>(false);
  const [loading, setLoading] = useState(true);

  const checkStatus = useCallback(async () => {
    try {
      const response = await fetch(`/api/users/${uid}`);
      const user = await response.json();
      setIsOnboarded(user.onboardingCompleted);
    } catch (error) {
      console.error('Failed to check onboarding status:', error);
    } finally {
      setLoading(false);
    }
  }, [uid]);

  const completeOnboarding = useCallback(async () => {
    try {
      const response = await fetch(`/api/users/${uid}/onboarding`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ onboardingCompleted: true })
      });
      
      const result = await response.json();
      if (result.success) {
        setIsOnboarded(true);
      }
    } catch (error) {
      console.error('Failed to complete onboarding:', error);
    }
  }, [uid]);

  useEffect(() => {
    if (uid) checkStatus();
  }, [uid, checkStatus]);

  return { isOnboarded, loading, completeOnboarding };
};
```

## Field Mapping Reference

### Database Schema → Frontend Response
```typescript
// Database column names (snake_case) → Frontend field names (camelCase)
{
  onboarding_completed → onboardingCompleted
  created_at → createdAt
  updated_at → updatedAt
  photo_url → photoURL
  target_weight → targetWeight
  target_body_fat → targetBodyFat
  activity_level → activityLevel
  stripe_customer_id → stripeCustomerId
  stripe_subscription_id → stripeSubscriptionId
  daily_reminders → dailyReminders
  weekly_reports → weeklyReports
}
```

### Request Body Format
Always use camelCase in request bodies:
```json
{
  "onboardingCompleted": true,
  "targetWeight": 70,
  "activityLevel": "moderate",
  "dailyReminders": true
}
```

## Error Handling

### Success Response Structure
```json
{
  "success": true,
  "user": { /* complete user object */ }
}
```

### Error Response Structure
```json
{
  "message": "Error description",
  "error": "Detailed error information"
}
```

### Common Error Scenarios
1. **User Not Found**: 404 status with message
2. **Invalid Data**: 400 status with validation errors
3. **Server Error**: 500 status with error message

## Testing Verification

### Curl Examples for Testing
```bash
# Create user
curl -X POST http://localhost:5000/api/users \
  -H "Content-Type: application/json" \
  -d '{"uid": "test-uid", "email": "test@example.com", "name": "Test User"}'

# Update onboarding status
curl -X PUT http://localhost:5000/api/users/test-uid/onboarding \
  -H "Content-Type: application/json" \
  -d '{"onboardingCompleted": true}'

# Verify update
curl -X GET http://localhost:5000/api/users/test-uid
```

## Migration Notes

### If Upgrading Existing Frontend
1. **No Breaking Changes**: Existing field names remain the same
2. **Additional Reliability**: Endpoints now work consistently
3. **Better Error Handling**: Clearer error messages and status codes
4. **Performance**: Simplified backend logic improves response times

### Database Consistency
- All existing user data remains intact
- Field mappings are preserved
- New users get `onboardingCompleted: false` by default

## Implementation Checklist

- [ ] Update API base URL to point to fixed backend
- [ ] Implement onboarding status checks in app initialization
- [ ] Add onboarding completion calls at appropriate flow points
- [ ] Test user creation → onboarding → profile completion flow
- [ ] Verify error handling for network issues
- [ ] Test with both dedicated and general update endpoints

The backend is now production-ready for your mobile app integration!