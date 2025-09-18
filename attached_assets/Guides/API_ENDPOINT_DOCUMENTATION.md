# API Endpoint Documentation - User Management

## Base URL
```
Production: https://forkfit.app/api
Development: http://localhost:5000/api
```

## Authentication
All endpoints use Firebase UID for user identification. No additional authentication headers required for these user management endpoints.

---

## User Management Endpoints

### 1. Create User
**POST** `/api/users`

Creates a new user in the system after Firebase registration.

**Request Body:**
```json
{
  "uid": "firebase-user-uid",          // Required: Firebase UID
  "email": "user@example.com",         // Required: User email
  "name": "User Full Name",            // Required: Display name
  "photoURL": "https://...",           // Optional: Profile photo URL
}
```

**Response (201 Created):**
```json
{
  "id": 1,
  "uid": "firebase-user-uid",
  "email": "user@example.com",
  "name": "User Full Name",
  "photoURL": "https://...",
  "age": null,
  "gender": null,
  "height": null,
  "weight": null,
  "profession": null,
  "targetWeight": null,
  "targetBodyFat": null,
  "activityLevel": null,
  "goal": null,
  "calories": null,
  "protein": null,
  "carbs": null,
  "fat": null,
  "stripeCustomerId": null,
  "stripeSubscriptionId": null,
  "onboardingCompleted": false,        // Default: false
  "dailyReminders": true,              // Default: true
  "weeklyReports": true,               // Default: true
  "createdAt": "2025-07-19T12:09:18.863Z",
  "updatedAt": "2025-07-19T12:09:18.863Z"
}
```

---

### 2. Get User
**GET** `/api/users/{uid}`

Retrieves complete user information by Firebase UID.

**Parameters:**
- `uid` (path): Firebase user UID

**Response (200 OK):**
```json
{
  "id": 1,
  "uid": "firebase-user-uid",
  "email": "user@example.com",
  "name": "User Full Name",
  "photoURL": "https://...",
  "age": 25,
  "gender": "male",
  "height": 175,
  "weight": 70,
  "profession": "Developer",
  "targetWeight": 68,
  "targetBodyFat": 12,
  "activityLevel": "moderate",
  "goal": "weight_loss",
  "calories": 2000,
  "protein": 150,
  "carbs": 200,
  "fat": 67,
  "stripeCustomerId": "cus_...",
  "stripeSubscriptionId": "sub_...",
  "onboardingCompleted": true,
  "dailyReminders": true,
  "weeklyReports": false,
  "createdAt": "2025-07-19T12:09:18.863Z",
  "updatedAt": "2025-07-19T12:15:30.124Z"
}
```

**Error (404 Not Found):**
```json
{
  "message": "User not found"
}
```

---

### 3. Update User (General)
**PUT** `/api/users/{uid}`

Updates any user fields including onboarding status.

**Parameters:**
- `uid` (path): Firebase user UID

**Request Body (partial update):**
```json
{
  "name": "Updated Name",              // Optional: Any user field
  "age": 26,                          // Optional: User age
  "height": 180,                      // Optional: Height in cm
  "weight": 75,                       // Optional: Weight in kg
  "targetWeight": 70,                 // Optional: Target weight
  "activityLevel": "high",            // Optional: activity level
  "goal": "muscle_gain",              // Optional: fitness goal
  "onboardingCompleted": true,        // Optional: onboarding status
  "dailyReminders": false             // Optional: notification settings
}
```

**Response (200 OK):**
```json
{
  "id": 1,
  "uid": "firebase-user-uid",
  // ... complete user object with updated fields
  "name": "Updated Name",
  "age": 26,
  "onboardingCompleted": true,
  "updatedAt": "2025-07-19T12:20:15.456Z"
}
```

---

### 4. Update Onboarding Status (Dedicated)
**PUT** `/api/users/{uid}/onboarding`

Specifically updates the onboarding completion status. Recommended for onboarding flow management.

**Parameters:**
- `uid` (path): Firebase user UID

**Request Body:**
```json
{
  "onboardingCompleted": true         // Required: boolean value
}
```

**Response (200 OK):**
```json
{
  "success": true,
  "user": {
    "id": 1,
    "uid": "firebase-user-uid",
    // ... complete user object
    "onboardingCompleted": true,
    "updatedAt": "2025-07-19T12:25:45.789Z"
  }
}
```

