
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

class ForkFitAPI {
  // Updated with correct backend URL based on your project
  private baseUrl = 'https://workspace--eduardocarval41.replit.app/api';

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
      
      if (!response.ok) {
        const errorText = await response.text().catch(() => '');
        let errorData;
        try {
          errorData = JSON.parse(errorText);
        } catch {
          errorData = { message: errorText || `HTTP ${response.status}: ${response.statusText}` };
        }
        console.error(`API Error ${response.status}:`, errorData);
        throw new Error(errorData.message || `Backend error: ${response.status}`);
      }

      const result = await response.json();
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
