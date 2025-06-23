# Mobile App Integration Guide

## Backend API URL
Your mobile app should connect to: `https://your-repl-name--your-username.replit.app/api`

## Required Files to Add to Mobile App

### 1. API Client (services/api.ts)
```typescript
class ForkFitAPI {
  private baseUrl: string;
  
  constructor(baseUrl: string) {
    this.baseUrl = baseUrl;
  }

  async request<T>(endpoint: string, options: {
    method?: 'GET' | 'POST' | 'PUT' | 'DELETE';
    body?: any;
    token?: string;
  } = {}): Promise<T> {
    const { method = 'GET', body, token } = options;
    
    const config: RequestInit = {
      method,
      headers: {
        'Content-Type': 'application/json',
        ...(token && { Authorization: `Bearer ${token}` }),
      },
    };

    if (body && method !== 'GET') {
      config.body = JSON.stringify(body);
    }

    const response = await fetch(`${this.baseUrl}${endpoint}`, config);
    
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || `HTTP ${response.status}`);
    }

    return response.json();
  }

  // User endpoints
  async getOrCreateUser(uid: string, email: string, token: string) {
    return this.request(`/users/${uid}`, {
      method: 'POST',
      body: { uid, email },
      token,
    });
  }

  // Food database endpoints
  async searchFoods(query: string) {
    return this.request(`/food-database/search?q=${encodeURIComponent(query)}`);
  }

  async getFoodCategories() {
    return this.request('/food-database/categories');
  }

  // Food logs endpoints
  async getFoodLogs(uid: string, date: string, token: string) {
    return this.request(`/users/${uid}/food-logs/${date}`, { token });
  }

  async createFoodLog(uid: string, foodLog: any, token: string) {
    return this.request(`/users/${uid}/food-logs`, {
      method: 'POST',
      body: foodLog,
      token,
    });
  }
}

export const api = new ForkFitAPI('https://[your-web-repl-url]/api');
```

### 2. Update AuthContext Integration
```typescript
// In your AuthContext.tsx, after Firebase auth:
useEffect(() => {
  const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
    if (firebaseUser) {
      // Get Firebase ID token
      const token = await firebaseUser.getIdToken();
      
      // Create/get user in backend
      const backendUser = await api.getOrCreateUser(
        firebaseUser.uid,
        firebaseUser.email,
        token
      );
      
      setUser({ ...firebaseUser, ...backendUser, token });
    } else {
      setUser(null);
    }
  });
  
  return unsubscribe;
}, []);
```

### 3. Food Logging Component
```typescript
// components/FoodLogger.tsx
import { api } from '../services/api';
import { useAuth } from '../contexts/AuthContext';

export function FoodLogger() {
  const { user } = useAuth();
  
  const logFood = async (foodData: any) => {
    if (!user?.token) return;
    
    try {
      await api.createFoodLog(user.uid, {
        ...foodData,
        date: new Date().toISOString().split('T')[0],
      }, user.token);
    } catch (error) {
      console.error('Failed to log food:', error);
    }
  };
  
  // Your food logging UI
}
```

## Testing Connection

Test API connectivity in your mobile app:
```typescript
// Add to your app for testing
const testConnection = async () => {
  try {
    const categories = await api.getFoodCategories();
    console.log('API connected successfully:', categories);
  } catch (error) {
    console.error('API connection failed:', error);
  }
};
```

## Key Points

1. **Authentication Flow**: Firebase handles auth, backend handles data
2. **Token Management**: Pass Firebase ID token to backend APIs
3. **Data Sync**: User data lives in backend database
4. **Offline Strategy**: Cache data locally, sync when online

## Next Steps

1. Add API client to your mobile app
2. Update AuthContext to sync with backend
3. Implement food logging screens
4. Test with real Brazilian food database
5. Add offline caching for better UX