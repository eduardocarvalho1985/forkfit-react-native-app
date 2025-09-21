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

export interface SavedFood {
  id?: number;
  uid: string;
  name: string;
  quantity: number;
  unit: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
}

// New interfaces for progress tracking
export interface WeightEntry {
  id: string;
  weight: number;
  date: string;
  createdAt: string;
  userId: string;
}

export interface CalorieData {
  date: string;
  goal: number;
  consumed: number;
  protein?: number;
  carbs?: number;
  fat?: number;
  metGoal?: boolean;
}

export interface ProgressSummary {
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
  dayStreak: number;
  weeklyStreakData: boolean[];
}

export interface BackendUser {
  id?: number;
  uid: string;
  email?: string;
  name?: string;
  onboardingCompleted?: boolean;
  age?: number;
  birthDate?: string; // ISO date string
  gender?: 'male' | 'female' | 'other';
  height?: number;
  weight?: number;
  targetWeight?: number;
  activityLevel?: string;
  goal?: 'lose_weight' | 'maintain' | 'gain_muscle';
  calories?: number;
  protein?: number;
  carbs?: number;
  fat?: number;
  notificationsEnabled?: boolean;
  pushToken?: string;
  createdAt?: Date;
}

export interface SyncUserRequest {
  uid: string;
  email?: string;
  name?: string;
  displayName?: string | null;
  photoURL?: string | null;
}

// New interface for onboarding completion
export interface OnboardingCompleteRequest {
  uid: string;
  email: string;
  firstName: string;
  lastName: string;
  profile: {
    gender: 'male' | 'female' | 'other';
    age: number;
    height: number;
    weight: number;
    targetWeight: number;
    goal: 'lose_weight' | 'maintain' | 'gain_muscle';
    motivation: string;
    weeklyPacing: number;
    activityLevel: string;
    motivatingEvent: string;
    isEventDriven: boolean;
    eventDate?: string;
    notificationsEnabled: boolean;
  };
  calculatedPlan: {
    calories: number;
    protein: number;
    carbs: number;
    fat: number;
    bmr: number;
    tdee: number;
  };
}

export class ForkFitAPI {
  // ✅ UPDATED: Dynamic API URL from environment configuration
  private getBaseUrl(): string {
    try {
      // Import Constants dynamically to avoid build-time issues
      const Constants = require('expo-constants').default;
      let apiUrl = Constants.expoConfig?.extra?.API_URL;
      
      if (apiUrl) {
        console.log(`🌐 Using dynamic API URL: ${apiUrl}`);
        return apiUrl;
      }
      
      // Fallback to hardcoded URL if dynamic URL is not available
      console.warn('⚠️ Dynamic API URL not found, using fallback');
      return "https://api.forkfit.app/api";
    } catch (error) {
      console.warn('⚠️ Failed to get dynamic API URL, using fallback:', error);
      return "https://api.forkfit.app/api";
    }
  }

  async request<T>(
    endpoint: string,
    options: {
      method?: "GET" | "POST" | "PUT" | "DELETE";
      body?: any;
      token?: string;
      timeout?: number;
    } = {}
  ): Promise<T> {
    const { method = "GET", body, token, timeout = 10000 } = options;

    // Create AbortController for timeout (React Native compatible)
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeout); // Configurable timeout

    const config: RequestInit = {
      method,
      headers: {
        "Content-Type": "application/json",
        ...(token && { Authorization: `Bearer ${token}` }),
      },
      signal: controller.signal,
    };

    if (body && method !== "GET") {
      config.body = JSON.stringify(body);
    }

    const fullUrl = `${this.getBaseUrl()}${endpoint}`;
    console.log(`🌐 API ${method} ${fullUrl}`);
    console.log(`📤 Request body:`, body ? JSON.stringify(body, null, 2) : 'No body');
    console.log(`🔑 Has token:`, !!token);

