
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

export interface BackendUser {
  id?: number;
  uid: string;
  email: string;
  onboardingCompleted?: boolean;
  calories?: number;
  protein?: number;
  carbs?: number;
  fat?: number;
}

export interface SyncUserRequest {
  uid: string;
  email: string;
  displayName?: string | null;
  photoURL?: string | null;
}

class ForkFitAPI {
  // Updated with working backend URL
  private baseUrl = 'https://forkfit.app/api';

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
      // Add timeout and better error handling
      signal: AbortSignal.timeout(10000), // 10 second timeout
    };

    if (body && method !== 'GET') {
      config.body = JSON.stringify(body);
    }

    const fullUrl = `${this.baseUrl}${endpoint}`;
    console.log(`API ${method} ${fullUrl}`, body ? { body } : '');
    
    try {
      const response = await fetch(fullUrl, config);
      
      console.log(`Response status: ${response.status}`);
      console.log(`Response headers:`, Object.fromEntries(response.headers.entries()));
      
      if (!response.ok) {
        const errorText = await response.text().catch(() => '');
        console.error(`API Error ${response.status} - Raw response:`, errorText.substring(0, 200));
        
        let errorData;
        try {
          errorData = JSON.parse(errorText);
        } catch {
          errorData = { 
            message: errorText.includes('<!DOCTYPE') 
              ? `Endpoint returned HTML instead of JSON - check if ${endpoint} exists on backend`
              : errorText || `HTTP ${response.status}: ${response.statusText}` 
          };
        }
        throw new Error(errorData.message || `Backend error: ${response.status}`);
      }

      const responseText = await response.text();
      console.log(`Raw response:`, responseText.substring(0, 200));
      
      const result = JSON.parse(responseText);
      console.log(`API Response:`, result);
      return result;
    } catch (error: any) {
      if (error.name === 'AbortError') {
        console.error('API request timeout');
        throw new Error('Request timeout - backend may be unavailable');
      }
      console.error('API request failed:', error);
      throw new Error(error.message || 'Failed to connect to backend');
    }
  }

  // Test connection
  async testConnection(): Promise<string[]> {
    return this.request('/food-database/categories');
  }

  // User management
  async getOrCreateUser(uid: string, email: string, token: string): Promise<BackendUser> {
    return this.request(`/users/${uid}`, { 
      method: 'POST',
      body: { uid, email },
      token 
    });
  }

  async syncUser(userData: SyncUserRequest): Promise<BackendUser> {
    try {
      // Try the sync endpoint first
      return await this.request('/users/sync', {
        method: 'POST',
        body: userData
      });
    } catch (error: any) {
      // If sync endpoint doesn't exist, try the alternative endpoint
      if (error.message.includes('HTML instead of JSON') || error.message.includes('<!DOCTYPE')) {
        console.log('Sync endpoint not found, trying alternative user endpoint...');
        return await this.request(`/users/${userData.uid}`, {
          method: 'POST',
          body: userData
        });
      }
      throw error;
    }
  }

  // Test if sync endpoint exists
  async testSyncEndpoint(): Promise<boolean> {
    try {
      await this.request('/users/sync', { method: 'POST', body: { test: true } });
      return true;
    } catch (error: any) {
      return !error.message.includes('HTML instead of JSON');
    }
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
