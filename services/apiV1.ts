// ForkFit API v1 Service
// This service handles the new v1 backend with JWT authentication

export interface V1User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  profileComplete: boolean;
  createdAt: string;
  updatedAt: string;
  lastLoginAt?: string;
}

export interface V1UserProfile {
  id: string;
  userId: string;
  goal: 'lose_weight' | 'maintain' | 'gain_muscle';
  gender: 'male' | 'female' | 'other';
  birthDate: string;
  age: number;
  height: number;
  weight: number;
  targetWeight: number;
  activityLevel: 'sedentary' | 'light' | 'moderate' | 'very_active';
  emotionalGoal?: string;
  motivatingEvent?: 'wedding' | 'vacation' | 'reunion' | 'beach_season' | 'none';
  isEventDriven?: boolean;
  eventDate?: string;
  weeklyPacing?: number;
  notificationsEnabled: boolean;
  bmr: number;
  tdee: number;
  dailyCalories: number;
  dailyProtein: number;
  dailyCarbs: number;
  dailyFat: number;
  onboardingCompleted: boolean;
  onboardingCompletedAt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface V1OnboardingData {
  goal: 'lose_weight' | 'maintain' | 'gain_muscle';
  gender: 'male' | 'female' | 'other';
  birthDate: string;
  age: number;
  height: number;
  weight: number;
  targetWeight: number;
  activityLevel: 'sedentary' | 'light' | 'moderate' | 'very_active';
  emotionalGoal?: string;
  motivatingEvent?: 'wedding' | 'vacation' | 'reunion' | 'beach_season' | 'none';
  isEventDriven?: boolean;
  eventDate?: string;
  weeklyPacing?: number;
  notificationsEnabled?: boolean;
}

export interface V1AuthResponse {
  success: boolean;
  data: {
    user: V1User;
    profile: V1UserProfile;
    tokens: {
      accessToken: string;
      refreshToken: string;
      expiresIn: number;
    };
  };
  message: string;
}

export interface V1ProfileResponse {
  success: boolean;
  data: V1UserProfile;
}

export interface V1FitnessCalculation {
  bmr: number;
  tdee: number;
  dailyCalories: number;
  dailyProtein: number;
  dailyCarbs: number;
  dailyFat: number;
  calculations: {
    method: string;
    activityMultiplier: number;
    calorieDeficit: number;
    proteinRatio: number;
    fatRatio: number;
    carbsRatio: number;
  };
}

class ForkFitAPIV1 {
  private baseUrl = "http://localhost:5000/api/v1";
  private accessToken: string | null = null;
  private refreshToken: string | null = null;

  // Token management
  setTokens(accessToken: string, refreshToken: string) {
    this.accessToken = accessToken;
    this.refreshToken = refreshToken;
    console.log('V1 API: Tokens set successfully');
  }

  clearTokens() {
    this.accessToken = null;
    this.refreshToken = null;
    console.log('V1 API: Tokens cleared');
  }

  private async request<T>(
    endpoint: string,
    options: {
      method?: "GET" | "POST" | "PUT" | "DELETE";
      body?: any;
      requiresAuth?: boolean;
      timeout?: number;
    } = {}
  ): Promise<T> {
    const { method = "GET", body, requiresAuth = false, timeout = 10000 } = options;

    // Create AbortController for timeout
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeout);

    const headers: Record<string, string> = {
      "Content-Type": "application/json",
      "Accept": "application/json",
    };

    if (requiresAuth && this.accessToken) {
      headers.Authorization = `Bearer ${this.accessToken}`;
    }

    const config: RequestInit = {
      method,
      headers,
      signal: controller.signal,
    };

    if (body && method !== "GET") {
      config.body = JSON.stringify(body);
    }

    const fullUrl = `${this.baseUrl}${endpoint}`;
    console.log(`V1 API ${method} ${fullUrl}`, body ? { body } : "");

    try {
      const response = await fetch(fullUrl, config);
      clearTimeout(timeoutId);

      console.log(`V1 API Response status: ${response.status}`);

      if (!response.ok) {
        const errorText = await response.text().catch(() => "");
        console.error(`V1 API Error ${response.status}:`, errorText);

        let errorData;
        try {
          errorData = JSON.parse(errorText);
        } catch {
          errorData = { message: errorText || `HTTP ${response.status}` };
        }

        // Handle token refresh for 401 errors
        if (response.status === 401 && this.refreshToken && requiresAuth) {
          console.log('V1 API: Token expired, attempting refresh...');
          try {
            await this.refreshAccessToken();
            // Retry the original request with new token
            headers.Authorization = `Bearer ${this.accessToken}`;
            config.headers = headers;
            const retryResponse = await fetch(fullUrl, config);
            if (retryResponse.ok) {
              const result = await retryResponse.json();
              console.log('V1 API: Request retry successful after token refresh');
              return result;
            }
          } catch (refreshError) {
            console.error('V1 API: Token refresh failed:', refreshError);
            this.clearTokens();
            throw new Error('Authentication failed - please sign in again');
          }
        }

        throw new Error(errorData.message || `Backend error: ${response.status}`);
      }

      const result = await response.json();
      console.log('V1 API Response:', result);
      return result;
    } catch (error: any) {
      clearTimeout(timeoutId);
      if (error.name === "AbortError") {
        throw new Error("Request timeout - backend may be unavailable");
      }
      console.error("V1 API request failed:", error);
      throw error;
    }
  }

