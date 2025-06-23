
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
  // Replace with your actual repl URL - Try multiple possible URLs
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
