
# ForkFit API Documentation for Mobile Development

## Base URL
- Development: `http://localhost:5000/api`
- Production: `https://[your-replit-url]/api`

## Authentication
Uses Firebase Authentication. Include Firebase ID token in Authorization header:
```
Authorization: Bearer <firebase-id-token>
```

## Core Endpoints

### User Management
```
GET /api/users/{uid}                 # Get user profile
PUT /api/users/{uid}                 # Update user profile
```

### Food Logging
```
GET /api/users/{uid}/food-logs/{date}     # Get food logs for date (YYYY-MM-DD)
POST /api/users/{uid}/food-logs           # Create food log entry
PUT /api/users/{uid}/food-logs/{id}       # Update food log entry
DELETE /api/users/{uid}/food-logs/{id}    # Delete food log entry
```

### Saved Foods
```
GET /api/users/{uid}/saved-foods          # Get user's saved foods
POST /api/users/{uid}/saved-foods         # Save new food item
PUT /api/users/{uid}/saved-foods/{id}     # Update saved food
DELETE /api/users/{uid}/saved-foods/{id}  # Delete saved food
```

### Food Database
```
GET /api/food-database/search?q={query}   # Search Brazilian food database
GET /api/food-database/categories         # Get food categories
GET /api/food-database/category/{name}    # Get foods by category
```

### Weight Tracking
```
GET /api/users/{uid}/weight-logs          # Get weight history
POST /api/users/{uid}/weight-logs         # Log new weight entry
```

### Newsletter
```
POST /api/newsletter/subscribe            # Subscribe to newsletter
```

## Data Models

### User
```typescript
interface User {
  id: number;
  uid: string;
  email: string;
  onboardingCompleted: boolean;
  age?: number;
  gender?: 'male' | 'female' | 'other';
  height?: number;
  weight?: number;
  targetWeight?: number;
  activityLevel?: string;
  goal?: string;
  calories?: number;
  protein?: number;
  carbs?: number;
  fat?: number;
  createdAt: Date;
}
```

### FoodLog
```typescript
interface FoodLog {
  id: number;
  userId: number;
  date: string;
  mealType: string;
  name: string;
  quantity: number;
  unit: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  createdAt: Date;
}
```

### SavedFood
```typescript
interface SavedFood {
  id: number;
  userId: number;
  name: string;
  quantity: number;
  unit: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  createdAt: Date;
  updatedAt: Date;
}
```

## Environment Variables Needed
```
DATABASE_URL=<neon-database-url>
VITE_FIREBASE_API_KEY=<firebase-api-key>
VITE_FIREBASE_PROJECT_ID=<firebase-project-id>
VITE_FIREBASE_APP_ID=<firebase-app-id>
OPENAI_API_KEY=<openai-api-key>
```

## Error Handling
All endpoints return standard HTTP status codes:
- 200: Success
- 201: Created
- 400: Bad Request
- 401: Unauthorized
- 404: Not Found
- 500: Internal Server Error

Error responses include:
```json
{
  "message": "Error description",
  "details": "Additional error details (optional)"
}
```