    try {
      const response = await fetch(fullUrl, config);
      clearTimeout(timeoutId); // Clear timeout on successful response

      console.log(`📥 Response status: ${response.status}`);
      console.log(`📋 Response headers:`, Object.fromEntries(response.headers.entries()));

      if (!response.ok) {
        const errorText = await response.text().catch(() => "");
        console.error(`❌ API Error ${response.status} - Raw response:`, errorText.substring(0, 200));

        let errorData;
        try {
          errorData = JSON.parse(errorText);
        } catch {
          errorData = {
            message: errorText.includes("<!DOCTYPE")
              ? `Endpoint returned HTML instead of JSON - check if ${endpoint} exists on backend`
              : errorText || `HTTP ${response.status}: ${response.statusText}`,
          };
        }
        throw new Error(
          errorData.message || `Backend error: ${response.status}`
        );
      }

      const responseText = await response.text();
      console.log(`📄 Raw response:`, responseText.substring(0, 200));

      const result = JSON.parse(responseText);
      console.log(`✅ API Response:`, result);
      return result;
    } catch (error: any) {
      clearTimeout(timeoutId); // Clear timeout on error
      if (error.name === "AbortError") {
        console.error("⏰ API request timeout");
        throw new Error("Request timeout - backend may be unavailable");
      }
      console.error("💥 API request failed:", error);
      throw new Error(error.message || "Failed to connect to backend");
    }
  }

  // Test connection
  async testConnection(): Promise<string[]> {
    return this.request("/food-database/categories");
  }

  // User management
  async getOrCreateUser(
    uid: string,
    email: string,
    token: string
  ): Promise<BackendUser> {
    return this.request(`/users/${uid}`, {
      method: "POST",
      body: { uid, email },
      token,
    });
  }

  async getUserProfile(uid: string, token: string): Promise<BackendUser> {
    try {
      console.log('🌐 API: Calling GET /api/users/{uid} with:', { uid, hasToken: !!token });
      
      const response: BackendUser = await this.request(`/users/${uid}`, { token });
      
      console.log('✅ API: GET /api/users/{uid} successful:', response);
      return response;
      
    } catch (error: any) {
      console.error('❌ API: GET /api/users/{uid} failed:', error);
      throw error;
    }
  }

  async updateUserProfile(uid: string, userData: Partial<BackendUser>, token: string): Promise<BackendUser> {
    try {
      console.log('🌐 API: Calling PUT /api/users/{uid} with:', { uid, userData: Object.keys(userData), hasToken: !!token });
      console.log('📊 Update data keys:', Object.keys(userData));
      
      const response: BackendUser = await this.request(`/users/${uid}`, {
        method: "PUT",
        body: userData,
        token,
      });
      
      console.log('✅ API: PUT /api/users/{uid} successful:', response);
      return response;
      
    } catch (error: any) {
      console.error('❌ API: PUT /api/users/{uid} failed:', error);
      throw error;
    }
  }

  async updateOnboardingStatus(uid: string, onboardingCompleted: boolean, token: string): Promise<BackendUser> {
    return this.request(`/users/${uid}/onboarding`, {
      method: "PUT",
      body: { onboardingCompleted },
      token,
    });
  }

  async savePushToken(uid: string, pushToken: string, token: string): Promise<BackendUser> {
    return this.request(`/users/${uid}/push-token`, {
      method: "PUT",
      body: { pushToken },
      token,
    });
  }

  async syncUser(userData: SyncUserRequest): Promise<BackendUser> {
    try {
      console.log('🌐 API: Calling /api/users/sync with:', userData);
      console.log('📊 User data keys:', Object.keys(userData));
      
      // Try the sync endpoint first
      const response: BackendUser = await this.request("/users/sync", {
        method: "POST",
        body: userData,
      });
      
      console.log('✅ API: /api/users/sync successful:', response);
      return response;
      
    } catch (error: any) {
      console.error('❌ API: /api/users/sync failed:', error);
      
      // If sync endpoint doesn't exist, try the alternative endpoint
      if (
        error.message.includes("HTML instead of JSON") ||
        error.message.includes("<!DOCTYPE")
      ) {
        console.log('🔄 Sync endpoint not found, trying alternative user endpoint...');
        const altResponse: BackendUser = await this.request(`/users/${userData.uid}`, {
          method: "POST",
          body: userData,
        });
        console.log('✅ API: Alternative endpoint successful:', altResponse);
        return altResponse;
      }
      throw error;
    }
  }

  // Test if sync endpoint exists
  async testSyncEndpoint(): Promise<boolean> {
    try {
      await this.request("/users/sync", {
        method: "POST",
        body: { test: true },
      });
      return true;
    } catch (error: any) {
      return !error.message.includes("HTML instead of JSON");
    }
  }

  // Food database
  async searchFoods(query: string): Promise<FoodItem[]> {
    return this.request(`/food-database/search?q=${encodeURIComponent(query)}`);
  }

  async getFoodCategories(): Promise<string[]> {
    return this.request("/food-database/categories");
  }

  // Food logging
  async getFoodLogs(
    uid: string,
    date: string,
    token: string
  ): Promise<FoodLog[]> {
    return this.request(`/users/${uid}/food-logs/${date}`, { token });
  }

  async createFoodLog(
    uid: string,
    foodLog: FoodLog,
    token: string
  ): Promise<FoodLog> {
    return this.request(`/users/${uid}/food-logs`, {
      method: "POST",
      body: foodLog,
      token,
    });
  }

  async updateFoodLog(
    uid: string,
    foodLog: FoodLog,
    token: string
  ): Promise<FoodLog> {
    return this.request(`/users/${uid}/food-logs/${foodLog.id}`, {
      method: "PUT",
      body: foodLog,
      token,
    });
  }

  async deleteFoodLog(
    uid: string,
    foodLogId: number,
    token: string
  ): Promise<void> {
    return this.request(`/users/${uid}/food-logs/${foodLogId}`, {
      method: "DELETE",
      token,
    });
  }

  // Saved foods
  async getSavedFoods(uid: string, token: string): Promise<SavedFood[]> {
    return this.request(`/users/${uid}/saved-foods`, { token });
  }

  async saveFood(uid: string, savedFood: Omit<SavedFood, 'uid'>, token: string): Promise<SavedFood> {
    return this.request(`/users/${uid}/saved-foods`, {
      method: "POST",
      body: savedFood,
      token,
    });
  }

  async updateSavedFood(uid: string, savedFoodId: number, savedFood: Partial<SavedFood>, token: string): Promise<SavedFood> {
    return this.request(`/users/${uid}/saved-foods/${savedFoodId}`, {
      method: "PUT",
      body: savedFood,
      token,
    });
  }

  async deleteSavedFood(uid: string, savedFoodId: number, token: string): Promise<void> {
    return this.request(`/users/${uid}/saved-foods/${savedFoodId}`, {
      method: "DELETE",
      token,
    });
  }

  // AI Food Analysis
  async analyzeFoodImage(
    uid: string, 
    imageData: string, 
    mealType: string, 
    date: string, 
    token: string
  ): Promise<{
    food: string;
    calories: number;
    protein: number;
    carbs: number;
    fat: number;
    quantity: number;
    unit: string;
    mealType: string;
    date: string;
  }> {
    return this.request(`/users/${uid}/food-image`, {
      method: "POST",
      body: {
        image: imageData,
        mealType,
        date,
      },
      token,
      timeout: 30000, // 30 seconds timeout for AI analysis
    });
  }

  async analyzeFoodDescription(
    uid: string,
    description: string,
    mealType: string,
    date: string,
    token: string
  ): Promise<{
    food: string;
    calories: number;
    protein: number;
    carbs: number;
    fat: number;
    quantity: number;
    unit: string;
    mealType: string;
    date: string;
  }> {
    return this.request(`/users/${uid}/food-description`, {
      method: "POST",
      body: {
        description,
        mealType,
        date,
      },
      token,
      timeout: 30000, // 30 seconds timeout for AI analysis
    });
  }

  // Weight Tracking
  async getWeightHistory(uid: string, token: string): Promise<WeightEntry[]> {
    return this.request(`/users/${uid}/weight-logs`, { token });
  }

  async addWeightEntry(uid: string, weight: number, date: string, token: string): Promise<WeightEntry> {
    return this.request(`/users/${uid}/weight-logs`, {
      method: "POST",
      body: { weight, date },
      token,
    });
  }

  async deleteWeightEntry(uid: string, weightId: string, token: string): Promise<void> {
    return this.request(`/users/${uid}/weight-logs/${weightId}`, {
      method: "DELETE",
      token,
    });
  }

  // Progress Analytics
  async getCalorieProgress(
    uid: string, 
    period: string, 
    startDate: string, 
    endDate: string,
    token: string
  ): Promise<CalorieData[]> {
    return this.request(`/users/${uid}/progress/calories?period=${period}&startDate=${startDate}&endDate=${endDate}`, { token });
  }

  async getProgressSummary(
    uid: string, 
    period: string, 
    startDate: string, 
    endDate: string,
    token: string
  ): Promise<ProgressSummary> {
    return this.request(`/users/${uid}/progress/summary?period=${period}&startDate=${startDate}&endDate=${endDate}`, { token });
  }

  // Food Database Methods
  async getFoodsByCategory(category: string): Promise<FoodItem[]> {
    return this.request(`/food-database/category/${encodeURIComponent(category)}`);
  }

  async getAllFoods(): Promise<FoodItem[]> {
    return this.request("/food-database/foods");
  }

  // User Account Deletion
  async deleteUserAccount(uid: string): Promise<DeletionResponse> {
    return this.request(`/users/${uid}`, {
      method: "DELETE",
    });
  }

  // Onboarding completion - NEW ENDPOINT
  async completeOnboarding(onboardingData: OnboardingCompleteRequest): Promise<any> {
    return this.request('/onboarding/complete', {
      method: 'POST',
      body: onboardingData,
    });
  }
}

// Add the DeletionResponse interface at the top with other interfaces
export interface DeletionResponse {
  message: string;
  uid: string;
  deletedAt: string;
}

export const api = new ForkFitAPI();