**Error (400 Bad Request):**
```json
{
  "message": "onboardingCompleted field is required and must be a boolean"
}
```

---

## Field Definitions

### User Profile Fields
| Field | Type | Description | Required | Default |
|-------|------|-------------|----------|---------|
| `uid` | string | Firebase user ID | Yes | - |
| `email` | string | User email address | Yes | - |
| `name` | string | User display name | Yes | - |
| `photoURL` | string | Profile photo URL | No | null |
| `age` | number | User age in years | No | null |
| `gender` | string | User gender | No | null |
| `height` | number | Height in centimeters | No | null |
| `weight` | number | Weight in kilograms | No | null |
| `profession` | string | User's profession | No | null |

### Fitness Goals
| Field | Type | Description | Options |
|-------|------|-------------|---------|
| `targetWeight` | number | Target weight in kg | - |
| `targetBodyFat` | number | Target body fat % | - |
| `activityLevel` | string | Activity level | `sedentary`, `light`, `moderate`, `high`, `extreme` |
| `goal` | string | Fitness goal | `weight_loss`, `muscle_gain`, `maintenance`, `endurance` |

### Nutrition Targets
| Field | Type | Description | Unit |
|-------|------|-------------|------|
| `calories` | number | Daily calorie target | kcal |
| `protein` | number | Daily protein target | grams |
| `carbs` | number | Daily carbohydrate target | grams |
| `fat` | number | Daily fat target | grams |

### Settings & Status
| Field | Type | Description | Default |
|-------|------|-------------|---------|
| `onboardingCompleted` | boolean | Onboarding completion status | false |
| `dailyReminders` | boolean | Daily reminder notifications | true |
| `weeklyReports` | boolean | Weekly report notifications | true |

### Payment Integration
| Field | Type | Description |
|-------|------|-------------|
| `stripeCustomerId` | string | Stripe customer ID |
| `stripeSubscriptionId` | string | Stripe subscription ID |

### Timestamps
| Field | Type | Description |
|-------|------|-------------|
| `createdAt` | string | User creation timestamp (ISO 8601) |
| `updatedAt` | string | Last update timestamp (ISO 8601) |

---

## Error Codes & Messages

### 200 OK
- User retrieved successfully
- User updated successfully

### 201 Created
- User created successfully

### 400 Bad Request
```json
{
  "message": "Validation error: {specific error details}"
}
```

### 404 Not Found
```json
{
  "message": "User not found"
}
```

### 500 Internal Server Error
```json
{
  "message": "Internal server error",
  "error": "{detailed error information}"
}
```

---

## Integration Examples

### React Native Example
```typescript
class UserService {
  private baseURL = 'https://forkfit.app/api';

  async createUser(userData: CreateUserData) {
    const response = await fetch(`${this.baseURL}/users`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(userData)
    });
    return response.json();
  }

  async getUser(uid: string) {
    const response = await fetch(`${this.baseURL}/users/${uid}`);
    return response.json();
  }

  async updateOnboarding(uid: string, completed: boolean) {
    const response = await fetch(`${this.baseURL}/users/${uid}/onboarding`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ onboardingCompleted: completed })
    });
    return response.json();
  }

  async updateUser(uid: string, userData: Partial<UserData>) {
    const response = await fetch(`${this.baseURL}/users/${uid}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(userData)
    });
    return response.json();
  }
}
```

### JavaScript/Fetch Example
```javascript
// Check if user needs onboarding
const checkOnboardingStatus = async (uid) => {
  try {
    const response = await fetch(`/api/users/${uid}`);
    const user = await response.json();
    
    if (!user.onboardingCompleted) {
      // Redirect to onboarding flow
      window.location.href = '/onboarding';
    }
  } catch (error) {
    console.error('Failed to check onboarding status:', error);
  }
};

// Complete onboarding
const completeOnboarding = async (uid, profileData) => {
  try {
    const response = await fetch(`/api/users/${uid}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        ...profileData,
        onboardingCompleted: true
      })
    });
    
    if (response.ok) {
      // Redirect to main app
      window.location.href = '/dashboard';
    }
  } catch (error) {
    console.error('Failed to complete onboarding:', error);
  }
};
```

All endpoints are now working reliably and ready for production use!