# Final Mobile Implementation Code

## Copy-Paste Ready Files for Your Mobile App

### 1. API Client - `services/api.ts`

```typescript
// services/api.ts
export interface FoodItem {
  id: number;
  name: string;
  category: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
}

export interface FoodLog {
  id?: number;
  date: string;
  mealType: string;
  name: string;
  quantity: number;
  unit: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
}

class ForkFitAPI {
  // Replace with your actual repl URL
  private baseUrl = 'https://nutri-snapp.replit.app/api';

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

    console.log(`API ${method} ${endpoint}`, body ? { body } : '');
    
    const response = await fetch(`${this.baseUrl}${endpoint}`, config);
    
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || `HTTP ${response.status}`);
    }

    const result = await response.json();
    console.log(`API Response:`, result);
    return result;
  }

  // Test connection
  async testConnection(): Promise<string[]> {
    return this.request('/food-database/categories');
  }

  // User management
  async getOrCreateUser(uid: string, email: string, token: string) {
    return this.request(`/users/${uid}`, { 
      method: 'POST',
      body: { uid, email },
      token 
    });
  }

  // Food database
  async searchFoods(query: string): Promise<FoodItem[]> {
    return this.request(`/food-database/search?q=${encodeURIComponent(query)}`);
  }

  async getFoodCategories(): Promise<string[]> {
    return this.request('/food-database/categories');
  }

  // Food logging
  async getFoodLogs(uid: string, date: string, token: string): Promise<FoodLog[]> {
    return this.request(`/users/${uid}/food-logs/${date}`, { token });
  }

  async createFoodLog(uid: string, foodLog: FoodLog, token: string): Promise<FoodLog> {
    return this.request(`/users/${uid}/food-logs`, {
      method: 'POST',
      body: foodLog,
      token,
    });
  }
}

export const api = new ForkFitAPI();
```

### 2. Enhanced AuthContext - Update your existing file

```typescript
// In your contexts/AuthContext.tsx - ADD this to existing code:

import { api } from '../services/api';

// Update your auth state listener in AuthProvider:
useEffect(() => {
  const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
    if (firebaseUser) {
      try {
        console.log('Firebase user signed in:', firebaseUser.uid);
        
        // Get Firebase ID token
        const token = await firebaseUser.getIdToken();
        console.log('Got Firebase token');
        
        // Sync with backend
        const backendUser = await api.getOrCreateUser(
          firebaseUser.uid,
          firebaseUser.email || '',
          token
        );
        
        console.log('Backend user synced:', backendUser);
        
        // Combine Firebase and backend user data
        setUser({
          uid: firebaseUser.uid,
          email: firebaseUser.email,
          displayName: firebaseUser.displayName,
          photoURL: firebaseUser.photoURL,
          token, // Store token for API calls
          ...backendUser, // Backend user data
        });
        
      } catch (error) {
        console.error('Failed to sync user with backend:', error);
        // Still set Firebase user even if backend fails
        const token = await firebaseUser.getIdToken().catch(() => null);
        setUser({
          uid: firebaseUser.uid,
          email: firebaseUser.email,
          displayName: firebaseUser.displayName,
          photoURL: firebaseUser.photoURL,
          token,
        });
      }
    } else {
      console.log('User signed out');
      setUser(null);
    }
    setLoading(false);
  });

  return unsubscribe;
}, []);
```

### 3. Test Component - `components/APITest.tsx`

```typescript
// components/APITest.tsx
import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { api } from '../services/api';

export function APITest() {
  const [testing, setTesting] = useState(false);
  const [result, setResult] = useState<string>('');

  const testConnection = async () => {
    setTesting(true);
    setResult('Testing connection...');
    
    try {
      console.log('Starting API test...');
      const categories = await api.testConnection();
      
      const resultText = `✅ Success! Found ${categories.length} food categories:\n${categories.slice(0, 3).join(', ')}...`;
      setResult(resultText);
      console.log('API test successful:', categories);
      
    } catch (error) {
      const errorText = `❌ Connection failed: ${error.message}`;
      setResult(errorText);
      console.error('API test failed:', error);
    }
    
    setTesting(false);
  };

  return (
    <View style={styles.container}>
      <TouchableOpacity 
        style={[styles.button, testing && styles.buttonDisabled]} 
        onPress={testConnection}
        disabled={testing}
      >
        <Text style={styles.buttonText}>
          {testing ? 'Testing API...' : 'Test Backend Connection'}
        </Text>
      </TouchableOpacity>
      
      {result ? (
        <View style={styles.resultContainer}>
          <Text style={styles.result}>{result}</Text>
        </View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 20,
    alignItems: 'center',
  },
  button: {
    backgroundColor: '#4CAF50',
    padding: 15,
    borderRadius: 8,
    marginBottom: 15,
    minWidth: 200,
  },
  buttonDisabled: {
    backgroundColor: '#cccccc',
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  resultContainer: {
    backgroundColor: '#f5f5f5',
    padding: 15,
    borderRadius: 8,
    maxWidth: '100%',
  },
  result: {
    fontSize: 14,
    textAlign: 'center',
    lineHeight: 20,
  },
});
```

## Implementation Steps

1. **Add API client**: Create `services/api.ts` with the code above
2. **Update URL**: Replace `your-repl-name--your-username.replit.app` with your actual Repl URL
3. **Update AuthContext**: Add the backend sync code to your existing AuthContext
4. **Add test component**: Create `components/APITest.tsx`
5. **Test**: Add `<APITest />` to any screen and run the test

## Expected Success Result

When you tap "Test Backend Connection", you should see:
```
✅ Success! Found 13 food categories:
Laticínios, Cereais e derivados, Alimentos preparados...
```

This confirms your mobile app can communicate with the backend and access the Brazilian food database.

## Your Backend Status

Your backend is running perfectly and ready for mobile connections:
- CORS properly configured
- 13 Brazilian food categories loaded
- API endpoints responding correctly
- Authentication ready for Firebase tokens

Once the connection test passes, you can proceed with implementing food search, meal logging, and the full nutrition tracking features.