  private async refreshAccessToken(): Promise<void> {
    if (!this.refreshToken) {
      throw new Error('No refresh token available');
    }

    try {
      const response = await this.request<{ success: boolean; data: { accessToken: string; expiresIn: number } }>(
        '/auth/refresh',
        {
          method: 'POST',
          body: { refreshToken: this.refreshToken },
          requiresAuth: false
        }
      );

      if (response.success && response.data.accessToken) {
        this.accessToken = response.data.accessToken;
        console.log('V1 API: Access token refreshed successfully');
      } else {
        throw new Error('Failed to refresh access token');
      }
    } catch (error) {
      console.error('V1 API: Token refresh failed:', error);
      throw error;
    }
  }

  // Authentication endpoints
  async register(
    email: string,
    password: string,
    firstName: string,
    lastName: string,
    onboardingData: V1OnboardingData
  ): Promise<V1AuthResponse> {
    const response = await this.request<V1AuthResponse>('/auth/register', {
      method: 'POST',
      body: {
        email,
        password,
        firstName,
        lastName,
        onboardingData
      },
      requiresAuth: false
    });

    if (response.success && response.data.tokens) {
      this.setTokens(response.data.tokens.accessToken, response.data.tokens.refreshToken);
    }

    return response;
  }

  async login(email: string, password: string): Promise<V1AuthResponse> {
    const response = await this.request<V1AuthResponse>('/auth/login', {
      method: 'POST',
      body: { email, password },
      requiresAuth: false
    });

    if (response.success && response.data.tokens) {
      this.setTokens(response.data.tokens.accessToken, response.data.tokens.refreshToken);
    }

    return response;
  }

  async logout(): Promise<{ success: boolean; message: string }> {
    try {
      const response = await this.request<{ success: boolean; message: string }>('/auth/logout', {
        method: 'POST',
        requiresAuth: true
      });
      
      this.clearTokens();
      return response;
    } catch (error) {
      // Even if logout fails, clear local tokens
      this.clearTokens();
      throw error;
    }
  }

  // User profile endpoints
  async getUserProfile(): Promise<V1ProfileResponse> {
    return this.request<V1ProfileResponse>('/users/profile', {
      requiresAuth: true
    });
  }

  async updateUserProfile(updates: Partial<V1UserProfile>): Promise<V1ProfileResponse> {
    return this.request<V1ProfileResponse>('/users/profile', {
      method: 'PUT',
      body: updates,
      requiresAuth: true
    });
  }

  async completeOnboarding(onboardingData: V1OnboardingData): Promise<{ success: boolean; data: { profile: V1UserProfile }; message: string }> {
    return this.request('/users/onboarding/complete', {
      method: 'POST',
      body: { onboardingData },
      requiresAuth: true
    });
  }

  // Fitness engine endpoints
  async calculateFitnessMetrics(
    gender: string,
    age: number,
    height: number,
    weight: number,
    activityLevel: string,
    goal: string
  ): Promise<{ success: boolean; data: V1FitnessCalculation }> {
    return this.request('/fitness/calculate', {
      method: 'POST',
      body: {
        gender,
        age,
        height,
        weight,
        activityLevel,
        goal
      },
      requiresAuth: true
    });
  }

  async getMacroRecommendations(): Promise<{ success: boolean; data: any }> {
    return this.request('/fitness/macros', {
      requiresAuth: true
    });
  }

  // Onboarding flow endpoints
  async saveOnboardingStep(
    step: string,
    data: any,
    stepOrder: number
  ): Promise<{ success: boolean; data: any; message: string }> {
    return this.request('/onboarding/steps', {
      method: 'POST',
      body: {
        step,
        data,
        stepOrder,
        completedAt: new Date().toISOString()
      },
      requiresAuth: true
    });
  }

  async getOnboardingProgress(): Promise<{ success: boolean; data: any }> {
    return this.request('/onboarding/progress', {
      requiresAuth: true
    });
  }

  async resumeOnboarding(): Promise<{ success: boolean; data: any }> {
    return this.request('/onboarding/resume', {
      method: 'POST',
      requiresAuth: true
    });
  }

  // Data synchronization
  async syncData(
    onboardingData: Partial<V1OnboardingData>,
    lastSyncAt: string,
    deviceId: string
  ): Promise<{ success: boolean; data: any; message: string }> {
    return this.request('/sync', {
      method: 'POST',
      body: {
        onboardingData,
        lastSyncAt,
        deviceId
      },
      requiresAuth: true
    });
  }

  async getServerUpdates(lastSyncAt: string, deviceId: string): Promise<{ success: boolean; data: any }> {
    return this.request(`/sync/updates?lastSyncAt=${encodeURIComponent(lastSyncAt)}&deviceId=${encodeURIComponent(deviceId)}`, {
      requiresAuth: true
    });
  }

  // Analytics
  async trackOnboardingEvent(
    event: string,
    step: string,
    stepOrder: number,
    timeSpent: number,
    data: any,
    metadata: any
  ): Promise<{ success: boolean; message: string }> {
    return this.request('/analytics/onboarding', {
      method: 'POST',
      body: {
        event,
        step,
        stepOrder,
        timeSpent,
        data,
        metadata
      },
      requiresAuth: true
    });
  }

  // Test connection
  async testConnection(): Promise<boolean> {
    try {
      await this.request('/auth/register', {
        method: 'POST',
        body: { test: true },
        requiresAuth: false,
        timeout: 5000
      });
      return true;
    } catch (error: any) {
      // If we get a validation error, the endpoint exists
      return error.message.includes('validation') || error.message.includes('required');
    }
  }

  // Get current token status
  getTokenStatus(): { hasAccessToken: boolean; hasRefreshToken: boolean } {
    return {
      hasAccessToken: !!this.accessToken,
      hasRefreshToken: !!this.refreshToken
    };
  }
}

export const apiV1 = new ForkFitAPIV1();
