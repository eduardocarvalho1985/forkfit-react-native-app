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
  private baseUrl = "https://forkfit.app/api";

  async request<T>(
    endpoint: string,
    options: {
      method?: "GET" | "POST" | "PUT" | "DELETE";
      body?: any;
      token?: string;
    } = {}
  ): Promise<T> {
    const { method = "GET", body, token } = options;

    // Create AbortController for timeout (React Native compatible)
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 10000); // 10 second timeout

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

    const fullUrl = `${this.baseUrl}${endpoint}`;
    console.log(`API ${method} ${fullUrl}`, body ? { body } : "");

    try {
      const response = await fetch(fullUrl, config);
      clearTimeout(timeoutId); // Clear timeout on successful response

      console.log(`Response status: ${response.status}`);
      console.log(
        `Response headers:`,
        Object.fromEntries(response.headers.entries())
      );

      if (!response.ok) {
        const errorText = await response.text().catch(() => "");
        console.error(
          `API Error ${response.status} - Raw response:`,
          errorText.substring(0, 200)
        );

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
      console.log(`Raw response:`, responseText.substring(0, 200));

      const result = JSON.parse(responseText);
      console.log(`API Response:`, result);
      return result;
    } catch (error: any) {
      clearTimeout(timeoutId); // Clear timeout on error
      if (error.name === "AbortError") {
        console.error("API request timeout");
        throw new Error("Request timeout - backend may be unavailable");
      }
      console.error("API request failed:", error);
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

  async syncUser(userData: SyncUserRequest): Promise<BackendUser> {
    try {
      // Try the sync endpoint first
      return await this.request("/users/sync", {
        method: "POST",
        body: userData,
      });
    } catch (error: any) {
      // If sync endpoint doesn't exist, try the alternative endpoint
      if (
        error.message.includes("HTML instead of JSON") ||
        error.message.includes("<!DOCTYPE")
      ) {
        console.log(
          "Sync endpoint not found, trying alternative user endpoint..."
        );
        return await this.request(`/users/${userData.uid}`, {
          method: "POST",
          body: userData,
        });
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
    });
  }
}

export const api = new ForkFitAPI();
